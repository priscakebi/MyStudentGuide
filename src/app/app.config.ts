import {
  ApplicationConfig,
  ErrorHandler,
  LOCALE_ID,
  provideZoneChangeDetection
} from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { provideRouter, TitleStrategy } from '@angular/router';
import {
  provideHttpClient,
  withFetch,
  withInterceptors
} from '@angular/common/http';

import { routes } from './app.routes';

// Import de l'interceptor qui ajoute automatiquement
// le token JWT aux requêtes HTTP.
import { authInterceptor } from './interceptors/auth.interceptor';
import { erreursServeurInterceptor } from './interceptors/erreurs-serveur.interceptor';
import { PageTitleStrategy } from './services/page-title.strategy';
import { SuiviErreursHandler } from './services/suivi-erreurs';

// Dates et nombres au format français (« jeudi 15 octobre », « 4,5 »).
registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [

    // Langue de l'application : le pipe date affiche les jours et mois en français.
    { provide: LOCALE_ID, useValue: 'fr' },

    // Détection de changements basée sur zone.js.
    //
    // CORRECTION DU "DOUBLE CLIC" : Angular 21 fonctionne par défaut SANS
    // zone.js (mode "zoneless"). Or les pages de l'application modifient des
    // propriétés simples (this.loading = false, this.items = data...) dans les
    // callbacks HTTP. Sans zone.js, Angular n'est pas prévenu que les données
    // ont changé : l'écran ne se met à jour qu'au clic suivant.
    // Avec zone.js, l'écran est rafraîchi après chaque réponse du serveur.
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Configuration du système de routage Angular.
    provideRouter(routes),

    // Titre de l'onglet : « Titre de la page · MyStudentGuide »
    // (titres déclarés dans app.routes.ts).
    { provide: TitleStrategy, useExisting: PageTitleStrategy },

    // Erreurs non prévues : console + suivi des erreurs (Sentry, si configuré).
    { provide: ErrorHandler, useClass: SuiviErreursHandler },

    // Configuration de HttpClient.
    //
    // withFetch() permet d'utiliser l'API Fetch du navigateur.
    //
    // withInterceptors([authInterceptor]) indique à Angular
    // d'utiliser notre interceptor pour les requêtes HTTP.
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, erreursServeurInterceptor])
    )
  ]
};