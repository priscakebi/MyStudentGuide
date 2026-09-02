import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

/**
 * Interface représentant un document
 * retourné par l'API Spring Boot.
 */
interface DocumentModel {

  /**
   * Identifiant du document.
   */
  id?: number;

  /**
   * Nom original du fichier.
   */
  nomFichier: string;

  /**
   * Nom utilisé pour le stockage du fichier.
   */
  nomStockage: string;

  /**
   * Type MIME du fichier.
   *
   * Exemple :
   * application/pdf
   * image/jpeg
   */
  typeFichier: string;

  /**
   * Taille du fichier en octets.
   */
  taille: number;

  /**
   * Chemin ou URL permettant de retrouver le fichier.
   */
  cheminFichier: string;

  /**
   * Date à laquelle le document a été ajouté.
   */
  dateUpload?: string;

  /**
   * Identifiant de la démarche associée.
   *
   * On utilise uniquement l'identifiant
   * côté formulaire pour éviter d'envoyer
   * directement tout l'objet Demarche.
   */
  demarcheId?: number;
}


/**
 * Composant responsable de la gestion
 * des documents étudiants.
 */
@Component({

  selector: 'app-documents',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './documents.html',

  styleUrl: './documents.scss'

})
export class Documents implements OnInit {


  /**
   * URL de base de l'API Spring Boot.
   */
  private apiUrl = 'http://localhost:8080/api';


  /**
   * Liste des documents récupérés depuis l'API.
   */
  documents: DocumentModel[] = [];


  /**
   * Document utilisé pour le formulaire.
   */
  documentForm: DocumentModel = {

    nomFichier: '',

    nomStockage: '',

    typeFichier: '',

    taille: 0,

    cheminFichier: '',

    demarcheId: undefined

  };


  /**
   * Indique si le formulaire est visible.
   */
  showForm = false;


  /**
   * Identifiant du document actuellement modifié.
   *
   * null signifie qu'on est en mode création.
   */
  editingId: number | null = null;


  /**
   * Message d'erreur affiché à l'utilisateur.
   */
  errorMessage = '';


  /**
   * Message de succès.
   */
  successMessage = '';


  /**
   * Indique si une requête est en cours.
   */
  loading = false;


  /**
   * Constructeur.
   *
   * @param http service Angular permettant
   *             d'effectuer les appels HTTP
   */
  constructor(private http: HttpClient) {}


  /**
   * Méthode exécutée automatiquement
   * lors du chargement du composant.
   */
  ngOnInit(): void {

    this.loadDocuments();

  }


  /**
   * Récupère le JWT enregistré
   * après la connexion.
   */
  private getToken(): string | null {

    return localStorage.getItem('token');

  }


  /**
   * Création des headers HTTP.
   *
   * Le JWT est envoyé à Spring Security
   * afin d'authentifier l'utilisateur.
   */
  private getHeaders(): HttpHeaders {

    const token = this.getToken();

    return new HttpHeaders({

      Authorization: `Bearer ${token}`

    });

  }


  /**
   * Récupère tous les documents
   * depuis l'API.
   *
   * Endpoint :
   *
   * GET /api/documents
   */
  loadDocuments(): void {

    this.loading = true;

    this.errorMessage = '';


    this.http.get<DocumentModel[]>(

      `${this.apiUrl}/documents`,

      {
        headers: this.getHeaders()
      }

    ).subscribe({

      /**
       * Réponse reçue avec succès.
       */
      next: (data) => {

        this.documents = data;

        this.loading = false;

      },


      /**
       * Gestion des erreurs.
       */
      error: (error) => {

        console.error(
          'Erreur lors du chargement des documents :',
          error
        );

        this.errorMessage =
          'Impossible de charger les documents.';

        this.loading = false;

      }

    });

  }


  /**
   * Affiche le formulaire d'ajout.
   */
  openAddForm(): void {

    this.editingId = null;

    this.showForm = true;

    this.errorMessage = '';

    this.successMessage = '';


    /**
     * Réinitialise le formulaire.
     */
    this.documentForm = {

      nomFichier: '',

      nomStockage: '',

      typeFichier: '',

      taille: 0,

      cheminFichier: '',

      demarcheId: undefined

    };

  }


  /**
   * Ferme le formulaire.
   */
  closeForm(): void {

    this.showForm = false;

    this.editingId = null;

    this.errorMessage = '';

  }


  /**
   * Prépare la modification
   * d'un document existant.
   */
  editDocument(document: DocumentModel): void {

    this.editingId = document.id ?? null;

    this.showForm = true;

    this.errorMessage = '';

    this.successMessage = '';


    /**
     * Copie les informations du document
     * dans le formulaire.
     */
    this.documentForm = {

      ...document

    };

  }


  /**
   * Crée ou modifie un document.
   *
   * Si editingId est null :
   *
   * POST /api/documents
   *
   * Sinon :
   *
   * PUT /api/documents/{id}
   */
  saveDocument(): void {

    this.errorMessage = '';

    this.successMessage = '';


    /**
     * Vérifie la présence du JWT.
     */
    if (!this.getToken()) {

      this.errorMessage =
        'Vous devez être connecté pour gérer vos documents.';

      return;

    }


    this.loading = true;


    /**
     * Objet envoyé à l'API.
     *
     * On ne transmet pas demarcheId directement
     * car le backend attend un objet Demarche.
     */
    const payload: any = {

      nomFichier: this.documentForm.nomFichier,

      nomStockage: this.documentForm.nomStockage,

      typeFichier: this.documentForm.typeFichier,

      taille: this.documentForm.taille,

      cheminFichier: this.documentForm.cheminFichier

    };


    /**
     * Si une démarche est renseignée,
     * on crée la référence attendue par Spring.
     */
    if (this.documentForm.demarcheId) {

      payload.demarche = {

        id: this.documentForm.demarcheId

      };

    }


    /**
     * MODE MODIFICATION
     */
    if (this.editingId !== null) {

      this.http.put<DocumentModel>(

        `${this.apiUrl}/documents/${this.editingId}`,

        payload,

        {
          headers: this.getHeaders()
        }

      ).subscribe({

        next: () => {

          this.successMessage =
            'Document modifié avec succès.';

          this.loading = false;

          this.showForm = false;

          this.editingId = null;

          this.loadDocuments();

        },

        error: (error) => {

          console.error(
            'Erreur lors de la modification :',
            error
          );

          this.errorMessage =
            'Impossible de modifier le document.';

          this.loading = false;

        }

      });

      return;

    }


    /**
     * MODE CRÉATION
     */
    this.http.post<DocumentModel>(

      `${this.apiUrl}/documents`,

      payload,

      {
        headers: this.getHeaders()
      }

    ).subscribe({

      next: () => {

        this.successMessage =
          'Document ajouté avec succès.';

        this.loading = false;

        this.showForm = false;

        this.loadDocuments();

      },

      error: (error) => {

        console.error(
          'Erreur lors de la création :',
          error
        );

        this.errorMessage =
          'Impossible de créer le document.';

        this.loading = false;

      }

    });

  }


  /**
   * Supprime un document.
   *
   * Endpoint :
   *
   * DELETE /api/documents/{id}
   */
  deleteDocument(id?: number): void {

    /**
     * Vérifie que l'identifiant existe.
     */
    if (!id) {

      return;

    }


    /**
     * Demande une confirmation
     * avant la suppression.
     */
    const confirmed = confirm(
      'Voulez-vous vraiment supprimer ce document ?'
    );


    if (!confirmed) {

      return;

    }


    this.loading = true;

    this.errorMessage = '';


    this.http.delete(

      `${this.apiUrl}/documents/${id}`,

      {
        headers: this.getHeaders()
      }

    ).subscribe({

      next: () => {

        this.successMessage =
          'Document supprimé avec succès.';

        this.loading = false;

        this.loadDocuments();

      },

      error: (error) => {

        console.error(
          'Erreur lors de la suppression :',
          error
        );

        this.errorMessage =
          'Impossible de supprimer le document.';

        this.loading = false;

      }

    });

  }


  /**
   * Convertit une taille en octets
   * vers une unité plus lisible.
   *
   * Exemple :
   *
   * 524288 → 512 Ko
   */
  formatFileSize(size: number): string {

    if (!size) {

      return '0 octet';

    }


    if (size < 1024) {

      return `${size} octets`;

    }


    if (size < 1024 * 1024) {

      return `${(size / 1024).toFixed(1)} Ko`;

    }


    return `${(size / (1024 * 1024)).toFixed(1)} Mo`;

  }


  /**
   * Permet d'afficher un nom de type
   * MIME plus compréhensible.
   */
  getFileType(type: string): string {

    if (type === 'application/pdf') {

      return 'PDF';

    }

    if (type === 'image/jpeg') {

      return 'JPEG';

    }

    if (type === 'image/png') {

      return 'PNG';

    }

    return type;

  }

}