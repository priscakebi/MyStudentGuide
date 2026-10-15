import { Component, OnInit, inject } from '@angular/core';

import {
  AvisPublic,
  StudentDemarcheService
} from '../../services/student-demarche.service';
import { DateLPipe, TPipe } from '../../i18n/t.pipe';

/**
 * Section « Ils ont été accompagnés » de la page d'accueil.
 *
 * Affiche les derniers avis laissés par les étudiants sur le suivi
 * de leurs démarches terminées. Visible par tout le monde
 * (GET /api/avis/public, sans connexion).
 *
 * La section est masquée tant qu'aucun avis n'a été publié
 * (ou si l'API ne répond pas) : la page d'accueil reste propre.
 */
@Component({
  selector: 'app-avis-publics',
  standalone: true,
  imports: [TPipe, DateLPipe],
  templateUrl: './avis-publics.html',
  styleUrl: './avis-publics.scss'
})
export class AvisPublics implements OnInit {

  private service = inject(StudentDemarcheService);

  avis: AvisPublic[] = [];
  readonly etoiles = [1, 2, 3, 4, 5];

  get moyenne(): number {
    if (this.avis.length === 0) {
      return 0;
    }
    const total = this.avis.reduce((somme, a) => somme + a.note, 0);
    return Math.round((total / this.avis.length) * 10) / 10;
  }

  ngOnInit(): void {
    this.service.getAvisPublics(6).subscribe({
      next: (avis) => (this.avis = avis),
      error: () => (this.avis = [])
    });
  }

  initiale(auteur: string): string {
    return (auteur?.trim().charAt(0) || '?').toUpperCase();
  }
}
