import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

/**
 * Interface représentant les informations
 * du profil étudiant retournées par l'API.
 */
interface StudentProfile {

  id?: number;

  nationalite: string;

  niveauEtudes: string;

  universite: string;

  villeEtudes: string;

  telephone: string;

  adresse: string;

  typeVisa: string;

  typeLogement: string;

  dateArriveeFrance: string;

  dateExpirationVisa: string;

  premiereArrivee: boolean;

  profileCompleted: boolean;
}


/**
 * Composant responsable de l'affichage
 * et de la modification du profil étudiant.
 */
@Component({

  selector: 'app-profile',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './profile.html',

  styleUrl: './profile.scss'

})
export class Profile implements OnInit {


  /**
   * URL de base de l'API Spring Boot.
   */
  private apiUrl = 'http://localhost:8080/api';


  /**
   * Contient les informations du profil étudiant.
   */
  profile: StudentProfile = {

    nationalite: '',

    niveauEtudes: '',

    universite: '',

    villeEtudes: '',

    telephone: '',

    adresse: '',

    typeVisa: '',

    typeLogement: '',

    dateArriveeFrance: '',

    dateExpirationVisa: '',

    premiereArrivee: false,

    profileCompleted: false

  };


  /**
   * Message affiché lorsqu'une erreur se produit.
   */
  errorMessage = '';


  /**
   * Message affiché lorsque l'enregistrement
   * du profil est réussi.
   */
  successMessage = '';


  /**
   * Permet d'afficher un indicateur de chargement
   * pendant les appels à l'API.
   */
  loading = false;


  /**
   * Constructeur.
   *
   * @param http service Angular permettant
   *             de communiquer avec l'API
   */
  constructor(private http: HttpClient) {}


  /**
   * Méthode exécutée automatiquement
   * lors du chargement du composant.
   *
   * Elle récupère le profil de l'utilisateur connecté.
   */
  ngOnInit(): void {

    this.loadProfile();

  }


  /**
   * Récupère le token JWT enregistré
   * dans le localStorage.
   */
  private getToken(): string | null {

    return localStorage.getItem('token');

  }


  /**
   * Charge le profil de l'étudiant connecté.
   *
   * Endpoint utilisé :
   *
   * GET /api/profiles/me
   */
  loadProfile(): void {

    const token = this.getToken();


    /**
     * Vérifie qu'un utilisateur est connecté.
     */
    if (!token) {

      this.errorMessage =
        'Vous devez être connecté pour accéder à votre profil.';

      return;

    }


    /**
     * Ajout du JWT dans l'en-tête Authorization.
     */
    const headers = new HttpHeaders({

      Authorization: `Bearer ${token}`

    });


    this.loading = true;

    this.errorMessage = '';

    this.successMessage = '';


    /**
     * Appel de l'API pour récupérer le profil.
     */
    this.http.get<StudentProfile>(

      `${this.apiUrl}/profiles/me`,

      { headers }

    ).subscribe({

      /**
       * Réponse reçue avec succès.
       */
      next: (data) => {

        this.profile = data;

        this.loading = false;

      },


      /**
       * Gestion des erreurs.
       */
      error: (error) => {

        console.error(
          'Erreur lors du chargement du profil :',
          error
        );

        this.errorMessage =
          'Impossible de charger votre profil.';

        this.loading = false;

      }

    });

  }


  /**
   * Enregistre les modifications du profil.
   *
   * Endpoint utilisé :
   *
   * PUT /api/profiles/me
   */
  saveProfile(): void {

    const token = this.getToken();


    /**
     * Vérifie que le JWT existe.
     */
    if (!token) {

      this.errorMessage =
        'Vous devez être connecté pour modifier votre profil.';

      return;

    }


    /**
     * Préparation de l'en-tête Authorization.
     */
    const headers = new HttpHeaders({

      Authorization: `Bearer ${token}`

    });


    this.errorMessage = '';

    this.successMessage = '';

    this.loading = true;


    /**
     * Envoie les nouvelles informations
     * du profil vers l'API.
     */
    this.http.put<StudentProfile>(

      `${this.apiUrl}/profiles/me`,

      this.profile,

      { headers }

    ).subscribe({

      /**
       * Modification réussie.
       */
      next: (data) => {

        this.profile = data;

        this.successMessage =
          'Votre profil a été mis à jour avec succès.';

        this.loading = false;

      },


      /**
       * Gestion des erreurs.
       */
      error: (error) => {

        console.error(
          'Erreur lors de la modification :',
          error
        );

        this.errorMessage =
          'Impossible de modifier votre profil.';

        this.loading = false;

      }

    });

  }

}