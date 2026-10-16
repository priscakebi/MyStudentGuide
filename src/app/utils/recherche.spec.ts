import { motsCherches, normaliser, rechercherDemarches } from './recherche';

describe('recherche des démarches', () => {
  const demarches = [
    { titre: 'Ouverture d\'un compte bancaire', description: 'RIB, pièces à fournir.', categorie: { nom: 'Banque' } },
    { titre: 'Carte Vitale', description: 'Elle atteste de vos droits à l\'Assurance maladie.', categorie: { nom: 'Santé' } },
    { titre: 'Aide personnalisée au logement (APL)', description: 'Demande auprès de la CAF.', categorie: { nom: 'Logement' } },
    { titre: 'Titre de séjour étudiant', description: 'Rendez-vous en préfecture.', categorie: { nom: 'Séjour & visa' } },
    { titre: 'Logement étudiant au Crous', description: null, categorie: { nom: 'Logement' } }
  ];

  const titres = (q: string) => rechercherDemarches(demarches, q).map((d) => d.titre);

  it('normalise accents, majuscules et ponctuation', () => {
    expect(normaliser('  Séjour & Préfecture ! ')).toBe('sejour prefecture');
    expect(motsCherches('Comment ouvrir un compte à la banque ?')).toEqual(['ouvrir', 'compte', 'banque']);
  });

  it('renvoie tout pour une recherche vide ou faite de petits mots', () => {
    expect(rechercherDemarches(demarches, '')).toHaveLength(5);
    expect(rechercherDemarches(demarches, 'de la')).toHaveLength(5);
  });

  it('ignore les accents et trouve dans la description', () => {
    expect(titres('sejour')).toEqual(['Titre de séjour étudiant']);
    expect(titres('prefecture')).toEqual(['Titre de séjour étudiant']);
  });

  it('exige tous les mots et place les correspondances exactes devant', () => {
    // L'APL correspond aussi, « crous » ayant « logement » pour synonyme.
    expect(titres('logement crous')).toEqual(['Logement étudiant au Crous', 'Aide personnalisée au logement (APL)']);
    expect(titres('compte vitale')).toEqual([]);
  });

  it('classe les correspondances dans le titre en premier', () => {
    expect(titres('logement')).toEqual(['Aide personnalisée au logement (APL)', 'Logement étudiant au Crous']);
  });

  it('comprend les synonymes et le pluriel', () => {
    expect(titres('sécu')).toEqual(['Carte Vitale']);
    expect(titres('banque')).toEqual(['Ouverture d\'un compte bancaire']);
    expect(titres('logements')[0]).toBe('Aide personnalisée au logement (APL)');
  });

  it('tolère une faute de frappe sur les mots longs', () => {
    expect(titres('prefecure')).toEqual(['Titre de séjour étudiant']);
    expect(titres('vitlae')).toEqual(['Carte Vitale']);
    expect(titres('zzz')).toEqual([]);
  });

  it('trouve aussi dans la version anglaise du contenu', () => {
    const traduites = [
      { titre: 'Titre de séjour étudiant', titreEn: 'Student residence permit', categorie: { nom: 'Séjour & visa', nomEn: 'Residence & visa' } },
      { titre: 'Carte Vitale', description: 'Assurance maladie.', descriptionEn: 'Health insurance card.', categorie: { nom: 'Santé', nomEn: 'Health' } }
    ];
    const enAnglais = (q: string) => rechercherDemarches(traduites, q).map((d) => d.titre);

    expect(enAnglais('How to get my residence permit')).toEqual(['Titre de séjour étudiant']);
    expect(enAnglais('health insurance')).toEqual(['Carte Vitale']);
  });
});
