import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

/**
 * Interface représentant une catégorie
 * retournée par l'API Spring Boot.
 */
interface Categorie {

  /**
   * Identifiant unique de la catégorie.
   */
  id: number;

  /**
   * Nom de la catégorie.
   *
   * Exemple :
   * "Administratif"
   * "Logement"
   * "Santé"
   */
  nom: string;

  /**
   * Description de la catégorie.
   */
  description: string;
}


/**
 * Composant responsable de l'affichage
 * des catégories disponibles dans l'application.
 */
@Component({

  /**
   * Sélecteur utilisé pour afficher
   * le composant dans Angular.
   */
  selector: 'app-categories',

  /**
   * Le composant est autonome.
   */
  standalone: true,

  /**
   * Modules nécessaires au template HTML.
   */
  imports: [
    CommonModule
  ],

  /**
   * Fichier HTML associé au composant.
   */
  templateUrl: './categories.html',

  /**
   * Fichier SCSS associé au composant.
   */
  styleUrl: './categories.scss'

})
export class Categories implements OnInit {


  /**
   * URL de base de notre API Spring Boot.
   */
  private apiUrl = 'http://localhost:8080/api';


  /**
   * Liste des catégories récupérées depuis l'API.
   */
  categories: Categorie[] = [];


  /**
   * Message affiché lorsqu'une erreur se produit.
   */
  errorMessage = '';


  /**
   * Indique si les catégories sont en cours
   * de chargement.
   */
  loading = false;


  /**
   * Constructeur.
   *
   * @param http service Angular permettant
   * de communiquer avec l'API
   */
  constructor(private http: HttpClient) {}


  /**
   * Méthode exécutée automatiquement
   * lors du chargement du composant.
   */
  ngOnInit(): void {

    /**
     * Chargement des catégories.
     */
    this.loadCategories();

  }


  /**
   * Récupère le JWT enregistré dans le navigateur.
   */
  private getToken(): string | null {

    return localStorage.getItem('token');

  }


  /**
   * Récupère toutes les catégories
   * depuis l'API Spring Boot.
   *
   * Endpoint utilisé :
   *
   * GET /api/categories
   */
  loadCategories(): void {

    /**
     * Récupération du token.
     */
    const token = this.getToken();


    /**
     * Si aucun token n'est disponible,
     * on affiche un message d'erreur.
     */
    if (!token) {

      this.errorMessage =
        'Vous devez être connecté pour accéder aux catégories.';

      return;

    }


    /**
     * Création de l'en-tête Authorization.
     */
    const headers = new HttpHeaders({

      Authorization: `Bearer ${token}`

    });


    /**
     * Activation de l'indicateur de chargement.
     */
    this.loading = true;

    this.errorMessage = '';


    /**
     * Appel GET vers l'API.
     */
    this.http.get<Categorie[]>(

      `${this.apiUrl}/categories`,

      { headers }

    ).subscribe({

      /**
       * Réponse réussie de l'API.
       */
      next: (data) => {

        /**
         * Stockage des catégories reçues.
         */
        this.categories = data;

        /**
         * Fin du chargement.
         */
        this.loading = false;

      },


      /**
       * Gestion des erreurs.
       */
      error: (error) => {

        /**
         * Affichage de l'erreur dans la console
         * pour faciliter le développement.
         */
        console.error(
          'Erreur lors du chargement des catégories :',
          error
        );

        /**
         * Message affiché à l'utilisateur.
         */
        this.errorMessage =
          'Impossible de charger les catégories.';

        /**
         * Fin du chargement.
         */
        this.loading = false;

      }

    });

  }

}