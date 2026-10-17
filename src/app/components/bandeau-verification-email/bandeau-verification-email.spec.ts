import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { BandeauVerificationEmail } from './bandeau-verification-email';
import { EtatCompteService } from '../../services/etat-compte.service';
import { LangueService } from '../../i18n/langue.service';
import { environment } from '../../../environments/environment';

describe('BandeauVerificationEmail', () => {
  const url = `${environment.apiUrl}/account/verification-email`;
  let http: HttpTestingController;
  let compte: EtatCompteService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BandeauVerificationEmail],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    http = TestBed.inject(HttpTestingController);
    compte = TestBed.inject(EtatCompteService);
    TestBed.inject(LangueService).changer('fr');
  });

  afterEach(() => http.verify());

  function creer() {
    const fixture = TestBed.createComponent(BandeauVerificationEmail);
    fixture.detectChanges();
    return fixture;
  }

  it('reste masqué quand l’adresse est confirmée', () => {
    compte.mettreAJour({ email: 'aicha@mail.com', emailVerified: true });
    expect(creer().nativeElement.querySelector('.bandeau')).toBeNull();
  });

  it('propose de renvoyer le lien et confirme l’envoi', () => {
    compte.mettreAJour({ email: 'aicha@mail.com', emailVerified: false });
    const fixture = creer();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('aicha@mail.com');

    element.querySelector<HTMLButtonElement>('button')!.click();
    http.expectOne(url).flush({ message: 'ok' });
    fixture.detectChanges();

    expect(element.querySelector('.retour')?.classList.contains('erreur')).toBe(false);
  });

  it('demande de patienter si un lien vient d’être envoyé', () => {
    compte.mettreAJour({ email: 'aicha@mail.com', emailVerified: false });
    const fixture = creer();

    fixture.nativeElement.querySelector('button').click();
    http.expectOne(url).flush({ message: 'trop tôt' }, { status: 429, statusText: 'Too Many Requests' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.retour').textContent).toContain('patientez');
  });
});
