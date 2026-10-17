import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';

import { VerifierEmail } from './verifier-email';
import { environment } from '../../../environments/environment';

describe('VerifierEmail (/verifier-email)', () => {
  let http: HttpTestingController;

  function creer(token: string | null) {
    TestBed.configureTestingModule({
      imports: [VerifierEmail],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(token ? { token } : {}) } } }
      ]
    });
    http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(VerifierEmail);
    fixture.detectChanges();
    return fixture;
  }

  afterEach(() => http.verify());

  it('confirme l’adresse avec le jeton du lien', () => {
    const fixture = creer('abc');
    const requete = http.expectOne(`${environment.apiUrl}/auth/verify-email`);
    expect(requete.request.body).toEqual({ token: 'abc' });
    requete.flush({ message: 'ok' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.success')).not.toBeNull();
  });

  it('signale un lien invalide ou expiré', () => {
    const fixture = creer('perime');
    http.expectOne(`${environment.apiUrl}/auth/verify-email`)
      .flush({ message: 'invalide' }, { status: 400, statusText: 'Bad Request' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.error')).not.toBeNull();
  });

  it('n’appelle pas l’API si le lien est incomplet', () => {
    const fixture = creer(null);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.error')).not.toBeNull();
  });
});
