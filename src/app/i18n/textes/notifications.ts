import { Traductions } from './type';

/** Notifications (/notifications et /dashboard/notifications). */
export const NOTIFICATIONS = {
  'notif.visiteur.titre': { fr: 'Vos notifications', en: 'Your notifications' },
  'notif.visiteur.texte': {
    fr: "Connectez-vous pour recevoir vos rappels d'échéance et des suggestions de démarches adaptées à votre profil.",
    en: 'Log in to receive deadline reminders and suggestions of procedures that match your profile.'
  },
  'notif.retour': { fr: '← Retour aux notifications', en: '← Back to notifications' },
  'notif.nonLue': { fr: 'Non lue', en: 'Unread' },
  'notif.formatDate': { fr: 'dd/MM/yyyy HH:mm', en: 'dd/MM/yyyy HH:mm' },
  'notif.documents.question': {
    fr: 'Avez-vous envoyé vos documents sur la plateforme dédiée ?',
    en: 'Have you submitted your documents on the dedicated platform?'
  },
  'notif.documents.oui': { fr: "Oui, c'est fait", en: 'Yes, done' },
  'notif.documents.non': { fr: 'Pas encore', en: 'Not yet' },
  'notif.commencer': { fr: 'Commencer', en: 'Start' },
  'notif.commencee': { fr: '✓ Démarche commencée', en: '✓ Procedure started' },
  'notif.marquerLue': { fr: '✓ Marquer comme lue', en: '✓ Mark as read' },
  'notif.supprimer': { fr: '🗑 Supprimer', en: '🗑 Delete' },
  'notif.titre': { fr: 'Notifications', en: 'Notifications' },
  'notif.intro': { fr: 'Retrouvez ici toutes vos notifications.', en: 'All your notifications are here.' },
  'notif.contenuFrancais': {
    fr: '',
    en: 'Notifications are written by the team in French.'
  },
  'notif.nonLues.1': { fr: 'non lue', en: 'unread' },
  'notif.nonLues.n': { fr: 'non lues', en: 'unread' },
  'notif.actualiser': { fr: '↻ Actualiser', en: '↻ Refresh' },
  'notif.chargement': { fr: 'Chargement des notifications...', en: 'Loading notifications...' },
  'notif.vide.titre': { fr: 'Aucune notification', en: 'No notifications' },
  'notif.vide.texte': { fr: "Vous n'avez actuellement aucune notification.", en: 'You have no notifications at the moment.' },
  'notif.erreur.identifiant': {
    fr: 'Impossible de récupérer votre identifiant utilisateur.',
    en: 'Unable to retrieve your user ID.'
  },
  'notif.erreur.chargement': { fr: 'Impossible de charger vos notifications.', en: 'Unable to load your notifications.' },
  'notif.ajoutee': { fr: '« {titre} » a été ajoutée à vos démarches.', en: '“{titre}” has been added to your procedures.' },
  'notif.laDemarche': { fr: 'La démarche', en: 'The procedure' },
  'notif.documents.merci': { fr: 'Merci ! Votre progression a été mise à jour.', en: 'Thank you! Your progress has been updated.' },
  'notif.documents.plusTard': {
    fr: "D'accord, nous vous reposerons la question dans 10 jours.",
    en: "OK, we'll ask you again in 10 days."
  },
  'notif.erreur.reponse': { fr: "Impossible d'enregistrer votre réponse.", en: 'Unable to save your answer.' }
} satisfies Traductions;
