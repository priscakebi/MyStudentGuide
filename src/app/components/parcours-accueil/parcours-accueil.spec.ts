import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ParcoursAccueil } from './parcours-accueil';
import { LangueService } from '../../i18n/langue.service';

describe('ParcoursAccueil (« Bien démarrer »)', () => {
  beforeEach(() => {
    localStorage.removeItem('parcours-accueil-masque:aicha@mail.com');
    TestBed.configureTestingModule({ imports: [ParcoursAccueil], providers: [provideRouter([])] });
    TestBed.inject(LangueService).changer('fr');
  });

  function creer(donnees: { email?: boolean; profil: boolean | null; dates: boolean | null; demarche: boolean | null }) {
    const fixture = TestBed.createComponent(ParcoursAccueil);
    fixture.componentRef.setInput('email', 'aicha@mail.com');
    fixture.componentRef.setInput('emailVerifie', donnees.email ?? true);
    fixture.componentRef.setInput('profilComplet', donnees.profil);
    fixture.componentRef.setInput('datesRenseignees', donnees.dates);
    fixture.componentRef.setInput('aCommence', donnees.demarche);
    fixture.detectChanges();
    return fixture;
  }

  it('attend que toutes les données soient chargées', () => {
    const fixture = creer({ profil: false, dates: null, demarche: false });
    expect(fixture.nativeElement.querySelector('.parcours')).toBeNull();
  });

  it('coche les étapes faites et propose les suivantes', () => {
    const fixture = creer({ email: true, profil: true, dates: false, demarche: false });
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelectorAll('li.fait').length).toBe(2);
    expect(element.querySelector('.compteur')?.textContent).toContain('2 étape(s) sur 4');
    expect(element.querySelectorAll('a.action').length).toBe(2);
  });

  it('disparaît quand tout est fait', () => {
    const fixture = creer({ email: true, profil: true, dates: true, demarche: true });
    expect(fixture.nativeElement.querySelector('.parcours')).toBeNull();
  });

  it('se masque et s’en souvient pour ce compte', () => {
    const fixture = creer({ email: false, profil: false, dates: false, demarche: false });
    fixture.nativeElement.querySelector('.masquer').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.parcours')).toBeNull();

    const autre = creer({ email: false, profil: false, dates: false, demarche: false });
    expect(autre.nativeElement.querySelector('.parcours')).toBeNull();
  });
});
