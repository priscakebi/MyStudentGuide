import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

// Le composant exporté s'appelle DemarcheDetailComponent
// (l'ancien import « DemarcheDetail » empêchait toute la suite de tests de compiler).
import { DemarcheDetailComponent } from './demarche-detail';
import { environment } from '../../../environments/environment';

describe('DemarcheDetailComponent', () => {
  let component: DemarcheDetailComponent;
  let fixture: ComponentFixture<DemarcheDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemarcheDetailComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(DemarcheDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('checklist des documents', () => {
    const passeport = { id: 101, nom: 'Passeport', description: '', type: 'IDENTITE' };
    const domicile = { id: 102, nom: 'Justificatif de domicile', description: '', type: 'DOMICILE' };
    const url = (doc: number) => `${environment.apiUrl}/student-demarches/7/documents-prets/${doc}`;

    let http: HttpTestingController;

    beforeEach(() => {
      http = TestBed.inject(HttpTestingController);
      component.demarche = {
        id: 30, titre: 'Titre de séjour', description: '', dateCreation: '', dateLimite: null, categorie: null,
        documentsRequis: [passeport, domicile], etapes: [], liensOfficiels: []
      };
      // 999 : document supprimé depuis, il ne doit pas compter.
      component.suivi = { id: 7, statut: 'EN_COURS', documentsPrets: [101, 999], demarche: { id: 30, titre: 'Titre de séjour' } };
    });

    it('compte seulement les documents encore requis', () => {
      expect(component.nbDocumentsPrets).toBe(1);
      expect(component.pourcentageDocuments).toBe(50);
    });

    it('coche tout de suite puis enregistre', () => {
      component.basculerDocument(domicile);
      expect(component.estPret(domicile)).toBe(true);

      const req = http.expectOne((r) => r.url === url(102));
      expect(req.request.method).toBe('PUT');
      expect(req.request.params.get('pret')).toBe('true');
      req.flush({ ...component.suivi, documentsPrets: [101, 102] });

      expect(component.pourcentageDocuments).toBe(100);
      expect(component.documentEnCours).toBeNull();
    });

    it('revient en arrière si l\'enregistrement échoue', () => {
      component.basculerDocument(passeport);
      expect(component.estPret(passeport)).toBe(false);

      http.expectOne((r) => r.url === url(101)).flush(null, { status: 500, statusText: 'Erreur' });

      expect(component.estPret(passeport)).toBe(true);
      expect(component.erreurChecklist).not.toBe('');
    });
  });
});
