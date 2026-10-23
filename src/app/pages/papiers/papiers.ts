// ============================================================
// « MES PAPIERS » : DATES D'EXPIRATION DES DOCUMENTS
// ============================================================
//
// L'étudiant note la date d'expiration de ses documents (passeport,
// assurance, carte étudiante...) ; l'API le prévient 3 mois, 1 mois
// et 1 semaine avant (DocumentPersonnelService). Aucun fichier n'est
// envoyé. API : /api/mes-papiers (la liste à jour est renvoyée à
// chaque opération).
// ============================================================

import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Cle } from '../../i18n/textes';
import { LangueService } from '../../i18n/langue.service';
import { DateLPipe, TPipe } from '../../i18n/t.pipe';
import { Icone } from '../../components/icone/icone';

export const TYPES_PAPIERS = [
  'PASSEPORT', 'CARTE_IDENTITE', 'VISA', 'CARTE_ETUDIANT',
  'ASSURANCE_HABITATION', 'MUTUELLE', 'BAIL', 'PERMIS_CONDUIRE', 'AUTRE'
] as const;

export type TypePapier = typeof TYPES_PAPIERS[number];

export interface Papier {
  id: number;
  type: TypePapier;
  libelle: string | null;
  dateExpiration: string;
}

/** Rappels envoyés à 90, 30 et 7 jours : on signale ce qui arrive dans les 90 jours. */
const JOURS_ALERTE = 90;

@Component({
  selector: 'app-papiers',
  standalone: true,
  imports: [FormsModule, RouterLink, TPipe, DateLPipe, Icone],
  templateUrl: './papiers.html',
  styleUrl: './papiers.scss'
})
export class Papiers implements OnInit {

  private readonly http = inject(HttpClient);
  protected readonly langue = inject(LangueService);
  private readonly api = `${environment.apiUrl}/mes-papiers`;

  protected readonly types = TYPES_PAPIERS;

  protected readonly papiers = signal<Papier[]>([]);
  protected readonly chargement = signal(true);
  protected readonly enCours = signal(false);
  protected readonly erreur = signal('');
  protected readonly succes = signal('');

  /** Formulaire : ajout (id null) ou modification. */
  protected formulaire: { id: number | null; type: TypePapier | ''; libelle: string; dateExpiration: string } =
    this.formulaireVide();

  ngOnInit(): void {
    this.http.get<Papier[]>(this.api).subscribe({
      next: (papiers) => {
        this.papiers.set(papiers);
        this.chargement.set(false);
      },
      error: () => {
        this.chargement.set(false);
        this.erreur.set(this.langue.t('papiers.erreur.serveur'));
      }
    });
  }

  protected cleType(type: TypePapier): Cle {
    return `papiers.type.${type}` as Cle;
  }

  protected nom(papier: Papier): string {
    return papier.libelle?.trim() || this.langue.t(this.cleType(papier.type));
  }

  /** Jours restants avant l'expiration (négatif : expiré). */
  protected joursRestants(papier: Papier): number {
    const aujourdHui = new Date();
    aujourdHui.setHours(0, 0, 0, 0);
    const fin = new Date(`${papier.dateExpiration}T00:00:00`);
    return Math.round((fin.getTime() - aujourdHui.getTime()) / 86_400_000);
  }

  protected statut(papier: Papier): 'expire' | 'bientot' | 'valide' {
    const jours = this.joursRestants(papier);
    return jours < 0 ? 'expire' : jours <= JOURS_ALERTE ? 'bientot' : 'valide';
  }

  protected get formulaireValide(): boolean {
    const f = this.formulaire;
    return !!f.type && !!f.dateExpiration && (f.type !== 'AUTRE' || !!f.libelle.trim());
  }

  protected enregistrer(): void {
    this.erreur.set('');
    this.succes.set('');
    if (!this.formulaireValide) {
      this.erreur.set(this.langue.t('papiers.erreur.champs'));
      return;
    }

    const { id, type, libelle, dateExpiration } = this.formulaire;
    const corps = { type, libelle: libelle.trim() || null, dateExpiration };
    const requete = id === null
      ? this.http.post<Papier[]>(this.api, corps)
      : this.http.put<Papier[]>(`${this.api}/${id}`, corps);

    this.executer(requete, id === null ? 'papiers.ajoute' : 'papiers.modifie', () => {
      this.formulaire = this.formulaireVide();
    });
  }

  protected editer(papier: Papier): void {
    this.erreur.set('');
    this.succes.set('');
    this.formulaire = {
      id: papier.id,
      type: papier.type,
      libelle: papier.libelle ?? '',
      dateExpiration: papier.dateExpiration
    };
    document.getElementById('papier-type')?.focus();
  }

  protected annuler(): void {
    this.formulaire = this.formulaireVide();
    this.erreur.set('');
  }

  protected supprimer(papier: Papier): void {
    if (!confirm(this.langue.t('papiers.confirmerSuppression', { nom: this.nom(papier) }))) {
      return;
    }
    this.executer(this.http.delete<Papier[]>(`${this.api}/${papier.id}`), 'papiers.supprime', () => {
      if (this.formulaire.id === papier.id) {
        this.formulaire = this.formulaireVide();
      }
    });
  }

  private executer(requete: Observable<Papier[]>, succes: Cle, ensuite: () => void): void {
    this.enCours.set(true);
    requete.subscribe({
      next: (papiers) => {
        this.enCours.set(false);
        this.papiers.set(papiers);
        this.succes.set(this.langue.t(succes));
        ensuite();
      },
      error: (erreur: HttpErrorResponse) => {
        this.enCours.set(false);
        const champs = erreur.error?.errors ? Object.values(erreur.error.errors) as string[] : [];
        this.erreur.set(this.langue.messageApi(champs[0] || erreur.error?.message, 'papiers.erreur.serveur'));
      }
    });
  }

  private formulaireVide() {
    return { id: null, type: '' as TypePapier | '', libelle: '', dateExpiration: '' };
  }
}
