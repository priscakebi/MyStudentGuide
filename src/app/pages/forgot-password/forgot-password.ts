import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { LangueService } from '../../i18n/langue.service';
import { TPipe } from '../../i18n/t.pipe';
import { LangueSwitch } from '../../components/langue-switch/langue-switch';

/**
 * Page « Mot de passe oublié ».
 *
 * Le même composant sert l'espace étudiant (/forgot-password) et l'espace
 * administrateur (/admin-forgot-password) : la donnée de route `space`
 * choisit le vocabulaire, les couleurs et le compte concerné.
 *
 * L'utilisateur saisit son e-mail ; l'API envoie un lien de réinitialisation
 * si un compte de cet espace existe. Le message affiché est TOUJOURS le même :
 * il ne révèle pas si l'adresse est inscrite.
 */
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink, TPipe, LangueSwitch],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPassword {

  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private langue = inject(LangueService);

  /** Vrai si la page est utilisée depuis l'espace administrateur. */
  readonly isAdmin = this.route.snapshot.data['space'] === 'admin';

  /** Page de connexion vers laquelle revenir. */
  readonly loginRoute = this.isAdmin ? '/admin-login' : '/login';

  email = '';
  loading = false;
  sent = false;
  errorMessage = '';

  onSubmit(): void {

    this.errorMessage = '';

    const email = this.email.trim();

    if (!email) {
      this.errorMessage = this.langue.t('forgot.emailVide');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.errorMessage = this.langue.t('forgot.emailInvalide');
      return;
    }

    if (this.loading) {
      return;
    }

    this.loading = true;

    this.authService
      .forgotPassword(email, this.isAdmin ? 'ADMIN' : 'ETUDIANT')
      .subscribe({

        next: () => {
          this.loading = false;
          this.sent = true;
        },

        error: (error: HttpErrorResponse) => {
          this.loading = false;

          this.errorMessage = this.langue.t(error.status === 0 ? 'form.serveurInjoignable' : 'form.erreur');
        }
      });
  }

  /** Revient au formulaire pour demander un nouvel e-mail. */
  retry(): void {
    this.sent = false;
    this.errorMessage = '';
  }
}
