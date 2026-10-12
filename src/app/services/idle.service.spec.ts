import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { IdleService } from './idle.service';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

describe('IdleService (déconnexion sur inactivité)', () => {
  let service: IdleService;
  let loggedIn: boolean;
  let logoutCalls: number;
  let navigations: { commands: any[]; extras: any }[];
  let routerUrl: string;

  const minutesAgo = (m: number, extraSeconds = 0) =>
    String(Date.now() - m * 60_000 - extraSeconds * 1000);

  const tick = () => (service as any).tick();

  beforeEach(() => {
    localStorage.clear();
    loggedIn = true;
    logoutCalls = 0;
    navigations = [];
    routerUrl = '/dashboard';

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            isLoggedIn: () => loggedIn,
            logout: () => { logoutCalls++; },
            refreshToken: () => ({ subscribe: () => {} }),
          },
        },
        {
          provide: Router,
          useValue: {
            get url() { return routerUrl; },
            navigate: (commands: any[], extras: any) => { navigations.push({ commands, extras }); return Promise.resolve(true); },
          },
        },
      ],
    });
    service = TestBed.inject(IdleService);
  });

  afterEach(() => localStorage.clear());

  it('ne fait rien tant que l’utilisateur est actif', () => {
    localStorage.setItem('lastActivity', String(Date.now()));
    tick();

    expect(service.warningVisible).toBe(false);
    expect(logoutCalls).toBe(0);
  });

  it('affiche l’avertissement juste avant l’expiration', () => {
    const warn = environment.idleWarningSeconds;
    localStorage.setItem('lastActivity', minutesAgo(environment.idleTimeoutMinutes, -(warn - 10)));
    tick();

    expect(service.warningVisible).toBe(true);
    expect(service.secondsLeft).toBeGreaterThan(0);
    expect(service.secondsLeft).toBeLessThanOrEqual(warn);
    expect(logoutCalls).toBe(0);
  });

  it('déconnecte et redirige vers /login après le délai d’inactivité', () => {
    localStorage.setItem('lastActivity', minutesAgo(environment.idleTimeoutMinutes, 5));
    tick();

    expect(logoutCalls).toBe(1);
    expect(navigations[0].commands).toEqual(['/login']);
    expect(navigations[0].extras.queryParams).toEqual({ reason: 'idle' });
  });

  it('un admin inactif est renvoyé vers /admin-login', () => {
    routerUrl = '/admin/users';
    localStorage.setItem('lastActivity', minutesAgo(environment.idleTimeoutMinutes, 5));
    tick();

    expect(navigations[0].commands).toEqual(['/admin-login']);
  });

  it('un visiteur non connecté n’est jamais déconnecté ni averti', () => {
    loggedIn = false;
    localStorage.setItem('lastActivity', minutesAgo(environment.idleTimeoutMinutes + 10));
    tick();

    expect(logoutCalls).toBe(0);
    expect(service.warningVisible).toBe(false);
  });

  it('« Rester connecté » ferme l’avertissement et relance le compteur', () => {
    localStorage.setItem('lastActivity', minutesAgo(environment.idleTimeoutMinutes, -30));
    tick();
    expect(service.warningVisible).toBe(true);

    service.stayConnected();
    tick();

    expect(service.warningVisible).toBe(false);
    expect(logoutCalls).toBe(0);
  });

  it('« Se déconnecter » ferme la session sans message d’inactivité', () => {
    service.logoutNow();

    expect(logoutCalls).toBe(1);
    expect(navigations[0].extras.queryParams).toEqual({});
  });
});
