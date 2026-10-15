import { TEXTES } from './textes';
import { ACCUEIL } from './textes/accueil';
import { AIDE } from './textes/aide';
import { AUTH } from './textes/auth';
import { COMMUN } from './textes/commun';
import { COMPOSANTS } from './textes/composants';
import { COMPTE } from './textes/compte';
import { DEMARCHE_DETAIL } from './textes/demarche-detail';
import { DEMARCHES } from './textes/demarches';
import { DOCUMENTS } from './textes/documents';
import { ESPACE } from './textes/espace';
import { NAVIGATION } from './textes/navigation';
import { NOTIFICATIONS } from './textes/notifications';
import { PROFIL } from './textes/profil';
import { SUIVIS } from './textes/suivis';
import { TITRES } from './textes/titres';
import { Traductions } from './textes/type';

const DICTIONNAIRES: Record<string, Traductions> = {
  ACCUEIL, AIDE, AUTH, COMMUN, COMPOSANTS, COMPTE, DEMARCHE_DETAIL, DEMARCHES,
  DOCUMENTS, ESPACE, NAVIGATION, NOTIFICATIONS, PROFIL, SUIVIS, TITRES
};

/** Notes affichées seulement en anglais (« le contenu reste en français ») : texte français vide. */
const SEULEMENT_EN_ANGLAIS = ['detail.contenuFrancais', 'notif.contenuFrancais'];

const parametres = (texte: string) => [...texte.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe('Textes de l’interface (français / anglais)', () => {

  it('chaque dictionnaire est inclus et aucune clé n’est définie deux fois', () => {
    const toutes = Object.values(DICTIONNAIRES).flatMap((d) => Object.keys(d));
    const doublons = toutes.filter((cle, i) => toutes.indexOf(cle) !== i);

    expect(doublons).toEqual([]);
    expect(Object.keys(TEXTES).length).toBe(toutes.length);
  });

  it('chaque texte existe en français et en anglais', () => {
    const vides = Object.entries(TEXTES as Traductions)
      .filter(([cle, t]) => !t.en.trim() || (!t.fr.trim() && !SEULEMENT_EN_ANGLAIS.includes(cle)))
      .map(([cle]) => cle);

    expect(vides).toEqual([]);
  });

  it('les paramètres ({n}, {titre}…) sont les mêmes dans les deux langues', () => {
    const differents = Object.entries(TEXTES as Traductions)
      .filter(([cle, t]) => !SEULEMENT_EN_ANGLAIS.includes(cle))
      .filter(([, t]) => parametres(t.fr).join() !== parametres(t.en).join())
      .map(([cle]) => cle);

    expect(differents).toEqual([]);
  });
});
