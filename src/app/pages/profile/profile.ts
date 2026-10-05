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
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';


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
    FormsModule
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
  readonly typesVisa = [
    {
      value: 'VLS_TS_ETUDIANT',
      label: 'VLS-TS étudiant'
    },
    {
      value: 'TITRE_SEJOUR_ETUDIANT',
      label: 'Titre de séjour étudiant'
    },
    {
      value: 'COURT_SEJOUR',
      label: 'Court séjour'
    },
    {
      value: 'AUTRE',
      label: 'Autre'
    },
    {
      value: 'NON_RENSEIGNE',
      label: 'Non renseigné'
    }
  ];


  /**
   * Liste des types de logement.
   *
   * Les valeurs correspondent exactement à l'enum
   * LogementType du backend.
   */
  readonly typesLogement = [
    {
      value: 'CROUS',
      label: 'Résidence CROUS'
    },
    {
      value: 'LOCATION_PRIVEE',
      label: 'Location privée'
    },
    {
      value: 'HEBERGEMENT_CHEZ_UN_PROCHE',
      label: 'Hébergement chez un proche'
    },
    {
      value: 'HEBERGEMENT_FAMILLE',
      label: 'Hébergement chez un membre de ma famille'
    },
    {
      value: 'RESIDENCE_ETUDIANTE',
      label: 'Résidence étudiante privée'
    },
    {
      value: 'SANS_LOGEMENT',
      label: 'Je n’ai pas encore de logement'
    },
    {
      value: 'AUTRE',
      label: 'Autre'
    },
    {
      value: 'NON_RENSEIGNE',
      label: 'Je préfère ne pas renseigner'
    }
  ];


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
          this.errorMessage =
            'Impossible de charger votre profil.';

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

      telephone: ''
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

  /**
   * Retourne le libellé français du type de visa.
   */
  getVisaLabel(): string {

    const visa = this.typesVisa.find(
      (item) => item.value === this.profile?.typeVisa
    );

    return visa?.label || 'Non renseigné';
  }


  /**
   * Retourne le libellé français du type de logement.
   */
  getLogementLabel(): string {

    const logement = this.typesLogement.find(
      (item) => item.value === this.profile?.typeLogement
    );

    return logement?.label || 'Non renseigné';
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

      this.errorMessage =
        'Veuillez corriger les informations indiquées dans le formulaire.';

      return;
    }


    this.saving = true;


    this.http
      .post<StudentProfile>(
        `${this.apiUrl}/student-profiles`,
        this.profileForm,
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

          this.successMessage =
            'Votre profil a été créé avec succès.';

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
            'Impossible de créer votre profil.';
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

      this.errorMessage =
        'Veuillez corriger les informations indiquées dans le formulaire.';

      return;
    }


    this.saving = true;


    this.http
      .put<StudentProfile>(
        `${this.apiUrl}/student-profiles/me`,
        this.profileForm,
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

          this.successMessage =
            'Votre profil a été mis à jour avec succès.';

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
            'Impossible de modifier votre profil.';
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