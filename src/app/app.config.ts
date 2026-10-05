import {
  ApplicationConfig,
  provideZoneChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withFetch,
  withInterceptors
} from '@angular/common/http';

import { routes } from './app.routes';

// Import de l'interceptor qui ajoute automatiquement
// le token JWT aux requêtes HTTP.
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [

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

    // Configuration de HttpClient.
    //
    // withFetch() permet d'utiliser l'API Fetch du navigateur.
    //
    // withInterceptors([authInterceptor]) indique à Angular
    // d'utiliser notre interceptor pour les requêtes HTTP.
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    )
  ]
};