import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';

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
  imports: [FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPassword {

  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

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
      this.errorMessage = 'Veuillez saisir votre adresse e-mail.';
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.errorMessage = "L'adresse e-mail n'est pas valide.";
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

          this.errorMessage = error.status === 0
            ? 'Impossible de joindre le serveur. Réessayez plus tard.'
            : 'Une erreur est survenue. Veuillez réessayer.';
        }
      });
  }

  /** Revient au formulaire pour demander un nouvel e-mail. */
  retry(): void {
    this.sent = false;
    this.errorMessage = '';
  }
}
