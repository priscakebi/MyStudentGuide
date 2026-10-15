import { Traductions } from './type';

/** Connexion, inscription, mot de passe oublié et nouveau mot de passe (+ règles des champs). */
export const AUTH = {
  // Règles des champs (utils/form-rules.ts)
  'form.email': { fr: 'Adresse e-mail', en: 'Email address' },
  'form.email.placeholder': { fr: 'nom@domaine.fr', en: 'name@domain.com' },
  'form.email.message': {
    fr: 'Saisissez une adresse e-mail valide (ex. : nom@domaine.fr).',
    en: 'Enter a valid email address (e.g. name@domain.com).'
  },
  'form.nom.message': {
    fr: 'Entre 2 et 50 lettres (espaces, tirets et apostrophes autorisés).',
    en: 'Between 2 and 50 letters (spaces, hyphens and apostrophes allowed).'
  },
  'form.motDePasse': { fr: 'Mot de passe', en: 'Password' },
  'form.motDePasse.message': {
    fr: 'Le mot de passe doit contenir entre 12 et 72 caractères, dont une majuscule, une minuscule, un chiffre et un caractère spécial.',
    en: 'The password must be 12 to 72 characters long and include an uppercase letter, a lowercase letter, a number and a special character.'
  },
  'form.motDePasse.12min': { fr: '12 caractères minimum', en: 'At least 12 characters' },
  'form.motDePasse.majuscule': { fr: 'Une lettre majuscule', en: 'An uppercase letter' },
  'form.motDePasse.minuscule': { fr: 'Une lettre minuscule', en: 'A lowercase letter' },
  'form.motDePasse.chiffre': { fr: 'Un chiffre', en: 'A number' },
  'form.motDePasse.special': { fr: 'Un caractère spécial (! @ # ? …)', en: 'A special character (! @ # ? …)' },
  'form.motDePasse.afficher': { fr: 'Afficher le mot de passe', en: 'Show password' },
  'form.motDePasse.masquer': { fr: 'Masquer le mot de passe', en: 'Hide password' },
  'form.motDePasse.confirmer': { fr: 'Confirmer le mot de passe', en: 'Confirm password' },
  'form.motDePasse.differents': { fr: 'Les mots de passe ne correspondent pas.', en: 'The passwords do not match.' },
  'form.champsVides': { fr: 'Veuillez remplir tous les champs.', en: 'Please fill in all the fields.' },
  'form.corriger': { fr: 'Veuillez corriger les champs signalés.', en: 'Please correct the highlighted fields.' },
  'form.serveurInjoignable': {
    fr: 'Impossible de joindre le serveur. Réessayez plus tard.',
    en: 'Unable to reach the server. Please try again later.'
  },
  'form.erreur': { fr: 'Une erreur est survenue. Veuillez réessayer.', en: 'Something went wrong. Please try again.' },

  // Panneau de marque des pages de connexion et d'inscription
  'authBrand.titre': { fr: 'Vos démarches en France, enfin simples.', en: 'Your paperwork in France, made simple.' },
  'authBrand.texte': {
    fr: 'Titre de séjour, santé, logement, banque : toutes les étapes et les documents au même endroit.',
    en: 'Residence permit, health, housing, banking: every step and document in one place.'
  },
  'authBrand.point1': { fr: 'Démarches expliquées étape par étape', en: 'Procedures explained step by step' },
  'authBrand.point2': { fr: 'Rappels avant les dates limites', en: 'Reminders before deadlines' },
  'authBrand.point3': { fr: 'Liens officiels vérifiés', en: 'Verified official links' },
  'authBrand.pied': { fr: 'Gratuit · Pour les étudiants internationaux en France', en: 'Free · For international students in France' },
  'authBrand.retour': { fr: "← Retour à l'accueil", en: '← Back to home' },

  // Connexion
  'login.eyebrow': { fr: 'Espace étudiant', en: 'Student space' },
  'login.titre': { fr: 'Connexion', en: 'Log in' },
  'login.description': { fr: 'Connectez-vous à votre espace étudiant', en: 'Log in to your student space' },
  'login.motDePasse.placeholder': { fr: 'Votre mot de passe', en: 'Your password' },
  'login.oublie': { fr: 'Mot de passe oublié ?', en: 'Forgot your password?' },
  'login.connexion': { fr: 'Connexion...', en: 'Logging in...' },
  'login.pasDeCompte': { fr: "Vous n'avez pas encore de compte ?", en: "Don't have an account yet?" },
  'login.inscrire': { fr: "S'inscrire", en: 'Sign up' },
  'login.admin': { fr: 'Espace administrateur', en: 'Administrator area' },
  'login.inactivite': {
    fr: "Vous avez été déconnecté après une période d'inactivité. Veuillez vous reconnecter.",
    en: 'You were logged out after a period of inactivity. Please log in again.'
  },
  'login.sessionExpiree': {
    fr: 'Votre session a expiré. Veuillez vous reconnecter.',
    en: 'Your session has expired. Please log in again.'
  },
  'login.compteRefuse': { fr: 'Ce compte ne peut pas se connecter ici.', en: 'This account cannot log in here.' },
  'login.tropDeTentatives': {
    fr: 'Trop de tentatives de connexion. Réessayez dans quelques minutes.',
    en: 'Too many login attempts. Please try again in a few minutes.'
  },
  'login.incorrect': { fr: 'Adresse e-mail ou mot de passe incorrect.', en: 'Incorrect email address or password.' },

  // Inscription
  'register.eyebrow': { fr: 'Inscription gratuite', en: 'Free sign-up' },
  'register.titre': { fr: 'Créer un compte', en: 'Create an account' },
  'register.description': {
    fr: 'Inscrivez-vous pour commencer votre expérience avec MyStudentGuide.',
    en: 'Sign up to start using MyStudentGuide.'
  },
  'register.prenom': { fr: 'Prénom', en: 'First name' },
  'register.nom': { fr: 'Nom', en: 'Last name' },
  'register.motDePasse.placeholder': { fr: '12 caractères minimum', en: 'At least 12 characters' },
  'register.confirmer.placeholder': { fr: 'Confirmer votre mot de passe', en: 'Confirm your password' },
  'register.creation': { fr: 'Création en cours...', en: 'Creating your account...' },
  'register.creer': { fr: 'Créer mon compte', en: 'Create my account' },
  'register.dejaCompte': { fr: 'Vous avez déjà un compte ?', en: 'Already have an account?' },
  'register.erreur': { fr: "Une erreur est survenue lors de l'inscription.", en: 'Something went wrong during sign-up.' },
  'register.erreur.refus': {
    fr: 'Inscription refusée. Vérifiez vos informations : cette adresse e-mail est peut-être déjà utilisée.',
    en: 'Sign-up refused. Check your details: this email address may already be in use.'
  },

  // Mot de passe oublié
  'forgot.eyebrow': { fr: 'Espace étudiant', en: 'Student space' },
  'forgot.eyebrow.admin': { fr: 'Espace administrateur', en: 'Administrator area' },
  'forgot.titre': { fr: 'Mot de passe oublié', en: 'Forgot password' },
  'forgot.titre.admin': { fr: 'Mot de passe administrateur oublié', en: 'Forgot administrator password' },
  'forgot.description': {
    fr: "Saisissez l'adresse e-mail de votre compte. Nous vous enverrons un lien pour choisir un nouveau mot de passe.",
    en: "Enter your account's email address. We will send you a link to choose a new password."
  },
  'forgot.description.admin': {
    fr: "Saisissez l'adresse e-mail de votre compte administrateur. Nous vous enverrons un lien pour choisir un nouveau mot de passe.",
    en: "Enter your administrator account's email address. We will send you a link to choose a new password."
  },
  'forgot.placeholder': { fr: 'vous@exemple.com', en: 'you@example.com' },
  'forgot.envoi': { fr: 'Envoi en cours...', en: 'Sending...' },
  'forgot.envoyer': { fr: 'Envoyer le lien', en: 'Send the link' },
  'forgot.verifiez': { fr: 'Vérifiez votre boîte mail.', en: 'Check your inbox.' },
  'forgot.envoye': {
    fr: "Si un compte correspond à cette adresse, un e-mail contenant un lien de réinitialisation vient d'être envoyé. Le lien est valable 30 minutes et ne peut être utilisé qu'une seule fois.",
    en: 'If an account matches this address, an email with a reset link has just been sent. The link is valid for 30 minutes and can only be used once.'
  },
  'forgot.indesirables': { fr: 'Pensez à regarder dans vos courriers indésirables.', en: 'Remember to check your spam folder.' },
  'forgot.renvoyer': { fr: "Je n'ai rien reçu : renvoyer", en: "I didn't receive anything: resend" },
  'forgot.retour': { fr: 'Retour à la connexion', en: 'Back to login' },
  'forgot.emailVide': { fr: 'Veuillez saisir votre adresse e-mail.', en: 'Please enter your email address.' },
  'forgot.emailInvalide': { fr: "L'adresse e-mail n'est pas valide.", en: 'The email address is not valid.' },

  // Nouveau mot de passe
  'reset.titre': { fr: 'Nouveau mot de passe', en: 'New password' },
  'reset.modifie': { fr: 'Mot de passe modifié.', en: 'Password changed.' },
  'reset.modifie.texte': {
    fr: 'Vous pouvez maintenant vous connecter avec votre nouveau mot de passe. Un e-mail de confirmation vous a été envoyé.',
    en: 'You can now log in with your new password. A confirmation email has been sent to you.'
  },
  'reset.lienIncomplet': {
    fr: 'Ce lien est incomplet. Utilisez le lien reçu par e-mail ou refaites une demande.',
    en: 'This link is incomplete. Use the link you received by email or make a new request.'
  },
  'reset.refaire': { fr: 'Refaire une demande', en: 'Make a new request' },
  'reset.description': {
    fr: 'Choisissez un nouveau mot de passe pour votre compte.',
    en: 'Choose a new password for your account.'
  },
  'reset.description.admin': {
    fr: 'Choisissez un nouveau mot de passe pour votre compte administrateur.',
    en: 'Choose a new password for your administrator account.'
  },
  'reset.nouveau': { fr: 'Nouveau mot de passe', en: 'New password' },
  'reset.repetez': { fr: 'Répétez le mot de passe', en: 'Repeat the password' },
  'reset.enregistrement': { fr: 'Enregistrement...', en: 'Saving...' },
  'reset.enregistrer': { fr: 'Enregistrer le mot de passe', en: 'Save the password' },
  'reset.lienInvalide': { fr: 'Ce lien est invalide ou a expiré.', en: 'This link is invalid or has expired.' }
} satisfies Traductions;
