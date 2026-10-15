// Préparation commune des tests unitaires.
//
// Le navigateur simulé (jsdom) annonce l'anglais : l'interface s'afficherait
// donc en anglais (voir LangueService). Les tests vérifient les textes français,
// on simule un navigateur en français.
Object.defineProperty(window.navigator, 'language', { value: 'fr-FR', configurable: true });
