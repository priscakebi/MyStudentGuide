// ============================================================
// BANDEAU « CONFIRMEZ VOTRE ADRESSE E-MAIL » (espace étudiant)
// ============================================================
//
// Affiché tant que l'étudiant n'a pas ouvert le lien reçu par e-mail :
// sans confirmation, il ne reçoit pas les rappels par e-mail.
// Permet de renvoyer le lien (une fois par minute) ou de corriger
// l'adresse dans « Mon compte ».
// ============================================================

import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { EtatCompteService } from '../../services/etat-compte.service';
import { Cle } from '../../i18n/textes';
import { TPipe } from '../../i18n/t.pipe';
import { Icone } from '../icone/icone';

@Component({
  selector: 'app-bandeau-verification-email',
  standalone: true,
  imports: [RouterLink, TPipe, Icone],
  templateUrl: './bandeau-verification-email.html',
  styleUrl: './bandeau-verification-email.scss'
})
export class BandeauVerificationEmail {

  private readonly authService = inject(AuthService);
  protected readonly compte = inject(EtatCompteService);

  protected readonly envoi = signal(false);

  /** Résultat du dernier renvoi (clé de texte). */
  protected readonly retour = signal<Cle | null>(null);

  protected renvoyer(): void {
    if (this.envoi()) {
      return;
    }
    this.envoi.set(true);
    this.retour.set(null);

    this.authService.renvoyerLienVerification().subscribe({
      next: () => {
        this.envoi.set(false);
        this.retour.set('verif.bandeau.envoye');
      },
      error: (erreur: HttpErrorResponse) => {
        this.envoi.set(false);
        this.retour.set(erreur.status === 429 ? 'verif.bandeau.tropTot' : 'verif.bandeau.erreur');
      }
    });
  }
}
