// Importe le décorateur permettant de créer un composant Angular.
import { Component } from '@angular/core';

// Importe RouterOutlet pour afficher les pages
// définies dans app.routes.ts.
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './components/footer/footer';

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
}