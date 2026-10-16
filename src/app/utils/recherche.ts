// ============================================================
// RECHERCHE DANS LES DÉMARCHES (côté navigateur)
// ============================================================
//
// - insensible aux majuscules, aux accents et aux apostrophes ;
// - les petits mots (« de », « la », « mon »…) sont ignorés ;
// - chaque mot cherché doit se retrouver dans la démarche
//   (titre, catégorie ou description) ;
// - quelques synonymes du quotidien étudiant (« CAF » → APL,
//   « sécu » → carte Vitale…) ;
// - une faute de frappe d'une lettre est tolérée sur les mots
//   d'au moins 5 lettres (« prefecure » → préfecture) ;
// - les résultats sont triés : titre > catégorie > description,
//   et un mot exact compte plus qu'un synonyme ou une faute.
// ============================================================

export interface DemarcheCherchable {
  titre: string;
  description?: string | null;
  titreEn?: string | null;
  descriptionEn?: string | null;
  categorie?: { nom: string; nomEn?: string | null } | null;
}

const MOTS_IGNORES = new Set([
  'a', 'au', 'aux', 'avec', 'ce', 'comment', 'd', 'de', 'des', 'du', 'en', 'est', 'et', 'je',
  'l', 'la', 'le', 'les', 'ma', 'mes', 'mon', 'ou', 'par', 'pour', 'quel', 'quelle', 'qu',
  'que', 'sur', 'un', 'une', 'votre', 'vos',
  // Anglais
  'an', 'and', 'do', 'for', 'get', 'how', 'i', 'in', 'is', 'my', 'of', 'the', 'to', 'what', 'your'
]);

/** Mot cherché → autres façons de l'écrire dans les fiches officielles. */
const SYNONYMES: Record<string, string[]> = {
  caf: ['apl', 'aide personnalisee au logement', 'aide au logement'],
  apl: ['caf', 'aide personnalisee au logement'],
  secu: ['securite sociale', 'assurance maladie', 'carte vitale'],
  ameli: ['assurance maladie', 'carte vitale'],
  vitale: ['assurance maladie'],
  sante: ['assurance maladie', 'carte vitale', 'medecin', 'mutuelle'],
  mutuelle: ['complementaire sante'],
  medecin: ['medecin traitant', 'sante'],
  banque: ['bancaire'],
  bancaire: ['banque'],
  rib: ['bancaire', 'banque'],
  crous: ['logement', 'residence'],
  logement: ['crous', 'residence', 'apl'],
  appartement: ['logement'],
  visa: ['vls-ts', 'sejour'],
  ofii: ['vls-ts', 'sejour'],
  prefecture: ['sejour'],
  travail: ['travailler', 'emploi', 'job'],
  job: ['travailler', 'emploi', 'travail'],
  emploi: ['travailler', 'travail', 'job'],
  impot: ['impots', 'declaration de revenus'],
  inscription: ['inscrire', 'etudes'],
  universite: ['etudes', 'inscription'],
  fac: ['universite', 'etudes', 'inscription']
};

/** Met en minuscules, enlève les accents et remplace la ponctuation par des espaces. */
export function normaliser(texte: string | null | undefined): string {
  return (texte ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, ' ')
    .trim();
}

/** Mots significatifs d'une recherche. */
export function motsCherches(recherche: string): string[] {
  return normaliser(recherche)
    .split(/\s+/)
    .filter((mot) => mot && !MOTS_IGNORES.has(mot));
}

/** Le mot et son singulier. */
function formes(mot: string): string[] {
  return mot.length > 3 && /[sx]$/.test(mot) ? [mot, mot.slice(0, -1)] : [mot];
}

/** Vrai si a et b diffèrent d'au plus une lettre (ajout, suppression, remplacement ou inversion). */
function uneLettrePres(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) {
    return false;
  }

  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) {
    i++;
  }
  if (i === a.length && i === b.length) {
    return true;
  }

  return a.slice(i + 1) === b.slice(i + 1)                                    // remplacement
    || a.slice(i) === b.slice(i + 1)                                          // lettre en trop dans b
    || a.slice(i + 1) === b.slice(i)                                          // lettre en trop dans a
    || (a[i] === b[i + 1] && a[i + 1] === b[i] && a.slice(i + 2) === b.slice(i + 2)); // inversion
}

/**
 * 1 si le mot (ou son singulier) apparaît dans le texte normalisé,
 * 0.5 s'il n'y est que par un synonyme ou à une faute de frappe près, 0 sinon.
 */
function correspondance(mot: string, texte: string, mots: string[]): number {
  const f = formes(mot);
  if (f.some((v) => texte.includes(v))) {
    return 1;
  }
  const synonymes = f.flatMap((v) => SYNONYMES[v] ?? []);
  if (synonymes.some((s) => texte.includes(s))) {
    return 0.5;
  }
  return mot.length >= 5 && mots.some((m) => m.length >= 4 && uneLettrePres(mot, m)) ? 0.5 : 0;
}

/**
 * Filtre et trie les démarches pour une recherche.
 * Une recherche vide (ou faite seulement de petits mots) renvoie la liste telle quelle.
 */
export function rechercherDemarches<T extends DemarcheCherchable>(demarches: T[], recherche: string): T[] {
  const mots = motsCherches(recherche);
  if (mots.length === 0) {
    return demarches;
  }

  const resultats: { demarche: T; score: number; rang: number }[] = [];

  demarches.forEach((demarche, rang) => {
    const champs = [
      // Texte français et version anglaise : la recherche marche dans les deux langues.
      { texte: normaliser(`${demarche.titre} ${demarche.titreEn ?? ''}`), poids: 3 },
      { texte: normaliser(`${demarche.categorie?.nom ?? ''} ${demarche.categorie?.nomEn ?? ''}`), poids: 2 },
      { texte: normaliser(`${demarche.description ?? ''} ${demarche.descriptionEn ?? ''}`), poids: 1 }
    ].map((c) => ({ ...c, mots: c.texte.split(' ') }));

    let score = 0;
    for (const mot of mots) {
      const meilleur = Math.max(0, ...champs.map((c) => c.poids * correspondance(mot, c.texte, c.mots)));
      if (meilleur === 0) {
        return; // un mot introuvable : la démarche ne correspond pas
      }
      score += meilleur;
    }

    resultats.push({ demarche, score, rang });
  });

  return resultats
    .sort((a, b) => b.score - a.score || a.rang - b.rang)
    .map((r) => r.demarche);
}
