// ============================================================
// RÈGLES DES FORMULAIRES (recommandations CNIL / ANSSI)
// ============================================================
//
// Mêmes règles que l'API (validation/FormRules.java) :
//
// - mot de passe : 12 à 72 caractères, une minuscule, une majuscule,
//   un chiffre et un caractère spécial ;
// - e-mail : format nom@domaine.ext, 254 caractères maximum ;
// - nom / prénom : 2 à 50 lettres (accents, espaces, tirets
//   et apostrophes autorisés).
//
// Ces règles s'appliquent à la création et au changement de mot de
// passe, pas à la connexion (les anciens comptes doivent pouvoir se
// connecter).
// ============================================================

import type { Cle } from '../i18n/textes';

export const PASSWORD_MIN = 12;
export const PASSWORD_MAX = 72;
export const EMAIL_MAX = 254;

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[A-Za-z]{2,}$/;
const NAME_REGEX = /^\p{L}[\p{L}' -]{1,49}$/u;

/**
 * Un critère du mot de passe, affiché dans la checklist.
 * `label` : texte français (administration) ; `cle` : clé de traduction (pages étudiantes).
 */
export interface PasswordCheck {
  label: string;
  cle: Cle;
  ok: boolean;
}

/** Liste des critères, pour l'affichage en temps réel sous le champ. */
export function passwordChecks(password: string): PasswordCheck[] {
  const value = password ?? '';

  return [
    {
      label: `${PASSWORD_MIN} caractères minimum`,
      cle: 'form.motDePasse.12min',
      ok: value.length >= PASSWORD_MIN && value.length <= PASSWORD_MAX
    },
    // Unicode : les lettres accentuées comptent (É majuscule, é minuscule).
    { label: 'Une lettre majuscule', cle: 'form.motDePasse.majuscule', ok: /\p{Lu}/u.test(value) },
    { label: 'Une lettre minuscule', cle: 'form.motDePasse.minuscule', ok: /\p{Ll}/u.test(value) },
    { label: 'Un chiffre', cle: 'form.motDePasse.chiffre', ok: /\d/.test(value) },
    { label: 'Un caractère spécial (! @ # ? …)', cle: 'form.motDePasse.special', ok: /[^\p{L}\p{N}\s]/u.test(value) }
  ];
}

export function isStrongPassword(password: string): boolean {
  return passwordChecks(password).every((check) => check.ok);
}

export const PASSWORD_MESSAGE =
  `Le mot de passe doit contenir entre ${PASSWORD_MIN} et ${PASSWORD_MAX} caractères, ` +
  'dont une majuscule, une minuscule, un chiffre et un caractère spécial.';

export function isValidEmail(email: string): boolean {
  const value = (email ?? '').trim();
  return value.length <= EMAIL_MAX && EMAIL_REGEX.test(value);
}

export const EMAIL_MESSAGE =
  'Saisissez une adresse e-mail valide (ex. : nom@domaine.fr).';

export function isValidName(name: string): boolean {
  return NAME_REGEX.test((name ?? '').trim());
}

export const NAME_MESSAGE =
  'Entre 2 et 50 lettres (espaces, tirets et apostrophes autorisés).';
