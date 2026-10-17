// ============================================================
// « ASTUCE DU JOUR » (MON ESPACE)
// ============================================================
//
// Un conseil pratique tiré des démarches suivies par l'étudiant
// (GET /api/conseils/astuce-du-jour) : le même toute la journée,
// un autre le lendemain. Rien n'est affiché s'il n'y en a pas
// (204) ou si l'API ne répond pas.
// ============================================================

import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

import { environment } from '../../../environments/environment';
import { TPipe, TcPipe } from '../../i18n/t.pipe';
import { Icone } from '../icone/icone';

export interface AstuceDuJour {
  texte: string;
  texteEn: string | null;
  demarcheId: number;
  demarcheTitre: string;
  demarcheTitreEn: string | null;
}

@Component({
  selector: 'app-astuce-du-jour',
  standalone: true,
  imports: [RouterLink, TPipe, TcPipe, Icone],
  templateUrl: './astuce-du-jour.html',
  styleUrl: './astuce-du-jour.scss'
})
export class AstuceDuJourCarte implements OnInit {

  private readonly http = inject(HttpClient);

  protected readonly astuce = signal<AstuceDuJour | null>(null);

  ngOnInit(): void {
    this.http.get<AstuceDuJour | null>(`${environment.apiUrl}/conseils/astuce-du-jour`).subscribe({
      next: (astuce) => this.astuce.set(astuce?.texte ? astuce : null),
      error: () => this.astuce.set(null)
    });
  }
}
