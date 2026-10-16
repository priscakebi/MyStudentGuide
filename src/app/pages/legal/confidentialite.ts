import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LangueService } from '../../i18n/langue.service';
import {
  CONSERVATION_RAPPORTS_ERREUR,
  DATE_MISE_A_JOUR,
  EDITEUR,
  GARANTIES_TRANSFERT,
  HEBERGEURS,
  VERSION_CONDITIONS,
  aCompleter
} from './legal-info';

/**
 * Politique de confidentialité (/confidentialite).
 *
 * Elle décrit ce que fait réellement l'application (API MyStudentGuide) :
 * à mettre à jour si les données collectées ou les durées de conservation
 * changent (et changer alors VERSION_CONDITIONS des deux côtés).
 */
@Component({
  selector: 'app-confidentialite',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './confidentialite.html',
  styleUrl: './legal.scss'
})
export class Confidentialite {
  protected readonly langue = inject(LangueService);
  protected readonly editeur = EDITEUR;
  protected readonly hebergeurs = HEBERGEURS;
  protected readonly garantiesTransfert = GARANTIES_TRANSFERT;
  protected readonly dateMiseAJour = DATE_MISE_A_JOUR;
  protected readonly conservationRapportsErreur = CONSERVATION_RAPPORTS_ERREUR;
  protected readonly version = VERSION_CONDITIONS;
  protected readonly aCompleter = aCompleter;
}
