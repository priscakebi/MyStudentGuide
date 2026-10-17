// ============================================================
// CHAMP TÉLÉPHONE INTERNATIONAL (profil)
// ============================================================
//
// <app-champ-telephone inputId="telephone" name="telephone"
//   [(ngModel)]="profileForm.telephone" required />
//
// - choix du pays (indicatif), noms de pays dans la langue de l'interface
//   (Intl.DisplayNames du navigateur) ;
// - valeur enregistrée au format international E.164 : « +33612345678 » ;
// - « +225… » tapé directement sélectionne le pays correspondant ;
// - les anciens numéros français (« 0612345678 ») sont repris tels quels.
// ============================================================

import { Component, booleanAttribute, computed, forwardRef, inject, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  AsYouType, CountryCode, getCountries, getCountryCallingCode, parsePhoneNumberFromString
} from 'libphonenumber-js';

import { LangueService } from '../../i18n/langue.service';
import { TPipe } from '../../i18n/t.pipe';

/** Pays proposé par défaut (étudiants en France). */
const PAYS_PAR_DEFAUT: CountryCode = 'FR';

@Component({
  selector: 'app-champ-telephone',
  standalone: true,
  imports: [TPipe],
  templateUrl: './champ-telephone.html',
  styleUrl: './champ-telephone.scss',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ChampTelephone), multi: true }]
})
export class ChampTelephone implements ControlValueAccessor {

  private readonly langue = inject(LangueService);

  readonly inputId = input.required<string>();
  readonly placeholder = input('');
  readonly describedBy = input<string | null>(null);
  readonly required = input(false, { transform: booleanAttribute });

  protected readonly pays = signal<CountryCode>(PAYS_PAR_DEFAUT);
  protected readonly numero = signal('');
  protected readonly desactive = signal(false);

  /** Pays triés par nom dans la langue de l'interface : « +225 · Côte d'Ivoire ». */
  protected readonly listePays = computed(() => {
    const locale = this.langue.langue();
    const noms = new Intl.DisplayNames([locale], { type: 'region' });
    return getCountries()
      .map((code) => ({ code, nom: noms.of(code) ?? code, indicatif: getCountryCallingCode(code) }))
      .sort((a, b) => a.nom.localeCompare(b.nom, locale));
  });

  private onChange: (valeur: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(valeur: string | null): void {
    const texte = (valeur ?? '').trim();
    if (!texte) {
      this.numero.set('');
      return;
    }
    const numero = parsePhoneNumberFromString(texte, PAYS_PAR_DEFAUT);
    if (numero?.country) {
      this.pays.set(numero.country);
      this.numero.set(numero.formatNational());
    } else {
      this.numero.set(texte);
    }
  }

  registerOnChange(fn: (valeur: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(desactive: boolean): void {
    this.desactive.set(desactive);
  }

  protected choisirPays(code: string): void {
    this.pays.set(code as CountryCode);
    this.emettre();
  }

  protected saisir(texte: string): void {
    // « +225 07… » : le pays est déduit de l'indicatif tapé.
    if (texte.trim().startsWith('+')) {
      const formateur = new AsYouType();
      formateur.input(texte);
      const pays = formateur.getCountry();
      if (pays) {
        this.pays.set(pays);
      }
    }
    this.numero.set(texte);
    this.emettre();
  }

  protected quitter(): void {
    this.onTouched();
    // Mise en forme lisible une fois le numéro saisi (« 06 12 34 56 78 »).
    const numero = parsePhoneNumberFromString(this.numero(), this.pays());
    if (numero?.isValid()) {
      this.pays.set(numero.country ?? this.pays());
      this.numero.set(numero.formatNational());
    }
  }

  /** Valeur transmise au formulaire : format international si le numéro est lisible. */
  private emettre(): void {
    const texte = this.numero().trim();
    if (!texte) {
      this.onChange('');
      return;
    }
    const numero = parsePhoneNumberFromString(texte, this.pays());
    this.onChange(numero ? numero.number : texte);
  }
}

/** Vrai si le numéro (format international ou ancien format français) est valide. */
export function telephoneValide(valeur: string | null | undefined): boolean {
  const numero = parsePhoneNumberFromString((valeur ?? '').trim(), PAYS_PAR_DEFAUT);
  return !!numero?.isValid();
}

/** Numéro lisible pour l'affichage : « +33 6 12 34 56 78 ». */
export function telephoneLisible(valeur: string | null | undefined): string {
  const numero = parsePhoneNumberFromString((valeur ?? '').trim(), PAYS_PAR_DEFAUT);
  return numero?.isValid() ? numero.formatInternational() : (valeur ?? '');
}
