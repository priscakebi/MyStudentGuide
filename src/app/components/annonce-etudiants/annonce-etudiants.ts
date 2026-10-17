// ============================================================
// ANNONCE À TOUS LES ÉTUDIANTS (ADMIN)
// ============================================================
//
// Formulaire repliable de la page Notifications de l'admin :
// titre + message, envoyés en notification à chaque étudiant,
// et par e-mail si la case est cochée (adresses confirmées seulement).
// L'envoi demande une confirmation : il ne peut pas être annulé.
// ============================================================

import { Component, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { environment } from '../../../environments/environment';
import { Icone } from '../icone/icone';

export const TITRE_MAX = 120;
export const MESSAGE_MAX = 2000;

@Component({
  selector: 'app-annonce-etudiants',
  standalone: true,
  imports: [FormsModule, Icone],
  templateUrl: './annonce-etudiants.html',
  styleUrl: './annonce-etudiants.scss'
})
export class AnnonceEtudiants {

  private readonly http = inject(HttpClient);

  protected readonly titreMax = TITRE_MAX;
  protected readonly messageMax = MESSAGE_MAX;

  protected readonly ouvert = signal(false);
  protected readonly confirmation = signal(false);
  protected readonly envoi = signal(false);
  protected readonly erreur = signal('');
  protected readonly succes = signal('');

  protected titre = '';
  protected message = '';
  protected parEmail = false;

  protected basculer(): void {
    this.ouvert.update((o) => !o);
    this.confirmation.set(false);
    this.erreur.set('');
  }

  /** Première étape : vérifie le formulaire et demande confirmation. */
  protected preparer(): void {
    this.erreur.set('');
    this.succes.set('');
    if (!this.titre.trim() || !this.message.trim()) {
      this.erreur.set('Le titre et le message sont obligatoires.');
      return;
    }
    this.confirmation.set(true);
  }

  protected envoyer(): void {
    this.envoi.set(true);
    this.http.post<{ notifications: number; emails: number }>(
      `${environment.apiUrl}/admin/annonces`,
      { titre: this.titre.trim(), message: this.message.trim(), email: this.parEmail }
    ).subscribe({
      next: ({ notifications, emails }) => {
        this.envoi.set(false);
        this.confirmation.set(false);
        this.ouvert.set(false);
        this.titre = '';
        this.message = '';
        this.parEmail = false;
        this.succes.set(
          `Annonce envoyée à ${notifications} étudiant${notifications > 1 ? 's' : ''}`
          + (emails ? `, dont ${emails} par e-mail.` : '.'));
      },
      error: (erreur: HttpErrorResponse) => {
        this.envoi.set(false);
        this.confirmation.set(false);
        this.erreur.set(erreur.status === 0
          ? 'Impossible de joindre le serveur. Réessayez plus tard.'
          : erreur.error?.message || "L'annonce n'a pas pu être envoyée. Réessayez.");
      }
    });
  }
}
