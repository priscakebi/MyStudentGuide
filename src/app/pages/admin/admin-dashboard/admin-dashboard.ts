import { Component, HostListener, OnInit, inject } from '@angular/core';
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
import { AuthService } from '../../../services/auth.service';


/** Réponse de GET /api/admin/stats (AdminStatsResponse côté API). */
export interface AdminStats {
  etudiants: number;
  nouveauxEtudiants7j: number;
  etudiantsSansDemarche: number;
  demarches: number;
  categories: number;
  suivisEnCours: number;
  suivisTermines: number;
  tauxCompletion: number;
  avis: number;
  noteMoyenne: number | null;
  topDemarches: { id: number; titre: string; commencees: number; terminees: number }[];
  inscriptionsParSemaine: { debutSemaine: string; inscriptions: number }[];
  activiteRecente: { titre: string; message: string; date: string; lu: boolean }[];
  signalementsOuverts: number;
  demandesAideOuvertes: number;
}


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

  private authService = inject(AuthService);


  // =========================================================
  // STATISTIQUES DU DASHBOARD
  // =========================================================

  /**
   * Statistiques renvoyées par GET /api/admin/stats
   * (null tant qu'elles ne sont pas chargées).
   */
  stats: AdminStats | null = null;

  /** Date du jour, affichée au-dessus du message de bienvenue. */
  readonly today = new Date();

  /** Total des inscriptions sur 8 semaines (graphique vide si 0). */
  get totalInscriptions(): number {
    return (this.stats?.inscriptionsParSemaine ?? [])
      .reduce((total, semaine) => total + semaine.inscriptions, 0);
  }

  /** Hauteur d'une colonne, en % de la semaine la plus haute. */
  hauteurColonne(valeur: number): number {
    const max = Math.max(...(this.stats?.inscriptionsParSemaine ?? []).map((s) => s.inscriptions), 1);
    return (valeur / max) * 100;
  }

  /** Largeur d'une barre, en % de la démarche la plus suivie. */
  largeurBarre(valeur: number): number {
    const max = Math.max(...(this.stats?.topDemarches ?? []).map((d) => d.commencees), 1);
    return (valeur / max) * 100;
  }


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

  /**
   * Lettre affichée dans l'avatar : initiale de l'e-mail,
   * ou « A » tant qu'il n'est pas connu.
   */
  get adminInitial(): string {
    return (this.adminEmail.charAt(0) || 'A').toUpperCase();
  }

  /**
   * Tiroir de navigation sur mobile (760px et moins).
   * Sur ordinateur, la sidebar reste toujours visible.
   */
  menuOpen = false;

  toggleMobileMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMobileMenu(): void {
    this.menuOpen = false;
  }

  /** La touche Échap referme le tiroir mobile. */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMobileMenu();
  }


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

        // Sur mobile, le tiroir se referme après chaque navigation.
        this.closeMobileMenu();

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
    // PAGE SIGNALEMENTS
    // =======================================================

    else if (url.includes('/aide')) {
      this.pageTitle = "Demandes d'aide";
      this.pageDescription =
        'Répondez aux questions envoyées par les étudiants.';
    }
    else if (url.includes('/account')) {
      this.pageTitle = 'Mon compte';
      this.pageDescription =
        'Consultez vos informations et gérez votre mot de passe.';
    }
    else if (url.includes('/signalements')) {
      this.pageTitle = 'Signalements des étudiants';
      this.pageDescription =
        'Informations erronées ou obsolètes signalées par les étudiants.';
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
      this.authService.getToken();

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
   * Charge toutes les statistiques du tableau de bord
   * en une seule requête : GET /api/admin/stats.
   *
   * (Avant, quatre listes complètes étaient téléchargées
   * uniquement pour être comptées.)
   */
  loadStatistics(): void {

    this.loading = true;
    this.message = '';

    this.http.get<AdminStats>(
      `${this.API_URL}/admin/stats`,
      { headers: this.getHeaders() }
    ).subscribe({

      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },

      error: () => {
        this.loading = false;
        this.messageType = 'error';
        this.message = 'Impossible de charger les statistiques. Réessayez avec « Actualiser ».';
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

    // Suppression complète de la session (token, id, email, rôle).
    this.authService.logout();

    // Redirection vers la page de connexion administrateur.
    this.router.navigate(['/admin-login']);
  }
}