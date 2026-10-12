import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';

import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

describe('authInterceptor', () => {
  let http: HttpClient;
  let ctrl: HttpTestingController;
  let token: string | null;
  let logoutCalls: number;
  let router: Router;

  beforeEach(() => {
    token = 'JWT-SECRET';
    logoutCalls = 0;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { getToken: () => token, logout: () => { logoutCalls++; }, setToken: (t: string) => { token = t; } } },
      ],
    });
    http = TestBed.inject(HttpClient);
    ctrl = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => ctrl.verify());

  it('ajoute le Bearer token sur les requêtes vers notre API', () => {
    http.get(`${environment.apiUrl}/users/me`).subscribe();
    const req = ctrl.expectOne(`${environment.apiUrl}/users/me`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer JWT-SECRET');
    req.flush({});
  });

  it('N’ENVOIE PAS le token à un site tiers', () => {
    http.get('https://site-tiers.example/data').subscribe();
    const req = ctrl.expectOne('https://site-tiers.example/data');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('n’ajoute pas d’en-tête quand l’utilisateur n’est pas connecté', () => {
    token = null;
    http.get(`${environment.apiUrl}/categories`).subscribe();
    const req = ctrl.expectOne(`${environment.apiUrl}/categories`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });

  it('un 401 sur une route protégée déconnecte et redirige vers /login', () => {
    const nav = (router.navigate = (async () => true) as any);
    http.get(`${environment.apiUrl}/users/me`).subscribe({ error: () => {} });
    ctrl.expectOne(`${environment.apiUrl}/users/me`).flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(logoutCalls).toBe(1);
    expect(nav).toBeTruthy();
  });

  it('un 401 sur /auth/login (mauvais mot de passe) ne déconnecte pas', () => {
    http.post(`${environment.apiUrl}/auth/login`, {}).subscribe({ error: () => {} });
    ctrl.expectOne(`${environment.apiUrl}/auth/login`).flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(logoutCalls).toBe(0);
  });

  it('un 403 ne déconnecte pas (droits insuffisants ≠ session expirée)', () => {
    http.get(`${environment.apiUrl}/users`).subscribe({ error: () => {} });
    ctrl.expectOne(`${environment.apiUrl}/users`).flush({}, { status: 403, statusText: 'Forbidden' });

    expect(logoutCalls).toBe(0);
  });

  it('conserve un nouveau token renvoyé par l’API dans l’en-tête Authorization', () => {
    http.put(`${environment.apiUrl}/users/me`, {}).subscribe();
    ctrl.expectOne(`${environment.apiUrl}/users/me`).flush({}, { headers: { Authorization: 'Bearer NOUVEAU-TOKEN' } });

    expect(token).toBe('NOUVEAU-TOKEN');
  });
});
