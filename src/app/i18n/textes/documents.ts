import { Traductions } from './type';

/** Page des documents requis (/documents). */
export const DOCUMENTS = {
  'documents.titre': { fr: 'Mes documents', en: 'Documents' },
  'documents.intro': {
    fr: 'Consultez les documents nécessaires pour effectuer vos différentes démarches administratives.',
    en: 'See the documents you need for your administrative procedures.'
  },
  'documents.info.titre': { fr: 'Les documents à préparer', en: 'Documents to prepare' },
  'documents.info.1': {
    fr: 'Cette page vous indique les documents nécessaires pour chaque démarche administrative.',
    en: 'This page lists the documents needed for each administrative procedure.'
  },
  'documents.info.2': {
    fr: "Vous pouvez ainsi savoir à l'avance quelles pièces préparer avant de commencer une démarche.",
    en: 'That way you know in advance which documents to prepare before starting a procedure.'
  },
  'documents.info.3': {
    fr: "Aucun document personnel n'est envoyé ou enregistré sur MyStudentGuide.",
    en: 'No personal documents are uploaded or stored on MyStudentGuide.'
  },
  'documents.chargement': { fr: 'Chargement des documents...', en: 'Loading documents...' },
  'documents.vide.titre': { fr: 'Aucun document requis', en: 'No required documents' },
  'documents.vide.texte': {
    fr: "Aucun document requis n'est actuellement disponible pour les démarches proposées.",
    en: 'No required documents are currently listed for the available procedures.'
  },
  'documents.compte.1': { fr: '1 document requis', en: '1 required document' },
  'documents.compte.n': { fr: '{n} documents requis', en: '{n} required documents' },
  'documents.requis': { fr: 'Requis', en: 'Required' },
  'documents.erreur.documents': {
    fr: 'Impossible de récupérer les documents requis.',
    en: 'Unable to load the required documents.'
  },
  'documents.erreur.demarches': { fr: 'Impossible de récupérer les démarches.', en: 'Unable to load the procedures.' }
} satisfies Traductions;
