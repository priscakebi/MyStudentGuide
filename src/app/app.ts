// Importe le décorateur permettant de créer un composant Angular.
import { Component, inject } from '@angular/core';

// Importe RouterOutlet pour afficher les pages
// définies dans app.routes.ts.
import { RouterOutlet } from '@angular/router';

import { IdleService } from './services/idle.service';

@Component({
  // Nom du composant racine de l'application.
  selector: 'app-root',

  // Permet d'utiliser <router-outlet> dans app.html.
  imports: [RouterOutlet],

  // Fichier HTML du composant principal.
  templateUrl: './app.html',

  // Fichier SCSS du composant principal.
  styleUrl: './app.scss'
})
export class App {

  /** Surveille l'inactivité de l'utilisateur connecté (déconnexion automatique). */
  idle = inject(IdleService);

  constructor() {
    this.idle.start();
  }
}
