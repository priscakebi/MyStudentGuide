/**
 * Configuration de l'environnement de DÉVELOPPEMENT.
 *
 * L'URL de l'API est définie ici une seule fois : plus aucune URL
 * "http://localhost:8080" ne doit être écrite en dur dans les composants.
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',

  // Déconnexion automatique après X minutes sans activité (souris, clavier, tactile, défilement).
  idleTimeoutMinutes: 15,
  // Avertissement affiché X secondes avant la déconnexion.
  idleWarningSeconds: 60,
  // Le JWT est renouvelé au plus toutes les X minutes tant que l'utilisateur est actif
  // (doit rester inférieur à la durée de vie du JWT côté API : 30 min par défaut).
  tokenRefreshMinutes: 10
};
