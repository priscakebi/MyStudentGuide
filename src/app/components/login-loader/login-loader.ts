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

/** Durée de l'écran de chargement, en millisecondes. */
export const LOGIN_LOADER_DURATION = 2800;

interface LoaderIcon {
  icon: string;
  label: string;
}

@Component({
  selector: 'app-login-loader',
  standalone: true,
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
    { icon: '🛂', label: 'Titre de séjour' },
    { icon: '🩺', label: 'Santé' },
    { icon: '🏠', label: 'Logement' },
    { icon: '💶', label: 'Banque' },
    { icon: '📄', label: 'Documents' },
    { icon: '🏛️', label: 'Préfecture' },
    { icon: '💼', label: 'Job étudiant' }
  ];

  /** Seconde bande : vie étudiante et France. */
  readonly vieEtudiante: LoaderIcon[] = [
    { icon: '🎓', label: 'Études' },
    // (le drapeau 🇫🇷 s'affiche « FR » sous Windows : on utilise la baguette)
    { icon: '🥖', label: 'France' },
    { icon: '📚', label: 'Bibliothèque' },
    { icon: '🗼', label: 'Paris' },
    { icon: '🚆', label: 'Transports' },
    { icon: '🥐', label: 'Vie en France' },
    { icon: '🎒', label: 'Campus' }
  ];

  /**
   * Listes répétées deux fois : l'animation fait défiler la moitié
   * de la bande, ce qui donne une boucle continue.
   */
  readonly bandeDemarches = [...this.demarches, ...this.demarches];
  readonly bandeVieEtudiante = [...this.vieEtudiante, ...this.vieEtudiante];
}
