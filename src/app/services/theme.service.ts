import { Injectable, computed, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const CLE = 'theme';

/**
 * Mode clair / sombre.
 *
 * - Sans choix du visiteur : suit le réglage de l'appareil (et ses changements).
 * - Avec le bouton soleil / lune : le choix est mémorisé dans ce navigateur.
 *
 * Le thème est porté par l'attribut data-theme="dark" de <html> ; un petit script
 * de src/index.html l'applique déjà avant le démarrage d'Angular (pas d'éclair blanc).
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {

  private readonly media = typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;

  /** Choix enregistré (null : suit l'appareil). */
  private readonly choix = signal<Theme | null>(this.lire());
  private readonly systeme = signal<Theme>(this.media?.matches ? 'dark' : 'light');

  readonly theme = computed<Theme>(() => this.choix() ?? this.systeme());

  constructor() {
    this.media?.addEventListener?.('change', (e) => {
      this.systeme.set(e.matches ? 'dark' : 'light');
      this.appliquer();
    });
    this.appliquer();
  }

  basculer(): void {
    const suivant: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.choix.set(suivant);
    try {
      localStorage.setItem(CLE, suivant);
    } catch {
      // Stockage indisponible : choix valable pour cette visite.
    }
    this.appliquer();
  }

  private appliquer(): void {
    const racine = document.documentElement;
    if (this.theme() === 'dark') {
      racine.setAttribute('data-theme', 'dark');
    } else {
      racine.removeAttribute('data-theme');
    }
    // Couleur de la barre du navigateur sur mobile.
    document.querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', this.theme() === 'dark' ? '#101419' : '#1646a0');
  }

  private lire(): Theme | null {
    try {
      const valeur = localStorage.getItem(CLE);
      return valeur === 'dark' || valeur === 'light' ? valeur : null;
    } catch {
      return null;
    }
  }
}
