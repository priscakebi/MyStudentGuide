import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { DemarcheContenuEditor } from './demarche-contenu-editor';
import { environment } from '../../../environments/environment';

describe('DemarcheContenuEditor', () => {
  const base = `${environment.apiUrl}/admin/demarches/7`;
  const contenu = {
    etapes: [
      { id: 11, numero: 1, titre: 'Préparer', description: null },
      { id: 12, numero: 2, titre: 'Déposer', description: null },
      { id: 13, numero: 3, titre: 'Récupérer', description: null }
    ],
    liens: [{ id: 21, nom: 'ANEF', url: 'https://anef.example', description: null }]
  };

  let http: HttpTestingController;
  let editor: DemarcheContenuEditor;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DemarcheContenuEditor],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    http = TestBed.inject(HttpTestingController);

    const fixture = TestBed.createComponent(DemarcheContenuEditor);
    editor = fixture.componentInstance;
    editor.demarcheId = 7;
    fixture.detectChanges();

    http.expectOne(`${base}/contenu`).flush(contenu);
  });

  afterEach(() => http.verify());

  it('charge les étapes et les liens', () => {
    expect(editor.chargement).toBe(false);
    expect(editor.etapes.length).toBe(3);
    expect(editor.liens.length).toBe(1);
  });

  it('monter une étape envoie le nouvel ordre complet', () => {
    editor.deplacer(2, -1);

    const req = http.expectOne(`${base}/etapes/ordre`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ ids: [11, 13, 12] });
    req.flush(contenu);
  });

  it('ne déplace pas la première étape vers le haut', () => {
    editor.deplacer(0, -1);
    http.expectNone(`${base}/etapes/ordre`);
  });

  it('affiche le premier message de validation renvoyé par l\'API', () => {
    editor.nouveauLien = { nom: 'Site', url: 'pas-une-url', description: '' };
    editor.ajouterLien();

    http.expectOne(`${base}/liens`).flush(
      { errors: { url: 'L\'adresse doit commencer par http:// ou https://' } },
      { status: 400, statusText: 'Bad Request' }
    );

    expect(editor.erreur).toBe('L\'adresse doit commencer par http:// ou https://');
    expect(editor.enCours).toBe(false);
  });
});
