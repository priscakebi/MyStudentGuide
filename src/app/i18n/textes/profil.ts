import { Traductions } from './type';

/** Mon profil (/dashboard/profile). */
export const PROFIL = {
  'profil.label': { fr: 'MON ESPACE', en: 'MY SPACE' },
  'profil.titre': { fr: 'Mon profil', en: 'My profile' },
  'profil.intro': {
    fr: 'Retrouvez et gérez les informations utilisées pour personnaliser votre parcours administratif.',
    en: 'View and manage the information used to personalise your administrative journey.'
  },
  'profil.chargement': { fr: 'Chargement de votre profil...', en: 'Loading your profile...' },
  'profil.form.label.modification': { fr: 'MODIFICATION', en: 'EDITING' },
  'profil.form.label.premiere': { fr: 'PREMIÈRE CONFIGURATION', en: 'FIRST-TIME SETUP' },
  'profil.form.titre.modifier': { fr: 'Modifier mon profil', en: 'Edit my profile' },
  'profil.form.titre.completer': { fr: 'Complétez votre profil', en: 'Complete your profile' },
  'profil.form.intro': {
    fr: 'Ces informations permettent à MyStudentGuide de mieux adapter votre parcours administratif.',
    en: 'This information helps MyStudentGuide tailor your administrative journey.'
  },

  'profil.section.perso': { fr: 'Informations personnelles', en: 'Personal information' },
  'profil.section.perso.texte': { fr: 'Quelques informations générales sur vous.', en: 'A few general details about you.' },
  'profil.nationalite': { fr: 'Nationalité', en: 'Nationality' },
  'profil.nationalite.placeholder': { fr: 'Ex. Ivoirienne', en: 'E.g. Ivorian' },
  'profil.nationalite.erreur': {
    fr: 'La nationalité doit contenir uniquement des lettres, espaces, apostrophes ou tirets.',
    en: 'The nationality may only contain letters, spaces, apostrophes or hyphens.'
  },
  'profil.telephone.label': { fr: 'Numéro de téléphone', en: 'Phone number' },
  'profil.telephone': { fr: 'Téléphone', en: 'Phone' },
  'profil.telephone.placeholder': { fr: 'Ex. 0612345678', en: 'E.g. 0612345678' },
  'profil.telephone.erreur': {
    fr: 'Le numéro doit contenir exactement 10 chiffres et commencer par 01 à 09.',
    en: 'The number must be a French number with exactly 10 digits, starting with 01 to 09.'
  },

  'profil.section.etudes': { fr: 'Mes études', en: 'My studies' },
  'profil.section.etudes.texte': {
    fr: "Informations concernant votre établissement et votre parcours d'études.",
    en: 'Information about your institution and your studies.'
  },
  'profil.niveau': { fr: "Niveau d'études", en: 'Level of study' },
  'profil.niveau.choisir': { fr: 'Sélectionnez votre niveau', en: 'Select your level' },
  'profil.niveau.BTS': { fr: 'BTS', en: 'BTS (2-year vocational degree)' },
  'profil.niveau.Licence': { fr: 'Licence', en: "Licence (bachelor's degree)" },
  'profil.niveau.Bachelor': { fr: 'Bachelor', en: 'Bachelor' },
  'profil.niveau.Master': { fr: 'Master', en: "Master's degree" },
  'profil.niveau.Doctorat': { fr: 'Doctorat', en: 'PhD' },
  'profil.niveau.Autre': { fr: 'Autre', en: 'Other' },
  'profil.universite': { fr: 'Université / établissement', en: 'University / institution' },
  'profil.universite.placeholder': { fr: 'Ex. Université Paris Cité', en: 'E.g. Université Paris Cité' },
  'profil.universite.erreur': {
    fr: "Le nom de l'établissement contient des caractères non autorisés.",
    en: 'The institution name contains characters that are not allowed.'
  },
  'profil.ville': { fr: "Ville d'études", en: 'City of study' },
  'profil.ville.placeholder': { fr: 'Ex. Paris', en: 'E.g. Paris' },
  'profil.ville.erreur': {
    fr: 'La ville doit contenir uniquement des lettres, espaces, apostrophes ou tirets.',
    en: 'The city may only contain letters, spaces, apostrophes or hyphens.'
  },

  'profil.section.situation': { fr: 'Situation administrative', en: 'Administrative status' },
  'profil.section.situation.texte': {
    fr: "Ces informations permettent d'adapter les démarches proposées.",
    en: 'This information is used to tailor the suggested procedures.'
  },
  'profil.visa': { fr: 'Type de visa / séjour', en: 'Visa / residence type' },
  'profil.visa.choisir': { fr: 'Sélectionnez votre situation', en: 'Select your situation' },
  'profil.visa.VLS_TS_ETUDIANT': { fr: 'VLS-TS étudiant', en: 'Student VLS-TS (long-stay visa)' },
  'profil.visa.TITRE_SEJOUR_ETUDIANT': { fr: 'Titre de séjour étudiant', en: 'Student residence permit' },
  'profil.visa.COURT_SEJOUR': { fr: 'Court séjour', en: 'Short stay' },
  'profil.visa.AUTRE': { fr: 'Autre', en: 'Other' },
  'profil.visa.NON_RENSEIGNE': { fr: 'Non renseigné', en: 'Not specified' },
  'profil.arrivee': { fr: 'Première arrivée en France', en: 'First arrival in France' },
  'profil.arrivee.oui': { fr: "Oui, c'est ma première arrivée", en: "Yes, it's my first arrival" },
  'profil.arrivee.texte': {
    fr: 'Cette information peut être utilisée pour adapter certaines démarches.',
    en: 'This information may be used to tailor some procedures.'
  },

  'profil.section.logement': { fr: 'Mon logement', en: 'My housing' },
  'profil.section.logement.texte': {
    fr: 'Indiquez votre situation de logement actuelle.',
    en: 'Tell us about your current housing situation.'
  },
  'profil.logement': { fr: 'Type de logement', en: 'Type of housing' },
  'profil.logement.choisir': { fr: 'Sélectionnez votre logement', en: 'Select your housing' },
  'profil.logement.CROUS': { fr: 'Résidence CROUS', en: 'CROUS residence' },
  'profil.logement.LOCATION_PRIVEE': { fr: 'Location privée', en: 'Private rental' },
  'profil.logement.HEBERGEMENT_CHEZ_UN_PROCHE': { fr: 'Hébergement chez un proche', en: 'Staying with a friend' },
  'profil.logement.HEBERGEMENT_FAMILLE': { fr: 'Hébergement chez un membre de ma famille', en: 'Staying with a family member' },
  'profil.logement.RESIDENCE_ETUDIANTE': { fr: 'Résidence étudiante privée', en: 'Private student residence' },
  'profil.logement.SANS_LOGEMENT': { fr: 'Je n’ai pas encore de logement', en: "I don't have housing yet" },
  'profil.logement.AUTRE': { fr: 'Autre', en: 'Other' },
  'profil.logement.NON_RENSEIGNE': { fr: 'Je préfère ne pas renseigner', en: 'I prefer not to say' },
  'profil.adresse': { fr: 'Adresse', en: 'Address' },
  'profil.adresse.placeholder': { fr: 'Ex. 10 rue de Paris, 75000 Paris', en: 'E.g. 10 rue de Paris, 75000 Paris' },
  'profil.adresse.erreur': {
    fr: "Veuillez saisir une adresse valide. Les lettres, chiffres, espaces, tirets et caractères d'adresse courants sont autorisés.",
    en: 'Please enter a valid address. Letters, numbers, spaces, hyphens and common address characters are allowed.'
  },

  'profil.enregistrement': { fr: 'Enregistrement...', en: 'Saving...' },
  'profil.enregistrer': { fr: 'Enregistrer les modifications', en: 'Save changes' },
  'profil.creer': { fr: 'Créer mon profil', en: 'Create my profile' },
  'profil.affichage.label': { fr: 'PROFIL ÉTUDIANT', en: 'STUDENT PROFILE' },
  'profil.affichage.texte': {
    fr: 'Les informations utilisées pour personnaliser votre parcours.',
    en: 'The information used to personalise your journey.'
  },
  'profil.nonRenseigne': { fr: 'Non renseigné', en: 'Not specified' },
  'profil.nonRenseignee': { fr: 'Non renseignée', en: 'Not specified' },
  'profil.vide.titre': { fr: "Votre profil n'est pas encore configuré", en: 'Your profile is not set up yet' },
  'profil.vide.texte': {
    fr: 'Complétez votre profil pour permettre à MyStudentGuide de personnaliser votre parcours administratif.',
    en: 'Complete your profile so MyStudentGuide can personalise your administrative journey.'
  },
  'profil.erreur.chargement': { fr: 'Impossible de charger votre profil.', en: 'Unable to load your profile.' },
  'profil.erreur.formulaire': {
    fr: 'Veuillez corriger les informations indiquées dans le formulaire.',
    en: 'Please correct the information highlighted in the form.'
  },
  'profil.cree': { fr: 'Votre profil a été créé avec succès.', en: 'Your profile has been created.' },
  'profil.erreur.creation': { fr: 'Impossible de créer votre profil.', en: 'Unable to create your profile.' },
  'profil.maj': { fr: 'Votre profil a été mis à jour avec succès.', en: 'Your profile has been updated.' },
  'profil.erreur.modification': { fr: 'Impossible de modifier votre profil.', en: 'Unable to update your profile.' }
} satisfies Traductions;
