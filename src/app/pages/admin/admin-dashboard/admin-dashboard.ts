import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

/*
 * RouterLink :
 * permet d'utiliser routerLink dans le HTML.
 *
 * RouterLinkActive :
 * permet d'ajouter automatiquement la classe
 * "active" au lien correspondant à la route actuelle.
 *
 * RouterOutlet :
 * permet d'afficher les pages enfants
 * à l'intérieur du Dashboard.
 */
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
  NavigationEnd
} from '@angular/router';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import { filter } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';


/**
 * Composant principal du tableau de bord administrateur.
 *
 * Il contient :
 * - la navigation latérale ;
 * - les informations générales du tableau de bord ;
 * - les statistiques de la plateforme ;
 * - le titre et la description dynamiques des pages ;
 * - la déconnexion de l'administrateur ;
 * - le RouterOutlet pour afficher les pages enfants.
 */
@Component({

  selector: 'app-admin-dashboard',

  standalone: true,

  imports: [

    CommonModule,

    RouterLink,

    RouterLinkActive,

    RouterOutlet

  ],

  // Fichier HTML contenant l'interface du dashboard.
  templateUrl: './admin-dashboard.html',

  // Fichier SCSS contenant le style du dashboard.
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboard implements OnInit {


  // =========================================================
  // STATISTIQUES DU DASHBOARD
  // =========================================================

  /**
   * Nombre total de catégories enregistrées.
   */
  nombreCategories: number = 0;

  /**
   * Nombre total de démarches enregistrées.
   */
  nombreDemarches: number = 0;

  /**
   * Nombre total d'utilisateurs enregistrés.
   */
  nombreUtilisateurs: number = 0;

  /**
   * Nombre total de notifications.
   */
  nombreNotifications: number = 0;


  // =========================================================
  // ÉTAT DE L'INTERFACE
  // =========================================================

  /**
   * Indique si les données sont actuellement
   * en cours de récupération auprès du backend.
   */
  loading: boolean = false;

  /**
   * Message d'information ou d'erreur affiché
   * sur le dashboard.
   */
  message: string = '';

  /**
   * Type du message :
   *
   * - success : opération réussie
   * - error   : problème rencontré
   */
  messageType: 'success' | 'error' = 'success';


  // =========================================================
  // INFORMATIONS ADMINISTRATEUR
  // =========================================================

  /**
   * Nom affiché dans le dashboard.
   *
   * Pour le moment, nous utilisons simplement
   * "Administrateur".
   */
  adminName: string = 'Administrateur';

  /**
   * Email de l'administrateur connecté.
   *
   * Il est récupéré depuis le localStorage
   * après la connexion.
   */
  adminEmail: string = '';


  // =========================================================
  // INFORMATIONS DE LA PAGE ACTUELLE
  // =========================================================

  /**
   * Titre affiché dans la topbar.
   *
   * Sa valeur change automatiquement
   * selon la fonctionnalité sélectionnée.
   *
   * Exemple :
   *
   * /admin
   * → Tableau de bord
   *
   * /admin/categories-admin
   * → Gestion des catégories
   *
   * /admin/demarches-admin
   * → Gestion des démarches
   */
  pageTitle: string = 'Tableau de bord';

  /**
   * Description affichée sous le titre.
   *
   * Elle change également selon la page actuelle.
   */
  pageDescription: string =
    'Vue d’ensemble de la plateforme.';


  // =========================================================
  // URL DU BACKEND
  // =========================================================

  /**
   * Adresse principale de l'API Spring Boot.
   */
  private readonly API_URL = environment.apiUrl;


  // =========================================================
  // CONSTRUCTEUR
  // =========================================================

  /**
   * Injection des services Angular nécessaires.
   *
   * HttpClient :
   * permet d'effectuer les requêtes HTTP
   * vers notre API Spring Boot.
   *
   * Router :
   * permet de naviguer entre les différentes
   * pages de l'application et de connaître
   * l'URL actuellement affichée.
   */
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}


  // =========================================================
  // INITIALISATION DU COMPOSANT
  // =========================================================

  /**
   * Méthode exécutée automatiquement lorsque
   * le composant est chargé par Angular.
   */
  ngOnInit(): void {

    // ---------------------------------------------------------
    // RÉCUPÉRATION DE L'EMAIL
    // ---------------------------------------------------------

    /**
     * Récupération de l'email de l'administrateur
     * connecté depuis le localStorage.
     */
    this.adminEmail =
      localStorage.getItem('email') || '';


    // ---------------------------------------------------------
    // INFORMATIONS DE LA PAGE
    // ---------------------------------------------------------

    /**
     * Détermine immédiatement le titre
     * et la description de la page actuelle.
     */
    this.updatePageInformation();


    // ---------------------------------------------------------
    // ÉCOUTE DES CHANGEMENTS DE ROUTE
    // ---------------------------------------------------------

    /**
     * NavigationEnd est déclenché par Angular
     * lorsqu'une navigation est terminée.
     *
     * Cela nous permet de modifier automatiquement
     * le titre et la description lorsque l'utilisateur
     * clique sur une autre fonctionnalité.
     */
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe(() => {

        // Mise à jour du titre et de la description.
        this.updatePageInformation();

      });


    // ---------------------------------------------------------
    // CHARGEMENT DES STATISTIQUES
    // ---------------------------------------------------------

    /**
     * Chargement des statistiques du dashboard.
     */
    this.loadStatistics();
  }


  // =========================================================
  // VÉRIFICATION DE LA PAGE D'ACCUEIL
  // =========================================================

  /**
   * Détermine si l'utilisateur est actuellement
   * sur la page principale du dashboard administrateur.
   *
   * Cette méthode est utilisée dans le HTML
   * pour afficher le contenu du dashboard uniquement
   * lorsque l'URL est exactement /admin.
   */
  isDashboardHome(): boolean {

    return this.router.url === '/admin';
  }


  // =========================================================
  // TITRE ET DESCRIPTION DE LA PAGE
  // =========================================================

  /**
   * Détermine le titre et la description
   * à afficher dans la topbar.
   *
   * Le contenu change automatiquement
   * selon l'URL actuelle.
   */
  updatePageInformation(): void {

    // Récupération de l'URL actuelle.
    const url = this.router.url;


    // =======================================================
    // PAGE CATÉGORIES
    // =======================================================

    if (url.includes('/categories-admin')) {

      // Titre affiché dans la topbar.
      this.pageTitle =
        'Gestion des catégories';

      // Description affichée sous le titre.
      this.pageDescription =
        'Créez et gérez les catégories des démarches administratives.';

    }


    // =======================================================
    // PAGE DÉMARCHES
    // =======================================================

    else if (url.includes('/demarches-admin')) {

      // Titre affiché dans la topbar.
      this.pageTitle =
        'Gestion des démarches';

      // Description affichée sous le titre.
      this.pageDescription =
        'Créez et gérez les démarches administratives proposées aux étudiants.';

    }


    // =======================================================
    // PAGE UTILISATEURS
    // =======================================================

    else if (url.includes('/users')) {

      // Titre affiché dans la topbar.
      this.pageTitle =
        'Gestion des utilisateurs';

      // Description affichée sous le titre.
      this.pageDescription =
        'Consultez et gérez les utilisateurs inscrits sur la plateforme.';

    }

    // =======================================================
    // PAGE DOCUMENTS
    // =======================================================

    else if (url.includes('/documents')) {

      // Titre affiché dans la topbar.
      this.pageTitle =
        'Gestion des documents';

      // Description affichée sous le titre.
      this.pageDescription =
        "Créez et gérez les documents nécessaires \à\
        l'accomplissement des démarches administratives.";

    }


    // =======================================================
    // PAGE NOTIFICATIONS
    // =======================================================

    else if (url.includes('/notifications')) {

      // Titre affiché dans la topbar.
      this.pageTitle =
        'Gestion des notifications';

      // Description affichée sous le titre.
      this.pageDescription =
        'Créez et gérez les notifications destinées aux étudiants.';

    }


    // =======================================================
    // TABLEAU DE BORD
    // =======================================================

    else {

      // Titre par défaut.
      this.pageTitle =
        'Tableau de bord';

      // Description par défaut.
      this.pageDescription =
        'Vue d’ensemble de la plateforme.';
    }
  }


  // =========================================================
  // HEADERS HTTP
  // =========================================================

  /**
   * Prépare les headers nécessaires
   * aux requêtes HTTP.
   *
   * Le token JWT enregistré dans le localStorage
   * est envoyé dans l'en-tête Authorization.
   */
  private getHeaders(): HttpHeaders {

    // Récupération du token JWT.
    const token =
      localStorage.getItem('token');

    // Création des headers HTTP.
    return new HttpHeaders({

      'Content-Type':
        'application/json',

      /**
       * Envoi du token JWT au backend
       * sous la forme :
       *
       * Authorization: Bearer <token>
       */
      'Authorization':
        `Bearer ${token}`
    });
  }


  // =========================================================
  // CHARGEMENT DES STATISTIQUES
  // =========================================================

  /**
   * Charge les différentes statistiques
   * affichées sur le tableau de bord administrateur.
   */
  loadStatistics(): void {

    // Activation de l'indicateur de chargement.
    this.loading = true;

    // Suppression d'un ancien message.
    this.message = '';


    // ---------------------------------------------------------
    // CHARGEMENT DES CATÉGORIES
    // ---------------------------------------------------------

    /**
     * L'API retourne la liste complète
     * des catégories.
     *
     * La longueur du tableau permet donc
     * de connaître le nombre total.
     */
    this.http.get<any[]>(

      `${this.API_URL}/categories`,

      {
        headers: this.getHeaders()
      }

    ).subscribe({

      // Requête réussie.
      next: (categories) => {

        // Nombre total de catégories.
        this.nombreCategories =
          categories.length;
      },

      // Gestion d'une erreur.
      error: () => {

        // Valeur par défaut.
        this.nombreCategories = 0;
      }
    });


    // ---------------------------------------------------------
    // CHARGEMENT DES DÉMARCHES
    // ---------------------------------------------------------

    /**
     * Récupération de la liste
     * des démarches administratives.
     */
    this.http.get<any[]>(

      `${this.API_URL}/demarches`,

      {
        headers: this.getHeaders()
      }

    ).subscribe({

      // Requête réussie.
      next: (demarches) => {

        // Nombre total de démarches.
        this.nombreDemarches =
          demarches.length;
      },

      // Gestion d'une erreur.
      error: () => {

        // Valeur par défaut.
        this.nombreDemarches = 0;
      }
    });


    // ---------------------------------------------------------
    // CHARGEMENT DES UTILISATEURS
    // ---------------------------------------------------------

    /**
     * Cette requête suppose que le backend possède
     * un endpoint :
     *
     * GET /api/users
     *
     * Si l'endpoint n'existe pas encore,
     * le compteur restera simplement à 0.
     */
    this.http.get<any[]>(

      `${this.API_URL}/users`,

      {
        headers: this.getHeaders()
      }

    ).subscribe({

      // Requête réussie.
      next: (users) => {

        // Nombre total d'utilisateurs.
        this.nombreUtilisateurs =
          users.length;
      },

      // Gestion d'une erreur.
      error: () => {

        // Valeur par défaut.
        this.nombreUtilisateurs = 0;
      }
    });


    // ---------------------------------------------------------
// CHARGEMENT DES NOTIFICATIONS
// ---------------------------------------------------------

/**
 * Récupération de toutes les notifications
 * pour l'administration.
 *
 * L'endpoint réservé à l'administrateur est :
 *
 * GET /api/notifications/admin/all
 *
 * Le backend vérifie que l'utilisateur possède
 * le rôle ADMIN.
 */
this.http.get<any[]>(

  `${this.API_URL}/notifications/admin/all`,

  {
    headers: this.getHeaders()
  }

).subscribe({

  // Requête réussie.
  next: (notifications) => {

    // Nombre total de notifications.
    this.nombreNotifications =
      notifications.length;
  },

  // Gestion d'une erreur.
  error: () => {

    // Valeur par défaut.
    this.nombreNotifications = 0;
  },

  /**
   * Cette méthode est appelée lorsque
   * la requête est terminée avec succès.
   */
  complete: () => {

    // Désactivation du chargement.
    this.loading = false;
  }
});
  }


  // =========================================================
  // ACTUALISATION DES STATISTIQUES
  // =========================================================

  /**
   * Permet de recharger manuellement
   * les statistiques du dashboard.
   */
  refreshStatistics(): void {

    // Relance le chargement des statistiques.
    this.loadStatistics();
  }


  // =========================================================
  // DÉCONNEXION
  // =========================================================

  /**
   * Déconnecte l'administrateur.
   *
   * Les informations de session sont supprimées
   * du localStorage avant de retourner vers
   * la page de connexion.
   */
  logout(): void {

    // Suppression du token JWT.
    localStorage.removeItem('token');

    // Suppression de l'identifiant utilisateur.
    localStorage.removeItem('userId');

    // Suppression de l'email.
    localStorage.removeItem('email');

    // Suppression du rôle.
    localStorage.removeItem('role');

    // Redirection vers la page de connexion.
    this.router.navigate(['/login']);
  }
}