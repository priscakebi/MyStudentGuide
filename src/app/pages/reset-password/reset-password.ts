import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';

/**
 * Page « Nouveau mot de passe » : ouverte depuis le lien reçu par e-mail
 * (/reset-password?token=... ou /admin-reset-password?token=...).
 *
 * Le jeton est lu dans l'URL puis envoyé à l'API avec le nouveau mot de passe.
 * Si le lien est absent, invalide ou expiré, un message invite à refaire
 * une demande. Les règles du mot de passe sont les mêmes que celles de
 * l'inscription (8 à 72 caractères).
 */
@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: '../forgot-password/forgot-password.scss'
})
export class ResetPassword {

  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  readonly isAdmin = this.route.snapshot.data['space'] === 'admin';
  readonly loginRoute = this.isAdmin ? '/admin-login' : '/login';
  readonly forgotRoute = this.isAdmin ? '/admin-forgot-password' : '/forgot-password';

  /** Jeton lu dans le lien (vide si le lien est incomplet). */
  readonly token = this.route.snapshot.queryParamMap.get('token') ?? '';

  password = '';
  confirmPassword = '';
  passwordVisible = false;

  loading = false;
  done = false;
  errorMessage = '';

  /** Vrai si l'erreur vient d'un lien invalide : on propose alors une nouvelle demande. */
  linkProblem = !this.token;

  togglePassword(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  onSubmit(): void {

    this.errorMessage = '';

    if (!this.password || !this.confirmPassword) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    if (this.password.length < 8 || this.password.length > 72) {
      this.errorMessage = 'Le mot de passe doit contenir entre 8 et 72 caractères.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    if (this.loading) {
      return;
    }

    this.loading = true;

    this.authService.resetPassword(this.token, this.password).subscribe({

      next: () => {
        this.loading = false;
        this.done = true;
        this.password = '';
        this.confirmPassword = '';
      },

      error: (error: HttpErrorResponse) => {
        this.loading = false;

        if (error.status === 0) {
          this.errorMessage = 'Impossible de joindre le serveur. Réessayez plus tard.';
        } else if (error.status === 400 && error.error?.errors?.newPassword) {
          // Règle de validation du mot de passe refusée par l'API
          this.errorMessage = error.error.errors.newPassword;
        } else if (error.status === 400) {
          // Lien invalide ou expiré
          this.linkProblem = true;
          this.errorMessage = error.error?.message
            ?? 'Ce lien est invalide ou a expiré.';
        } else {
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
        }
      }
    });
  }
}
