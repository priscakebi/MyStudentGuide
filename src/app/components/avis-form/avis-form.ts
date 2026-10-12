import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

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
  imports: [FormsModule],
  templateUrl: './avis-form.html',
  styleUrl: './avis-form.scss'
})
export class AvisForm {

  private service = inject(StudentDemarcheService);

  @Input({ required: true }) studentDemarcheId!: number;
  @Input() demarcheTitre = '';

  /** Émis avec l'avis enregistré. */
  @Output() saved = new EventEmitter<AvisPublic>();

  /** Émis lorsque l'étudiant ferme la fenêtre. */
  @Output() closed = new EventEmitter<void>();

  readonly etoiles = [1, 2, 3, 4, 5];
  readonly libelles = ['', 'Décevant', 'Moyen', 'Bien', 'Très bien', 'Excellent'];

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
      this.erreur = 'Choisissez une note de 1 à 5 étoiles.';
      return;
    }

    if (!this.commentaireValide) {
      this.erreur = 'Votre commentaire doit contenir entre 10 et 1000 caractères.';
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
            ? 'Impossible de joindre le serveur. Réessayez plus tard.'
            : error.error?.message || "Impossible d'enregistrer votre avis.";
        }
      });
  }

  fermer(): void {
    if (!this.envoi) {
      this.closed.emit();
    }
  }
}
