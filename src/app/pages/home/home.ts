import { Component, OnInit, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { AvisPublics } from '../../components/avis-publics/avis-publics';

/**
 * Page d'accueil de MyStudentGuide (route : /home).
 *
 * Elle s'adapte à la situation du visiteur :
 *
 * - visiteur non connecté : message de bienvenue + boutons
 *   « Se connecter » et « Créer un compte » ;
 * - étudiant connecté : « Bonjour <prénom> » + bouton pour
 *   continuer son parcours.
 *
 * (Avant, un visiteur non connecté voyait « Bonjour Étudiant 👋 ».)
 *
 * La navbar et le footer sont fournis par PublicLayout :
 * ils ne sont pas importés ici.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, AvisPublics],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {

  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);

  /** Vrai si le visiteur possède une session valide. */
  isLoggedIn = false;

  /** Prénom affiché dans le titre (étudiant connecté). */
  userName = 'Étudiant';

  /** Vrai pendant la vérification du profil (évite les doubles clics). */
  startingJourney = false;

  /**
   * Grands thèmes de démarches affichés en petites cartes.
   * Chaque thème regroupe plusieurs démarches (ex. : « Santé »
   * = Sécurité sociale, mutuelle, médecin traitant).
   */
  readonly themes: { icon: string; titre: string; couleur: string; demarches: string[] }[] = [
    {
      icon: '🛂',
      titre: 'Séjour & visa',
      couleur: 'blue',
      demarches: ['Validation du VLS-TS', 'Titre de séjour', 'Renouvellement']
    },
    {
      icon: '🩺',
      titre: 'Santé',
      couleur: 'red',
      demarches: ['Sécurité sociale (Ameli)', 'Mutuelle', 'Médecin traitant']
    },
    {
      icon: '🏠',
      titre: 'Logement',
      couleur: 'green',
      demarches: ['Logement CROUS', 'Aide au logement (CAF)', 'Assurance habitation']
    },
    {
      icon: '🎓',
      titre: 'Études',
      couleur: 'purple',
      demarches: ['Inscription universitaire', 'CVEC', 'Bourses']
    },
    {
      icon: '💶',
      titre: 'Banque & budget',
      couleur: 'orange',
      demarches: ['Ouverture d\'un compte', 'RIB', 'Aides financières']
    },
    {
      icon: '💼',
      titre: 'Emploi',
      couleur: 'blue',
      demarches: ['Job étudiant', 'Droit au travail', 'Stage']
    },
    {
      icon: '🚆',
      titre: 'Transports',
      couleur: 'green',
      demarches: ['Abonnement étudiant', 'Carte Avantage Jeune', 'Vélo en libre-service']
    },
    {
      icon: '📱',
      titre: 'Vie quotidienne',
      couleur: 'red',
      demarches: ['Forfait mobile', 'Permis de conduire', 'Déclaration d\'impôts']
    }
  ];

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();

    if (this.isLoggedIn) {
      this.loadUserName();
    }
  }

  /** Prénom enregistré par la page « Mon compte ». */
  private loadUserName(): void {
    const name =
      localStorage.getItem('prenom') ||
      localStorage.getItem('userName');

    if (name) {
      this.userName = name;
    }
  }

  /**
   * Bouton « Commencer » / « Continuer mon parcours ».
   *
   * 1. pas connecté                → /login
   * 2. connecté sans profil (404)  → /dashboard/profile
   * 3. connecté avec profil        → /dashboard/demarches
   *
   * Le token est ajouté automatiquement par l'interceptor HTTP,
   * et un 401 (session expirée) y est aussi géré.
   */
  startJourney(): void {

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.startingJourney) {
      return;
    }

    this.startingJourney = true;

    this.http
      .get<{ id?: number }>(`${environment.apiUrl}/student-profiles/me`)
      .subscribe({

        next: (profile) => {
          this.startingJourney = false;

          this.router.navigate([
            profile && profile.id
              ? '/dashboard/demarches'
              : '/dashboard/profile'
          ]);
        },

        error: (error: HttpErrorResponse) => {
          this.startingJourney = false;

          // Aucun profil encore créé : on l'invite à le compléter.
          if (error.status === 404) {
            this.router.navigate(['/dashboard/profile']);
          }

          // 401 : déjà géré par l'interceptor (déconnexion + /login).
        }
      });
  }

  /** Recherche du hero : ouvre /demarches?q=... (ou toutes les démarches si vide). */
  rechercher(event: Event, texte: string): void {
    event.preventDefault();

    const q = texte.trim();
    this.router.navigate(['/demarches'], { queryParams: q ? { q } : {} });
  }
}
