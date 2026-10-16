// Seules les fonctions utiles de Sentry : le reste (mesure des performances,
// enregistrement des sessions…) n'est pas inclus dans le fichier téléchargé.
export { captureException, init } from '@sentry/angular';
