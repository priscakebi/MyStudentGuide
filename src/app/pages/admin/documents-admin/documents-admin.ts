// ============================================================
// IMPORTS ANGULAR
// ============================================================

// Permet de déclarer un composant Angular.
import { Component, OnInit } from '@angular/core';

// Permet d'utiliser les directives Angular comme
// *ngIf et *ngFor dans le HTML.
import { CommonModule } from '@angular/common';

// Permet d'utiliser [(ngModel)] dans les formulaires.
import { FormsModule } from '@angular/forms';

// Permet d'effectuer les appels HTTP vers le backend.
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';


// ============================================================
// INTERFACE : CATEGORIE
// ============================================================

// Représente une catégorie récupérée depuis l'API.
// Cette interface est conservée car elle peut être utile
// si les démarches évoluent avec les catégories.
interface Categorie {

  // Identifiant de la catégorie.
  id: number;

  // Nom de la catégorie.
  nom: string;

  // Description facultative.
  description?: string;
}


// ============================================================
// INTERFACE : DEMARCHE
// ============================================================

// Représente une démarche existante dans l'application.
interface Demarche {

  // Identifiant de la démarche.
  id?: number;

  // Titre de la démarche.
  titre: string;

  // Description de la démarche.
  description: string;

  // Date de création facultative.
  dateCreation?: string;

  // Date limite facultative.
  dateLimite?: string;

  // Catégorie associée à la démarche.
  categorie?: Categorie;
}


// ============================================================
// INTERFACE : DOCUMENT REQUIS
// ============================================================

// Représente un document requis créé par l'administrateur.
interface DocumentRequis {

  // Identifiant du document.
  id?: number;

  // Nom du document.
  // Exemple : "Passeport".
  nom: string;

  // Description du document.
  description?: string;

  // Type correspondant à l'enum DocumentType du backend.
  type: string;

  // Identifiant de la démarche associée.
  demarcheId?: number;

  // Démarche associée lorsque le backend la retourne.
  demarche?: Demarche;
}


// ============================================================
// INTERFACE : REQUÊTE DOCUMENT
// ============================================================

// Structure envoyée au backend lors de la création
// ou de la modification d'un document requis.
interface DocumentRequisRequest {

  // Nom du document.
  nom: string;

  // Description du document.
  description: string;

  // Type du document.
  type: string;

  // Identifiant de la démarche associée.
  demarcheId: number;
}


// ============================================================
// COMPOSANT DOCUMENTS ADMIN
// ============================================================

@Component({
  // Sélecteur du composant.
  selector: 'app-documents-admin',

  // Le composant est autonome.
  standalone: true,

  // Modules nécessaires au fonctionnement du HTML.
  imports: [
    CommonModule,
    FormsModule
  ],

  // Fichier HTML associé.
  templateUrl: './documents-admin.html',

  // Fichier SCSS associé.
  styleUrl: './documents-admin.scss'
})
export class DocumentsAdmin implements OnInit {

  // ==========================================================
  // URL DE L'API
  // ==========================================================

  // URL de base de notre backend Spring Boot.
  private apiUrl = environment.apiUrl;


  // ==========================================================
  // LISTES
  // ==========================================================

  // Liste des documents requis récupérés depuis le backend.
  documents: DocumentRequis[] = [];

  // Liste des démarches disponibles.
  // Elle permet à l'administrateur de choisir
  // à quelle démarche rattacher le document.
  demarches: Demarche[] = [];


  // ==========================================================
  // TYPES DE DOCUMENTS
  // ==========================================================

  // Liste correspondant aux valeurs de l'enum
  // DocumentType du backend.
  documentTypes: string[] = [

    'PIECE_IDENTITE',
    'PASSEPORT',
    'VISA',
    'TITRE_SEJOUR',
    'CERTIFICAT_SCOLARITE',
    'JUSTIFICATIF_DOMICILE',
    'CONTRAT_LOCATION',
    'ATTESTATION_HEBERGEMENT',
    'ATTESTATION_ASSURANCE',
    'JUSTIFICATIF_RESSOURCES',
    'RELEVE_BANCAIRE',
    'PHOTO_IDENTITE',
    'AUTRE'
  ];


  // ==========================================================
  // FORMULAIRE
  // ==========================================================

  // Permet de savoir si le formulaire est visible.
  showForm = false;

  // Contient l'identifiant du document en cours de modification.
  // null signifie qu'il s'agit d'une création.
  editingId: number | null = null;

  // Données saisies dans le formulaire.
  documentForm: DocumentRequisRequest = {

    // Nom initial vide.
    nom: '',

    // Description initiale vide.
    description: '',

    // Aucun type sélectionné au départ.
    type: '',

    // 0 signifie qu'aucune démarche n'est sélectionnée.
    demarcheId: 0
  };


  // ==========================================================
  // ETAT DE LA PAGE
  // ==========================================================

  // Permet d'afficher un indicateur de chargement.
  loading = false;

  // Message affiché après une opération réussie.
  successMessage = '';

  // Message affiché lorsqu'une erreur survient.
  errorMessage = '';


  // ==========================================================
  // CONSTRUCTEUR
  // ==========================================================

  constructor(
    // Service Angular permettant d'appeler l'API.
    private http: HttpClient
  ) {}


  // ==========================================================
  // INITIALISATION
  // ==========================================================

  // Cette méthode est exécutée automatiquement
  // lorsque le composant est chargé.
  ngOnInit(): void {

    // On récupère d'abord les démarches disponibles.
    this.loadDemarches();

    // Puis on récupère les documents requis.
    this.loadDocuments();
  }


  // ==========================================================
  // RÉCUPÉRER LE TOKEN JWT
  // ==========================================================

  // Récupère le token enregistré après la connexion.
  private getToken(): string | null {

    return localStorage.getItem('token');
  }


  // ==========================================================
  // CRÉER LES HEADERS HTTP
  // ==========================================================

  // Prépare les headers nécessaires pour communiquer
  // avec les endpoints protégés de l'API.
  private getHeaders(): HttpHeaders {

    // Récupération du token JWT.
    const token = this.getToken();

    // Création des headers HTTP.
    let headers = new HttpHeaders({

      // Indique que nous envoyons du JSON.
      'Content-Type': 'application/json',

      // Indique que nous acceptons une réponse JSON.
      'Accept': 'application/json'
    });

    // Si un token existe, on l'ajoute dans Authorization.
    if (token) {

      headers = headers.set(
        'Authorization',
        `Bearer ${token}`
      );
    }

    // Retourne les headers préparés.
    return headers;
  }


  // ==========================================================
  // CHARGER LES DÉMARCHES
  // ==========================================================

  // Récupère toutes les démarches existantes.
  loadDemarches(): void {

    // Appel GET vers /api/demarches.
    this.http.get<Demarche[]>(
      `${this.apiUrl}/demarches`,
      {
        headers: this.getHeaders()
      }
    ).subscribe({

      // Si la requête réussit.
      next: (data) => {

        // Stocke les démarches reçues.
        this.demarches = data || [];
      },

      // Si une erreur survient.
      error: (error) => {

        console.error(
          'Erreur lors du chargement des démarches :',
          error
        );

        this.errorMessage =
          'Impossible de charger les démarches.';
      }
    });
  }


  // ==========================================================
  // CHARGER LES DOCUMENTS
  // ==========================================================

  // Récupère tous les documents requis créés par l'administrateur.
  loadDocuments(): void {

    // Active le chargement.
    this.loading = true;

    // Réinitialise les anciens messages.
    this.errorMessage = '';

    // Appel GET vers /api/documents-requis.
    this.http.get<DocumentRequis[]>(
      `${this.apiUrl}/documents-requis`,
      {
        headers: this.getHeaders()
      }
    ).subscribe({

      // Si la requête réussit.
      next: (data) => {

        // Stocke les documents reçus.
        this.documents = data || [];

        // Désactive le chargement.
        this.loading = false;
      },

      // Si la requête échoue.
      error: (error) => {

        console.error(
          'Erreur lors du chargement des documents requis :',
          error
        );

        // Affiche un message à l'utilisateur.
        this.errorMessage =
          'Impossible de charger les documents requis.';

        // Désactive le chargement.
        this.loading = false;
      }
    });
  }


  // ==========================================================
  // OUVRIR LE FORMULAIRE D'AJOUT
  // ==========================================================

  // Prépare le formulaire pour créer un nouveau document.
  openAddForm(): void {

    // Active l'affichage du formulaire.
    this.showForm = true;

    // Indique qu'il ne s'agit pas d'une modification.
    this.editingId = null;

    // Réinitialise les champs du formulaire.
    this.documentForm = {

      // Nom vide.
      nom: '',

      // Description vide.
      description: '',

      // Aucun type sélectionné.
      type: '',

      // Aucune démarche sélectionnée.
      demarcheId: 0
    };

    // Supprime les anciens messages.
    this.errorMessage = '';
    this.successMessage = '';
  }


  // ==========================================================
  // FERMER LE FORMULAIRE
  // ==========================================================

  // Ferme le formulaire sans enregistrer.
  closeForm(): void {

    // Masque le formulaire.
    this.showForm = false;

    // Réinitialise l'identifiant de modification.
    this.editingId = null;

    // Réinitialise le formulaire.
    this.documentForm = {

      nom: '',
      description: '',
      type: '',
      demarcheId: 0
    };

    // Efface le message d'erreur.
    this.errorMessage = '';
  }


  // ==========================================================
  // MODIFIER UN DOCUMENT
  // ==========================================================

  // Place les informations du document sélectionné
  // dans le formulaire.
  editDocument(document: DocumentRequis): void {

    // Vérifie que le document possède bien un identifiant.
    if (!document.id) {

      this.errorMessage =
        'Impossible de modifier ce document.';

      return;
    }

    // Affiche le formulaire.
    this.showForm = true;

    // Stocke l'identifiant du document.
    this.editingId = document.id;

    // Récupère l'identifiant de la démarche.
    const demarcheId =
      document.demarcheId ??
      document.demarche?.id ??
      0;

    // Remplit le formulaire avec les informations existantes.
    this.documentForm = {

      // Nom existant.
      nom: document.nom,

      // Description existante.
      description: document.description || '',

      // Type existant.
      type: document.type,

      // Démarche existante.
      demarcheId: demarcheId
    };

    // Efface les anciens messages.
    this.errorMessage = '';
    this.successMessage = '';
  }


  // ==========================================================
  // ENREGISTRER LE DOCUMENT
  // ==========================================================

  // Crée un nouveau document ou modifie un document existant.
  saveDocument(): void {

    // Vérifie la présence du token.
    const token = this.getToken();

    // Si aucun token n'est présent,
    // l'utilisateur n'est probablement plus connecté.
    if (!token) {

      this.errorMessage =
        'Votre session a expiré. Veuillez vous reconnecter.';

      return;
    }


    // ----------------------------------------------------------
    // VALIDATION DU NOM
    // ----------------------------------------------------------

    if (!this.documentForm.nom.trim()) {

      this.errorMessage =
        'Le nom du document est obligatoire.';

      return;
    }


    // ----------------------------------------------------------
    // VALIDATION DU TYPE
    // ----------------------------------------------------------

    if (!this.documentForm.type) {

      this.errorMessage =
        'Veuillez sélectionner un type de document.';

      return;
    }


    // ----------------------------------------------------------
    // VALIDATION DE LA DÉMARCHE
    // ----------------------------------------------------------

    if (
      !this.documentForm.demarcheId ||
      this.documentForm.demarcheId === 0
    ) {

      this.errorMessage =
        'Veuillez sélectionner une démarche.';

      return;
    }


    // Active le chargement.
    this.loading = true;

    // Efface les anciens messages.
    this.errorMessage = '';
    this.successMessage = '';


    // ----------------------------------------------------------
    // PRÉPARATION DES DONNÉES
    // ----------------------------------------------------------

    // Prépare exactement les propriétés attendues
    // par DocumentRequisRequest côté Spring Boot.
    const payload: DocumentRequisRequest = {

      // Nom du document.
      nom: this.documentForm.nom.trim(),

      // Description du document.
      description: this.documentForm.description.trim(),

      // Type du document.
      type: this.documentForm.type,

      // Identifiant de la démarche.
      demarcheId: Number(this.documentForm.demarcheId)
    };


    // ==========================================================
    // MODIFICATION
    // ==========================================================

    if (this.editingId) {

      // Appel PUT vers /api/documents-requis/{id}.
      this.http.put<DocumentRequis>(
        `${this.apiUrl}/documents-requis/${this.editingId}`,
        payload,
        {
          headers: this.getHeaders()
        }
      ).subscribe({

        // Modification réussie.
        next: () => {

          this.successMessage =
            'Document requis modifié avec succès.';

          // Ferme le formulaire.
          this.closeForm();

          // Recharge la liste.
          this.loadDocuments();
        },

        // Erreur lors de la modification.
        error: (error) => {

          console.error(
            'Erreur lors de la modification du document :',
            error
          );

          this.errorMessage =
            'Impossible de modifier le document.';

          this.loading = false;
        }
      });

      return;
    }


    // ==========================================================
    // CRÉATION
    // ==========================================================

    // Appel POST vers /api/documents-requis.
    this.http.post<DocumentRequis>(
      `${this.apiUrl}/documents-requis`,
      payload,
      {
        headers: this.getHeaders()
      }
    ).subscribe({

      // Création réussie.
      next: () => {

        this.successMessage =
          'Document requis créé avec succès.';

        // Ferme le formulaire.
        this.closeForm();

        // Recharge la liste des documents.
        this.loadDocuments();
      },

      // Erreur lors de la création.
      error: (error) => {

        console.error(
          'Erreur lors de la création du document :',
          error
        );

        this.errorMessage =
          'Impossible de créer le document.';

        this.loading = false;
      }
    });
  }


  // ==========================================================
  // SUPPRIMER UN DOCUMENT
  // ==========================================================

  // Supprime un document requis après confirmation.
  deleteDocument(id: number): void {

    // Demande une confirmation à l'administrateur.
    const confirmation = confirm(
      'Êtes-vous sûr de vouloir supprimer ce document requis ?'
    );

    // Si l'administrateur annule,
    // aucune requête n'est envoyée.
    if (!confirmation) {
      return;
    }

    // Vérifie que le token existe.
    const token = this.getToken();

    if (!token) {

      this.errorMessage =
        'Votre session a expiré. Veuillez vous reconnecter.';

      return;
    }

    // Active le chargement.
    this.loading = true;

    // Efface les anciens messages.
    this.errorMessage = '';
    this.successMessage = '';


    // Appel DELETE vers /api/documents-requis/{id}.
    this.http.delete(
      `${this.apiUrl}/documents-requis/${id}`,
      {
        headers: this.getHeaders()
      }
    ).subscribe({

      // Suppression réussie.
      next: () => {

        this.successMessage =
          'Document requis supprimé avec succès.';

        // Recharge la liste.
        this.loadDocuments();
      },

      // Erreur lors de la suppression.
      error: (error) => {

        console.error(
          'Erreur lors de la suppression du document :',
          error
        );

        this.errorMessage =
          'Impossible de supprimer le document.';

        this.loading = false;
      }
    });
  }


  // ==========================================================
  // TRADUCTION DU TYPE DE DOCUMENT
  // ==========================================================

  // Transforme la valeur technique de l'enum
  // en texte compréhensible par l'administrateur.
  getDocumentTypeLabel(type: string): string {

    // Association entre les valeurs de l'API
    // et leurs libellés français.
    const labels: { [key: string]: string } = {

      PIECE_IDENTITE: 'Pièce d’identité',
      PASSEPORT: 'Passeport',
      VISA: 'Visa',
      TITRE_SEJOUR: 'Titre de séjour',
      CERTIFICAT_SCOLARITE: 'Certificat de scolarité',
      JUSTIFICATIF_DOMICILE: 'Justificatif de domicile',
      CONTRAT_LOCATION: 'Contrat de location',
      ATTESTATION_HEBERGEMENT: 'Attestation d’hébergement',
      ATTESTATION_ASSURANCE: 'Attestation d’assurance',
      JUSTIFICATIF_RESSOURCES: 'Justificatif de ressources',
      RELEVE_BANCAIRE: 'Relevé bancaire',
      PHOTO_IDENTITE: 'Photo d’identité',
      AUTRE: 'Autre'
    };

    // Retourne le libellé correspondant.
    // Si le type est inconnu, on retourne sa valeur.
    return labels[type] || type;
  }


  // ==========================================================
  // RÉCUPÉRER LE NOM DE LA DÉMARCHE
  // ==========================================================

  // Permet d'afficher le titre de la démarche associée
  // au document requis.
  getDemarcheTitle(document: DocumentRequis): string {

    // Si l'objet démarche est présent dans la réponse API,
    // on utilise directement son titre.
    if (document.demarche?.titre) {

      return document.demarche.titre;
    }


    // Sinon, si nous avons uniquement l'identifiant
    // de la démarche, nous cherchons la démarche
    // correspondante dans la liste chargée.
    if (document.demarcheId) {

      const demarche = this.demarches.find(
        item => item.id === document.demarcheId
      );

      // Si elle est trouvée, on retourne son titre.
      if (demarche) {

        return demarche.titre;
      }
    }


    // Si aucune démarche ne peut être trouvée.
    return 'Démarche inconnue';
  }

}