// Importe les éléments nécessaires à la création du composant Angular.
import { Component, OnInit } from '@angular/core';

// Permet d'utiliser les fonctionnalités communes d'Angular
// dans le template HTML.
import { CommonModule } from '@angular/common';

// Permet d'utiliser les formulaires réactifs Angular.
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

// Permet d'effectuer les requêtes HTTP vers le backend Spring Boot.
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

// Permet de naviguer vers les différentes pages de l'application.
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';


// ============================================================
// INTERFACE INFORMATIONS DU COMPTE
// ============================================================

/**
 * Représente les informations du compte
 * retournées par le backend.
 *
 * Le backend ne retourne volontairement pas
 * le mot de passe.
 */
interface UserAccount {

  /**
   * Identifiant de l'utilisateur.
   */
  id: number;

  /**
   * Prénom de l'utilisateur.
   */
  prenom: string;

  /**
   * Nom de famille de l'utilisateur.
   */
  nom: string;

  /**
   * Adresse email de l'utilisateur.
   */
  email: string;

  /**
   * Rôle de l'utilisateur.
   *
   * Exemple :
   * - ETUDIANT
   * - ADMIN
   */
  role?: string;
}


// ============================================================
// COMPOSANT ACCOUNT
// ============================================================

/**
 * Composant permettant à l'étudiant de gérer son compte.
 *
 * La page permet :
 *
 * - de consulter ses informations ;
 * - de modifier son prénom ;
 * - de modifier son nom ;
 * - de modifier son adresse email ;
 * - de modifier son mot de passe ;
 * - de demander la suppression de son compte.
 */
@Component({
  selector: 'app-account',

  // Le composant fonctionne en mode standalone.
  standalone: true,

  // Modules nécessaires au fonctionnement du template.
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],

  // Fichiers associés au composant.
  templateUrl: './account.html',
  styleUrl: './account.scss'
})
export class Account implements OnInit {


  // ============================================================
  // CONFIGURATION API
  // ============================================================

  /**
   * URL de base de l'API Spring Boot.
   */
  private apiUrl = environment.apiUrl;


  // ============================================================
  // INFORMATIONS DU COMPTE
  // ============================================================

  /**
   * Prénom de l'utilisateur connecté.
   */
  firstName = '';


  /**
   * Nom de l'utilisateur connecté.
   */
  lastName = '';


  /**
   * Adresse e-mail de l'utilisateur connecté.
   */
  email = '';


  /**
   * Indique si le formulaire de modification
   * des informations du compte est affiché.
   */
  showEditAccountForm = false;


  /**
   * Indique si la modification des informations
   * du compte est actuellement en cours.
   */
  isUpdatingAccount = false;


  /**
   * Message d'erreur concernant les informations
   * du compte.
   */
  accountErrorMessage = '';


  /**
   * Message de succès concernant la modification
   * des informations du compte.
   */
  accountSuccessMessage = '';


  /**
   * Formulaire permettant de modifier :
   *
   * - le prénom ;
   * - le nom ;
   * - l'adresse email.
   */
  accountForm: FormGroup;


  // ============================================================
  // FORMULAIRE DE CHANGEMENT DE MOT DE PASSE
  // ============================================================

  /**
   * Formulaire utilisé pour modifier le mot de passe.
   */
  passwordForm: FormGroup;


  // ============================================================
  // FORMULAIRE DE SUPPRESSION DU COMPTE
  // ============================================================

  /**
   * Formulaire utilisé pour supprimer le compte utilisateur.
   */
  deleteAccountForm: FormGroup;


  /**
   * Permet de savoir si le formulaire de suppression
   * doit être affiché.
   */
  showDeleteForm = false;


  /**
   * Indique si la suppression du compte
   * est actuellement en cours.
   */
  isDeleting = false;


  /**
   * Message d'erreur spécifique à la suppression du compte.
   */
  deleteErrorMessage = '';


  // ============================================================
  // MESSAGES
  // ============================================================

  /**
   * Message affiché après une opération réussie.
   */
  successMessage = '';


  /**
   * Message affiché lorsqu'une erreur se produit.
   */
  errorMessage = '';


  /**
   * Indique si une opération est actuellement en cours.
   */
  isLoading = false;


  // ============================================================
  // CONSTRUCTEUR
  // ============================================================

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {

    // ----------------------------------------------------------
    // FORMULAIRE DES INFORMATIONS DU COMPTE
    // ----------------------------------------------------------

    /**
     * Création du formulaire permettant de modifier
     * les informations personnelles du compte.
     */
    this.accountForm = this.fb.group({

      // Prénom obligatoire avec au minimum 2 caractères.
      prenom: [
        '',
        [
          Validators.required,
          Validators.minLength(2)
        ]
      ],

      // Nom obligatoire avec au minimum 2 caractères.
      nom: [
        '',
        [
          Validators.required,
          Validators.minLength(2)
        ]
      ],

      // Email obligatoire avec vérification du format.
      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ]
    });


    // ----------------------------------------------------------
    // FORMULAIRE DE MOT DE PASSE
    // ----------------------------------------------------------

    /**
     * Création du formulaire de changement de mot de passe.
     *
     * Le nouveau mot de passe doit respecter plusieurs
     * règles de sécurité.
     */
    this.passwordForm = this.fb.group({

      // Mot de passe actuellement utilisé.
      currentPassword: [
        '',
        Validators.required
      ],

      // Nouveau mot de passe.
      //
      // Règles :
      // - minimum 8 caractères ;
      // - au moins une minuscule ;
      // - au moins une majuscule ;
      // - au moins un chiffre ;
      // - au moins un caractère spécial.
      newPassword: [
        '',
        [
          Validators.required,

          // Minimum 8 caractères.
          Validators.minLength(8),

          // Au moins une lettre minuscule.
          Validators.pattern(/(?=.*[a-z])/),

          // Au moins une lettre majuscule.
          Validators.pattern(/(?=.*[A-Z])/),

          // Au moins un chiffre.
          Validators.pattern(/(?=.*\d)/),

          // Au moins un caractère spécial.
          Validators.pattern(/(?=.*[@$!%*?&])/)
        ]
      ],

      // Confirmation du nouveau mot de passe.
      confirmPassword: [
        '',
        Validators.required
      ]
    });


    // ----------------------------------------------------------
    // FORMULAIRE DE SUPPRESSION
    // ----------------------------------------------------------

    this.deleteAccountForm = this.fb.group({

      // Le motif de suppression est obligatoire.
      deletionReason: [
        '',
        Validators.required
      ],

      // La précision supplémentaire est facultative.
      deletionDetails: [
        ''
      ],

      // La case de confirmation reste facultative.
      confirmation: [
        false
      ],

      // Le mot de passe est obligatoire.
      deletionPassword: [
        '',
        Validators.required
      ]
    });
  }


  // ============================================================
  // INITIALISATION
  // ============================================================

  /**
   * Méthode exécutée automatiquement lors du chargement
   * du composant.
   */
  ngOnInit(): void {

    // Récupère les informations réelles du compte
    // depuis le backend.
    this.loadAccountInformation();
  }


  // ============================================================
  // TOKEN JWT
  // ============================================================

  /**
   * Récupère le token JWT enregistré dans le navigateur.
   *
   * @returns token JWT ou null s'il n'existe pas
   */
  private getToken(): string | null {

    return localStorage.getItem('token');
  }


  /**
   * Création des en-têtes HTTP nécessaires
   * pour appeler les routes protégées du backend.
   *
   * @returns HttpHeaders contenant le token JWT
   */
  private getHeaders(): HttpHeaders {

    const token = this.getToken();

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }


  // ============================================================
  // CHARGEMENT DES INFORMATIONS DU COMPTE
  // ============================================================

  /**
   * Récupère les informations de l'utilisateur connecté
   * directement depuis le backend.
   *
   * Endpoint :
   *
   * GET /api/users/me
   */
  loadAccountInformation(): void {

    // Vérifie que l'utilisateur possède bien un token.
    const token = this.getToken();

    if (!token) {

      this.accountErrorMessage =
        'Votre session a expiré. Veuillez vous reconnecter.';

      return;
    }


    // Appel du backend.
    this.http.get<UserAccount>(
      `${this.apiUrl}/users/me`,
      {
        headers: this.getHeaders()
      }
    ).subscribe({

      // --------------------------------------------------------
      // RÉCUPÉRATION RÉUSSIE
      // --------------------------------------------------------

      next: (user) => {

        // Mise à jour des informations affichées.
        this.firstName = user.prenom;
        this.lastName = user.nom;
        this.email = user.email;


        // Préremplit le formulaire de modification.
        this.accountForm.patchValue({
          prenom: user.prenom,
          nom: user.nom,
          email: user.email
        });


        // Synchronise les informations dans le localStorage.
        localStorage.setItem('prenom', user.prenom);
        localStorage.setItem('nom', user.nom);
        localStorage.setItem('email', user.email);


        // Efface l'ancienne erreur.
        this.accountErrorMessage = '';
      },


      // --------------------------------------------------------
      // ERREUR
      // --------------------------------------------------------

      error: (error) => {

        console.error(
          'Erreur lors du chargement du compte :',
          error
        );


        // Si le token est expiré ou invalide,
        // on redirige vers la connexion.
        if (
          error.status === 401 ||
          error.status === 403
        ) {

          localStorage.removeItem('token');

          this.router.navigate(['/login']);

          return;
        }


        this.accountErrorMessage =
          error.error?.message ||
          'Impossible de récupérer les informations de votre compte.';
      }
    });
  }


  // ============================================================
  // OUVRIR LA MODIFICATION DU COMPTE
  // ============================================================

  /**
   * Affiche le formulaire de modification
   * des informations du compte.
   */
  openEditAccount(): void {

    // Préremplit le formulaire avec les informations actuelles.
    this.accountForm.patchValue({
      prenom: this.firstName,
      nom: this.lastName,
      email: this.email
    });


    // Efface les anciens messages.
    this.accountErrorMessage = '';
    this.accountSuccessMessage = '';


    // Affiche le formulaire.
    this.showEditAccountForm = true;
  }


  // ============================================================
  // ANNULER LA MODIFICATION DU COMPTE
  // ============================================================

  /**
   * Ferme le formulaire de modification
   * sans enregistrer les changements.
   */
  cancelEditAccount(): void {

    // Ferme le formulaire.
    this.showEditAccountForm = false;


    // Efface les messages.
    this.accountErrorMessage = '';
    this.accountSuccessMessage = '';


    // Restaure les valeurs actuelles.
    this.accountForm.patchValue({
      prenom: this.firstName,
      nom: this.lastName,
      email: this.email
    });
  }


  // ============================================================
  // MODIFICATION DES INFORMATIONS DU COMPTE
  // ============================================================

  /**
   * Enregistre les nouvelles informations du compte.
   *
   * Endpoint :
   *
   * PUT /api/users/me
   */
  updateAccountInformation(): void {

    // Efface les anciens messages.
    this.accountErrorMessage = '';
    this.accountSuccessMessage = '';


    // Vérifie que le formulaire est valide.
    if (this.accountForm.invalid) {

      // Affiche les erreurs de validation.
      this.accountForm.markAllAsTouched();

      return;
    }


    // Récupération des valeurs saisies.
    const formValue = this.accountForm.value;


    // Vérifie que le token existe.
    const token = this.getToken();

    if (!token) {

      this.accountErrorMessage =
        'Votre session a expiré. Veuillez vous reconnecter.';

      return;
    }


    // Indique qu'une modification est en cours.
    this.isUpdatingAccount = true;


    // Envoie les nouvelles informations au backend.
    this.http.put<UserAccount>(
      `${this.apiUrl}/users/me`,
      {
        prenom: formValue.prenom.trim(),
        nom: formValue.nom.trim(),
        email: formValue.email.trim()
      },
      {
        headers: this.getHeaders()
      }
    ).subscribe({

      // --------------------------------------------------------
      // MODIFICATION RÉUSSIE
      // --------------------------------------------------------

      next: (user) => {

        // La modification est terminée.
        this.isUpdatingAccount = false;


        // Mise à jour des informations affichées.
        this.firstName = user.prenom;
        this.lastName = user.nom;
        this.email = user.email;


        // Mise à jour du formulaire.
        this.accountForm.patchValue({
          prenom: user.prenom,
          nom: user.nom,
          email: user.email
        });


        // Synchronisation avec le localStorage.
        localStorage.setItem('prenom', user.prenom);
        localStorage.setItem('nom', user.nom);
        localStorage.setItem('email', user.email);


        // Ferme le formulaire.
        this.showEditAccountForm = false;


        // Message de réussite.
        this.accountSuccessMessage =
          'Vos informations ont été modifiées avec succès.';
      },


      // --------------------------------------------------------
      // ERREUR
      // --------------------------------------------------------

      error: (error) => {

        this.isUpdatingAccount = false;


        console.error(
          'Erreur lors de la modification du compte :',
          error
        );


        // Gestion de session expirée.
        if (
          error.status === 401 ||
          error.status === 403
        ) {

          localStorage.removeItem('token');

          this.router.navigate(['/login']);

          return;
        }


        // Message retourné par le backend.
        this.accountErrorMessage =
          error.error?.message ||
          'Impossible de modifier les informations de votre compte.';
      }
    });
  }


  // ============================================================
  // VALIDATION DU MOT DE PASSE
  // ============================================================

  /**
   * Vérifie que le nouveau mot de passe
   * et sa confirmation sont identiques.
   *
   * @returns true si les deux mots de passe correspondent
   */
  passwordsMatch(): boolean {

    const newPassword =
      this.passwordForm.get('newPassword')?.value;

    const confirmPassword =
      this.passwordForm.get('confirmPassword')?.value;


    return newPassword === confirmPassword;
  }


  /**
   * Vérifie si le nouveau mot de passe respecte
   * toutes les règles de sécurité.
   *
   * Règles :
   *
   * - minimum 8 caractères ;
   * - une minuscule ;
   * - une majuscule ;
   * - un chiffre ;
   * - un caractère spécial.
   *
   * @returns true si toutes les règles sont respectées
   */
  isPasswordSecure(): boolean {

    const password =
      this.passwordForm.get('newPassword')?.value;


    if (!password) {
      return false;
    }


    // Vérifie les différentes règles de sécurité.
    const hasMinimumLength =
      password.length >= 8;

    const hasLowercase =
      /[a-z]/.test(password);

    const hasUppercase =
      /[A-Z]/.test(password);

    const hasNumber =
      /\d/.test(password);

    const hasSpecialCharacter =
      /[@$!%*?&]/.test(password);


    // Le mot de passe est valide uniquement
    // si toutes les règles sont respectées.
    return (
      hasMinimumLength &&
      hasLowercase &&
      hasUppercase &&
      hasNumber &&
      hasSpecialCharacter
    );
  }


  // ============================================================
  // CHANGEMENT DU MOT DE PASSE
  // ============================================================

  /**
   * Traite le formulaire de changement de mot de passe.
   *
   * Pour le moment, cette méthode effectue les validations
   * côté frontend.
   *
   * IMPORTANT :
   * Le changement réel du mot de passe devra également
   * être vérifié côté backend.
   */
  changePassword(): void {

    // Réinitialise les messages précédents.
    this.successMessage = '';
    this.errorMessage = '';


    // Vérifie les champs obligatoires et les validateurs Angular.
    if (this.passwordForm.invalid) {

      this.passwordForm.markAllAsTouched();

      this.errorMessage =
        'Veuillez respecter toutes les règles de sécurité du mot de passe.';

      return;
    }


    // Vérifie une deuxième fois les règles de sécurité.
    if (!this.isPasswordSecure()) {

      this.errorMessage =
        'Le mot de passe doit contenir au minimum 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.';

      return;
    }


    // Vérifie que les deux nouveaux mots de passe correspondent.
    if (!this.passwordsMatch()) {

      this.errorMessage =
        'Les deux nouveaux mots de passe ne correspondent pas.';

      return;
    }


    // Indique qu'une opération est en cours.
    this.isLoading = true;


    /*
     * TODO :
     *
     * Le changement réel du mot de passe devra être envoyé
     * au backend avec un endpoint sécurisé.
     *
     * Exemple :
     *
     * PUT /api/users/me/password
     *
     * Le backend devra :
     *
     * 1. vérifier le mot de passe actuel ;
     * 2. vérifier les règles de sécurité ;
     * 3. chiffrer le nouveau mot de passe avec BCrypt ;
     * 4. enregistrer le nouveau mot de passe.
     *
     * Pour le moment, le backend de changement de mot de passe
     * n'est pas encore implémenté.
     */


    // Simulation temporaire de l'opération.
    setTimeout(() => {

      this.isLoading = false;

      this.successMessage =
        'Le nouveau mot de passe respecte les règles de sécurité.';

      // Réinitialise le formulaire.
      this.resetPasswordForm();

    }, 500);
  }


  // ============================================================
  // RÉINITIALISATION DU FORMULAIRE DE MOT DE PASSE
  // ============================================================

  /**
   * Réinitialise le formulaire de changement de mot de passe.
   */
  resetPasswordForm(): void {

    this.passwordForm.reset();
  }


  // ============================================================
  // OUVRIR LE FORMULAIRE DE SUPPRESSION
  // ============================================================

  /**
   * Affiche le formulaire de suppression.
   */
  openDeleteForm(): void {

    this.showDeleteForm = true;

    this.deleteErrorMessage = '';
  }


  // ============================================================
  // ANNULER LA SUPPRESSION
  // ============================================================

  /**
   * Ferme le formulaire de suppression
   * sans effectuer aucune action.
   */
  cancelDeleteForm(): void {

    this.showDeleteForm = false;

    this.deleteErrorMessage = '';

    this.deleteAccountForm.reset({
      deletionReason: '',
      deletionDetails: '',
      confirmation: false,
      deletionPassword: ''
    });
  }


  // ============================================================
  // DEMANDE DE SUPPRESSION DU COMPTE
  // ============================================================

  /**
   * Envoie la demande de suppression du compte
   * vers le backend Spring Boot.
   */
  requestAccountDeletion(): void {

    // Efface l'ancien message d'erreur.
    this.deleteErrorMessage = '';


    // Vérifie que les champs obligatoires sont valides.
    if (this.deleteAccountForm.invalid) {

      this.deleteAccountForm.markAllAsTouched();

      this.deleteErrorMessage =
        'Veuillez compléter les informations obligatoires.';

      return;
    }


    // Récupère les données saisies.
    const formValue =
      this.deleteAccountForm.value;


    // Récupère le token JWT.
    const token =
      localStorage.getItem('token');


    // Vérifie que le token existe.
    if (!token) {

      this.deleteErrorMessage =
        'Votre session a expiré. Veuillez vous reconnecter.';

      return;
    }


    // Création des en-têtes HTTP.
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });


    // Indique que la suppression est en cours.
    this.isDeleting = true;


    // Envoie la requête DELETE vers le backend.
    this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/account`,
      {
        headers,
        body: {
          deletionReason: formValue.deletionReason,
          deletionDetails: formValue.deletionDetails,
          confirmation: formValue.confirmation,
          deletionPassword: formValue.deletionPassword
        }
      }
    ).subscribe({

      // --------------------------------------------------------
      // SUPPRESSION RÉUSSIE
      // --------------------------------------------------------

      next: (response) => {

        this.isDeleting = false;

        this.successMessage =
          response.message ||
          'Votre compte a été supprimé avec succès.';


        // Supprime les informations de session
        // enregistrées dans le navigateur.
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('email');
        localStorage.removeItem('role');
        localStorage.removeItem('prenom');
        localStorage.removeItem('nom');
        localStorage.removeItem('userName');


        // Ferme le formulaire de suppression.
        this.showDeleteForm = false;


        // Redirige vers la page d'accueil.
        this.router.navigate(['/home']);
      },


      // --------------------------------------------------------
      // ERREUR
      // --------------------------------------------------------

      error: (error) => {

        this.isDeleting = false;


        if (error.error?.message) {

          this.deleteErrorMessage =
            error.error.message;

        } else {

          this.deleteErrorMessage =
            'Une erreur est survenue lors de la suppression de votre compte.';
        }
      }
    });
  }
}