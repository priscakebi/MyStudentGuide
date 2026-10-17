import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { ChampTelephone, telephoneLisible, telephoneValide } from './champ-telephone';

describe('telephoneValide / telephoneLisible', () => {
  it('accepte les numéros valides de tous pays et les anciens numéros français', () => {
    expect(telephoneValide('+33612345678')).toBe(true);
    expect(telephoneValide('0612345678')).toBe(true);
    expect(telephoneValide('+2250712345678')).toBe(true);
    expect(telephoneValide('+221771234567')).toBe(true);
  });

  it('refuse les numéros incomplets ou vides', () => {
    expect(telephoneValide('+3361234')).toBe(false);
    expect(telephoneValide('061234')).toBe(false);
    expect(telephoneValide('')).toBe(false);
    expect(telephoneValide(null)).toBe(false);
  });

  it('affiche le numéro au format international', () => {
    expect(telephoneLisible('0612345678')).toBe('+33 6 12 34 56 78');
    expect(telephoneLisible('pas un numéro')).toBe('pas un numéro');
  });
});

@Component({
  standalone: true,
  imports: [ChampTelephone, FormsModule],
  template: `<app-champ-telephone inputId="tel" name="tel" [(ngModel)]="valeur" />`
})
class Hote {
  valeur = '';
}

describe('ChampTelephone', () => {
  async function creer(valeur = '') {
    const fixture = TestBed.createComponent(Hote);
    fixture.componentInstance.valeur = valeur;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');
    const taper = async (texte: string) => {
      input.value = texte;
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      await fixture.whenStable();
    };
    return { fixture, input, select, taper };
  }

  it('enregistre le numéro national au format international (France par défaut)', async () => {
    const { fixture, select, taper } = await creer();
    expect(select.value).toBe('FR');

    await taper('06 12 34 56 78');
    expect(fixture.componentInstance.valeur).toBe('+33612345678');
  });

  it('déduit le pays de l’indicatif tapé', async () => {
    const { fixture, select, taper } = await creer();

    await taper('+225 07 12 34 56 78');
    fixture.detectChanges();
    expect(select.value).toBe('CI');
    expect(fixture.componentInstance.valeur).toBe('+2250712345678');
  });

  it('reprend un numéro enregistré avec son pays', async () => {
    const { input, select } = await creer('+221771234567');
    expect(select.value).toBe('SN');
    expect(input.value).toBe('77 123 45 67');
  });
});
