import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/**
 * Guard réservé aux administrateurs.
 *
 * - non connecté (ou token expiré) → /admin-login ;
 * - connecté mais pas ADMIN        → /dashboard.
 *
 * Attention : ce guard ne fait qu'améliorer l'expérience utilisateur.
 * La vraie protection est faite par le backend (SecurityConfig).
 */
export const adminGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/admin-login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  if (authService.isAdmin()) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
