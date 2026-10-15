// ============================================================
// NAVBAR - MyStudentGuide
// ============================================================
//
// Barre de navigation principale des pages publiques.
//
// - Tout le monde (inscrit ou non) : "Accueil", "Mes démarches",
//                                "Documents" et "Notifications".
// - Aucun utilisateur connecté : + "Se connecter".
// - Étudiant connecté          : + profil et déconnexion.
// - Administrateur connecté    : même chose, mais le profil mène à /admin.
//
// L'état de connexion est relu à CHAQUE navigation : la navbar reste donc
// à jour après une connexion, une déconnexion ou l'expiration du token
// (avant, il n'était lu qu'une seule fois à la création du composant).
// ============================================================

import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';
import { Subscription, filter } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { TPipe } from '../../i18n/t.pipe';
import { LangueSwitch } from '../langue-switch/langue-switch';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    TPipe,
    LangueSwitch
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar implements OnInit, OnDestroy {

  private router = inject(Router);
  private authService = inject(AuthService);

  /** Vrai si un utilisateur possède une session valide (token non expiré). */
  isLoggedIn = false;

  /** Vrai si cet utilisateur est administrateur. */
  isAdmin = false;

  /** Prénom affiché ; vide s'il n'est pas connu (« Étudiant » / « Student » est alors affiché). */
  userName = '';

  /** Vrai si le menu burger (mobile) est déplié. */
  menuOpen = false;

  /** Destination du clic sur l'avatar : /admin pour un admin, /dashboard sinon. */
  get profileRoute(): string {
    return this.isAdmin ? '/admin' : '/dashboard';
  }

  /**
   * Lien « Notifications » : celles de l'administration pour un admin,
   * de l'espace étudiant pour un étudiant, page d'invitation pour un visiteur.
   */
  get notificationsRoute(): string {
    if (!this.isLoggedIn) {
      return '/notifications';
    }
    return this.isAdmin ? '/admin/notifications' : '/dashboard/notifications';
  }

  private navigationSubscription?: Subscription;

  ngOnInit(): void {
    this.refreshSession();

    this.navigationSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.refreshSession();
        this.closeMenu();
      });
  }

  ngOnDestroy(): void {
    this.navigationSubscription?.unsubscribe();
  }

  /** Relit la session et met à jour le nom affiché. */
  private refreshSession(): void {

    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.isLoggedIn && this.authService.isAdmin();

    if (!this.isLoggedIn) {
      this.userName = '';
      return;
    }

    const name = this.isAdmin
      ? 'Admin'
      : (localStorage.getItem('prenom') || localStorage.getItem('userName'));

    if (name) {
      this.userName = name;
    }
  }

  /** Ouvre ou ferme le menu burger (mobile). */
  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  /** Referme le menu burger. */
  closeMenu(): void {
    this.menuOpen = false;
  }

  /** Déconnecte l'utilisateur puis revient sur l'accueil. */
  logout(): void {
    this.closeMenu();
    this.authService.logout();

    // Données d'affichage ajoutées par la page "Mon compte".
    localStorage.removeItem('prenom');
    localStorage.removeItem('userName');

    this.refreshSession();
    this.router.navigate(['/home']);
  }
}
