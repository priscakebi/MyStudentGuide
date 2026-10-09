import { routes } from './app.routes';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

/** Seul l'accueil (et les pages d'authentification) est accessible sans être connecté. */
describe('Routes — accès des visiteurs non connectés', () => {
  const publicLayoutChildren = () => routes.find((r) => r.path === '' && r.children)?.children ?? [];
  const find = (path: string) => publicLayoutChildren().find((r) => r.path === path);

  it('la racine redirige vers /home', () => {
    const root = routes.find((r) => r.path === '' && r.redirectTo);
    expect(root?.redirectTo).toBe('home');
  });

  it('toute URL inconnue redirige vers /home', () => {
    const wildcard = routes.find((r) => r.path === '**');
    expect(wildcard?.redirectTo).toBe('home');
  });

  it('/home est public', () => {
    expect(find('home')).toBeDefined();
    expect(find('home')?.canActivate).toBeUndefined();
  });

  it('/demarches, /demarches/:id et /documents exigent une connexion', () => {
    for (const path of ['demarches', 'demarches/:id', 'documents']) {
      expect(find(path)?.canActivate).toContain(authGuard);
    }
  });

  it('/dashboard exige une connexion et /admin exige le rôle ADMIN', () => {
    expect(routes.find((r) => r.path === 'dashboard')?.canActivate).toContain(authGuard);
    expect(routes.find((r) => r.path === 'admin')?.canActivate).toContain(adminGuard);
  });

  it('les pages d’authentification restent publiques', () => {
    for (const path of ['login', 'register', 'admin-login', 'forgot-password', 'reset-password']) {
      const route = routes.find((r) => r.path === path);
      expect(route).toBeDefined();
      expect(route?.canActivate).toBeUndefined();
    }
  });
});
