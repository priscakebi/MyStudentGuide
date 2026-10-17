import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { AstuceDuJourCarte } from './astuce-du-jour';
import { LangueService } from '../../i18n/langue.service';
import { environment } from '../../../environments/environment';

describe('AstuceDuJourCarte', () => {
  const url = `${environment.apiUrl}/conseils/astuce-du-jour`;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AstuceDuJourCarte],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    TestBed.inject(LangueService).changer('fr');
  });

  it('affiche le conseil, en anglais s’il est traduit, avec un lien vers la démarche', () => {
    const fixture = TestBed.createComponent(AstuceDuJourCarte);
    fixture.detectChanges();
    http.expectOne(url).flush({
      texte: 'Venez tôt.', texteEn: 'Come early.', demarcheId: 30,
      demarcheTitre: 'Validation du VLS-TS', demarcheTitreEn: null
    });
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('.texte')?.textContent).toContain('Venez tôt.');
    expect(element.querySelector('a.source')?.getAttribute('href')).toBe('/demarches/30');

    TestBed.inject(LangueService).changer('en');
    fixture.detectChanges();
    expect(element.querySelector('.texte')?.textContent).toContain('Come early.');
    // Titre non traduit : le français reste affiché.
    expect(element.querySelector('a.source')?.textContent).toContain('Validation du VLS-TS');
  });

  it('n’affiche rien quand il n’y a pas d’astuce (204)', () => {
    const fixture = TestBed.createComponent(AstuceDuJourCarte);
    fixture.detectChanges();
    http.expectOne(url).flush(null, { status: 204, statusText: 'No Content' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.astuce')).toBeNull();
  });
});
