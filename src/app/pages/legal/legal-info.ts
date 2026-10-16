// ============================================================
// INFORMATIONS LÉGALES (mentions légales, confidentialité, CGU)
// ============================================================
//
// À COMPLÉTER avant la mise en ligne publique : les champs dont la
// valeur commence par « [À compléter » s'affichent surlignés en
// orange sur les pages légales tant qu'ils ne sont pas renseignés.
//
// VERSION_CONDITIONS doit rester identique à la constante VERSION
// de l'API (validation/ConditionsUtilisation.java) : c'est la version
// enregistrée avec le consentement de chaque étudiant à l'inscription.
// En cas de modification importante des conditions ou de la politique
// de confidentialité, changer la version des deux côtés.
// ============================================================

export const VERSION_CONDITIONS = '2026-10';

/** Date de mise à jour affichée en haut des pages. */
export const DATE_MISE_A_JOUR = '16 octobre 2026';

export const EDITEUR = {
  /** Personne ou structure qui publie le site (nom et prénom pour une personne physique). */
  nom: '[À compléter : nom de l’éditeur ou de l’éditrice du site]',

  /** Ex. « Projet étudiant à titre personnel », « Association loi 1901 »… */
  statut: '[À compléter : statut (ex. projet personnel non commercial)]',

  /** Adresse de contact (exigée par la loi pour l'éditeur). */
  adresse: '[À compléter : adresse postale de l’éditeur]',

  /** Directeur ou directrice de la publication (souvent l'éditeur lui-même). */
  directeurPublication: '[À compléter : nom du directeur ou de la directrice de la publication]',

  /** Adresse e-mail pour toute question, dont l'exercice des droits RGPD. */
  email: '[À compléter : adresse e-mail de contact]'
};

/**
 * Prestataires qui hébergent ou traitent des données pour le compte du site.
 * Vérifier les adresses et les régions d'hébergement choisies dans chaque service.
 */
export const HEBERGEURS = [
  {
    role: 'Hébergement du site et de l’API',
    nom: 'Render Services, Inc.',
    adresse: '525 Brannan Street, Suite 300, San Francisco, CA 94107, États-Unis',
    site: 'https://render.com'
  },
  {
    role: 'Base de données',
    nom: '[À compléter : hébergeur de la base de données MySQL]',
    adresse: '[À compléter : adresse et pays d’hébergement]',
    site: ''
  },
  {
    role: 'Envoi des e-mails (inscription, mot de passe oublié)',
    nom: 'Brevo (Sendinblue SAS)',
    adresse: '106 boulevard Haussmann, 75008 Paris, France',
    site: 'https://www.brevo.com'
  },
  {
    // Seulement si SENTRY_DSN (API) ou sentryDsn (site) est renseigné.
    // Choisir la région « EU » à la création de l'organisation Sentry.
    role: 'Suivi des erreurs techniques (rapports d’erreur, sans nom ni adresse e-mail)',
    nom: 'Functional Software, Inc. (Sentry)',
    adresse: '45 Fremont Street, 8th Floor, San Francisco, CA 94105, États-Unis ; données hébergées dans l’Union européenne (Francfort)',
    site: 'https://sentry.io'
  }
];

/**
 * Durée de conservation des rapports d'erreur chez Sentry
 * (à vérifier dans Sentry : Settings → Subscription / Data retention).
 */
export const CONSERVATION_RAPPORTS_ERREUR = '30 jours (offre gratuite de Sentry), puis suppression automatique';

/**
 * Render (hébergeur) est une société américaine. Si les serveurs sont dans la
 * région « Frankfurt » de Render, les données restent dans l'Union européenne ;
 * sinon, le transfert vers les États-Unis doit être encadré (accord de traitement
 * des données de Render, clauses contractuelles types de la Commission européenne).
 * Indiquer ici la situation réelle.
 */
export const GARANTIES_TRANSFERT =
  '[À compléter : région des serveurs Render (ex. Francfort, Union européenne) ou garanties du transfert vers les États-Unis]';

/** Vrai si une valeur n'a pas encore été renseignée. */
export function aCompleter(valeur: string): boolean {
  return valeur.startsWith('[À compléter');
}
