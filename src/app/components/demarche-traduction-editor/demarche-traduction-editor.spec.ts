import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { DemarcheTraductionEditor, Traduction } from './demarche-traduction-editor';
import { environment } from '../../../environments/environment';

describe('DemarcheTraductionEditor', () => {
  const url = `${environment.apiUrl}/admin/demarches/7/traduction`;
  const traduction = (): Traduction => ({
    demarche: { id: null, titreFr: 'Carte Vitale', descriptionFr: 'Atteste vos droits.', titre: 'Carte Vitale', description: null },
    etapes: [{ id: 11, titreFr: 'Créer son compte', descriptionFr: null, titre: null, description: null }],
    documents: [{ id: 31, titreFr: 'Passeport', descriptionFr: null, titre: 'Passport', description: null }],
    liens: []
  });

  let http: HttpTestingController;
  let editor: DemarcheTraductionEditor;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DemarcheTraductionEditor],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    http = TestBed.inject(HttpTestingController);

    const fixture = TestBed.createComponent(DemarcheTraductionEditor);
    editor = fixture.componentInstance;
    editor.demarcheId = 7;
    fixture.detectChanges();

    http.expectOne(url).flush(traduction());
  });

  afterEach(() => http.verify());

  it('compte les textes français déjà traduits', () => {
    // Titre, description, étape, document : 4 textes, dont 2 traduits.
    expect(editor.totalTextes).toBe(4);
    expect(editor.textesTraduits).toBe(2);
  });

  it('enregistre la traduction et prévient la liste', () => {
    let prevenue = false;
    editor.enregistree.subscribe(() => (prevenue = true));
    editor.traduction!.etapes[0].titre = 'Create your account';

    editor.enregistrer();
    const requete = http.expectOne(url);
    expect(requete.request.method).toBe('PUT');
    expect(requete.request.body.etapes[0].titre).toBe('Create your account');
    requete.flush({ ...traduction(), etapes: [{ ...traduction().etapes[0], titre: 'Create your account' }] });

    expect(prevenue).toBe(true);
    expect(editor.message).toContain('enregistrée');
    expect(editor.textesTraduits).toBe(3);
  });

  it('affiche le message de validation de l’API', () => {
    editor.enregistrer();
    http.expectOne(url).flush(
      { message: 'Les données envoyées sont invalides.', errors: { 'etapes[0].titre': 'Un titre anglais ne doit pas dépasser 150 caractères.' } },
      { status: 400, statusText: 'Bad Request' }
    );

    expect(editor.erreur).toBe('Un titre anglais ne doit pas dépasser 150 caractères.');
  });
});
