// ============================================================
// SIGNALEMENTS DES ÉTUDIANTS (/admin/signalements)
// ============================================================
//
// Les étudiants signalent une information erronée ou obsolète
// depuis la page d'une démarche (« Signaler une erreur »).
//
// L'administrateur :
// - ouvre la démarche concernée pour la corriger ;
// - marque le signalement « traité » (l'étudiant est remercié
//   par notification) ou « rejeté ».
// ============================================================

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { Icone } from '../../../components/icone/icone';

type Statut = 'OUVERT' | 'TRAITE' | 'REJETE';

interface Signalement {
  id: number;
  demarcheId: number;
  demarcheTitre: string;
  motif: string;
  motifLibelle: string;
  commentaire: string | null;
  auteur: string | null;
  statut: Statut;
  dateCreation: string;
  dateTraitement: string | null;
}

@Component({
  selector: 'app-signalements-admin',
  standalone: true,
  imports: [Icone, CommonModule, RouterLink],
  templateUrl: './signalements-admin.html',
  styleUrl: './signalements-admin.scss'
})
export class SignalementsAdmin implements OnInit {

  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/admin/signalements`;

  signalements: Signalement[] = [];

  /** Filtre affiché (null = tous). */
  filtre: Statut | null = 'OUVERT';

  readonly filtres: { value: Statut | null; label: string }[] = [
    { value: 'OUVERT', label: 'À traiter' },
    { value: 'TRAITE', label: 'Traités' },
    { value: 'REJETE', label: 'Rejetés' },
    { value: null, label: 'Tous' }
  ];

  loading = false;
  erreur = '';
  message = '';

  /** Signalement en cours de mise à jour. */
  enCours: number | null = null;

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.loading = true;
    this.erreur = '';

    const params: Record<string, string> = this.filtre ? { statut: this.filtre } : {};

    this.http.get<Signalement[]>(this.apiUrl, { params }).subscribe({
      next: (liste) => {
        this.signalements = liste ?? [];
        this.loading = false;
      },
      error: () => {
        this.signalements = [];
        this.loading = false;
        this.erreur = 'Impossible de charger les signalements.';
      }
    });
  }

  choisirFiltre(filtre: Statut | null): void {
    this.filtre = filtre;
    this.message = '';
    this.charger();
  }

  /** TRAITE : l'étudiant reçoit une notification de remerciement. */
  changerStatut(signalement: Signalement, statut: Statut): void {
    if (this.enCours !== null) {
      return;
    }

    this.enCours = signalement.id;
    this.message = '';

    this.http.patch<Signalement>(
      `${this.apiUrl}/${signalement.id}`, {}, { params: { statut } }
    ).subscribe({
      next: () => {
        this.enCours = null;
        this.message = statut === 'TRAITE'
          ? `Signalement traité : ${signalement.auteur ?? 'l\'étudiant'} a été remercié(e).`
          : statut === 'REJETE'
            ? 'Signalement rejeté.'
            : 'Signalement rouvert.';
        this.charger();
      },
      error: () => {
        this.enCours = null;
        this.erreur = 'La mise à jour a échoué.';
      }
    });
  }

  libelleStatut(statut: Statut): string {
    switch (statut) {
      case 'OUVERT': return 'À traiter';
      case 'TRAITE': return 'Traité';
      case 'REJETE': return 'Rejeté';
    }
  }
}
