/** Un texte dans chaque langue de l'interface. */
export interface Traduction {
  fr: string;
  en: string;
}

/** Dictionnaire d'une page : clé → texte français et anglais. */
export type Traductions = Record<string, Traduction>;
