/**
 * Page de l'administration à ouvrir quand on clique sur une notification
 * reçue par un administrateur (null : notification sans page associée).
 *
 * Les notifications d'administration n'enregistrent pas de lien : la page
 * est déduite de leur titre, fixé par l'API (AuthService, SignalementService,
 * DemandeAideService, StudentDemarcheService…).
 */
export interface LienNotification {
  chemin: string;
  libelle: string;
}

const LIENS: { debut: string; lien: LienNotification }[] = [
  { debut: 'signalement', lien: { chemin: '/admin/signalements', libelle: 'Voir les signalements' } },
  { debut: "demande d'aide", lien: { chemin: '/admin/aide', libelle: 'Voir les demandes d\'aide' } },
  { debut: 'mise a jour officielle', lien: { chemin: '/admin/demarches-admin', libelle: 'Voir les démarches' } },
  { debut: 'nouvel avis', lien: { chemin: '/admin/avis', libelle: 'Voir les avis' } },
  { debut: 'nouvel etudiant', lien: { chemin: '/admin/users', libelle: 'Voir les utilisateurs' } },
  { debut: 'nouveau profil', lien: { chemin: '/admin/users', libelle: 'Voir les utilisateurs' } },
  { debut: 'profil etudiant', lien: { chemin: '/admin/users', libelle: 'Voir les utilisateurs' } },
  { debut: 'suppression', lien: { chemin: '/admin/users', libelle: 'Voir les utilisateurs' } },
  { debut: 'demarche commencee', lien: { chemin: '/admin/users', libelle: 'Voir les utilisateurs' } },
  { debut: "statut d'une demarche", lien: { chemin: '/admin/users', libelle: 'Voir les utilisateurs' } }
];

/** Minuscules, sans accents, apostrophe typographique remplacée. */
function normaliser(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/’/g, "'")
    .toLowerCase()
    .trim();
}

export function lienNotificationAdmin(titre: string | null | undefined): LienNotification | null {
  const t = normaliser(titre ?? '');
  return LIENS.find((l) => t.startsWith(l.debut))?.lien ?? null;
}
