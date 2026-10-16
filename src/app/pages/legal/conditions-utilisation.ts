import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LangueService } from '../../i18n/langue.service';
import { DateLPipe } from '../../i18n/t.pipe';
import { DATE_MISE_A_JOUR, EDITEUR, VERSION_CONDITIONS, aCompleter } from './legal-info';
import { Icone } from '../../components/icone/icone';

/**
 * Conditions d'utilisation (/conditions-utilisation), acceptées à l'inscription.
 */
@Component({
  selector: 'app-conditions-utilisation',
  standalone: true,
  imports: [Icone, RouterLink, DateLPipe],
  templateUrl: './conditions-utilisation.html',
  styleUrl: './legal.scss'
})
export class ConditionsUtilisation {
  protected readonly langue = inject(LangueService);
  protected readonly editeur = EDITEUR;
  protected readonly dateMiseAJour = DATE_MISE_A_JOUR;
  protected readonly version = VERSION_CONDITIONS;
  protected readonly aCompleter = aCompleter;
}
