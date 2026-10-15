// ============================================================
// CARTE « MA PRÉFECTURE »
// ============================================================
//
// Préfecture compétente pour la ville d'études du profil
// (GET /api/annuaire/prefecture/me), d'après l'API Annuaire
// de l'administration (DILA).
//
// - 200 : adresse, téléphone, horaires, rendez-vous, itinéraire ;
// - 204 : ville non renseignée ou inconnue → lien vers le profil.
//
// Utilisée sur le dashboard étudiant et sur les démarches qui
// se font en préfecture.
// ============================================================

import { Component, Input, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

import { environment } from '../../../environments/environment';

export interface PrefectureInfo {
  nom: string;
  ville: string;
  departement: string;
  adresse: string | null;
  telephone: string | null;
  horaires: string[];
  rendezVous: string | null;
  siteInternet: string | null;
  contact: string | null;
  ficheAnnuaire: string | null;
  latitude: string | null;
  longitude: string | null;
}

@Component({
  selector: 'app-prefecture-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './prefecture-card.html',
  styleUrl: './prefecture-card.scss'
})
export class PrefectureCard implements OnInit {

  private http = inject(HttpClient);

  /** Titre de la carte (ex. : « Votre préfecture pour cette démarche »). */
  @Input() titre = 'Ma préfecture';

  prefecture: PrefectureInfo | null = null;
  chargement = true;

  /** Vrai si la ville d'études n'est pas renseignée ou pas reconnue. */
  villeManquante = false;

  /** Vrai si l'annuaire ne répond pas. */
  indisponible = false;

  ngOnInit(): void {
    this.http.get<PrefectureInfo>(
      `${environment.apiUrl}/annuaire/prefecture/me`,
      { observe: 'response' }
    ).subscribe({
      next: (reponse) => {
        this.chargement = false;
        this.prefecture = reponse.status === 200 ? reponse.body : null;
        this.villeManquante = reponse.status === 204;
      },
      error: () => {
        this.chargement = false;
        this.indisponible = true;
      }
    });
  }

  /** Itinéraire (OpenStreetMap) vers l'adresse de la préfecture. */
  get itineraire(): string | null {
    const p = this.prefecture;
    if (!p) {
      return null;
    }
    if (p.latitude && p.longitude) {
      return `https://www.openstreetmap.org/directions?to=${p.latitude},${p.longitude}`;
    }
    return p.adresse
      ? `https://www.openstreetmap.org/search?query=${encodeURIComponent(p.adresse)}`
      : null;
  }

  /** Lien « tel: » sans espaces. */
  get lienTelephone(): string | null {
    return this.prefecture?.telephone
      ? 'tel:' + this.prefecture.telephone.replace(/\s/g, '')
      : null;
  }
}
