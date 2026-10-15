import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

import { AvisForm } from '../../components/avis-form/avis-form';
import { LangueService } from '../../i18n/langue.service';
import { TPipe } from '../../i18n/t.pipe';
import {
  DemarcheStatut,
  StudentDemarche,
  StudentDemarcheService
} from '../../services/student-demarche.service';

type Filtre = 'TOUTES' | 'EN_COURS' | 'TERMINEE';

/**
 * Page « Mes démarches » de l'espace étudiant (/dashboard/suivis).
 *
 * N'affiche QUE les démarches commencées (en cours ou terminées).
 * Une démarche est commencée depuis /demarches ou depuis
 * une notification de suggestion.
 *
 * L'étudiant peut :
 * - confirmer l'envoi de ses documents (→ 50 %) ;
 * - marquer la démarche comme terminée (→ 100 %) ;
 * - corriger le statut (en cours / terminée) ;
 * - retirer la démarche de son suivi ;
 * - donner son avis une fois la démarche terminée
 *   (l'avis est ensuite visible sur la page d'accueil).
 *
 * Correctif : l'API renvoie le statut « TERMINEE » (et non « TERMINE ») :
 * les démarches terminées n'apparaissaient donc jamais comme terminées.
 */
@Component({
  selector: 'app-suivis-demarches',
  standalone: true,
  imports: [CommonModule, RouterLink, AvisForm, TPipe],
  templateUrl: './suivis-demarches.html',
  styleUrl: './suivis-demarches.scss'
})
export class SuivisDemarches implements OnInit {

  private readonly router = inject(Router);
  readonly service = inject(StudentDemarcheService);
  private readonly langue = inject(LangueService);

  demarches: StudentDemarche[] = [];
  loading = true;
  errorMessage = '';
  actionMessage = '';
  actionError = '';
  filtre: Filtre = 'TOUTES';

  /** Identifiants des démarches en cours de mise à jour. */
  private enMiseAJour = new Set<number>();

  /** Démarche pour laquelle la fenêtre d'avis est ouverte. */
  avisPour: StudentDemarche | null = null;

  /** Pour quitter le suivi, on utilise « Retirer » (plus de retour à « À faire »). */
  readonly statutsModifiables: { value: DemarcheStatut }[] = [
    { value: 'EN_COURS' },
    { value: 'TERMINEE' }
  ];

  /** Libellé traduit d'un statut (EN_COURS → En cours / In progress). */
  libelleStatut(statut: DemarcheStatut): string {
    return this.langue.tOu(`statut.${statut}`, statut);
  }

  ngOnInit(): void {
    this.chargerDemarches();
  }

  chargerDemarches(): void {
    this.loading = true;
    this.errorMessage = '';

    this.service.getMesDemarches().subscribe({
      next: (demarches) => {
        this.loading = false;
        this.demarches = demarches;
      },
      error: () => {
        this.loading = false;

        // 401 : géré par l'interceptor (déconnexion + /login).
        this.errorMessage = this.langue.t('suivis.erreur.chargement');
      }
    });
  }

  // ==========================================================
  // FILTRES ET AFFICHAGE
  // ==========================================================

  get demarchesFiltrees(): StudentDemarche[] {
    return this.filtre === 'TOUTES'
      ? this.demarches
      : this.demarches.filter((d) => d.statut === this.filtre);
  }

  get progressionGlobale(): number {
    return this.service.progressionGlobale(this.demarches);
  }

  changerFiltre(filtre: Filtre): void {
    this.filtre = filtre;
  }

  compterParStatut(statut: DemarcheStatut): number {
    return this.demarches.filter((d) => d.statut === statut).length;
  }

  getClasseStatut(statut: DemarcheStatut): string {
    switch (statut) {
      case 'A_FAIRE': return 'status-todo';
      case 'EN_COURS': return 'status-progress';
      case 'TERMINEE': return 'status-complete';
      default: return 'status-todo';
    }
  }

  estEnMiseAJour(sd: StudentDemarche): boolean {
    return this.enMiseAJour.has(sd.id);
  }

  consulterDemarche(sd: StudentDemarche): void {
    this.router.navigate(['/demarches', sd.demarche.id]);
  }

  // ==========================================================
  // ACTIONS
  // ==========================================================

  /** « Marquer comme terminée » : 100 %. */
  terminer(sd: StudentDemarche): void {
    this.changerStatut(sd, 'TERMINEE', this.langue.t('suivis.bravo'));
  }

  /** Changement libre via la liste déroulante. */
  onStatutChoisi(sd: StudentDemarche, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const statut = select.value as DemarcheStatut;

    if (statut === sd.statut) {
      return;
    }

    this.changerStatut(sd, statut, this.langue.t('suivis.statutMisAJour', { statut: this.libelleStatut(statut) }));
  }

  /**
   * « Retirer » : supprime le suivi. La démarche reste disponible
   * dans /demarches et peut être recommencée plus tard.
   */
  retirer(sd: StudentDemarche): void {
    if (this.enMiseAJour.has(sd.id)
        || !confirm(this.langue.t('suivis.retirer.confirmer', { titre: sd.demarche.titre }))) {
      return;
    }

    this.actionMessage = '';
    this.actionError = '';
    this.enMiseAJour.add(sd.id);

    this.service.retirer(sd.id).subscribe({
      next: () => {
        this.enMiseAJour.delete(sd.id);
        this.demarches = this.demarches.filter((d) => d.id !== sd.id);
        this.actionMessage = this.langue.t('suivis.retiree');
      },
      error: (error: HttpErrorResponse) => {
        this.enMiseAJour.delete(sd.id);
        this.actionError = error.error?.message || this.langue.t('suivis.erreur.retirer');
      }
    });
  }

  /** « J'ai envoyé mes documents » : 50 %. */
  confirmerDocuments(sd: StudentDemarche): void {
    this.executer(
      sd,
      this.service.confirmerDocuments(sd.id, true),
      this.langue.t('suivis.documentsOk')
    );
  }

  ouvrirAvis(sd: StudentDemarche): void {
    this.actionMessage = '';
    this.actionError = '';
    this.avisPour = sd;
  }

  fermerAvis(): void {
    this.avisPour = null;
  }

  onAvisEnregistre(): void {
    if (this.avisPour) {
      this.avisPour.avisDonne = true;
    }
    this.avisPour = null;
    this.actionMessage = this.langue.t('demarches.avisMerci');
  }

  private changerStatut(sd: StudentDemarche, statut: DemarcheStatut, succes: string): void {
    this.executer(sd, this.service.changerStatut(sd.id, statut), succes);
  }

  private executer(
    sd: StudentDemarche,
    requete: ReturnType<StudentDemarcheService['changerStatut']>,
    succes: string
  ): void {
    if (this.enMiseAJour.has(sd.id)) {
      return;
    }

    this.actionMessage = '';
    this.actionError = '';
    this.enMiseAJour.add(sd.id);

    requete.subscribe({
      next: (misAJour) => {
        this.enMiseAJour.delete(sd.id);
        this.remplacer(sd, misAJour);
        this.actionMessage = succes;
      },
      error: (error: HttpErrorResponse) => {
        this.enMiseAJour.delete(sd.id);
        this.actionError = error.error?.message || this.langue.t('suivis.erreur.maj');
      }
    });
  }

  /** Remplace la démarche par la version renvoyée par l'API. */
  private remplacer(ancien: StudentDemarche, nouveau: StudentDemarche): void {
    const fusion: StudentDemarche = {
      ...ancien,
      ...nouveau,
      demarche: nouveau?.demarche ?? ancien.demarche
    };
    this.demarches = this.demarches.map((d) => (d.id === ancien.id ? fusion : d));
  }
}
