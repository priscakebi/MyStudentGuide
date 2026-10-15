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

@Component({

  // Sélecteur permettant d'utiliser le footer :
  // <app-footer></app-footer>
  selector: 'app-footer',

  standalone: true,

  imports: [RouterLink],

  templateUrl: './footer.html',

  styleUrl: './footer.scss'
})
export class Footer {

  private authService = inject(AuthService);

  // Année affichée dans le copyright, mise à jour automatiquement.
  readonly year = new Date().getFullYear();

  // Sites officiels de référence pour les démarches des étudiants.
  readonly officialSites = [
    { label: 'Service-Public.fr', url: 'https://www.service-public.fr' },
    { label: 'ANEF – titres de séjour', url: 'https://administration-etrangers-en-france.interieur.gouv.fr' },
    { label: 'Campus France', url: 'https://www.campusfrance.org/fr' },
    { label: 'etudiant.gouv.fr', url: 'https://www.etudiant.gouv.fr' }
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
