import { Traductions } from './type';

/** Espace étudiant : barre latérale et page « Mon espace » (/dashboard). */
export const ESPACE = {
  'espace.menu.ouvrir': { fr: 'Ouvrir le menu', en: 'Open menu' },
  'espace.menu.fermer': { fr: 'Fermer le menu', en: 'Close menu' },
  'espace.menu.label': { fr: "Menu de l'espace étudiant", en: 'Student space menu' },
  'espace.notifs.label': { fr: 'Notifications : {n} non lue(s)', en: 'Notifications: {n} unread' },
  'espace.nonLues': { fr: '{n} non lue(s)', en: '{n} unread' },
  'espace.sousTitre': { fr: 'Espace étudiant', en: 'Student space' },
  'espace.voirProfil': { fr: 'Voir mon profil', en: 'See my profile' },
  'espace.etudiant': { fr: 'Étudiant', en: 'Student' },
  'espace.section.parcours': { fr: 'Mon parcours', en: 'My journey' },
  'espace.section.explorer': { fr: 'Explorer', en: 'Explore' },
  'espace.section.compte': { fr: 'Mon compte', en: 'My account' },
  'espace.menu.monEspace': { fr: 'Mon espace', en: 'My space' },
  'espace.menu.mesDemarches': { fr: 'Mes démarches', en: 'My procedures' },
  'espace.menu.notifications': { fr: 'Notifications', en: 'Notifications' },
  'espace.menu.toutesDemarches': { fr: 'Toutes les démarches', en: 'All procedures' },
  'espace.menu.documents': { fr: 'Documents requis', en: 'Required documents' },
  'espace.menu.profil': { fr: 'Mon profil', en: 'My profile' },
  'espace.menu.parametres': { fr: 'Paramètres du compte', en: 'Account settings' },
  'espace.menu.aide': { fr: "Besoin d'aide ?", en: 'Need help?' },
  'espace.retourSite': { fr: 'Retour au site', en: 'Back to the site' },

  'espace.bonjour': { fr: 'Bonjour {prenom} 👋', en: 'Hello {prenom} 👋' },
  'espace.intro': {
    fr: "Suivez l'avancement de vos démarches et retrouvez ce qui vous attend cette semaine.",
    en: 'Track the progress of your procedures and see what is coming up this week.'
  },
  'espace.explorer': { fr: 'Explorer les démarches', en: 'Explore procedures' },
  'espace.progression.label': { fr: 'Progression globale : {n} %', en: 'Overall progress: {n}%' },
  'espace.progression.texte': { fr: 'de mon parcours', en: 'of my journey' },
  'espace.kpi.label': { fr: 'Mes chiffres clés', en: 'My key figures' },
  'espace.kpi.enCours.1': { fr: 'démarche en cours', en: 'procedure in progress' },
  'espace.kpi.enCours.n': { fr: 'démarches en cours', en: 'procedures in progress' },
  'espace.kpi.terminees.1': { fr: 'terminée', en: 'completed' },
  'espace.kpi.terminees.n': { fr: 'terminées', en: 'completed' },
  'espace.kpi.notifs.1': { fr: 'notification non lue', en: 'unread notification' },
  'espace.kpi.notifs.n': { fr: 'notifications non lues', en: 'unread notifications' },
  'espace.kpi.complet': { fr: 'Complet', en: 'Complete' },
  'espace.kpi.aCompleter': { fr: 'À compléter', en: 'To complete' },
  'espace.kpi.profil': { fr: 'mon profil', en: 'my profile' },
  'espace.enCours.titre': { fr: 'Mes démarches en cours', en: 'My procedures in progress' },
  'espace.toutVoir': { fr: 'Tout voir ({n}) →', en: 'See all ({n}) →' },
  'espace.aucune': { fr: "Vous n'avez aucune démarche en cours.", en: 'You have no procedures in progress.' },
  'espace.choisir': { fr: 'Choisir une démarche', en: 'Choose a procedure' },
  'espace.progressionDe': { fr: 'Progression de {titre}', en: 'Progress of {titre}' },
  'espace.prochaine.terminer': {
    fr: 'Marquez-la comme terminée une fois la démarche finalisée.',
    en: 'Mark it as completed once the procedure is finished.'
  },
  'espace.prochaine.documents': {
    fr: 'Prochaine étape : envoyer vos documents sur la plateforme officielle.',
    en: 'Next step: submit your documents on the official platform.'
  },
  'espace.profil.titre': { fr: 'Complétez votre profil', en: 'Complete your profile' },
  'espace.profil.texte': {
    fr: 'Votre nationalité, votre visa et votre logement nous aident à vous suggérer les bonnes démarches.',
    en: 'Your nationality, visa and housing help us suggest the right procedures for you.'
  },
  'espace.echeances.titre': { fr: 'Prochaines échéances', en: 'Upcoming deadlines' },
  'espace.echeances.aucune': {
    fr: 'Aucune date limite à venir pour vos démarches en cours.',
    en: 'No upcoming deadlines for your procedures in progress.'
  },
  'espace.echeances.aujourdhui': { fr: "Aujourd'hui", en: 'Today' },
  'espace.echeances.demain': { fr: 'Demain', en: 'Tomorrow' },
  'espace.echeances.dans': { fr: 'Dans {n} jours', en: 'In {n} days' },
  'espace.suggestions.titre': { fr: 'Suggéré pour vous', en: 'Suggested for you' },
  'espace.raccourcis': { fr: 'Raccourcis', en: 'Shortcuts' },
  'espace.raccourci.demarches.texte': { fr: 'Séjour, santé, logement, banque…', en: 'Residence, health, housing, banking…' },
  'espace.raccourci.documents.texte': { fr: "Préparez vos pièces à l'avance", en: 'Prepare your documents in advance' },
  'espace.raccourci.compte.texte': { fr: 'Mot de passe et sécurité', en: 'Password and security' }
} satisfies Traductions;
