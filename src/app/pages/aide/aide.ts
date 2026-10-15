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
import { LangueService } from '../../i18n/langue.service';
import { DateLPipe, TPipe } from '../../i18n/t.pipe';
import { Cle } from '../../i18n/textes';

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
  imports: [CommonModule, FormsModule, RouterLink, TPipe, DateLPipe],
  templateUrl: './aide.html',
  styleUrl: './aide.scss'
})
export class Aide implements OnInit {

  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private langue = inject(LangueService);
  private readonly apiUrl = environment.apiUrl;

  readonly messageMax = MESSAGE_MAX;
  readonly messageMin = MESSAGE_MIN;

  readonly sujets: { value: SujetAide; label: Cle }[] = [
    { value: 'DEMARCHE', label: 'aide.sujet.DEMARCHE' },
    { value: 'DOCUMENT', label: 'aide.sujet.DOCUMENT' },
    { value: 'COMPTE', label: 'aide.sujet.COMPTE' },
    { value: 'TECHNIQUE', label: 'aide.sujet.TECHNIQUE' },
    { value: 'AUTRE', label: 'aide.sujet.AUTRE' }
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
        this.erreurListe = this.langue.t('aide.erreur.liste');
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
        this.succes = this.langue.t('aide.succes');
      },
      error: (err) => {
        this.envoiEnCours = false;
        const erreurs = err.error?.errors as Record<string, string> | undefined;
        // Les messages de l'API sont en français : en anglais, message générique.
        const messageApi = (erreurs && Object.values(erreurs)[0]) || err.error?.message;
        this.erreur = (this.langue.langue() === 'fr' && messageApi) || this.langue.t('aide.erreur.envoi');
      }
    });
  }

  supprimer(demande: DemandeAide): void {
    if (this.suppressionEnCours !== null
      || !confirm(this.langue.t('aide.supprimer.confirmer'))) {
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
        this.erreurListe = this.langue.t('aide.erreur.suppression');
      }
    });
  }

  libelleStatut(statut: StatutDemandeAide): string {
    return this.langue.t(`aide.statut.${statut}`);
  }

  /** Sujet traduit (le libellé de l'API est en français). */
  libelleSujet(demande: DemandeAide): string {
    return this.langue.tOu(`aide.sujet.${demande.sujet}`, demande.sujetLibelle);
  }
}
