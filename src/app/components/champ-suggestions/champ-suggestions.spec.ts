import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { ChampSuggestions } from './champ-suggestions';
import { Suggestion } from '../../services/suggestions.service';

const LISTE: Suggestion[] = [
  { valeur: 'Ivoirienne', libelle: 'Ivoirienne', detail: "Côte d'Ivoire" },
  { valeur: 'Italienne', libelle: 'Italienne', detail: 'Italie' }
];

@Component({
  standalone: true,
  imports: [ChampSuggestions, FormsModule],
  template: `
    <app-champ-suggestions inputId="nat" name="nat" [(ngModel)]="valeur"
      [source]="source" [libre]="libre" [delai]="0" [minCaracteres]="1" />
  `
})
class Hote {
  valeur = '';
  libre = false;
  source = (texte: string) => of(LISTE.filter((s) => s.libelle.toLowerCase().startsWith(texte.toLowerCase())));
}

describe('ChampSuggestions', () => {
  const attendre = () => new Promise((r) => setTimeout(r, 10));

  async function creer(libre: boolean) {
    const fixture = TestBed.createComponent(Hote);
    fixture.componentInstance.libre = libre;
    fixture.detectChanges();
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    const taper = async (texte: string) => {
      input.value = texte;
      input.dispatchEvent(new Event('input'));
      await attendre();
      fixture.detectChanges();
    };
    const touche = (key: string) => {
      input.dispatchEvent(new KeyboardEvent('keydown', { key }));
      fixture.detectChanges();
    };
    return { fixture, input, taper, touche };
  }

  it('propose les suggestions et se choisit au clavier', async () => {
    const { fixture, input, taper, touche } = await creer(false);

    await taper('i');
    const options = fixture.nativeElement.querySelectorAll('[role="option"]');
    expect(options.length).toBe(2);
    expect(input.getAttribute('aria-expanded')).toBe('true');

    touche('ArrowDown');
    expect(input.getAttribute('aria-activedescendant')).toBe(options[0].id);

    touche('Enter');
    await fixture.whenStable();
    expect(fixture.componentInstance.valeur).toBe('Ivoirienne');
    expect(input.value).toBe('Ivoirienne');
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });

  it('refuse une saisie hors liste quand la valeur est imposée', async () => {
    const { fixture, input, taper } = await creer(false);

    await taper('xyz');
    expect(fixture.nativeElement.querySelector('.vide')).not.toBeNull();

    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.valeur).toBe('');
    expect(input.value).toBe('');
  });

  it('accepte le texte saisi quand la saisie est libre', async () => {
    const { fixture, taper } = await creer(true);

    await taper('BTS Lycée Ampère');
    await fixture.whenStable();
    expect(fixture.componentInstance.valeur).toBe('BTS Lycée Ampère');
  });
});
