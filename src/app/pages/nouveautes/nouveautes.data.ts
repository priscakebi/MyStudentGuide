// ============================================================
// NOUVEAUTÉS DU SITE (page /nouveautes)
// ============================================================
//
// À compléter à chaque nouveauté visible par les étudiants :
// ajouter l'entrée EN HAUT de la liste (la plus récente d'abord).
// Le badge « Nouveau » du menu de l'espace étudiant s'affiche
// tant que l'étudiant n'a pas ouvert la page depuis la dernière entrée.
//
// `titreEn` / `texteEn` : version anglaise (affichée avec le pipe `tc`).
// ============================================================

export interface Nouveaute {
  /** Date de mise en ligne (AAAA-MM-JJ). */
  date: string;
  type: 'nouveau' | 'amelioration';
  titre: string;
  titreEn: string;
  texte: string;
  texteEn: string;
  /** Page où découvrir la nouveauté (facultatif). */
  lien?: string;
}

export const NOUVEAUTES: Nouveaute[] = [
  {
    date: '2026-10-17',
    type: 'nouveau',
    titre: 'Conseils pratiques et astuce du jour',
    titreEn: 'Practical tips and tip of the day',
    texte: 'Des astuces de terrain sur la fiche des démarches, et chaque jour sur Mon espace une astuce '
      + 'tirée des démarches que vous suivez.',
    texteEn: 'Hands-on tips on procedure pages, and every day in My space a tip '
      + 'from the procedures you follow.',
    lien: '/dashboard'
  },
  {
    date: '2026-10-17',
    type: 'nouveau',
    titre: 'Imprimer une démarche ou l\'enregistrer en PDF',
    titreEn: 'Print a procedure or save it as a PDF',
    texte: 'Le bouton « Imprimer / PDF » de chaque fiche donne une page claire avec les étapes, '
      + 'votre checklist de documents et les liens officiels, à emporter en préfecture.',
    texteEn: 'The “Print / PDF” button on each procedure gives a clean page with the steps, '
      + 'your document checklist and the official links, to take to the prefecture.',
    lien: '/demarches'
  },
  {
    date: '2026-10-17',
    type: 'amelioration',
    titre: 'Tout marquer comme lu',
    titreEn: 'Mark all as read',
    texte: 'Un seul clic suffit pour marquer toutes vos notifications comme lues.',
    texteEn: 'One click is enough to mark all your notifications as read.',
    lien: '/dashboard/notifications'
  },
  {
    date: '2026-10-17',
    type: 'nouveau',
    titre: 'Rappels avant la fin de votre titre de séjour',
    titreEn: 'Reminders before your residence permit expires',
    texte: 'Avec la date de fin de votre titre de séjour dans votre profil, vous êtes prévenu 4 mois, 2 mois, '
      + '1 mois et 1 semaine avant, pour demander le renouvellement à temps.',
    texteEn: 'With your residence permit end date in your profile, you are notified 4 months, 2 months, '
      + '1 month and 1 week before, so you can request the renewal in time.',
    lien: '/dashboard/profile'
  },
  {
    date: '2026-10-17',
    type: 'nouveau',
    titre: '« Bien démarrer » sur Mon espace',
    titreEn: '“Getting started” in My space',
    texte: 'Quatre étapes pour que le site vous guide vraiment : confirmer votre e-mail, compléter votre profil, '
      + 'ajouter vos dates de séjour et commencer votre première démarche.',
    texteEn: 'Four steps so the site can really guide you: confirm your email, complete your profile, '
      + 'add your stay dates and start your first procedure.',
    lien: '/dashboard'
  },
  {
    date: '2026-10-17',
    type: 'amelioration',
    titre: 'La préfecture de votre domicile',
    titreEn: 'The prefecture where you live',
    texte: 'La carte « Ma préfecture » utilise maintenant l\'adresse de votre logement (c\'est elle qui gère votre '
      + 'titre de séjour), et à défaut votre ville d\'études.',
    texteEn: 'The “My prefecture” card now uses your home address (that prefecture handles your residence permit), '
      + 'or your city of study if no address is given.',
    lien: '/dashboard'
  },
  {
    date: '2026-10-17',
    type: 'nouveau',
    titre: 'Confirmation de votre adresse e-mail',
    titreEn: 'Email address confirmation',
    texte: 'Un lien de confirmation est envoyé à l\'inscription : une fois l\'adresse confirmée, vous recevez vos '
      + 'rappels de dates limites par e-mail.',
    texteEn: 'A confirmation link is sent when you sign up: once your address is confirmed, you receive your '
      + 'deadline reminders by email.'
  },
  {
    date: '2026-10-17',
    type: 'amelioration',
    titre: 'Profil plus simple à remplir',
    titreEn: 'An easier profile form',
    texte: 'Suggestions pendant la saisie pour la nationalité, l\'établissement, la ville et l\'adresse, '
      + 'et numéro de téléphone avec l\'indicatif de votre pays.',
    texteEn: 'Suggestions as you type for nationality, institution, city and address, '
      + 'and phone number with your country code.',
    lien: '/dashboard/profile'
  },
  {
    date: '2026-10-16',
    type: 'nouveau',
    titre: 'Vos propres dates limites',
    titreEn: 'Your own deadlines',
    texte: 'Avec votre date d\'arrivée ou la fin de votre titre de séjour, chaque démarche affiche la date limite '
      + 'qui vous concerne, et vous recevez un rappel avant.',
    texteEn: 'With your arrival date or the end of your residence permit, each procedure shows your own deadline, '
      + 'and you get a reminder beforehand.',
    lien: '/dashboard/profile'
  },
  {
    date: '2026-10-16',
    type: 'amelioration',
    titre: 'Démarches en anglais',
    titreEn: 'Procedures in English',
    texte: 'Les fiches des démarches sont progressivement traduites en anglais, et la recherche fonctionne dans les deux langues.',
    texteEn: 'Procedure pages are being translated into English, and search works in both languages.',
    lien: '/demarches'
  },
  {
    date: '2026-10-16',
    type: 'nouveau',
    titre: 'Téléchargez vos données',
    titreEn: 'Download your data',
    texte: 'Depuis « Mon compte », récupérez toutes vos données personnelles en un fichier.',
    texteEn: 'From “My account”, download all your personal data in one file.',
    lien: '/dashboard/account'
  },
  {
    date: '2026-10-15',
    type: 'nouveau',
    titre: 'Le site en anglais',
    titreEn: 'The site in English',
    texte: 'Toute l\'interface étudiante existe en anglais : choisissez FR ou EN en haut de la page.',
    texteEn: 'The whole student interface is available in English: pick FR or EN at the top of the page.'
  },
  {
    date: '2026-10-15',
    type: 'nouveau',
    titre: 'Besoin d\'aide ?',
    titreEn: 'Need help?',
    texte: 'Posez votre question à l\'équipe MyStudentGuide depuis votre espace et suivez la réponse.',
    texteEn: 'Ask the MyStudentGuide team a question from your space and follow the answer.',
    lien: '/dashboard/aide'
  },
  {
    date: '2026-10-15',
    type: 'nouveau',
    titre: 'Checklist des documents et rappels dans votre agenda',
    titreEn: 'Document checklist and calendar reminders',
    texte: 'Cochez les documents prêts sur chaque démarche et ajoutez vos dates limites à votre agenda (.ics).',
    texteEn: 'Tick off the documents you have for each procedure and add your deadlines to your calendar (.ics).',
    lien: '/demarches'
  }
];

/** Date de la nouveauté la plus récente (AAAA-MM-JJ). */
export const DERNIERE_NOUVEAUTE = NOUVEAUTES.reduce((max, n) => (n.date > max ? n.date : max), '');
