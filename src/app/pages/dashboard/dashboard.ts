// Importe le décorateur Component et l'interface OnInit d'Angular.
import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { Subscription, filter } from 'rxjs';

// Permet d'utiliser les fonctionnalités communes d'Angular
// dans le template HTML.
import { CommonModule } from '@angular/common';

// Importe les éléments nécessaires à la navigation Angular.
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

// Importe les classes nécessaires pour effectuer
// les requêtes HTTP vers l'API Spring Boot.
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PrefectureCard } from '../../components/prefecture-card/prefecture-card';
import {
  StudentDemarche,
  StudentDemarcheService,
  dateLimiteDe
} from '../../services/student-demarche.service';
import { telechargerIcs } from '../../utils/calendrier';
import { allerAuContenu } from '../../utils/aller-au-contenu';
import { LangueService } from '../../i18n/langue.service';
import { DateLPipe, TPipe, TcPipe } from '../../i18n/t.pipe';
import { LangueSwitch } from '../../components/langue-switch/langue-switch';
import { Icone } from '../../components/icone/icone';


/** Notification de suggestion de démarche (envoyée par un administrateur). */
interface SuggestionNotification {
  id: number;
  titre: string;
  message: string;
  demarcheId: number;
  action?: string | null;
  actionTraitee?: boolean | null;
}


/**
 * Composant principal de l'espace personnel étudiant.
 *
 * Le Dashboard contient :
 *
 * - la sidebar de l'espace personnel ;
 * - la page "Mon espace" ;
 * - le RouterOutlet permettant d'afficher les différentes
 *   pages du Dashboard.
 *
 * Les pages accessibles depuis la sidebar sont :
 *
 * /dashboard
 * /dashboard/profile
 * /dashboard/suivis
 * /dashboard/documents
 * /dashboard/notifications
 * /dashboard/account
 */
@Component({
  // Nom utilisé pour identifier le composant.
  selector: 'app-dashboard',

  // Le composant est autonome.
  standalone: true,

  // Modules et directives utilisés dans le HTML.
  imports: [
    Icone,
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    PrefectureCard,
    TPipe,
    TcPipe,
    DateLPipe,
    LangueSwitch
  ],

  // Template HTML du Dashboard.
  templateUrl: './dashboard.html',

  // Feuille de style du Dashboard.
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit, OnDestroy {

  protected readonly allerAuContenu = allerAuContenu;

  // ==========================================================
  // PROGRESSION DES DÉMARCHES (page « Mon espace »)
  // ==========================================================

  private studentDemarcheService = inject(StudentDemarcheService);
  private langue = inject(LangueService);
  private navigationSub?: Subscription;

  /** Démarches commencées par l'étudiant (pour la barre de progression). */
  mesDemarches: StudentDemarche[] = [];

  /** Progression globale en % (moyenne des démarches concernées). */
  progressionGlobale = 0;

  progressionChargee = false;

  get demarchesEnCours(): number {
    return this.mesDemarches.filter((d) => d.statut === 'EN_COURS').length;
  }

  get demarchesTerminees(): number {
    return this.mesDemarches.filter((d) => d.statut === 'TERMINEE').length;
  }

  /**
   * Recharge la progression. Appelée à l'ouverture de « Mon espace »
   * et à chaque retour sur cette page (après avoir commencé ou
   * terminé une démarche, la barre est donc à jour).
   */
  loadProgression(): void {
    this.studentDemarcheService.getMesDemarches().subscribe({
      next: (demarches) => {
        this.mesDemarches = demarches ?? [];
        this.progressionGlobale =
          this.studentDemarcheService.progressionGlobale(this.mesDemarches);
        this.progressionChargee = true;
      },
      error: () => {
        // Pas de profil (404) ou erreur réseau : la carte reste masquée.
        this.mesDemarches = [];
        this.progressionChargee = true;
      }
    });

    // Autres blocs de la page « Mon espace ».
    this.loadSuggestions();
    this.loadProfilComplet();
  }


  // ==========================================================
  // PAGE « MON ESPACE » : BLOCS COMPLÉMENTAIRES
  // ==========================================================

  /** Date du jour, affichée au-dessus du message de bienvenue. */
  readonly today = new Date();

  /** Suggestions de démarches encore ouvertes (notifications). */
  suggestions: SuggestionNotification[] = [];

  /** Suggestion en cours de traitement (« Commencer »). */
  suggestionEnCours: number | null = null;
  suggestionErreur = '';

  /** null tant que le profil n'est pas chargé. */
  profilComplet: boolean | null = null;

  /** Démarches en cours, les plus avancées en premier (3 max). */
  get demarchesActives(): StudentDemarche[] {
    return this.mesDemarches
      .filter((d) => d.statut === 'EN_COURS')
      .sort((a, b) => this.progression(b) - this.progression(a))
      .slice(0, 3);
  }

  /** Les 3 dates limites à venir les plus proches. */
  get prochainesEcheances(): { sd: StudentDemarche; date: string; jours: number }[] {
    return this.echeancesAVenir().slice(0, 3);
  }

  /**
   * Télécharge toutes les dates limites à venir au format agenda (.ics),
   * avec un rappel une semaine avant et la veille.
   */
  ajouterEcheancesAgenda(): void {
    telechargerIcs('mes-dates-limites.ics', this.echeancesAVenir().map(({ sd, date }) => ({
      id: sd.demarche.id,
      titre: this.langue.contenu(sd.demarche, 'titre'),
      dateLimite: date,
      url: `${window.location.origin}/demarches/${sd.demarche.id}`
    })), this.langue.langue());
  }

  /**
   * Démarches en cours qui ont une date limite à venir, de la plus proche
   * à la plus lointaine. La date est celle de l'étudiant (calculée depuis
   * son profil) quand la démarche en a une, sinon la date générale.
   */
  private echeancesAVenir(): { sd: StudentDemarche; date: string; jours: number }[] {
    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);

    return this.mesDemarches
      .filter((sd) => sd.statut === 'EN_COURS')
      .map((sd) => ({ sd, date: dateLimiteDe(sd) }))
      .filter((e): e is { sd: StudentDemarche; date: string } => !!e.date)
      .map((e) => ({
        ...e,
        jours: Math.round((new Date(e.date).getTime() - aujourdhui.getTime()) / 86_400_000)
      }))
      .filter((e) => e.jours >= 0)
      .sort((a, b) => a.jours - b.jours);
  }

  progression(sd: StudentDemarche): number {
    return this.studentDemarcheService.progression(sd);
  }

  /** Prochaine action conseillée pour une démarche en cours. */
  prochaineEtape(sd: StudentDemarche): string {
    return sd.documentsEnvoyes
      ? this.langue.t('espace.prochaine.terminer')
      : this.langue.t('espace.prochaine.documents');
  }

  /** Suggestions envoyées par l'administration et pas encore commencées. */
  private loadSuggestions(): void {
    const userId = this.getUserId();
    const headers = this.getAuthHeaders();

    if (!userId || !headers) {
      return;
    }

    this.http.get<SuggestionNotification[]>(
      `${this.apiUrl}/notifications/user/${userId}`,
      { headers }
    ).subscribe({
      next: (notifications) => {
        this.suggestions = (notifications ?? [])
          .filter((n) => n.action === 'SUGGESTION_DEMARCHE'
            && !n.actionTraitee
            && !!n.demarcheId)
          .slice(0, 3);
      },
      error: () => {
        this.suggestions = [];
      }
    });
  }

  /** Vérifie si le profil est rempli (sinon on affiche un rappel). */
  private loadProfilComplet(): void {
    const headers = this.getAuthHeaders();

    if (!headers) {
      return;
    }

    this.http.get<{ profileCompleted?: boolean }>(
      `${this.apiUrl}/student-profiles/me`,
      { headers }
    ).subscribe({
      next: (profil) => {
        this.profilComplet = !!profil?.profileCompleted;
      },
      // 404 : aucun profil créé.
      error: () => {
        this.profilComplet = false;
      }
    });
  }

  /** « Voir plus » sur une suggestion. */
  voirSuggestion(suggestion: SuggestionNotification): void {
    this.router.navigate(['/demarches', suggestion.demarcheId]);
  }

  /** « Commencer » sur une suggestion : la démarche passe dans mes démarches. */
  commencerSuggestion(suggestion: SuggestionNotification): void {
    if (this.suggestionEnCours !== null) {
      return;
    }

    this.suggestionEnCours = suggestion.id;
    this.suggestionErreur = '';

    this.studentDemarcheService.commencer(suggestion.demarcheId).subscribe({
      next: () => {
        this.suggestionEnCours = null;
        // Recharge progression, démarches en cours et suggestions.
        this.loadProgression();
        this.loadUnreadNotifications();
      },
      error: (error) => {
        this.suggestionEnCours = null;
        this.suggestionErreur =
          error.error?.message || this.langue.t('demarches.erreurCommencer');
      }
    });
  }

  ngOnDestroy(): void {
    this.navigationSub?.unsubscribe();
  }



  // ========================================================================
  // CONFIGURATION
  // ========================================================================

  /**
   * URL de base de l'API Spring Boot.
   */
  private apiUrl = environment.apiUrl;


  // ========================================================================
  // INFORMATIONS UTILISATEUR
  // ========================================================================

  /**
   * Prénom de l'utilisateur connecté.
   *
   * Une valeur par défaut est utilisée si aucune
   * information n'est disponible.
   */
  /** Prénom de l'étudiant ; vide tant qu'il n'est pas connu. */
  userName = '';

  /** Nom affiché : le prénom, ou « Étudiant » / « Student » s'il n'est pas encore connu. */
  get nomAffiche(): string {
    return this.userName || this.langue.t('espace.etudiant');
  }


  /**
   * Nom de famille de l'utilisateur connecté.
   */
  userLastName = '';


  /**
   * Adresse email de l'utilisateur connecté.
   */
  userEmail = '';


  /**
   * Rôle de l'utilisateur connecté.
   */
  userRole = 'ETUDIANT';


  // ========================================================================
  // NOTIFICATIONS
  // ========================================================================

  /**
   * Nombre de notifications non lues.
   *
   * Cette valeur permet d'afficher le badge
   * dans la sidebar.
   */
  unreadCount = 0;


  // ========================================================================
  // CONSTRUCTEUR
  // ========================================================================

  /**
   * Constructeur du composant.
   *
   * @param http
   * Service Angular permettant de communiquer
   * avec l'API Spring Boot.
   *
   * @param router
   * Service Angular permettant de gérer
   * la navigation entre les différentes pages.
   */
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}


  // ========================================================================
  // INITIALISATION
  // ========================================================================

  /**
   * Méthode exécutée automatiquement lorsque
   * le Dashboard est chargé.
   *
   * Elle récupère :
   *
   * - les informations de l'utilisateur connecté ;
   * - le nombre de notifications non lues.
   */
  ngOnInit(): void {

    // Récupération des informations utilisateur.
    this.loadUserInformation();

    // Récupération du nombre de notifications non lues.
    this.loadUnreadNotifications();

    // Barre de progression de « Mon espace ».
    if (this.isDashboardHome()) {
      this.loadProgression();
    }

    /*
     * Le Dashboard reste affiché pendant la navigation entre ses pages :
     * on rafraîchit le compteur de notifications à chaque navigation
     * et la progression à chaque retour sur « Mon espace ».
     */
    this.navigationSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.loadUnreadNotifications();
        this.closeMobileMenu();

        if (this.isDashboardHome()) {
          this.loadProgression();
        }
      });
  }


  // ========================================================================
  // PAGE MON ESPACE
  // ========================================================================

  /**
   * Vérifie si l'utilisateur se trouve actuellement
   * sur la page principale "/dashboard".
   *
   * Cette méthode permet d'afficher le message
   * de bienvenue uniquement sur "Mon espace".
   *
   * Le message ne sera donc pas affiché lorsque
   * l'utilisateur consulte :
   *
   * /dashboard/profile
   * /dashboard/suivis
   * /dashboard/documents
   * /dashboard/notifications
   * /dashboard/account
   *
   * @returns true si l'utilisateur est sur /dashboard.
   */
  isDashboardHome(): boolean {

    return this.router.url === '/dashboard'
      || this.router.url === '/dashboard/';
  }


  // ========================================================================
  // AUTHENTIFICATION
  // ========================================================================

  /**
   * Récupère le token JWT enregistré dans
   * le localStorage.
   *
   * @returns Le token JWT ou null.
   */
  private getToken(): string | null {

    return localStorage.getItem('token');
  }


  /**
   * Récupère l'identifiant de l'utilisateur connecté.
   *
   * @returns L'identifiant utilisateur ou null.
   */
  private getUserId(): number | null {

    // Récupération de l'identifiant.
    const userId = localStorage.getItem('userId');


    // Aucun identifiant disponible.
    if (!userId) {

      return null;
    }


    // Conversion de la valeur texte en nombre.
    return Number(userId);
  }


  /**
   * Crée les headers HTTP contenant le token JWT.
   *
   * @returns Les headers HTTP ou null si aucun token
   * n'est disponible.
   */
  private getAuthHeaders(): HttpHeaders | null {

    // Récupération du token.
    const token = this.getToken();


    // Aucun token disponible.
    if (!token) {

      return null;
    }


    // Création de l'en-tête Authorization.
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }


  // ========================================================================
  // INFORMATIONS UTILISATEUR
  // ========================================================================

  /**
   * Récupère les informations de l'utilisateur connecté.
   *
   * Les informations du localStorage sont utilisées
   * immédiatement.
   *
   * Ensuite, l'API /users/me est appelée pour récupérer
   * les informations les plus récentes.
   */
  loadUserInformation(): void {

    // Récupération du prénom depuis le localStorage.
    const prenom = localStorage.getItem('prenom');

    // Récupération du nom depuis le localStorage.
    const nom = localStorage.getItem('nom');

    // Récupération de l'email depuis le localStorage.
    const email = localStorage.getItem('email');


    // Si un prénom existe, on l'affiche.
    if (prenom) {

      this.userName = prenom;
    }


    // Si un nom existe, on le conserve.
    if (nom) {

      this.userLastName = nom;
    }


    // Si un email existe, on l'affiche.
    if (email) {

      this.userEmail = email;
    }


    // Création des headers contenant le JWT.
    const headers = this.getAuthHeaders();


    // Si aucun token n'existe,
    // on conserve les informations du localStorage.
    if (!headers) {

      return;
    }


    /**
     * Récupération de l'utilisateur connecté
     * depuis le backend.
     */
    this.http.get<any>(
      `${this.apiUrl}/users/me`,
      { headers }
    ).subscribe({

      /**
       * Requête réussie.
       */
      next: (user) => {

        // Mise à jour du prénom.
        if (user.prenom) {

          this.userName = user.prenom;

          localStorage.setItem(
            'prenom',
            user.prenom
          );
        }


        // Mise à jour du nom.
        if (user.nom) {

          this.userLastName = user.nom;

          localStorage.setItem(
            'nom',
            user.nom
          );
        }


        // Mise à jour de l'email.
        if (user.email) {

          this.userEmail = user.email;

          localStorage.setItem(
            'email',
            user.email
          );
        }


        // Mise à jour du rôle.
        if (user.role) {

          this.userRole = user.role;
        }
      },


      /**
       * En cas d'erreur, les informations
       * du localStorage restent utilisées.
       */
      error: (error) => {

        console.error(
          'Erreur lors du chargement des informations utilisateur :',
          error
        );
      }
    });
  }


  // ========================================================================
  // NOTIFICATIONS
  // ========================================================================

  /**
   * Récupère le nombre de notifications non lues.
   */
  loadUnreadNotifications(): void {

    // Récupération du token.
    const token = this.getToken();

    // Récupération de l'identifiant utilisateur.
    const userId = this.getUserId();


    // Si le token ou l'identifiant est absent,
    // aucune requête n'est effectuée.
    if (!token || !userId) {

      return;
    }


    // Création des headers contenant le JWT.
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });


    /**
     * Appel de l'API permettant de récupérer
     * le nombre de notifications non lues.
     */
    this.http.get<number>(
      `${this.apiUrl}/notifications/user/${userId}/unread/count`,
      { headers }
    ).subscribe({

      /**
       * Requête réussie.
       */
      next: (count) => {

        this.unreadCount = count;
      },


      /**
       * Une erreur de notification ne doit pas
       * empêcher l'utilisation du Dashboard.
       */
      error: (error) => {

        console.error(
          'Erreur lors du chargement du compteur de notifications :',
          error
        );
      }
    });
  }

// ============================================================
// MENU MOBILE
// ============================================================

/**
 * Indique si le menu mobile est actuellement ouvert.
 *
 * false → le menu est fermé.
 * true  → le menu est ouvert.
 *
 * Sur ordinateur, cette variable n'a aucun impact
 * puisque la sidebar classique reste affichée.
 */
menuOpen = false;

// ============================================================
// GESTION DU MENU MOBILE
// ============================================================

/**
 * Ouvre ou ferme le menu mobile.
 *
 * Lorsque l'utilisateur clique sur le bouton ☰ :
 * - si le menu est fermé → il s'ouvre ;
 * - s'il est ouvert → il se ferme.
 */
toggleMobileMenu(): void {
  this.menuOpen = !this.menuOpen;
}


/**
 * Ferme complètement le menu mobile.
 *
 * Cette méthode sera utilisée lorsqu'un utilisateur
 * clique sur un lien du menu.
 */
closeMobileMenu(): void {
  this.menuOpen = false;
}


/**
 * La touche Échap referme le menu mobile, comme une fenêtre.
 */
@HostListener('document:keydown.escape')
onEscape(): void {
  this.closeMobileMenu();
}


  // ========================================================================
  // DÉCONNEXION
  // ========================================================================

  /**
   * Déconnecte l'utilisateur.
   *
   * Les informations de session sont supprimées
   * du localStorage.
   *
   * L'utilisateur est ensuite redirigé vers l'accueil.
   */
  logout(): void {

    // Suppression du token JWT.
    localStorage.removeItem('token');

    // Suppression de l'identifiant utilisateur.
    localStorage.removeItem('userId');

    // Suppression de l'email.
    localStorage.removeItem('email');

    // Suppression du prénom.
    localStorage.removeItem('prenom');

    // Suppression du nom.
    localStorage.removeItem('nom');

    // Redirection vers l'accueil principal.
    this.router.navigate(['/home']);
  }
}