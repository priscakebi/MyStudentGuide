import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../../services/auth.service';
import {
  NotificationService,
  Notification
} from '../../../services/notifiaction.service';

/**
 * Composant permettant d'afficher et de gérer
 * les notifications de l'utilisateur connecté.
 */
@Component({
  selector: 'app-notifications-admin',
  standalone: true,

  /**
   * CommonModule est nécessaire pour :
   * - le pipe date ;
   * - les fonctionnalités Angular utilisées dans le template.
   */
  imports: [
    CommonModule
  ],

  /**
   * Fichier HTML de la page.
   */
  templateUrl: './notifications-admin.html',

  /**
   * Fichier SCSS de la page.
   */
  styleUrl: './notifications-admin.scss'
})
export class NotificationsAdmin implements OnInit {

  /**
   * Liste des notifications récupérées depuis le backend.
   */
  notifications: Notification[] = [];

  /**
   * Nombre de notifications non lues.
   */
  unreadCount = 0;

  /**
   * Indique si les données sont en cours de chargement.
   */
  loading = false;

  /**
   * Message affiché lorsqu'une erreur survient.
   */
  errorMessage = '';

  /**
   * Service permettant de récupérer les informations
   * de l'utilisateur connecté.
   */
  private authService = inject(AuthService);

  /**
   * Service permettant de communiquer avec
   * l'API des notifications.
   */
  private notificationService = inject(NotificationService);


  /**
   * Méthode exécutée automatiquement lors
   * de l'initialisation du composant.
   */
  ngOnInit(): void {
    this.refresh();
  }


  /**
   * Actualise la liste des notifications
   * ainsi que le nombre de notifications non lues.
   */
  refresh(): void {
    this.loadNotifications();
    this.loadUnreadCount();
  }


  /**
   * Récupère toutes les notifications de l'utilisateur connecté.
   */
  loadNotifications(): void {

    /**
     * Récupération de l'identifiant
     * de l'utilisateur connecté.
     */
    const userId = this.authService.getUserId();

    /**
     * Affiche l'identifiant utilisé par Angular
     * dans la console du navigateur.
     */

    /**
     * Vérification de l'existence de l'utilisateur.
     */
    if (!userId) {
      this.errorMessage = 'Utilisateur non identifié.';
      return;
    }

    /**
     * Activation de l'état de chargement.
     */
    this.loading = true;

    /**
     * Réinitialisation du message d'erreur.
     */
    this.errorMessage = '';

    /**
     * Appel du backend pour récupérer
     * les notifications de l'utilisateur.
     */
    this.notificationService
      .getNotificationsByUser(userId)
      .subscribe({

        /**
         * Réponse reçue correctement.
         */
        next: (notifications) => {

          /**
           * Affiche les notifications reçues
           * par Angular dans la console.
           */

          /**
           * Affiche le nombre de notifications reçues.
           */

          /**
           * Enregistrement des notifications
           * dans la variable utilisée par le HTML.
           */
          this.notifications = notifications;

          /**
           * Fin du chargement.
           */
          this.loading = false;
        },

        /**
         * Gestion d'une erreur lors
         * de la récupération des notifications.
         */
        error: (error) => {

          /**
           * Affiche l'erreur complète
           * dans la console du navigateur.
           */
          console.error(
            'ERREUR HTTP NOTIFICATIONS :',
            error
          );

          /**
           * Message affiché dans la page.
           */
          this.errorMessage =
            'Impossible de charger les notifications.';

          /**
           * Fin du chargement même en cas d'erreur.
           */
          this.loading = false;
        }
      });
  }


  /**
   * Récupère le nombre de notifications non lues.
   */
  loadUnreadCount(): void {

    /**
     * Récupération de l'utilisateur connecté.
     */
    const userId = this.authService.getUserId();

    /**
     * Si aucun utilisateur n'est connecté,
     * on ne fait pas l'appel au backend.
     */
    if (!userId) {
      return;
    }

    /**
     * Appel de l'API pour compter
     * les notifications non lues.
     */
    this.notificationService
      .countUnreadNotifications(userId)
      .subscribe({

        /**
         * Mise à jour du compteur.
         */
        next: (count) => {

          /**
           * Enregistrement du nombre
           * de notifications non lues.
           */
          this.unreadCount = count;

          /**
           * Affichage du compteur dans la console
           * pour faciliter le diagnostic.
           */
        },

        /**
         * Gestion de l'erreur.
         */
        error: (error) => {

          console.error(
            'ERREUR LORS DU CHARGEMENT DU COMPTEUR :',
            error
          );
        }
      });
  }


  /**
   * Marque une notification comme lue.
   */
  markAsRead(notification: Notification): void {

    /**
     * Si la notification est déjà lue,
     * aucune action n'est nécessaire.
     */
    if (notification.lu) {
      return;
    }

    /**
     * Appel du backend pour modifier
     * l'état de lecture de la notification.
     */
    this.notificationService
      .markAsRead(notification.id)
      .subscribe({

        /**
         * Notification correctement modifiée.
         */
        next: (updatedNotification) => {

          /**
           * Mise à jour de l'état de lecture
           * dans la liste affichée.
           */
          notification.lu = updatedNotification.lu;

          /**
           * Mise à jour du compteur
           * des notifications non lues.
           */
          this.loadUnreadCount();
        },

        /**
         * Gestion de l'erreur.
         */
        error: (error) => {

          console.error(
            'Erreur lors du marquage de la notification comme lue :',
            error
          );
        }
      });
  }


  /**
   * Supprime une notification.
   */
  deleteNotification(notification: Notification): void {

    /**
     * Appel du backend pour supprimer
     * la notification.
     */
    this.notificationService
      .deleteNotification(notification.id)
      .subscribe({

        /**
         * Suppression réussie.
         */
        next: () => {

          /**
           * Retire la notification de la liste
           * affichée dans la page.
           */
          this.notifications = this.notifications.filter(
            (item) => item.id !== notification.id
          );

          /**
           * Actualise le compteur
           * des notifications non lues.
           */
          this.loadUnreadCount();
        },

        /**
         * Gestion de l'erreur.
         */
        error: (error) => {

          console.error(
            'Erreur lors de la suppression de la notification :',
            error
          );
        }
      });
  }
}