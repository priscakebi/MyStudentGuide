import { Pipe, PipeTransform, inject } from '@angular/core';
import { formatDate } from '@angular/common';
import { LangueService, Parametres } from './langue.service';
import { Cle } from './textes';

/**
 * Texte traduit : {{ 'nav.accueil' | t }} ou {{ 'documents.compte' | t: { n: total } }}.
 *
 * Pipe « impur » : il se réévalue quand la langue change (simple lecture dans un dictionnaire).
 */
@Pipe({ name: 't', pure: false })
export class TPipe implements PipeTransform {
  private readonly langue = inject(LangueService);

  transform(cle: Cle, parametres?: Parametres): string {
    return this.langue.t(cle, parametres);
  }
}

/**
 * Date dans la langue de l'interface : {{ d | dateL: 'd MMMM y' }}
 * (« 15 octobre 2026 » / « 15 October 2026 »).
 */
@Pipe({ name: 'dateL', pure: false })
export class DateLPipe implements PipeTransform {
  private readonly langue = inject(LangueService);

  transform(valeur: string | number | Date | null | undefined, format = 'dd/MM/yyyy'): string | null {
    if (valeur === null || valeur === undefined || valeur === '') {
      return null;
    }
    return formatDate(valeur, format, this.langue.locale);
  }
}
