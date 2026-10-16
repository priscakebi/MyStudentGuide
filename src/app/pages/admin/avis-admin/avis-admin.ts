// ============================================================
// AVIS DES ÉTUDIANTS (/admin/avis)
// ============================================================
//
// Les étudiants notent une démarche terminée ; les avis visibles
// sont publiés sur la page d'accueil (prénom + initiale du nom).
//
// L'administrateur peut masquer un avis (il reste en base et peut
// être réaffiché) ou le supprimer définitivement, comme le prévoient
// les conditions d'utilisation.
//
// GET /api/avis · PATCH /api/avis/{id}/visible · DELETE /api/avis/{id}
// ============================================================

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { AvisPublic } from '../../../services/student-demarche.service';
import { Icone } from '../../../components/icone/icone';

type Filtre = 'TOUS' | 'VISIBLES' | 'MASQUES';

@Component({
  selector: 'app-avis-admin',
  standalone: true,
  imports: [Icone, CommonModule],
  templateUrl: './avis-admin.html',
  styleUrls: ['../signalements-admin/signalements-admin.scss', './avis-admin.scss']
})
export class AvisAdmin implements OnInit {

  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/avis`;

  avis: AvisPublic[] = [];

  filtre: Filtre = 'TOUS';

  readonly filtres: { value: Filtre; label: string }[] = [
    { value: 'TOUS', label: 'Tous' },
    { value: 'VISIBLES', label: 'Publiés' },
    { value: 'MASQUES', label: 'Masqués' }
  ];

  readonly etoiles = [1, 2, 3, 4, 5];

  loading = false;
  erreur = '';
  message = '';

  /** Avis en cours de mise à jour. */
  enCours: number | null = null;

  ngOnInit(): void {
    this.charger();
  }

  get avisFiltres(): AvisPublic[] {
    switch (this.filtre) {
      case 'VISIBLES': return this.avis.filter((a) => a.visible);
      case 'MASQUES': return this.avis.filter((a) => !a.visible);
      default: return this.avis;
    }
  }

  charger(): void {
    this.loading = true;
    this.erreur = '';

    this.http.get<AvisPublic[]>(this.apiUrl).subscribe({
      next: (liste) => {
        this.avis = liste ?? [];
        this.loading = false;
      },
      error: () => {
        this.avis = [];
        this.loading = false;
        this.erreur = 'Impossible de charger les avis.';
      }
    });
  }

  /** Masque ou republie un avis sur la page d'accueil. */
  changerVisibilite(avis: AvisPublic): void {
    if (this.enCours !== null) {
      return;
    }

    this.enCours = avis.id;
    this.message = '';
    this.erreur = '';
    const visible = !avis.visible;

    this.http.patch<AvisPublic>(`${this.apiUrl}/${avis.id}/visible`, {}, { params: { visible } }).subscribe({
      next: (misAJour) => {
        this.enCours = null;
        avis.visible = misAJour?.visible ?? visible;
        this.message = avis.visible
          ? `L'avis de ${avis.auteur} est de nouveau publié.`
          : `L'avis de ${avis.auteur} est masqué : il n'apparaît plus sur la page d'accueil.`;
      },
      error: () => {
        this.enCours = null;
        this.erreur = 'La mise à jour a échoué.';
      }
    });
  }

  supprimer(avis: AvisPublic): void {
    if (this.enCours !== null
        || !confirm(`Supprimer définitivement l'avis de ${avis.auteur} ? Cette action est irréversible.`)) {
      return;
    }

    this.enCours = avis.id;
    this.message = '';
    this.erreur = '';

    this.http.delete(`${this.apiUrl}/${avis.id}`).subscribe({
      next: () => {
        this.enCours = null;
        this.avis = this.avis.filter((a) => a.id !== avis.id);
        this.message = 'Avis supprimé.';
      },
      error: () => {
        this.enCours = null;
        this.erreur = 'La suppression a échoué.';
      }
    });
  }
}
