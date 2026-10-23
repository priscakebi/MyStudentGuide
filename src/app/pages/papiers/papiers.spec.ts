import { TestBed } from '@angular/core/testing';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { Papiers } from './papiers';
import { LangueService } from '../../i18n/langue.service';
import { environment } from '../../../environments/environment';

// Dates affichées en français (enregistré dans app.config.ts pour l'application).
registerLocaleData(localeFr);

/** Date au format AAAA-MM-JJ, à n jours d'aujourd'hui. */
function dansJours(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString('sv-SE');
}

describe('Mes papiers', () => {
  const api = `${environment.apiUrl}/mes-papiers`;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Papiers],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    http = TestBed.inject(HttpTestingController);
    TestBed.inject(LangueService).changer('fr');
  });

  afterEach(() => http.verify());

  function creer() {
    const fixture = TestBed.createComponent(Papiers);
    fixture.detectChanges();
    http.expectOne(api).flush([
      { id: 1, type: 'MUTUELLE', libelle: 'Mutuelle LMDE', dateExpiration: dansJours(-3) },
      { id: 2, type: 'CARTE_ETUDIANT', libelle: null, dateExpiration: dansJours(20) },
      { id: 3, type: 'PASSEPORT', libelle: null, dateExpiration: dansJours(800) }
    ]);
    fixture.detectChanges();
    return fixture;
  }

  it('affiche chaque papier avec son état (expiré, bientôt, valide)', () => {
    const element: HTMLElement = creer().nativeElement;
    const papiers = element.querySelectorAll('li.papier');

    expect(papiers.length).toBe(3);
    expect(papiers[0].classList).toContain('expire');
    expect(papiers[1].classList).toContain('bientot');
    expect(papiers[1].querySelector('.badge')?.textContent).toContain('Dans 20 jour(s)');
    expect(papiers[1].querySelector('strong')?.textContent).toContain('Carte étudiante');
    expect(papiers[2].classList).toContain('valide');
  });

  it('exige un nom pour « Autre » avant d’envoyer', async () => {
    const fixture = creer();
    const element: HTMLElement = fixture.nativeElement;
    await fixture.whenStable();

    const type = element.querySelector<HTMLSelectElement>('#papier-type')!;
    type.value = 'AUTRE';
    type.dispatchEvent(new Event('change'));
    const date = element.querySelector<HTMLInputElement>('#papier-date')!;
    date.value = dansJours(100);
    date.dispatchEvent(new Event('input'));
    element.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    http.expectNone(api);
    expect(element.querySelector('[role="alert"]')?.textContent).toContain('un nom pour « Autre »');
  });

  it('ajoute un papier et affiche la liste renvoyée par l’API', async () => {
    const fixture = creer();
    const element: HTMLElement = fixture.nativeElement;
    await fixture.whenStable();

    const type = element.querySelector<HTMLSelectElement>('#papier-type')!;
    type.value = 'VISA';
    type.dispatchEvent(new Event('change'));
    const date = element.querySelector<HTMLInputElement>('#papier-date')!;
    date.value = '2027-03-01';
    date.dispatchEvent(new Event('input'));
    element.querySelector('form')!.dispatchEvent(new Event('submit'));

    const req = http.expectOne(api);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ type: 'VISA', libelle: null, dateExpiration: '2027-03-01' });
    req.flush([{ id: 9, type: 'VISA', libelle: null, dateExpiration: '2027-03-01' }]);
    fixture.detectChanges();

    expect(element.querySelectorAll('li.papier').length).toBe(1);
    expect(element.querySelector('[role="status"]')?.textContent).toContain('Document ajouté.');
  });
});
