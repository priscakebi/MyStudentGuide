import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AnnonceEtudiants } from './annonce-etudiants';
import { environment } from '../../../environments/environment';

describe('AnnonceEtudiants', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AnnonceEtudiants],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function saisir(element: HTMLElement, selecteur: string, valeur: string): void {
    const champ = element.querySelector<HTMLInputElement | HTMLTextAreaElement>(selecteur)!;
    champ.value = valeur;
    champ.dispatchEvent(new Event('input'));
  }

  it('demande une confirmation avant d’envoyer, puis affiche le résultat', async () => {
    const fixture = TestBed.createComponent(AnnonceEtudiants);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    element.querySelector<HTMLButtonElement>('.basculer')!.click();
    fixture.detectChanges();
    await fixture.whenStable();

    saisir(element, '#annonce-titre-champ', ' Fermeture ');
    saisir(element, '#annonce-message', 'La préfecture est fermée.');
    element.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    // Rien n'est envoyé avant la confirmation.
    http.expectNone(`${environment.apiUrl}/admin/annonces`);
    expect(element.querySelector('.confirmation')).not.toBeNull();

    [...element.querySelectorAll('button')].find((b) => b.textContent?.includes("Confirmer l'envoi"))!.click();
    const requete = http.expectOne(`${environment.apiUrl}/admin/annonces`);
    expect(requete.request.body).toEqual({ titre: 'Fermeture', message: 'La préfecture est fermée.', email: false });
    requete.flush({ notifications: 12, emails: 0 });
    fixture.detectChanges();

    expect(element.querySelector('[role="status"]')?.textContent).toContain('Annonce envoyée à 12 étudiants.');
    expect(element.querySelector('form')).toBeNull();
  });

  it('refuse un titre ou un message vide', async () => {
    const fixture = TestBed.createComponent(AnnonceEtudiants);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    element.querySelector<HTMLButtonElement>('.basculer')!.click();
    fixture.detectChanges();
    element.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(element.querySelector('[role="alert"]')?.textContent).toContain('obligatoires');
    expect(element.querySelector('.confirmation')).toBeNull();
  });
});
