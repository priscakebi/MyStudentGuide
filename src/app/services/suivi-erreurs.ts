// ============================================================
// SUIVI DES ERREURS (Sentry)
// ============================================================
//
// Les erreurs JavaScript des étudiants sont envoyées à Sentry pour être
// corrigées avant qu'ils ne s'en plaignent.
//
// - inactif tant que `environment.sentryDsn` est vide ;
// - Sentry n'est téléchargé qu'à ce moment-là (fichier séparé) : le site
//   ne s'alourdit pas quand le suivi est désactivé ;
// - aucune donnée personnelle : ni adresse IP, ni utilisateur, ni
//   paramètres d'adresse (jeton de réinitialisation…), adresses e-mail masquées.
// ============================================================

import { ErrorHandler, Injectable } from '@angular/core';
import type { Breadcrumb, ErrorEvent } from '@sentry/angular';

import { environment } from '../../environments/environment';

type Sentry = typeof import('./suivi-erreurs.sentry');

let chargement: Promise<Sentry | null> | null = null;

/** Démarre le suivi (au lancement de l'application). Sans DSN, ne fait rien. */
export function demarrerSuiviErreurs(dsn: string = environment.sentryDsn): Promise<Sentry | null> {
  if (!dsn) {
    return Promise.resolve(null);
  }
  chargement ??= import('./suivi-erreurs.sentry')
    .then((sentry) => {
      sentry.init({
        dsn,
        environment: environment.production ? 'production' : 'developpement',
        sendDefaultPii: false,
        // Uniquement les erreurs : pas de comptage des visites (sessions).
        integrations: (parDefaut) => parDefaut.filter((integration) => integration.name !== 'BrowserSession'),
        // Bruit sans conséquence pour l'utilisateur.
        ignoreErrors: ['ResizeObserver loop', 'Non-Error promise rejection captured'],
        beforeSend: nettoyerEvenement,
        beforeBreadcrumb: nettoyerBreadcrumb
      });
      return sentry;
    })
    .catch(() => null);
  return chargement;
}

/** Signale une erreur (sans effet si le suivi est désactivé). */
export function signalerErreur(erreur: unknown): void {
  void chargement?.then((sentry) => sentry?.captureException(erreur));
}

/** Gestionnaire d'erreurs Angular : console (comme avant) + Sentry. */
@Injectable()
export class SuiviErreursHandler implements ErrorHandler {
  handleError(erreur: unknown): void {
    console.error(erreur);
    signalerErreur(erreur);
  }
}

// ------------------------------------------------------------
// NETTOYAGE DES DONNÉES ENVOYÉES
// ------------------------------------------------------------

const EMAIL = /[\w.+-]+@[\w-]+(\.[\w-]+)+/g;

/** Remplace les adresses e-mail d'un texte par « [e-mail] ». */
export function masquerEmails(texte: string): string;
export function masquerEmails(texte: string | undefined): string | undefined;
export function masquerEmails(texte: string | undefined): string | undefined {
  return texte?.replace(EMAIL, '[e-mail]');
}

/** Adresse sans paramètres ni ancre (« /reset-password?token=… » → « /reset-password »). */
export function nettoyerUrl(url: string): string;
export function nettoyerUrl(url: string | undefined): string | undefined;
export function nettoyerUrl(url: string | undefined): string | undefined {
  return url?.split(/[?#]/)[0];
}

export function nettoyerEvenement(event: ErrorEvent): ErrorEvent {
  delete event.user;
  if (event.request) {
    event.request.url = nettoyerUrl(event.request.url);
    delete event.request.query_string;
    delete event.request.cookies;
    delete event.request.headers;
  }
  event.message = masquerEmails(event.message);
  for (const exception of event.exception?.values ?? []) {
    exception.value = masquerEmails(exception.value);
  }
  return event;
}

export function nettoyerBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb | null {
  // Les messages de la console peuvent contenir n'importe quoi : ignorés.
  if (breadcrumb.category === 'console') {
    return null;
  }
  breadcrumb.message = masquerEmails(breadcrumb.message);
  const data = breadcrumb.data;
  if (data) {
    for (const cle of ['url', 'from', 'to']) {
      if (typeof data[cle] === 'string') {
        data[cle] = nettoyerUrl(data[cle]);
      }
    }
  }
  return breadcrumb;
}
