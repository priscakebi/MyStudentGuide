import { StudentDemarche, dateLimiteDe } from './student-demarche.service';

describe('dateLimiteDe (date limite d’un suivi)', () => {
  const suivi = (personnelle: string | null, generale: string | null): StudentDemarche => ({
    id: 1,
    statut: 'EN_COURS',
    dateLimitePersonnelle: personnelle,
    demarche: { id: 30, titre: 'Validation du VLS-TS', dateLimite: generale }
  });

  it('préfère la date calculée depuis le profil de l’étudiant', () => {
    expect(dateLimiteDe(suivi('2026-11-30', '2026-12-31'))).toBe('2026-11-30');
  });

  it('retombe sur la date limite générale de la démarche', () => {
    expect(dateLimiteDe(suivi(null, '2026-12-31'))).toBe('2026-12-31');
  });

  it('renvoie null quand aucune date n’existe', () => {
    expect(dateLimiteDe(suivi(null, null))).toBeNull();
  });
});
