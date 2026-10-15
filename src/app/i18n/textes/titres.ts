import { Traductions } from './type';

/** Titres des onglets du navigateur (côté étudiant ; voir app.routes.ts). */
export const TITRES = {
  'titre.accueil': { fr: "Vos démarches d'étudiant en France", en: 'Your student paperwork in France' },
  'titre.demarches': { fr: 'Toutes les démarches', en: 'All procedures' },
  'titre.demarche': { fr: 'Démarche', en: 'Procedure' },
  'titre.documents': { fr: 'Documents requis', en: 'Required documents' },
  'titre.notifications': { fr: 'Notifications', en: 'Notifications' },
  'titre.connexion': { fr: 'Connexion', en: 'Log in' },
  'titre.inscription': { fr: 'Inscription', en: 'Sign up' },
  'titre.motDePasseOublie': { fr: 'Mot de passe oublié', en: 'Forgot password' },
  'titre.nouveauMotDePasse': { fr: 'Nouveau mot de passe', en: 'New password' },
  'titre.monEspace': { fr: 'Mon espace', en: 'My space' },
  'titre.monProfil': { fr: 'Mon profil', en: 'My profile' },
  'titre.mesDemarches': { fr: 'Mes démarches', en: 'My procedures' },
  'titre.mesNotifications': { fr: 'Mes notifications', en: 'My notifications' },
  'titre.monCompte': { fr: 'Mon compte', en: 'My account' },
  'titre.aide': { fr: "Besoin d'aide ?", en: 'Need help?' }
} satisfies Traductions;
