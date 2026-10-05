// Permet de créer un composant Angular.
import { Component, inject } from '@angular/core';

// Permet de lire l'erreur renvoyée par l'API.
import { HttpErrorResponse } from '@angular/common/http';

// Permet d'utiliser [(ngModel)] dans le formulaire.
import { FormsModule } from '@angular/forms';

// Permet d'utiliser routerLink pour naviguer
// vers la page de connexion.
import { Router, RouterLink } from '@angular/router';

// Service d'authentification (appelle POST /api/auth/register).
import { AuthService } from '../../services/auth.service';


@Component({
  // Nom du composant.
  selector: 'app-register',

  // Le composant est standalone.
  standalone: true,

  // Modules utilisés dans le HTML.
  imports: [
    FormsModule,
    RouterLink
  ],

  // Fichier HTML associé.
  templateUrl: './register.html',

  // Fichier SCSS associé.
  styleUrl: './register.scss'
})
export class Register {

  private authService = inject(AuthService);
  private router = inject(Router);

  // Vrai pendant l'appel à l'API (désactive le bouton).
  loading = false;

  // Prénom saisi par l'utilisateur.
  firstName = '';

  // Nom saisi par l'utilisateur.
  lastName = '';

  // Adresse e-mail saisie.
  email = '';

  // Mot de passe saisi.
  password = '';

  // Confirmation du mot de passe.
  confirmPassword = '';

  // Permet d'afficher ou de masquer le mot de passe.
  passwordVisible = false;

  // Permet d'afficher ou de masquer
  // la confirmation du mot de passe.
  confirmPasswordVisible = false;

  // Message d'erreur.
  errorMessage = '';


  /**
   * Affiche ou masque le mot de passe.
   */
  togglePassword(): void {

    // Inverse la valeur actuelle.
    this.passwordVisible = !this.passwordVisible;
  }


  /**
   * Affiche ou masque la confirmation
   * du mot de passe.
   */
  toggleConfirmPassword(): void {

    // Inverse la valeur actuelle.
    this.confirmPasswordVisible =
      !this.confirmPasswordVisible;
  }


  /**
   * Méthode appelée lors de l'inscription.
   *
   * 1. Vérifie le formulaire côté navigateur.
   * 2. Envoie les données à POST /api/auth/register.
   * 3. L'API renvoie un JWT : l'étudiant est connecté
   *    et redirigé vers son tableau de bord.
   */
  onRegister(): void {

    this.errorMessage = '';

    const prenom = this.firstName.trim();
    const nom = this.lastName.trim();
    const email = this.email.trim();

    if (!prenom || !nom || !email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    // Même règle que le backend (RegisterRequest).
    if (this.password.length < 8 || this.password.length > 72) {
      this.errorMessage =
        'Le mot de passe doit contenir entre 8 et 72 caractères.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.loading = true;

    this.authService.register({
      prenom,
      nom,
      email,
      password: this.password
    }).subscribe({

      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },

      error: (error: HttpErrorResponse) => {
        this.loading = false;

        // 400 : l'API renvoie un message lisible
        // (ex : "Cette adresse email est déjà utilisée").
        if (error.status === 400 && error.error?.message) {
          this.errorMessage = error.error.message;
        } else if (error.status === 0) {
          this.errorMessage =
            'Impossible de joindre le serveur. Réessayez plus tard.';
        } else {
          this.errorMessage =
            'Une erreur est survenue lors de l\'inscription.';
        }
      }
    });
  }
}
