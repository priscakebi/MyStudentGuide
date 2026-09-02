import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

/**
 * Interface représentant une démarche affichée
 * sur la page d'accueil.
 *
 * Pour le moment, les données sont locales.
 * Elles seront ensuite remplacées par les données
 * provenant de l'API Spring Boot.
 */
interface Demarche {

  /**
   * Identifiant de la démarche.
   */
  id: number;

  /**
   * Titre de la démarche.
   */
  titre: string;

  /**
   * Description courte de la démarche.
   */
  description: string;

  /**
   * Nom de la catégorie.
   */
  categorie: string;

  /**
   * Icône affichée sur la carte.
   */
  icon: string;
}


/**
 * Composant représentant la page d'accueil
 * de l'étudiant connecté.
 *
 * Cette page permet :
 *
 * - d'accueillir l'étudiant ;
 * - de rechercher une démarche ;
 * - d'afficher les démarches recommandées ;
 * - d'accéder au profil ;
 * - de se déconnecter.
 */
@Component({

  selector: 'app-home',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  templateUrl: './home.html',

  styleUrl: './home.scss'

})
export class Home implements OnInit {


  /**
   * Nom de l'utilisateur connecté.
   *
   * Pour le moment, une valeur par défaut est utilisée.
   * Nous pourrons ensuite récupérer le prénom
   * depuis l'API.
   */
  userName = 'Étudiant';


  /**
   * Texte saisi dans la barre de recherche.
   */
  searchTerm = '';


  /**
   * Liste des démarches disponibles.
   *
   * IMPORTANT :
   * Ces données sont provisoires.
   *
   * Plus tard, elles seront récupérées depuis
   * l'API Spring Boot.
   */
  demarches: Demarche[] = [

    {
      id: 1,
      titre: 'Inscription à l’Assurance Maladie',
      description:
        'Effectuez votre inscription à l’Assurance Maladie en France.',
      categorie: 'Santé',
      icon: '🏥'
    },

    {
      id: 2,
      titre: 'Demande de logement',
      description:
        'Découvrez les démarches importantes liées à votre logement.',
      categorie: 'Logement',
      icon: '🏠'
    },

    {
      id: 3,
      titre: 'Validation du VLS-TS',
      description:
        'Les étapes nécessaires pour valider votre visa long séjour.',
      categorie: 'Séjour',
      icon: '🛂'
    },

    {
      id: 4,
      titre: 'Inscription universitaire',
      description:
        'Retrouvez les principales démarches liées à votre inscription.',
      categorie: 'Études',
      icon: '🎓'
    }

  ];


  /**
   * Liste filtrée affichée à l'écran.
   *
   * Elle évolue lorsque l'étudiant effectue
   * une recherche.
   */
  filteredDemarches: Demarche[] = [];


  /**
   * Constructeur.
   *
   * @param router permet de gérer la navigation
   */
  constructor(
    private router: Router
  ) {}


  /**
   * Méthode exécutée au chargement du composant.
   */
  ngOnInit(): void {

    /**
     * Au départ, toutes les démarches
     * sont affichées.
     */
    this.filteredDemarches = this.demarches;

  }


  /**
   * Recherche une démarche.
   *
   * La recherche fonctionne sur :
   *
   * - le titre ;
   * - la description ;
   * - la catégorie.
   */
  searchDemarches(): void {

    /**
     * Suppression des espaces inutiles
     * et conversion en minuscules.
     */
    const search = this.searchTerm
      .trim()
      .toLowerCase();


    /**
     * Si la recherche est vide,
     * on affiche toutes les démarches.
     */
    if (!search) {

      this.filteredDemarches = this.demarches;

      return;
    }


    /**
     * Filtrage des démarches.
     */
    this.filteredDemarches = this.demarches.filter(
      demarche =>

        demarche.titre
          .toLowerCase()
          .includes(search)

        ||

        demarche.description
          .toLowerCase()
          .includes(search)

        ||

        demarche.categorie
          .toLowerCase()
          .includes(search)
    );

  }


  /**
   * Ouvre une démarche.
   *
   * Pour le moment, nous redirigeons vers
   * la page générale des démarches.
   *
   * Nous pourrons ensuite créer une route :
   *
   * /dashboard/demarches/1
   */
  openDemarche(demarche: Demarche): void {

    this.router.navigate([
      '/dashboard/demarches'
    ]);

  }


  /**
   * Déconnecte l'utilisateur.
   *
   * Le JWT est supprimé du localStorage.
   *
   * L'utilisateur est ensuite redirigé
   * vers la page de connexion.
   */
  logout(): void {

    localStorage.removeItem('token');

    localStorage.removeItem('userId');

    localStorage.removeItem('email');

    localStorage.removeItem('role');


    this.router.navigate(['/login']);

  }

}