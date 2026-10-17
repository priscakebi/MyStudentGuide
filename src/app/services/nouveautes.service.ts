import { Injectable, computed, signal } from '@angular/core';

import { DERNIERE_NOUVEAUTE, NOUVEAUTES } from '../pages/nouveautes/nouveautes.data';

const CLE = 'nouveautes-vues';

/** Sans visite enregistrée : seules les nouveautés de moins de 30 jours comptent comme nouvelles. */
const FENETRE_JOURS = 30;

/**
 * Nouveautés pas encore vues dans ce navigateur (badge « Nouveau » du menu).
 * Ouvrir la page /nouveautes les marque comme vues.
 */
@Injectable({ providedIn: 'root' })
export class NouveautesService {

  private readonly vuJusquA = signal<string | null>(this.lire());

  /** Nombre de nouveautés publiées depuis la dernière visite de la page. */
  readonly nonVues = computed(() => {
    const reference = this.vuJusquA() ?? this.ilYa(FENETRE_JOURS);
    return NOUVEAUTES.filter((n) => n.date > reference).length;
  });

  /** Date de la dernière nouveauté vue (null : page jamais ouverte). */
  readonly derniereVue = this.vuJusquA.asReadonly();

  marquerVues(): void {
    try {
      localStorage.setItem(CLE, DERNIERE_NOUVEAUTE);
    } catch {
      // Stockage indisponible : vues pour cette visite seulement.
    }
    this.vuJusquA.set(DERNIERE_NOUVEAUTE);
  }

  private lire(): string | null {
    try {
      return localStorage.getItem(CLE);
    } catch {
      return null;
    }
  }

  private ilYa(jours: number): string {
    const date = new Date();
    date.setDate(date.getDate() - jours);
    return date.toISOString().slice(0, 10);
  }
}
