import { isStrongPassword, isValidEmail, isValidName, passwordChecks } from './form-rules';

describe('form-rules', () => {

  it('accepte un mot de passe conforme (12+ caractères, 4 catégories)', () => {
    expect(isStrongPassword('Etudiant2026!')).toBe(true);
    expect(isStrongPassword('Àbcdefghij1#')).toBe(true);
  });

  it('refuse un mot de passe trop court ou incomplet', () => {
    expect(isStrongPassword('Etudiant26!')).toBe(false); // 11 caractères
    expect(isStrongPassword('etudiant2026!')).toBe(false); // pas de majuscule
    expect(isStrongPassword('ETUDIANT2026!')).toBe(false); // pas de minuscule
    expect(isStrongPassword('Etudiantdeux!')).toBe(false); // pas de chiffre
    expect(isStrongPassword('Etudiant2026a')).toBe(false); // pas de caractère spécial
    expect(isStrongPassword('Aa1!' + 'x'.repeat(69))).toBe(false); // > 72
  });

  it('détaille chaque critère pour la checklist', () => {
    const checks = passwordChecks('abc');
    expect(checks.length).toBe(5);
    expect(checks.find((c) => c.label === 'Une lettre minuscule')?.ok).toBe(true);
    expect(checks.find((c) => c.label === 'Un chiffre')?.ok).toBe(false);
  });

  it('valide le format de l\'e-mail', () => {
    expect(isValidEmail('ana@free.fr')).toBe(true);
    expect(isValidEmail(' ana@free.fr ')).toBe(true);
    expect(isValidEmail('ana@localhost')).toBe(false);
    expect(isValidEmail('ana.free.fr')).toBe(false);
  });

  it('valide les noms et prénoms', () => {
    expect(isValidName('Jean-Pierre')).toBe(true);
    expect(isValidName("N'Guessan")).toBe(true);
    expect(isValidName('Élodie')).toBe(true);
    expect(isValidName('J')).toBe(false);
    expect(isValidName('Jean3')).toBe(false);
  });
});
