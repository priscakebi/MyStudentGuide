/*
 * Importe le type Routes d'Angular.
 *
 * Routes permet de définir toutes les routes
 * disponibles dans l'application.
 */
import { Routes } from '@angular/router';


/*
 * Importe le composant Login.
 *
 * La page de connexion reste indépendante
 * du PublicLayout.
 */
import { Login } from './pages/login/login';


/*
 * Importe le composant Register.
 *
 * La page d'inscription reste indépendante
 * du PublicLayout.
 */
import { Register } from './pages/register/register';

/*
 * Importe le composant AdminLogin.
 *
 * Formulaire de connexion réservé aux administrateurs.
 * Indépendant du PublicLayout, comme Login et Register.
 */
import { AdminLogin } from './pages/admin-login/admin-login';


/*
 * Importe les guards de sécurité.
 *
 * authGuard :
 * vérifie qu'un utilisateur est connecté.
 *
 * adminGuard :
 * vérifie que l'utilisateur possède
 * le rôle ADMIN.
 */
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';


/**
 * Configuration principale des routes de MyStudentGuide.
 *
 * L'application possède plusieurs espaces :
 *
 * 1. ESPACE PUBLIC
 *    - /home
 *    - /demarches
 *    - /demarches/:id
 *    - /documents
 *    - /notifications (invite le visiteur à se connecter)
 *
 *    Ces pages sont accessibles à tous, inscrits ou non.
 *
 * 2. AUTHENTIFICATION
 *    - /login
 *    - /register
 *    - /forgot-password
 *
 * 3. ESPACE ÉTUDIANT
 *    - /dashboard
 *    - /dashboard/profile
 *    - /dashboard/suivis
 *    - /dashboard/notifications
 *    - /dashboard/account
 *
 * 4. ESPACE ADMINISTRATEUR
 *    - /admin
 *    - /admin/categories-admin
 *    - /admin/demarches-admin
 *    - /admin/users
 *    - /admin/documents
 *    - /admin/notifications
 *    - /admin/change-password
 *
 *
 * Les espaces privés sont protégés par des guards.
 */
export const routes: Routes = [

  // ========================================================================
  // ESPACE PUBLIC
  // ========================================================================

  {
    /*
     * Le chemin vide représente le groupe
     * de routes utilisant le PublicLayout.
     */
    path: '',

    /*
     * Charge le layout public.
     */
    loadComponent: () =>
      import('./layouts/public-layout/public-layout')
        .then(m => m.PublicLayout),

    /*
     * Toutes les routes enfants héritent
     * de la navbar et du footer.
     */
    children: [

      // ====================================================================
      // REDIRECTION / → /home
      // ====================================================================

      {
        /*
         * CORRECTIF « page d'accueil vide » :
         *
         * Angular prend la PREMIÈRE route qui correspond. Sur l'URL "/",
         * c'est ce groupe (path: '') qui correspond : la navbar et le
         * footer s'affichaient, mais aucun enfant n'avait le chemin '',
         * donc le <router-outlet> restait vide. La redirection doit donc
         * se trouver ICI, parmi les enfants du layout.
         */
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },

      // ====================================================================
      // ACCUEIL
      // ====================================================================

      {
        /*
         * URL :
         * /home
         */
        path: 'home',
        title: "Vos démarches d'étudiant en France",

        loadComponent: () =>
          import('./pages/home/home')
            .then(m => m.Home)
      },


      // ====================================================================
      // DÉMARCHES
      // ====================================================================

      {
        /*
         * URL :
         * /demarches
         *
         * Affiche la liste générale
         * des démarches administratives.
         */
        path: 'demarches',
        title: 'Toutes les démarches',

        loadComponent: () =>
          import('./pages/demarches/demarches')
            .then(m => m.Demarches)
      },


      // ====================================================================
      // DÉTAIL D'UNE DÉMARCHE
      // ====================================================================

      {
        /*
         * URL :
         * /demarches/:id
         */
        path: 'demarches/:id',
        title: 'Démarche',

        loadComponent: () =>
          import('./pages/demarche-detail/demarche-detail')
            .then(m => m.DemarcheDetailComponent)
      },


      // ====================================================================
      // DOCUMENTS REQUIS
      // ====================================================================

      {
        /*
         * URL :
         * /documents
         *
         * Cette page affiche uniquement les documents
         * nécessaires aux démarches.
         *
         * Aucun document personnel n'est stocké.
         */
        path: 'documents',
        title: 'Documents requis',

        loadComponent: () =>
          import('./pages/documents/documents')
            .then(m => m.Documents)
      },


      // ====================================================================
      // NOTIFICATIONS (lien de la navbar pour un visiteur)
      // ====================================================================

      {
        /*
         * URL :
         * /notifications
         *
         * Accessible à tous : un visiteur y est invité à se connecter.
         * Un utilisateur connecté utilise /dashboard/notifications.
         */
        path: 'notifications',
        title: 'Notifications',

        loadComponent: () =>
          import('./pages/notifications/notifications')
            .then(m => m.Notifications)
      }
    ]
  },


  // ========================================================================
  // AUTHENTIFICATION
  // ========================================================================

  {
    /*
     * URL :
     * /login
     *
     * Page de connexion.
     */
    path: 'login',
    title: 'Connexion',

    component: Login
  },


  {
    /*
     * URL :
     * /register
     *
     * Page d'inscription.
     */
    path: 'register',
    title: 'Inscription',

    component: Register
  },


  {
    /*
     * URL :
     * /admin-login
     *
     * Formulaire de connexion de l'administrateur.
     *
     * Cette route doit rester EN DEHORS de /admin (protégée),
     * sinon l'administrateur serait redirigé en boucle.
     */
    path: 'admin-login',
    title: 'Connexion administrateur',

    component: AdminLogin
  },


  {
    /*
     * MOT DE PASSE OUBLIÉ (étudiant)
     *
     * /forgot-password : saisie de l'e-mail
     * /reset-password?token=... : choix du nouveau mot de passe
     *                             (lien reçu par e-mail)
     *
     * Le même composant sert les deux espaces : la donnée de route
     * "space" indique s'il s'agit de l'espace étudiant ou administrateur.
     */
    path: 'forgot-password',
    title: 'Mot de passe oublié',
    data: { space: 'student' },
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password')
        .then(m => m.ForgotPassword)
  },

  {
    path: 'reset-password',
    title: 'Nouveau mot de passe',
    data: { space: 'student' },
    loadComponent: () =>
      import('./pages/reset-password/reset-password')
        .then(m => m.ResetPassword)
  },

  {
    /*
     * MOT DE PASSE OUBLIÉ (administrateur)
     *
     * Routes publiques, hors de /admin (protégée) : l'administrateur
     * n'est justement pas connecté lorsqu'il a oublié son mot de passe.
     */
    path: 'admin-forgot-password',
    title: 'Mot de passe oublié · Administration',
    data: { space: 'admin' },
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password')
        .then(m => m.ForgotPassword)
  },

  {
    path: 'admin-reset-password',
    title: 'Nouveau mot de passe · Administration',
    data: { space: 'admin' },
    loadComponent: () =>
      import('./pages/reset-password/reset-password')
        .then(m => m.ResetPassword)
  },


  // ========================================================================
  // ESPACE ÉTUDIANT
  // ========================================================================

  {
    /*
     * URL principale :
     * /dashboard
     *
     * IMPORTANT :
     *
     * Cette route est protégée par authGuard.
     *
     * Un utilisateur non connecté ne peut donc
     * pas accéder directement à son espace.
     */
    path: 'dashboard',
    title: 'Mon espace',

    /*
     * Vérifie que l'utilisateur est connecté.
     */
    canActivate: [authGuard],

    /*
     * Charge le dashboard étudiant.
     */
    loadComponent: () =>
      import('./pages/dashboard/dashboard')
        .then(m => m.Dashboard),

    /*
     * Pages internes du dashboard étudiant.
     */
    children: [

      // ====================================================================
      // MON PROFIL
      // ====================================================================

      {
        /*
         * URL :
         * /dashboard/profile
         */
        path: 'profile',
        title: 'Mon profil',

        loadComponent: () =>
          import('./pages/profile/profile')
            .then(m => m.Profile)
      },


      // ====================================================================
      // MES DÉMARCHES
      // ====================================================================

      {
        /*
         * URL :
         * /dashboard/suivis
         *
         * Permet à l'étudiant de suivre
         * ses démarches personnelles.
         */
        path: 'suivis',
        title: 'Mes démarches',

        loadComponent: () =>
          import('./pages/suivis-demarches/suivis-demarches')
            .then(m => m.SuivisDemarches)
      },


      // ====================================================================
      // ANCIENNE ROUTE /dashboard/demarches
      // ====================================================================

      {
        /*
         * Cette route est conservée pour éviter
         * de casser les anciens liens.
         *
         * /dashboard/demarches
         *
         * utilise la même page que :
         *
         * /dashboard/suivis
         */
        path: 'demarches',
        title: 'Mes démarches',

        loadComponent: () =>
          import('./pages/suivis-demarches/suivis-demarches')
            .then(m => m.SuivisDemarches)
      },


      // ====================================================================
      // NOTIFICATIONS
      // ====================================================================

      {
        /*
         * URL :
         * /dashboard/notifications
         */
        path: 'notifications',
        title: 'Mes notifications',

        loadComponent: () =>
          import('./pages/notifications/notifications')
            .then(m => m.Notifications)
      },


      // ====================================================================
      // MON COMPTE
      // ====================================================================

      {
        /*
         * URL :
         * /dashboard/account
         */
        path: 'account',
        title: 'Mon compte',

        loadComponent: () =>
          import('./pages/account/account')
            .then(m => m.Account)
      },


      // ====================================================================
      // BESOIN D'AIDE ?
      // ====================================================================

      {
        /*
         * URL :
         * /dashboard/aide
         *
         * L'étudiant écrit à l'administration et retrouve ses réponses.
         * Accepte ?demarche=<id> pour présélectionner une démarche.
         */
        path: 'aide',
        title: "Besoin d'aide ?",

        loadComponent: () =>
          import('./pages/aide/aide')
            .then(m => m.Aide)
      }
    ]
  },


// ========================================================================
// ESPACE ADMINISTRATEUR
// ========================================================================

{
  /*
   * URL principale :
   *
   * /admin
   *
   * Cette route est réservée aux administrateurs.
   */
  path: 'admin',
  title: 'Administration',

  /*
   * adminGuard vérifie à la fois que l'utilisateur est connecté
   * (sinon → /admin-login) et qu'il possède le rôle ADMIN.
   */
  canActivate: [adminGuard],

  /*
   * Vérifie que l'utilisateur possède
   * le rôle ADMIN.
   *
   * Un étudiant connecté ne pourra donc
   * pas accéder aux pages administrateur.
   */
  canActivateChild: [adminGuard],

  /*
   * Charge le composant principal de l'administration.
   *
   * AdminDashboard joue ici le rôle de layout.
   *
   * Il contient notamment :
   *
   * - la sidebar ;
   * - la topbar ;
   * - les informations administrateur ;
   * - le router-outlet.
   */
  loadComponent: () =>
    import('./pages/admin/admin-dashboard/admin-dashboard')
      .then(m => m.AdminDashboard),

  /*
   * Pages internes de l'administration.
   */
  children: [

    
    // ====================================================================
    // CATÉGORIES
    // ====================================================================

    {
      /*
       * URL :
       * /admin/categories-admin
       */
      path: 'categories-admin',
      title: 'Catégories · Administration',

      loadComponent: () =>
        import('./pages/admin/categories-admin/categories-admin')
          .then(m => m.CategoriesAdmin)
    },


    // ====================================================================
    // DÉMARCHES
    // ====================================================================

    {
      /*
       * URL :
       * /admin/demarches-admin
       */
      path: 'demarches-admin',
      title: 'Démarches · Administration',

      loadComponent: () =>
        import('./pages/admin/demarches-admin/demarches-admin')
          .then(m => m.DemarchesAdmin)
    },


    // ====================================================================
    // UTILISATEURS
    // ====================================================================

    {
      /*
       * URL :
       * /admin/users
       */
      path: 'users',
      title: 'Utilisateurs · Administration',

      loadComponent: () =>
        import('./pages/admin/users-admin/users-admin')
          .then(m => m.UsersAdmin)
    },


    // ====================================================================
    // DOCUMENTS
    // ====================================================================

    {
      /*
       * URL :
       * /admin/documents
       *
       * Cette page concerne uniquement
       * les documents nécessaires aux démarches.
       *
       * Aucun document personnel étudiant
       * n'est stocké.
       */
      path: 'documents',
      title: 'Documents · Administration',

      loadComponent: () =>
        import('./pages/admin/documents-admin/documents-admin')
          .then(m => m.DocumentsAdmin)
    },


    // ====================================================================
    // NOTIFICATIONS
    // ====================================================================

    {
      /*
       * URL :
       * /admin/notifications
       */
      path: 'notifications',
      title: 'Notifications · Administration',

      loadComponent: () =>
        import('./pages/admin/notifications-admin/notifications-admin')
          .then(m => m.NotificationsAdmin)
    },


    // ====================================================================
    // SIGNALEMENTS DES ÉTUDIANTS
    // ====================================================================

    {
      /*
       * URL :
       * /admin/signalements
       *
       * Erreurs ou informations obsolètes signalées par les étudiants.
       */
      path: 'signalements',
      title: 'Signalements · Administration',

      loadComponent: () =>
        import('./pages/admin/signalements-admin/signalements-admin')
          .then(m => m.SignalementsAdmin)
    },


    // ====================================================================
    // DEMANDES D'AIDE DES ÉTUDIANTS
    // ====================================================================

    {
      /*
       * URL :
       * /admin/aide
       *
       * Questions envoyées depuis « Besoin d'aide ? » ; l'admin y répond.
       */
      path: 'aide',
      title: "Demandes d'aide · Administration",

      loadComponent: () =>
        import('./pages/admin/aide-admin/aide-admin')
          .then(m => m.AideAdmin)
    },


    // ====================================================================
    // MON COMPTE ADMINISTRATEUR
    // ====================================================================

    {
      /*
       * URL :
       * /admin/account
       *
       * Cette page permet à l'administrateur
       * de consulter ses informations et
       * de gérer son mot de passe.
       */
      path: 'account',
      title: 'Mon compte · Administration',

      loadComponent: () =>
        import('./pages/admin/admin-account/admin-account')
          .then(m => m.AdminAccount)
    }
  ]
},

  // ========================================================================
  // ROUTE INCONNUE
  // ========================================================================

  {
    /*
     * Toute URL inexistante est redirigée
     * vers l'accueil.
     */
    path: '**',

    redirectTo: 'home'
  }
];