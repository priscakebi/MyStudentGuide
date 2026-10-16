/*
 * ============================================================
 * PAGE PROFIL ÉTUDIANT
 * ============================================================
 *
 * Ce composant permet à l'étudiant de :
 *
 * - consulter son profil ;
 * - créer son profil ;
 * - modifier ses informations ;
 * - enregistrer ses modifications.
 *
 * Les données sont récupérées depuis l'API Spring Boot.
 */

import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LangueService } from '../../i18n/langue.service';
import { DateLPipe, TPipe } from '../../i18n/t.pipe';
import { Cle } from '../../i18n/textes';


/**
 * Interface représentant le profil étudiant.
 *
 * Cette interface correspond aux informations
 * présentes dans l'entité StudentProfile du backend.
 */
interface StudentProfile {

  id?: number;

  nationalite: string;

  typeVisa: string;

  universite: string;

  niveauEtudes: string;

  villeEtudes: string;

  premiereArrivee: boolean;

  typeLogement: string;

  adresse: string;

  telephone: string;

  /**
   * Dates facultatives (« AAAA-MM-JJ ») servant à calculer les dates
   * limites personnelles : ex. valider le VLS-TS 90 jours après l'arrivée.
   */
  dateArrivee?: string | null;

  dateFinTitreSejour?: string | null;

  profileCompleted?: boolean;
}


/**
 * Composant correspondant à la page "Mon profil".
 */
@Component({
  selector: 'app-profile',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    TPipe,
    DateLPipe
  ],

  templateUrl: './profile.html',

  styleUrls: ['./profile.scss']
})
export class Profile implements OnInit {

  /*
   * ==========================================================
   * CONFIGURATION API
   * ==========================================================
   */

  /**
   * Adresse de base de l'API Spring Boot.
   */
  private readonly apiUrl = environment.apiUrl;

  private readonly langue = inject(LangueService);


  /*
   * ==========================================================
   * DONNÉES DU PROFIL
   * ==========================================================
   */

  /**
   * Profil récupéré depuis le backend.
   *
   * null signifie qu'aucun profil n'existe encore.
   */
  profile: StudentProfile | null = null;


  /**
   * Données actuellement utilisées par le formulaire.
   */
  profileForm: StudentProfile = this.createEmptyProfile();


  /*
   * ==========================================================
   * ÉTATS DE LA PAGE
   * ==========================================================
   */

  /**
   * Indique si le profil est en cours de chargement.
   */
  loading = true;


  /**
   * Indique si le formulaire est affiché.
   */
  editing = false;


  /**
   * Indique si une sauvegarde est en cours.
   */
  saving = false;


  /**
   * Message affiché après une opération réussie.
   */
  successMessage = '';


  /**
   * Message affiché lorsqu'une erreur se produit.
   */
  errorMessage = '';


  /*
   * ==========================================================
   * OPTIONS DU FORMULAIRE
   * ==========================================================
   */

  /**
   * Liste des niveaux d'études disponibles.
   */
  readonly niveauxEtudes = [
    'BTS',
    'Licence',
    'Bachelor',
    'Master',
    'Doctorat',
    'Autre'
  ];


  /**
   * Liste des types de visa / séjour.
   *
   * Les valeurs correspondent aux valeurs de l'enum
   * VisaType du backend.
   */
  readonly typesVisa: { value: string; label: Cle }[] = [
    { value: 'VLS_TS_ETUDIANT', label: 'profil.visa.VLS_TS_ETUDIANT' },
    { value: 'TITRE_SEJOUR_ETUDIANT', label: 'profil.visa.TITRE_SEJOUR_ETUDIANT' },
    { value: 'COURT_SEJOUR', label: 'profil.visa.COURT_SEJOUR' },
    { value: 'AUTRE', label: 'profil.visa.AUTRE' },
    { value: 'NON_RENSEIGNE', label: 'profil.visa.NON_RENSEIGNE' }
  ];


  /**
   * Liste des types de logement.
   *
   * Les valeurs correspondent exactement à l'enum
   * LogementType du backend.
   */
  readonly typesLogement: { value: string; label: Cle }[] = [
    { value: 'CROUS', label: 'profil.logement.CROUS' },
    { value: 'LOCATION_PRIVEE', label: 'profil.logement.LOCATION_PRIVEE' },
    { value: 'HEBERGEMENT_CHEZ_UN_PROCHE', label: 'profil.logement.HEBERGEMENT_CHEZ_UN_PROCHE' },
    { value: 'HEBERGEMENT_FAMILLE', label: 'profil.logement.HEBERGEMENT_FAMILLE' },
    { value: 'RESIDENCE_ETUDIANTE', label: 'profil.logement.RESIDENCE_ETUDIANTE' },
    { value: 'SANS_LOGEMENT', label: 'profil.logement.SANS_LOGEMENT' },
    { value: 'AUTRE', label: 'profil.logement.AUTRE' },
    { value: 'NON_RENSEIGNE', label: 'profil.logement.NON_RENSEIGNE' }
  ];

  /** Libellé d'un niveau d'études (la valeur enregistrée reste en français). */
  libelleNiveau(niveau: string): string {
    return this.langue.tOu(`profil.niveau.${niveau}`, niveau);
  }


  /*
   * ==========================================================
   * INITIALISATION
   * ==========================================================
   */

  /**
   * Méthode exécutée lors de l'ouverture de la page.
   */
  ngOnInit(): void {

    // Récupère le profil de l'utilisateur connecté.
    this.loadProfile();
  }


  /*
   * ==========================================================
   * CHARGEMENT DU PROFIL
   * ==========================================================
   */

  /**
   * Récupère le profil de l'utilisateur connecté.
   */
  loadProfile(): void {

    // Réinitialise les messages.
    this.successMessage = '';
    this.errorMessage = '';

    // Active le chargement.
    this.loading = true;

    this.http
      .get<StudentProfile>(
        `${this.apiUrl}/student-profiles/me`,
        {
          headers: this.getHeaders()
        }
      )
      .subscribe({

        /**
         * Le profil existe.
         */
        next: (profile) => {

          // Stocke le profil.
          this.profile = profile;

          // Copie le profil dans le formulaire.
          this.profileForm = {
            ...profile
          };

          // Affiche le profil en mode consultation.
          this.editing = false;

          // Termine le chargement.
          this.loading = false;
        },


        /**
         * Une erreur s'est produite.
         */
        error: (error) => {

          console.error(
            'Erreur lors du chargement du profil :',
            error
          );


          /*
           * Si aucun profil n'existe encore,
           * on affiche directement le formulaire.
           */
          if (error.status === 404) {

            this.profile = null;

            this.profileForm = this.createEmptyProfile();

            this.editing = true;

            this.loading = false;

            return;
          }


          /*
           * Si le token est invalide ou expiré,
           * l'utilisateur retourne à la connexion.
           */
          if (
            error.status === 401 ||
            error.status === 403
          ) {

            localStorage.removeItem('token');

            this.router.navigate(['/login']);

            return;
          }


          // Erreur générale.
          this.errorMessage = this.langue.t('profil.erreur.chargement');

          this.loading = false;
        }
      });
  }


  /*
   * ==========================================================
   * CRÉATION D'UN PROFIL VIDE
   * ==========================================================
   */

  /**
   * Retourne un profil vide utilisé lors
   * de la première configuration.
   */
  createEmptyProfile(): StudentProfile {

    return {

      nationalite: '',

      typeVisa: '',

      universite: '',

      niveauEtudes: '',

      villeEtudes: '',

      premiereArrivee: false,

      typeLogement: '',

      adresse: '',

      telephone: '',

      dateArrivee: null,

      dateFinTitreSejour: null
    };
  }


  /*
   * ==========================================================
   * MODE MODIFICATION
   * ==========================================================
   */

  /**
   * Active le mode modification.
   *
   * Une copie du profil est créée afin de ne pas modifier
   * directement les informations affichées avant sauvegarde.
   */
  startEditing(): void {

    if (!this.profile) {
      return;
    }

    this.profileForm = {
      ...this.profile
    };

    this.successMessage = '';
    this.errorMessage = '';

    this.editing = true;
  }


  /**
   * Annule les modifications en cours.
   *
   * Les valeurs du formulaire sont remises aux dernières
   * informations enregistrées.
   */
  cancelEditing(): void {

    if (!this.profile) {
      return;
    }

    this.profileForm = {
      ...this.profile
    };

    this.successMessage = '';
    this.errorMessage = '';

    this.editing = false;
  }


  /*
   * ==========================================================
   * LIBELLÉS DU PROFIL
   * ==========================================================
   */

  /** Aujourd'hui (« AAAA-MM-JJ »), limite de la date d'arrivée. */
  readonly aujourdhui = new Date().toLocaleDateString('sv-SE');

  /**
   * Profil envoyé à l'API : un champ date vidé devient null
   * (l'API attend une date ou rien, pas une chaîne vide).
   */
  donneesAEnvoyer(): StudentProfile {
    return {
      ...this.profileForm,
      dateArrivee: this.profileForm.dateArrivee || null,
      dateFinTitreSejour: this.profileForm.dateFinTitreSejour || null
    };
  }

  /**
   * Retourne le libellé français du type de visa.
   */
  getVisaLabel(): string {

    const visa = this.typesVisa.find(
      (item) => item.value === this.profile?.typeVisa
    );

    return this.langue.t(visa?.label ?? 'profil.nonRenseigne');
  }


  /**
   * Retourne le libellé français du type de logement.
   */
  getLogementLabel(): string {

    const logement = this.typesLogement.find(
      (item) => item.value === this.profile?.typeLogement
    );

    return this.langue.t(logement?.label ?? 'profil.nonRenseigne');
  }


  /*
   * ==========================================================
   * VALIDATION NATIONALITÉ
   * ==========================================================
   */

  /**
   * Vérifie le format de la nationalité.
   *
   * Sont autorisés :
   * - les lettres ;
   * - les accents ;
   * - les espaces ;
   * - les apostrophes ;
   * - les tirets.
   *
   * Exemple valide :
   * "Ivoirienne"
   * "Sud-Africaine"
   *
   * Exemple invalide :
   * "Ivoirienne123"
   */
  isNationaliteValid(): boolean {

    const value = this.profileForm.nationalite?.trim() || '';

    if (!value) {
      return false;
    }

    return /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(value);
  }


  /*
   * ==========================================================
   * VALIDATION UNIVERSITÉ
   * ==========================================================
   */

  /**
   * Vérifie le format du nom de l'université
   * ou de l'établissement.
   *
   * On autorise :
   * - les lettres ;
   * - les accents ;
   * - les chiffres ;
   * - les espaces ;
   * - les apostrophes ;
   * - les tirets ;
   * - les parenthèses ;
   * - les points ;
   * - les virgules ;
   * - le symbole &.
   *
   * Cela permet des noms comme :
   * "Université Paris Cité"
   * "Université Paris 1 Panthéon-Sorbonne"
   * "IUT de Paris - Rives de Seine"
   */
  isUniversiteValid(): boolean {

    const value = this.profileForm.universite?.trim() || '';

    if (!value) {
      return false;
    }

    if (value.length < 2) {
      return false;
    }

    return /^[A-Za-zÀ-ÖØ-öø-ÿ0-9' .,&()/-]+$/.test(value);
  }


  /*
   * ==========================================================
   * VALIDATION VILLE
   * ==========================================================
   */

  /**
   * Vérifie le format de la ville d'études.
   *
   * Sont autorisés :
   * - les lettres ;
   * - les accents ;
   * - les espaces ;
   * - les apostrophes ;
   * - les tirets.
   *
   * Exemple valide :
   * "Paris"
   * "Saint-Germain-en-Laye"
   *
   * Exemple invalide :
   * "Paris123"
   */
  isVilleValid(): boolean {

    const value = this.profileForm.villeEtudes?.trim() || '';

    if (!value) {
      return false;
    }

    return /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(value);
  }


  /*
   * ==========================================================
   * VALIDATION ADRESSE
   * ==========================================================
   */

  /**
   * Vérifie le format général de l'adresse.
   *
   * Une adresse peut naturellement contenir :
   * - des chiffres ;
   * - des lettres ;
   * - des accents ;
   * - des espaces ;
   * - des apostrophes ;
   * - des tirets ;
   * - des virgules ;
   * - des points ;
   * - des slashs.
   *
   * Exemple valide :
   * "10 rue de Paris, 75000 Paris"
   */
  isAdresseValid(): boolean {

    const value = this.profileForm.adresse?.trim() || '';

    if (!value) {
      return false;
    }

    if (value.length < 5) {
      return false;
    }

    return /^[A-Za-zÀ-ÖØ-öø-ÿ0-9' .,\/-]+$/.test(value);
  }


  /*
   * ==========================================================
   * VALIDATION TÉLÉPHONE
   * ==========================================================
   */

  /**
   * Vérifie le format du numéro de téléphone français.
   *
   * Format accepté :
   * 01XXXXXXXX
   * 02XXXXXXXX
   * ...
   * 09XXXXXXXX
   *
   * Le numéro doit contenir exactement 10 chiffres.
   */
  isPhoneValid(): boolean {

    const value = this.profileForm.telephone?.trim() || '';

    return /^0[1-9]\d{8}$/.test(value);
  }


  /*
   * ==========================================================
   * VALIDATION GLOBALE
   * ==========================================================
   */

  /**
   * Vérifie l'ensemble des champs obligatoires
   * avant d'envoyer le formulaire au backend.
   */
  isFormValid(): boolean {

    return !!(
      this.profileForm.nationalite?.trim() &&
      this.profileForm.typeVisa &&
      this.profileForm.universite?.trim() &&
      this.profileForm.niveauEtudes &&
      this.profileForm.villeEtudes?.trim() &&
      this.profileForm.telephone?.trim() &&
      this.profileForm.typeLogement &&
      this.profileForm.adresse?.trim() &&

      // Vérification du format de la nationalité.
      this.isNationaliteValid() &&

      // Vérification du format de l'établissement.
      this.isUniversiteValid() &&

      // Vérification du format de la ville.
      this.isVilleValid() &&

      // Vérification du format de l'adresse.
      this.isAdresseValid() &&

      // Vérification du téléphone.
      this.isPhoneValid()
    );
  }


  /*
   * ==========================================================
   * CRÉATION DU PROFIL
   * ==========================================================
   */

  /**
   * Envoie le nouveau profil à l'API.
   */
  createProfile(): void {

    this.successMessage = '';
    this.errorMessage = '';


    /*
     * Vérifie toutes les validations avant
     * d'autoriser l'envoi.
     */
    if (!this.isFormValid()) {

      this.errorMessage = this.langue.t('profil.erreur.formulaire');

      return;
    }


    this.saving = true;


    this.http
      .post<StudentProfile>(
        `${this.apiUrl}/student-profiles`,
        this.donneesAEnvoyer(),
        {
          headers: this.getHeaders()
        }
      )
      .subscribe({

        /**
         * Création réussie.
         */
        next: (profile) => {

          this.profile = profile;

          this.profileForm = {
            ...profile
          };

          this.editing = false;

          this.successMessage = this.langue.t('profil.cree');

          this.saving = false;
        },


        /**
         * Création échouée.
         */
        error: (error) => {

          console.error(
            'Erreur lors de la création du profil :',
            error
          );

          this.saving = false;


          if (
            error.status === 401 ||
            error.status === 403
          ) {

            localStorage.removeItem('token');

            this.router.navigate(['/login']);

            return;
          }


          this.errorMessage =
            error.error?.message ||
            this.langue.t('profil.erreur.creation');
        }
      });
  }


  /*
   * ==========================================================
   * MODIFICATION DU PROFIL
   * ==========================================================
   */

  /**
   * Envoie les modifications du profil à l'API.
   *
   * Endpoint :
   * PUT /api/student-profiles/me
   */
  updateProfile(): void {

    this.successMessage = '';
    this.errorMessage = '';


    /*
     * Vérifie toutes les validations avant
     * d'autoriser l'envoi.
     */
    if (!this.isFormValid()) {

      this.errorMessage = this.langue.t('profil.erreur.formulaire');

      return;
    }


    this.saving = true;


    this.http
      .put<StudentProfile>(
        `${this.apiUrl}/student-profiles/me`,
        this.donneesAEnvoyer(),
        {
          headers: this.getHeaders()
        }
      )
      .subscribe({

        /**
         * Modification réussie.
         */
        next: (profile) => {

          this.profile = profile;

          this.profileForm = {
            ...profile
          };

          this.editing = false;

          this.successMessage = this.langue.t('profil.maj');

          this.saving = false;
        },


        /**
         * Modification échouée.
         */
        error: (error) => {

          console.error(
            'Erreur lors de la modification du profil :',
            error
          );

          this.saving = false;


          if (
            error.status === 401 ||
            error.status === 403
          ) {

            localStorage.removeItem('token');

            this.router.navigate(['/login']);

            return;
          }


          this.errorMessage =
            error.error?.message ||
            this.langue.t('profil.erreur.modification');
        }
      });
  }


  /*
   * ==========================================================
   * AUTHENTIFICATION
   * ==========================================================
   */

  /**
   * Récupère le token JWT enregistré dans le navigateur.
   */
  private getToken(): string | null {

    return localStorage.getItem('token');
  }


  /**
   * Prépare les headers HTTP avec le token JWT.
   */
  private getHeaders(): HttpHeaders {

    const token = this.getToken();

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }


  /*
   * ==========================================================
   * CONSTRUCTEUR
   * ==========================================================
   */

  /**
   * Injection des dépendances nécessaires.
   */
  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}
}