import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';

/**
 * Page de connexion réservée aux administrateurs.
 *
 * URL : /admin-login
 *
 * Fonctionnement :
 * 1. l'administrateur saisit son e-mail et son mot de passe ;
 * 2. la requête part vers POST /api/auth/login (même endpoint que l'espace étudiant) ;
 * 3. si le compte n'a PAS le rôle ADMIN, la session est immédiatement supprimée
 *    et un message explicite est affiché : un étudiant ne reste jamais connecté ici ;
 * 4. si le compte est ADMIN, redirection vers la page demandée (returnUrl) ou /admin.
 *
 * Double authentification : si elle est activée, l'API ne renvoie pas encore
 * de session mais un « défi » ; la page demande alors le code à 6 chiffres
 * de l'application d'authentification (ou un code de secours).
 *
 * Cette vérification du rôle améliore l'expérience, mais la vraie sécurité
 * reste côté backend : toutes les routes /api/admin... sont protégées par
 * @PreAuthorize("hasRole('ADMIN')").
 */
@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.scss'
})
export class AdminLogin {

  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  password = '';

  errorMessage = '';
  infoMessage = '';

  passwordVisible = false;
  loading = false;

  /** Double authentification : défi reçu après le mot de passe (null = première étape). */
  defi: string | null = null;
  code = '';
  private readonly champCode = viewChild<ElementRef<HTMLInputElement>>('champCode');

  constructor() {
    // Message affiché quand l'interceptor a déconnecté l'admin (token expiré).
    if (this.route.snapshot.queryParamMap.get('reason') === 'idle') {
      this.infoMessage = 'Vous avez été déconnecté après une période d\'inactivité. Veuillez vous reconnecter.';
    } else if (this.route.snapshot.queryParamMap.get('sessionExpired')) {
      this.infoMessage = 'Votre session a expiré. Veuillez vous reconnecter.';
    }

    // Un administrateur déjà connecté n'a rien à faire ici.
    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin']);
    }
  }

  togglePassword(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  onLogin(): void {

    this.errorMessage = '';
    this.infoMessage = '';

    const email = this.email.trim();

    if (!email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    this.loading = true;

    this.authService.login({ email, password: this.password }).subscribe({

      next: (response) => {
        this.loading = false;
        this.password = '';

        // Double authentification : le code de l'application est demandé.
        if (response.deuxFacteurs && response.defi) {
          this.defi = response.defi;
          setTimeout(() => this.champCode()?.nativeElement.focus());
          return;
        }

        this.terminerConnexion();
      },

      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.password = '';

        if (error.status === 0) {
          this.errorMessage =
            'Impossible de joindre le serveur. Réessayez plus tard.';
        } else if (error.status === 429) {
          // Trop de tentatives : le compte est bloqué quelques minutes.
          this.errorMessage = error.error?.message
            || 'Trop de tentatives de connexion. Réessayez dans quelques minutes.';
        } else {
          // Message volontairement générique : on ne révèle pas
          // si c'est l'e-mail ou le mot de passe qui est faux.
          this.errorMessage = 'Adresse e-mail ou mot de passe incorrect.';
        }
      }
    });
  }

  /** Seconde étape : code de l'application d'authentification ou code de secours. */
  onCode(): void {

    this.errorMessage = '';
    const code = this.code.trim();

    if (!this.defi) {
      return;
    }
    if (!code) {
      this.errorMessage = 'Saisissez le code affiché par votre application.';
      return;
    }

    this.loading = true;

    this.authService.loginDeuxFacteurs(this.defi, code).subscribe({

      next: () => {
        this.loading = false;
        this.terminerConnexion();
      },

      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.code = '';
        const message: string | undefined = error.error?.message;

        if (error.status === 0) {
          this.errorMessage = 'Impossible de joindre le serveur. Réessayez plus tard.';
        } else if (error.status === 429) {
          // Trop de codes faux : retour à la première étape.
          this.recommencer();
          this.errorMessage = message
            || 'Trop de tentatives de connexion. Réessayez dans quelques minutes.';
        } else if (message?.includes('expiré')) {
          this.recommencer();
          this.errorMessage = message;
        } else {
          this.errorMessage = 'Code incorrect. Saisissez le code actuellement affiché par votre application.';
          setTimeout(() => this.champCode()?.nativeElement.focus());
        }
      }
    });
  }

  /** Retour à la saisie de l'e-mail et du mot de passe. */
  recommencer(): void {
    this.defi = null;
    this.code = '';
    this.errorMessage = '';
  }

  /** Session ouverte : vérifie le rôle puis redirige. */
  private terminerConnexion(): void {
    // Compte valide mais pas administrateur : on supprime la session.
    if (!this.authService.isAdmin()) {
      this.authService.logout();
      this.recommencer();
      this.errorMessage =
        "Ce compte n'a pas les droits administrateur. " +
        "Utilisez la connexion étudiant.";
      return;
    }

    this.router.navigateByUrl(this.getSafeReturnUrl());
  }

  /**
   * Page demandée avant la redirection vers /admin-login.
   * Seules les URLs internes de l'espace admin sont acceptées
   * (évite une redirection vers un site externe).
   */
  private getSafeReturnUrl(): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    return returnUrl && returnUrl.startsWith('/admin') && !returnUrl.startsWith('//')
      ? returnUrl
      : '/admin';
  }
}
