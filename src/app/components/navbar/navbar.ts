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

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
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

  userName = 'Étudiant';
  userInitial = 'É';

  /** Vrai si le menu burger (mobile) est déplié. */
  menuOpen = false;

  /** Destination du clic sur l'avatar : /admin pour un admin, /dashboard sinon. */
  get profileRoute(): string {
    return this.isAdmin ? '/admin' : '/dashboard';
  }

  /** Lien « Notifications » : page d'invitation à se connecter pour un visiteur. */
  get notificationsRoute(): string {
    return this.isLoggedIn ? '/dashboard/notifications' : '/notifications';
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
      this.userName = 'Étudiant';
      this.userInitial = 'É';
      return;
    }

    const name = this.isAdmin
      ? 'Admin'
      : (localStorage.getItem('prenom') || localStorage.getItem('userName'));

    if (name) {
      this.userName = name;
      this.userInitial = name.charAt(0).toUpperCase();
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
