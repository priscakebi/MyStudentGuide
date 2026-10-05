import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

/**
 * Représente un document nécessaire pour effectuer une démarche.
 *
 * Il s'agit uniquement de la description du document requis.
 * L'application ne stocke pas le fichier personnel de l'étudiant.
 */
interface DocumentRequis {
  id: number;
  nom: string;
  description: string;
  type: string;
}

/**
 * Représente une étape générale d'une démarche.
 */
interface EtapeDemarche {
  id: number;
  numero: number;
  titre: string;
  description: string;
}

/**
 * Représente un lien vers un site officiel lié à une démarche.
 */
interface LienOfficiel {
  id: number;
  nom: string;
  url: string;
  description: string;
}

/**
 * Représente le détail complet d'une démarche.
 *
 * Cette structure correspond au DemarcheDetailDTO
 * envoyé par le backend Spring Boot.
 */
interface DemarcheDetail {
  id: number;
  titre: string;
  description: string;
  dateCreation: string;
  dateLimite: string | null;
  categorie: string | null;
  documentsRequis: DocumentRequis[];
  etapes: EtapeDemarche[];
  liensOfficiels: LienOfficiel[];
}

/**
 * Composant responsable de l'affichage du détail
 * d'une démarche administrative.
 *
 * Exemple d'URL :
 * /demarches/1
 *
 * Le composant récupère l'identifiant 1 dans l'URL,
 * puis demande au backend les informations correspondantes.
 */
@Component({
  selector: 'app-demarche-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './demarche-detail.html',
  styleUrl: './demarche-detail.scss'
})
export class DemarcheDetailComponent implements OnInit {

  /**
   * Contient la démarche récupérée depuis l'API.
   *
   * Tant que la requête n'est pas terminée,
   * cette valeur reste null.
   */
  demarche: DemarcheDetail | null = null;

  /**
   * Permet d'afficher un message pendant le chargement.
   *
   * true  → les données sont encore en cours de récupération.
   * false → la requête est terminée.
   */
  chargement = true;

  /**
   * Contient un éventuel message d'erreur.
   *
   * Si la requête échoue, ce message sera affiché
   * par le template HTML.
   */
  erreur = '';

  /**
   * Constructeur du composant.
   *
   * ActivatedRoute permet de récupérer l'ID présent dans l'URL.
   *
   * HttpClient permet d'appeler l'API Spring Boot.
   *
   * Router permet de naviguer vers d'autres pages
   * de l'application.
   */
  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  /**
   * Méthode exécutée automatiquement lors du chargement
   * du composant.
   *
   * Elle lance le chargement de la démarche.
   */
  ngOnInit(): void {
    this.chargerDemarche();
  }

  /**
   * Récupère l'identifiant de la démarche dans l'URL
   * puis appelle l'API correspondante.
   *
   * Exemple :
   *
   * /demarches/2
   *
   * devient :
   *
   * GET /api/demarches/2
   */
  chargerDemarche(): void {

    /*
     * Récupération de l'identifiant présent
     * dans le paramètre :id de la route.
     */
    const id = this.route.snapshot.paramMap.get('id');

    /*
     * Vérification de la présence de l'identifiant.
     *
     * Si aucun ID n'est présent dans l'URL,
     * on arrête le chargement et on affiche une erreur.
     */
    if (!id) {
      this.erreur = 'Identifiant de la démarche introuvable.';
      this.chargement = false;
      return;
    }

    /*
     * Appel de l'API Spring Boot.
     *
     * Exemple :
     * http://localhost:8080/api/demarches/1
     */
    this.http
      .get<DemarcheDetail>(
        `${environment.apiUrl}/demarches/${id}`
      )
      .subscribe({

        /*
         * Ce bloc est exécuté lorsque l'API répond
         * correctement.
         */

        
        next: (demarche) => {

          /*
           * On stocke les données reçues
           * dans la propriété du composant.
           */
          this.demarche = demarche;

          /*
           * On trie les étapes par numéro afin
           * de garantir leur affichage dans le bon ordre.
           */
          this.demarche.etapes.sort(
            (a, b) => a.numero - b.numero
          );

          /*
           * La requête est terminée.
           *
           * Le template peut maintenant afficher
           * les informations de la démarche.
           */
          this.chargement = false;
        },

        /*
         * Ce bloc est exécuté si l'appel à l'API échoue.
         */
        error: (error) => {

          /*
           * Affichage de l'erreur dans la console
           * du navigateur pour faciliter le débogage.
           */
          console.error(
            'Erreur lors du chargement de la démarche :',
            error
          );

          /*
           * Message destiné à l'utilisateur.
           */
          this.erreur =
            'Impossible de charger les informations de cette démarche.';

          /*
           * Même en cas d'erreur, il faut arrêter
           * l'état de chargement.
           */
          this.chargement = false;
        }
      });
  }

  /**
   * Retourne vers la liste générale des démarches.
   */
  retourAuxDemarches(): void {
    this.router.navigate(['/demarches']);
  }

  /**
   * Redirige vers la page générale des documents
   * avec un filtre correspondant à la démarche actuelle.
   *
   * Exemple :
   *
   * /documents?demarcheId=1
   */
  voirDocuments(): void {

    /*
     * Si aucune démarche n'a encore été chargée,
     * on ne fait rien.
     */
    if (!this.demarche) {
      return;
    }

    /*
     * Navigation vers la page des documents.
     *
     * L'identifiant de la démarche est transmis
     * comme paramètre de requête.
     */
    this.router.navigate(
      ['/documents'],
      {
        queryParams: {
          demarcheId: this.demarche.id
        }
      }
    );
  }
}