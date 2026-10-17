import { Traductions } from './type';

/** Détail d'une démarche (/demarches/:id). */
export const DEMARCHE_DETAIL = {
  'detail.retour': { fr: 'Retour aux démarches', en: 'Back to procedures' },
  'detail.chargement.titre': { fr: 'Chargement de la démarche...', en: 'Loading the procedure...' },
  'detail.chargement.texte': {
    fr: 'Nous récupérons les informations de cette démarche.',
    en: 'We are fetching the information for this procedure.'
  },
  'detail.erreur.titre': { fr: 'Impossible de charger la démarche', en: 'Unable to load the procedure' },
  'detail.erreur.texte': {
    fr: 'Impossible de charger les informations de cette démarche.',
    en: 'Unable to load the information for this procedure.'
  },
  'detail.erreur.identifiant': { fr: 'Identifiant de la démarche introuvable.', en: 'Procedure ID not found.' },
  'detail.contenuFrancais': {
    fr: '',
    en: 'This procedure has not been translated into English yet: its content is shown in French.'
  },
  'detail.source': { fr: 'Source :', en: 'Source:' },
  'detail.source.dila': {
    fr: "(Direction de l'information légale et administrative)",
    en: '(French Directorate of Legal and Administrative Information)'
  },
  'detail.source.maj': { fr: '· mise à jour le {date}', en: '· updated on {date}' },
  'detail.dateCreation': { fr: 'Date de création', en: 'Created on' },
  'detail.dateLimite': { fr: 'Date limite', en: 'Deadline' },
  'detail.dateLimite.personnelle': { fr: 'Votre date limite', en: 'Your deadline' },
  'detail.dateLimite.completerProfil': {
    fr: 'Indiquez vos dates dans votre profil pour connaître votre date limite →',
    en: 'Add your dates to your profile to see your deadline →'
  },
  'detail.dateLimite.commencer': {
    fr: 'Commencez la démarche et indiquez vos dates dans votre profil pour connaître votre date limite →',
    en: 'Start the procedure and add your dates to your profile to see your deadline →'
  },
  'detail.regle.ARRIVEE_EN_FRANCE.apres': { fr: '{n} jours après votre arrivée en France', en: '{n} days after your arrival in France' },
  'detail.regle.ARRIVEE_EN_FRANCE.avant': { fr: '{n} jours avant votre arrivée en France', en: '{n} days before your arrival in France' },
  'detail.regle.FIN_TITRE_SEJOUR.avant': {
    fr: '{n} jours avant la fin de votre visa ou titre de séjour',
    en: '{n} days before your visa or residence permit expires'
  },
  'detail.regle.FIN_TITRE_SEJOUR.apres': {
    fr: '{n} jours après la fin de votre visa ou titre de séjour',
    en: '{n} days after your visa or residence permit expires'
  },
  'detail.agenda': { fr: 'Ajouter à mon agenda', en: 'Add to my calendar' },
  'detail.imprimer': { fr: 'Imprimer / PDF', en: 'Print / PDF' },
  'detail.imprime': {
    fr: 'Fiche imprimée depuis MyStudentGuide le {date}. Vérifiez les informations sur les sites officiels avant vos démarches.',
    en: 'Printed from MyStudentGuide on {date}. Check the information on the official websites before you start.'
  },
  'detail.agenda.aide': {
    fr: 'Télécharge un fichier .ics avec un rappel une semaine avant et la veille',
    en: 'Downloads an .ics file with a reminder one week before and the day before'
  },
  'detail.etapes': { fr: 'Étapes', en: 'Steps' },
  'detail.documentsRequis': { fr: 'Documents requis', en: 'Required documents' },
  'detail.terminee': { fr: '✓ Démarche terminée', en: '✓ Procedure completed' },
  'detail.commencee': { fr: '✓ Démarche commencée', en: '✓ Procedure started' },
  'detail.voirSuivi': { fr: 'Voir mon suivi', en: 'See my tracking' },
  'detail.commencer': { fr: 'Commencer cette démarche', en: 'Start this procedure' },
  'detail.connexionPourCommencer': { fr: 'Connectez-vous pour commencer', en: 'Log in to get started' },
  'detail.ajoutee': {
    fr: 'Démarche ajoutée à « Mes démarches ». Suivez votre progression depuis votre espace.',
    en: 'Procedure added to “My procedures”. Track your progress from your space.'
  },

  'detail.etapes.titre': { fr: 'Les étapes de la démarche', en: 'Steps of the procedure' },
  'detail.etapes.texte': {
    fr: 'Suivez ces différentes étapes pour effectuer votre démarche.',
    en: 'Follow these steps to complete your procedure.'
  },
  'detail.etapes.vide': {
    fr: 'Les étapes de cette démarche seront bientôt disponibles.',
    en: 'The steps for this procedure will be available soon.'
  },

  'detail.documents.cocher': {
    fr: 'Cochez les documents au fur et à mesure que vous les rassemblez : votre liste est enregistrée dans votre espace.',
    en: 'Tick the documents as you gather them: your list is saved in your space.'
  },
  'detail.documents.texte': {
    fr: 'Voici les documents nécessaires pour effectuer cette démarche.',
    en: 'Here are the documents you need for this procedure.'
  },
  'detail.documents.complet': {
    fr: '✓ Dossier complet : tous vos documents sont prêts',
    en: '✓ File complete: all your documents are ready'
  },
  'detail.documents.prets': { fr: '{n} / {total} documents prêts', en: '{n} / {total} documents ready' },
  'detail.documents.pretsLabel': { fr: 'Documents prêts', en: 'Documents ready' },
  'detail.documents.astuce': {
    fr: "💡 Commencez la démarche pour cocher les documents que vous avez déjà et voir ce qu'il vous manque.",
    en: '💡 Start the procedure to tick the documents you already have and see what is missing.'
  },
  'detail.documents.erreurCase': {
    fr: "La case n'a pas pu être enregistrée. Réessayez.",
    en: 'The checkbox could not be saved. Please try again.'
  },
  'detail.documents.vide': {
    fr: "Aucun document requis n'est actuellement renseigné pour cette démarche.",
    en: 'No required documents are listed for this procedure yet.'
  },
  'detail.documents.voirListe': { fr: 'Voir la liste des documents', en: 'See the list of documents' },

  'detail.liens.titre': { fr: 'Sites officiels', en: 'Official websites' },
  'detail.liens.texte': {
    fr: 'Consultez les sources officielles liées à cette démarche.',
    en: 'See the official sources for this procedure.'
  },
  'detail.liens.acceder': { fr: 'Accéder au site officiel', en: 'Go to the official website' },
  'detail.liens.vide': {
    fr: "Aucun lien officiel n'est actuellement renseigné pour cette démarche.",
    en: 'No official links are listed for this procedure yet.'
  },
  'detail.prefecture': { fr: 'Votre préfecture pour cette démarche', en: 'Your prefecture for this procedure' },

  'detail.signaler.question': {
    fr: "Une information est incorrecte ou n'est plus à jour ?",
    en: 'Is some information wrong or out of date?'
  },
  'detail.signaler.texte': {
    fr: "Prévenez-nous, l'équipe vérifiera la démarche.",
    en: 'Let us know and the team will check the procedure.'
  },
  'detail.signaler.bouton': { fr: '⚠️ Signaler une erreur', en: '⚠️ Report an error' },
  'detail.signaler.question.equipe': { fr: "Poser une question à l'équipe →", en: 'Ask the team a question →' },
  'detail.signaler.merci': {
    fr: '✓ Merci ! Votre signalement a été transmis. Vous serez prévenu dès que la démarche aura été vérifiée.',
    en: '✓ Thank you! Your report has been sent. You will be notified once the procedure has been checked.'
  },
  'detail.signaler.titre': { fr: 'Signaler une erreur', en: 'Report an error' },
  'detail.signaler.probleme': { fr: 'Quel est le problème ?', en: 'What is the problem?' },
  'detail.signaler.precisions': { fr: 'Précisions (facultatif)', en: 'Details (optional)' },
  'detail.signaler.placeholder': {
    fr: "Ex. : le montant de la taxe a changé, le lien ANEF ne s'ouvre plus…",
    en: 'E.g. the fee amount has changed, the ANEF link no longer opens…'
  },
  'detail.signaler.envoi': { fr: 'Envoi…', en: 'Sending…' },
  'detail.signaler.envoyer': { fr: 'Envoyer le signalement', en: 'Send the report' },
  'detail.signaler.erreur': { fr: "Le signalement n'a pas pu être envoyé.", en: 'The report could not be sent.' },
  'detail.motif.INFO_OBSOLETE': { fr: "L'information n'est plus à jour", en: 'The information is out of date' },
  'detail.motif.LIEN_CASSE': { fr: 'Un lien officiel ne fonctionne pas', en: 'An official link does not work' },
  'detail.motif.INFO_MANQUANTE': { fr: 'Il manque une étape ou un document', en: 'A step or a document is missing' },
  'detail.motif.ERREUR': { fr: 'Il y a une erreur dans le contenu', en: 'There is a mistake in the content' },
  'detail.motif.AUTRE': { fr: 'Autre', en: 'Other' }
} satisfies Traductions;
