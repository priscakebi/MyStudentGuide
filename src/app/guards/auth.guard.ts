import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/**
 * Guard d'authentification.
 *
 * Autorise la route uniquement si l'utilisateur possède un token valide
 * (non expiré). Sinon, redirection vers /login en mémorisant la page
 * demandée dans "returnUrl".
 *
 * Il ne vérifie pas le rôle : c'est le rôle de adminGuard.
 */
export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};
