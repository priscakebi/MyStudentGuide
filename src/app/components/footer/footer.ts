// ============================================================
// FOOTER - MyStudentGuide
// ============================================================
//
// Pied de page des pages publiques (PublicLayout) :
// présentation, navigation, sites officiels et copyright.
// ============================================================

import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TPipe } from '../../i18n/t.pipe';
import { Cle } from '../../i18n/textes';

@Component({

  // Sélecteur permettant d'utiliser le footer :
  // <app-footer></app-footer>
  selector: 'app-footer',

  standalone: true,

  imports: [RouterLink, TPipe],

  templateUrl: './footer.html',

  styleUrl: './footer.scss'
})
export class Footer {

  private authService = inject(AuthService);

  // Année affichée dans le copyright, mise à jour automatiquement.
  readonly year = new Date().getFullYear();

  // Sites officiels de référence pour les démarches des étudiants.
  readonly officialSites: { label: Cle; url: string }[] = [
    { label: 'footer.site.servicePublic', url: 'https://www.service-public.fr' },
    { label: 'footer.site.anef', url: 'https://administration-etrangers-en-france.interieur.gouv.fr' },
    { label: 'footer.site.campusFrance', url: 'https://www.campusfrance.org/fr' },
    { label: 'footer.site.etudiant', url: 'https://www.etudiant.gouv.fr' }
  ];

  // Relus à chaque affichage : le footer reste à l'écran lors d'une déconnexion.
  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  scrollToTop(): void {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }
}
