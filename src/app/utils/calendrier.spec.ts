import { genererIcs, nomFichierIcs } from './calendrier';

describe('calendrier (export .ics)', () => {
  const maintenant = new Date(Date.UTC(2026, 9, 15, 12, 30, 0));

  it('crée un événement toute la journée avec deux rappels', () => {
    const ics = genererIcs(
      [{ id: 30, titre: 'Titre de séjour', dateLimite: '2026-12-31T00:00:00', url: 'https://exemple.fr/demarches/30' }],
      maintenant
    );

    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics).toContain('DTSTART;VALUE=DATE:20261231');
    expect(ics).toContain('DTEND;VALUE=DATE:20270101'); // passage à l'année suivante
    expect(ics).toContain('DTSTAMP:20261015T123000Z');
    expect(ics).toContain('UID:demarche-30-20261231@mycampusguide');
    expect(ics).toContain('SUMMARY:Date limite : Titre de séjour');
    expect(ics).toContain('TRIGGER:-P6DT15H');
    expect(ics).toContain('TRIGGER:-PT15H');
    expect(ics.match(/BEGIN:VEVENT/g)?.length).toBe(1);
  });

  it('échappe les caractères spéciaux et plie les lignes longues', () => {
    const ics = genererIcs(
      [{ id: 1, titre: 'Logement; APL, CAF et une très très très longue explication pour dépasser la limite', dateLimite: '2026-11-30' }],
      maintenant
    );

    expect(ics).toContain('Logement\\; APL\\, CAF');
    for (const ligne of ics.split('\r\n')) {
      expect(new TextEncoder().encode(ligne).length).toBeLessThanOrEqual(75);
    }
  });

  it('ignore une date illisible et regroupe plusieurs échéances', () => {
    const ics = genererIcs(
      [
        { id: 1, titre: 'A', dateLimite: '2026-11-30' },
        { id: 2, titre: 'B', dateLimite: '' },
        { id: 3, titre: 'C', dateLimite: '2027-01-15' }
      ],
      maintenant
    );

    expect(ics.match(/BEGIN:VEVENT/g)?.length).toBe(2);
  });

  it('rédige l’événement en anglais si demandé', () => {
    const ics = genererIcs([{ id: 1, titre: 'Carte Vitale', dateLimite: '2026-11-30' }], maintenant, 'en');
    expect(ics).toContain('SUMMARY:Deadline: Carte Vitale');
    expect(ics).toContain('DESCRIPTION:Tomorrow: Carte Vitale');
  });

  it('donne un nom de fichier lisible', () => {
    expect(nomFichierIcs('Titre de séjour étudiant')).toBe('titre-de-sejour-etudiant.ics');
    expect(nomFichierIcs('!!!')).toBe('date-limite.ics');
    // Nom tronqué : pas de tiret final.
    expect(nomFichierIcs('Étudiant étranger en France : visa de long séjour ou titre de séjour'))
      .toBe('etudiant-etranger-en-france-visa-de-long-sejour-ou-titre-de.ics');
  });
});
