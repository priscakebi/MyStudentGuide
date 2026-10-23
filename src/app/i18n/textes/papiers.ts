import { Traductions } from './type';

/** Page « Mes papiers » (/dashboard/papiers) : dates d'expiration des documents. */
export const PAPIERS = {
  'papiers.titre': { fr: 'Mes papiers', en: 'My documents' },
  'papiers.intro': {
    fr: "Notez la date d'expiration de vos documents : vous serez prévenu 3 mois, 1 mois et 1 semaine avant, pour les renouveler à temps.",
    en: "Note the expiry date of your documents: you will be notified 3 months, 1 month and 1 week before, so you can renew them in time."
  },
  'papiers.confidentialite': {
    fr: "Aucun fichier n'est envoyé : seulement le type de document et sa date.",
    en: 'No file is uploaded: only the type of document and its date.'
  },
  'papiers.titreSejour': {
    fr: 'Votre titre de séjour se suit dans votre profil (date de fin), avec ses propres rappels de renouvellement.',
    en: 'Your residence permit is tracked in your profile (end date), with its own renewal reminders.'
  },
  'papiers.titreSejour.lien': { fr: 'Ouvrir mon profil', en: 'Open my profile' },

  'papiers.ajouter': { fr: 'Ajouter un document', en: 'Add a document' },
  'papiers.modifier': { fr: 'Modifier le document', en: 'Edit the document' },
  'papiers.type': { fr: 'Type de document', en: 'Type of document' },
  'papiers.type.choisir': { fr: 'Choisir…', en: 'Choose…' },
  'papiers.nom': { fr: 'Nom', en: 'Name' },
  'papiers.nom.aide': {
    fr: 'Facultatif, sauf pour « Autre » (ex. : Assurance MAIF).',
    en: 'Optional, except for “Other” (e.g. MAIF insurance).'
  },
  'papiers.date': { fr: "Date d'expiration", en: 'Expiry date' },
  'papiers.enregistrer': { fr: 'Enregistrer', en: 'Save' },
  'papiers.annuler': { fr: 'Annuler', en: 'Cancel' },
  'papiers.erreur.champs': {
    fr: 'Choisissez le type et la date d’expiration (et un nom pour « Autre »).',
    en: 'Choose the type and the expiry date (and a name for “Other”).'
  },
  'papiers.erreur.serveur': { fr: "L'opération a échoué. Réessayez.", en: 'The operation failed. Please try again.' },
  'papiers.ajoute': { fr: 'Document ajouté.', en: 'Document added.' },
  'papiers.modifie': { fr: 'Document modifié.', en: 'Document updated.' },
  'papiers.supprime': { fr: 'Document supprimé.', en: 'Document deleted.' },
  'papiers.confirmerSuppression': { fr: 'Supprimer « {nom} » ?', en: 'Delete “{nom}”?' },

  'papiers.liste': { fr: 'Mes documents', en: 'Saved documents' },
  'papiers.vide': {
    fr: 'Aucun document pour l’instant. Commencez par votre passeport.',
    en: 'No documents yet. Start with your passport.'
  },
  'papiers.expireLe': { fr: 'Expire le {date}', en: 'Expires on {date}' },
  'papiers.statut.expire': { fr: 'Expiré', en: 'Expired' },
  'papiers.statut.bientot': { fr: 'Dans {n} jour(s)', en: 'In {n} day(s)' },
  'papiers.statut.valide': { fr: 'Valide', en: 'Valid' },
  'papiers.action.modifier': { fr: 'Modifier {nom}', en: 'Edit {nom}' },
  'papiers.action.supprimer': { fr: 'Supprimer {nom}', en: 'Delete {nom}' },

  'papiers.type.PASSEPORT': { fr: 'Passeport', en: 'Passport' },
  'papiers.type.CARTE_IDENTITE': { fr: "Carte d'identité", en: 'ID card' },
  'papiers.type.VISA': { fr: 'Visa', en: 'Visa' },
  'papiers.type.CARTE_ETUDIANT': { fr: 'Carte étudiante', en: 'Student card' },
  'papiers.type.ASSURANCE_HABITATION': { fr: 'Assurance habitation', en: 'Home insurance' },
  'papiers.type.MUTUELLE': { fr: 'Mutuelle', en: 'Health insurance (mutuelle)' },
  'papiers.type.BAIL': { fr: 'Bail du logement', en: 'Housing lease' },
  'papiers.type.PERMIS_CONDUIRE': { fr: 'Permis de conduire', en: 'Driving licence' },
  'papiers.type.AUTRE': { fr: 'Autre', en: 'Other' },

  'espace.menu.papiers': { fr: 'Mes papiers', en: 'My documents' },
  'titre.mesPapiers': { fr: 'Mes papiers', en: 'My documents' }
} satisfies Traductions;
