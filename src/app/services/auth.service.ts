import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../environments/environment';

/** Données envoyées à l'API lors de la connexion. */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Données envoyées à l'API lors de l'inscription. */
export interface RegisterRequest {
  prenom: string;
  nom: string;
  email: string;
  password: string;
}

/** Réponse de l'API après connexion ou inscription. */
export interface LoginResponse {
  token: string;
  userId: number;
  email: string;
  role: string;
}

/**
 * Service central d'authentification.
 *
 * Il est le seul à lire / écrire la session dans le localStorage :
 * les guards, l'interceptor et les pages passent par lui.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/auth`;

  /** Connexion : enregistre la session si l'API répond OK. */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(tap((response) => this.saveSession(response)));
  }

  /** Inscription : l'API renvoie directement un JWT, l'étudiant est connecté. */
  register(data: RegisterRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/register`, data)
      .pipe(tap((response) => this.saveSession(response)));
  }

  /** Enregistre le token et les informations de l'utilisateur. */
  saveSession(response: LoginResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('userId', response.userId.toString());
    localStorage.setItem('email', response.email);
    localStorage.setItem('role', response.role);
  }

  /** Supprime toute la session. */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Un utilisateur est connecté s'il possède un token NON expiré.
   * Si le token est expiré, la session est nettoyée automatiquement.
   */
  isLoggedIn(): boolean {
    const token = this.getToken();

    if (!token) {
      return false;
    }

    if (this.isTokenExpired(token)) {
      this.logout();
      return false;
    }

    return true;
  }

  /** Vrai si l'utilisateur connecté est administrateur. */
  isAdmin(): boolean {
    const role = this.getRole();
    return this.isLoggedIn() && (role === 'ADMIN' || role === 'ROLE_ADMIN');
  }

  getUserId(): number | null {
    const userId = localStorage.getItem('userId');
    return userId ? Number(userId) : null;
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  getEmail(): string | null {
    return localStorage.getItem('email');
  }

  /**
   * Lit la date d'expiration (claim "exp") dans le JWT.
   * Un token illisible est considéré comme expiré.
   * (Simple confort côté interface : la vraie vérification reste celle du backend.)
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = token.split('.')[1];
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      const { exp } = JSON.parse(json);

      return typeof exp === 'number' && exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }
}
