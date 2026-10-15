import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Demarches } from './demarches';

describe('Demarches', () => {
  let component: Demarches;
  let fixture: ComponentFixture<Demarches>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Demarches],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Demarches);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('filtre par catégorie puis par recherche', () => {
    component.demarches = [
      { id: 1, titre: 'Carte Vitale', categorie: { id: 2, nom: 'Santé' } },
      { id: 2, titre: 'Compte bancaire', categorie: { id: 3, nom: 'Banque' } },
      { id: 3, titre: 'Complémentaire santé', categorie: { id: 2, nom: 'Santé' } }
    ];

    component.recherche = 'vitale';
    expect(component.demarchesFiltrees.map((d) => d.id)).toEqual([1]);

    component.recherche = '';
    component.categorieFiltre = 2;
    expect(component.demarchesFiltrees.map((d) => d.id)).toEqual([1, 3]);

    component.recherche = 'banque';
    expect(component.demarchesFiltrees).toEqual([]);
  });
});
