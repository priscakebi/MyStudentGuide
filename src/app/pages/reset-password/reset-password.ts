import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { PASSWORD_MAX, isStrongPassword, passwordChecks } from '../../utils/form-rules';
import { LangueService } from '../../i18n/langue.service';
import { TPipe } from '../../i18n/t.pipe';
import { LangueSwitch } from '../../components/langue-switch/langue-switch';

/**
 * Page « Nouveau mot de passe » : ouverte depuis le lien reçu par e-mail
 * (/reset-password?token=... ou /admin-reset-password?token=...).
 *
 * Le jeton est lu dans l'URL puis envoyé à l'API avec le nouveau mot de passe.
 * Si le lien est absent, invalide ou expiré, un message invite à refaire
 * une demande. Les règles du mot de passe sont les mêmes que celles de
 * l'inscription (12 à 72 caractères, CNIL / ANSSI).
 */
@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, RouterLink, TPipe, LangueSwitch],
  templateUrl: './reset-password.html',
  styleUrl: '../forgot-password/forgot-password.scss'
})
export class ResetPassword {

  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private langue = inject(LangueService);

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

  readonly passwordMax = PASSWORD_MAX;

  /** Critères du mot de passe, affichés en direct sous le champ. */
  get passwordChecks() {
    return passwordChecks(this.password);
  }

  togglePassword(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  onSubmit(): void {

    this.errorMessage = '';

    if (!this.password || !this.confirmPassword) {
      this.errorMessage = this.langue.t('form.champsVides');
      return;
    }

    if (!isStrongPassword(this.password)) {
      this.errorMessage = this.langue.t('form.motDePasse.message');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = this.langue.t('form.motDePasse.differents');
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
          this.errorMessage = this.langue.t('form.serveurInjoignable');
        } else if (error.status === 400 && error.error?.errors?.newPassword) {
          // Règle de validation du mot de passe refusée par l'API
          this.errorMessage = this.langue.langue() === 'fr'
            ? error.error.errors.newPassword
            : this.langue.t('form.motDePasse.message');
        } else if (error.status === 400) {
          // Lien invalide ou expiré
          this.linkProblem = true;
          this.errorMessage = (this.langue.langue() === 'fr' && error.error?.message)
            || this.langue.t('reset.lienInvalide');
        } else {
          this.errorMessage = this.langue.t('form.erreur');
        }
      }
    });
  }
}
