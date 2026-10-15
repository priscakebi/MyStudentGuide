// ============================================================
// ÉCRAN DE CHARGEMENT APRÈS CONNEXION
// ============================================================
//
// Affiché quelques secondes quand un étudiant se connecte (ou vient
// de créer son compte), avant d'entrer dans l'application.
//
// Deux bandes d'icônes (démarches, vie étudiante, France) défilent
// en sens inverse, et une barre de progression se remplit pendant
// LOGIN_LOADER_DURATION.
//
// Utilisation :
//   @if (showLoader) { <app-login-loader [prenom]="prenom" /> }
//   puis setTimeout(..., LOGIN_LOADER_DURATION) avant de naviguer.
// ============================================================

import { Component, Input } from '@angular/core';
import { TPipe } from '../../i18n/t.pipe';
import { Cle } from '../../i18n/textes';

/** Durée de l'écran de chargement, en millisecondes. */
export const LOGIN_LOADER_DURATION = 2800;

interface LoaderIcon {
  icon: string;
  label: Cle;
}

@Component({
  selector: 'app-login-loader',
  standalone: true,
  imports: [TPipe],
  templateUrl: './login-loader.html',
  styleUrl: './login-loader.scss'
})
export class LoginLoader {

  /** Prénom affiché dans le message d'accueil (facultatif). */
  @Input() prenom = '';

  /** Durée transmise au CSS (barre de progression). */
  readonly duration = LOGIN_LOADER_DURATION;

  /** Première bande : les démarches. */
  readonly demarches: LoaderIcon[] = [
    { icon: '🛂', label: 'loader.sejour' },
    { icon: '🩺', label: 'loader.sante' },
    { icon: '🏠', label: 'loader.logement' },
    { icon: '💶', label: 'loader.banque' },
    { icon: '📄', label: 'loader.documents' },
    { icon: '🏛️', label: 'loader.prefecture' },
    { icon: '💼', label: 'loader.job' }
  ];

  /** Seconde bande : vie étudiante et France. */
  readonly vieEtudiante: LoaderIcon[] = [
    { icon: '🎓', label: 'loader.etudes' },
    // (le drapeau 🇫🇷 s'affiche « FR » sous Windows : on utilise la baguette)
    { icon: '🥖', label: 'loader.france' },
    { icon: '📚', label: 'loader.bibliotheque' },
    { icon: '🗼', label: 'loader.paris' },
    { icon: '🚆', label: 'loader.transports' },
    { icon: '🥐', label: 'loader.vie' },
    { icon: '🎒', label: 'loader.campus' }
  ];

  /**
   * Listes répétées deux fois : l'animation fait défiler la moitié
   * de la bande, ce qui donne une boucle continue.
   */
  readonly bandeDemarches = [...this.demarches, ...this.demarches];
  readonly bandeVieEtudiante = [...this.vieEtudiante, ...this.vieEtudiante];
}
