import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';


/**
 * Interface représentant une notification
 * retournée par l'API Spring Boot.
 */
interface Notification {

  /**
   * Identifiant unique de la notification.
   */
  id?: number;

  /**
   * Titre de la notification.
   */
  titre: string;

  /**
   * Contenu de la notification.
   */
  message: string;

  /**
   * Indique si la notification a été lue.
   */
  lu: boolean;

  /**
   * Date de création de la notification.
   */
  dateCreation?: string;
}


/**
 * Composant responsable de l'affichage
 * et de la gestion des notifications.
 *
 * Fonctionnalités :
 * - afficher les notifications ;
 * - afficher le nombre de notifications non lues ;
 * - ouvrir une notification ;
 * - marquer automatiquement une notification comme lue
 *   lorsqu'elle est ouverte ;
 * - permettre de marquer une notification comme lue
 *   sans l'ouvrir ;
 * - supprimer une notification ;
 * - actualiser la liste.
 */
@Component({

  selector: 'app-notifications',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './notifications.html',

  styleUrl: './notifications.scss'

})
export class Notifications implements OnInit {


  /**
   * URL de base de l'API Spring Boot.
   */
  private apiUrl = environment.apiUrl;


  /**
   * Liste des notifications de l'utilisateur.
   */
  notifications: Notification[] = [];


  /**
   * Nombre de notifications non lues.
   */
  unreadCount = 0;


  /**
   * Message affiché en cas d'erreur.
   */
  errorMessage = '';


  /**
   * Indique si les données sont en cours
   * de chargement.
   */
  loading = false;


  /**
   * Notification actuellement ouverte.
   *
   * Si la valeur est null, aucune notification
   * n'est actuellement affichée en détail.
   */
  selectedNotification: Notification | null = null;


  /**
   * Constructeur.
   *
   * @param http service Angular permettant
   *             de communiquer avec l'API
   */
  constructor(private http: HttpClient) {}


  /**
   * Méthode exécutée automatiquement
   * lorsque le composant est chargé.
   */
  ngOnInit(): void {

    this.loadNotifications();

  }


  /**
   * Récupère le JWT enregistré après
   * la connexion.
   */
  private getToken(): string | null {

    return localStorage.getItem('token');

  }


  /**
   * Récupère l'identifiant de l'utilisateur
   * enregistré après la connexion.
   *
   * Exemple de réponse du login :
   *
   * {
   *   "token": "...",
   *   "userId": 1,
   *   "email": "test@gmail.com",
   *   "role": "ETUDIANT"
   * }
   */
  private getUserId(): number | null {

    const userId = localStorage.getItem('userId');


    if (!userId) {

      return null;

    }


    return Number(userId);

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
   * Récupère toutes les notifications
   * de l'utilisateur connecté.
   */
  loadNotifications(): void {

    const userId = this.getUserId();


    /**
     * Vérifie que l'utilisateur est connecté.
     */
    if (!userId) {

      this.errorMessage =
        'Impossible de récupérer votre identifiant utilisateur.';

      return;

    }


    this.loading = true;

    this.errorMessage = '';


    /**
     * Appel de l'API :
     *
     * GET /api/notifications/user/{userId}
     */
    this.http.get<Notification[]>(

      `${this.apiUrl}/notifications/user/${userId}`,

      {
        headers: this.getHeaders()
      }

    ).subscribe({

      /**
       * Réponse réussie.
       */
      next: (data) => {

        this.notifications = data;

        this.loading = false;


        /**
         * Met également à jour le compteur
         * de notifications non lues.
         */
        this.loadUnreadCount();

      },


      /**
       * Gestion des erreurs.
       */
      error: (error) => {

        console.error(
          'Erreur lors du chargement des notifications :',
          error
        );

        this.errorMessage =
          'Impossible de charger vos notifications.';

        this.loading = false;

      }

    });

  }


  /**
   * Récupère le nombre de notifications
   * non lues.
   *
   * Endpoint :
   *
   * GET /api/notifications/user/{userId}/unread/count
   */
  loadUnreadCount(): void {

    const userId = this.getUserId();


    if (!userId) {

      return;

    }


    this.http.get<number>(

      `${this.apiUrl}/notifications/user/${userId}/unread/count`,

      {
        headers: this.getHeaders()
      }

    ).subscribe({

      next: (count) => {

        this.unreadCount = count;

      },


      error: (error) => {

        console.error(
          'Erreur lors du chargement du compteur :',
          error
        );

      }

    });

  }


  /**
   * Ouvre une notification.
   *
   * Lorsqu'une notification non lue est ouverte,
   * elle est automatiquement marquée comme lue.
   *
   * Une notification déjà lue est simplement affichée
   * sans effectuer de nouvelle requête vers l'API.
   */
  openNotification(notification: Notification): void {

    /**
     * Définit la notification sélectionnée.
     *
     * Le HTML pourra alors afficher son contenu
     * détaillé à la place de la liste.
     */
    this.selectedNotification = notification;


    /**
     * Si la notification est déjà lue,
     * aucune requête supplémentaire n'est nécessaire.
     */
    if (notification.lu) {

      return;

    }


    /**
     * La notification est non lue :
     * son ouverture entraîne automatiquement
     * son passage à l'état "lue".
     */
    this.markAsRead(notification);

  }


  /**
   * Ferme la notification actuellement ouverte
   * et revient à la liste.
   */
  closeNotification(): void {

    this.selectedNotification = null;

  }


  /**
   * Marque une notification comme lue.
   *
   * Cette méthode peut être utilisée directement
   * depuis le bouton "Marquer comme lue".
   *
   * Contrairement à openNotification(), cette méthode
   * ne sélectionne pas la notification.
   */
  markAsRead(notification: Notification): void {

    /**
     * Si la notification est déjà lue,
     * aucune requête n'est nécessaire.
     */
    if (notification.lu || !notification.id) {

      return;

    }


    /**
     * Appel de l'API :
     *
     * PATCH /api/notifications/{id}/read
     */
    this.http.patch<Notification>(

      `${this.apiUrl}/notifications/${notification.id}/read`,

      {},

      {
        headers: this.getHeaders()
      }

    ).subscribe({

      /**
       * Mise à jour réussie.
       */
      next: (updatedNotification) => {

        /**
         * Mise à jour de l'état local
         * de la notification.
         */
        notification.lu =
          updatedNotification.lu;


        /**
         * Si cette notification est actuellement
         * ouverte, on met également à jour
         * la notification sélectionnée.
         */
        if (
          this.selectedNotification &&
          this.selectedNotification.id === notification.id
        ) {

          this.selectedNotification.lu =
            updatedNotification.lu;

        }


        /**
         * Actualise le compteur
         * de notifications non lues.
         */
        this.loadUnreadCount();

      },


      /**
       * Gestion des erreurs.
       */
      error: (error) => {

        console.error(
          'Erreur lors de la lecture de la notification :',
          error
        );

      }

    });

  }


  /**
   * Supprime une notification.
   *
   * Endpoint :
   *
   * DELETE /api/notifications/{id}
   */
  deleteNotification(notification: Notification): void {

    /**
     * Vérifie que la notification possède
     * bien un identifiant.
     */
    if (!notification.id) {

      return;

    }


    this.http.delete(

      `${this.apiUrl}/notifications/${notification.id}`,

      {
        headers: this.getHeaders()
      }

    ).subscribe({

      /**
       * Suppression réussie.
       */
      next: () => {

        /**
         * Retire la notification de la liste
         * affichée à l'écran.
         */
        this.notifications =
          this.notifications.filter(
            item => item.id !== notification.id
          );


        /**
         * Si la notification supprimée était
         * actuellement ouverte, on revient
         * automatiquement à la liste.
         */
        if (
          this.selectedNotification &&
          this.selectedNotification.id === notification.id
        ) {

          this.selectedNotification = null;

        }


        /**
         * Actualise le compteur.
         */
        this.loadUnreadCount();

      },


      /**
       * Gestion des erreurs.
       */
      error: (error) => {

        console.error(
          'Erreur lors de la suppression :',
          error
        );

      }

    });

  }


  /**
   * Permet de rafraîchir manuellement
   * la liste des notifications.
   *
   * Si une notification est actuellement ouverte,
   * on revient d'abord à la liste afin d'afficher
   * les données actualisées.
   */
  refresh(): void {

    this.selectedNotification = null;

    this.loadNotifications();

  }

}