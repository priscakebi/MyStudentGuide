import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  HttpClient,
  HttpHeaders,
  HttpParams
} from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';


/**
 * ============================================================
 * INTERFACE USER
 * ============================================================
 *
 * Représente un utilisateur récupéré depuis l'API.
 *
 * Cette interface contient les informations nécessaires
 * pour afficher et gérer les utilisateurs dans l'administration.
 */
interface User {

  /**
   * Identifiant unique de l'utilisateur.
   */
  id: number;

  /**
   * Nom de famille de l'utilisateur.
   */
  nom: string;

  /**
   * Prénom de l'utilisateur.
   */
  prenom: string;

  /**
   * Adresse e-mail de l'utilisateur.
   */
  email: string;

  /**
   * Rôle de l'utilisateur.
   *
   * Valeurs possibles :
   *
   * - ADMIN
   * - ETUDIANT
   */
  role: string;

  /**
   * Date de création du compte.
   */
  createdAt?: string;

  /**
   * Date de dernière modification du compte.
   */
  updatedAt?: string;
}


/**
 * ============================================================
 * INTERFACE DEMARCHE
 * ============================================================
 *
 * Représente une démarche générale créée par l'administrateur.
 *
 * Exemple :
 *
 * "Renouvellement du titre de séjour"
 * "Demande de logement CROUS"
 * "Inscription à la sécurité sociale"
 */
interface Demarche {

  /**
   * Identifiant unique de la démarche.
   */
  id: number;

  /**
   * Titre de la démarche.
   */
  titre: string;

  /**
   * Description de la démarche.
   */
  description?: string;

  /**
   * Date de création de la démarche.
   */
  dateCreation?: string;

  /**
   * Date limite éventuelle de la démarche.
   */
  dateLimite?: string;
}


/**
 * ============================================================
 * INTERFACE STUDENT DEMARCHE
 * ============================================================
 *
 * Représente une démarche qui a été réellement attribuée
 * à un étudiant.
 *
 * Elle correspond à l'entité StudentDemarche du backend.
 */
interface StudentDemarche {

  /**
   * Identifiant unique de l'association
   * étudiant / démarche.
   */
  id: number;

  /**
   * Démarche générale associée.
   */
  demarche: Demarche;

  /**
   * Statut actuel de la démarche.
   *
   * Exemple :
   *
   * - A_FAIRE
   * - EN_COURS
   * - TERMINEE
   * - NON_CONCERNEE
   */
  statut: string;

  /**
   * Date à laquelle la démarche a été attribuée.
   */
  dateAttribution?: string;

  /**
   * Date à laquelle la démarche a été terminée.
   */
  dateTerminaison?: string;

  /**
   * Commentaire éventuel de l'étudiant.
   */
  commentaire?: string;
}


/**
 * ============================================================
 * COMPOSANT USERS ADMIN
 * ============================================================
 *
 * Composant responsable de la gestion des utilisateurs
 * dans l'espace d'administration.
 *
 * Fonctionnalités :
 *
 * - récupérer la liste des utilisateurs ;
 * - afficher les utilisateurs ;
 * - supprimer un utilisateur ;
 * - actualiser la liste ;
 * - sélectionner un étudiant ;
 * - récupérer ses démarches ;
 * - récupérer les démarches disponibles ;
 * - attribuer une démarche à l'étudiant ;
 * - éviter de proposer une démarche déjà attribuée.
 */
@Component({

  /**
   * Sélecteur du composant.
   */
  selector: 'app-users-admin',

  /**
   * Le composant est autonome.
   */
  standalone: true,

  /**
   * Modules Angular nécessaires au HTML.
   */
  imports: [
    CommonModule,
    FormsModule
  ],

  /**
   * Fichier HTML associé au composant.
   */
  templateUrl: './users-admin.html',

  /**
   * Fichier SCSS associé au composant.
   */
  styleUrl: './users-admin.scss'

})
export class UsersAdmin implements OnInit {


  /**
   * ============================================================
   * URL DE L'API
   * ============================================================
   *
   * URL principale de notre API Spring Boot.
   */
  private apiUrl =
    environment.apiUrl;


  /**
   * ============================================================
   * UTILISATEURS
   * ============================================================
   *
   * Liste de tous les utilisateurs récupérés
   * depuis l'API.
   */
  users: User[] = [];


  /**
   * ============================================================
   * DEMARCHES DISPONIBLES
   * ============================================================
   *
   * Liste de toutes les démarches générales
   * créées par l'administration.
   *
   * Cette liste sert à alimenter le choix de démarche
   * lors de l'attribution à un étudiant.
   */
  demarches: Demarche[] = [];


  /**
   * ============================================================
   * DEMARCHES DE L'ETUDIANT
   * ============================================================
   *
   * Liste des démarches déjà attribuées à l'étudiant
   * actuellement sélectionné.
   */
  studentDemarches: StudentDemarche[] = [];


  /**
   * ============================================================
   * ETUDIANT SELECTIONNE
   * ============================================================
   *
   * Contient l'étudiant pour lequel l'administrateur
   * souhaite gérer les démarches.
   *
   * Si la valeur est null, aucun étudiant n'est sélectionné.
   */
  selectedStudent: User | null = null;


  /**
   * ============================================================
   * DEMARCHE SELECTIONNEE
   * ============================================================
   *
   * Contient l'identifiant de la démarche choisie
   * dans le formulaire d'attribution.
   *
   * null signifie qu'aucune démarche n'a encore été choisie.
   */
  selectedDemarcheId: number | null = null;


  /**
   * ============================================================
   * IDENTIFIANT DU PROFIL ETUDIANT
   * ============================================================
   *
   * L'utilisateur possède un identifiant de compte.
   *
   * Pour attribuer une démarche, le backend attend
   * cependant l'identifiant du StudentProfile.
   *
   * Cette propriété permet de conserver cet identifiant
   * une fois récupéré depuis l'API.
   */
  selectedStudentProfileId: number | null = null;


  /**
   * ============================================================
   * ETAT DE CHARGEMENT GENERAL
   * ============================================================
   *
   * Indique si la liste des utilisateurs est en cours
   * de chargement.
   */
  loading = false;


  /**
   * ============================================================
   * ETAT DE CHARGEMENT DES DEMARCHES
   * ============================================================
   *
   * Permet d'afficher un état de chargement séparé
   * lorsqu'on récupère les démarches d'un étudiant.
   */
  loadingStudentDemarches = false;


  /**
   * ============================================================
   * ETAT D'ATTRIBUTION
   * ============================================================
   *
   * Indique si une démarche est actuellement
   * en cours d'attribution.
   */
  assigningDemarche = false;


  /**
   * ============================================================
   * MESSAGE D'ERREUR
   * ============================================================
   *
   * Message affiché lorsqu'une opération échoue.
   */
  errorMessage = '';


  /**
   * ============================================================
   * MESSAGE DE SUCCES
   * ============================================================
   *
   * Message affiché après une opération réussie.
   */
  successMessage = '';


  /**
   * ============================================================
   * CONSTRUCTEUR
   * ============================================================
   *
   * Injection des services Angular.
   *
   * HttpClient :
   * permet de communiquer avec l'API Spring Boot.
   *
   * Router :
   * permet d'effectuer les redirections.
   *
   * @param http service HTTP Angular
   * @param router service Angular pour la navigation
   */
  constructor(
    private http: HttpClient,
    private router: Router
  ) { }


  /**
   * ============================================================
   * INITIALISATION DU COMPOSANT
   * ============================================================
   *
   * Cette méthode est exécutée automatiquement
   * lorsque la page est chargée.
   */
  ngOnInit(): void {

    /**
     * Chargement de la liste des utilisateurs.
     */
    this.loadUsers();


    /**
     * Chargement de la liste des démarches générales.
     *
     * Ces démarches seront utilisées plus tard
     * pour permettre à l'administrateur d'en attribuer
     * une à un étudiant.
     */
    this.loadDemarches();

  }


  /**
   * ============================================================
   * HEADERS HTTP
   * ============================================================
   *
   * Construit les headers nécessaires pour communiquer
   * avec les endpoints protégés du backend.
   *
   * Le JWT enregistré dans localStorage est envoyé
   * dans l'en-tête Authorization.
   *
   * @returns les headers HTTP
   */
  private getHeaders(): HttpHeaders {

    /**
     * Récupération du token JWT.
     */
    const token = localStorage.getItem('token');


    /**
     * Création des headers.
     */
    return new HttpHeaders({

      /**
       * Indique que nous envoyons du JSON.
       */
      'Content-Type': 'application/json',

      /**
       * Envoie le token JWT à Spring Security.
       */
      'Authorization': `Bearer ${token}`

    });

  }


  /**
   * ============================================================
   * CHARGER LES UTILISATEURS
   * ============================================================
   *
   * Endpoint :
   *
   * GET /api/users
   *
   * Récupère tous les utilisateurs enregistrés.
   */
  loadUsers(): void {

    /**
     * Activation du chargement.
     */
    this.loading = true;


    /**
     * Réinitialisation des messages.
     */
    this.errorMessage = '';
    this.successMessage = '';


    /**
     * Appel de l'API.
     */
    this.http.get<User[]>(

      `${this.apiUrl}/users`,

      {
        headers: this.getHeaders()
      }

    ).subscribe({

      /**
       * Requête réussie.
       */
      next: (response) => {

        /**
         * Stockage des utilisateurs.
         */
        this.users = response;


        /**
         * Fin du chargement.
         */
        this.loading = false;

      },


      /**
       * Erreur lors de la récupération.
       */
      error: (error) => {

        /**
         * Affichage de l'erreur dans la console.
         */
        console.error(
          'Erreur lors du chargement des utilisateurs :',
          error
        );


        /**
         * Message affiché dans l'interface.
         */
        this.errorMessage =
          'Impossible de charger les utilisateurs.';


        /**
         * Fin du chargement.
         */
        this.loading = false;

      }

    });

  }


  /**
   * ============================================================
   * CHARGER LES DEMARCHES
   * ============================================================
   *
   * Endpoint :
   *
   * GET /api/demarches
   *
   * Récupère toutes les démarches générales disponibles
   * dans l'application.
   *
   * Ces démarches sont celles que l'administrateur
   * pourra attribuer aux étudiants.
   */
  loadDemarches(): void {

    /**
     * Appel GET vers l'API.
     */
    this.http.get<Demarche[]>(

      `${this.apiUrl}/demarches`,

      {
        headers: this.getHeaders()
      }

    ).subscribe({

      /**
       * Requête réussie.
       */
      next: (response) => {

        /**
         * Stockage des démarches.
         */
        this.demarches = response;

      },


      /**
       * Erreur lors du chargement.
       */
      error: (error) => {

        /**
         * Affichage de l'erreur dans la console.
         */
        console.error(
          'Erreur lors du chargement des démarches :',
          error
        );


        /**
         * Message affiché à l'administrateur.
         */
        this.errorMessage =
          'Impossible de charger les démarches disponibles.';

      }

    });

  }


  /**
   * ============================================================
   * SELECTIONNER UN ETUDIANT
   * ============================================================
   *
   * Cette méthode est appelée lorsque l'administrateur
   * souhaite gérer les démarches d'un étudiant.
   *
   * @param user utilisateur sélectionné
   */
  selectStudent(user: User): void {

    /**
     * On vérifie que l'utilisateur est bien un étudiant.
     */
    if (
      user.role !== 'ETUDIANT' &&
      user.role !== 'ROLE_ETUDIANT'
    ) {

      /**
       * Un administrateur ne peut pas recevoir
       * de démarche étudiante.
       */
      return;

    }


    /**
     * Stockage de l'étudiant sélectionné.
     */
    this.selectedStudent = user;


    /**
     * Réinitialisation de la démarche sélectionnée.
     */
    this.selectedDemarcheId = null;


    /**
     * Réinitialisation de l'ancien profil étudiant.
     */
    this.selectedStudentProfileId = null;


    /**
     * Réinitialisation des démarches affichées.
     */
    this.studentDemarches = [];


    /**
     * Réinitialisation des messages.
     */
    this.errorMessage = '';
    this.successMessage = '';


    /**
     * Récupération du profil étudiant.
     */
    this.loadStudentProfile(user.id);

  }


  /**
   * ============================================================
   * CHARGER LE PROFIL ETUDIANT
   * ============================================================
   *
   * Endpoint utilisé :
   *
   * GET /api/student-profiles/user/{userId}
   *
   * Le backend possède déjà cette route.
   *
   * Elle permet de récupérer le StudentProfile
   * correspondant au compte utilisateur sélectionné.
   *
   * @param userId identifiant du compte utilisateur
   */
  loadStudentProfile(userId: number): void {

    /**
     * Appel vers l'API.
     */
    this.http.get<any>(

      `${this.apiUrl}/student-profiles/user/${userId}`,

      {
        headers: this.getHeaders()
      }

    ).subscribe({

      /**
       * Profil trouvé.
       */
      next: (profile) => {

        /**
         * Vérification de la présence de l'identifiant
         * du profil étudiant.
         */
        if (!profile || !profile.id) {

          this.errorMessage =
            'Cet étudiant ne possède pas encore de profil étudiant.';

          this.selectedStudentProfileId = null;
          this.studentDemarches = [];

          return;
        }


        /**
         * Stockage de l'identifiant du profil étudiant.
         */
        this.selectedStudentProfileId = profile.id;


        /**
         * Une fois le profil trouvé,
         * on récupère ses démarches.
         */
        this.loadStudentDemarches(profile.id);

      },


      /**
       * Erreur lors de la récupération du profil.
       */
      error: (error) => {

        /**
         * Affichage de l'erreur dans la console.
         */
        console.error(
          'Erreur lors de la récupération du profil étudiant :',
          error
        );


        /**
         * Réinitialisation des données.
         */
        this.selectedStudentProfileId = null;
        this.studentDemarches = [];


        /**
         * Message affiché à l'administrateur.
         */
        this.errorMessage =
          'Impossible de récupérer le profil de cet étudiant.';

      }

    });

  }


  /**
   * ============================================================
   * CHARGER LES DEMARCHES DE L'ETUDIANT
   * ============================================================
   *
   * Endpoint :
   *
   * GET /api/student-demarches/student/{studentProfileId}
   *
   * Permet de récupérer uniquement les démarches
   * réellement attribuées à l'étudiant.
   *
   * @param studentProfileId identifiant du profil étudiant
   */
  loadStudentDemarches(studentProfileId: number): void {

    /**
     * Activation du chargement.
     */
    this.loadingStudentDemarches = true;


    /**
     * Appel vers l'API.
     */
    this.http.get<StudentDemarche[]>(

      `${this.apiUrl}/student-demarches/student/${studentProfileId}`,

      {
        headers: this.getHeaders()
      }

    ).subscribe({

      /**
       * Requête réussie.
       */
      next: (response) => {

        /**
         * Stockage des démarches attribuées.
         */
        this.studentDemarches = response ?? [];


        /**
         * Fin du chargement.
         */
        this.loadingStudentDemarches = false;

      },


      /**
       * Erreur lors du chargement.
       */
      error: (error) => {

        /**
         * Affichage de l'erreur.
         */
        console.error(
          'Erreur lors du chargement des démarches de l’étudiant :',
          error
        );


        /**
         * Réinitialisation de la liste.
         */
        this.studentDemarches = [];


        /**
         * Message affiché.
         */
        this.errorMessage =
          'Impossible de charger les démarches de cet étudiant.';


        /**
         * Fin du chargement.
         */
        this.loadingStudentDemarches = false;

      }

    });

  }


  /**
   * ============================================================
   * DEMARCHES DISPONIBLES POUR L'ETUDIANT
   * ============================================================
   *
   * Retourne uniquement les démarches que l'étudiant
   * sélectionné n'a pas encore commencées.
   *
   * Inutile de suggérer une démarche déjà en cours ou terminée.
   */
  get availableDemarches(): Demarche[] {

    /**
     * Si aucun étudiant n'est sélectionné,
     * aucune démarche ne peut être proposée.
     */
    if (!this.selectedStudent) {
      return [];
    }


    /**
     * Création d'une liste contenant les IDs
     * des démarches déjà commencées.
     */
    const assignedDemarcheIds =
      this.studentDemarches
        .filter(
          studentDemarche =>
            studentDemarche.statut === 'EN_COURS' ||
            studentDemarche.statut === 'TERMINEE'
        )
        .map(
          studentDemarche => studentDemarche.demarche.id
        );


    /**
     * Retourne uniquement les démarches
     * dont l'identifiant n'est pas déjà présent.
     */
    return this.demarches.filter(
      demarche =>
        !assignedDemarcheIds.includes(demarche.id)
    );

  }


  /**
   * ============================================================
   * SUGGÉRER UNE DEMARCHE
   * ============================================================
   *
   * Les démarches ne sont plus attribuées : l'étudiant reçoit
   * une notification de suggestion (boutons « Voir plus » et
   * « Commencer »). Aucun suivi n'est créé tant qu'il n'a pas
   * cliqué sur « Commencer ».
   *
   * Endpoint :
   *
   * POST /api/student-demarches/suggest
   * ?studentProfileId=1&demarcheId=5
   *
   * @param demarcheId identifiant de la démarche
   */
  suggererDemarche(demarcheId: number | null): void {

    /**
     * Vérification de l'étudiant sélectionné.
     */
    if (!this.selectedStudent) {

      this.errorMessage =
        'Veuillez sélectionner un étudiant.';

      return;
    }


    /**
     * Vérification du profil étudiant.
     */
    if (!this.selectedStudentProfileId) {

      this.errorMessage =
        'Cet étudiant ne possède pas de profil étudiant.';

      return;
    }


    /**
     * Vérification de la démarche sélectionnée.
     */
    if (!demarcheId) {

      this.errorMessage =
        'Veuillez sélectionner une démarche.';

      return;
    }


    /**
     * Activation de l'état d'attribution.
     */
    this.assigningDemarche = true;


    /**
     * Suppression des anciens messages.
     */
    this.errorMessage = '';
    this.successMessage = '';


    /**
     * Construction des paramètres HTTP.
     *
     * Le backend utilise @RequestParam.
     *
     * Nous devons donc envoyer :
     *
     * studentProfileId
     * demarcheId
     */
    const params = new HttpParams()
      .set(
        'studentProfileId',
        this.selectedStudentProfileId
      )
      .set(
        'demarcheId',
        demarcheId
      );


    /**
     * Appel POST vers le backend.
     *
     * Le corps de la requête est vide.
     *
     * Les deux paramètres sont envoyés
     * dans l'URL sous forme de query parameters.
     */
    this.http.post(

      `${this.apiUrl}/student-demarches/suggest`,

      {},

      {
        headers: this.getHeaders(),
        params
      }

    ).subscribe({

      /**
       * Suggestion envoyée.
       */
      next: () => {

        /**
         * Message de confirmation.
         */
        this.successMessage =
          'La suggestion a été envoyée à l’étudiant.';


        /**
         * Réinitialisation de la sélection.
         */
        this.selectedDemarcheId = null;


        /**
         * Fin de l'état d'envoi.
         */
        this.assigningDemarche = false;

      },


      /**
       * Erreur lors de l'envoi.
       */
      error: (error) => {

        /**
         * Affichage de l'erreur dans la console.
         */
        console.error(
          'Erreur lors de la suggestion de la démarche :',
          error
        );


        /**
         * Message affiché à l'administrateur
         * (ex. : « déjà commencée », « déjà suggérée »).
         */
        this.errorMessage =
          error.error?.message ||
          'Impossible d’envoyer cette suggestion.';


        /**
         * Fin de l'état d'attribution.
         */
        this.assigningDemarche = false;

      }

    });

  }


  /**
   * ============================================================
   * SUPPRIMER UNE DEMARCHE ATTRIBUEE
   * ============================================================
   *
   * Endpoint :
   *
   * DELETE /api/student-demarches/{id}
   *
   * Cette méthode permet à l'administrateur
   * de retirer une démarche de l'étudiant.
   *
   * IMPORTANT :
   *
   * Cela supprime uniquement l'association
   * étudiant / démarche.
   *
   * La démarche générale reste disponible.
   *
   * @param studentDemarche démarche attribuée
   */
  deleteStudentDemarche(
    studentDemarche: StudentDemarche
  ): void {

    /**
     * Vérification de l'identifiant.
     */
    if (!studentDemarche.id) {

      this.errorMessage =
        'Impossible de supprimer cette démarche.';

      return;
    }


    /**
     * Demande de confirmation.
     */
    const confirmation = confirm(
      `Voulez-vous retirer la démarche "${studentDemarche.demarche.titre}" de cet étudiant ?`
    );


    /**
     * Si l'administrateur annule,
     * aucune requête n'est envoyée.
     */
    if (!confirmation) {
      return;
    }


    /**
     * Réinitialisation des messages.
     */
    this.errorMessage = '';
    this.successMessage = '';


    /**
     * Appel DELETE vers l'API.
     */
    this.http.delete(

      `${this.apiUrl}/student-demarches/${studentDemarche.id}`,

      {
        headers: this.getHeaders()
      }

    ).subscribe({

      /**
       * Suppression réussie.
       */
      next: () => {

        /**
         * Retire la démarche du tableau local.
         */
        this.studentDemarches =
          this.studentDemarches.filter(
            currentDemarche =>
              currentDemarche.id !== studentDemarche.id
          );


        /**
         * Message de confirmation.
         */
        this.successMessage =
          'La démarche a été retirée de l’étudiant.';

      },


      /**
       * Erreur lors de la suppression.
       */
      error: (error) => {

        /**
         * Affichage de l'erreur.
         */
        console.error(
          'Erreur lors de la suppression de la démarche :',
          error
        );


        /**
         * Message affiché à l'administrateur.
         */
        this.errorMessage =
          'Impossible de retirer cette démarche de l’étudiant.';

      }

    });

  }


  /**
   * ============================================================
   * FERMER LA GESTION D'UN ETUDIANT
   * ============================================================
   *
   * Réinitialise toutes les données liées
   * à l'étudiant sélectionné.
   */
  closeStudentManagement(): void {

    /**
     * Aucun étudiant sélectionné.
     */
    this.selectedStudent = null;


    /**
     * Suppression du profil sélectionné.
     */
    this.selectedStudentProfileId = null;


    /**
     * Suppression de la démarche sélectionnée.
     */
    this.selectedDemarcheId = null;


    /**
     * Vidage des démarches.
     */
    this.studentDemarches = [];


    /**
     * Suppression des messages.
     */
    this.errorMessage = '';
    this.successMessage = '';

  }


  /**
   * ============================================================
   * SUPPRIMER UN UTILISATEUR
   * ============================================================
   *
   * Endpoint :
   *
   * DELETE /api/users/{id}
   *
   * @param user utilisateur à supprimer
   */
  deleteUser(user: User): void {

    /**
     * Demande de confirmation.
     */
    const confirmation = confirm(
      `Voulez-vous vraiment supprimer le compte de ${user.prenom} ${user.nom} ?`
    );


    /**
     * Si l'administrateur annule,
     * aucune requête n'est envoyée.
     */
    if (!confirmation) {
      return;
    }


    /**
     * Réinitialisation des messages.
     */
    this.errorMessage = '';
    this.successMessage = '';


    /**
     * Appel DELETE vers l'API.
     */
    this.http.delete(

      `${this.apiUrl}/users/${user.id}`,

      {
        headers: this.getHeaders()
      }

    ).subscribe({

      /**
       * Suppression réussie.
       */
      next: () => {

        /**
         * Suppression immédiate du tableau local.
         */
        this.users =
          this.users.filter(
            currentUser =>
              currentUser.id !== user.id
          );


        /**
         * Si l'utilisateur supprimé
         * était actuellement sélectionné,
         * on ferme sa gestion.
         */
        if (
          this.selectedStudent &&
          this.selectedStudent.id === user.id
        ) {

          this.closeStudentManagement();

        }


        /**
         * Message de confirmation.
         */
        this.successMessage =
          'Utilisateur supprimé avec succès.';

      },


      /**
       * Erreur lors de la suppression.
       */
      error: (error) => {

        /**
         * Affichage de l'erreur.
         */
        console.error(
          "Erreur lors de la suppression de l'utilisateur :",
          error
        );


        /**
         * Message affiché.
         */
        this.errorMessage =
          'Impossible de supprimer cet utilisateur.';

      }

    });

  }


  /**
   * ============================================================
   * ACTUALISER LES UTILISATEURS
   * ============================================================
   *
   * Recharge la liste des utilisateurs.
   */
  refreshUsers(): void {

    /**
     * Recharge les utilisateurs.
     */
    this.loadUsers();


    /**
     * Recharge également les démarches générales.
     *
     * Cela permet de prendre en compte une éventuelle
     * nouvelle démarche créée par l'administrateur.
     */
    this.loadDemarches();


    /**
     * Si un étudiant est actuellement sélectionné
     * et possède un profil, on recharge également
     * ses démarches.
     */
    if (this.selectedStudentProfileId) {

      this.loadStudentDemarches(
        this.selectedStudentProfileId
      );

    }

  }


  /**
   * ============================================================
   * DECONNEXION
   * ============================================================
   *
   * Supprime les informations de session
   * puis redirige vers la page de connexion.
   */
  logout(): void {

    /**
     * Suppression du JWT.
     */
    localStorage.removeItem('token');


    /**
     * Suppression de l'identifiant utilisateur.
     */
    localStorage.removeItem('userId');


    /**
     * Suppression de l'adresse e-mail.
     */
    localStorage.removeItem('email');


    /**
     * Suppression du prénom.
     */
    localStorage.removeItem('prenom');


    /**
     * Suppression du rôle.
     */
    localStorage.removeItem('role');


    /**
     * Redirection vers la connexion.
     */
    this.router.navigate(['/login']);

  }

}