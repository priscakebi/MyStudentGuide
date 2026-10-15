import { Traductions } from './type';

/** Suivi de mes démarches (/dashboard/suivis). */
export const SUIVIS = {
  'suivis.label': { fr: 'MON ESPACE', en: 'MY SPACE' },
  'suivis.titre': { fr: 'Suivi de mes démarches', en: 'Tracking my procedures' },
  'suivis.intro': {
    fr: "Retrouvez ici l'ensemble de vos démarches administratives et faites évoluer leur statut au fil de votre avancée.",
    en: 'Find all your administrative procedures here and update their status as you go.'
  },
  'suivis.progressionGlobale': { fr: 'Progression globale', en: 'Overall progress' },
  'suivis.filtre.toutes': { fr: 'Toutes', en: 'All' },
  'suivis.filtre.enCours': { fr: 'En cours', en: 'In progress' },
  'suivis.filtre.terminees': { fr: 'Terminées', en: 'Completed' },
  'suivis.chargement.titre': { fr: 'Chargement de vos démarches', en: 'Loading your procedures' },
  'suivis.chargement.texte': { fr: 'Nous récupérons votre parcours administratif...', en: 'We are fetching your progress...' },
  'suivis.erreur.titre': { fr: 'Une erreur est survenue', en: 'Something went wrong' },
  'suivis.erreur.chargement': {
    fr: 'Impossible de récupérer vos démarches pour le moment.',
    en: 'Unable to load your procedures at the moment.'
  },
  'suivis.parcours': { fr: 'VOTRE PARCOURS', en: 'YOUR JOURNEY' },
  'suivis.vosDemarches': { fr: 'Vos démarches', en: 'Your procedures' },
  'suivis.compte.1': { fr: '1 démarche', en: '1 procedure' },
  'suivis.compte.n': { fr: '{n} démarches', en: '{n} procedures' },
  'suivis.progression': { fr: 'Progression', en: 'Progress' },
  'suivis.etape.commencee': { fr: 'Commencée', en: 'Started' },
  'suivis.etape.documents': { fr: 'Documents envoyés', en: 'Documents submitted' },
  'suivis.etape.terminee': { fr: 'Terminée', en: 'Completed' },
  'suivis.documentsEnvoyes': { fr: "📤 J'ai envoyé mes documents", en: '📤 I have submitted my documents' },
  'suivis.marquerTerminee': { fr: '✓ Marquer comme terminée', en: '✓ Mark as completed' },
  'suivis.merciAvis': { fr: '★ Merci pour votre avis', en: '★ Thank you for your review' },
  'suivis.statut': { fr: 'Statut', en: 'Status' },
  'suivis.retirer': { fr: 'Retirer', en: 'Remove' },
  'suivis.consulter': { fr: 'Consulter', en: 'View' },
  'suivis.vide.titre': { fr: 'Aucune démarche', en: 'No procedures' },
  'suivis.vide.toutes': { fr: "Vous n'avez encore commencé aucune démarche.", en: 'You have not started any procedures yet.' },
  'suivis.vide.enCours': { fr: "Vous n'avez aucune démarche en cours.", en: 'You have no procedures in progress.' },
  'suivis.vide.terminees': { fr: "Vous n'avez encore terminé aucune démarche.", en: 'You have not completed any procedures yet.' },
  'suivis.voirToutes': { fr: 'Voir toutes mes démarches', en: 'See all my procedures' },
  'suivis.parcourir': { fr: 'Parcourir les démarches', en: 'Browse procedures' },
  'suivis.bravo': {
    fr: 'Bravo, démarche terminée ! Vous pouvez maintenant donner votre avis.',
    en: 'Well done, procedure completed! You can now leave a review.'
  },
  'suivis.statutMisAJour': { fr: 'Statut mis à jour : {statut}.', en: 'Status updated: {statut}.' },
  'suivis.retirer.confirmer': {
    fr: 'Retirer « {titre} » de vos démarches ? Votre progression sera perdue.',
    en: 'Remove “{titre}” from your procedures? Your progress will be lost.'
  },
  'suivis.retiree': { fr: 'La démarche a été retirée de votre suivi.', en: 'The procedure has been removed from your tracking.' },
  'suivis.erreur.retirer': { fr: 'Impossible de retirer cette démarche.', en: 'Unable to remove this procedure.' },
  'suivis.documentsOk': { fr: 'Documents envoyés : votre progression avance !', en: 'Documents submitted: you are making progress!' },
  'suivis.erreur.maj': { fr: 'La mise à jour a échoué. Veuillez réessayer.', en: 'The update failed. Please try again.' }
} satisfies Traductions;
