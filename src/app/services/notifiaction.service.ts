// Permet de déclarer notre service comme injectable dans toute l'application.
import { Injectable, inject } from '@angular/core';

// HttpClient permet d'effectuer les requêtes HTTP vers notre API Spring Boot.
import { HttpClient } from '@angular/common/http';

// Observable représente les réponses asynchrones de notre API.
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


// Interface représentant une notification reçue depuis l'API.
export interface Notification {

  // Identifiant unique de la notification.
  id: number;

  // Date et heure de création de la notification.
  dateCreation: string;

  // Indique si la notification a été lue.
  lu: boolean;

  // Contenu de la notification.
  message: string;

  // Titre affiché à l'utilisateur.
  titre: string;

  // Type de notification.
  // Exemples : SYSTEME, DEMARCHE, ECHEANCE, INFORMATION.
  type: string;

  // Identifiant de l'utilisateur qui reçoit la notification.
  userId: number;
}


// Indique qu'Angular peut utiliser ce service dans toute l'application.
@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  // Injection de HttpClient pour communiquer avec l'API Spring Boot.
  private http = inject(HttpClient);

  // Adresse de base des endpoints de notifications.
  private apiUrl = `${environment.apiUrl}/notifications`;


  /**
   * Récupère toutes les notifications d'un utilisateur.
   *
   * @param userId identifiant de l'utilisateur.
   * @returns Observable contenant la liste des notifications.
   */
  getNotificationsByUser(
    userId: number
  ): Observable<Notification[]> {

    return this.http.get<Notification[]>(
      `${this.apiUrl}/user/${userId}`
    );
  }


  /**
   * Récupère uniquement les notifications non lues.
   *
   * @param userId identifiant de l'utilisateur.
   * @returns Observable contenant les notifications non lues.
   */
  getUnreadNotifications(
    userId: number
  ): Observable<Notification[]> {

    return this.http.get<Notification[]>(
      `${this.apiUrl}/user/${userId}/unread`
    );
  }


  /**
   * Récupère le nombre de notifications non lues.
   *
   * @param userId identifiant de l'utilisateur.
   * @returns Observable contenant le nombre de notifications.
   */
  countUnreadNotifications(
    userId: number
  ): Observable<number> {

    return this.http.get<number>(
      `${this.apiUrl}/user/${userId}/unread/count`
    );
  }


  /**
   * Récupère une notification à partir de son identifiant.
   *
   * @param id identifiant de la notification.
   * @returns Observable contenant la notification.
   */
  getNotificationById(
    id: number
  ): Observable<Notification> {

    return this.http.get<Notification>(
      `${this.apiUrl}/${id}`
    );
  }


  /**
   * Marque une notification comme lue.
   *
   * Le backend utilise PATCH pour cette opération.
   *
   * @param id identifiant de la notification.
   * @returns Observable contenant la notification modifiée.
   */
  /** « Tout marquer comme lu » : toutes les notifications de l'utilisateur connecté. */
  markAllAsRead(): Observable<{ marquees: number }> {
    return this.http.patch<{ marquees: number }>(`${this.apiUrl}/read-all`, {});
  }

  markAsRead(
    id: number
  ): Observable<Notification> {

    return this.http.patch<Notification>(
      `${this.apiUrl}/${id}/read`,
      {}
    );
  }


  /**
   * Supprime une notification.
   *
   * @param id identifiant de la notification.
   * @returns Observable sans contenu.
   */
  deleteNotification(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}