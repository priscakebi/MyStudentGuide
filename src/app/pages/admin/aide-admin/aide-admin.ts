// ============================================================
// DEMANDES D'AIDE DES ÉTUDIANTS (/admin/aide)
// ============================================================
//
// Les étudiants écrivent depuis « Besoin d'aide ? » (/dashboard/aide).
// L'administrateur répond ici : la réponse est envoyée à l'étudiant
// par notification. Une demande sans suite peut être fermée.
// ============================================================

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { DemandeAide, StatutDemandeAide } from '../../aide/aide';
import { Icone } from '../../../components/icone/icone';

const REPONSE_MAX = 2000;

@Component({
  selector: 'app-aide-admin',
  standalone: true,
  imports: [Icone, CommonModule, FormsModule, RouterLink],
  templateUrl: './aide-admin.html',
  styleUrl: './aide-admin.scss'
})
export class AideAdmin implements OnInit {

  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/admin/aide`;

  readonly reponseMax = REPONSE_MAX;

  demandes: DemandeAide[] = [];

  /** Filtre affiché (null = toutes). */
  filtre: StatutDemandeAide | null = 'OUVERTE';

  readonly filtres: { value: StatutDemandeAide | null; label: string }[] = [
    { value: 'OUVERTE', label: 'À traiter' },
    { value: 'REPONDUE', label: 'Répondues' },
    { value: 'FERMEE', label: 'Fermées' },
    { value: null, label: 'Toutes' }
  ];

  /** Brouillon de réponse, par demande. */
  brouillons: Record<number, string> = {};

  /** Demande dont le formulaire de réponse est ouvert. */
  reponseOuverte: number | null = null;

  /** Demande en cours de mise à jour. */
  enCours: number | null = null;

  loading = false;
  erreur = '';
  message = '';

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.loading = true;
    this.erreur = '';

    const params: Record<string, string> = this.filtre ? { statut: this.filtre } : {};

    this.http.get<DemandeAide[]>(this.apiUrl, { params }).subscribe({
      next: (liste) => {
        this.demandes = liste ?? [];
        this.loading = false;
      },
      error: () => {
        this.demandes = [];
        this.loading = false;
        this.erreur = 'Impossible de charger les demandes d\'aide.';
      }
    });
  }

  choisirFiltre(filtre: StatutDemandeAide | null): void {
    this.filtre = filtre;
    this.message = '';
    this.charger();
  }

  ouvrirReponse(demande: DemandeAide): void {
    this.reponseOuverte = demande.id;
    this.brouillons[demande.id] ??= demande.reponse ?? '';
  }

  fermerReponse(): void {
    this.reponseOuverte = null;
  }

  brouillon(demande: DemandeAide): string {
    return this.brouillons[demande.id] ?? '';
  }

  /** PUT /api/admin/aide/{id}/reponse : l'étudiant reçoit la réponse en notification. */
  repondre(demande: DemandeAide): void {
    const reponse = this.brouillon(demande).trim();

    if (!reponse || this.enCours !== null) {
      return;
    }

    this.enCours = demande.id;
    this.message = '';
    this.erreur = '';

    this.http.put<DemandeAide>(`${this.apiUrl}/${demande.id}/reponse`, { reponse }).subscribe({
      next: () => {
        this.enCours = null;
        this.reponseOuverte = null;
        delete this.brouillons[demande.id];
        this.message = `Réponse envoyée à ${demande.auteur ?? 'l\'étudiant'}.`;
        this.charger();
      },
      error: (err) => {
        this.enCours = null;
        this.erreur = err.error?.message || 'L\'envoi de la réponse a échoué.';
      }
    });
  }

  /** Ferme une demande sans suite, ou la rouvre. */
  changerStatut(demande: DemandeAide, statut: 'OUVERTE' | 'FERMEE'): void {
    if (this.enCours !== null) {
      return;
    }

    this.enCours = demande.id;
    this.message = '';
    this.erreur = '';

    this.http.patch<DemandeAide>(
      `${this.apiUrl}/${demande.id}`, {}, { params: { statut } }
    ).subscribe({
      next: () => {
        this.enCours = null;
        this.message = statut === 'FERMEE' ? 'Demande fermée.' : 'Demande rouverte.';
        this.charger();
      },
      error: () => {
        this.enCours = null;
        this.erreur = 'La mise à jour a échoué.';
      }
    });
  }

  libelleStatut(statut: StatutDemandeAide): string {
    switch (statut) {
      case 'OUVERTE': return 'À traiter';
      case 'REPONDUE': return 'Répondue';
      case 'FERMEE': return 'Fermée';
    }
  }
}
