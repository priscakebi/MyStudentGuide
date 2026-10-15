// ============================================================
// BESOIN D'AIDE ? (/dashboard/aide)
// ============================================================
//
// L'étudiant écrit à l'équipe lorsqu'il rencontre une difficulté.
// L'administrateur répond depuis /admin/aide : la réponse arrive
// en notification et s'affiche dans « Mes demandes » ci-dessous.
//
// API :
// - POST   /api/aide         envoyer une demande
// - GET    /api/aide/me      mes demandes et leurs réponses
// - DELETE /api/aide/{id}    supprimer une demande
// ============================================================

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';

export type SujetAide = 'DEMARCHE' | 'DOCUMENT' | 'COMPTE' | 'TECHNIQUE' | 'AUTRE';
export type StatutDemandeAide = 'OUVERTE' | 'REPONDUE' | 'FERMEE';

export interface DemandeAide {
  id: number;
  sujet: SujetAide;
  sujetLibelle: string;
  demarcheId: number | null;
  demarcheTitre: string | null;
  message: string;
  reponse: string | null;
  auteur: string | null;
  statut: StatutDemandeAide;
  dateCreation: string;
  dateReponse: string | null;
}

interface DemarcheOption {
  id: number;
  titre: string;
}

// Mêmes limites que l'API (DemandeAideDtos).
export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 2000;

// Au-delà, l'API refuse une nouvelle demande (DemandeAideService).
const MAX_DEMANDES_OUVERTES = 3;

@Component({
  selector: 'app-aide',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './aide.html',
  styleUrl: './aide.scss'
})
export class Aide implements OnInit {

  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private readonly apiUrl = environment.apiUrl;

  readonly messageMax = MESSAGE_MAX;
  readonly messageMin = MESSAGE_MIN;

  readonly sujets: { value: SujetAide; label: string }[] = [
    { value: 'DEMARCHE', label: 'Une démarche' },
    { value: 'DOCUMENT', label: 'Un document' },
    { value: 'COMPTE', label: 'Mon compte' },
    { value: 'TECHNIQUE', label: 'Problème technique' },
    { value: 'AUTRE', label: 'Autre' }
  ];

  // Formulaire
  sujet: SujetAide | '' = '';
  demarcheId: number | null = null;
  message = '';
  tentative = false;

  demarches: DemarcheOption[] = [];
  demandes: DemandeAide[] = [];

  chargement = true;
  envoiEnCours = false;
  suppressionEnCours: number | null = null;

  succes = '';
  erreur = '';
  erreurListe = '';

  ngOnInit(): void {
    // Lien « Poser une question » depuis une démarche : /dashboard/aide?demarche=12
    const demarche = Number(this.route.snapshot.queryParamMap.get('demarche'));
    if (demarche > 0) {
      this.sujet = 'DEMARCHE';
      this.demarcheId = demarche;
    }

    this.chargerDemarches();
    this.chargerDemandes();
  }

  /** La démarche concernée n'a de sens que pour ces sujets. */
  get demarcheUtile(): boolean {
    return this.sujet === 'DEMARCHE' || this.sujet === 'DOCUMENT';
  }

  get longueurMessage(): number {
    return this.message.trim().length;
  }

  get sujetManquant(): boolean {
    return this.tentative && !this.sujet;
  }

  get messageInvalide(): boolean {
    return this.tentative && this.longueurMessage < MESSAGE_MIN;
  }

  get demandesOuvertes(): number {
    return this.demandes.filter((d) => d.statut === 'OUVERTE').length;
  }

  get limiteAtteinte(): boolean {
    return this.demandesOuvertes >= MAX_DEMANDES_OUVERTES;
  }

  chargerDemarches(): void {
    this.http.get<DemarcheOption[]>(`${this.apiUrl}/demarches`).subscribe({
      next: (liste) => {
        this.demarches = (liste ?? [])
          .map((d) => ({ id: d.id, titre: d.titre }))
          .sort((a, b) => a.titre.localeCompare(b.titre, 'fr'));
      },
      // La liste est facultative : le formulaire reste utilisable sans elle.
      error: () => (this.demarches = [])
    });
  }

  chargerDemandes(): void {
    this.chargement = true;
    this.erreurListe = '';

    this.http.get<DemandeAide[]>(`${this.apiUrl}/aide/me`).subscribe({
      next: (liste) => {
        this.demandes = liste ?? [];
        this.chargement = false;
      },
      error: () => {
        this.demandes = [];
        this.chargement = false;
        this.erreurListe = 'Impossible de charger vos demandes. Réessayez dans un instant.';
      }
    });
  }

  envoyer(): void {
    this.tentative = true;
    this.succes = '';
    this.erreur = '';

    if (!this.sujet || this.longueurMessage < MESSAGE_MIN || this.envoiEnCours) {
      return;
    }

    this.envoiEnCours = true;

    this.http.post<DemandeAide>(`${this.apiUrl}/aide`, {
      sujet: this.sujet,
      demarcheId: this.demarcheUtile ? this.demarcheId : null,
      message: this.message.trim()
    }).subscribe({
      next: (demande) => {
        this.envoiEnCours = false;
        this.demandes = [demande, ...this.demandes];
        this.sujet = '';
        this.demarcheId = null;
        this.message = '';
        this.tentative = false;
        this.succes = 'Votre demande a bien été envoyée. Vous recevrez la réponse en notification.';
      },
      error: (err) => {
        this.envoiEnCours = false;
        const erreurs = err.error?.errors as Record<string, string> | undefined;
        this.erreur = (erreurs && Object.values(erreurs)[0])
          || err.error?.message
          || "L'envoi a échoué. Réessayez dans un instant.";
      }
    });
  }

  supprimer(demande: DemandeAide): void {
    if (this.suppressionEnCours !== null
      || !confirm('Supprimer définitivement cette demande et sa réponse ?')) {
      return;
    }

    this.suppressionEnCours = demande.id;

    this.http.delete(`${this.apiUrl}/aide/${demande.id}`).subscribe({
      next: () => {
        this.suppressionEnCours = null;
        this.demandes = this.demandes.filter((d) => d.id !== demande.id);
      },
      error: () => {
        this.suppressionEnCours = null;
        this.erreurListe = 'La suppression a échoué.';
      }
    });
  }

  libelleStatut(statut: StatutDemandeAide): string {
    switch (statut) {
      case 'OUVERTE': return 'En attente';
      case 'REPONDUE': return 'Répondue';
      case 'FERMEE': return 'Fermée';
    }
  }
}
