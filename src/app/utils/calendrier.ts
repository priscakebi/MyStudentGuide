// ============================================================
// EXPORT DES DATES LIMITES VERS L'AGENDA (fichier .ics)
// ============================================================
//
// Le fichier .ics est le format standard des agendas
// (Google Agenda, Apple Calendrier, Outlook…). Ouvert sur un
// téléphone, il propose d'ajouter l'événement à l'agenda.
//
// - un événement « toute la journée » le jour de la date limite ;
// - deux rappels : une semaine avant et la veille, à 9 h ;
// - le lien vers la démarche dans la description.
// ============================================================

export interface EcheanceAgenda {
  /** Identifiant de la démarche (sert à rendre l'événement unique). */
  id: number;
  titre: string;
  /** Date limite, « 2026-11-30 » ou « 2026-11-30T00:00:00 ». */
  dateLimite: string;
  /** Lien vers la démarche dans l'application. */
  url?: string;
}

/** « 2026-11-30… » → « 20261130 » ; null si la date est illisible. */
function jourIcs(date: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(date ?? '');
  return m ? `${m[1]}${m[2]}${m[3]}` : null;
}

/** Jour suivant au format ICS (fin d'un événement « toute la journée »). */
function lendemainIcs(jour: string): string {
  const d = new Date(Date.UTC(+jour.slice(0, 4), +jour.slice(4, 6) - 1, +jour.slice(6, 8) + 1));
  return d.toISOString().slice(0, 10).replace(/-/g, '');
}

/** Échappe les caractères spéciaux du format ICS. */
function texteIcs(texte: string): string {
  return texte
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/** Coupe les lignes trop longues (75 octets max, suite précédée d'un espace). */
function plierLigne(ligne: string): string {
  const encodeur = new TextEncoder();
  const morceaux: string[] = [];
  let courant = '';
  let octets = 0;

  for (const caractere of ligne) {
    const taille = encodeur.encode(caractere).length;
    const limite = morceaux.length === 0 ? 75 : 74; // l'espace de continuation compte
    if (octets + taille > limite) {
      morceaux.push(courant);
      courant = '';
      octets = 0;
    }
    courant += caractere;
    octets += taille;
  }
  morceaux.push(courant);

  return morceaux.join('\r\n ');
}

/** Textes de l'événement, dans la langue de l'interface. */
const TEXTES_ICS = {
  fr: {
    resume: (titre: string) => `Date limite : ${titre}`,
    description: (titre: string) => `Date limite de votre démarche « ${titre} ».`,
    lien: (url: string) => `Détail de la démarche : ${url}`,
    rappelSemaine: (titre: string) => `Dans 7 jours : ${titre}`,
    rappelVeille: (titre: string) => `Demain : ${titre}`
  },
  en: {
    resume: (titre: string) => `Deadline: ${titre}`,
    description: (titre: string) => `Deadline for your procedure “${titre}”.`,
    lien: (url: string) => `Procedure details: ${url}`,
    rappelSemaine: (titre: string) => `In 7 days: ${titre}`,
    rappelVeille: (titre: string) => `Tomorrow: ${titre}`
  }
};

/** Contenu du fichier .ics pour une ou plusieurs dates limites. */
export function genererIcs(
  echeances: EcheanceAgenda[],
  maintenant = new Date(),
  langue: 'fr' | 'en' = 'fr'
): string {
  const t = TEXTES_ICS[langue];
  const horodatage = maintenant.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const lignes = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MyCampusGuide//Dates limites//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  for (const e of echeances) {
    const jour = jourIcs(e.dateLimite);
    if (!jour) {
      continue;
    }

    const description = e.url
      ? `${t.description(e.titre)}\n${t.lien(e.url)}`
      : t.description(e.titre);

    lignes.push(
      'BEGIN:VEVENT',
      `UID:demarche-${e.id}-${jour}@mycampusguide`,
      `DTSTAMP:${horodatage}`,
      `DTSTART;VALUE=DATE:${jour}`,
      `DTEND;VALUE=DATE:${lendemainIcs(jour)}`,
      `SUMMARY:${texteIcs(t.resume(e.titre))}`,
      `DESCRIPTION:${texteIcs(description)}`,
      ...(e.url ? [`URL:${e.url}`] : []),
      'TRANSP:TRANSPARENT',
      // Rappel une semaine avant, à 9 h.
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${texteIcs(t.rappelSemaine(e.titre))}`,
      'TRIGGER:-P6DT15H',
      'END:VALARM',
      // Rappel la veille, à 9 h.
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${texteIcs(t.rappelVeille(e.titre))}`,
      'TRIGGER:-PT15H',
      'END:VALARM',
      'END:VEVENT'
    );
  }

  lignes.push('END:VCALENDAR');

  return lignes.map(plierLigne).join('\r\n') + '\r\n';
}

/** Nom de fichier lisible : « Titre de séjour » → « titre-de-sejour.ics ». */
export function nomFichierIcs(titre: string): string {
  const base = titre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 60)
    .replace(/^-+|-+$/g, '');
  return `${base || 'date-limite'}.ics`;
}

/** Fait télécharger le fichier .ics (sur téléphone, l'agenda propose de l'ajouter). */
export function telechargerIcs(nomFichier: string, echeances: EcheanceAgenda[], langue: 'fr' | 'en' = 'fr'): void {
  const blob = new Blob([genererIcs(echeances, new Date(), langue)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const lien = document.createElement('a');
  lien.href = url;
  lien.download = nomFichier;
  document.body.appendChild(lien);
  lien.click();
  lien.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
