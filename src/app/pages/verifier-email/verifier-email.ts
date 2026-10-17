// ============================================================
// CONFIRMATION DE L'ADRESSE E-MAIL (/verifier-email?token=…)
// ============================================================
//
// Lien reçu par e-mail à l'inscription ou après un changement
// d'adresse : la confirmation est envoyée dès l'ouverture de la page.
// ============================================================

import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { TPipe } from '../../i18n/t.pipe';
import { LangueSwitch } from '../../components/langue-switch/langue-switch';

type Etat = 'enCours' | 'ok' | 'erreur' | 'lienIncomplet';

@Component({
  selector: 'app-verifier-email',
  standalone: true,
  imports: [RouterLink, TPipe, LangueSwitch],
  templateUrl: './verifier-email.html',
  styleUrl: '../forgot-password/forgot-password.scss'
})
export class VerifierEmail implements OnInit {

  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  protected readonly etat = signal<Etat>('enCours');

  /** Déjà connecté (même navigateur) : bouton vers l'espace plutôt que vers la connexion. */
  protected readonly connecte = this.authService.isLoggedIn();

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token')?.trim() ?? '';
    if (!token) {
      this.etat.set('lienIncomplet');
      return;
    }
    this.authService.verifierEmail(token).subscribe({
      next: () => this.etat.set('ok'),
      error: () => this.etat.set('erreur')
    });
  }
}
