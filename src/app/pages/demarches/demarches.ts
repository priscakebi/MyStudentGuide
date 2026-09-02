import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

/**
 * Interface représentant une catégorie de démarche.
 *
 * Elle correspond aux données retournées
 * par l'API des catégories.
 */
interface Categorie {

  id: number;

  nom: string;

  description?: string;

}


/**
 * Interface représentant une démarche administrative.
 *
 * Elle correspond aux informations retournées
 * par l'API des démarches.
 */
interface Demarche {

  id: number;

  titre: string;

  description: string;

  statut: string;

  dateCreation: string;

  dateLimite?: string;

  categorie?: Categorie;

}


/**
 * Composant responsable de l'affichage
 * des démarches administratives de l'étudiant.
 */
@Component({

  selector: 'app-demarches',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './demarches.html',

  styleUrl: './demarches.scss'

})
export class Demarches implements OnInit {


  /**
   * URL de base de l'API Spring Boot.
   */
  private apiUrl = 'http://localhost:8080/api';


  /**
   * Liste des démarches récupérées
   * depuis l'API.
   */
  demarches: Demarche[] = [];


  /**
   * Message affiché en cas d'erreur.
   */
  errorMessage = '';


  /**
   * Indique si les démarches sont
   * actuellement en cours de chargement.
   */
  loading = false;


  /**
   * Permet de filtrer les démarches
   * selon leur statut.
   *
   * Valeur "TOUTES" = aucun filtre.
   */
  selectedStatus = 'TOUTES';


  /**
   * Constructeur.
   *
   * @param http service Angular permettant
   *             de communiquer avec l'API
   */
  constructor(private http: HttpClient) {}


  /**
   * Méthode exécutée automatiquement
   * lors du chargement de la page.
   */
  ngOnInit(): void {

    this.loadDemarches();

  }


  /**
   * Récupère le JWT enregistré
   * après la connexion.
   */
  private getToken(): string | null {

    return localStorage.getItem('token');

  }


  /**
   * Récupère toutes les démarches
   * de l'utilisateur connecté.
   *
   * Endpoint :
   *
   * GET /api/demarches
   */
  loadDemarches(): void {

    const token = this.getToken();


    /**
     * Vérification de la présence du JWT.
     */
    if (!token) {

      this.errorMessage =
        'Vous devez être connecté pour accéder à vos démarches.';

      return;

    }


    /**
     * Création de l'en-tête Authorization.
     */
    const headers = new HttpHeaders({

      Authorization: `Bearer ${token}`

    });


    this.loading = true;

    this.errorMessage = '';


    /**
     * Appel GET vers l'API.
     */
    this.http.get<Demarche[]>(

      `${this.apiUrl}/demarches`,

      { headers }

    ).subscribe({

      /**
       * Les démarches ont été récupérées
       * correctement.
       */
      next: (data) => {

        this.demarches = data;

        this.loading = false;

      },


      /**
       * Gestion des erreurs.
       */
      error: (error) => {

        console.error(
          'Erreur lors du chargement des démarches :',
          error
        );

        this.errorMessage =
          'Impossible de charger vos démarches.';

        this.loading = false;

      }

    });

  }


  /**
   * Retourne uniquement les démarches
   * correspondant au filtre sélectionné.
   */
  get filteredDemarches(): Demarche[] {

    /**
     * Si "TOUTES" est sélectionné,
     * toutes les démarches sont affichées.
     */
    if (this.selectedStatus === 'TOUTES') {

      return this.demarches;

    }


    /**
     * Sinon, on filtre selon le statut.
     */
    return this.demarches.filter(

      demarche =>
        demarche.statut === this.selectedStatus

    );

  }


  /**
   * Compte le nombre de démarches
   * correspondant à un statut.
   *
   * @param statut statut recherché
   */
  countByStatus(statut: string): number {

    return this.demarches.filter(

      demarche =>
        demarche.statut === statut

    ).length;

  }


  /**
   * Retourne le nombre total
   * de démarches.
   */
  get totalDemarches(): number {

    return this.demarches.length;

  }


  /**
   * Retourne le nombre de démarches
   * terminées.
   */
  get completedDemarches(): number {

    return this.countByStatus('TERMINEE');

  }


  /**
   * Retourne le nombre de démarches
   * encore à faire.
   */
  get todoDemarches(): number {

    return this.countByStatus('A_FAIRE');

  }


  /**
   * Retourne le nombre de démarches
   * actuellement en cours.
   */
  get inProgressDemarches(): number {

    return this.countByStatus('EN_COURS');

  }


  /**
   * Permet de modifier le statut
   * d'une démarche.
   *
   * Cette méthode sera reliée à ton endpoint
   * de modification du statut.
   *
   * IMPORTANT :
   * l'URL exacte dépend de ton controller Spring Boot.
   */
  updateStatus(
    demarche: Demarche,
    nouveauStatut: string
  ): void {

    const token = this.getToken();


    /**
     * Vérification du JWT.
     */
    if (!token) {

      this.errorMessage =
        'Vous devez être connecté.';

      return;

    }


    /**
     * Préparation de l'en-tête Authorization.
     */
    const headers = new HttpHeaders({

      Authorization: `Bearer ${token}`

    });


    /**
     * Pour l'instant, on met à jour
     * directement l'objet affiché.
     *
     * Lorsque nous brancherons précisément
     * l'endpoint PATCH/PUT de ton API,
     * cette partie pourra être remplacée
     * par l'appel HTTP correspondant.
     */
    demarche.statut = nouveauStatut;

  }


  /**
   * Permet d'afficher un libellé
   * plus compréhensible pour le statut.
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


  /**
   * Retourne une classe CSS correspondant
   * au statut de la démarche.
   */
  getStatusClass(statut: string): string {

    switch (statut) {

      case 'A_FAIRE':
        return 'status-todo';

      case 'EN_COURS':
        return 'status-progress';

      case 'TERMINEE':
        return 'status-completed';

      case 'NON_CONCERNEE':
        return 'status-not-concerned';

      default:
        return '';

    }

  }

}