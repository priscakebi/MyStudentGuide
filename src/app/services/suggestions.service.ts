// ============================================================
// SUGGESTIONS DES CHAMPS DU PROFIL (saisie assistée)
// ============================================================
//
// - nationalités et établissements : listes intégrées au site
//   (chargées à la demande, aucune requête extérieure) ;
// - villes : API Découpage administratif (geo.api.gouv.fr) ;
// - adresses : Base Adresse Nationale via la Géoplateforme de l'IGN.
//
// Seul le texte saisi est envoyé aux deux services publics (pas de
// cookie, pas d'identifiant) ; voir la politique de confidentialité.
// ============================================================

import { Injectable, inject } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { Observable, catchError, from, map, of } from 'rxjs';

import { LangueService } from '../i18n/langue.service';
import { normaliser } from '../utils/recherche';

/** Une proposition : valeur enregistrée, texte affiché, précision (pays, ville…). */
export interface Suggestion {
  valeur: string;
  libelle: string;
  detail?: string;
}

const MAX = 8;

interface CommuneGeo {
  nom: string;
  codesPostaux?: string[];
  departement?: { nom: string; code: string };
}

interface ReponseAdresses {
  features?: { properties: { label: string; context?: string } }[];
}

@Injectable({ providedIn: 'root' })
export class SuggestionsService {

  // Requêtes vers les services publics sans l'intercepteur d'authentification :
  // le jeton de connexion ne doit jamais leur être envoyé.
  private readonly http = new HttpClient(inject(HttpBackend));
  private readonly langue = inject(LangueService);

  /** Nationalités (valeur enregistrée : forme française au féminin, ex. « Ivoirienne »). */
  nationalites(texte: string): Observable<Suggestion[]> {
    return from(import('../data/nationalites')).pipe(
      map(({ NATIONALITES }) => {
        const anglais = this.langue.langue() === 'en';
        const q = normaliser(texte);
        return classer(
          NATIONALITES.map(([fr, en, pays, country]) => ({
            suggestion: { valeur: fr, libelle: anglais ? en : fr, detail: anglais ? country : pays },
            principal: normaliser(anglais ? en : fr),
            autres: normaliser(`${fr} ${en} ${pays} ${country}`)
          })),
          q
        );
      })
    );
  }

  /** Universités et grandes écoles (liste officielle du ministère). */
  etablissements(texte: string): Observable<Suggestion[]> {
    return from(import('../data/etablissements-superieur')).pipe(
      map(({ ETABLISSEMENTS }) => classer(
        ETABLISSEMENTS.map(([nom, autres, ville]) => ({
          suggestion: { valeur: nom, libelle: nom, detail: ville },
          principal: normaliser(nom),
          autres: normaliser(`${nom} ${autres} ${ville}`)
        })),
        normaliser(texte)
      ))
    );
  }

  /** Villes françaises ; la valeur « Saint-Denis 93200 » lève toute ambiguïté (préfecture). */
  villes(texte: string): Observable<Suggestion[]> {
    const params = {
      nom: texte.trim(),
      fields: 'nom,codesPostaux,departement',
      boost: 'population',
      limit: String(MAX)
    };
    return this.http.get<CommuneGeo[]>('https://geo.api.gouv.fr/communes', { params }).pipe(
      map((communes) => communes.map((c) => {
        const cp = c.codesPostaux?.[0] ?? '';
        return {
          valeur: cp ? `${c.nom} ${cp}` : c.nom,
          libelle: c.nom,
          detail: [cp, c.departement ? `${c.departement.nom} (${c.departement.code})` : '']
            .filter(Boolean).join(' · ')
        };
      })),
      catchError(() => of([]))
    );
  }

  /** Adresses postales en France (Base Adresse Nationale). */
  adresses(texte: string): Observable<Suggestion[]> {
    const params = { q: texte.trim(), autocomplete: '1', limit: '6', index: 'address' };
    return this.http.get<ReponseAdresses>('https://data.geopf.fr/geocodage/search', { params }).pipe(
      map((reponse) => (reponse.features ?? []).map((f) => ({
        valeur: f.properties.label,
        libelle: f.properties.label,
        detail: f.properties.context
      }))),
      catchError(() => of([]))
    );
  }
}

/**
 * Filtre et trie une liste locale : début du libellé d'abord, puis début
 * d'un mot, puis texte contenu n'importe où (nom, pays, sigle, ville…).
 */
export function classer(
  elements: { suggestion: Suggestion; principal: string; autres: string }[],
  q: string
): Suggestion[] {
  if (!q) {
    return [];
  }
  const rang = (e: { principal: string; autres: string }): number => {
    if (e.principal.startsWith(q)) return 0;
    if (` ${e.autres}`.includes(` ${q}`)) return 1;
    if (e.autres.includes(q)) return 2;
    return -1;
  };
  return elements
    .map((e) => ({ e, r: rang(e) }))
    .filter(({ r }) => r >= 0)
    .sort((a, b) => a.r - b.r || a.e.suggestion.libelle.localeCompare(b.e.suggestion.libelle, 'fr'))
    .slice(0, MAX)
    .map(({ e }) => e.suggestion);
}
