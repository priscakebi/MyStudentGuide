// Permet de déclarer notre service comme injectable dans toute l'application.
import { Injectable, inject } from '@angular/core';

// HttpClient permet d'effectuer les requêtes HTTP vers notre API Spring Boot.
import { HttpClient } from '@angular/common/http';

// Observable représente la réponse asynchrone de notre requête HTTP.
import { Observable, tap } from 'rxjs';


// Interface représentant les données envoyées à l'API lors de la connexion.
export interface LoginRequest {

  // Adresse e-mail de l'utilisateur.
  email: string;

  // Mot de passe de l'utilisateur.
  password: string;
}


// Interface représentant exactement la réponse envoyée par notre API.
export interface LoginResponse {

  // Token JWT permettant d'authentifier les prochaines requêtes.
  token: string;

  // Identifiant de l'utilisateur connecté.
  userId: number;

  // Adresse e-mail de l'utilisateur connecté.
  email: string;

  // Rôle de l'utilisateur : ETUDIANT, ADMIN, etc.
  role: string;
}


// Indique qu'Angular peut utiliser ce service dans toute l'application.
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Injection de HttpClient pour communiquer avec Spring Boot.
  private http = inject(HttpClient);

  // Adresse de base de notre API Spring Boot.
  private apiUrl = 'http://localhost:8080/api/auth';


  // Méthode permettant de connecter un utilisateur.
  login(credentials: LoginRequest): Observable<LoginResponse> {

    // Envoie une requête POST vers /api/auth/login.
    return this.http
      .post<LoginResponse>(
        `${this.apiUrl}/login`,
        credentials
      )

      // Exécute ce code lorsque l'API renvoie une réponse positive.
      .pipe(

        tap((response) => {

          // Enregistre le token JWT dans le navigateur.
          localStorage.setItem('token', response.token);

          // Enregistre également l'identifiant de l'utilisateur.
          localStorage.setItem(
            'userId',
            response.userId.toString()
          );

          // Enregistre l'adresse e-mail.
          localStorage.setItem(
            'email',
            response.email
          );

          // Enregistre le rôle de l'utilisateur.
          localStorage.setItem(
            'role',
            response.role
          );
        })
      );
  }


  // Récupère le token JWT enregistré dans le navigateur.
  getToken(): string | null {

    return localStorage.getItem('token');
  }


  // Vérifie si un utilisateur possède actuellement un token.
  isLoggedIn(): boolean {

    return this.getToken() !== null;
  }


  // Déconnecte l'utilisateur.
  logout(): void {

    // Supprime toutes les informations enregistrées lors de la connexion.
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
  }


  // Récupère l'identifiant de l'utilisateur connecté.
  getUserId(): number | null {

    const userId = localStorage.getItem('userId');

    // Si aucun identifiant n'est enregistré, retourne null.
    if (!userId) {
      return null;
    }

    // Transforme la valeur stockée en chaîne de caractères en nombre.
    return Number(userId);
  }


  // Récupère le rôle de l'utilisateur connecté.
  getRole(): string | null {

    return localStorage.getItem('role');
  }


  // Récupère l'e-mail de l'utilisateur connecté.
  getEmail(): string | null {

    return localStorage.getItem('email');
  }
}