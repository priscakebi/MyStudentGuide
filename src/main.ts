import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { demarrerSuiviErreurs, signalerErreur } from './app/services/suivi-erreurs';

// Suivi des erreurs (Sentry), seulement si un DSN est configuré.
void demarrerSuiviErreurs();

bootstrapApplication(App, appConfig)
  .catch((err) => {
    console.error(err);
    signalerErreur(err);
  });
