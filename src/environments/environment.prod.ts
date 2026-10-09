
/**
 * Configuration utilisée lorsque l'application Angular est compilée
 * pour la production et déployée en ligne.
 */
export const environment = {
  // Active le mode production d'Angular.
  production: true,

  // URL de l'API Spring Boot déployée sur Render.
  apiUrl: 'https://mystudentguide-api.onrender.com/api',

  // Déconnecte l'utilisateur après 15 minutes sans activité.
  idleTimeoutMinutes: 15,

  // Affiche un avertissement 60 secondes avant la déconnexion.
  idleWarningSeconds: 60,

  // Prévoit une tentative de renouvellement du JWT toutes les 10 minutes
  // lorsque l'utilisateur est actif, selon l'implémentation du service.
  tokenRefreshMinutes: 10
};