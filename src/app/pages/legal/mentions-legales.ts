import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LangueService } from '../../i18n/langue.service';
import { DATE_MISE_A_JOUR, EDITEUR, HEBERGEURS, aCompleter } from './legal-info';

/**
 * Mentions légales (/mentions-legales) : éditeur, hébergeurs,
 * propriété intellectuelle et origine des informations.
 * Texte en français (version qui fait foi), y compris en interface anglaise.
 */
@Component({
  selector: 'app-mentions-legales',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './mentions-legales.html',
  styleUrl: './legal.scss'
})
export class MentionsLegales {
  protected readonly langue = inject(LangueService);
  protected readonly editeur = EDITEUR;
  protected readonly hebergeurs = HEBERGEURS;
  protected readonly dateMiseAJour = DATE_MISE_A_JOUR;
  protected readonly aCompleter = aCompleter;
}
