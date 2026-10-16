import { lienNotificationAdmin } from './lien-notification-admin';

describe('lienNotificationAdmin (notification → page de l’administration)', () => {
  const chemin = (titre: string) => lienNotificationAdmin(titre)?.chemin ?? null;

  it('ouvre la page qui correspond à chaque notification envoyée par l’API', () => {
    expect(chemin('Signalement : Information obsolète')).toBe('/admin/signalements');
    expect(chemin("Demande d'aide : Compte")).toBe('/admin/aide');
    expect(chemin('Mise à jour officielle disponible')).toBe('/admin/demarches-admin');
    expect(chemin('Nouvel avis publié')).toBe('/admin/avis');
    expect(chemin('Nouvel étudiant inscrit')).toBe('/admin/users');
    expect(chemin('Nouveau profil étudiant créé')).toBe('/admin/users');
    expect(chemin('Profil étudiant modifié')).toBe('/admin/users');
    expect(chemin("Suppression d'un compte étudiant")).toBe('/admin/users');
    expect(chemin('Démarche commencée')).toBe('/admin/users');
    expect(chemin("Statut d'une démarche modifié")).toBe('/admin/users');
  });

  it('tolère les apostrophes typographiques et la casse', () => {
    expect(chemin('DEMANDE D’AIDE : Technique')).toBe('/admin/aide');
  });

  it('renvoie null pour une notification sans page associée', () => {
    expect(lienNotificationAdmin('Bienvenue')).toBeNull();
    expect(lienNotificationAdmin(null)).toBeNull();
  });
});
