import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';

import { authGuard } from './auth.guard';
import { adminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';

describe('Guards de sécurité (confort UX — la vraie protection est côté API)', () => {
  let loggedIn = false;
  let admin = false;
  let router: Router;

  const state = { url: '/admin/users' } as RouterStateSnapshot;
  const route = {} as ActivatedRouteSnapshot;

  beforeEach(() => {
    loggedIn = false;
    admin = false;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isLoggedIn: () => loggedIn, isAdmin: () => admin } },
      ],
    });
    router = TestBed.inject(Router);
  });

  const run = (guard: typeof authGuard) =>
    TestBed.runInInjectionContext(() => guard(route, state)) as boolean | UrlTree;

  it('authGuard laisse passer un utilisateur connecté', () => {
    loggedIn = true;
    expect(run(authGuard)).toBe(true);
  });

  it('authGuard renvoie un administrateur vers /admin (l’espace étudiant ne le concerne pas)', () => {
    loggedIn = true;
    admin = true;
    const result = run(authGuard) as UrlTree;
    expect(router.serializeUrl(result)).toBe('/admin');
  });

  it('authGuard redirige un anonyme vers /login en mémorisant returnUrl', () => {
    const result = run(authGuard) as UrlTree;
    expect(router.serializeUrl(result)).toBe('/login?returnUrl=%2Fadmin%2Fusers');
  });

  it('adminGuard laisse passer un admin', () => {
    loggedIn = true;
    admin = true;
    expect(run(adminGuard)).toBe(true);
  });

  it('adminGuard renvoie un étudiant connecté vers /dashboard', () => {
    loggedIn = true;
    const result = run(adminGuard) as UrlTree;
    expect(router.serializeUrl(result)).toBe('/dashboard');
  });

  it('adminGuard renvoie un anonyme vers /admin-login', () => {
    const result = run(adminGuard) as UrlTree;
    expect(router.serializeUrl(result)).toContain('/admin-login');
  });
});
