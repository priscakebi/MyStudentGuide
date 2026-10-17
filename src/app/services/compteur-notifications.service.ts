import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Prévient le menu de l'espace étudiant qu'une notification a été lue
 * (une seule ou « Tout marquer comme lu ») : le compteur se met à jour
 * tout de suite, sans attendre la prochaine navigation.
 */
@Injectable({ providedIn: 'root' })
export class CompteurNotificationsService {
  private readonly lues = new Subject<void>();

  readonly changement$ = this.lues.asObservable();

  signalerLecture(): void {
    this.lues.next();
  }
}
