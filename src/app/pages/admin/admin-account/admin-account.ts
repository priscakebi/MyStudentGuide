// ============================================================
// IMPORTS
// ============================================================

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';
import {
  PASSWORD_MESSAGE,
  PasswordCheck,
  isStrongPassword,
  passwordChecks
} from '../../../utils/form-rules';
import { Icone } from '../../../components/icone/icone';
import { DoubleAuthentification } from '../../../components/double-authentification/double-authentification';


// ============================================================
// INTERFACE DU COMPTE
// ============================================================

/**
 * Représente les informations du compte
 * récupérées depuis le backend.
 *
 * Le rôle n'est volontairement pas présent ici,
 * car il n'est pas affiché dans cette page.
 */
interface UserAccount {

  /** Identifiant de l'utilisateur. */
  id: number;

  /** Prénom de l'utilisateur. */
  prenom: string;

  /** Nom de l'utilisateur. */
  nom: string;

  /** Adresse e-mail de l'utilisateur. */
  email: string;
}


// ============================================================
// COMPOSANT
// ============================================================

@Component({
  selector: 'app-admin-account',

  /**
   * Le composant est autonome.
   */
  standalone: true,

  /**
   * Modules utilisés par cette page.
   */
  imports: [
    Icone,
    DoubleAuthentification,
    CommonModule,
    ReactiveFormsModule
  ],

  /**
   * Fichiers associés au composant.
   */
  templateUrl: './admin-account.html',
  styleUrl: './admin-account.scss'
})
export class AdminAccount implements OnInit {

  private authService = inject(AuthService);


  // ==========================================================
  // CONFIGURATION API
  // ==========================================================

  /**
   * URL principale de l'API Spring Boot.
   */
  private apiUrl = environment.apiUrl;


  // ==========================================================
  // INFORMATIONS DU COMPTE
  // ==========================================================

  /**
   * Prénom actuellement affiché.
   */
  firstName = '';

  /**
   * Nom actuellement affiché.
   */
  lastName = '';

  /**
   * Adresse e-mail actuellement affichée.
   */
  email = '';


  // ==========================================================
  // FORMULAIRE DES INFORMATIONS DU COMPTE
  // ==========================================================

  /**
   * Formulaire permettant de modifier :
   *
   * - le prénom ;
   * - le nom ;
   * - l'adresse e-mail.
   */
  accountForm: FormGroup;

  /**
   * Indique si le mode modification
   * des informations est actif.
   */
  isEditingAccount = false;

  /**
   * Indique si la modification du compte
   * est en cours d'envoi au backend.
   */
  isUpdatingAccount = false;

  /**
   * Message affiché après une modification
   * réussie des informations.
   */
  accountSuccessMessage = '';

  /**
   * Message d'erreur lors de la modification
   * des informations du compte.
   */
  accountEditErrorMessage = '';


  // ==========================================================
  // FORMULAIRE DU MOT DE PASSE
  // ==========================================================

  /**
   * Formulaire de modification du mot de passe.
   */
  passwordForm: FormGroup;

  /**
   * Message affiché lorsque le changement
   * de mot de passe est réussi.
   */
  successMessage = '';

  /**
   * Message d'erreur concernant le mot de passe.
   */
  errorMessage = '';

  /**
   * Indique si la modification du mot de passe
   * est en cours.
   */
  isLoading = false;


  // ==========================================================
  // ERREUR DE CHARGEMENT DU COMPTE
  // ==========================================================

  /**
   * Message affiché lorsque les informations
   * du compte ne peuvent pas être récupérées.
   */
  accountErrorMessage = '';


  // ==========================================================
  // CONSTRUCTEUR
  // ==========================================================

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {

    // ========================================================
    // FORMULAIRE DES INFORMATIONS DU COMPTE
    // ========================================================

    this.accountForm = this.fb.group({

      /**
       * Prénom :
       * - obligatoire ;
       * - minimum 2 caractères.
       */
      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(2)
        ]
      ],

      /**
       * Nom :
       * - obligatoire ;
       * - minimum 2 caractères.
       */
      lastName: [
        '',
        [
          Validators.required,
          Validators.minLength(2)
        ]
      ],

      /**
       * E-mail :
       * - obligatoire ;
       * - doit respecter le format d'une adresse e-mail.
       */
      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ]
    });


    // ========================================================
    // FORMULAIRE DU MOT DE PASSE
    // ========================================================

    this.passwordForm = this.fb.group({

      /**
       * Ancien mot de passe.
       */
      currentPassword: [
        '',
        Validators.required
      ],

      /**
       * Nouveau mot de passe.
       *
       * Les règles sont également vérifiées
       * dans isPasswordSecure().
       */
      newPassword: [
        '',
        [
          Validators.required,
          (control: { value: string | null }) =>
            isStrongPassword(control.value || '') ? null : { weakPassword: true }
        ]
      ],

      /**
       * Confirmation du nouveau mot de passe.
       */
      confirmPassword: [
        '',
        Validators.required
      ]
    });
  }


  // ==========================================================
  // INITIALISATION
  // ==========================================================

  /**
   * Méthode exécutée automatiquement
   * lorsque le composant est chargé.
   */
  ngOnInit(): void {

    /**
     * Récupération des informations
     * de l'administrateur connecté.
     */
    this.loadAdminInformation();
  }


  // ==========================================================
  // RÉCUPÉRATION DU TOKEN
  // ==========================================================

  /**
   * Récupère le token JWT enregistré
   * dans le localStorage.
   */
  private getToken(): string | null {

    return this.authService.getToken();
  }


  // ==========================================================
  // HEADERS HTTP
  // ==========================================================

  /**
   * Prépare les headers utilisés
   * pour communiquer avec l'API sécurisée.
   */
  private getHeaders(): HttpHeaders {

    const token = this.getToken();

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }


  // ==========================================================
  // CHARGER LES INFORMATIONS DU COMPTE
  // ==========================================================

  /**
   * Récupère les informations de l'administrateur
   * depuis le backend.
   *
   * Endpoint :
   *
   * GET /api/users/me
   */
  loadAdminInformation(): void {

    const token = this.getToken();


    /**
     * Si aucun token n'existe,
     * la session n'est plus disponible.
     */
    if (!token) {

      this.accountErrorMessage =
        'Votre session a expiré. Veuillez vous reconnecter.';

      return;
    }


    // --------------------------------------------------------
    // Appel du backend
    // --------------------------------------------------------

    this.http.get<UserAccount>(
      `${this.apiUrl}/users/me`,
      {
        headers: this.getHeaders()
      }
    ).subscribe({

      // ------------------------------------------------------
      // SUCCÈS
      // ------------------------------------------------------

      next: (user: UserAccount) => {

        /**
         * Mise à jour des informations affichées.
         */
        this.firstName = user.prenom;
        this.lastName = user.nom;
        this.email = user.email;


        /**
         * Pré-remplit le formulaire de modification.
         */
        this.accountForm.patchValue({

          firstName: user.prenom,
          lastName: user.nom,
          email: user.email

        });


        /**
         * Mise à jour du localStorage.
         */
        localStorage.setItem(
          'prenom',
          user.prenom
        );

        localStorage.setItem(
          'nom',
          user.nom
        );

        localStorage.setItem(
          'email',
          user.email
        );


        /**
         * Suppression d'une éventuelle erreur.
         */
        this.accountErrorMessage = '';
      },


      // ------------------------------------------------------
      // ERREUR
      // ------------------------------------------------------

      error: (error: any) => {

        console.error(
          'Erreur lors du chargement du compte administrateur :',
          error
        );


        /**
         * 401 ou 403 :
         * la session n'est plus valide.
         */
        if (
          error.status === 401 ||
          error.status === 403
        ) {

          localStorage.removeItem('token');

          this.router.navigate(['/login']);

          return;
        }


        /**
         * Message affiché à l'utilisateur.
         */
        this.accountErrorMessage =
          error.error?.message ||
          'Impossible de récupérer les informations de votre compte.';
      }
    });
  }


  // ==========================================================
  // COMMENCER LA MODIFICATION DU COMPTE
  // ==========================================================

  /**
   * Active le mode modification.
   *
   * Le formulaire est rempli avec
   * les informations actuellement affichées.
   */
  startEditingAccount(): void {

    /**
     * Nettoyage des anciens messages.
     */
    this.accountSuccessMessage = '';
    this.accountEditErrorMessage = '';


    /**
     * Remplit le formulaire avec
     * les informations actuelles.
     */
    this.accountForm.patchValue({

      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email

    });


    /**
     * Affiche le formulaire.
     */
    this.isEditingAccount = true;
  }


  // ==========================================================
  // ANNULER LA MODIFICATION DU COMPTE
  // ==========================================================

  /**
   * Annule les modifications en cours.
   *
   * Les valeurs saisies ne sont pas enregistrées.
   */
  cancelEditingAccount(): void {

    /**
     * Remet les anciennes valeurs
     * dans le formulaire.
     */
    this.accountForm.patchValue({

      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email

    });


    /**
     * Retour au mode affichage.
     */
    this.isEditingAccount = false;


    /**
     * Nettoyage du message d'erreur.
     */
    this.accountEditErrorMessage = '';
  }


  // ==========================================================
  // MODIFIER LES INFORMATIONS DU COMPTE
  // ==========================================================

  /**
   * Enregistre les modifications du :
   *
   * - prénom ;
   * - nom ;
   * - e-mail.
   *
   * Endpoint prévu :
   *
   * PUT /api/users/me
   *
   * Le endpoint doit exister côté Spring Boot
   * pour que cette opération soit réellement enregistrée.
   */
  updateAccountInformation(): void {

    /**
     * Nettoyage des messages précédents.
     */
    this.accountSuccessMessage = '';
    this.accountEditErrorMessage = '';


    /**
     * Vérification du formulaire.
     */
    if (this.accountForm.invalid) {

      this.accountForm.markAllAsTouched();

      this.accountEditErrorMessage =
        'Veuillez corriger les informations indiquées.';

      return;
    }


    /**
     * Active le chargement.
     */
    this.isUpdatingAccount = true;


    // --------------------------------------------------------
    // RÉCUPÉRATION DES DONNÉES
    // --------------------------------------------------------

    const updatedAccount = {

      prenom:
        this.accountForm.get('firstName')?.value.trim(),

      nom:
        this.accountForm.get('lastName')?.value.trim(),

      email:
        this.accountForm.get('email')?.value.trim()

    };


    // --------------------------------------------------------
    // ENVOI AU BACKEND
    // --------------------------------------------------------

    this.http.put<UserAccount>(
      `${this.apiUrl}/users/me`,
      updatedAccount,
      {
        headers: this.getHeaders()
      }
    ).subscribe({

      // ------------------------------------------------------
      // SUCCÈS
      // ------------------------------------------------------

      next: (user: UserAccount) => {

        /**
         * Mise à jour des informations affichées.
         */
        this.firstName = user.prenom;
        this.lastName = user.nom;
        this.email = user.email;


        /**
         * Mise à jour du formulaire.
         */
        this.accountForm.patchValue({

          firstName: user.prenom,
          lastName: user.nom,
          email: user.email

        });


        /**
         * Mise à jour du localStorage.
         */
        localStorage.setItem(
          'prenom',
          user.prenom
        );

        localStorage.setItem(
          'nom',
          user.nom
        );

        localStorage.setItem(
          'email',
          user.email
        );


        /**
         * Retour au mode affichage.
         */
        this.isEditingAccount = false;


        /**
         * Message de confirmation.
         */
        this.accountSuccessMessage =
          'Vos informations ont été modifiées avec succès.';


        /**
         * Arrêt du chargement.
         */
        this.isUpdatingAccount = false;
      },


      // ------------------------------------------------------
      // ERREUR
      // ------------------------------------------------------

      error: (error: any) => {

        console.error(
          'Erreur lors de la modification du compte :',
          error
        );


        /**
         * Session expirée.
         */
        if (
          error.status === 401 ||
          error.status === 403
        ) {

          localStorage.removeItem('token');

          this.router.navigate(['/login']);

          return;
        }


        /**
         * Affichage du message backend
         * ou d'un message générique.
         */
        this.accountEditErrorMessage =
          error.error?.message ||
          'Impossible de modifier les informations du compte.';


        /**
         * Arrêt du chargement.
         */
        this.isUpdatingAccount = false;
      }
    });
  }


  // ==========================================================
  // VÉRIFIER LES MOTS DE PASSE
  // ==========================================================

  /**
   * Vérifie que le nouveau mot de passe
   * et sa confirmation sont identiques.
   */
  passwordsMatch(): boolean {

    const newPassword =
      this.passwordForm.get('newPassword')?.value;

    const confirmPassword =
      this.passwordForm.get('confirmPassword')?.value;


    return newPassword === confirmPassword;
  }


  // ==========================================================
  // VÉRIFIER LA SÉCURITÉ DU MOT DE PASSE
  // ==========================================================

  /**
   * Vérifie que le nouveau mot de passe
   * respecte toutes les règles de sécurité.
   */
  isPasswordSecure(): boolean {
    return isStrongPassword(this.passwordForm.get('newPassword')?.value || '');
  }

  /** Critères du nouveau mot de passe, pour la checklist du template. */
  get newPasswordChecks(): PasswordCheck[] {
    return passwordChecks(this.passwordForm.get('newPassword')?.value || '');
  }


  // ==========================================================
  // CHANGER LE MOT DE PASSE
  // ==========================================================

  /**
   * Vérifie les données du formulaire
   * de changement de mot de passe.
   *
   * Le changement est enregistré par l'API
   * (PUT /api/account/password).
   */
  changePassword(): void {

    /**
     * Nettoyage des messages.
     */
    this.successMessage = '';
    this.errorMessage = '';


    /**
     * Vérification du formulaire.
     */
    if (this.passwordForm.invalid) {

      this.passwordForm.markAllAsTouched();

      this.errorMessage =
        'Veuillez respecter toutes les règles de sécurité du mot de passe.';

      return;
    }


    /**
     * Vérification de la sécurité.
     */
    if (!this.isPasswordSecure()) {

      this.errorMessage =
        PASSWORD_MESSAGE;

      return;
    }


    /**
     * Vérification de la confirmation.
     */
    if (!this.passwordsMatch()) {

      this.errorMessage =
        'Les deux nouveaux mots de passe ne correspondent pas.';

      return;
    }


    /**
     * Activation du chargement.
     */
    this.isLoading = true;


    const { currentPassword, newPassword } = this.passwordForm.value;

    /*
     * PUT /api/account/password
     *
     * L'API vérifie le mot de passe actuel, les règles de sécurité,
     * chiffre le nouveau mot de passe (BCrypt) et envoie un e-mail
     * de confirmation.
     */
    this.authService.changePassword(currentPassword, newPassword).subscribe({

      next: (response) => {
        this.isLoading = false;
        this.successMessage =
          response?.message || 'Votre mot de passe a été modifié avec succès.';
        this.resetPasswordForm();
      },

      error: (error) => {
        this.isLoading = false;
        this.errorMessage =
          error.status === 0
            ? 'Impossible de joindre le serveur. Réessayez plus tard.'
            : error.error?.message || 'Impossible de modifier le mot de passe.';
      }
    });
  }


  // ==========================================================
  // RÉINITIALISER LE FORMULAIRE DU MOT DE PASSE
  // ==========================================================

  /**
   * Vide complètement le formulaire
   * de changement de mot de passe.
   */
  /** Lien « Mot de passe oublié ? » de l'espace administrateur. */
  forgotPassword(): void {
    this.router.navigate(['/admin-forgot-password']);
  }

  resetPasswordForm(): void {

    this.passwordForm.reset();
  }


  // ==========================================================
  // GÉNÉRER LES INITIALES
  // ==========================================================

  /**
   * Génère les initiales utilisées
   * dans l'avatar du compte.
   *
   * Exemple :
   *
   * Jean Dupont
   *
   * devient :
   *
   * JD
   */
  getInitials(): string {

    const first =
      this.firstName?.trim().charAt(0).toUpperCase() || '';

    const last =
      this.lastName?.trim().charAt(0).toUpperCase() || '';


    /**
     * Si aucune information n'est disponible,
     * on affiche "A".
     */
    if (!first && !last) {

      return 'A';
    }


    return `${first}${last}`;
  }
}