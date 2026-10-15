import { TestBed } from '@angular/core/testing';
import { LangueService } from './langue.service';

describe('LangueService', () => {

  afterEach(() => {
    localStorage.removeItem('langue');
    document.documentElement.lang = 'fr';
  });

  it('suit la langue du navigateur à la première visite (français dans les tests)', () => {
    const service = TestBed.inject(LangueService);

    expect(service.langue()).toBe('fr');
    expect(service.t('nav.accueil')).toBe('Accueil');
  });

  it('reprend la langue mémorisée', () => {
    localStorage.setItem('langue', 'en');

    expect(TestBed.inject(LangueService).langue()).toBe('en');
  });

  it('change de langue, la mémorise et met à jour <html lang>', () => {
    const service = TestBed.inject(LangueService);
    service.changer('en');

    expect(service.t('nav.accueil')).toBe('Home');
    expect(localStorage.getItem('langue')).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('insère les paramètres dans le texte', () => {
    const service = TestBed.inject(LangueService);

    expect(service.t('espace.echeances.dans', { n: 5 })).toBe('Dans 5 jours');
    service.changer('en');
    expect(service.t('espace.echeances.dans', { n: 5 })).toBe('In 5 days');
  });

  it('traduit une clé construite à l’exécution, sinon garde la valeur de secours', () => {
    const service = TestBed.inject(LangueService);
    service.changer('en');

    expect(service.tOu('docType.IDENTITE', 'IDENTITE')).toBe('Identity');
    expect(service.tOu('docType.INCONNU', 'INCONNU')).toBe('INCONNU');
    expect(service.tSiCle('Catégories · Administration')).toBe('Catégories · Administration');
  });

  it('garde le message de l’API en français, le remplace par un texte générique en anglais', () => {
    const service = TestBed.inject(LangueService);

    expect(service.messageApi('Cet e-mail est déjà utilisé.', 'register.erreur')).toBe('Cet e-mail est déjà utilisé.');
    service.changer('en');
    expect(service.messageApi('Cet e-mail est déjà utilisé.', 'register.erreur')).toBe('Something went wrong during sign-up.');
    expect(service.messageApi(null, 'register.erreur')).toBe('Something went wrong during sign-up.');
  });
});
