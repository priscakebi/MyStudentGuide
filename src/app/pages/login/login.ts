import { Component, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { LoginLoader, LOGIN_LOADER_DURATION } from '../../components/login-loader/login-loader';
import { EMAIL_MAX, EMAIL_MESSAGE, PASSWORD_MAX, isValidEmail } from '../../utils/form-rules';

/**
 * Page de connexion de l'espace étudiant.
 *
 * Après une connexion réussie, un écran de chargement (icônes de
 * démarches, d'étudiants et de France qui défilent) s'affiche
 * quelques secondes, puis l'étudiant arrive sur la page demandée
 * avant la redirection (returnUrl), sinon sur /home.
 *
 * Le format de l'e-mail est contrôlé. La règle des 12 caractères
 * du mot de passe ne s'applique PAS ici : les comptes créés avec
 * l'ancienne règle doivent toujours pouvoir se connecter.
 *
 * La session (token, rôle...) est enregistrée par AuthService :
 * cette page n'écrit plus elle-même dans le localStorage.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, LoginLoader],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnDestroy {

  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly emailMax = EMAIL_MAX;
  readonly passwordMax = PASSWORD_MAX;
  readonly emailMessage = EMAIL_MESSAGE;

  email = '';
  password = '';

  errorMessage = '';
  infoMessage = '';

  passwordVisible = false;
  loading = false;

  /** Vrai une fois le champ e-mail quitté : son erreur s'affiche. */
  emailTouched = false;

  /** Écran de chargement après connexion. */
  showLoader = false;
  private redirectTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    // Message affiché quand l'interceptor a déconnecté l'utilisateur (token expiré).
    if (this.route.snapshot.queryParamMap.get('reason') === 'idle') {
      this.infoMessage = 'Vous avez été déconnecté après une période d\'inactivité. Veuillez vous reconnecter.';
    } else if (this.route.snapshot.queryParamMap.get('sessionExpired')) {
      this.infoMessage = 'Votre session a expiré. Veuillez vous reconnecter.';
    }
  }

  get emailValid(): boolean {
    return isValidEmail(this.email);
  }

  get showEmailError(): boolean {
    return this.emailTouched && !!this.email.trim() && !this.emailValid;
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

    if (!this.emailValid) {
      this.emailTouched = true;
      this.errorMessage = EMAIL_MESSAGE;
      return;
    }

    this.loading = true;

    this.authService.login({ email, password: this.password }).subscribe({

      next: (response) => {
        this.loading = false;

        const role = response.role;

        if (role === 'ETUDIANT' || role === 'ROLE_ETUDIANT') {
          // Petit écran de chargement avant d'entrer dans l'application.
          this.showLoader = true;

          const destination = this.getSafeReturnUrl();
          this.redirectTimer = setTimeout(
            () => this.router.navigateByUrl(destination),
            LOGIN_LOADER_DURATION
          );
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

  ngOnDestroy(): void {
    clearTimeout(this.redirectTimer);
  }

  /**
   * Page demandée avant la redirection vers /login
   * (ex. : /demarches, /dashboard/notifications).
   *
   * Seuls les chemins internes sont acceptés (pas de « // » qui
   * mènerait vers un site externe), et jamais l'espace admin
   * ni les pages de connexion elles-mêmes.
   */
  private getSafeReturnUrl(): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    const isSafe = !!returnUrl
      && returnUrl.startsWith('/')
      && !returnUrl.startsWith('//')
      && !returnUrl.startsWith('/\\')
      && !/^\/(admin|login|register)/.test(returnUrl);

    return isSafe ? returnUrl! : '/home';
  }
}
