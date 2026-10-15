import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';

import { Aide, DemandeAide } from './aide';
import { environment } from '../../../environments/environment';

describe('Aide', () => {
  const api = environment.apiUrl;

  const demande = (id: number, statut: DemandeAide['statut']): DemandeAide => ({
    id,
    sujet: 'COMPTE',
    sujetLibelle: 'Mon compte',
    demarcheId: null,
    demarcheTitre: null,
    message: 'Je ne reçois pas l’e-mail de confirmation.',
    reponse: null,
    auteur: 'Aïcha Diallo',
    statut,
    dateCreation: '2026-10-01T10:00:00',
    dateReponse: null
  });

  let http: HttpTestingController;
  let page: Aide;

  function creer(queryParams: Record<string, string> = {}, demandes: DemandeAide[] = []): void {
    TestBed.configureTestingModule({
      imports: [Aide],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(queryParams) } } }
      ]
    });
    http = TestBed.inject(HttpTestingController);

    const fixture = TestBed.createComponent(Aide);
    page = fixture.componentInstance;
    fixture.detectChanges();

    http.expectOne(`${api}/demarches`).flush([{ id: 12, titre: 'Validation du VLS-TS' }]);
    http.expectOne(`${api}/aide/me`).flush(demandes);
  }

  afterEach(() => http.verify());

  it('n’envoie rien sans sujet ni message suffisant', () => {
    creer();

    page.message = 'Court';
    page.envoyer();

    expect(page.sujetManquant).toBe(true);
    expect(page.messageInvalide).toBe(true);
    http.expectNone(`${api}/aide`);
  });

  it('envoie la demande et l’ajoute en tête de l’historique', () => {
    creer();

    page.sujet = 'COMPTE';
    page.demarcheId = 12;
    page.message = '  Je ne reçois pas l’e-mail de confirmation.  ';
    page.envoyer();

    const req = http.expectOne(`${api}/aide`);
    expect(req.request.method).toBe('POST');
    // Démarche ignorée : elle n'a pas de sens pour un problème de compte.
    expect(req.request.body).toEqual({
      sujet: 'COMPTE',
      demarcheId: null,
      message: 'Je ne reçois pas l’e-mail de confirmation.'
    });
    req.flush(demande(1, 'OUVERTE'));

    expect(page.demandes.length).toBe(1);
    expect(page.message).toBe('');
    expect(page.succes).toContain('bien été envoyée');
  });

  it('présélectionne la démarche reçue dans l’adresse', () => {
    creer({ demarche: '12' });

    expect(page.sujet).toBe('DEMARCHE');
    expect(page.demarcheId).toBe(12);
  });

  it('bloque le formulaire au-delà de 3 demandes en attente', () => {
    creer({}, [demande(1, 'OUVERTE'), demande(2, 'OUVERTE'), demande(3, 'OUVERTE'), demande(4, 'REPONDUE')]);

    expect(page.limiteAtteinte).toBe(true);
  });
});
