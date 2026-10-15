import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { provideRouter, Router, TitleStrategy } from '@angular/router';
import { Component } from '@angular/core';
import { PageTitleStrategy, resume, titreComplet } from './page-title.strategy';

@Component({ template: '' })
class PageVide {}

describe('PageTitleStrategy', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'demarches', title: 'Toutes les démarches', component: PageVide },
          { path: 'sans-titre', component: PageVide }
        ]),
        { provide: TitleStrategy, useExisting: PageTitleStrategy }
      ]
    });
  });

  it('ajoute le nom de l’application au titre de la route', async () => {
    await TestBed.inject(Router).navigateByUrl('/demarches');
    expect(TestBed.inject(Title).getTitle()).toBe('Toutes les démarches · MyStudentGuide');

    await TestBed.inject(Router).navigateByUrl('/sans-titre');
    expect(TestBed.inject(Title).getTitle()).toBe('MyStudentGuide');
  });

  it('remplace le titre et la description, puis rétablit la description à la navigation suivante', async () => {
    const meta = TestBed.inject(Meta);
    meta.updateTag({ name: 'description', content: 'Description générale' });
    const strategie = TestBed.inject(PageTitleStrategy);

    strategie.definir('Carte Vitale', 'La carte   Vitale\natteste de vos droits.');
    expect(TestBed.inject(Title).getTitle()).toBe('Carte Vitale · MyStudentGuide');
    expect(meta.getTag('name="description"')?.content).toBe('La carte Vitale atteste de vos droits.');

    await TestBed.inject(Router).navigateByUrl('/demarches');
    expect(meta.getTag('name="description"')?.content).toBe('Description générale');
  });

  it('coupe les descriptions trop longues sur un mot', () => {
    const texte = 'mot '.repeat(60);
    const r = resume(texte);
    expect(r.length).toBeLessThanOrEqual(160);
    expect(r.endsWith('mot…')).toBe(true);
    expect(titreComplet(null)).toBe('MyStudentGuide');
  });
});
