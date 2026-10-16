// ============================================================
// ICÔNES AU TRAIT (même style que les menus latéraux)
// ============================================================
//
// <app-icone nom="cloche" />
//
// - taille : 1em (suit la taille du texte du conteneur) ;
// - couleur : currentColor (suit la couleur du texte) ;
// - décorative : masquée des lecteurs d'écran (aria-hidden).
//
// Remplace les emojis utilisés comme icônes, dont le rendu change
// d'un appareil à l'autre (couleurs, formes, carrés vides).
// ============================================================

import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const ICONES = {
  actualiser: ['M20 11a8 8 0 0 0-14.5-4.5L4 8', 'M4 3v5h5', 'M4 13a8 8 0 0 0 14.5 4.5L20 16', 'M20 21v-5h-5'],
  alerte: ['M10.3 4.1 2.6 17.5A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3L13.7 4.1a2 2 0 0 0-3.4 0Z', 'M12 9.5v4', 'M12 17h.01'],
  ampoule: ['M9 18h6', 'M10 21h4', 'M12 3a6 6 0 0 0-3.9 10.6c.6.6.9 1.4.9 2.4h6c0-1 .3-1.8.9-2.4A6 6 0 0 0 12 3Z'],
  batiment: ['M3 21h18', 'M12 3 3.5 7.5h17Z', 'M5 10.5v7', 'M9.7 10.5v7', 'M14.3 10.5v7', 'M19 10.5v7', 'M4 17.5h16'],
  boussole: ['M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0', 'm15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8Z'],
  bouclier: ['M12 3 4.5 6v5.5c0 4.6 3.1 8.2 7.5 9.5 4.4-1.3 7.5-4.9 7.5-9.5V6Z', 'm9 12 2 2 4-4'],
  cadenas: ['M6 11h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z', 'M8 11V7.5a4 4 0 0 1 8 0V11', 'M12 15v2'],
  calendrier: ['M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z', 'M4 10h16', 'M8 3v4', 'M16 3v4'],
  cible: ['M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0', 'M7 12a5 5 0 1 0 10 0a5 5 0 1 0-10 0', 'M11 12a1 1 0 1 0 2 0a1 1 0 1 0-2 0'],
  carte: ['M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z', 'M7 10.5a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0-3.6 0', 'M6.3 15.5a2.6 2.6 0 0 1 4.9 0', 'M14 10h4', 'M14 13.5h3'],
  cle: ['M4.5 15a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0', 'M10.5 12.5 19 4', 'M15.5 7.5l2.5 2.5', 'M13.5 9.5l2 2'],
  cloche: ['M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15Z', 'M10 20.5a2 2 0 0 0 4 0'],
  corbeille: ['M4 7h16', 'M9.5 7V4.5h5V7', 'M6 7l1 13.5h10L18 7', 'M10 11v6', 'M14 11v6'],
  crayon: ['M4 20h4L19 9l-4-4L4 16Z', 'M13.5 6.5l4 4'],
  diplome: ['m2 9 10-5 10 5-10 5Z', 'M6 11v5c3.5 2.2 8.5 2.2 12 0v-5', 'M22 9v6'],
  document: ['M6.5 3h7.5l4.5 4.5V20a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z', 'M14 3v4.5h4.5', 'M9 12.5h6', 'M9 16h6'],
  dossier: ['M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z'],
  engrenage: ['M9 12a3 3 0 1 0 6 0a3 3 0 1 0-6 0', 'M12 2.5v3', 'M12 18.5v3', 'M2.5 12h3', 'M18.5 12h3', 'M5.3 5.3l2.1 2.1', 'M16.6 16.6l2.1 2.1', 'M5.3 18.7l2.1-2.1', 'M16.6 7.4l2.1-2.1'],
  epingle: ['M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z', 'M9.5 9.5a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0'],
  etincelles: ['M11 3.5l1.6 4.4 4.4 1.6-4.4 1.6L11 15.5l-1.6-4.4L5 9.5l4.4-1.6Z', 'M18 14.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8Z'],
  etoile: ['m12 3.5 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8Z'],
  globe: ['M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0', 'M3.5 9h17', 'M3.5 15h17', 'M12 3c-2.5 2.6-3.7 5.6-3.7 9s1.2 6.4 3.7 9', 'M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9'],
  horloge: ['M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0', 'M12 7v5l3 2'],
  info: ['M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0', 'M12 11v5.5', 'M12 7.8h.01'],
  liste: ['M9 3.5h6a1 1 0 0 1 1 1V6H8V4.5a1 1 0 0 1 1-1Z', 'M8 5H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2', 'M9 11h6', 'M9 15h4'],
  maison: ['M3.5 10.5 12 3.5l8.5 7', 'M5.5 9v11h13V9', 'M10 20v-5.5h4V20'],
  sablier: ['M6 3h12', 'M6 21h12', 'M7.5 3c0 5 4.5 6 4.5 9s-4.5 4-4.5 9', 'M16.5 3c0 5-4.5 6-4.5 9s4.5 4 4.5 9'],
  telephone: ['M5.5 4h3.3l1.7 4.4-2.2 1.4a11 11 0 0 0 5.9 5.9l1.4-2.2 4.4 1.7v3.3a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 4 5.6 1.5 1.5 0 0 1 5.5 4Z'],
  utilisateur: ['M8 7.5a4 4 0 1 0 8 0a4 4 0 1 0-8 0', 'M4.5 20.5a7.5 7.5 0 0 1 15 0'],
  utilisateurs: ['M5.8 8.5a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0-6.4 0', 'M3 19.5a6 6 0 0 1 12 0', 'M16 5.5a3 3 0 0 1 0 6', 'M18 14a5.5 5.5 0 0 1 3 5.5'],
  valide: ['M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0', 'm8 12.2 2.8 2.8L16 9.5']
} satisfies Record<string, string[]>;

export type NomIcone = keyof typeof ICONES;

@Component({
  selector: 'app-icone',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      @for (d of chemins(); track $index) {
        <path [attr.d]="d" />
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex-shrink: 0;
      line-height: 0;
      vertical-align: -0.15em;
    }

    svg {
      width: 1em;
      height: 1em;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `
})
export class Icone {
  readonly nom = input.required<NomIcone>();

  protected readonly chemins = computed(() => ICONES[this.nom()]);
}
