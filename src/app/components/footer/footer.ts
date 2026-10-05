// ============================================================
// FOOTER - MyStudentGuide
// ============================================================
//
// Composant réutilisable contenant le pied de page
// de l'application.
//
// Il peut être utilisé sur toutes les pages du dashboard.
// ============================================================

import { Component } from '@angular/core';

@Component({

  // Sélecteur permettant d'utiliser le footer :
  // <app-footer></app-footer>
  selector: 'app-footer',

  // Composant standalone.
  standalone: true,

  // Template HTML du footer.
  templateUrl: './footer.html',

  // Styles du footer.
  styleUrl: './footer.scss'
})
export class Footer {
}