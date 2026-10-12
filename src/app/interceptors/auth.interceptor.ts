import { HttpErrorResponse, HttpEventType, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';

import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor HTTP.
 *
 * 1. Ajoute "Authorization: Bearer <token>" uniquement sur les requêtes
 *    envoyées à NOTRE API (le token n'est jamais envoyé à un autre site).
 * 2. Si l'API répond 401 (token expiré ou invalide) sur une route protégée,
 *    la session est supprimée et l'utilisateur est renvoyé vers /login
 *    (ou /admin-login s'il se trouvait dans l'espace administrateur).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const isApiRequest = req.url.startsWith(environment.apiUrl);
  const isAuthRoute = req.url.startsWith(`${environment.apiUrl}/auth/`);

  const token = authService.getToken();

  const request = (token && isApiRequest)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(request).pipe(
    // L'API peut renvoyer un nouveau token dans l'en-tête Authorization
    // (ex. après un changement d'adresse e-mail) : on le conserve.
    tap((event) => {
      if (isApiRequest && event.type === HttpEventType.Response) {
        const header = event.headers.get('Authorization');
        if (header?.startsWith('Bearer ') && token) {
          authService.setToken(header.substring(7));
        }
      }
    }),
    catchError((error: HttpErrorResponse) => {

      // Un 401 sur /auth/login = mauvais mot de passe : ce n'est pas une session expirée.
      if (error.status === 401 && isApiRequest && !isAuthRoute && token) {
        // Un admin dont la session expire retombe sur SA page de connexion.
        const target = router.url.startsWith('/admin') ? '/admin-login' : '/login';

        authService.logout();
        router.navigate([target], {
          queryParams: { sessionExpired: true }
        });
      }

      return throwError(() => error);
    })
  );
};
