import { allerAuContenu } from './aller-au-contenu';

describe('allerAuContenu (lien « Aller au contenu »)', () => {
  afterEach(() => document.getElementById('contenu')?.remove());

  it('donne le focus à la zone principale sans changer d’adresse', () => {
    const main = document.createElement('main');
    main.id = 'contenu';
    main.tabIndex = -1;
    main.scrollIntoView = () => undefined;
    document.body.appendChild(main);
    const event = new Event('click', { cancelable: true });

    allerAuContenu(event);

    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(main);
  });
});
