import { Component, OnInit, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { AvisPublics } from '../../components/avis-publics/avis-publics';
import { TPipe } from '../../i18n/t.pipe';
import { Cle } from '../../i18n/textes';

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
  imports: [RouterLink, AvisPublics, TPipe],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {

  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);

  /** Vrai si le visiteur possède une session valide. */
  isLoggedIn = false;

  /**
   * Vrai pour un administrateur venu « voir le site » : l'accueil lui propose
   * de revenir à l'administration au lieu du parcours étudiant.
   */
  isAdmin = false;

  /** Prénom affiché dans le titre (étudiant connecté). */
  userName = '';

  /** Vrai pendant la vérification du profil (évite les doubles clics). */
  startingJourney = false;

  /**
   * Grands thèmes de démarches affichés en petites cartes.
   * Chaque thème regroupe plusieurs démarches (ex. : « Santé »
   * = Sécurité sociale, mutuelle, médecin traitant).
   */
  readonly themes: { icon: string; titre: Cle; couleur: string; demarches: Cle[] }[] = [
    {
      icon: '🛂',
      titre: 'accueil.theme.sejour',
      couleur: 'blue',
      demarches: ['accueil.theme.sejour.1', 'accueil.theme.sejour.2', 'accueil.theme.sejour.3']
    },
    {
      icon: '🩺',
      titre: 'accueil.theme.sante',
      couleur: 'red',
      demarches: ['accueil.theme.sante.1', 'accueil.theme.sante.2', 'accueil.theme.sante.3']
    },
    {
      icon: '🏠',
      titre: 'accueil.theme.logement',
      couleur: 'green',
      demarches: ['accueil.theme.logement.1', 'accueil.theme.logement.2', 'accueil.theme.logement.3']
    },
    {
      icon: '🎓',
      titre: 'accueil.theme.etudes',
      couleur: 'purple',
      demarches: ['accueil.theme.etudes.1', 'accueil.theme.etudes.2', 'accueil.theme.etudes.3']
    },
    {
      icon: '💶',
      titre: 'accueil.theme.banque',
      couleur: 'orange',
      demarches: ['accueil.theme.banque.1', 'accueil.theme.banque.2', 'accueil.theme.banque.3']
    },
    {
      icon: '💼',
      titre: 'accueil.theme.emploi',
      couleur: 'blue',
      demarches: ['accueil.theme.emploi.1', 'accueil.theme.emploi.2', 'accueil.theme.emploi.3']
    },
    {
      icon: '🚆',
      titre: 'accueil.theme.transports',
      couleur: 'green',
      demarches: ['accueil.theme.transports.1', 'accueil.theme.transports.2', 'accueil.theme.transports.3']
    },
    {
      icon: '📱',
      titre: 'accueil.theme.quotidien',
      couleur: 'red',
      demarches: ['accueil.theme.quotidien.1', 'accueil.theme.quotidien.2', 'accueil.theme.quotidien.3']
    }
  ];

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.isLoggedIn && this.authService.isAdmin();

    if (this.isLoggedIn && !this.isAdmin) {
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

    // Le parcours étudiant ne concerne pas l'administrateur.
    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin']);
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
