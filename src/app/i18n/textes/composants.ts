import { Traductions } from './type';

/** Composants partagés : inactivité, écran de chargement, préfecture, avis. */
export const COMPOSANTS = {
  // Déconnexion pour inactivité (app.html)
  'inactif.titre': { fr: 'Toujours là ?', en: 'Still there?' },
  'inactif.texte': {
    fr: 'Pour votre sécurité, vous allez être déconnecté dans {s} s faute d’activité.',
    en: 'For your security, you will be logged out in {s} s due to inactivity.'
  },
  'inactif.rester': { fr: 'Rester connecté', en: 'Stay logged in' },
  'inactif.deconnecter': { fr: 'Se déconnecter', en: 'Log out' },

  // Écran de chargement après connexion
  'loader.bienvenuePrenom': { fr: 'Bienvenue {prenom} !', en: 'Welcome, {prenom}!' },
  'loader.bienvenue': { fr: 'Bienvenue !', en: 'Welcome!' },
  'loader.preparation': { fr: 'Nous préparons votre espace étudiant…', en: 'We are getting your student space ready…' },
  'loader.sejour': { fr: 'Titre de séjour', en: 'Residence permit' },
  'loader.sante': { fr: 'Santé', en: 'Health' },
  'loader.logement': { fr: 'Logement', en: 'Housing' },
  'loader.banque': { fr: 'Banque', en: 'Bank' },
  'loader.documents': { fr: 'Documents', en: 'Documents' },
  'loader.prefecture': { fr: 'Préfecture', en: 'Prefecture' },
  'loader.job': { fr: 'Job étudiant', en: 'Student job' },
  'loader.etudes': { fr: 'Études', en: 'Studies' },
  'loader.france': { fr: 'France', en: 'France' },
  'loader.bibliotheque': { fr: 'Bibliothèque', en: 'Library' },
  'loader.paris': { fr: 'Paris', en: 'Paris' },
  'loader.transports': { fr: 'Transports', en: 'Transport' },
  'loader.vie': { fr: 'Vie en France', en: 'Life in France' },
  'loader.campus': { fr: 'Campus', en: 'Campus' },

  // Carte « Ma préfecture »
  'prefecture.titre': { fr: 'Ma préfecture', en: 'My prefecture' },
  'prefecture.recherche': { fr: 'Recherche de votre préfecture…', en: 'Finding your prefecture…' },
  'prefecture.rendezVous': { fr: 'Prendre rendez-vous ↗', en: 'Book an appointment ↗' },
  'prefecture.itineraire': { fr: 'Itinéraire ↗', en: 'Directions ↗' },
  'prefecture.fiche': { fr: 'Fiche officielle ↗', en: 'Official listing ↗' },
  'prefecture.source.ville': {
    fr: "D'après votre ville d'études : {ville} ({departement}).",
    en: 'Based on your city of study: {ville} ({departement}).'
  },
  'prefecture.source.pasBonne': {
    fr: "Ce n'est pas la bonne ? Ajoutez le code postal dans",
    en: 'Not the right one? Add the postcode in'
  },
  'prefecture.source.profil': { fr: 'votre profil', en: 'your profile' },
  'prefecture.source.exemple': { fr: '(ex. : Saint-Denis 93200).', en: '(e.g. Saint-Denis 93200).' },
  'prefecture.source.annuaire': {
    fr: "Source : Annuaire de l'administration, Service-Public.gouv.fr.",
    en: 'Source: French government directory, Service-Public.gouv.fr.'
  },
  'prefecture.villeManquante': {
    fr: "Renseignez votre ville d'études pour connaître l'adresse, les horaires et la prise de rendez-vous de votre préfecture.",
    en: 'Enter your city of study to see the address, opening hours and appointment booking for your prefecture.'
  },
  'prefecture.completerProfil': { fr: 'Compléter mon profil', en: 'Complete my profile' },
  'prefecture.indisponible': {
    fr: "L'annuaire de l'administration ne répond pas pour le moment.",
    en: 'The government directory is not responding at the moment.'
  },

  // Fenêtre « Donner mon avis »
  'avis.label': { fr: 'DONNER MON AVIS', en: 'LEAVE A REVIEW' },
  'avis.titre': { fr: "Comment s'est passé votre suivi ?", en: 'How did it go?' },
  'avis.note': { fr: 'Votre note', en: 'Your rating' },
  'avis.etoile.1': { fr: '1 étoile', en: '1 star' },
  'avis.etoile.n': { fr: '{n} étoiles', en: '{n} stars' },
  'avis.libelle.1': { fr: 'Décevant', en: 'Disappointing' },
  'avis.libelle.2': { fr: 'Moyen', en: 'Average' },
  'avis.libelle.3': { fr: 'Bien', en: 'Good' },
  'avis.libelle.4': { fr: 'Très bien', en: 'Very good' },
  'avis.libelle.5': { fr: 'Excellent', en: 'Excellent' },
  'avis.commentaire': { fr: 'Votre commentaire', en: 'Your comment' },
  'avis.placeholder': {
    fr: 'Ce qui vous a aidé, ce qui pourrait être amélioré…',
    en: 'What helped you, what could be improved…'
  },
  'avis.affichage': {
    fr: "Votre prénom et l'initiale de votre nom seront affichés sur la page d'accueil.",
    en: 'Your first name and the initial of your last name will be shown on the home page.'
  },
  'avis.envoi': { fr: 'Envoi…', en: 'Sending…' },
  'avis.publier': { fr: 'Publier mon avis', en: 'Publish my review' },
  'avis.erreur.note': { fr: 'Choisissez une note de 1 à 5 étoiles.', en: 'Choose a rating from 1 to 5 stars.' },
  'avis.erreur.commentaire': {
    fr: 'Votre commentaire doit contenir entre 10 et 1000 caractères.',
    en: 'Your comment must be between 10 and 1,000 characters long.'
  },
  'avis.erreur.enregistrer': { fr: "Impossible d'enregistrer votre avis.", en: 'Unable to save your review.' },

  // Avis publics (accueil)
  'avisPublics.label': { fr: 'AVIS DES ÉTUDIANTS', en: 'STUDENT REVIEWS' },
  'avisPublics.titre': { fr: 'Ils ont été', en: 'They were' },
  'avisPublics.titre.fin': { fr: 'accompagnés', en: 'supported' },
  'avisPublics.moyenne': { fr: 'Note moyenne', en: 'Average rating' },
  'avisPublics.moyenne.suite': {
    fr: 'sur les derniers avis laissés après une démarche terminée.',
    en: 'from the latest reviews left after completing a procedure.'
  },
  'avisPublics.surCinq': { fr: '{n} sur 5', en: '{n} out of 5' }
} satisfies Traductions;
