import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';


// ============================================================
// INTERFACE : CATÉGORIE
// ============================================================

/**
 * Représente une catégorie de démarche.
 *
 * Exemple :
 *
 * {
 *   id: 1,
 *   nom: "Titre de séjour"
 * }
 */
interface Categorie {

  /**
   * Identifiant unique de la catégorie.
   */
  id: number;

  /**
   * Nom de la catégorie.
   */
  nom: string;
}


// ============================================================
// INTERFACE : DÉMARCHE
// ============================================================

/**
 * Représente une démarche administrative générale.
 *
 * IMPORTANT :
 *
 * Cette interface ne contient PAS :
 * - le statut de l'étudiant ;
 * - le profil étudiant ;
 * - les documents personnels.
 *
 * Le suivi personnalisé d'un étudiant est géré
 * séparément par StudentDemarche.
 */
interface Demarche {

  /**
   * Identifiant unique de la démarche.
   */
  id: number;

  /**
   * Titre de la démarche.
   *
   * Exemple :
   * "Renouvellement du titre de séjour étudiant"
   */
  titre: string;

  /**
   * Description générale de la démarche.
   */
  description: string;

  /**
   * Date de création de la démarche.
   */
  dateCreation?: string;

  /**
   * Date limite éventuelle de la démarche.
   *
   * Peut être null ou absent si aucune date limite
   * n'est définie.
   */
  dateLimite?: string | null;

  /**
   * Catégorie à laquelle appartient la démarche.
   */
  categorie?: Categorie | null;
}


// ============================================================
// INTERFACE : FORMULAIRE
// ============================================================

/**
 * Structure utilisée uniquement pour le formulaire
 * de création et de modification d'une démarche.
 *
 * Le formulaire n'envoie pas directement un objet
 * Demarche complet.
 *
 * Il envoie uniquement les informations nécessaires
 * à l'API.
 */
interface DemarcheForm {

  /**
   * Titre saisi dans le formulaire.
   */
  titre: string;

  /**
   * Description saisie dans le formulaire.
   */
  description: string;

  /**
   * Identifiant de la catégorie sélectionnée.
   */
  categorieId: number;

  /**
   * Date limite éventuelle.
   */
  dateLimite: string | null;
}


// ============================================================
// COMPOSANT
// ============================================================

@Component({
  selector: 'app-demarches-admin',

  /**
   * Le composant est standalone.
   */
  standalone: true,

  /**
   * Modules nécessaires au HTML :
   *
   * CommonModule :
   * - directives Angular ;
   * - fonctionnalités communes.
   *
   * FormsModule :
   * - [(ngModel)] ;
   * - formulaires template-driven.
   */
  imports: [
    CommonModule,
    FormsModule
  ],

  /**
   * Fichier HTML du composant.
   */
  templateUrl: './demarches-admin.html',

  /**
   * Fichier SCSS du composant.
   */
  styleUrl: './demarches-admin.scss'
})
export class DemarchesAdmin implements OnInit {


  // ==========================================================
  // URL DE L'API
  // ==========================================================

  /**
   * URL de base du backend Spring Boot.
   */
  private readonly apiUrl =
    environment.apiUrl;


  // ==========================================================
  // LISTES
  // ==========================================================

  /**
   * Liste de toutes les démarches récupérées depuis
   * le backend.
   */
  demarches: Demarche[] = [];


  /**
   * Liste des catégories disponibles.
   *
   * Elle est utilisée dans le <select> du formulaire.
   */
  categories: Categorie[] = [];


  // ==========================================================
  // FORMULAIRE
  // ==========================================================

  /**
   * Données actuellement saisies dans le formulaire.
   *
   * Ces valeurs sont liées au HTML grâce à [(ngModel)].
   */
  demarcheForm: DemarcheForm = {
    titre: '',
    description: '',
    categorieId: 0,
    dateLimite: null
  };


  // ==========================================================
  // ÉTAT DU COMPOSANT
  // ==========================================================

  /**
   * Indique si le composant est en train d'effectuer
   * une opération avec le backend.
   *
   * Exemple :
   *
   * true  → chargement/création/modification/suppression
   * false → aucune opération en cours
   */
  loading = false;


  /**
   * Indique si le formulaire est actuellement
   * en mode modification.
   *
   * false → création
   * true  → modification
   */
  isEditing = false;


  /**
   * Identifiant de la démarche actuellement modifiée.
   *
   * Il reste null lorsque le formulaire est en mode création.
   */
  editingId: number | null = null;


  // ==========================================================
  // MESSAGES
  // ==========================================================

  /**
   * Message affiché à l'utilisateur après une opération.
   */
  message = '';


  /**
   * Type du message.
   *
   * "success" → opération réussie
   * "error"   → erreur
   */
  messageType: 'success' | 'error' = 'success';


  // ==========================================================
  // CONSTRUCTEUR
  // ==========================================================

  /**
   * Injection de HttpClient.
   *
   * HttpClient permet au composant de communiquer
   * avec l'API Spring Boot.
   */
  constructor(
    private readonly http: HttpClient
  ) {}


  // ==========================================================
  // INITIALISATION
  // ==========================================================

  /**
   * Méthode exécutée automatiquement lors du chargement
   * du composant.
   *
   * Elle récupère :
   *
   * 1. les démarches ;
   * 2. les catégories.
   */
  ngOnInit(): void {

    this.loadDemarches();

    this.loadCategories();
  }


  // ==========================================================
  // HEADERS HTTP
  // ==========================================================

  /**
   * Construit les headers HTTP avec le token JWT
   * actuellement enregistré dans localStorage.
   *
   * Le token est nécessaire pour accéder aux endpoints
   * protégés de l'administration.
   */
  private getHeaders(): HttpHeaders {

    const token = localStorage.getItem('token');

    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token
        ? {
            Authorization: `Bearer ${token}`
          }
        : {})
    });
  }


  // ==========================================================
  // CHARGER LES DÉMARCHES
  // ==========================================================

  /**
   * Récupère toutes les démarches depuis le backend.
   *
   * GET :
   *
   * /api/demarches
   */
  loadDemarches(): void {

    this.loading = true;

    this.http.get<Demarche[]>(
      `${this.apiUrl}/demarches`,
      {
        headers: this.getHeaders()
      }
    )
    .subscribe({

      /**
       * Réponse réussie.
       */
      next: (response) => {

        this.demarches = response;

        this.loading = false;
      },


      /**
       * Erreur lors de la récupération.
       */
      error: (error) => {

        console.error(
          'Erreur lors du chargement des démarches :',
          error
        );

        this.demarches = [];

        this.loading = false;

        this.showMessage(
          'Impossible de charger les démarches.',
          'error'
        );
      }

    });
  }


  // ==========================================================
  // CHARGER LES CATÉGORIES
  // ==========================================================

  /**
   * Récupère toutes les catégories depuis le backend.
   *
   * GET :
   *
   * /api/categories
   *
   * Ces catégories sont utilisées dans le formulaire
   * de création/modification.
   */
  loadCategories(): void {

    this.http.get<Categorie[]>(
      `${this.apiUrl}/categories`,
      {
        headers: this.getHeaders()
      }
    )
    .subscribe({

      /**
       * Réponse réussie.
       */
      next: (response) => {

        this.categories = response;
      },


      /**
       * Erreur lors du chargement.
       */
      error: (error) => {

        console.error(
          'Erreur lors du chargement des catégories :',
          error
        );

        this.categories = [];

        this.showMessage(
          'Impossible de charger les catégories.',
          'error'
        );
      }

    });
  }


  // ==========================================================
  // CRÉER UNE DÉMARCHE
  // ==========================================================

  /**
   * Crée une nouvelle démarche.
   *
   * Les données du formulaire sont envoyées au backend.
   *
   * POST :
   *
   * /api/demarches
   */
  createDemarche(): void {

    /**
     * Vérification minimale du formulaire.
     */
    if (!this.isFormValid()) {
      return;
    }


    this.loading = true;


    /**
     * Objet envoyé à l'API.
     *
     * On envoie uniquement les champs nécessaires.
     */
    const payload = {

      titre: this.demarcheForm.titre.trim(),

      description:
        this.demarcheForm.description.trim(),

      categorieId:
        this.demarcheForm.categorieId,

      dateLimite:
        this.demarcheForm.dateLimite || null
    };


    this.http.post<Demarche>(
      `${this.apiUrl}/demarches`,
      payload,
      {
        headers: this.getHeaders()
      }
    )
    .subscribe({

      /**
       * Création réussie.
       */
      next: (response) => {

        console.log(
          'Démarche créée :',
          response
        );

        this.loading = false;


        this.showMessage(
          'La démarche a été créée avec succès.',
          'success'
        );


        /**
         * Réinitialisation du formulaire.
         */
        this.resetForm();


        /**
         * On recharge la liste pour afficher
         * immédiatement la nouvelle démarche.
         */
        this.loadDemarches();
      },


      /**
       * Erreur lors de la création.
       */
      error: (error) => {

        console.error(
          'Erreur lors de la création de la démarche :',
          error
        );

        this.loading = false;

        this.showMessage(
          this.getErrorMessage(
            error,
            'Impossible de créer la démarche.'
          ),
          'error'
        );
      }

    });
  }


  // ==========================================================
  // PASSER EN MODE MODIFICATION
  // ==========================================================

  /**
   * Place le formulaire en mode modification.
   *
   * Lorsque l'administrateur clique sur "Modifier",
   * les informations de la démarche sont copiées
   * dans le formulaire.
   */
  editDemarche(demarche: Demarche): void {

    /**
     * Activation du mode modification.
     */
    this.isEditing = true;


    /**
     * Conservation de l'identifiant de la démarche.
     *
     * Il sera utilisé pour construire l'URL PUT.
     */
    this.editingId = demarche.id;


    /**
     * Remplissage du formulaire.
     */
    this.demarcheForm = {

      titre: demarche.titre,

      description: demarche.description,

      categorieId:
        demarche.categorie?.id ?? 0,

      dateLimite:
        demarche.dateLimite ?? null
    };


    /**
     * On remonte en haut de la page afin que
     * l'administrateur voie immédiatement le formulaire.
     */
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }


  // ==========================================================
  // MODIFIER UNE DÉMARCHE
  // ==========================================================

  /**
   * Envoie les modifications d'une démarche
   * au backend.
   *
   * PUT :
   *
   * /api/demarches/{id}
   */
  updateDemarche(): void {

    /**
     * Vérification de sécurité.
     */
    if (this.editingId === null) {

      this.showMessage(
        'Aucune démarche sélectionnée pour la modification.',
        'error'
      );

      return;
    }


    /**
     * Vérification du formulaire.
     */
    if (!this.isFormValid()) {
      return;
    }


    this.loading = true;


    /**
     * Données envoyées à l'API.
     */
    const payload = {

      titre:
        this.demarcheForm.titre.trim(),

      description:
        this.demarcheForm.description.trim(),

      categorieId:
        this.demarcheForm.categorieId,

      dateLimite:
        this.demarcheForm.dateLimite || null
    };


    this.http.put<Demarche>(
      `${this.apiUrl}/demarches/${this.editingId}`,
      payload,
      {
        headers: this.getHeaders()
      }
    )
    .subscribe({

      /**
       * Modification réussie.
       */
      next: (response) => {

        console.log(
          'Démarche modifiée :',
          response
        );

        this.loading = false;


        this.showMessage(
          'La démarche a été modifiée avec succès.',
          'success'
        );


        /**
         * Réinitialisation du formulaire.
         */
        this.resetForm();


        /**
         * Actualisation de la liste.
         */
        this.loadDemarches();
      },


      /**
       * Erreur lors de la modification.
       */
      error: (error) => {

        console.error(
          'Erreur lors de la modification :',
          error
        );

        this.loading = false;

        this.showMessage(
          this.getErrorMessage(
            error,
            'Impossible de modifier la démarche.'
          ),
          'error'
        );
      }

    });
  }


  // ==========================================================
  // SUPPRIMER UNE DÉMARCHE
  // ==========================================================

  /**
   * Supprime une démarche.
   *
   * Avant la suppression, une confirmation est demandée
   * à l'administrateur.
   *
   * DELETE :
   *
   * /api/demarches/{id}
   */
  deleteDemarche(id: number): void {

    /**
     * Recherche de la démarche dans la liste.
     */
    const demarche = this.demarches.find(
      item => item.id === id
    );


    /**
     * Message de confirmation.
     */
    const confirmation = window.confirm(

      `Voulez-vous vraiment supprimer la démarche "${demarche?.titre ?? ''}" ?\n\n` +

      `Cette action supprimera la démarche de la liste.`
    );


    /**
     * L'administrateur a annulé.
     */
    if (!confirmation) {
      return;
    }


    this.loading = true;


    this.http.delete(
      `${this.apiUrl}/demarches/${id}`,
      {
        headers: this.getHeaders()
      }
    )
    .subscribe({

      /**
       * Suppression réussie.
       */
      next: () => {

        this.loading = false;


        this.showMessage(
          'La démarche a été supprimée avec succès.',
          'success'
        );


        /**
         * Si la démarche supprimée était celle
         * actuellement modifiée, on quitte le mode édition.
         */
        if (this.editingId === id) {

          this.resetForm();
        }


        /**
         * Actualisation de la liste.
         */
        this.loadDemarches();
      },


      /**
       * Erreur lors de la suppression.
       */
      error: (error) => {

        console.error(
          'Erreur lors de la suppression de la démarche :',
          error
        );

        this.loading = false;

        this.showMessage(
          this.getErrorMessage(
            error,
            'Impossible de supprimer la démarche.'
          ),
          'error'
        );
      }

    });
  }


  // ==========================================================
  // RÉINITIALISER LE FORMULAIRE
  // ==========================================================

  /**
   * Remet le formulaire dans son état initial.
   *
   * Cette méthode est utilisée :
   *
   * - après une création ;
   * - après une modification ;
   * - lorsque l'utilisateur clique sur "Annuler".
   */
  resetForm(): void {

    this.isEditing = false;

    this.editingId = null;


    this.demarcheForm = {

      titre: '',

      description: '',

      categorieId: 0,

      dateLimite: null
    };
  }


  // ==========================================================
  // VALIDATION DU FORMULAIRE
  // ==========================================================

  /**
   * Vérifie que les champs obligatoires sont correctement
   * renseignés avant d'envoyer la requête au backend.
   */
  private isFormValid(): boolean {

    /**
     * Vérification du titre.
     */
    if (!this.demarcheForm.titre.trim()) {

      this.showMessage(
        'Veuillez renseigner le titre de la démarche.',
        'error'
      );

      return false;
    }


    /**
     * Vérification de la description.
     */
    if (!this.demarcheForm.description.trim()) {

      this.showMessage(
        'Veuillez renseigner la description de la démarche.',
        'error'
      );

      return false;
    }


    /**
     * Vérification de la catégorie.
     *
     * 0 correspond à l'option :
     * "Sélectionnez une catégorie".
     */
    if (
      !this.demarcheForm.categorieId ||
      this.demarcheForm.categorieId <= 0
    ) {

      this.showMessage(
        'Veuillez sélectionner une catégorie.',
        'error'
      );

      return false;
    }


    return true;
  }


  // ==========================================================
  // AFFICHER UN MESSAGE
  // ==========================================================

  /**
   * Affiche un message dans le composant.
   *
   * Le message est automatiquement supprimé
   * après quelques secondes.
   */
  private showMessage(
    message: string,
    type: 'success' | 'error'
  ): void {

    this.message = message;

    this.messageType = type;


    /**
     * Suppression automatique du message après 5 secondes.
     */
    window.setTimeout(() => {

      this.message = '';

    }, 5000);
  }


  // ==========================================================
  // RÉCUPÉRER LE MESSAGE D'ERREUR
  // ==========================================================

  /**
   * Essaie de récupérer un message compréhensible
   * depuis la réponse du backend.
   *
   * Cela permet d'éviter d'afficher uniquement
   * "Http failure response".
   */
  private getErrorMessage(
    error: any,
    defaultMessage: string
  ): string {

    /**
     * Message directement envoyé par le backend.
     */
    if (
      error?.error?.message &&
      typeof error.error.message === 'string'
    ) {

      return error.error.message;
    }


    /**
     * Dans certains cas, le backend peut retourner
     * directement une chaîne de caractères.
     */
    if (
      typeof error?.error === 'string' &&
      error.error.trim()
    ) {

      return error.error;
    }


    /**
     * Message générique si aucune information
     * exploitable n'est disponible.
     */
    return defaultMessage;
  }

}