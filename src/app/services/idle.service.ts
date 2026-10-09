import { Injectable, NgZone, inject } from '@angular/core';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

/**
 * Déconnexion automatique après une période d'inactivité.
 *
 * - « Activité » = mouvement de souris, clic, clavier, défilement, toucher.
 * - Après `idleTimeoutMinutes` sans activité : déconnexion + retour sur la page de connexion.
 * - `idleWarningSeconds` avant : une fenêtre d'avertissement (« Rester connecté ? ») est affichée.
 * - Tant que l'utilisateur est actif, le JWT est renouvelé toutes les `tokenRefreshMinutes`
 *   (le JWT a une durée de vie courte côté API : l'inactivité est donc aussi appliquée par le serveur).
 * - La dernière activité est partagée entre onglets via localStorage.
 *
 * Aucune activité n'est suivie pour un visiteur non connecté.
 */
@Injectable({ providedIn: 'root' })
export class IdleService {

  private authService = inject(AuthService);
  private router = inject(Router);
  private zone = inject(NgZone);

  private static readonly STORAGE_KEY = 'lastActivity';
  private static readonly EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

  private readonly timeoutMs = environment.idleTimeoutMinutes * 60_000;
  private readonly warningMs = environment.idleWarningSeconds * 1000;
  private readonly refreshMs = environment.tokenRefreshMinutes * 60_000;

  private started = false;
  private timer: ReturnType<typeof setInterval> | null = null;
  private lastRefresh = Date.now();
  private lastWrite = 0;

  /** Vrai pendant la fenêtre d'avertissement (lu par le composant racine). */
  warningVisible = false;
  /** Secondes restantes avant la déconnexion (pendant l'avertissement). */
  secondsLeft = 0;

  /** À appeler une fois au démarrage de l'application. */
  start(): void {
    if (this.started || typeof window === 'undefined') {
      return;
    }
    this.started = true;

    this.zone.runOutsideAngular(() => {
      const onActivity = () => this.onActivity();
      IdleService.EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
      this.timer = setInterval(() => this.tick(), 1000);
    });
  }

  /** « Rester connecté » : compte comme une activité. */
  stayConnected(): void {
    this.markActivity(true);
    this.zone.run(() => (this.warningVisible = false));
  }

  /** Déconnexion volontaire depuis la fenêtre d'avertissement. */
  logoutNow(): void {
    this.expire(false);
  }

  // ------------------------------------------------------------------

  private lastActivity(): number {
    try {
      return Number(localStorage.getItem(IdleService.STORAGE_KEY)) || Date.now();
    } catch {
      return Date.now();
    }
  }

  private onActivity(): void {
    // Pendant l'avertissement, seule une action explicite (bouton) prolonge la session.
    if (this.warningVisible || !this.authService.isLoggedIn()) {
      return;
    }
    this.markActivity(false);
  }

  private markActivity(force: boolean): void {
    const now = Date.now();

    // Limite les écritures dans localStorage (mousemove très fréquent).
    if (force || now - this.lastWrite > 1000) {
      this.lastWrite = now;
      try {
        localStorage.setItem(IdleService.STORAGE_KEY, String(now));
      } catch { /* stockage indisponible : on ignore */ }
    }

    if (now - this.lastRefresh >= this.refreshMs && this.authService.isLoggedIn()) {
      this.lastRefresh = now;
      this.authService.refreshToken().subscribe({ error: () => { /* l'intercepteur gère le 401 */ } });
    }
  }

  private tick(): void {
    if (!this.authService.isLoggedIn()) {
      if (this.warningVisible) {
        this.zone.run(() => (this.warningVisible = false));
      }
      return;
    }

    const idleFor = Date.now() - this.lastActivity();

    if (idleFor >= this.timeoutMs) {
      this.expire(true);
      return;
    }

    const remaining = this.timeoutMs - idleFor;
    if (remaining <= this.warningMs) {
      const seconds = Math.ceil(remaining / 1000);
      this.zone.run(() => {
        this.warningVisible = true;
        this.secondsLeft = seconds;
      });
    } else if (this.warningVisible) {
      // Activité détectée dans un autre onglet.
      this.zone.run(() => (this.warningVisible = false));
    }
  }

  private expire(idle: boolean): void {
    this.zone.run(() => {
      const wasAdminArea = this.router.url.startsWith('/admin');
      this.warningVisible = false;
      this.authService.logout();
      try {
        localStorage.removeItem(IdleService.STORAGE_KEY);
        localStorage.removeItem('prenom');
        localStorage.removeItem('userName');
      } catch { /* ignore */ }

      this.router.navigate([wasAdminArea ? '/admin-login' : '/login'], {
        queryParams: idle ? { reason: 'idle' } : {}
      });
    });
  }
}
