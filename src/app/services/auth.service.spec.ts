import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

/** Fabrique un faux JWT (non signé) avec une date d'expiration donnée, suffisant pour tester la lecture côté front. */
function fakeJwt(expSecondsFromNow: number): string {
  const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  const exp = Math.floor(Date.now() / 1000) + expSecondsFromNow;
  return `${b64({ alg: 'HS256' })}.${b64({ sub: 'prisca@email.com', exp })}.signature`;
}

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('login() enregistre la session renvoyée par l’API', () => {
    const token = fakeJwt(3600);
    service.login({ email: 'prisca@email.com', password: 'MotDePasse123' } as any).subscribe();

    const req = http.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush({ token, userId: 7, email: 'prisca@email.com', role: 'ETUDIANT' });

    expect(service.getToken()).toBe(token);
    expect(service.getUserId()).toBe(7);
    expect(service.getRole()).toBe('ETUDIANT');
    expect(service.isLoggedIn()).toBe(true);
    expect(service.isAdmin()).toBe(false);
  });

  it('login() en échec n’enregistre rien', () => {
    service.login({ email: 'a@b.com', password: 'x' } as any).subscribe({ error: () => {} });
    http.expectOne(`${environment.apiUrl}/auth/login`).flush({ message: 'KO' }, { status: 401, statusText: 'Unauthorized' });

    expect(service.getToken()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });

  it('un token expiré n’est pas une session valide et est nettoyé', () => {
    service.saveSession({ token: fakeJwt(-60), userId: 1, email: 'a@b.com', role: 'ETUDIANT' } as any);

    expect(service.isLoggedIn()).toBe(false);
    expect(service.getToken()).toBeNull();
  });

  it('un token mal formé est refusé', () => {
    localStorage.setItem('token', 'pas-un-jwt');

    expect(service.isLoggedIn()).toBe(false);
  });

  it('isAdmin() exige un token valide ET le rôle ADMIN', () => {
    service.saveSession({ token: fakeJwt(3600), userId: 1, email: 'admin@email.com', role: 'ADMIN' } as any);
    expect(service.isAdmin()).toBe(true);

    // falsification du rôle dans le localStorage sans token valide
    localStorage.removeItem('token');
    expect(service.isAdmin()).toBe(false);
  });

  it('logout() supprime toute la session', () => {
    service.saveSession({ token: fakeJwt(3600), userId: 1, email: 'a@b.com', role: 'ETUDIANT' } as any);
    service.logout();

    expect(service.getToken()).toBeNull();
    expect(service.getUserId()).toBeNull();
    expect(service.getRole()).toBeNull();
    expect(service.getEmail()).toBeNull();
  });

  it('forgotPassword() envoie email + espace', () => {
    service.forgotPassword('a@b.com', 'ETUDIANT').subscribe();
    const req = http.expectOne(`${environment.apiUrl}/auth/forgot-password`);
    expect(req.request.body).toEqual({ email: 'a@b.com', espace: 'ETUDIANT' });
    req.flush({ message: 'ok' });
  });

  it('resetPassword() envoie token + nouveau mot de passe', () => {
    service.resetPassword('tok', 'NouveauMdp123').subscribe();
    const req = http.expectOne(`${environment.apiUrl}/auth/reset-password`);
    expect(req.request.body).toEqual({ token: 'tok', newPassword: 'NouveauMdp123' });
    req.flush({ message: 'ok' });
  });

  it('refreshToken() remplace le token sans toucher au reste de la session', () => {
    service.saveSession({ token: fakeJwt(60), userId: 3, email: 'a@b.com', role: 'ETUDIANT' } as any);
    const nouveau = fakeJwt(1800);

    service.refreshToken().subscribe();
    const req = http.expectOne(`${environment.apiUrl}/auth/refresh`);
    expect(req.request.method).toBe('POST');
    req.flush({ token: nouveau, userId: 3, email: 'a@b.com', role: 'ETUDIANT' });

    expect(service.getToken()).toBe(nouveau);
    expect(service.getUserId()).toBe(3);
  });

  it('la connexion démarre le compteur d’inactivité et la déconnexion le supprime', () => {
    service.saveSession({ token: fakeJwt(60), userId: 1, email: 'a@b.com', role: 'ETUDIANT' } as any);
    expect(localStorage.getItem('lastActivity')).not.toBeNull();

    service.logout();
    expect(localStorage.getItem('lastActivity')).toBeNull();
  });
});
