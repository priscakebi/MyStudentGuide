import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DateLPipe, TPipe, TcPipe } from '../../i18n/t.pipe';
import { NouveautesService } from '../../services/nouveautes.service';
import { Icone } from '../../components/icone/icone';
import { NOUVEAUTES, Nouveaute } from './nouveautes.data';

interface Groupe {
  date: string;
  nouveautes: Nouveaute[];
}

/**
 * Nouveautés du site (/nouveautes), regroupées par date, la plus récente d'abord.
 * Les entrées publiées depuis la dernière visite sont signalées, puis la page
 * les marque comme vues (le badge du menu disparaît).
 */
@Component({
  selector: 'app-nouveautes',
  standalone: true,
  imports: [RouterLink, TPipe, TcPipe, DateLPipe, Icone],
  templateUrl: './nouveautes.html',
  styleUrl: './nouveautes.scss'
})
export class Nouveautes implements OnInit {

  private readonly service = inject(NouveautesService);

  protected readonly groupes: Groupe[] = NOUVEAUTES
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .reduce<Groupe[]>((groupes, nouveaute) => {
      const dernier = groupes[groupes.length - 1];
      if (dernier?.date === nouveaute.date) {
        dernier.nouveautes.push(nouveaute);
      } else {
        groupes.push({ date: nouveaute.date, nouveautes: [nouveaute] });
      }
      return groupes;
    }, []);

  /** Date de la dernière nouveauté vue AVANT cette visite (null : première visite). */
  protected readonly vueAvant = this.service.derniereVue();

  ngOnInit(): void {
    this.service.marquerVues();
  }

  protected estNouvelle(nouveaute: Nouveaute): boolean {
    return this.vueAvant !== null && nouveaute.date > this.vueAvant;
  }
}
