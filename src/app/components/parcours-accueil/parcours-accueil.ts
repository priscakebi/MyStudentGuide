// ============================================================
// « BIEN DÉMARRER » : PARCOURS D'ACCUEIL DES NOUVEAUX ÉTUDIANTS
// ============================================================
//
// Affiché sur « Mon espace » tant que les premières étapes ne sont
// pas faites. Chaque étape est cochée d'après les vraies données
// (e-mail confirmé, profil complet, dates de séjour, démarche suivie).
// La carte disparaît quand tout est fait, ou si l'étudiant la masque
// (choix mémorisé dans ce navigateur).
// ============================================================

import { Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Cle } from '../../i18n/textes';
import { TPipe } from '../../i18n/t.pipe';
import { Icone } from '../icone/icone';

interface Etape {
  titre: Cle;
  texte: Cle;
  fait: boolean;
  lien?: string;
  action?: Cle;
}

@Component({
  selector: 'app-parcours-accueil',
  standalone: true,
  imports: [RouterLink, TPipe, Icone],
  templateUrl: './parcours-accueil.html',
  styleUrl: './parcours-accueil.scss'
})
export class ParcoursAccueil {

  /** null : donnée pas encore chargée (la carte attend toutes les réponses). */
  readonly emailVerifie = input(true);
  readonly profilComplet = input<boolean | null>(null);
  readonly datesRenseignees = input<boolean | null>(null);
  readonly aCommence = input<boolean | null>(null);

  /** Adresse du compte : le masquage est mémorisé par compte. */
  readonly email = input('');

  private readonly masquee = signal<string | null>(null);

  protected readonly etapes = computed<Etape[]>(() => [
    {
      titre: 'parcours.email.titre',
      texte: 'parcours.email.texte',
      fait: this.emailVerifie()
    },
    {
      titre: 'parcours.profil.titre',
      texte: 'parcours.profil.texte',
      fait: !!this.profilComplet(),
      lien: '/dashboard/profile',
      action: 'parcours.profil.action'
    },
    {
      titre: 'parcours.dates.titre',
      texte: 'parcours.dates.texte',
      fait: !!this.datesRenseignees(),
      lien: '/dashboard/profile',
      action: 'parcours.dates.action'
    },
    {
      titre: 'parcours.demarche.titre',
      texte: 'parcours.demarche.texte',
      fait: !!this.aCommence(),
      lien: '/demarches',
      action: 'parcours.demarche.action'
    }
  ]);

  protected readonly faites = computed(() => this.etapes().filter((e) => e.fait).length);

  protected readonly visible = computed(() => {
    const charge = this.profilComplet() !== null && this.datesRenseignees() !== null && this.aCommence() !== null;
    return charge
      && this.faites() < this.etapes().length
      && !this.estMasquee();
  });

  private cle(): string {
    return `parcours-accueil-masque:${this.email()}`;
  }

  private estMasquee(): boolean {
    if (this.masquee() === this.email()) {
      return true;
    }
    try {
      return localStorage.getItem(this.cle()) === '1';
    } catch {
      return false;
    }
  }

  protected masquer(): void {
    try {
      localStorage.setItem(this.cle(), '1');
    } catch {
      // Stockage indisponible : masqué pour cette visite seulement.
    }
    this.masquee.set(this.email());
  }
}
