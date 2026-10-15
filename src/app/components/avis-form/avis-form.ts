import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { LangueService } from '../../i18n/langue.service';
import { TPipe } from '../../i18n/t.pipe';

import {
  AvisPublic,
  StudentDemarcheService
} from '../../services/student-demarche.service';

/**
 * Fenêtre « Donner mon avis » sur une démarche terminée.
 *
 * Utilisation :
 *   <app-avis-form
 *     [studentDemarcheId]="sd.id"
 *     [demarcheTitre]="sd.demarche.titre"
 *     (saved)="..." (closed)="...">
 *   </app-avis-form>
 *
 * Une fois envoyé, l'avis apparaît sur la page d'accueil.
 */
@Component({
  selector: 'app-avis-form',
  standalone: true,
  imports: [FormsModule, TPipe],
  templateUrl: './avis-form.html',
  styleUrl: './avis-form.scss'
})
export class AvisForm {

  private service = inject(StudentDemarcheService);
  private langue = inject(LangueService);

  @Input({ required: true }) studentDemarcheId!: number;
  @Input() demarcheTitre = '';

  /** Émis avec l'avis enregistré. */
  @Output() saved = new EventEmitter<AvisPublic>();

  /** Émis lorsque l'étudiant ferme la fenêtre. */
  @Output() closed = new EventEmitter<void>();

  readonly etoiles = [1, 2, 3, 4, 5];
  /** Libellé d'une note (1 → Décevant / Disappointing) ; vide sans note. */
  libelle(note: number): string {
    return note >= 1 && note <= 5 ? this.langue.t(`avis.libelle.${note as 1 | 2 | 3 | 4 | 5}`) : '';
  }

  note = 0;
  survol = 0;
  commentaire = '';
  envoi = false;
  erreur = '';

  get commentaireValide(): boolean {
    const longueur = this.commentaire.trim().length;
    return longueur >= 10 && longueur <= 1000;
  }

  envoyer(): void {
    this.erreur = '';

    if (this.note < 1) {
      this.erreur = this.langue.t('avis.erreur.note');
      return;
    }

    if (!this.commentaireValide) {
      this.erreur = this.langue.t('avis.erreur.commentaire');
      return;
    }

    if (this.envoi) {
      return;
    }

    this.envoi = true;

    this.service
      .donnerAvis(this.studentDemarcheId, this.note, this.commentaire.trim())
      .subscribe({
        next: (avis) => {
          this.envoi = false;
          this.saved.emit(avis);
        },
        error: (error: HttpErrorResponse) => {
          this.envoi = false;
          this.erreur = error.status === 0
            ? this.langue.t('form.serveurInjoignable')
            : error.error?.message || this.langue.t('avis.erreur.enregistrer');
        }
      });
  }

  fermer(): void {
    if (!this.envoi) {
      this.closed.emit();
    }
  }
}
