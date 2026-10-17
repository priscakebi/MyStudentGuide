import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { DoubleAuthentification, cheminQrCode } from './double-authentification';
import { environment } from '../../../environments/environment';

describe('DoubleAuthentification', () => {
  const api = `${environment.apiUrl}/account/2fa`;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DoubleAuthentification],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function creer(etat: { active: boolean; codesSecoursRestants: number }) {
    const fixture = TestBed.createComponent(DoubleAuthentification);
    fixture.detectChanges();
    http.expectOne(api).flush(etat);
    fixture.detectChanges();
    return fixture;
  }

  function bouton(element: HTMLElement, texte: string): HTMLButtonElement {
    const trouve = [...element.querySelectorAll('button')].find((b) => b.textContent?.includes(texte));
    if (!trouve) {
      throw new Error(`Bouton « ${texte} » introuvable`);
    }
    return trouve;
  }

  it('dessine un QR code carré', () => {
    const { taille, chemin } = cheminQrCode('otpauth://totp/MyStudentGuide:a@b.c?secret=ABCD');
    expect(taille).toBeGreaterThanOrEqual(21);
    expect(chemin).toMatch(/^M\d+ \d+h1v1h-1z/);
  });

  it('active en deux temps et affiche les codes de secours une seule fois', async () => {
    const fixture = creer({ active: false, codesSecoursRestants: 0 });
    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('Désactivée');

    bouton(element, 'Activer la double authentification').click();
    http.expectOne(`${api}/preparer`).flush({
      secret: 'ABCDEFGHIJKLMNOP',
      uri: 'otpauth://totp/MyStudentGuide:a@b.c?secret=ABCDEFGHIJKLMNOP'
    });
    fixture.detectChanges();

    expect(element.querySelector('svg.qr path')?.getAttribute('d')).toBeTruthy();
    expect(element.querySelector('.cle')?.textContent).toBe('ABCD EFGH IJKL MNOP');

    await fixture.whenStable();
    const champ = element.querySelector<HTMLInputElement>('#code-activation')!;
    champ.value = '123456';
    champ.dispatchEvent(new Event('input'));
    element.querySelector('form.ligne')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const requete = http.expectOne(`${api}/activer`);
    expect(requete.request.body).toEqual({ code: '123456' });
    requete.flush({ codesSecours: ['AAAA-BBBB', 'CCCC-DDDD'] });
    fixture.detectChanges();

    expect(element.textContent).toContain('Activée');
    expect(element.querySelectorAll('.codes li').length).toBe(2);

    bouton(element, "J'ai enregistré mes codes").click();
    fixture.detectChanges();
    expect(element.querySelector('.codes')).toBeNull();
  });

  it('affiche le message de l’API quand le code est faux', async () => {
    const fixture = creer({ active: false, codesSecoursRestants: 0 });
    const element: HTMLElement = fixture.nativeElement;

    bouton(element, 'Activer la double authentification').click();
    http.expectOne(`${api}/preparer`).flush({ secret: 'ABCD', uri: 'otpauth://totp/x?secret=ABCD' });
    fixture.detectChanges();

    await fixture.whenStable();
    const champ = element.querySelector<HTMLInputElement>('#code-activation')!;
    champ.value = '000000';
    champ.dispatchEvent(new Event('input'));
    element.querySelector('form.ligne')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    http.expectOne(`${api}/activer`).flush({ message: 'Code incorrect.' }, { status: 400, statusText: 'Bad Request' });
    fixture.detectChanges();

    expect(element.querySelector('[role="alert"]')?.textContent).toContain('Code incorrect.');
    expect(element.querySelector('svg.qr')).not.toBeNull();
  });

  it('prévient quand il reste peu de codes de secours', () => {
    const fixture = creer({ active: true, codesSecoursRestants: 2 });
    const element: HTMLElement = fixture.nativeElement;

    expect(element.textContent).toContain('Codes de secours restants : 2');
    expect(element.querySelector('.avertissement')).not.toBeNull();
    expect(bouton(element, 'Désactiver')).toBeTruthy();
  });
});
