import { Traductions } from './type';

/** Textes partagés par plusieurs pages (boutons, états, statuts). */
export const COMMUN = {
  'commun.chargement': { fr: 'Chargement…', en: 'Loading…' },
  'commun.reessayer': { fr: 'Réessayer', en: 'Try again' },
  'commun.annuler': { fr: 'Annuler', en: 'Cancel' },
  'commun.enregistrer': { fr: 'Enregistrer', en: 'Save' },
  'commun.fermer': { fr: 'Fermer', en: 'Close' },
  'commun.retour': { fr: 'Retour', en: 'Back' },
  'commun.envoyer': { fr: 'Envoyer', en: 'Send' },
  'commun.supprimer': { fr: 'Supprimer', en: 'Delete' },
  'commun.modifier': { fr: 'Modifier', en: 'Edit' },
  'commun.voirPlus': { fr: 'Voir plus', en: 'See more' },
  'commun.oui': { fr: 'Oui', en: 'Yes' },
  'commun.non': { fr: 'Non', en: 'No' },
  'commun.seConnecter': { fr: 'Se connecter', en: 'Log in' },
  'commun.creerCompte': { fr: 'Créer un compte', en: 'Create an account' },
  'commun.deconnexion': { fr: 'Déconnexion', en: 'Log out' },
  'commun.nouvelOnglet': { fr: '(nouvel onglet)', en: '(opens in a new tab)' },
  'commun.erreurReseau': {
    fr: 'Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.',
    en: 'Unable to reach the server. Check your connection and try again.'
  },

  'statut.EN_COURS': { fr: 'En cours', en: 'In progress' },
  'statut.TERMINEE': { fr: 'Terminée', en: 'Completed' },
  'statut.A_FAIRE': { fr: 'À faire', en: 'To do' },
  'statut.NON_CONCERNEE': { fr: 'Non concernée', en: 'Not applicable' },

  'docType.IDENTITE': { fr: 'Identité', en: 'Identity' },
  'docType.SCOLARITE': { fr: 'Scolarité', en: 'Studies' },
  'docType.DOMICILE': { fr: 'Domicile', en: 'Address' },
  'docType.RESSOURCES': { fr: 'Ressources', en: 'Income' },
  'docType.PHOTO': { fr: 'Photo', en: 'Photo' },
  'docType.ASSURANCE': { fr: 'Assurance', en: 'Insurance' },
  'docType.AUTRE': { fr: 'Autre', en: 'Other' },

  'langue.choisir': { fr: 'Langue', en: 'Language' },
  'langue.fr': { fr: 'Français', en: 'French' },
  'langue.en': { fr: 'Anglais', en: 'English' }
} satisfies Traductions;
