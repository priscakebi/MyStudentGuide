// ============================================================
// CHAMP AVEC SUGGESTIONS (liste déroulante pendant la frappe)
// ============================================================
//
// <app-champ-suggestions inputId="ville" name="ville" [(ngModel)]="…"
//   [source]="suggestions.villes" required />
//
// - motif ARIA « combobox » : ↑ / ↓ pour parcourir, Entrée pour choisir,
//   Échap pour fermer ; le nombre de suggestions est annoncé ;
// - compatible ngModel (required, minlength… s'appliquent à la valeur) ;
// - libre = false : seule une suggestion choisie devient la valeur
//   (ex. nationalité) ; sinon le texte saisi est accepté tel quel.
// ============================================================

import {
  Component, DestroyRef, ElementRef, booleanAttribute, forwardRef, inject, input, signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable, Subject, catchError, debounce, of, switchMap, tap, timer } from 'rxjs';

import { TPipe } from '../../i18n/t.pipe';
import { Suggestion } from '../../services/suggestions.service';

let compteur = 0;

@Component({
  selector: 'app-champ-suggestions',
  standalone: true,
  imports: [TPipe],
  templateUrl: './champ-suggestions.html',
  styleUrl: './champ-suggestions.scss',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ChampSuggestions), multi: true }]
})
export class ChampSuggestions implements ControlValueAccessor {

  /** id de l'input (pour le <label for>). */
  readonly inputId = input.required<string>();
  readonly placeholder = input('');
  readonly autocomplete = input('off');
  readonly maxlength = input<number | null>(null);
  readonly describedBy = input<string | null>(null);

  /** Recherche des suggestions pour un texte saisi. */
  readonly source = input.required<(texte: string) => Observable<Suggestion[]>>();

  /** Texte à afficher pour une valeur enregistrée (ex. nationalité en anglais). */
  readonly libelleDe = input<((valeur: string) => Observable<string>) | null>(null);

  readonly minCaracteres = input(2);
  readonly delai = input(250);

  /** Faux : la valeur ne peut venir que d'une suggestion. */
  readonly libre = input(true, { transform: booleanAttribute });

  protected readonly listeId = `suggestions-${++compteur}`;

  protected readonly texte = signal('');
  protected readonly suggestions = signal<Suggestion[]>([]);
  protected readonly ouverte = signal(false);
  protected readonly active = signal(-1);
  protected readonly chargement = signal(false);
  protected readonly recherche = signal(false);
  protected readonly desactive = signal(false);

  /** Valeur choisie (ou texte libre) transmise au formulaire. */
  private valeur = '';
  private onChange: (valeur: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  private readonly saisies = new Subject<string>();
  private readonly hote = inject(ElementRef<HTMLElement>);

  constructor() {
    this.saisies.pipe(
      tap(() => this.chargement.set(true)),
      // Délai lu à chaque frappe (les entrées ne sont pas encore connues dans le constructeur).
      debounce(() => timer(this.delai())),
      switchMap((texte) => texte.trim().length < this.minCaracteres()
        ? of(null)
        : this.source()(texte).pipe(catchError(() => of([])))),
      takeUntilDestroyed(inject(DestroyRef))
    ).subscribe((resultats) => {
      this.chargement.set(false);
      this.recherche.set(resultats !== null);
      this.suggestions.set(resultats ?? []);
      this.active.set(-1);
      this.ouverte.set(resultats !== null);
    });
  }

  // ---------------------------------------------------------
  // ControlValueAccessor
  // ---------------------------------------------------------

  writeValue(valeur: string | null): void {
    this.valeur = valeur ?? '';
    this.texte.set(this.valeur);
    const libelleDe = this.libelleDe();
    if (this.valeur && libelleDe) {
      libelleDe(this.valeur).subscribe((libelle) => {
        if (this.texte() === this.valeur) this.texte.set(libelle);
      });
    }
  }

  registerOnChange(fn: (valeur: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(desactive: boolean): void {
    this.desactive.set(desactive);
  }

  // ---------------------------------------------------------
  // Interactions
  // ---------------------------------------------------------

  protected saisir(texte: string): void {
    this.texte.set(texte);
    if (this.libre()) {
      this.valeur = texte;
      this.onChange(texte);
    } else if (!texte.trim()) {
      this.valeur = '';
      this.onChange('');
    }
    this.saisies.next(texte);
  }

  protected choisir(suggestion: Suggestion): void {
    this.valeur = suggestion.valeur;
    this.texte.set(suggestion.libelle);
    this.onChange(suggestion.valeur);
    this.fermer();
  }

  protected clavier(event: KeyboardEvent): void {
    const n = this.suggestions().length;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.ouverte()) {
          this.saisies.next(this.texte());
        } else if (n) {
          this.active.set((this.active() + 1) % n);
          this.montrerActive();
        }
        break;
      case 'ArrowUp':
        if (this.ouverte() && n) {
          event.preventDefault();
          this.active.set((this.active() - 1 + n) % n);
          this.montrerActive();
        }
        break;
      case 'Enter':
        if (this.ouverte() && this.active() >= 0) {
          event.preventDefault();
          this.choisir(this.suggestions()[this.active()]);
        }
        break;
      case 'Escape':
        if (this.ouverte()) {
          event.preventDefault();
          this.fermer();
        }
        break;
    }
  }

  /** Sortie du champ : sans choix, une valeur imposée (libre = false) revient à la dernière valide. */
  protected quitter(): void {
    this.fermer();
    this.onTouched();
    if (!this.libre() && this.texte().trim()) {
      const exacte = this.suggestions().find(
        (s) => s.libelle.localeCompare(this.texte().trim(), 'fr', { sensitivity: 'base' }) === 0
      );
      if (exacte) {
        this.choisir(exacte);
      } else if (this.texte() !== this.valeur) {
        this.writeValue(this.valeur);
      }
    }
  }

  protected idOption(index: number): string {
    return `${this.listeId}-${index}`;
  }

  private fermer(): void {
    this.ouverte.set(false);
    this.active.set(-1);
  }

  private montrerActive(): void {
    queueMicrotask(() => this.hote.nativeElement
      .querySelector(`#${this.idOption(this.active())}`)
      ?.scrollIntoView({ block: 'nearest' }));
  }
}
