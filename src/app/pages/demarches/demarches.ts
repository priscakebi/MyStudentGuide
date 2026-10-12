// ============================================================
// IMPORTS
// ============================================================

// Permet de créer un composant Angular
// et d'utiliser le cycle de vie OnInit.
import {
  Component,
  OnInit,
  inject
} from '@angular/core';

// Permet d'utiliser les fonctionnalités communes
// d'Angular dans le template.
// NgClass est notamment utilisé pour appliquer
// dynamiquement la classe CSS du statut.
import {
  CommonModule
} from '@angular/common';

// Permet d'effectuer les requêtes HTTP
// vers le backend Spring Boot.
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

// Permet de naviguer vers les différentes
// pages de l'application.
import {
  Router
} from '@angular/router';
import { environment } from '../../../environments/environment';
import { AvisForm } from '../../components/avis-form/avis-form';
import {
  DemarcheStatut,
  StudentDemarcheService
} from '../../services/student-demarche.service';


// ============================================================
// INTERFACES
// ============================================================

/**
 * Représente le profil étudiant récupéré
 * depuis le backend.
 *
 * Pour cette page, nous avons uniquement
 * besoin de l'identifiant du profil.
 */
interface StudentProfile {

  /**
   * Identifiant du profil étudiant.
   *
   * Cet identifiant permet ensuite de récupérer
   * les démarches associées à l'étudiant.
   */
  id: number;
}


/**
 * Représente une démarche attribuée
 * à un étudiant.
 *
 * Cette interface correspond aux données
 * renvoyées par l'API StudentDemarche.
 */
interface StudentDemarche {

  /**
   * Identifiant de l'association entre
   * l'étudiant et la démarche.
   *
   * Exemple :
   *
   * studentDemarche.id = 6
   */
  id: number;


  /**
   * Statut actuel de la démarche
   * pour l'étudiant.
   *
   * Exemples :
   *
   * A_FAIRE
   * EN_COURS
   * TERMINEE
   * NON_CONCERNEE
   */
  statut: DemarcheStatut;

  /** Progression calculée par l'API (0, 25, 50 ou 100). */
  progression?: number;

  /** Vrai si l'étudiant a déjà donné son avis. */
  avisDonne?: boolean;


  /**
   * Informations concernant la démarche générale.
   *
   * La démarche générale est indépendante
   * de l'étudiant.
   *
   * Plusieurs étudiants peuvent donc suivre
   * la même démarche.
   */
  demarche: {

    /**
     * Identifiant de la démarche générale.
     *
     * Cet identifiant est utilisé pour ouvrir
     * la page de détails de la démarche.
     */
    id: number;


    /**
     * Titre de la démarche.
     */
    titre: string;


    /**
     * Description de la démarche.
     */
    description: string;
  };
}


// ============================================================
// COMPOSANT
// ============================================================

/**
 * Composant représentant la page
 * "Mes démarches".
 *
 * Cette page permet à l'étudiant connecté de :
 *
 * - consulter ses démarches ;
 * - voir leur statut ;
 * - ouvrir le détail d'une démarche ;
 * - accéder à son espace de suivi.
 */
@Component({

  /**
   * Sélecteur du composant.
   */
  selector: 'app-demarches',


  /**
   * Le composant fonctionne en mode standalone.
   */
  standalone: true,


  /**
   * Modules nécessaires au template.
   *
   * CommonModule permet notamment d'utiliser
   * [ngClass] dans le HTML.
   */
  imports: [
    CommonModule,
    AvisForm
  ],


  /**
   * Template HTML associé au composant.
   */
  templateUrl: './demarches.html',


  /**
   * Feuille de style associée au composant.
   */
  styleUrl: './demarches.scss'
})
export class Demarches implements OnInit {


  // ============================================================
  // CONFIGURATION
  // ============================================================

  /**
   * URL de base de l'API Spring Boot.
   *
   * Les différentes requêtes de cette page
   * utilisent cette URL.
   */
  private apiUrl = environment.apiUrl;


  // ============================================================
  // DONNÉES
  // ============================================================

  /**
   * Liste des démarches attribuées
   * à l'étudiant connecté.
   *
   * Au démarrage du composant, la liste est vide.
   *
   * Elle est remplie après la réponse
   * du backend.
   */
  studentDemarches: StudentDemarche[] = [];


  /**
   * Indique si les données sont en cours
   * de récupération.
   *
   * true :
   * le chargement est en cours.
   *
   * false :
   * le chargement est terminé.
   */
  isLoading = false;


  /**
   * Message d'erreur à afficher dans l'interface.
   *
   * Une chaîne vide signifie qu'il n'y a
   * actuellement aucune erreur.
   */
  errorMessage = '';

  /** Service partagé (statut, progression, avis). */
  private studentDemarcheService = inject(StudentDemarcheService);

  /** Démarche en cours de mise à jour (évite les doubles clics). */
  updatingId: number | null = null;

  /** Messages affichés après une action. */
  actionMessage = '';
  actionError = '';

  /** Démarche pour laquelle la fenêtre d'avis est ouverte. */
  avisPour: StudentDemarche | null = null;


  // ============================================================
  // CONSTRUCTEUR
  // ============================================================

  /**
   * Injecte les services nécessaires.
   *
   * HttpClient :
   * permet d'appeler l'API Spring Boot.
   *
   * Router :
   * permet de naviguer entre les pages Angular.
   */
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}


  // ============================================================
  // INITIALISATION
  // ============================================================

  /**
   * Méthode exécutée automatiquement
   * lors de l'initialisation du composant.
   *
   * Elle lance le chargement des démarches
   * de l'étudiant connecté.
   */
  ngOnInit(): void {

    this.loadStudentDemarches();
  }


  // ============================================================
  // RÉCUPÉRATION DU TOKEN
  // ============================================================

  /**
   * Récupère le token JWT enregistré
   * dans le localStorage du navigateur.
   *
   * Le token est nécessaire pour authentifier
   * les requêtes envoyées au backend.
   *
   * @returns
   * Le token JWT s'il existe,
   * sinon null.
   */
  private getToken(): string | null {

    return localStorage.getItem('token');
  }


  // ============================================================
  // CHARGEMENT DES DÉMARCHES
  // ============================================================

  /**
   * Récupère les démarches de l'étudiant connecté.
   *
   * Le fonctionnement se fait en deux étapes :
   *
   * 1. récupérer le profil étudiant connecté ;
   *
   * 2. récupérer les démarches associées
   *    à l'identifiant de ce profil.
   */
  loadStudentDemarches(): void {

    // ----------------------------------------------------------
    // INITIALISATION
    // ----------------------------------------------------------

    /**
     * Supprime une éventuelle ancienne erreur.
     */
    this.errorMessage = '';


    /**
     * Active l'indicateur de chargement.
     */
    this.isLoading = true;


    /**
     * Récupère le token JWT.
     */
    const token = this.getToken();


    // ----------------------------------------------------------
    // VÉRIFICATION DU TOKEN
    // ----------------------------------------------------------

    /**
     * Si aucun token n'est présent,
     * l'utilisateur n'est pas authentifié.
     */
    if (!token) {

      /**
       * Le chargement est terminé
       * puisqu'il est impossible de continuer.
       */
      this.isLoading = false;


      /**
       * Message affiché à l'utilisateur.
       */
      this.errorMessage =
        'Votre session a expiré. Veuillez vous reconnecter.';


      return;
    }


    // ----------------------------------------------------------
    // HEADERS HTTP
    // ----------------------------------------------------------

    /**
     * Création des headers HTTP.
     *
     * Le JWT est envoyé dans :
     *
     * Authorization: Bearer <token>
     *
     * Spring Security peut ainsi identifier
     * l'utilisateur connecté.
     */
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });


    // ==========================================================
    // ÉTAPE 1
    // RÉCUPÉRER LE PROFIL ÉTUDIANT
    // ==========================================================

    this.http.get<StudentProfile>(
      `${this.apiUrl}/student-profiles/me`,
      { headers }
    ).subscribe({

      // --------------------------------------------------------
      // SUCCÈS
      // --------------------------------------------------------

      /**
       * Cette fonction est appelée lorsque
       * le backend retourne correctement
       * le profil étudiant.
       */
      next: (profile) => {

        /**
         * Log de diagnostic.
         *
         * Permet de vérifier que le profil
         * arrive correctement dans Angular.
         */


        // ------------------------------------------------------
        // VÉRIFICATION DU PROFIL
        // ------------------------------------------------------

        /**
         * Vérifie que le profil existe
         * et possède un identifiant.
         */
        if (!profile?.id) {

          /**
           * Arrête le chargement.
           */
          this.isLoading = false;


          /**
           * Réinitialise les démarches.
           */
          this.studentDemarches = [];


          /**
           * Message affiché dans l'interface.
           */
          this.errorMessage =
            'Votre profil étudiant est introuvable.';


          return;
        }


        // ======================================================
        // ÉTAPE 2
        // RÉCUPÉRER LES DÉMARCHES
        // ======================================================

        this.http.get<StudentDemarche[]>(
          `${this.apiUrl}/student-demarches/student/${profile.id}`,
          { headers }
        ).subscribe({

          // ----------------------------------------------------
          // SUCCÈS
          // ----------------------------------------------------

          /**
           * Cette fonction est appelée lorsque
           * les démarches ont été récupérées.
           */
          next: (studentDemarches) => {

            /**
             * Log de diagnostic.
             *
             * Permet de vérifier que les démarches
             * arrivent correctement dans Angular.
             */


            // --------------------------------------------------
            // STOCKAGE DES DONNÉES
            // --------------------------------------------------

            /**
             * Stocke les démarches dans la propriété
             * utilisée par le template HTML.
             *
             * Si l'API renvoie null ou undefined,
             * on utilise un tableau vide.
             */
            this.studentDemarches =
              studentDemarches ?? [];


            // --------------------------------------------------
            // FIN DU CHARGEMENT
            // --------------------------------------------------

            /**
             * Les données ont été récupérées.
             *
             * Le template Angular peut maintenant
             * afficher la liste.
             */
            this.isLoading = false;


            /**
             * Log permettant de vérifier l'état final.
             */


            /**
             * Log supplémentaire permettant de vérifier
             * le nombre de démarches reçues.
             */
          },


          // ----------------------------------------------------
          // ERREUR
          // ----------------------------------------------------

          /**
           * Cette fonction est appelée si la requête
           * des démarches échoue.
           */
          error: (error) => {

            /**
             * Affiche l'erreur dans la console
             * pour faciliter le diagnostic.
             */
            console.error(
              '❌ ERREUR LORS DU CHARGEMENT DES DÉMARCHES :',
              error
            );


            /**
             * Arrête le chargement.
             */
            this.isLoading = false;


            /**
             * Réinitialise la liste.
             */
            this.studentDemarches = [];


            /**
             * Message affiché dans l'interface.
             */
            this.errorMessage =
              'Impossible de charger vos démarches.';
          }
        });
      },


      // ========================================================
      // ERREUR DE RÉCUPÉRATION DU PROFIL
      // ========================================================

      /**
       * Cette fonction est appelée si la requête
       * du profil étudiant échoue.
       */
      error: (error) => {

        /**
         * Affiche l'erreur dans la console.
         */
        console.error(
          '❌ ERREUR LORS DE LA RÉCUPÉRATION DU PROFIL :',
          error
        );


        /**
         * Arrête le chargement.
         */
        this.isLoading = false;


        /**
         * Réinitialise les démarches.
         */
        this.studentDemarches = [];


        // ------------------------------------------------------
        // PROFIL NON TROUVÉ
        // ------------------------------------------------------

        /**
         * Un statut HTTP 404 signifie qu'aucun profil
         * étudiant n'a encore été créé.
         */
        if (error.status === 404) {

          return;
        }


        // ------------------------------------------------------
        // AUTRE ERREUR
        // ------------------------------------------------------

        /**
         * Message affiché pour les autres erreurs.
         */
        this.errorMessage =
          'Impossible de récupérer votre profil étudiant.';
      }
    });
  }


  // ============================================================
  // LABEL DU STATUT
  // ============================================================

  /**
   * Transforme le statut technique provenant
   * du backend en texte lisible.
   *
   * Exemples :
   *
   * A_FAIRE
   * → À faire
   *
   * EN_COURS
   * → En cours
   *
   * TERMINEE
   * → Terminée
   *
   * NON_CONCERNEE
   * → Non concernée
   *
   * @param statut
   * Statut reçu depuis l'API.
   *
   * @returns
   * Texte affiché dans l'interface.
   */
  getStatusLabel(statut: string): string {

    switch (statut) {

      case 'A_FAIRE':
        return 'À faire';


      case 'EN_COURS':
        return 'En cours';


      case 'TERMINEE':
        return 'Terminée';


      case 'NON_CONCERNEE':
        return 'Non concernée';


      default:
        return statut;
    }
  }


  // ============================================================
  // CLASSE CSS DU STATUT
  // ============================================================

  /**
   * Retourne la classe CSS correspondant
   * au statut de la démarche.
   *
   * IMPORTANT :
   *
   * Les noms retournés ici correspondent
   * exactement aux classes présentes dans
   * demarches.scss.
   *
   * A_FAIRE
   * → status-a-faire
   *
   * EN_COURS
   * → status-en-cours
   *
   * TERMINEE
   * → status-terminee
   *
   * NON_CONCERNEE
   * → status-non-concernee
   *
   * @param statut
   * Statut reçu depuis le backend.
   *
   * @returns
   * Nom de la classe CSS.
   */
  getStatusClass(statut: string): string {

    switch (statut) {

      case 'A_FAIRE':
        return 'status-a-faire';


      case 'EN_COURS':
        return 'status-en-cours';


      case 'TERMINEE':
        return 'status-terminee';


      case 'NON_CONCERNEE':
        return 'status-non-concernee';


      /**
       * Si le backend retourne un statut inconnu,
       * on utilise par défaut le style "À faire".
       */
      default:
        return 'status-a-faire';
    }
  }


  // ============================================================
  // SUIVRE LES DÉMARCHES
  // ============================================================

  /**
   * Redirige l'étudiant vers son Dashboard.
   *
   * Le Dashboard permet de suivre plus précisément
   * l'évolution de ses démarches.
   */
  suivreMesDemarches(): void {

    this.router.navigate([
      '/dashboard'
    ]);
  }


  // ============================================================
  // COMMENCER UNE DÉMARCHE
  // ============================================================

  /**
   * Bouton « Commencer » / « Continuer ».
   *
   * - À FAIRE  : la démarche passe EN COURS (progression 25 %)
   *              et la carte est mise à jour immédiatement ;
   * - EN COURS : ouvre le suivi détaillé (/dashboard/suivis).
   */
  commencerDemarche(
    studentDemarche: StudentDemarche
  ): void {

    if (studentDemarche.statut !== 'A_FAIRE') {
      this.router.navigate(['/dashboard/suivis']);
      return;
    }

    if (this.updatingId !== null) {
      return;
    }

    this.updatingId = studentDemarche.id;
    this.actionMessage = '';
    this.actionError = '';

    this.studentDemarcheService
      .changerStatut(studentDemarche.id, 'EN_COURS')
      .subscribe({
        next: (updated) => {
          this.updatingId = null;
          studentDemarche.statut = updated?.statut ?? 'EN_COURS';
          studentDemarche.progression = updated?.progression ?? 25;
          this.actionMessage =
            'Démarche commencée ! Suivez votre progression depuis « Mon espace ».';
        },
        error: (error) => {
          this.updatingId = null;
          this.actionError =
            error.error?.message || 'Impossible de commencer cette démarche.';
        }
      });
  }


  // ============================================================
  // DONNER MON AVIS (démarche terminée)
  // ============================================================

  ouvrirAvis(studentDemarche: StudentDemarche): void {
    this.actionMessage = '';
    this.actionError = '';
    this.avisPour = studentDemarche;
  }

  fermerAvis(): void {
    this.avisPour = null;
  }

  onAvisEnregistre(): void {
    if (this.avisPour) {
      this.avisPour.avisDonne = true;
    }
    this.avisPour = null;
    this.actionMessage =
      "Merci ! Votre avis est maintenant visible sur la page d'accueil.";
  }


  // ============================================================
  // VOIR LES DÉTAILS
  // ============================================================

  /**
   * Navigue vers la page de détails
   * de la démarche sélectionnée.
   *
   * IMPORTANT :
   *
   * studentDemarche.id
   * correspond à l'association entre
   * l'étudiant et la démarche.
   *
   * studentDemarche.demarche.id
   * correspond à la démarche générale.
   *
   * Nous utilisons donc :
   *
   * studentDemarche.demarche.id
   *
   * pour construire l'URL.
   *
   * Exemple :
   *
   * studentDemarche.id = 6
   * studentDemarche.demarche.id = 2
   *
   * Navigation :
   *
   * /demarches/2
   */
  voirPlus(
    studentDemarche: StudentDemarche
  ): void {

    /**
     * Affiche l'identifiant utilisé
     * pour la navigation.
     */


    /**
     * Ouvre la page de détail
     * de la démarche générale.
     */
    this.router.navigate([
      '/demarches',
      studentDemarche.demarche.id
    ]);
  }
}