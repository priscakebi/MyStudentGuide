import { Routes } from '@angular/router';

/**
 * Configuration principale des routes
 * de l'application MyCampusGuide.
 */
export const routes: Routes = [

  // ============================================
  // PAGE DE CONNEXION
  // ============================================

  {
    path: 'login',

    loadComponent: () =>
      import('./pages/login/login')
        .then(m => m.Login)
  },

  {
  path: 'home',

  loadComponent: () =>
    import('./pages/home/home')
      .then(m => m.Home)
},


  // ============================================
  // TABLEAU DE BORD
  // ============================================

  {
  path: 'dashboard',

  loadComponent: () =>
    import('./pages/dashboard/dashboard')
      .then(m => m.Dashboard),

  children: [

    {
      path: 'profile',

      loadComponent: () =>
        import('./pages/profile/profile')
          .then(m => m.Profile)
    },

    {
      path: 'demarches',

      loadComponent: () =>
        import('./pages/demarches/demarches')
          .then(m => m.Demarches)
    },

    {
      path: 'categories',

      loadComponent: () =>
        import('./pages/categories/categories')
          .then(m => m.Categories)
    },

    {
      path: 'documents',

      loadComponent: () =>
        import('./pages/documents/documents')
          .then(m => m.Documents)
    },

    {
      path: 'notifications',

      loadComponent: () =>
        import('./pages/notifications/notifications')
          .then(m => m.Notifications)
    }

  ]
},


  // ============================================
  // REDIRECTION PAR DÉFAUT
  // ============================================

  {
    path: '',

    redirectTo: 'login',

    pathMatch: 'full'
  },


  // ============================================
  // ROUTE INCONNUE
  // ============================================

  {
    path: '**',

    redirectTo: 'login'
  }

];