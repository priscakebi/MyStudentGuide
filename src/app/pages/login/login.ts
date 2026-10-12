import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';

/**
 * Page de connexion de l'espace étudiant.
 *
 * Après une connexion réussie :
 * - ADMIN    → /admin (ou la page admin demandée) ;
 * - ETUDIANT → la page demandée avant la redirection (returnUrl),
 *              sinon /dashboard.
 *
 * La session (token, rôle...) est enregistrée par AuthService :
 * cette page n'écrit plus elle-même dans le localStorage.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  password = '';

  errorMessage = '';
  infoMessage = '';

  passwordVisible = false;
  loading = false;

  constructor() {
    // Message affiché quand l'interceptor a déconnecté l'utilisateur (token expiré).
    if (this.route.snapshot.queryParamMap.get('reason') === 'idle') {
      this.infoMessage = 'Vous avez été déconnecté après une période d\'inactivité. Veuillez vous reconnecter.';
    } else if (this.route.snapshot.queryParamMap.get('sessionExpired')) {
      this.infoMessage = 'Votre session a expiré. Veuillez vous reconnecter.';
    }
  }

  togglePassword(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  onLogin(): void {

    this.errorMessage = '';
    this.infoMessage = '';

    const email = this.email.trim();

    if (!email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    this.loading = true;

    this.authService.login({ email, password: this.password }).subscribe({

      next: (response) => {
        this.loading = false;

        const role = response.role;

        // if (role === 'ADMIN' || role === 'ROLE_ADMIN') {
        //   this.router.navigate(['/admin']);
        //   return;
        // }

        if (role === 'ETUDIANT' || role === 'ROLE_ETUDIANT') {
          this.router.navigateByUrl(this.getSafeReturnUrl());
          return;
        }

        // Rôle inconnu : on ne garde aucune session.
        this.authService.logout();
        this.errorMessage = 'Ce compte ne peut pas se connecter ici.';
      },

      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.password = '';

        this.errorMessage = error.status === 0
          ? 'Impossible de joindre le serveur. Réessayez plus tard.'
          : 'Adresse e-mail ou mot de passe incorrect.';
      }
    });
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  forgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  /**
   * Page demandée avant la redirection vers /login.
   * Seules les URLs internes de l'espace étudiant sont acceptées
   * (évite une redirection vers un site externe).
   */
  private getSafeReturnUrl(): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    return returnUrl && returnUrl.startsWith('/home') && !returnUrl.startsWith('//')
      ? returnUrl
      : '/home';
  }
}
