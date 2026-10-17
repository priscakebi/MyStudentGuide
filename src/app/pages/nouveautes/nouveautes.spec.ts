import { TestBed } from '@angular/core/testing';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { provideRouter } from '@angular/router';

import { Nouveautes } from './nouveautes';
import { DERNIERE_NOUVEAUTE, NOUVEAUTES } from './nouveautes.data';
import { NouveautesService } from '../../services/nouveautes.service';
import { LangueService } from '../../i18n/langue.service';

// Dates affichées en français (enregistré dans app.config.ts pour l'application).
registerLocaleData(localeFr);

describe('Nouveautés', () => {
  beforeEach(() => {
    localStorage.removeItem('nouveautes-vues');
    TestBed.configureTestingModule({ imports: [Nouveautes], providers: [provideRouter([])] });
    TestBed.inject(LangueService).changer('fr');
  });

  it('les entrées sont complètes et la plus récente est en tête', () => {
    for (const n of NOUVEAUTES) {
      expect(n.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(n.titre && n.titreEn && n.texte && n.texteEn).toBeTruthy();
    }
    expect(NOUVEAUTES[0].date).toBe(DERNIERE_NOUVEAUTE);
  });

  it('affiche toutes les nouveautés regroupées par date, en anglais aussi', () => {
    const fixture = TestBed.createComponent(Nouveautes);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelectorAll('.carte').length).toBe(NOUVEAUTES.length);
    expect(element.querySelectorAll('.jour').length).toBe(new Set(NOUVEAUTES.map((n) => n.date)).size);

    TestBed.inject(LangueService).changer('en');
    fixture.detectChanges();
    expect(element.querySelector('.carte h3')?.textContent).toContain(NOUVEAUTES[0].titreEn);
  });

  it('marque les nouveautés comme vues et signale celles d’après la dernière visite', () => {
    localStorage.setItem('nouveautes-vues', '2026-10-16');
    const service = TestBed.inject(NouveautesService);
    const attendues = NOUVEAUTES.filter((n) => n.date > '2026-10-16').length;
    expect(service.nonVues()).toBe(attendues);

    const fixture = TestBed.createComponent(Nouveautes);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.carte.recente').length).toBe(attendues);
    expect(service.nonVues()).toBe(0);
    expect(localStorage.getItem('nouveautes-vues')).toBe(DERNIERE_NOUVEAUTE);
  });
});
