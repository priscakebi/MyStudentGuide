// ============================================================
// TEXTES DE L'INTERFACE (français / anglais)
// ============================================================
//
// Un fichier par page ou par composant ; chaque clé porte son
// texte français ET anglais côte à côte. Une clé inconnue dans
// un template ou une traduction manquante bloque la compilation.
//
// Les clés sont préfixées par le nom de la page (« accueil. »,
// « nav. »…) pour éviter les doublons entre fichiers.
// ============================================================

import { ACCUEIL } from './accueil';
import { AIDE } from './aide';
import { AUTH } from './auth';
import { COMMUN } from './commun';
import { COMPOSANTS } from './composants';
import { COMPTE } from './compte';
import { DEMARCHE_DETAIL } from './demarche-detail';
import { DEMARCHES } from './demarches';
import { DOCUMENTS } from './documents';
import { ESPACE } from './espace';
import { NAVIGATION } from './navigation';
import { NOTIFICATIONS } from './notifications';
import { PROFIL } from './profil';
import { SUIVIS } from './suivis';
import { TITRES } from './titres';

export const TEXTES = {
  ...COMMUN,
  ...TITRES,
  ...NAVIGATION,
  ...ACCUEIL,
  ...DEMARCHES,
  ...DEMARCHE_DETAIL,
  ...DOCUMENTS,
  ...AUTH,
  ...AIDE,
  ...NOTIFICATIONS,
  ...COMPOSANTS,
  ...ESPACE,
  ...SUIVIS,
  ...PROFIL,
  ...COMPTE
};

export type Cle = keyof typeof TEXTES;
