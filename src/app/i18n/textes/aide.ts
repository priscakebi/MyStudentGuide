import { Traductions } from './type';

/** Besoin d'aide ? (/dashboard/aide). */
export const AIDE = {
  'aide.titre': { fr: "Besoin d'aide ?", en: 'Need help?' },
  'aide.intro': {
    fr: "Une étape n'est pas claire, un document vous pose problème ? Écrivez à l'équipe MyStudentGuide : la réponse vous arrivera en notification et s'affichera ci-dessous.",
    en: 'Is a step unclear, or is a document giving you trouble? Write to the MyStudentGuide team: the reply will arrive as a notification and appear below.'
  },
  'aide.nouvelle': { fr: 'Nouvelle demande', en: 'New request' },
  'aide.limite': {
    fr: "Vous avez déjà 3 demandes en attente. Attendez une réponse avant d'en envoyer une nouvelle.",
    en: 'You already have 3 pending requests. Please wait for a reply before sending a new one.'
  },
  'aide.sujet': { fr: 'Sujet', en: 'Subject' },
  'aide.sujet.choisir': { fr: 'Choisissez un sujet', en: 'Choose a subject' },
  'aide.sujet.manquant': { fr: 'Choisissez le sujet de votre demande.', en: 'Choose the subject of your request.' },
  'aide.sujet.DEMARCHE': { fr: 'Une démarche', en: 'A procedure' },
  'aide.sujet.DOCUMENT': { fr: 'Un document', en: 'A document' },
  'aide.sujet.COMPTE': { fr: 'Mon compte', en: 'My account' },
  'aide.sujet.TECHNIQUE': { fr: 'Problème technique', en: 'Technical problem' },
  'aide.sujet.AUTRE': { fr: 'Autre', en: 'Other' },
  'aide.demarche': { fr: 'Démarche concernée', en: 'Related procedure' },
  'aide.facultatif': { fr: 'Facultatif', en: 'Optional' },
  'aide.demarche.aucune': { fr: 'Aucune en particulier', en: 'None in particular' },
  'aide.message': { fr: 'Votre message', en: 'Your message' },
  'aide.message.placeholder': {
    fr: 'Expliquez votre difficulté : ce que vous avez essayé, à quelle étape vous êtes bloqué(e)…',
    en: 'Explain your difficulty: what you tried, which step you are stuck on…'
  },
  'aide.message.court': {
    fr: 'Votre message doit faire au moins {n} caractères.',
    en: 'Your message must be at least {n} characters long.'
  },
  'aide.confidentialite': {
    fr: "🔒 N'indiquez pas de données sensibles : numéro de passeport ou de titre de séjour, coordonnées bancaires, mot de passe.",
    en: '🔒 Do not include sensitive data: passport or residence permit number, bank details, password.'
  },
  'aide.envoi': { fr: 'Envoi…', en: 'Sending…' },
  'aide.envoyer': { fr: 'Envoyer ma demande', en: 'Send my request' },
  'aide.avant.titre': { fr: "Avant d'écrire", en: 'Before you write' },
  'aide.avant.demarches': { fr: 'Parcourez les démarches', en: 'Browse the procedures' },
  'aide.avant.demarches.suite': {
    fr: ': chaque fiche détaille les étapes et les liens officiels.',
    en: ': each page details the steps and the official links.'
  },
  'aide.avant.documents': { fr: 'Consultez les documents requis', en: 'Check the required documents' },
  'aide.avant.documents.suite': { fr: 'pour chaque démarche.', en: 'for each procedure.' },
  'aide.avant.signaler': {
    fr: 'Une information est fausse ou dépassée ? Utilisez « Signaler une erreur » sur la page de la démarche.',
    en: 'Is some information wrong or outdated? Use “Report an error” on the procedure page.'
  },
  'aide.avant.delai': {
    fr: "L'équipe répond en général sous quelques jours ouvrés. Vos demandes sont conservées 12 mois après leur traitement, et supprimées avec votre compte.",
    en: 'The team usually replies within a few working days. Your requests are kept for 12 months after they are handled, and deleted with your account.'
  },
  'aide.mesDemandes': { fr: 'Mes demandes', en: 'My requests' },
  'aide.chargement': { fr: 'Chargement de vos demandes…', en: 'Loading your requests…' },
  'aide.aucune': { fr: "Vous n'avez encore envoyé aucune demande.", en: 'You have not sent any requests yet.' },
  'aide.formatDate': { fr: "d MMM y 'à' HH:mm", en: 'd MMM y, HH:mm' },
  'aide.demarcheLabel': { fr: 'Démarche :', en: 'Procedure:' },
  'aide.reponse': { fr: "Réponse de l'équipe", en: "Team's reply" },
  'aide.statut.OUVERTE': { fr: 'En attente', en: 'Pending' },
  'aide.statut.REPONDUE': { fr: 'Répondue', en: 'Answered' },
  'aide.statut.FERMEE': { fr: 'Fermée', en: 'Closed' },
  'aide.erreur.liste': {
    fr: 'Impossible de charger vos demandes. Réessayez dans un instant.',
    en: 'Unable to load your requests. Please try again in a moment.'
  },
  'aide.succes': {
    fr: 'Votre demande a bien été envoyée. Vous recevrez la réponse en notification.',
    en: 'Your request has been sent. You will receive the reply as a notification.'
  },
  'aide.erreur.envoi': { fr: "L'envoi a échoué. Réessayez dans un instant.", en: 'Sending failed. Please try again in a moment.' },
  'aide.supprimer.confirmer': {
    fr: 'Supprimer définitivement cette demande et sa réponse ?',
    en: 'Permanently delete this request and its reply?'
  },
  'aide.erreur.suppression': { fr: 'La suppression a échoué.', en: 'Deletion failed.' }
} satisfies Traductions;
