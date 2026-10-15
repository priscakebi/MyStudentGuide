// Permet de créer un composant Angular.
import { Component, OnDestroy, inject } from '@angular/core';

// Permet de lire l'erreur renvoyée par l'API.
import { HttpErrorResponse } from '@angular/common/http';

// Permet d'utiliser [(ngModel)] dans le formulaire.
import { FormsModule } from '@angular/forms';

// Permet d'utiliser routerLink pour naviguer
// vers la page de connexion.
import { Router, RouterLink } from '@angular/router';

// Service d'authentification (appelle POST /api/auth/register).
import { AuthService } from '../../services/auth.service';

// Écran de chargement affiché après la création du compte.
import { LoginLoader, LOGIN_LOADER_DURATION } from '../../components/login-loader/login-loader';

// Règles des champs (mêmes règles que l'API).
import {
  EMAIL_MAX,
  PASSWORD_MAX,
  isStrongPassword,
  isValidEmail,
  isValidName,
  passwordChecks
} from '../../utils/form-rules';
import { LangueService } from '../../i18n/langue.service';
import { TPipe } from '../../i18n/t.pipe';
import { LangueSwitch } from '../../components/langue-switch/langue-switch';


/**
 * Page d'inscription.
 *
 * Chaque champ est contrôlé selon les recommandations CNIL / ANSSI
 * (voir utils/form-rules.ts) :
 * - prénom / nom : 2 à 50 lettres ;
 * - e-mail : format nom@domaine.fr ;
 * - mot de passe : 12 caractères minimum, majuscule, minuscule,
 *   chiffre et caractère spécial (checklist en temps réel).
 *
 * Les erreurs s'affichent sous chaque champ dès qu'il a été quitté,
 * ou pour tous les champs au clic sur « Créer mon compte ».
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    LoginLoader,
    TPipe,
    LangueSwitch
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register implements OnDestroy {

  private authService = inject(AuthService);
  private router = inject(Router);
  private langue = inject(LangueService);

  // Limites affichées dans le HTML (maxlength).
  readonly emailMax = EMAIL_MAX;
  readonly passwordMax = PASSWORD_MAX;

  loading = false;

  firstName = '';
  lastName = '';
  email = '';
  password = '';
  confirmPassword = '';

  passwordVisible = false;
  confirmPasswordVisible = false;

  errorMessage = '';

  /** Champs déjà quittés : leurs erreurs sont affichées. */
  touched = new Set<string>();

  /** Vrai après un clic sur « Créer mon compte » : toutes les erreurs s'affichent. */
  submitted = false;

  /** Écran de chargement après la création du compte. */
  showLoader = false;
  private redirectTimer?: ReturnType<typeof setTimeout>;


  // ============================================================
  // VALIDATION
  // ============================================================

  get passwordChecks() {
    return passwordChecks(this.password);
  }

  get firstNameValid(): boolean {
    return isValidName(this.firstName);
  }

  get lastNameValid(): boolean {
    return isValidName(this.lastName);
  }

  get emailValid(): boolean {
    return isValidEmail(this.email);
  }

  get passwordValid(): boolean {
    return isStrongPassword(this.password);
  }

  get confirmValid(): boolean {
    return !!this.confirmPassword && this.confirmPassword === this.password;
  }

  get formValid(): boolean {
    return this.firstNameValid
      && this.lastNameValid
      && this.emailValid
      && this.passwordValid
      && this.confirmValid;
  }

  /** Marque un champ comme quitté (événement blur). */
  touch(field: string): void {
    this.touched.add(field);
  }

  /** Vrai si l'erreur du champ doit être affichée. */
  showError(field: string, valid: boolean): boolean {
    return !valid && (this.submitted || this.touched.has(field));
  }


  // ============================================================
  // AFFICHAGE DES MOTS DE PASSE
  // ============================================================

  togglePassword(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPassword(): void {
    this.confirmPasswordVisible =
      !this.confirmPasswordVisible;
  }


  // ============================================================
  // INSCRIPTION
  // ============================================================

  onRegister(): void {

    this.errorMessage = '';
    this.submitted = true;

    if (!this.formValid) {
      this.errorMessage = this.langue.t(!this.passwordValid ? 'form.motDePasse.message' : 'form.corriger');
      return;
    }

    this.loading = true;

    this.authService.register({
      prenom: this.firstName.trim(),
      nom: this.lastName.trim(),
      email: this.email.trim(),
      password: this.password
    }).subscribe({

      next: () => {
        this.loading = false;

        // Petit écran de chargement avant d'entrer dans l'espace étudiant.
        this.showLoader = true;
        this.redirectTimer = setTimeout(
          () => this.router.navigate(['/dashboard']),
          LOGIN_LOADER_DURATION
        );
      },

      error: (error: HttpErrorResponse) => {

        this.loading = false;

        // 400 : e-mail déjà utilisé ou champ refusé par l'API.
        // Le message de l'API est en français : en anglais, message générique.
        if (error.status === 400 && error.error?.message) {
          this.errorMessage = this.langue.langue() === 'fr'
            ? error.error.message
            : this.langue.t('register.erreur.refus');
        } else if (error.status === 0) {
          this.errorMessage = this.langue.t('form.serveurInjoignable');
        } else {
          this.errorMessage = this.langue.t('register.erreur');
        }
      }
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.redirectTimer);
  }
}
