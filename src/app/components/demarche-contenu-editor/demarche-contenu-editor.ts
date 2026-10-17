// ============================================================
// ÉDITEUR DES ÉTAPES, DES LIENS OFFICIELS ET DES CONSEILS D'UNE DÉMARCHE
// ============================================================
//
// Utilisé dans « Gestion des démarches » (bouton « 📝 Contenu »).
// Toutes les opérations appellent /api/admin/demarches/{id}/...
// et l'API renvoie à chaque fois le contenu complet à jour.
// ============================================================

import { Component, Input, OnInit, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

interface Etape {
  id: number;
  numero: number;
  titre: string;
  description: string | null;
}

interface Lien {
  id: number;
  nom: string;
  url: string;
  description: string | null;
}

/** Conseil pratique (texteEn : version anglaise facultative). */
interface Conseil {
  id: number;
  texte: string;
  texteEn: string | null;
}

interface Contenu {
  etapes: Etape[];
  liens: Lien[];
}

@Component({
  selector: 'app-demarche-contenu-editor',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './demarche-contenu-editor.html',
  styleUrl: './demarche-contenu-editor.scss'
})
export class DemarcheContenuEditor implements OnInit {

  private http = inject(HttpClient);

  @Input({ required: true }) demarcheId!: number;

  /** Fiche Service-Public d'origine : une mise à jour officielle remplacerait ce contenu. */
  @Input() sourceId: string | null | undefined = null;

  etapes: Etape[] = [];
  liens: Lien[] = [];
  conseils: Conseil[] = [];

  chargement = true;
  enCours = false;
  erreur = '';
  message = '';

  /** Formulaires d'ajout. */
  nouvelleEtape = { titre: '', description: '' };
  nouveauLien = { nom: '', url: '', description: '' };
  nouveauConseil = { texte: '', texteEn: '' };

  /** Élément en cours de modification (copie éditée). */
  etapeEditee: Etape | null = null;
  lienEdite: Lien | null = null;
  conseilEdite: Conseil | null = null;

  private get url(): string {
    return `${environment.apiUrl}/admin/demarches/${this.demarcheId}`;
  }

  ngOnInit(): void {
    this.http.get<Contenu>(`${this.url}/contenu`).subscribe({
      next: (contenu) => {
        this.chargement = false;
        this.appliquer(contenu);
      },
      error: () => {
        this.chargement = false;
        this.erreur = 'Impossible de charger les étapes et les liens.';
      }
    });

    this.http.get<Conseil[]>(`${this.url}/conseils`).subscribe({
      next: (conseils) => this.conseils = conseils ?? [],
      error: () => this.erreur = 'Impossible de charger les conseils.'
    });
  }


  // ==========================================================
  // ÉTAPES
  // ==========================================================

  ajouterEtape(): void {
    this.executer(
      this.http.post<Contenu>(`${this.url}/etapes`, this.nouvelleEtape),
      'Étape ajoutée.',
      () => this.nouvelleEtape = { titre: '', description: '' }
    );
  }

  modifierEtape(): void {
    if (!this.etapeEditee) {
      return;
    }
    const { id, titre, description } = this.etapeEditee;
    this.executer(
      this.http.put<Contenu>(`${this.url}/etapes/${id}`, { titre, description }),
      'Étape modifiée.',
      () => this.etapeEditee = null
    );
  }

  supprimerEtape(etape: Etape): void {
    if (!confirm(`Supprimer l'étape ${etape.numero} « ${etape.titre} » ?`)) {
      return;
    }
    this.executer(this.http.delete<Contenu>(`${this.url}/etapes/${etape.id}`), 'Étape supprimée.');
  }

  /** Monte (-1) ou descend (+1) une étape. */
  deplacer(index: number, sens: -1 | 1): void {
    const cible = index + sens;
    if (cible < 0 || cible >= this.etapes.length) {
      return;
    }

    const ids = this.etapes.map((e) => e.id);
    [ids[index], ids[cible]] = [ids[cible], ids[index]];

    this.executer(this.http.put<Contenu>(`${this.url}/etapes/ordre`, { ids }), '');
  }

  editerEtape(etape: Etape): void {
    this.lienEdite = null;
    this.etapeEditee = { ...etape, description: etape.description ?? '' };
  }


  // ==========================================================
  // LIENS OFFICIELS
  // ==========================================================

  ajouterLien(): void {
    this.executer(
      this.http.post<Contenu>(`${this.url}/liens`, this.nouveauLien),
      'Lien ajouté.',
      () => this.nouveauLien = { nom: '', url: '', description: '' }
    );
  }

  modifierLien(): void {
    if (!this.lienEdite) {
      return;
    }
    const { id, nom, url, description } = this.lienEdite;
    this.executer(
      this.http.put<Contenu>(`${this.url}/liens/${id}`, { nom, url, description }),
      'Lien modifié.',
      () => this.lienEdite = null
    );
  }

  supprimerLien(lien: Lien): void {
    if (!confirm(`Supprimer le lien « ${lien.nom} » ?`)) {
      return;
    }
    this.executer(this.http.delete<Contenu>(`${this.url}/liens/${lien.id}`), 'Lien supprimé.');
  }

  editerLien(lien: Lien): void {
    this.etapeEditee = null;
    this.lienEdite = { ...lien, description: lien.description ?? '' };
  }


  // ==========================================================
  // CONSEILS PRATIQUES
  // ==========================================================

  ajouterConseil(): void {
    this.executer(
      this.http.post<Conseil[]>(`${this.url}/conseils`, this.nouveauConseil),
      'Conseil ajouté.',
      () => this.nouveauConseil = { texte: '', texteEn: '' },
      (conseils) => this.conseils = conseils
    );
  }

  modifierConseil(): void {
    if (!this.conseilEdite) {
      return;
    }
    const { id, texte, texteEn } = this.conseilEdite;
    this.executer(
      this.http.put<Conseil[]>(`${this.url}/conseils/${id}`, { texte, texteEn }),
      'Conseil modifié.',
      () => this.conseilEdite = null,
      (conseils) => this.conseils = conseils
    );
  }

  supprimerConseil(conseil: Conseil): void {
    if (!confirm(`Supprimer le conseil « ${conseil.texte} » ?`)) {
      return;
    }
    this.executer(
      this.http.delete<Conseil[]>(`${this.url}/conseils/${conseil.id}`),
      'Conseil supprimé.',
      undefined,
      (conseils) => this.conseils = conseils
    );
  }

  editerConseil(conseil: Conseil): void {
    this.etapeEditee = null;
    this.lienEdite = null;
    this.conseilEdite = { ...conseil, texteEn: conseil.texteEn ?? '' };
  }


  // ==========================================================
  // OUTILS
  // ==========================================================

  /**
   * Lance une opération ; par défaut la réponse est le contenu (étapes + liens),
   * `appliquerReponse` sert aux autres réponses (liste des conseils).
   */
  private executer<T = Contenu>(
    requete: Observable<T>,
    succes: string,
    ensuite?: () => void,
    appliquerReponse: (reponse: T) => void = (reponse) => this.appliquer(reponse as Contenu)
  ): void {
    if (this.enCours) {
      return;
    }

    this.enCours = true;
    this.erreur = '';
    this.message = '';

    requete.subscribe({
      next: (contenu) => {
        this.enCours = false;
        appliquerReponse(contenu);
        this.message = succes;
        ensuite?.();
      },
      error: (error: HttpErrorResponse) => {
        this.enCours = false;
        // Erreur de validation : le premier message de champ est le plus précis.
        const champs = error.error?.errors ? Object.values(error.error.errors) as string[] : [];
        this.erreur = champs[0] || error.error?.message || 'L\'opération a échoué.';
      }
    });
  }

  private appliquer(contenu: Contenu): void {
    this.etapes = contenu?.etapes ?? [];
    this.liens = contenu?.liens ?? [];
  }
}
