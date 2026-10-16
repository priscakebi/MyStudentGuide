import type { Breadcrumb, ErrorEvent } from '@sentry/angular';

import {
  demarrerSuiviErreurs,
  masquerEmails,
  nettoyerBreadcrumb,
  nettoyerEvenement,
  nettoyerUrl
} from './suivi-erreurs';

describe('suivi des erreurs (aucune donnée personnelle envoyée)', () => {
  it('reste inactif sans DSN', async () => {
    expect(await demarrerSuiviErreurs('')).toBeNull();
  });

  it('masque les adresses e-mail', () => {
    expect(masquerEmails('Compte aicha.diallo+test@mail.co.uk introuvable'))
      .toBe('Compte [e-mail] introuvable');
    expect(masquerEmails(undefined)).toBeUndefined();
  });

  it('retire les paramètres et l’ancre des adresses', () => {
    expect(nettoyerUrl('https://site.fr/reset-password?token=abc123#haut')).toBe('https://site.fr/reset-password');
    expect(nettoyerUrl('/demarches/30')).toBe('/demarches/30');
  });

  it('nettoie un événement avant envoi', () => {
    const event = {
      type: undefined,
      user: { email: 'aicha@mail.com', ip_address: '1.2.3.4' },
      message: 'Erreur pour aicha@mail.com',
      request: {
        url: 'https://site.fr/reset-password?token=secret',
        query_string: 'token=secret',
        headers: { Authorization: 'Bearer x' },
        cookies: { a: 'b' }
      },
      exception: { values: [{ type: 'Error', value: 'Utilisateur aicha@mail.com' }] }
    } as unknown as ErrorEvent;

    const propre = nettoyerEvenement(event);

    expect(propre.user).toBeUndefined();
    expect(propre.message).toBe('Erreur pour [e-mail]');
    expect(propre.request).toEqual({ url: 'https://site.fr/reset-password' });
    expect(propre.exception?.values?.[0].value).toBe('Utilisateur [e-mail]');
  });

  it('ignore la console et nettoie les navigations', () => {
    expect(nettoyerBreadcrumb({ category: 'console', message: 'x' })).toBeNull();

    const navigation = nettoyerBreadcrumb({
      category: 'navigation',
      data: { from: '/login?email=aicha@mail.com', to: '/reset-password?token=secret' }
    } as Breadcrumb);

    expect(navigation?.data).toEqual({ from: '/login', to: '/reset-password' });
  });
});
