import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../environments/environment';

/** Statuts renvoyés par l'API (enum DemarcheStatus côté Spring). */
export type DemarcheStatut = 'A_FAIRE' | 'EN_COURS' | 'TERMINEE' | 'NON_CONCERNEE';

/** Démarche générale (visible par tous). */
export interface Demarche {
  id: number;
  titre: string;
  description?: string;
  dateLimite?: string | null;
  categorie?: { id: number; nom: string };
}

/** Suivi d'une démarche par l'étudiant (entité StudentDemarche). */
export interface StudentDemarche {
  id: number;
  statut: DemarcheStatut;
  dateAttribution?: string;
  dateDebut?: string | null;
  dateTerminaison?: string | null;
  documentsEnvoyes?: boolean;
  dateEnvoiDocuments?: string | null;
  avisDonne?: boolean;
  /** Calculée par l'API : 0, 25, 50 ou 100. */
  progression?: number;
  demarche: {
    id: number;
    titre: string;
    description?: string;
    dateLimite?: string | null;
    categorie?: { id: number; nom: string };
  };
}

/** Avis public affiché sur la page d'accueil. */
export interface AvisPublic {
  id: number;
  auteur: string;
  demarcheTitre: string;
  note: number;
  commentaire: string;
  visible: boolean;
  dateCreation: string;
}

/**
 * Centralise les appels liés au suivi des démarches,
 * à la progression et aux avis.
 *
 * Le token est ajouté automatiquement par l'interceptor HTTP.
 */
@Injectable({ providedIn: 'root' })
export class StudentDemarcheService {

  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /** Toutes les démarches de l'application (route publique). */
  getToutesLesDemarches(): Observable<Demarche[]> {
    return this.http
      .get<Demarche[]>(`${this.apiUrl}/demarches`)
      .pipe(map((demarches) => demarches ?? []));
  }

  /**
   * Démarches COMMENCÉES par l'étudiant connecté (en cours ou terminées).
   * Liste vide s'il n'a encore rien commencé.
   */
  getMesDemarches(): Observable<StudentDemarche[]> {
    return this.http
      .get<StudentDemarche[]>(`${this.apiUrl}/student-demarches/me`)
      .pipe(map((demarches) => demarches ?? []));
  }

  /**
   * Commence une démarche : crée le suivi de l'étudiant connecté,
   * directement « en cours ». Réservé aux étudiants connectés.
   */
  commencer(demarcheId: number): Observable<StudentDemarche> {
    return this.http.post<StudentDemarche>(
      `${this.apiUrl}/student-demarches/start/${demarcheId}`,
      {}
    );
  }

  /** Retire une démarche de « Mes démarches » (supprime le suivi). */
  retirer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/student-demarches/${id}`);
  }

  /** Change le statut (Commencer → EN_COURS, Terminer → TERMINEE...). */
  changerStatut(id: number, statut: DemarcheStatut): Observable<StudentDemarche> {
    return this.http.patch<StudentDemarche>(
      `${this.apiUrl}/student-demarches/${id}/statut`,
      {},
      { params: { statut } }
    );
  }

  /** Réponse à la question de J+10 : documents envoyés ou pas encore. */
  confirmerDocuments(id: number, envoyes: boolean): Observable<StudentDemarche> {
    return this.http.patch<StudentDemarche>(
      `${this.apiUrl}/student-demarches/${id}/documents`,
      {},
      { params: { envoyes } }
    );
  }

  /** Donne un avis sur une démarche terminée. */
  donnerAvis(studentDemarcheId: number, note: number, commentaire: string): Observable<AvisPublic> {
    return this.http.post<AvisPublic>(`${this.apiUrl}/avis`, {
      studentDemarcheId,
      note,
      commentaire
    });
  }

  /** Avis visibles par tous (page d'accueil). */
  getAvisPublics(limit = 6): Observable<AvisPublic[]> {
    return this.http
      .get<AvisPublic[]>(`${this.apiUrl}/avis/public`, { params: { limit } })
      .pipe(map((avis) => avis ?? []));
  }

  // ==========================================================
  // OUTILS DE PROGRESSION (partagés entre les pages)
  // ==========================================================

  /**
   * Progression d'une démarche, en %.
   * Utilise la valeur de l'API, avec un calcul de secours identique.
   */
  progression(sd: StudentDemarche): number {
    if (typeof sd.progression === 'number') {
      return sd.progression;
    }
    switch (sd.statut) {
      case 'EN_COURS':
        return sd.documentsEnvoyes ? 50 : 25;
      case 'TERMINEE':
        return 100;
      default:
        return 0;
    }
  }

  /**
   * Progression globale : moyenne des démarches,
   * sans compter celles marquées « non concernée ».
   */
  progressionGlobale(demarches: StudentDemarche[]): number {
    const concernees = demarches.filter((d) => d.statut !== 'NON_CONCERNEE');
    if (concernees.length === 0) {
      return 0;
    }
    const total = concernees.reduce((somme, d) => somme + this.progression(d), 0);
    return Math.round(total / concernees.length);
  }

  libelleStatut(statut: DemarcheStatut): string {
    switch (statut) {
      case 'A_FAIRE': return 'À faire';
      case 'EN_COURS': return 'En cours';
      case 'TERMINEE': return 'Terminée';
      case 'NON_CONCERNEE': return 'Non concernée';
      default: return statut;
    }
  }
}
