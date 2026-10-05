import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Représente un document nécessaire pour réaliser une démarche.
 *
 * Cette interface correspond aux données envoyées par le backend
 * depuis l'entité DocumentRequis.
 */
export interface DocumentRequis {
  id: number;
  nom: string;
  description: string | null;
  type: string;
  demarcheId: number;
}

/**
 * Service permettant de communiquer avec l'API des documents requis.
 *
 * Son rôle est de récupérer les documents nécessaires
 * pour une démarche donnée.
 */
@Injectable({
  providedIn: 'root'
})
export class DocumentsService {

  /**
   * URL de base de l'API des documents requis.
   */
  private apiUrl = `${environment.apiUrl}/documents-requis`;

  /**
   * Injection de HttpClient.
   *
   * HttpClient permet à Angular d'envoyer des requêtes HTTP
   * vers le backend Spring Boot.
   */
  constructor(private http: HttpClient) {}

  /**
   * Récupère tous les documents requis pour une démarche.
   *
   * Exemple de requête envoyée :
   * GET /api/documents-requis/demarche/1
   *
   * @param demarcheId Identifiant de la démarche.
   * @returns Observable contenant la liste des documents requis.
   */
  getDocumentsByDemarche(
    demarcheId: number
  ): Observable<DocumentRequis[]> {

    return this.http.get<DocumentRequis[]>(
      `${this.apiUrl}/demarche/${demarcheId}`
    );
  }
}