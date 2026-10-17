import { Traductions } from './type';

/** Paramètres du compte (/dashboard/account). */
export const COMPTE = {
  'compte.label': { fr: 'ESPACE PERSONNEL', en: 'PERSONAL SPACE' },
  'compte.titre': { fr: 'Mon compte', en: 'My account' },
  'compte.intro': {
    fr: 'Gérez les informations de votre compte et vos paramètres de sécurité.',
    en: 'Manage your account information and security settings.'
  },
  'compte.infos.titre': { fr: 'Informations du compte', en: 'Account information' },
  'compte.infos.texte': {
    fr: 'Consultez et modifiez les informations associées à votre compte.',
    en: 'View and edit the information linked to your account.'
  },
  'compte.modifierInfos': { fr: 'Modifier mes informations', en: 'Edit my information' },
  'compte.prenom.placeholder': { fr: 'Entrez votre prénom', en: 'Enter your first name' },
  'compte.prenom.obligatoire': { fr: 'Le prénom est obligatoire.', en: 'First name is required.' },
  'compte.prenom.court': { fr: 'Le prénom doit contenir au moins 2 caractères.', en: 'First name must be at least 2 characters long.' },
  'compte.nom.placeholder': { fr: 'Entrez votre nom', en: 'Enter your last name' },
  'compte.nom.obligatoire': { fr: 'Le nom est obligatoire.', en: 'Last name is required.' },
  'compte.nom.court': { fr: 'Le nom doit contenir au moins 2 caractères.', en: 'Last name must be at least 2 characters long.' },
  'compte.email.placeholder': { fr: 'Entrez votre adresse e-mail', en: 'Enter your email address' },
  'compte.email.obligatoire': { fr: "L'adresse e-mail est obligatoire.", en: 'Email address is required.' },
  'compte.email.invalide': { fr: 'Veuillez saisir une adresse e-mail valide.', en: 'Please enter a valid email address.' },
  'compte.modification': { fr: 'Modification...', en: 'Saving...' },
  'compte.enregistrer': { fr: 'Enregistrer les modifications', en: 'Save changes' },

  'compte.mdp.titre': { fr: 'Mot de passe', en: 'Password' },
  'compte.mdp.texte': {
    fr: 'Modifiez régulièrement votre mot de passe pour sécuriser votre compte.',
    en: 'Change your password regularly to keep your account secure.'
  },
  'compte.mdp.actuel': { fr: 'Mot de passe actuel', en: 'Current password' },
  'compte.mdp.actuel.placeholder': { fr: 'Entrez votre mot de passe actuel', en: 'Enter your current password' },
  'compte.mdp.actuel.obligatoire': { fr: 'Le mot de passe actuel est obligatoire.', en: 'Your current password is required.' },
  'compte.mdp.nouveau': { fr: 'Nouveau mot de passe', en: 'New password' },
  'compte.mdp.nouveau.placeholder': { fr: 'Entrez votre nouveau mot de passe', en: 'Enter your new password' },
  'compte.mdp.regles': { fr: 'Le mot de passe doit respecter les règles suivantes :', en: 'The password must meet the following rules:' },
  'compte.mdp.nonConforme': {
    fr: 'Le mot de passe ne respecte pas toutes les règles de sécurité.',
    en: 'The password does not meet all the security rules.'
  },
  'compte.mdp.confirmer': { fr: 'Confirmer le nouveau mot de passe', en: 'Confirm the new password' },
  'compte.mdp.confirmer.placeholder': { fr: 'Confirmez votre nouveau mot de passe', en: 'Confirm your new password' },
  'compte.mdp.differents': { fr: 'Les deux mots de passe ne correspondent pas.', en: 'The two passwords do not match.' },
  'compte.mdp.oublie': { fr: 'Mot de passe actuel oublié ?', en: 'Forgot your current password?' },
  'compte.mdp.oublie.texte': { fr: 'Recevez un lien de réinitialisation par e-mail.', en: 'Get a reset link by email.' },
  'compte.mdp.modifier': { fr: 'Modifier le mot de passe', en: 'Change password' },

  'compte.donnees.titre': { fr: 'Mes données personnelles', en: 'My personal data' },
  'compte.donnees.texte': {
    fr: 'Téléchargez une copie de toutes les informations que MyStudentGuide conserve sur vous (fichier JSON).',
    en: 'Download a copy of all the information MyStudentGuide keeps about you (JSON file).'
  },
  'compte.donnees.politique': { fr: 'Politique de confidentialité', en: 'Privacy policy' },
  'compte.donnees.telecharger': { fr: 'Télécharger mes données', en: 'Download my data' },
  'compte.donnees.preparation': { fr: 'Préparation…', en: 'Preparing…' },
  'compte.donnees.erreur': {
    fr: 'Le téléchargement de vos données a échoué. Réessayez dans un instant.',
    en: 'Downloading your data failed. Please try again in a moment.'
  },

  'compte.suppr.titre': { fr: 'Supprimer mon compte', en: 'Delete my account' },
  'compte.suppr.texte': {
    fr: "La suppression est immédiate et définitive : votre compte et toutes vos données sont effacés. L'équipe en est informée.",
    en: 'Deletion is immediate and permanent: your account and all your data are erased. The team is notified.'
  },
  'compte.suppr.attention': { fr: 'Attention', en: 'Warning' },
  'compte.suppr.avertissement': {
    fr: 'Avant de supprimer votre compte, assurez-vous de ne plus avoir besoin des informations et du suivi associés à votre compte MyStudentGuide.',
    en: 'Before deleting your account, make sure you no longer need the information and tracking linked to your MyStudentGuide account.'
  },
  'compte.suppr.info': {
    fr: 'Pour envoyer votre demande de suppression, veuillez indiquer le motif de votre demande et confirmer votre identité.',
    en: 'To send your deletion request, please give the reason for your request and confirm your identity.'
  },
  'compte.suppr.motif': { fr: 'Pourquoi souhaitez-vous supprimer votre compte ?', en: 'Why do you want to delete your account?' },
  'compte.suppr.motif.choisir': { fr: 'Sélectionnez un motif', en: 'Select a reason' },
  'compte.suppr.motif.plusUtilise': { fr: "Je n'utilise plus l'application", en: 'I no longer use the app' },
  'compte.suppr.motif.termine': { fr: "J'ai terminé mes démarches", en: 'I have completed my procedures' },
  'compte.suppr.motif.probleme': { fr: "Je rencontre un problème avec l'application", en: 'I am having a problem with the app' },
  'compte.suppr.motif.autreCompte': { fr: 'Je souhaite utiliser un autre compte', en: 'I want to use another account' },
  'compte.suppr.motif.autre': { fr: 'Autre', en: 'Other' },
  'compte.suppr.motif.obligatoire': { fr: 'Veuillez sélectionner un motif.', en: 'Please select a reason.' },
  'compte.suppr.precision': { fr: 'Précision supplémentaire', en: 'Additional details' },
  'compte.suppr.facultatif': { fr: 'Facultatif', en: 'Optional' },
  'compte.suppr.precision.placeholder': {
    fr: 'Vous pouvez préciser la raison de votre demande...',
    en: 'You can explain the reason for your request...'
  },
  'compte.suppr.confirmation': {
    fr: 'Je confirme avoir pris connaissance des conséquences liées à la suppression de mon compte.',
    en: 'I confirm that I understand the consequences of deleting my account.'
  },
  'compte.suppr.confirmation.aide': { fr: 'Cette confirmation est facultative.', en: 'This confirmation is optional.' },
  'compte.suppr.code': { fr: 'Code de confirmation', en: 'Confirmation code' },
  'compte.suppr.code.placeholder': { fr: 'Entrez votre mot de passe', en: 'Enter your password' },
  'compte.suppr.code.aide': {
    fr: 'Saisissez votre mot de passe afin de confirmer votre identité.',
    en: 'Enter your password to confirm your identity.'
  },
  'compte.suppr.code.obligatoire': {
    fr: 'Votre mot de passe est obligatoire pour confirmer la suppression.',
    en: 'Your password is required to confirm the deletion.'
  },
  'compte.suppr.envoi': { fr: 'Envoi de la demande...', en: 'Sending the request...' },
  'compte.suppr.definitif': { fr: 'Supprimer définitivement mon compte', en: 'Permanently delete my account' },

  'compte.sessionExpiree': { fr: 'Votre session a expiré. Veuillez vous reconnecter.', en: 'Your session has expired. Please log in again.' },
  'compte.erreur.chargement': {
    fr: 'Impossible de récupérer les informations de votre compte.',
    en: 'Unable to load your account information.'
  },
  'compte.infosModifiees': { fr: 'Vos informations ont été modifiées avec succès.', en: 'Your information has been updated.' },
  'compte.infosModifiees.emailAConfirmer': {
    fr: 'Vos informations ont été modifiées. Un lien de confirmation a été envoyé à {email} : ouvrez-le pour recevoir vos rappels par e-mail.',
    en: 'Your information has been updated. A confirmation link was sent to {email}: open it to receive your reminders by email.'
  },
  'compte.erreur.modification': {
    fr: 'Impossible de modifier les informations de votre compte.',
    en: 'Unable to update your account information.'
  },
  'compte.mdp.erreur.regles': {
    fr: 'Veuillez respecter toutes les règles de sécurité du mot de passe.',
    en: 'Please meet all the password security rules.'
  },
  'compte.mdp.erreur.differents': {
    fr: 'Les deux nouveaux mots de passe ne correspondent pas.',
    en: 'The two new passwords do not match.'
  },
  'compte.mdp.modifie': { fr: 'Votre mot de passe a été modifié avec succès.', en: 'Your password has been changed.' },
  'compte.mdp.erreur': { fr: 'Impossible de modifier le mot de passe.', en: 'Unable to change the password.' },
  'compte.suppr.erreur.champs': {
    fr: 'Veuillez compléter les informations obligatoires.',
    en: 'Please fill in the required information.'
  },
  'compte.suppr.ok': { fr: 'Votre compte a été supprimé avec succès.', en: 'Your account has been deleted.' },
  'compte.suppr.erreur': {
    fr: 'Une erreur est survenue lors de la suppression de votre compte.',
    en: 'Something went wrong while deleting your account.'
  }
} satisfies Traductions;
