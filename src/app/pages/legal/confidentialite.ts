import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LangueService } from '../../i18n/langue.service';
import { DateLPipe } from '../../i18n/t.pipe';
import {
  CONSERVATION_RAPPORTS_ERREUR,
  CONSERVATION_RAPPORTS_ERREUR_EN,
  DATE_MISE_A_JOUR,
  EDITEUR,
  GARANTIES_TRANSFERT,
  GARANTIES_TRANSFERT_EN,
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
  imports: [RouterLink, DateLPipe],
  templateUrl: './confidentialite.html',
  styleUrl: './legal.scss'
})
export class Confidentialite {
  protected readonly langue = inject(LangueService);
  protected readonly editeur = EDITEUR;
  protected readonly hebergeurs = HEBERGEURS;
  protected readonly garantiesTransfert = GARANTIES_TRANSFERT;
  protected readonly garantiesTransfertEn = GARANTIES_TRANSFERT_EN;
  protected readonly dateMiseAJour = DATE_MISE_A_JOUR;
  protected readonly conservationRapportsErreur = CONSERVATION_RAPPORTS_ERREUR;
  protected readonly conservationRapportsErreurEn = CONSERVATION_RAPPORTS_ERREUR_EN;
  protected readonly version = VERSION_CONDITIONS;
  protected readonly aCompleter = aCompleter;
}
