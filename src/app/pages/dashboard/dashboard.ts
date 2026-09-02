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
  RouterOutlet
} from '@angular/router';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';


/**
 * Composant principal du tableau de bord étudiant.
 *
 * Il contient :
 * - la navigation latérale ;
 * - les informations générales du tableau de bord ;
 * - le compteur des notifications non lues ;
 * - la déconnexion de l'utilisateur ;
 * - le RouterOutlet pour afficher les pages enfants.
 */
@Component({

  selector: 'app-dashboard',

  standalone: true,

  imports: [

    CommonModule,

    RouterLink,

    RouterLinkActive,

    RouterOutlet

  ],

  templateUrl: './dashboard.html',

  styleUrl: './dashboard.scss'

})
export class Dashboard implements OnInit {


  /**
   * URL de base de notre API Spring Boot.
   */
  private apiUrl = 'http://localhost:8080/api';


  /**
   * Nombre de notifications non lues.
   *
   * Cette valeur est utilisée pour afficher
   * le badge de notifications dans la sidebar.
   */
  unreadCount = 0;


  /**
   * Nom de l'utilisateur connecté.
   *
   * Valeur utilisée par défaut si aucun prénom
   * n'est enregistré dans le localStorage.
   */
  userName = 'Étudiant';


  /**
   * Email de l'utilisateur connecté.
   */
  userEmail = '';


  /**
   * Constructeur.
   *
   * @param http service Angular permettant
   * de communiquer avec l'API Spring Boot
   *
   * @param router service Angular permettant
   * de gérer la navigation entre les pages
   */
  constructor(

    private http: HttpClient,

    private router: Router

  ) {}


  /**
   * Méthode exécutée automatiquement
   * lorsque le Dashboard est chargé.
   */
  ngOnInit(): void {

    /**
     * Récupération des informations
     * de l'utilisateur connecté.
     */
    this.loadUserInformation();


    /**
     * Récupération du nombre de notifications
     * non lues.
     */
    this.loadUnreadNotifications();

  }


  /**
   * Récupère le token JWT enregistré
   * dans le localStorage.
   *
   * Le token est utilisé pour authentifier
   * les requêtes envoyées à Spring Boot.
   */
  private getToken(): string | null {

    return localStorage.getItem('token');

  }


  /**
   * Récupère l'identifiant de l'utilisateur
   * enregistré dans le localStorage.
   */
  private getUserId(): number | null {

    const userId = localStorage.getItem('userId');


    /**
     * Si aucun identifiant n'est trouvé,
     * on retourne null.
     */
    if (!userId) {

      return null;

    }


    /**
     * Conversion de la valeur du localStorage
     * en nombre.
     */
    return Number(userId);

  }


  /**
   * Récupère les informations de base
   * de l'utilisateur depuis le localStorage.
   */
  loadUserInformation(): void {

    /**
     * Récupération de l'adresse email.
     */
    const email = localStorage.getItem('email');


    if (email) {

      this.userEmail = email;

    }


    /**
     * Récupération du prénom.
     */
    const prenom = localStorage.getItem('prenom');


    if (prenom) {

      this.userName = prenom;

    }

  }


  /**
   * Récupère le nombre de notifications
   * non lues depuis l'API Spring Boot.
   *
   * Endpoint utilisé :
   *
   * GET /api/notifications/user/{userId}/unread/count
   */
  loadUnreadNotifications(): void {

    /**
     * Récupération du JWT.
     */
    const token = this.getToken();


    /**
     * Récupération de l'identifiant utilisateur.
     */
    const userId = this.getUserId();


    /**
     * Si le token ou l'identifiant n'existe pas,
     * on arrête la méthode.
     */
    if (!token || !userId) {

      return;

    }


    /**
     * Création de l'en-tête HTTP Authorization.
     *
     * Le JWT permet à Spring Security
     * d'identifier l'utilisateur connecté.
     */
    const headers = new HttpHeaders({

      Authorization: `Bearer ${token}`

    });


    /**
     * Appel de l'API permettant de récupérer
     * le nombre de notifications non lues.
     */
    this.http.get<number>(

      `${this.apiUrl}/notifications/user/${userId}/unread/count`,

      { headers }

    ).subscribe({

      /**
       * Si la requête réussit,
       * on récupère le nombre de notifications.
       */
      next: (count) => {

        this.unreadCount = count;

      },


      /**
       * Si une erreur se produit,
       * on l'affiche dans la console.
       */
      error: (error) => {

        console.error(

          'Erreur lors du chargement du compteur de notifications :',

          error

        );

      }

    });

  }


  /**
   * Vérifie si l'utilisateur se trouve
   * actuellement sur la page principale
   * du Dashboard.
   *
   * /dashboard
   *     → true
   *
   * /dashboard/profile
   *     → false
   *
   * /dashboard/demarches
   *     → false
   *
   * /dashboard/documents
   *     → false
   *
   * /dashboard/notifications
   *     → false
   *
   * Cette méthode permet au HTML d'afficher
   * le résumé du Dashboard uniquement
   * sur la page principale.
   */
  isDashboardHome(): boolean {

    return this.router.url === '/dashboard';

  }


  /**
   * Déconnecte l'utilisateur.
   *
   * Les informations enregistrées dans
   * le localStorage sont supprimées.
   */
  logout(): void {

    /**
     * Suppression du token JWT.
     */
    localStorage.removeItem('token');


    /**
     * Suppression de l'identifiant utilisateur.
     */
    localStorage.removeItem('userId');


    /**
     * Suppression de l'adresse email.
     */
    localStorage.removeItem('email');


    /**
     * Suppression du prénom.
     */
    localStorage.removeItem('prenom');


    /**
     * Redirection vers la page de connexion.
     */
    this.router.navigate(['/login']);

  }

}