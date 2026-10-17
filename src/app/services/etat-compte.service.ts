import { Injectable, signal } from '@angular/core';

/**
 * État du compte connecté partagé entre l'espace étudiant (bandeau
 * « Confirmez votre adresse e-mail ») et la page « Mon compte »
 * (changement d'adresse).
 */
@Injectable({ providedIn: 'root' })
export class EtatCompteService {

  /** Adresse e-mail du compte. */
  readonly email = signal('');

  /** Faux tant que le lien de confirmation n'a pas été ouvert (vrai par défaut). */
  readonly emailVerifie = signal(true);

  /** Mise à jour depuis la réponse de GET / PUT /api/users/me. */
  mettreAJour(utilisateur: { email?: string; emailVerified?: boolean }): void {
    if (utilisateur.email) {
      this.email.set(utilisateur.email);
    }
    this.emailVerifie.set(utilisateur.emailVerified !== false);
  }
}
