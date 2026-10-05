// Importe les fonctionnalités nécessaires d'Angular pour créer un composant.
import { Component, OnInit } from '@angular/core';

// Permet d'effectuer des requêtes HTTP vers notre API Spring Boot.
import { HttpClient, HttpHeaders } from '@angular/common/http';

// Permet de naviguer vers une autre page de l'application.
import { Router } from '@angular/router';

// Permet d'utiliser les directives Angular classiques dans le HTML
// comme *ngIf, *ngFor et les pipes.
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

// Interface représentant une démarche disponible dans MyStudentGuide.
interface Demarche {
  id: number;
  titre: string;
  description?: string;
  categorie?: {
    id: number;
    nom: string;
  };
}

// Interface représentant une démarche attribuée à l'étudiant.
// Elle correspond aux données renvoyées par l'API StudentDemarche.
interface StudentDemarche {
  id: number;
  demarche: Demarche;

  // Statut actuel de la démarche.
  // Les valeurs utilisées par le backend sont :
  // A_FAIRE, EN_COURS et TERMINE.
  statut: 'A_FAIRE' | 'EN_COURS' | 'TERMINE';

  // Permet de conserver la date de début si elle existe.
  dateDebut?: string;

  // Permet de conserver la date de fin si elle existe.
  dateFin?: string;
}

@Component({
  selector: 'app-suivis-demarches',

  // Le composant est autonome, donc ses dépendances
  // sont directement déclarées ici.
  standalone: true,

  // CommonModule permet notamment d'utiliser *ngIf et *ngFor
  // dans le fichier HTML.
  imports: [
    CommonModule
  ],

  // Fichiers HTML et SCSS associés à ce composant.
  templateUrl: './suivis-demarches.html',
  styleUrl: './suivis-demarches.scss'
})
export class SuivisDemarches implements OnInit {

  // URL de base de notre API Spring Boot.
  private readonly apiUrl = environment.apiUrl;

  // Liste des démarches attribuées à l'étudiant connecté.
  demarches: StudentDemarche[] = [];

  // Permet d'afficher un état de chargement pendant
  // la récupération des données depuis l'API.
  loading = true;

  // Permet d'afficher un message si une erreur survient.
  errorMessage = '';

  // Filtre actuellement sélectionné.
  // "TOUTES" permet d'afficher toutes les démarches.
  filtre: 'TOUTES' | 'A_FAIRE' | 'EN_COURS' | 'TERMINE' = 'TOUTES';

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

  /**
   * Méthode exécutée automatiquement lors du chargement
   * du composant.
   *
   * Elle permet de récupérer les démarches de l'étudiant connecté.
   */
  ngOnInit(): void {
    this.chargerDemarches();
  }

  /**
   * Récupère les démarches associées au profil de l'étudiant.
   *
   * Étapes :
   * 1. Vérifier que l'utilisateur possède un token.
   * 2. Récupérer son profil étudiant.
   * 3. Utiliser l'identifiant du profil pour récupérer ses démarches.
   */
  chargerDemarches(): void {
    const token = this.getToken();

    // Si aucun token n'est présent, l'utilisateur n'est pas connecté.
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    // Première requête : récupération du profil étudiant connecté.
    this.http
      .get<any>(
        `${this.apiUrl}/student-profiles/me`,
        {
          headers: this.getHeaders()
        }
      )
      .subscribe({
        next: (profile) => {

          // Vérifie que le profil existe bien.
          if (!profile || !profile.id) {
            this.loading = false;
            this.router.navigate(['/dashboard/profile']);
            return;
          }

          // Deuxième requête : récupération des démarches
          // associées au profil de l'étudiant.
          this.http
            .get<StudentDemarche[]>(
              `${this.apiUrl}/student-demarches/student/${profile.id}`,
              {
                headers: this.getHeaders()
              }
            )
            .subscribe({
              next: (demarches) => {

                // Stocke les démarches récupérées.
                this.demarches = demarches ?? [];

                this.loading = false;
              },

              error: (error) => {
                console.error(
                  'Erreur lors du chargement des démarches :',
                  error
                );

                this.loading = false;
                this.errorMessage =
                  'Impossible de récupérer vos démarches pour le moment.';
              }
            });
        },

        error: (error) => {
          console.error(
            'Erreur lors de la récupération du profil étudiant :',
            error
          );

          this.loading = false;

          // Si le profil n'existe pas encore,
          // l'utilisateur doit compléter son profil.
          if (error.status === 404) {
            this.router.navigate(['/dashboard/profile']);
            return;
          }

          // Si le token n'est plus valide,
          // on le supprime et on redirige vers la connexion.
          if (error.status === 401 || error.status === 403) {
            localStorage.removeItem('token');
            this.router.navigate(['/login']);
            return;
          }

          this.errorMessage =
            'Impossible de récupérer votre profil pour le moment.';
        }
      });
  }

  /**
   * Retourne la liste des démarches correspondant
   * au filtre actuellement sélectionné.
   *
   * Cette méthode sera utilisée directement dans le HTML
   * pour afficher les démarches filtrées.
   */
  get demarchesFiltrees(): StudentDemarche[] {
    // Si le filtre est "TOUTES", on retourne toutes les démarches.
    if (this.filtre === 'TOUTES') {
      return this.demarches;
    }

    // Sinon, on retourne uniquement les démarches
    // correspondant au statut sélectionné.
    return this.demarches.filter(
      (demarche) => demarche.statut === this.filtre
    );
  }

  /**
   * Change le filtre actuellement sélectionné.
   *
   * Exemple :
   * sélectionner "EN_COURS" affiche uniquement
   * les démarches en cours.
   */
  changerFiltre(
    filtre: 'TOUTES' | 'A_FAIRE' | 'EN_COURS' | 'TERMINE'
  ): void {
    this.filtre = filtre;
  }

  /**
   * Retourne le nombre de démarches correspondant
   * à un statut donné.
   *
   * Cette méthode pourra être utilisée pour afficher
   * le nombre de démarches dans chaque filtre.
   */
  compterParStatut(
    statut: 'A_FAIRE' | 'EN_COURS' | 'TERMINE'
  ): number {
    return this.demarches.filter(
      (demarche) => demarche.statut === statut
    ).length;
  }

  /**
   * Retourne le pourcentage de progression
   * correspondant au statut d'une démarche.
   *
   * À faire  → 0 %
   * En cours → 50 %
   * Terminée → 100 %
   */
  getProgression(statut: StudentDemarche['statut']): number {
    switch (statut) {
      case 'A_FAIRE':
        return 0;

      case 'EN_COURS':
        return 50;

      case 'TERMINE':
        return 100;

      default:
        return 0;
    }
  }

  /**
   * Retourne le libellé français correspondant
   * au statut technique envoyé par le backend.
   */
  getLibelleStatut(statut: StudentDemarche['statut']): string {
    switch (statut) {
      case 'A_FAIRE':
        return 'À faire';

      case 'EN_COURS':
        return 'En cours';

      case 'TERMINE':
        return 'Terminée';

      default:
        return 'Inconnu';
    }
  }

  /**
   * Retourne la classe CSS correspondant au statut.
   *
   * Elle permettra au SCSS d'afficher une couleur
   * différente pour chaque état.
   */
  getClasseStatut(statut: StudentDemarche['statut']): string {
    switch (statut) {
      case 'A_FAIRE':
        return 'status-todo';

      case 'EN_COURS':
        return 'status-progress';

      case 'TERMINE':
        return 'status-complete';

      default:
        return '';
    }
  }

  /**
   * Permet d'ouvrir la démarche sélectionnée.
   *
   * Pour l'instant, on prépare simplement la navigation
   * vers la page de détail.
   *
   * La route pourra être adaptée lorsque nous créerons
   * la page détail d'une démarche.
   */
  consulterDemarche(studentDemarche: StudentDemarche): void {
    this.router.navigate([
      '/dashboard/demarches',
      studentDemarche.demarche.id
    ]);
  }

  /**
   * Récupère le token JWT enregistré après la connexion.
   */
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Prépare les headers HTTP avec le token JWT.
   *
   * Le backend Spring Security utilise ce token
   * pour identifier l'étudiant connecté.
   */
  private getHeaders(): HttpHeaders {
    const token = this.getToken();

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
}