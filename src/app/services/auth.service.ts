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

  /**
   * Mot de passe oublié : demande l'envoi d'un lien de réinitialisation par e-mail.
   * L'API répond toujours de la même façon, que l'adresse existe ou non.
   * `espace` limite la demande aux comptes de l'espace concerné.
   */
  forgotPassword(email: string, espace: 'ETUDIANT' | 'ADMIN'): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/forgot-password`, { email, espace });
  }

  /** Définit un nouveau mot de passe à partir du jeton reçu par e-mail. */
  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, { token, newPassword });
  }

  /** Enregistre le token et les informations de l'utilisateur. */
  /** Renouvelle le JWT (appelé tant que l'utilisateur est actif). */
  /**
   * Change le mot de passe de l'utilisateur connecté
   * (étudiant ou administrateur).
   *
   * PUT /api/account/password
   */
  changePassword(currentPassword: string, newPassword: string): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(
      `${environment.apiUrl}/account/password`,
      { currentPassword, newPassword }
    );
  }

  refreshToken(): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/refresh`, {})
      .pipe(tap((response) => this.setToken(response.token)));
  }

  /** Remplace uniquement le token (renouvellement, changement d'email...). */
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  saveSession(response: LoginResponse): void {
    // Démarre le compteur d'inactivité à partir de la connexion.
    localStorage.setItem('lastActivity', String(Date.now()));
    localStorage.setItem('token', response.token);
    localStorage.setItem('userId', response.userId.toString());
    localStorage.setItem('email', response.email);
    localStorage.setItem('role', response.role);
  }

  /** Supprime toute la session. */
  logout(): void {
    localStorage.removeItem('lastActivity');
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
