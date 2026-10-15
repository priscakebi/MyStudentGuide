import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

/** Nom de l'application, ajouté à la fin de chaque titre d'onglet. */
export const NOM_APPLICATION = 'MyStudentGuide';

/** « Mes démarches » → « Mes démarches · MyStudentGuide ». */
export function titreComplet(titre: string | null | undefined): string {
  return titre ? `${titre} · ${NOM_APPLICATION}` : NOM_APPLICATION;
}

/** Résumé d'un texte pour la balise description (une ligne, 160 caractères max). */
export function resume(texte: string, max = 160): string {
  const ligne = texte.replace(/\s+/g, ' ').trim();
  if (ligne.length <= max) {
    return ligne;
  }
  const coupe = ligne.slice(0, max - 1);
  return `${coupe.slice(0, coupe.lastIndexOf(' ') > 0 ? coupe.lastIndexOf(' ') : coupe.length)}…`;
}

/**
 * Titre de l'onglet du navigateur (et description lue par les moteurs de recherche).
 *
 * Chaque route déclare son titre (propriété `title` dans app.routes.ts) ;
 * le nom de l'application est ajouté automatiquement. Une page dont le
 * titre dépend des données (détail d'une démarche) le remplace ensuite
 * avec PageTitleStrategy.definir().
 */
@Injectable({ providedIn: 'root' })
export class PageTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  /** Description générale, celle de index.html. */
  private readonly descriptionParDefaut =
    this.meta.getTag('name="description"')?.content ?? '';

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.title.setTitle(titreComplet(this.buildTitle(snapshot)));
    this.meta.updateTag({ name: 'description', content: this.descriptionParDefaut });
  }

  /** Remplace le titre de la page courante (ex. : nom de la démarche chargée). */
  definir(titre: string, description?: string | null): void {
    this.title.setTitle(titreComplet(titre));
    if (description?.trim()) {
      this.meta.updateTag({ name: 'description', content: resume(description) });
    }
  }
}
