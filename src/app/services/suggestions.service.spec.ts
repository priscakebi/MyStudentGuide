import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { LangueService } from '../i18n/langue.service';
import { NATIONALITES } from '../data/nationalites';
import { normaliser } from '../utils/recherche';
import { SuggestionsService } from './suggestions.service';

describe('SuggestionsService (saisie assistée du profil)', () => {
  let service: SuggestionsService;
  let http: HttpTestingController;
  let langue: LangueService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(SuggestionsService);
    http = TestBed.inject(HttpTestingController);
    langue = TestBed.inject(LangueService);
    langue.changer('fr');
  });

  afterEach(() => http.verify());

  it('trouve une nationalité par son nom ou par le pays', async () => {
    expect((await firstValueFrom(service.nationalites('ivoi')))[0].valeur).toBe('Ivoirienne');
    expect((await firstValueFrom(service.nationalites("côte d'iv")))[0].valeur).toBe('Ivoirienne');
    expect((await firstValueFrom(service.nationalites('senegal')))[0].valeur).toBe('Sénégalaise');
  });

  it('affiche les nationalités en anglais mais enregistre la forme française', async () => {
    langue.changer('en');
    const [premiere] = await firstValueFrom(service.nationalites('ivory'));
    expect(premiere).toEqual({ valeur: 'Ivoirienne', libelle: 'Ivorian', detail: 'Ivory Coast' });
  });

  it('propose les établissements par nom, sigle ou ville', async () => {
    const insa = await firstValueFrom(service.etablissements('INSA'));
    expect(insa.length).toBeGreaterThan(0);
    expect(insa.every((e) => normaliser(`${e.libelle} ${e.detail}`).length > 0)).toBe(true);

    const lyon = await firstValueFrom(service.etablissements('lyon'));
    expect(lyon.some((e) => e.libelle.includes('Lyon'))).toBe(true);
  });

  it('formate les villes « Nom code postal » pour retrouver la bonne préfecture', async () => {
    const resultat = firstValueFrom(service.villes('saint-den'));
    const requete = http.expectOne((r) => r.url === 'https://geo.api.gouv.fr/communes');
    expect(requete.request.params.get('nom')).toBe('saint-den');
    expect(requete.request.headers.has('Authorization')).toBe(false);
    requete.flush([{ nom: 'Saint-Denis', codesPostaux: ['93200', '93210'], departement: { nom: 'Seine-Saint-Denis', code: '93' } }]);

    expect(await resultat).toEqual([
      { valeur: 'Saint-Denis 93200', libelle: 'Saint-Denis', detail: '93200 · Seine-Saint-Denis (93)' }
    ]);
  });

  it('ne bloque pas la saisie si le service d’adresses est indisponible', async () => {
    const resultat = firstValueFrom(service.adresses('5 rue Bancel'));
    http.expectOne((r) => r.url === 'https://data.geopf.fr/geocodage/search').flush('', { status: 503, statusText: 'KO' });
    expect(await resultat).toEqual([]);
  });
});

describe('NATIONALITES (compatibilité avec la règle « hors UE » de l’API)', () => {
  // Copie de servicepublic/Nationalites.java (UE_EEE_SUISSE).
  const UE_EEE_SUISSE = [
    'allemand', 'autrichien', 'belge', 'bulgare', 'chypriote', 'croate', 'danois', 'espagnol', 'estonien',
    'finlandais', 'francais', 'grec', 'hongrois', 'irlandais', 'italien', 'letton', 'lituanien', 'luxembourgeois',
    'maltais', 'neerlandais', 'hollandais', 'polonais', 'portugais', 'roumain', 'slovaque', 'slovene', 'suedois',
    'tcheque', 'islandais', 'liechtensteinois', 'norvegien', 'suisse'
  ];
  const PAYS_UE_EEE_SUISSE = [
    'Allemagne', 'Autriche', 'Belgique', 'Bulgarie', 'Chypre', 'Croatie', 'Danemark', 'Espagne', 'Estonie',
    'Finlande', 'France', 'Grèce', 'Hongrie', 'Irlande', 'Italie', 'Lettonie', 'Lituanie', 'Luxembourg', 'Malte',
    'Pays-Bas', 'Pologne', 'Portugal', 'Roumanie', 'Slovaquie', 'Slovénie', 'Suède', 'Tchéquie', 'Islande',
    'Liechtenstein', 'Norvège', 'Suisse'
  ];
  const ue = (nationalite: string) => UE_EEE_SUISSE.some((p) => normaliser(nationalite).startsWith(p));

  it('classe dans l’UE exactement les nationalités des pays de l’UE, de l’EEE et la Suisse', () => {
    for (const [fr, , pays] of NATIONALITES) {
      expect(ue(fr), `${fr} (${pays})`).toBe(PAYS_UE_EEE_SUISSE.includes(pays));
    }
  });

  it('n’a pas de doublon', () => {
    const valeurs = NATIONALITES.map(([fr]) => fr);
    expect(new Set(valeurs).size).toBe(valeurs.length);
  });
});
