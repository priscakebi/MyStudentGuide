import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';
import { Cle, TEXTES } from './textes';

export type Langue = 'fr' | 'en';

/** Paramètres insérés dans un texte : « {n} documents » + { n: 3 }. */
export type Parametres = Record<string, string | number | null | undefined>;

const CLE_STOCKAGE = 'langue';

/**
 * Langue de l'interface (côté étudiant ; l'administration reste en français).
 *
 * - première visite : langue du navigateur (anglais si elle n'est pas le français) ;
 * - ensuite : choix mémorisé (bouton FR / EN).
 *
 * Le contenu des démarches est traduit par l'admin, champ par champ
 * (`titreEn`, `descriptionEn`…) : voir `contenu()`.
 */
@Injectable({ providedIn: 'root' })
export class LangueService {
  private readonly document = inject(DOCUMENT);

  readonly langue = signal<Langue>(this.langueInitiale());

  constructor() {
    this.document.documentElement.lang = this.langue();
  }

  /** Change la langue et mémorise le choix. */
  changer(langue: Langue): void {
    this.langue.set(langue);
    this.document.documentElement.lang = langue;
    try {
      localStorage.setItem(CLE_STOCKAGE, langue);
    } catch {
      // Stockage indisponible (navigation privée) : le choix vaut pour la session.
    }
  }

  /** Texte traduit, avec ses paramètres éventuels (« {n} »). */
  t(cle: Cle, parametres?: Parametres): string {
    const texte = TEXTES[cle][this.langue()];
    return parametres
      ? texte.replace(/\{(\w+)\}/g, (tout, nom) => (parametres[nom] ?? '').toString())
      : texte;
  }

  /** Traduit un texte s'il s'agit d'une clé connue ; sinon le renvoie tel quel (titres de l'admin). */
  tSiCle(texte: string): string {
    return this.tOu(texte, texte);
  }

  /** Traduit une clé construite à l'exécution (« docType.IDENTITE ») ; `defaut` si elle n'existe pas. */
  tOu(cle: string, defaut: string): string {
    return cle in TEXTES ? this.t(cle as Cle) : defaut;
  }

  /**
   * Message renvoyé par l'API (toujours en français) : affiché tel quel en français,
   * remplacé par le texte générique `cle` en anglais (ou s'il est absent).
   */
  messageApi(message: string | null | undefined, cle: Cle): string {
    return (this.langue() === 'fr' && message) || this.t(cle);
  }

  /**
   * Texte d'un contenu saisi par l'admin (démarche, étape, document, lien, catégorie) :
   * en anglais, sa version anglaise (`titreEn` pour `titre`) si elle existe, sinon le français.
   */
  contenu(objet: object | null | undefined, champ: string): string {
    if (!objet) {
      return '';
    }
    const valeurs = objet as Record<string, unknown>;
    const anglais = this.langue() === 'en' ? valeurs[`${champ}En`] : null;
    const texte = typeof anglais === 'string' && anglais.trim() ? anglais : valeurs[champ];
    return typeof texte === 'string' ? texte : '';
  }

  /** Vrai si l'interface est en anglais et que ce contenu n'a pas de version anglaise. */
  contenuNonTraduit(objet: object | null | undefined, champ = 'titre'): boolean {
    if (!objet || this.langue() !== 'en') {
      return false;
    }
    const anglais = (objet as Record<string, unknown>)[`${champ}En`];
    return !(typeof anglais === 'string' && anglais.trim());
  }

  /** Locale Angular à utiliser pour les dates. */
  get locale(): string {
    return this.langue() === 'fr' ? 'fr' : 'en-GB';
  }

  private langueInitiale(): Langue {
    try {
      const memorisee = localStorage.getItem(CLE_STOCKAGE);
      if (memorisee === 'fr' || memorisee === 'en') {
        return memorisee;
      }
    } catch {
      // Stockage indisponible : on se fie au navigateur.
    }
    const navigateur = (this.document.defaultView?.navigator.language ?? 'fr').toLowerCase();
    return navigateur.startsWith('fr') ? 'fr' : 'en';
  }
}
