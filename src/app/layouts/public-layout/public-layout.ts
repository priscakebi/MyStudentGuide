/*
 * Importe le décorateur Component d'Angular.
 *
 * Il permet de déclarer notre layout comme un composant Angular.
 */
import { Component } from '@angular/core';


/*
 * Importe RouterOutlet.
 *
 * Le RouterOutlet permet d'afficher à l'intérieur du layout
 * les différentes pages publiques de l'application.
 */
import { RouterOutlet } from '@angular/router';


/*
 * Importe la navbar globale de MyStudentGuide.
 */
import { Navbar } from '../../components/navbar/navbar';


/*
 * Importe le footer global de MyStudentGuide.
 */
import { Footer } from '../../components/footer/footer';


/**
 * Layout utilisé pour les pages publiques de MyStudentGuide.
 *
 * Ce composant centralise les éléments communs aux pages
 * publiques :
 *
 * - Navbar
 * - contenu de la page
 * - Footer
 *
 * Les pages affichées à l'intérieur de ce layout sont :
 *
 * - /home
 * - /demarches
 * - /documents
 *
 * Le Dashboard n'utilise PAS ce layout.
 * Il possède sa propre structure avec sa sidebar.
 */
@Component({
  /*
   * Sélecteur du layout.
   *
   * Il pourrait être utilisé avec <app-public-layout>,
   * mais le composant est principalement utilisé par le système
   * de routage.
   */
  selector: 'app-public-layout',

  /*
   * Le composant est autonome.
   */
  standalone: true,

  /*
   * Composants/directives utilisés dans le template.
   */
  imports: [
    RouterOutlet,
    Navbar,
    Footer
  ],

  /*
   * Template HTML du layout.
   */
  templateUrl: './public-layout.html'
})
export class PublicLayout {
}