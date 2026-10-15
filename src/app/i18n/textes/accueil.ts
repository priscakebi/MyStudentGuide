import { Traductions } from './type';

/** Page d'accueil (/home). */
export const ACCUEIL = {
  'accueil.label': { fr: 'VOTRE GUIDE ADMINISTRATIF', en: 'YOUR PAPERWORK GUIDE' },
  'accueil.bonjour': { fr: 'Bonjour', en: 'Hello' },
  'accueil.bienvenue': { fr: 'Bienvenue sur', en: 'Welcome to' },
  'accueil.description': {
    fr: 'MyStudentGuide vous accompagne dans vos démarches administratives et votre installation en France,',
    en: 'MyStudentGuide helps you with your paperwork and settling in France,'
  },
  'accueil.description.fin': { fr: 'étape par étape.', en: 'step by step.' },
  'accueil.recherche.placeholder': { fr: 'CAF, carte Vitale, séjour…', en: 'CAF, Carte Vitale, residence permit…' },
  'accueil.recherche.label': { fr: 'Rechercher une démarche', en: 'Search for a procedure' },
  'accueil.recherche.bouton': { fr: 'Rechercher', en: 'Search' },
  'accueil.continuer': { fr: 'Continuer mon parcours', en: 'Continue my journey' },
  'accueil.admin.nom': { fr: 'Admin', en: 'Admin' },
  'accueil.admin.retour': { fr: "Retour à l'administration", en: 'Back to administration' },
  'accueil.voirDemarches': { fr: 'Voir les démarches', en: 'See the procedures' },
  'accueil.atout.gratuit': { fr: 'Gratuit', en: 'Free' },
  'accueil.atout.liens': { fr: 'Liens officiels', en: 'Official links' },
  'accueil.atout.suivi': { fr: 'Suivi étape par étape', en: 'Step-by-step tracking' },
  'accueil.illustration.alt': {
    fr: 'Trois étudiants internationaux devant la tour Eiffel',
    en: 'Three international students in front of the Eiffel Tower'
  },
  'accueil.badge.sejour': { fr: 'Titre de séjour', en: 'Residence permit' },
  'accueil.badge.sejour.etape': { fr: 'Étape suivante : préfecture', en: 'Next step: prefecture' },
  'accueil.badge.bienvenue': { fr: 'Bienvenue en France', en: 'Welcome to France' },
  'accueil.badge.guide': { fr: 'Votre guide pas à pas', en: 'Your step-by-step guide' },

  'accueil.themes.label': { fr: 'SUR QUOI SOMMES-NOUS LÀ POUR VOUS ?', en: 'WHAT CAN WE HELP YOU WITH?' },
  'accueil.themes.titre': { fr: 'Toutes vos démarches,', en: 'All your procedures,' },
  'accueil.themes.titre.fin': { fr: 'par thème', en: 'by topic' },
  'accueil.themes.texte': {
    fr: "Informez-vous et suivez vos démarches dans chaque domaine de votre vie d'étudiant en France.",
    en: 'Find out about and track your procedures in every area of student life in France.'
  },
  'accueil.themes.decouvrir': { fr: 'Découvrir', en: 'Explore' },

  'accueil.theme.sejour': { fr: 'Séjour & visa', en: 'Residence & visa' },
  'accueil.theme.sejour.1': { fr: 'Validation du VLS-TS', en: 'VLS-TS validation' },
  'accueil.theme.sejour.2': { fr: 'Titre de séjour', en: 'Residence permit' },
  'accueil.theme.sejour.3': { fr: 'Renouvellement', en: 'Renewal' },
  'accueil.theme.sante': { fr: 'Santé', en: 'Health' },
  'accueil.theme.sante.1': { fr: 'Sécurité sociale (Ameli)', en: 'Social security (Ameli)' },
  'accueil.theme.sante.2': { fr: 'Mutuelle', en: 'Top-up health insurance' },
  'accueil.theme.sante.3': { fr: 'Médecin traitant', en: 'GP (médecin traitant)' },
  'accueil.theme.logement': { fr: 'Logement', en: 'Housing' },
  'accueil.theme.logement.1': { fr: 'Logement CROUS', en: 'CROUS housing' },
  'accueil.theme.logement.2': { fr: 'Aide au logement (CAF)', en: 'Housing benefit (CAF)' },
  'accueil.theme.logement.3': { fr: 'Assurance habitation', en: 'Home insurance' },
  'accueil.theme.etudes': { fr: 'Études', en: 'Studies' },
  'accueil.theme.etudes.1': { fr: 'Inscription universitaire', en: 'University enrolment' },
  'accueil.theme.etudes.2': { fr: 'CVEC', en: 'CVEC (student life fee)' },
  'accueil.theme.etudes.3': { fr: 'Bourses', en: 'Grants' },
  'accueil.theme.banque': { fr: 'Banque & budget', en: 'Banking & budget' },
  'accueil.theme.banque.1': { fr: "Ouverture d'un compte", en: 'Opening an account' },
  'accueil.theme.banque.2': { fr: 'RIB', en: 'RIB (bank details)' },
  'accueil.theme.banque.3': { fr: 'Aides financières', en: 'Financial aid' },
  'accueil.theme.emploi': { fr: 'Emploi', en: 'Work' },
  'accueil.theme.emploi.1': { fr: 'Job étudiant', en: 'Student job' },
  'accueil.theme.emploi.2': { fr: 'Droit au travail', en: 'Right to work' },
  'accueil.theme.emploi.3': { fr: 'Stage', en: 'Internship' },
  'accueil.theme.transports': { fr: 'Transports', en: 'Transport' },
  'accueil.theme.transports.1': { fr: 'Abonnement étudiant', en: 'Student travel pass' },
  'accueil.theme.transports.2': { fr: 'Carte Avantage Jeune', en: 'Carte Avantage Jeune (rail card)' },
  'accueil.theme.transports.3': { fr: 'Vélo en libre-service', en: 'Bike sharing' },
  'accueil.theme.quotidien': { fr: 'Vie quotidienne', en: 'Everyday life' },
  'accueil.theme.quotidien.1': { fr: 'Forfait mobile', en: 'Mobile phone plan' },
  'accueil.theme.quotidien.2': { fr: 'Permis de conduire', en: 'Driving licence' },
  'accueil.theme.quotidien.3': { fr: "Déclaration d'impôts", en: 'Tax return' },

  'accueil.pourquoi.label': { fr: 'POURQUOI MYSTUDENTGUIDE ?', en: 'WHY MYSTUDENTGUIDE?' },
  'accueil.pourquoi.titre': { fr: 'Simplifiez votre installation', en: 'Make settling in' },
  'accueil.pourquoi.titre.fin': { fr: 'en France', en: 'France easier' },
  'accueil.pourquoi.texte': {
    fr: 'Toutes les informations essentielles pour vous aider à comprendre et réaliser vos démarches administratives.',
    en: 'All the key information to help you understand and complete your administrative procedures.'
  },
  'accueil.pourquoi.1.titre': { fr: 'Des démarches adaptées', en: 'Procedures that fit you' },
  'accueil.pourquoi.1.texte': {
    fr: 'Consultez toutes les démarches et recevez des suggestions adaptées à votre situation étudiante.',
    en: 'Browse all procedures and get suggestions tailored to your situation as a student.'
  },
  'accueil.pourquoi.2.titre': { fr: 'Un parcours guidé', en: 'A guided journey' },
  'accueil.pourquoi.2.texte': {
    fr: "Avancez étape par étape et visualisez facilement l'évolution de vos démarches.",
    en: 'Move forward step by step and easily see how your procedures are progressing.'
  },
  'accueil.pourquoi.3.titre': { fr: 'Des informations fiables', en: 'Reliable information' },
  'accueil.pourquoi.3.texte': {
    fr: 'Accédez aux informations nécessaires et aux liens officiels pour effectuer vos démarches.',
    en: 'Get the information you need and the official links to complete your procedures.'
  },

  'accueil.parcours.label': { fr: 'MON PARCOURS', en: 'MY JOURNEY' },
  'accueil.parcours.titre': { fr: 'Commencez votre parcours', en: 'Start your journey' },
  'accueil.parcours.texte': {
    fr: "Quelques informations sur votre situation nous permettent de vous proposer les démarches adaptées à votre parcours d'étudiant en France.",
    en: 'A few details about your situation let us suggest the procedures that fit your path as a student in France.'
  },
  'accueil.parcours.carte.label': { fr: 'VOTRE PARCOURS ÉTUDIANT', en: 'YOUR STUDENT JOURNEY' },
  'accueil.parcours.carte.titre': { fr: 'Un parcours adapté à votre situation', en: 'A journey tailored to your situation' },
  'accueil.parcours.carte.texte': {
    fr: 'Complétez votre profil pour que MyStudentGuide puisse identifier les démarches qui vous concernent et vous accompagner étape par étape.',
    en: 'Complete your profile so MyStudentGuide can identify the procedures that concern you and guide you step by step.'
  },
  'accueil.parcours.seConnecter': { fr: 'Se connecter pour commencer', en: 'Log in to get started' },
  'accueil.parcours.commencer': { fr: 'Commencer', en: 'Get started' },

  'accueil.etapes.label': { fr: 'COMMENT ÇA MARCHE ?', en: 'HOW DOES IT WORK?' },
  'accueil.etapes.titre': { fr: 'Un parcours simple en', en: 'A simple journey in' },
  'accueil.etapes.titre.fin': { fr: '3 étapes', en: '3 steps' },
  'accueil.etape.1.titre': { fr: 'Consultez vos démarches', en: 'Browse your procedures' },
  'accueil.etape.1.texte': {
    fr: 'Parcourez les démarches par thème : séjour, santé, logement, banque, études…',
    en: 'Browse procedures by topic: residence, health, housing, banking, studies…'
  },
  'accueil.etape.2.titre': { fr: 'Commencez une démarche', en: 'Start a procedure' },
  'accueil.etape.2.texte': {
    fr: 'Depuis votre espace démarches, cliquez sur « Commencer » pour passer la démarche en cours.',
    en: 'From your procedures page, click “Start” to mark the procedure as in progress.'
  },
  'accueil.etape.3.titre': { fr: 'Suivez votre progression', en: 'Track your progress' },
  'accueil.etape.3.texte': {
    fr: 'Consultez les informations, les étapes, les documents nécessaires et les liens officiels.',
    en: 'See the information, the steps, the required documents and the official links.'
  },

  'accueil.objectif.label': { fr: 'NOTRE OBJECTIF', en: 'OUR GOAL' },
  'accueil.objectif.titre': { fr: 'Vous aider à vous concentrer sur', en: 'Helping you focus on' },
  'accueil.objectif.titre.fin': { fr: 'vos études', en: 'your studies' },
  'accueil.objectif.texte': {
    fr: "S'installer dans un nouveau pays implique de nombreuses démarches administratives. MyStudentGuide centralise les informations essentielles afin de rendre votre parcours plus clair et plus simple.",
    en: 'Settling in a new country involves a lot of paperwork. MyStudentGuide brings the key information together to make your journey clearer and simpler.'
  },
  'accueil.objectif.alt': {
    fr: 'Une étudiante suit ses démarches sur son ordinateur',
    en: 'A student tracking her procedures on her computer'
  },

  'accueil.cta.titre': { fr: 'Prêt à simplifier vos démarches ?', en: 'Ready to make your paperwork simpler?' },
  'accueil.cta.texte': {
    fr: 'Créez votre compte gratuitement, renseignez votre profil et suivez vos démarches étape par étape.',
    en: 'Create your free account, fill in your profile and track your procedures step by step.'
  },
  'accueil.cta.creer': { fr: 'Créer mon compte', en: 'Create my account' },
  'accueil.cta.dejaCompte': { fr: "J'ai déjà un compte", en: 'I already have an account' }
} satisfies Traductions;
