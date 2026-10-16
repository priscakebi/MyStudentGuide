/**
 * Lien d'évitement « Aller au contenu » : place le focus sur la zone
 * principale (#contenu) sans passer par le menu.
 *
 * Un simple href="#contenu" ne suffit pas : avec <base href="/">, le
 * navigateur irait à l'accueil (« /#contenu »).
 */
export function allerAuContenu(event: Event): void {
  event.preventDefault();
  const contenu = document.getElementById('contenu');
  contenu?.focus();
  contenu?.scrollIntoView();
}
