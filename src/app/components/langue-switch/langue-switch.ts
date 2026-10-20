import { Component, inject, input } from '@angular/core';
import { Langue, LangueService } from '../../i18n/langue.service';
import { TPipe } from '../../i18n/t.pipe';
import { ThemeSwitch } from '../theme-switch/theme-switch';

/**
 * Bouton FR / EN : change la langue de l'interface étudiante,
 * suivi du bouton soleil / lune du mode sombre.
 * `sombre` : variante pour un fond foncé (barre latérale de l'espace étudiant).
 */
@Component({
  selector: 'app-langue-switch',
  standalone: true,
  imports: [TPipe, ThemeSwitch],
  template: `
    <div class="reglages">
    <div class="switch" [class.sombre]="sombre()" role="group" [attr.aria-label]="'langue.choisir' | t">
      @for (l of langues; track l) {
        <button
          type="button"
          [class.active]="langueService.langue() === l"
          [attr.aria-pressed]="langueService.langue() === l"
          [attr.lang]="l"
          [title]="(l === 'fr' ? 'langue.fr' : 'langue.en') | t"
          (click)="langueService.changer(l)"
        >{{ l.toUpperCase() }}</button>
      }
    </div>
    <app-theme-switch [sombre]="sombre()" />
    </div>
  `,
  styles: `
    .reglages {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .switch {
      display: inline-flex;
      flex-shrink: 0;
      padding: 3px;
      border: 1px solid var(--msg-border);
      border-radius: 999px;
      background: var(--msg-background);
    }

    button {
      min-width: 36px;
      padding: 5px 9px;
      border: none;
      border-radius: 999px;
      background: transparent;
      color: var(--msg-text-light);
      font: inherit;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.04em;
      cursor: pointer;
      transition: background 0.15s ease, color 0.15s ease;
    }

    button:hover {
      color: var(--msg-blue);
    }

    button.active {
      background: #1646a0;
      color: #ffffff;
    }

    button:focus-visible {
      outline: 2px solid var(--msg-focus);
      outline-offset: 2px;
    }

    .sombre {
      border-color: rgba(255, 255, 255, 0.16);
      background: rgba(255, 255, 255, 0.06);
    }

    .sombre button {
      color: rgba(255, 255, 255, 0.7);
    }

    .sombre button:hover {
      color: #ffffff;
    }

    .sombre button.active {
      background: #ffffff;
      color: #1646a0;
    }
  `
})
export class LangueSwitch {
  protected readonly langueService = inject(LangueService);
  protected readonly langues: Langue[] = ['fr', 'en'];

  readonly sombre = input(false);
}
