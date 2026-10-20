import { Component, inject, input } from '@angular/core';

import { ThemeService } from '../../services/theme.service';
import { TPipe } from '../../i18n/t.pipe';

/**
 * Bouton soleil / lune : passe du mode clair au mode sombre (choix mémorisé).
 * `sombre` : variante pour un fond foncé (barres latérales).
 */
@Component({
  selector: 'app-theme-switch',
  standalone: true,
  imports: [TPipe],
  template: `
    <button
      type="button"
      class="theme"
      [class.sur-fonce]="sombre()"
      [attr.aria-pressed]="themeService.theme() === 'dark'"
      [attr.aria-label]="'theme.sombre' | t"
      [title]="(themeService.theme() === 'dark' ? 'theme.passerClair' : 'theme.passerSombre') | t"
      (click)="themeService.basculer()"
    >
      @if (themeService.theme() === 'dark') {
        <!-- Soleil : revenir au mode clair -->
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
        </svg>
      } @else {
        <!-- Lune : passer au mode sombre -->
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
        </svg>
      }
    </button>
  `,
  styles: `
    :host {
      display: inline-flex;
    }

    .theme {
      display: inline-grid;
      place-items: center;
      width: 34px;
      height: 34px;
      padding: 0;
      border: 1px solid var(--msg-border);
      border-radius: 999px;
      background: var(--msg-background);
      color: var(--msg-text-light);
      cursor: pointer;
      transition: color 0.15s ease, border-color 0.15s ease;
    }

    .theme:hover {
      border-color: var(--msg-blue);
      color: var(--msg-blue);
    }

    .theme:focus-visible {
      outline: 2px solid var(--msg-focus);
      outline-offset: 2px;
    }

    svg {
      width: 17px;
      height: 17px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .sur-fonce {
      border-color: rgba(255, 255, 255, 0.16);
      background: rgba(255, 255, 255, 0.06);
      color: rgba(255, 255, 255, 0.8);
    }

    .sur-fonce:hover {
      border-color: rgba(255, 255, 255, 0.4);
      color: #ffffff;
    }
  `
})
export class ThemeSwitch {
  protected readonly themeService = inject(ThemeService);

  readonly sombre = input(false);
}
