import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

import { environment } from '../../environments/environment';
import { nettoyerUrl, signalerErreur } from '../services/suivi-erreurs';

/**
 * API injoignable (502, 503, 504 : serveur arrêté, en redémarrage ou trop lent).
 * Ces pannes n'atteignent jamais l'API : seul le navigateur peut les signaler.
 * Les erreurs 500 sont déjà remontées par l'API elle-même.
 */
export const erreursServeurInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (req.url.startsWith(environment.apiUrl) && error.status >= 502 && error.status <= 504) {
        signalerErreur(new Error(`API injoignable (${error.status}) : ${req.method} ${nettoyerUrl(req.url)}`));
      }
      return throwError(() => error);
    })
  );
