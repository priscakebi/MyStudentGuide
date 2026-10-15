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
 * Le contenu des démarches (Service-Public, administration) n'est pas traduit.
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
