// ============================================================
// DOUBLE AUTHENTIFICATION (COMPTE ADMINISTRATEUR)
// ============================================================
//
// Section de « Mon compte » (admin) :
// - activation en deux temps : QR code à scanner, puis premier code
//   de l'application pour confirmer (le compte n'est jamais bloqué
//   par une configuration ratée) ;
// - dix codes de secours affichés UNE seule fois (copier / télécharger) ;
// - ensuite : nouveaux codes de secours, ou désactivation
//   (mot de passe + code exigés).
//
// Le QR code est dessiné en SVG ici même (qrcode-generator) :
// le secret ne quitte jamais le navigateur vers un service tiers.
// ============================================================

import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import qrcode from 'qrcode-generator';

import { environment } from '../../../environments/environment';
import { Icone } from '../icone/icone';

interface Etat {
  active: boolean;
  codesSecoursRestants: number;
}

interface Preparation {
  secret: string;
  uri: string;
}

type Formulaire = 'codes' | 'desactiver' | null;

/** Modules sombres du QR code, en un seul chemin SVG (1 unité = 1 module). */
export function cheminQrCode(texte: string): { taille: number; chemin: string } {
  const qr = qrcode(0, 'M');
  qr.addData(texte);
  qr.make();

  const taille = qr.getModuleCount();
  let chemin = '';
  for (let ligne = 0; ligne < taille; ligne++) {
    for (let colonne = 0; colonne < taille; colonne++) {
      if (qr.isDark(ligne, colonne)) {
        chemin += `M${colonne} ${ligne}h1v1h-1z`;
      }
    }
  }
  return { taille, chemin };
}

@Component({
  selector: 'app-double-authentification',
  standalone: true,
  imports: [FormsModule, Icone],
  templateUrl: './double-authentification.html',
  styleUrl: './double-authentification.scss'
})
export class DoubleAuthentification implements OnInit {

  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/account/2fa`;

  protected readonly etat = signal<Etat | null>(null);
  protected readonly preparation = signal<Preparation | null>(null);
  protected readonly codesSecours = signal<string[] | null>(null);
  protected readonly formulaire = signal<Formulaire>(null);

  protected readonly chargement = signal(false);
  protected readonly erreur = signal('');
  protected readonly succes = signal('');

  protected code = '';
  protected motDePasse = '';

  protected readonly qr = computed(() => {
    const preparation = this.preparation();
    return preparation ? cheminQrCode(preparation.uri) : null;
  });

  /** Clé à saisir à la main, par groupes de 4 caractères. */
  protected readonly cleLisible = computed(() =>
    this.preparation()?.secret.match(/.{1,4}/g)?.join(' ') ?? '');

  ngOnInit(): void {
    this.charger();
  }

  private charger(): void {
    this.http.get<Etat>(this.api).subscribe({
      next: (etat) => this.etat.set(etat),
      error: () => this.erreur.set("Impossible de charger l'état de la double authentification.")
    });
  }

  protected commencer(): void {
    this.reinitialiserMessages();
    this.chargement.set(true);
    this.http.post<Preparation>(`${this.api}/preparer`, {}).subscribe({
      next: (preparation) => {
        this.chargement.set(false);
        this.preparation.set(preparation);
        this.code = '';
      },
      error: (erreur: HttpErrorResponse) => this.echec(erreur)
    });
  }

  protected annulerPreparation(): void {
    this.preparation.set(null);
    this.code = '';
    this.reinitialiserMessages();
  }

  protected confirmerActivation(): void {
    if (!this.verifierCodeSaisi()) {
      return;
    }
    this.chargement.set(true);
    this.http.post<{ codesSecours: string[] }>(`${this.api}/activer`, { code: this.code.trim() }).subscribe({
      next: ({ codesSecours }) => {
        this.chargement.set(false);
        this.preparation.set(null);
        this.codesSecours.set(codesSecours);
        this.etat.set({ active: true, codesSecoursRestants: codesSecours.length });
        this.code = '';
        this.succes.set('La double authentification est activée. Un code vous sera demandé à chaque connexion.');
      },
      error: (erreur: HttpErrorResponse) => this.echec(erreur)
    });
  }

  protected ouvrir(formulaire: Formulaire): void {
    this.reinitialiserMessages();
    this.codesSecours.set(null);
    this.formulaire.set(formulaire);
    this.code = '';
    this.motDePasse = '';
  }

  protected regenererCodes(): void {
    if (!this.verifierCodeSaisi()) {
      return;
    }
    this.chargement.set(true);
    this.http.post<{ codesSecours: string[] }>(`${this.api}/codes-secours`, { code: this.code.trim() }).subscribe({
      next: ({ codesSecours }) => {
        this.chargement.set(false);
        this.formulaire.set(null);
        this.codesSecours.set(codesSecours);
        this.etat.set({ active: true, codesSecoursRestants: codesSecours.length });
        this.code = '';
        this.succes.set('Nouveaux codes de secours créés : les anciens ne fonctionnent plus.');
      },
      error: (erreur: HttpErrorResponse) => this.echec(erreur)
    });
  }

  protected desactiver(): void {
    this.reinitialiserMessages();
    if (!this.motDePasse) {
      this.erreur.set('Saisissez votre mot de passe.');
      return;
    }
    if (!this.verifierCodeSaisi()) {
      return;
    }
    this.chargement.set(true);
    this.http.post(`${this.api}/desactiver`, { motDePasse: this.motDePasse, code: this.code.trim() }).subscribe({
      next: () => {
        this.chargement.set(false);
        this.formulaire.set(null);
        this.etat.set({ active: false, codesSecoursRestants: 0 });
        this.code = '';
        this.motDePasse = '';
        this.succes.set('La double authentification est désactivée.');
      },
      error: (erreur: HttpErrorResponse) => {
        this.motDePasse = '';
        this.echec(erreur);
      }
    });
  }

  protected copierCodes(): void {
    const codes = this.codesSecours();
    if (!codes) {
      return;
    }
    navigator.clipboard?.writeText(codes.join('\n')).then(
      () => this.succes.set('Codes copiés dans le presse-papiers.'),
      () => this.erreur.set('Copie impossible : sélectionnez les codes et copiez-les à la main.')
    );
  }

  protected telechargerCodes(): void {
    const codes = this.codesSecours();
    if (!codes) {
      return;
    }
    const contenu = [
      'MyStudentGuide - codes de secours (double authentification)',
      'Chaque code ne sert qu\'une fois. Conservez ce fichier en lieu sûr.',
      '',
      ...codes
    ].join('\r\n');

    const lien = document.createElement('a');
    lien.href = URL.createObjectURL(new Blob([contenu], { type: 'text/plain;charset=utf-8' }));
    lien.download = 'mystudentguide-codes-de-secours.txt';
    lien.click();
    setTimeout(() => URL.revokeObjectURL(lien.href), 1000);
  }

  protected fermerCodes(): void {
    this.codesSecours.set(null);
    this.succes.set('');
  }

  private verifierCodeSaisi(): boolean {
    this.reinitialiserMessages();
    if (!this.code.trim()) {
      this.erreur.set('Saisissez le code affiché par votre application.');
      return false;
    }
    return true;
  }

  private echec(erreur: HttpErrorResponse): void {
    this.chargement.set(false);
    this.code = '';
    this.erreur.set(erreur.status === 0
      ? 'Impossible de joindre le serveur. Réessayez plus tard.'
      : erreur.error?.message || 'Une erreur est survenue. Réessayez.');
  }

  private reinitialiserMessages(): void {
    this.erreur.set('');
    this.succes.set('');
  }
}
