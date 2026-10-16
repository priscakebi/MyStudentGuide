// ============================================================
// VERSION ANGLAISE D'UNE DÉMARCHE
// ============================================================
//
// Utilisé dans « Gestion des démarches » (bouton « 🌐 Anglais »).
// Chaque texte français est affiché en regard de son champ anglais.
// Un champ anglais vide : l'étudiant voit le texte français.
//
// GET / PUT /api/admin/demarches/{id}/traduction
// ============================================================

import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { environment } from '../../../environments/environment';

/** Un texte à traduire : la démarche, une étape, un document ou un lien. */
export interface ElementTraduction {
  id: number | null;
  titreFr: string;
  descriptionFr: string | null;
  titre: string | null;
  description: string | null;
}

export interface Traduction {
  demarche: ElementTraduction;
  etapes: ElementTraduction[];
  documents: ElementTraduction[];
  liens: ElementTraduction[];
}

@Component({
  selector: 'app-demarche-traduction-editor',
  standalone: true,
  imports: [FormsModule, NgTemplateOutlet],
  templateUrl: './demarche-traduction-editor.html',
  styleUrl: './demarche-traduction-editor.scss'
})
export class DemarcheTraductionEditor implements OnInit {

  private http = inject(HttpClient);

  @Input({ required: true }) demarcheId!: number;

  /** Après un enregistrement réussi (la liste recharge le badge « traduite »). */
  @Output() enregistree = new EventEmitter<void>();

  /** Fermeture demandée (bouton « Fermer »). */
  @Output() fermer = new EventEmitter<void>();

  traduction: Traduction | null = null;

  chargement = true;
  enCours = false;
  erreur = '';
  message = '';

  private get url(): string {
    return `${environment.apiUrl}/admin/demarches/${this.demarcheId}/traduction`;
  }

  ngOnInit(): void {
    this.http.get<Traduction>(this.url).subscribe({
      next: (traduction) => {
        this.chargement = false;
        this.traduction = traduction;
      },
      error: () => {
        this.chargement = false;
        this.erreur = 'Impossible de charger le contenu à traduire.';
      }
    });
  }

  /** Tous les éléments, pour compter les textes traduits. */
  private get elements(): ElementTraduction[] {
    const t = this.traduction;
    return t ? [t.demarche, ...t.etapes, ...t.documents, ...t.liens] : [];
  }

  /** Nombre de textes français (titres et descriptions non vides). */
  get totalTextes(): number {
    return this.elements.reduce((n, e) => n + (e.titreFr ? 1 : 0) + (e.descriptionFr ? 1 : 0), 0);
  }

  /** Nombre de ces textes qui ont une version anglaise. */
  get textesTraduits(): number {
    return this.elements.reduce((n, e) =>
      n + (e.titreFr && rempli(e.titre) ? 1 : 0) + (e.descriptionFr && rempli(e.description) ? 1 : 0), 0);
  }

  enregistrer(): void {
    if (!this.traduction || this.enCours) {
      return;
    }

    this.enCours = true;
    this.erreur = '';
    this.message = '';

    this.http.put<Traduction>(this.url, this.traduction).subscribe({
      next: (traduction) => {
        this.enCours = false;
        this.traduction = traduction;
        this.message = 'Version anglaise enregistrée.';
        this.enregistree.emit();
      },
      error: (error: HttpErrorResponse) => {
        this.enCours = false;
        const details = error.error?.errors ? Object.values(error.error.errors)[0] : null;
        this.erreur = (details as string | null) || error.error?.message
          || 'La version anglaise n\'a pas pu être enregistrée.';
      }
    });
  }
}

function rempli(texte: string | null | undefined): boolean {
  return !!texte && texte.trim().length > 0;
}
