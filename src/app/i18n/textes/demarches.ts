import { Traductions } from './type';

/** Liste des démarches (/demarches). */
export const DEMARCHES = {
  'demarches.label': { fr: 'DÉMARCHES ADMINISTRATIVES', en: 'ADMINISTRATIVE PROCEDURES' },
  'demarches.titre': { fr: 'Mes démarches', en: 'Procedures' },
  'demarches.intro': {
    fr: "Retrouvez toutes les démarches administratives de l'étudiant international, consultez leurs étapes et commencez celles qui vous concernent.",
    en: 'Find all the administrative procedures for international students, see their steps and start the ones that concern you.'
  },
  'demarches.carte.titre': { fr: 'Toutes les démarches', en: 'All procedures' },
  'demarches.carte.texte': { fr: 'Tout au même endroit', en: 'Everything in one place' },
  'demarches.catalogue': { fr: 'CATALOGUE', en: 'CATALOGUE' },
  'demarches.aide': {
    fr: "Cliquez sur « Voir plus » pour le détail d'une démarche, ou sur « Commencer » pour l'ajouter à votre suivi.",
    en: 'Click “See more” for the details of a procedure, or “Start” to add it to your tracking.'
  },
  'demarches.visiteur': {
    fr: 'Vous pouvez consulter toutes les démarches. Pour en commencer une et suivre votre progression, connectez-vous ou créez un compte étudiant.',
    en: 'You can browse all procedures. To start one and track your progress, log in or create a student account.'
  },
  'demarches.recherche.placeholder': {
    fr: 'Rechercher une démarche : titre de séjour, CAF, carte Vitale…',
    en: 'Search for a procedure: residence permit, CAF, Carte Vitale…'
  },
  'demarches.recherche.effacer': { fr: 'Effacer la recherche', en: 'Clear search' },
  'demarches.filtre.label': { fr: 'Filtrer par catégorie', en: 'Filter by category' },
  'demarches.filtre.toutes': { fr: 'Toutes', en: 'All' },
  'demarches.chargement.titre': { fr: 'Chargement des démarches...', en: 'Loading procedures...' },
  'demarches.chargement.texte': { fr: 'Nous récupérons la liste des démarches.', en: 'We are fetching the list of procedures.' },
  'demarches.erreur.titre': { fr: 'Impossible de charger les démarches', en: 'Unable to load the procedures' },
  'demarches.erreur.texte': { fr: 'Impossible de charger les démarches.', en: 'Unable to load the procedures.' },
  'demarches.vide.titre': { fr: 'Aucune démarche', en: 'No procedures' },
  'demarches.vide.texte': { fr: "Aucune démarche n'est disponible pour le moment.", en: 'No procedures are available at the moment.' },
  'demarches.resultats.0': { fr: 'Aucune démarche trouvée', en: 'No procedures found' },
  'demarches.resultats.1': { fr: '1 démarche trouvée', en: '1 procedure found' },
  'demarches.resultats.n': { fr: '{n} démarches trouvées', en: '{n} procedures found' },
  'demarches.resultats.pour': { fr: 'pour « {q} »', en: 'for “{q}”' },
  'demarches.aucunResultat.titre': { fr: 'Aucune démarche ne correspond', en: 'No matching procedures' },
  'demarches.aucunResultat.texte': {
    fr: 'Essayez un autre mot (par exemple « logement », « santé » ou « banque ») ou affichez toutes les démarches.',
    en: 'Try another word (for example “housing”, “health” or “bank”) or show all procedures.'
  },
  'demarches.voirToutes': { fr: 'Voir toutes les démarches', en: 'See all procedures' },
  'demarches.dateLimite': { fr: 'Date limite : {date}', en: 'Deadline: {date}' },
  'demarches.continuer': { fr: 'Continuer', en: 'Continue' },
  'demarches.terminee': { fr: '✓ Démarche terminée', en: '✓ Procedure completed' },
  'demarches.donnerAvis': { fr: '★ Donner mon avis', en: '★ Leave a review' },
  'demarches.commencer': { fr: 'Commencer', en: 'Start' },
  'demarches.ajout': { fr: 'Ajout...', en: 'Adding...' },
  'demarches.connexionRequise': {
    fr: 'Connectez-vous avec un compte étudiant pour commencer',
    en: 'Log in with a student account to start'
  },
  'demarches.suivi.label': { fr: "BESOIN D'UN SUIVI PLUS COMPLET ?", en: 'WANT MORE DETAILED TRACKING?' },
  'demarches.suivi.titre': { fr: "Suivez l'avancement de vos démarches", en: 'Track the progress of your procedures' },
  'demarches.suivi.texte': {
    fr: 'Retrouvez les démarches que vous avez commencées et votre progression depuis votre espace personnel.',
    en: 'Find the procedures you have started and your progress in your personal space.'
  },
  'demarches.ajoutee': {
    fr: '« {titre} » a été ajoutée à vos démarches. Suivez votre progression depuis « Mon espace ».',
    en: '“{titre}” has been added to your procedures. Track your progress from “My space”.'
  },
  'demarches.erreurCommencer': { fr: 'Impossible de commencer cette démarche.', en: 'Unable to start this procedure.' },
  'demarches.avisMerci': {
    fr: "Merci ! Votre avis est maintenant visible sur la page d'accueil.",
    en: 'Thank you! Your review is now visible on the home page.'
  }
} satisfies Traductions;
