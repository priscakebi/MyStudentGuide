import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

/**
 * Composant responsable de la page de connexion.
 *
 * Il permet à l'étudiant :
 *
 * - de saisir son adresse e-mail ;
 * - de saisir son mot de passe ;
 * - d'afficher ou masquer son mot de passe ;
 * - de se connecter à l'API Spring Boot ;
 * - de sauvegarder le JWT ;
 * - d'être redirigé vers la page Home après connexion ;
 * - d'accéder à la page d'inscription.
 */
@Component({

  selector: 'app-login',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './login.html',

  styleUrl: './login.scss'

})
export class Login {

  /**
   * URL de l'endpoint de connexion
   * de notre API Spring Boot.
   */
  private apiUrl =
    'http://localhost:8080/api/auth/login';


  /**
   * Adresse e-mail saisie par l'étudiant.
   */
  email = '';


  /**
   * Mot de passe saisi par l'étudiant.
   */
  password = '';


  /**
   * Message affiché lorsqu'une erreur
   * de connexion se produit.
   */
  errorMessage = '';


  /**
   * Permet de savoir si le mot de passe
   * doit être affiché ou masqué.
   *
   * false = mot de passe masqué
   * true = mot de passe visible
   */
  passwordVisible = false;


  /**
   * Indique si une connexion est
   * actuellement en cours.
   */
  loading = false;


  /**
   * Injection des services Angular.
   *
   * HttpClient :
   * permet de communiquer avec l'API Spring Boot.
   *
   * Router :
   * permet de changer de page.
   */
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}


  /**
   * Permet d'afficher ou de masquer
   * le mot de passe.
   */
  togglePassword(): void {

    this.passwordVisible =
      !this.passwordVisible;

  }


  /**
   * Méthode appelée lors de la validation
   * du formulaire de connexion.
   *
   * Elle envoie l'e-mail et le mot de passe
   * à l'API Spring Boot.
   */
  onLogin(): void {

    /**
     * On supprime l'ancien message d'erreur.
     */
    this.errorMessage = '';


    /**
     * Vérification que les champs
     * ne sont pas vides.
     */
    if (!this.email || !this.password) {

      this.errorMessage =
        'Veuillez remplir tous les champs.';

      return;
    }


    /**
     * Activation du chargement.
     */
    this.loading = true;


    /**
     * Envoi de la requête POST
     * vers Spring Boot.
     *
     * Endpoint :
     *
     * POST /api/auth/login
     */
    this.http.post<any>(

      this.apiUrl,

      {
        email: this.email,
        password: this.password
      }

    ).subscribe({

      /**
       * Connexion réussie.
       */
      next: (response) => {

        console.log(
          'Connexion réussie :',
          response
        );


        /**
         * Sauvegarde du JWT.
         *
         * Le token sera utilisé pour
         * accéder aux API protégées.
         */
        localStorage.setItem(
          'token',
          response.token
        );


        /**
         * Sauvegarde de l'identifiant
         * de l'utilisateur.
         */
        localStorage.setItem(
          'userId',
          String(response.userId)
        );


        /**
         * Sauvegarde de l'adresse e-mail.
         */
        localStorage.setItem(
          'email',
          response.email
        );


        /**
         * Sauvegarde du rôle.
         */
        localStorage.setItem(
          'role',
          response.role
        );


        /**
         * Connexion terminée.
         */
        this.loading = false;


        /**
         * REDIRECTION VERS HOME.
         *
         * Après une connexion réussie,
         * l'étudiant arrive sur :
         *
         * /home
         */
        this.router.navigate(['/home']);

      },


      /**
       * Une erreur s'est produite
       * pendant la connexion.
       */
      error: (error) => {

        console.error(
          'Erreur de connexion :',
          error
        );


        /**
         * Message affiché à l'utilisateur.
         */
        this.errorMessage =
          'Adresse e-mail ou mot de passe incorrect.';


        /**
         * Arrêt du chargement.
         */
        this.loading = false;

      }

    });

  }


  /**
   * Redirige l'utilisateur vers
   * la page d'inscription.
   */
  goToRegister(): void {

    this.router.navigate(['/register']);

  }


  /**
   * Redirige vers la page
   * "Mot de passe oublié".
   *
   * Pour l'instant, cette route devra
   * être créée lorsque nous développerons
   * cette fonctionnalité.
   */
  forgotPassword(): void {

    this.router.navigate(['/forgot-password']);

  }

}