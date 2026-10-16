import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LangueService } from '../../i18n/langue.service';
import { TPipe, TcPipe } from '../../i18n/t.pipe';
import { Icone } from '../../components/icone/icone';

/**
 * Représente un document requis récupéré depuis le backend.
 *
 * Ce n'est PAS un fichier personnel de l'étudiant.
 * Il s'agit simplement d'une information indiquant
 * qu'un document est nécessaire pour une démarche.
 */
interface DocumentRequis {
  id: number;
  nom: string;
  description: string | null;
  nomEn?: string | null;
  descriptionEn?: string | null;
  type: string;
  demarcheId: number;
}

/**
 * Représente une démarche administrative.
 */
interface Demarche {
  id: number;
  titre: string;
  description?: string;
  titreEn?: string | null;
  descriptionEn?: string | null;
}

/**
 * Regroupe les documents requis d'une démarche.
 *
 * Exemple :
 *
 * Demande de titre de séjour étudiant
 * ├── Passeport
 * ├── Visa
 * ├── Photo d'identité
 * └── Certificat de scolarité
 */
interface DocumentsParDemarche {
  demarcheId: number;
  demarche: Demarche;
  documents: DocumentRequis[];
}

/**
 * Composant de la page "Mes documents".
 *
 * Cette page permet à l'étudiant de consulter les documents
 * nécessaires pour les différentes démarches administratives.
 *
 * IMPORTANT :
 * L'application ne permet PAS à l'étudiant de déposer,
 * télécharger ou stocker ses propres documents.
 *
 * La page affiche uniquement les documents nécessaires
 * pour chaque démarche.
 */
@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [
    Icone,
    CommonModule,
    TPipe,
    TcPipe
  ],
  templateUrl: './documents.html',
  styleUrl: './documents.scss'
})
export class Documents implements OnInit {

  /**
   * URL de base de l'API backend.
   */
  private readonly apiUrl = environment.apiUrl;

  /**
   * Documents regroupés par démarche.
   */
  documentsParDemarche: DocumentsParDemarche[] = [];

  /**
   * Indique si les données sont encore en cours
   * de récupération depuis le backend.
   */
  isLoading = true;

  /**
   * Message affiché lorsqu'une erreur survient.
   */
  errorMessage = '';

  /**
   * Injection du client HTTP Angular.
   */
  constructor(private http: HttpClient) {}

  private langue = inject(LangueService);

  /** Libellé lisible d'un type de document (IDENTITE → Identité / Identity). */
  libelleType(type: string): string {
    return this.langue.tOu(`docType.${type}`, type);
  }

  /**
   * Méthode exécutée automatiquement lorsque
   * le composant est chargé.
   */
  ngOnInit(): void {
    this.loadDocuments();
  }

  /**
   * Récupère les démarches puis leurs documents requis.
   *
   * Le fonctionnement est le suivant :
   *
   * 1. On récupère les démarches.
   * 2. Pour chaque démarche, on demande au backend
   *    uniquement les documents qui lui sont associés.
   * 3. On regroupe les résultats pour les afficher
   *    dans le template.
   */
  loadDocuments(): void {

    this.isLoading = true;
    this.errorMessage = '';

    /**
     * Récupération du token JWT stocké après la connexion.
     */
    const token = localStorage.getItem('token');

    /**
     * Création des headers HTTP.
     *
     * Le token est ajouté uniquement s'il existe.
     */
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${token}`
      );
    }

    /**
     * Première étape :
     * récupération des démarches disponibles.
     *
     * GET /api/demarches
     */
    this.http.get<Demarche[]>(
      `${this.apiUrl}/demarches`,
      { headers }
    ).subscribe({

      next: (demarches) => {

        /**
         * S'il n'existe aucune démarche,
         * il n'y a aucun document à récupérer.
         */
        if (demarches.length === 0) {

          this.documentsParDemarche = [];
          this.isLoading = false;

          return;
        }

        /**
         * Pour chaque démarche, on prépare une requête
         * permettant de récupérer ses documents requis.
         *
         * Exemple :
         *
         * GET /api/documents-requis/demarche/1
         * GET /api/documents-requis/demarche/2
         * GET /api/documents-requis/demarche/3
         */
        const requests: Observable<DocumentRequis[]>[] =
          demarches.map((demarche) =>

            this.http.get<DocumentRequis[]>(
              `${this.apiUrl}/documents-requis/demarche/${demarche.id}`,
              { headers }
            )

          );

        /**
         * forkJoin attend que toutes les requêtes
         * soient terminées avant de continuer.
         *
         * Les résultats sont retournés dans le même ordre
         * que les requêtes envoyées.
         */
        forkJoin(requests).subscribe({

          next: (documentsParDemarche) => {

            /**
             * Construction des groupes :
             *
             * démarche + documents correspondants.
             */
            this.documentsParDemarche =
              demarches.map((demarche, index) => ({

                demarcheId: demarche.id,

                demarche,

                documents:
                  documentsParDemarche[index]

              }))
              /**
               * On retire les démarches qui n'ont aucun
               * document requis.
               *
               * Ainsi, la page affiche uniquement
               * les démarches possédant une liste
               * de documents.
               */
              .filter(
                groupe => groupe.documents.length > 0
              );

            /**
             * Fin du chargement.
             */
            this.isLoading = false;
          },

          error: (error) => {

            console.error(
              'Erreur lors de la récupération des documents requis :',
              error
            );

            this.errorMessage =
              this.langue.t('documents.erreur.documents');

            this.isLoading = false;
          }

        });
      },

      error: (error) => {

        console.error(
          'Erreur lors de la récupération des démarches :',
          error
        );

        this.errorMessage =
          this.langue.t('documents.erreur.demarches');

        this.isLoading = false;
      }

    });
  }
}