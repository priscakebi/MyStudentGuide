// Permet de créer un composant Angular.
import { Component } from '@angular/core';

// Permet d'utiliser [(ngModel)] dans le formulaire.
import { FormsModule } from '@angular/forms';

// Permet d'utiliser routerLink pour naviguer
// vers la page de connexion.
import { RouterLink } from '@angular/router';


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
   */
  onRegister(): void {

    // Réinitialise le message d'erreur.
    this.errorMessage = '';


    // Vérifie que les deux mots de passe
    // sont identiques.
    if (this.password !== this.confirmPassword) {

      this.errorMessage =
        'Les mots de passe ne correspondent pas.';

      return;
    }


    // Pour le moment, on affiche les données
    // dans la console.
    //
    // Plus tard, cette partie appellera
    // notre API Spring Boot.
    console.log('Inscription :', {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password
    });
  }
}