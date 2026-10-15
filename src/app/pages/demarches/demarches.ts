// ============================================================
// PAGE « MES DÉMARCHES » (/demarches)
// ============================================================
//
// Affiche TOUTES les démarches de l'application, pour tout le monde
// (visiteur, étudiant, administrateur).
//
// - Visiteur / administrateur : peut consulter (« Voir plus »),
//   mais le bouton « Commencer » est désactivé.
// - Étudiant connecté : « Commencer » crée son suivi (statut EN_COURS).
//   La démarche apparaît alors dans « Mes démarches » de son dashboard.
//
// Il n'y a plus d'attribution selon le profil : l'étudiant reçoit
// des suggestions sous forme de notifications.
// ============================================================

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of, catchError } from 'rxjs';

import { AvisForm } from '../../components/avis-form/avis-form';
import { AuthService } from '../../services/auth.service';
import { rechercherDemarches } from '../../utils/recherche';
import {
  Demarche,
  StudentDemarche,
  StudentDemarcheService
} from '../../services/student-demarche.service';


@Component({
  selector: 'app-demarches',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AvisForm
  ],
  templateUrl: './demarches.html',
  styleUrl: './demarches.scss'
})
export class Demarches implements OnInit {

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private studentDemarcheService = inject(StudentDemarcheService);


  // ============================================================
  // DONNÉES
  // ============================================================

  /** Toutes les démarches de l'application. */
  demarches: Demarche[] = [];

  /**
   * Suivis de l'étudiant connecté, indexés par id de démarche.
   * Vide pour un visiteur ou un administrateur.
   */
  suivis = new Map<number, StudentDemarche>();

  /** Catégorie sélectionnée dans le filtre (null = toutes). */
  categorieFiltre: number | null = null;

  /** Texte de la recherche, gardé dans l'adresse (/demarches?q=...). */
  recherche = '';

  isLoading = false;
  errorMessage = '';

  /** Seul un étudiant connecté peut commencer une démarche. */
  peutCommencer = false;

  /** Visiteur non connecté (affiche l'invitation à se connecter). */
  estVisiteur = true;

  /** Démarche en cours d'envoi (évite les doubles clics). */
  updatingId: number | null = null;

  /** Messages affichés après une action. */
  actionMessage = '';
  actionError = '';

  /** Suivi pour lequel la fenêtre d'avis est ouverte. */
  avisPour: StudentDemarche | null = null;


  // ============================================================
  // INITIALISATION
  // ============================================================

  ngOnInit(): void {
    const connecte = this.authService.isLoggedIn();
    this.estVisiteur = !connecte;
    this.peutCommencer = connecte && !this.authService.isAdmin();
    this.recherche = this.route.snapshot.queryParamMap.get('q') ?? '';

    this.loadDemarches();
  }


  /**
   * Charge toutes les démarches et, pour un étudiant connecté,
   * celles qu'il a déjà commencées (pour afficher « Continuer »).
   */
  loadDemarches(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Une erreur sur les suivis ne doit pas empêcher d'afficher les démarches.
    const suivis$ = this.peutCommencer
      ? this.studentDemarcheService.getMesDemarches()
          .pipe(catchError(() => of([] as StudentDemarche[])))
      : of([] as StudentDemarche[]);

    forkJoin({
      demarches: this.studentDemarcheService.getToutesLesDemarches(),
      suivis: suivis$
    }).subscribe({
      next: ({ demarches, suivis }) => {
        this.demarches = demarches;
        this.suivis = new Map(suivis.map((sd) => [sd.demarche.id, sd]));
        this.isLoading = false;

        // Arrivée depuis la recherche de l'accueil : on descend jusqu'aux résultats.
        if (this.recherche) {
          setTimeout(() =>
            document.querySelector('.search-bar')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          );
        }
      },
      error: () => {
        this.demarches = [];
        this.isLoading = false;
        this.errorMessage = 'Impossible de charger les démarches.';
      }
    });
  }


  // ============================================================
  // FILTRE PAR CATÉGORIE
  // ============================================================

  /** Catégories présentes dans la liste (sans doublon). */
  get categories(): { id: number; nom: string }[] {
    const parId = new Map<number, { id: number; nom: string }>();
    for (const demarche of this.demarches) {
      if (demarche.categorie) {
        parId.set(demarche.categorie.id, demarche.categorie);
      }
    }
    return [...parId.values()];
  }

  /** Démarches de la catégorie choisie qui correspondent à la recherche, les plus pertinentes d'abord. */
  get demarchesFiltrees(): Demarche[] {
    const parCategorie = this.categorieFiltre === null
      ? this.demarches
      : this.demarches.filter((d) => d.categorie?.id === this.categorieFiltre);
    return rechercherDemarches(parCategorie, this.recherche);
  }

  choisirCategorie(id: number | null): void {
    this.categorieFiltre = id;
  }


  // ============================================================
  // RECHERCHE
  // ============================================================

  rechercher(texte: string): void {
    this.recherche = texte;

    // L'adresse suit la recherche sans créer d'entrée d'historique à chaque lettre.
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: texte.trim() || null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  effacerFiltres(): void {
    this.categorieFiltre = null;
    this.rechercher('');
  }


  // ============================================================
  // ÉTAT D'UNE DÉMARCHE POUR L'ÉTUDIANT
  // ============================================================

  suiviDe(demarche: Demarche): StudentDemarche | undefined {
    return this.suivis.get(demarche.id);
  }


  // ============================================================
  // ACTIONS
  // ============================================================

  voirPlus(demarche: Demarche): void {
    this.router.navigate(['/demarches', demarche.id]);
  }

  /**
   * « Commencer » : crée le suivi (EN_COURS) pour l'étudiant connecté.
   * La démarche apparaît ensuite dans « Mes démarches » du dashboard.
   */
  commencer(demarche: Demarche): void {
    if (!this.peutCommencer || this.updatingId !== null) {
      return;
    }

    this.updatingId = demarche.id;
    this.actionMessage = '';
    this.actionError = '';

    this.studentDemarcheService.commencer(demarche.id).subscribe({
      next: (suivi) => {
        this.updatingId = null;
        this.suivis.set(demarche.id, { ...suivi, demarche: suivi?.demarche ?? demarche });
        this.actionMessage =
          `« ${demarche.titre} » a été ajoutée à vos démarches. ` +
          'Suivez votre progression depuis « Mon espace ».';
      },
      error: (error: HttpErrorResponse) => {
        this.updatingId = null;
        this.actionError =
          error.error?.message || 'Impossible de commencer cette démarche.';
      }
    });
  }

  /** « Continuer » : ouvre le suivi détaillé dans le dashboard. */
  continuer(): void {
    this.router.navigate(['/dashboard/suivis']);
  }


  // ============================================================
  // DONNER MON AVIS (démarche terminée)
  // ============================================================

  ouvrirAvis(suivi: StudentDemarche): void {
    this.actionMessage = '';
    this.actionError = '';
    this.avisPour = suivi;
  }

  fermerAvis(): void {
    this.avisPour = null;
  }

  onAvisEnregistre(): void {
    if (this.avisPour) {
      this.avisPour.avisDonne = true;
    }
    this.avisPour = null;
    this.actionMessage =
      "Merci ! Votre avis est maintenant visible sur la page d'accueil.";
  }
}
