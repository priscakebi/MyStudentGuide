import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';
import { DemarcheContenuEditor } from '../../../components/demarche-contenu-editor/demarche-contenu-editor';
import { DemarcheTraductionEditor } from '../../../components/demarche-traduction-editor/demarche-traduction-editor';


// ============================================================
// INTERFACE : CATÉGORIE
// ============================================================

/**
 * Représente une catégorie de démarche.
 *
 * Exemple :
 *
 * {
 *   id: 1,
 *   nom: "Titre de séjour"
 * }
 */
interface Categorie {

  /**
   * Identifiant unique de la catégorie.
   */
  id: number;

  /**
   * Nom de la catégorie.
   */
  nom: string;
}


// ============================================================
// INTERFACE : DÉMARCHE
// ============================================================

/**
 * Représente une démarche administrative générale.
 *
 * IMPORTANT :
 *
 * Cette interface ne contient PAS :
 * - le statut de l'étudiant ;
 * - le profil étudiant ;
 * - les documents personnels.
 *
 * Le suivi personnalisé d'un étudiant est géré
 * séparément par StudentDemarche.
 */
interface Demarche {

  /**
   * Identifiant unique de la démarche.
   */
  id: number;

  /**
   * Titre de la démarche.
   *
   * Exemple :
   * "Renouvellement du titre de séjour étudiant"
   */
  titre: string;

  /**
   * Description générale de la démarche.
   */
  description: string;

  /**
   * Date de création de la démarche.
   */
  dateCreation?: string;

  /**
   * Date limite éventuelle de la démarche.
   *
   * Peut être null ou absent si aucune date limite
   * n'est définie.
   */
  dateLimite?: string | null;

  /** Titre anglais (null tant que la démarche n'est pas traduite). */
  titreEn?: string | null;

  /**
   * Catégorie à laquelle appartient la démarche.
   */
  categorie?: Categorie | null;

  /** BROUILLON : invisible des étudiants. null/absent = publiée. */
  statutPublication?: 'BROUILLON' | 'PUBLIEE' | null;

  /** Fiche Service-Public d'origine (ex. : F2231). */
  sourceId?: string | null;
  sourceDateMaj?: string | null;

  /** Version plus récente de la fiche détectée par la vérification automatique. */
  sourceDateDisponible?: string | null;
  miseAJourDisponible?: boolean;

  /** Ciblage des suggestions automatiques (voir SuggestionAutoService côté API). */
  cibleActive?: boolean | null;
  cibleHorsUE?: boolean | null;
  ciblePremiereArrivee?: boolean | null;
  cibleVisas?: string[];
  cibleLogements?: string[];

  /**
   * Date limite personnalisée : date du profil de l'étudiant et nombre de
   * jours (négatif = avant). Ex. : ARRIVEE_EN_FRANCE, 90 (validation du VLS-TS).
   */
  echeanceReference?: 'ARRIVEE_EN_FRANCE' | 'FIN_TITRE_SEJOUR' | null;
  echeanceDecalageJours?: number | null;
}

/**
 * Formulaire de date limite personnalisée (PUT /api/admin/demarches/{id}/echeance).
 * regle : '' = aucune ; « APRES_ARRIVEE » ; « AVANT_FIN_TITRE ».
 */
interface EcheanceForm {
  regle: '' | 'APRES_ARRIVEE' | 'AVANT_FIN_TITRE';
  jours: number | null;
}

/** Formulaire de ciblage (PUT /api/admin/demarches/{id}/ciblage). */
interface CiblageForm {
  active: boolean;
  horsUE: boolean | null;
  premiereArrivee: boolean | null;
  visas: string[];
  logements: string[];
}

/** Libellés des types de visa et de logement (enums VisaType / LogementType de l'API). */
const VISAS: { value: string; label: string }[] = [
  { value: 'VLS_TS_ETUDIANT', label: 'Visa long séjour étudiant (VLS-TS)' },
  { value: 'TITRE_SEJOUR_ETUDIANT', label: 'Titre de séjour étudiant' },
  { value: 'COURT_SEJOUR', label: 'Visa court séjour' },
  { value: 'AUTRE', label: 'Autre' }
];

const LOGEMENTS: { value: string; label: string }[] = [
  { value: 'SANS_LOGEMENT', label: 'Pas encore de logement' },
  { value: 'CROUS', label: 'Logement Crous' },
  { value: 'RESIDENCE_ETUDIANTE', label: 'Résidence étudiante' },
  { value: 'LOCATION_PRIVEE', label: 'Location privée' },
  { value: 'HEBERGEMENT_CHEZ_UN_PROCHE', label: 'Hébergé chez un proche' },
  { value: 'HEBERGEMENT_FAMILLE', label: 'Hébergé en famille' },
  { value: 'AUTRE', label: 'Autre' }
];


// ============================================================
// SERVICE-PUBLIC
// ============================================================

/** Fiche proposée dans le catalogue d'import. */
interface FicheCatalogue {
  id: string;
  titre: string;
  theme: string;
  dejaImportee: boolean;
}

/** Aperçu d'une fiche Service-Public avant import. */
interface FicheServicePublic {
  id: string;
  titre: string;
  description: string;
  url: string;
  dateMaj: string | null;
  etapes: { titre: string; description: string }[];
  liens: { nom: string; url: string; description: string }[];
}


// ============================================================
// INTERFACE : FORMULAIRE
// ============================================================

/**
 * Structure utilisée uniquement pour le formulaire
 * de création et de modification d'une démarche.
 *
 * Le formulaire n'envoie pas directement un objet
 * Demarche complet.
 *
 * Il envoie uniquement les informations nécessaires
 * à l'API.
 */
interface DemarcheForm {

  /**
   * Titre saisi dans le formulaire.
   */
  titre: string;

  /**
   * Description saisie dans le formulaire.
   */
  description: string;

  /**
   * Identifiant de la catégorie sélectionnée.
   */
  categorieId: number;

  /**
   * Date limite éventuelle.
   */
  dateLimite: string | null;
}


// ============================================================
// COMPOSANT
// ============================================================

@Component({
  selector: 'app-demarches-admin',

  /**
   * Le composant est standalone.
   */
  standalone: true,

  /**
   * Modules nécessaires au HTML :
   *
   * CommonModule :
   * - directives Angular ;
   * - fonctionnalités communes.
   *
   * FormsModule :
   * - [(ngModel)] ;
   * - formulaires template-driven.
   */
  imports: [
    CommonModule,
    FormsModule,
    DemarcheContenuEditor,
    DemarcheTraductionEditor
  ],

  /**
   * Fichier HTML du composant.
   */
  templateUrl: './demarches-admin.html',

  /**
   * Fichier SCSS du composant.
   */
  styleUrl: './demarches-admin.scss'
})
export class DemarchesAdmin implements OnInit {

  private authService = inject(AuthService);


  // ==========================================================
  // URL DE L'API
  // ==========================================================

  /**
   * URL de base du backend Spring Boot.
   */
  private readonly apiUrl =
    environment.apiUrl;


  // ==========================================================
  // LISTES
  // ==========================================================

  /**
   * Liste de toutes les démarches récupérées depuis
   * le backend.
   */
  demarches: Demarche[] = [];


  /**
   * Liste des catégories disponibles.
   *
   * Elle est utilisée dans le <select> du formulaire.
   */
  categories: Categorie[] = [];


  // ==========================================================
  // FORMULAIRE
  // ==========================================================

  /**
   * Données actuellement saisies dans le formulaire.
   *
   * Ces valeurs sont liées au HTML grâce à [(ngModel)].
   */
  demarcheForm: DemarcheForm = {
    titre: '',
    description: '',
    categorieId: 0,
    dateLimite: null
  };


  // ==========================================================
  // ÉTAT DU COMPOSANT
  // ==========================================================

  /**
   * Indique si le composant est en train d'effectuer
   * une opération avec le backend.
   *
   * Exemple :
   *
   * true  → chargement/création/modification/suppression
   * false → aucune opération en cours
   */
  loading = false;


  /**
   * Indique si le formulaire est actuellement
   * en mode modification.
   *
   * false → création
   * true  → modification
   */
  isEditing = false;


  /**
   * Identifiant de la démarche actuellement modifiée.
   *
   * Il reste null lorsque le formulaire est en mode création.
   */
  editingId: number | null = null;


  // ==========================================================
  // MESSAGES
  // ==========================================================

  /**
   * Message affiché à l'utilisateur après une opération.
   */
  message = '';


  /**
   * Type du message.
   *
   * "success" → opération réussie
   * "error"   → erreur
   */
  messageType: 'success' | 'error' = 'success';


  // ==========================================================
  // CONSTRUCTEUR
  // ==========================================================

  /**
   * Injection de HttpClient.
   *
   * HttpClient permet au composant de communiquer
   * avec l'API Spring Boot.
   */
  constructor(
    private readonly http: HttpClient
  ) {}


  // ==========================================================
  // INITIALISATION
  // ==========================================================

  /**
   * Méthode exécutée automatiquement lors du chargement
   * du composant.
   *
   * Elle récupère :
   *
   * 1. les démarches ;
   * 2. les catégories.
   */
  ngOnInit(): void {

    this.loadDemarches();

    this.loadCategories();

    this.loadCatalogue();
  }


  // ==========================================================
  // IMPORT DEPUIS SERVICE-PUBLIC
  // ==========================================================

  /** Fiches suggérées (étudiants internationaux). */
  spCatalogue: FicheCatalogue[] = [];

  /** Identifiant saisi à la main (ex. : F2231). */
  spFicheId = '';

  /** Fiche affichée en aperçu avant import. */
  spApercu: FicheServicePublic | null = null;

  /** Catégorie choisie pour l'import. */
  spCategorieId: number | null = null;

  /** Vrai si la catégorie a été pré-sélectionnée d'après le thème de la fiche. */
  spCategorieSuggeree = false;

  spChargement = false;
  spImport = false;
  spVerification = false;
  spErreur = '';

  /** Démarche dont une action (publier, mettre à jour) est en cours. */
  actionEnCours: number | null = null;

  private get spUrl(): string {
    return `${this.apiUrl}/admin/service-public`;
  }

  loadCatalogue(): void {
    this.http.get<FicheCatalogue[]>(`${this.spUrl}/catalogue`, { headers: this.getHeaders() })
      .subscribe({
        next: (catalogue) => this.spCatalogue = catalogue ?? [],
        error: () => this.spCatalogue = []
      });
  }

  /** Télécharge la fiche et affiche ce qui serait importé. */
  previsualiser(ficheId: string): void {
    const id = (ficheId ?? '').trim().toUpperCase();

    if (!/^F\d{1,6}$/.test(id)) {
      this.spErreur = 'Identifiant invalide : utilisez le format F2231.';
      return;
    }

    this.spChargement = true;
    this.spErreur = '';
    this.spApercu = null;

    this.http.get<{ fiche: FicheServicePublic; categorieSuggereeId: number | null }>(
      `${this.spUrl}/fiches/${id}`, { headers: this.getHeaders() }
    ).subscribe({
        next: ({ fiche, categorieSuggereeId }) => {
          this.spChargement = false;
          this.spApercu = fiche;
          this.spFicheId = fiche.id;

          // Catégorie pré-sélectionnée d'après le thème de la fiche (modifiable).
          this.spCategorieId = categorieSuggereeId;
          this.spCategorieSuggeree = categorieSuggereeId !== null;
        },
        error: (error) => {
          this.spChargement = false;
          this.spErreur = error.error?.message || 'Impossible de récupérer cette fiche.';
        }
      });
  }

  fermerApercu(): void {
    this.spApercu = null;
    this.spErreur = '';
  }

  /** Crée la démarche en brouillon à partir de la fiche affichée. */
  importerFiche(): void {
    if (!this.spApercu || !this.spCategorieId || this.spImport) {
      return;
    }

    this.spImport = true;
    this.spErreur = '';

    this.http.post<Demarche>(
      `${this.spUrl}/import`,
      { ficheId: this.spApercu.id, categorieId: this.spCategorieId },
      { headers: this.getHeaders() }
    ).subscribe({
      next: (demarche) => {
        this.spImport = false;
        this.spApercu = null;
        this.spFicheId = '';
        this.showMessage(
          `« ${demarche.titre} » a été importée en brouillon. Relisez-la, ajoutez les documents requis puis publiez-la.`,
          'success'
        );
        this.loadDemarches();
        this.loadCatalogue();
      },
      error: (error) => {
        this.spImport = false;
        this.spErreur = error.error?.message || 'L\'import a échoué.';
      }
    });
  }

  /** Lance tout de suite la vérification (elle tourne aussi chaque nuit). */
  verifierMisesAJour(): void {
    this.spVerification = true;

    this.http.post<{ misesAJourDetectees: number }>(
      `${this.spUrl}/verifier`, {}, { headers: this.getHeaders() }
    ).subscribe({
      next: (resultat) => {
        this.spVerification = false;
        const n = resultat?.misesAJourDetectees ?? 0;
        this.showMessage(
          n === 0
            ? 'Toutes les démarches importées sont à jour.'
            : `${n} démarche${n > 1 ? 's ont' : ' a'} une mise à jour officielle disponible.`,
          'success'
        );
        this.loadDemarches();
      },
      error: (error) => {
        this.spVerification = false;
        this.showMessage(error.error?.message || 'La vérification a échoué.', 'error');
      }
    });
  }

  /** Publie ou repasse en brouillon. */
  changerPublication(demarche: Demarche, statut: 'PUBLIEE' | 'BROUILLON'): void {
    if (statut === 'BROUILLON'
        && !confirm(`Dépublier « ${demarche.titre} » ? Elle ne sera plus visible des étudiants.`)) {
      return;
    }

    this.actionEnCours = demarche.id;

    this.http.patch<{ demarche: Demarche; suggestionsEnvoyees: number }>(
      `${this.spUrl}/demarches/${demarche.id}/publication`,
      {},
      { headers: this.getHeaders(), params: { statut } }
    ).subscribe({
      next: (resultat) => {
        this.actionEnCours = null;
        const n = resultat?.suggestionsEnvoyees ?? 0;
        this.showMessage(
          statut === 'PUBLIEE'
            ? `« ${demarche.titre} » est maintenant visible par les étudiants.`
              + (n > 0 ? ` ${n} étudiant${n > 1 ? 's ont' : ' a'} reçu la suggestion.` : '')
            : `« ${demarche.titre} » est repassée en brouillon.`,
          'success'
        );
        this.loadDemarches();
      },
      error: (error) => {
        this.actionEnCours = null;
        this.showMessage(error.error?.message || 'Action impossible.', 'error');
      }
    });
  }

  // ==========================================================
  // SUGGESTION AUTOMATIQUE (CIBLAGE)
  // ==========================================================

  readonly visas = VISAS;
  readonly logements = LOGEMENTS;

  /** Démarche dont le formulaire de ciblage est ouvert. */
  ciblageOuvert: number | null = null;

  ciblageForm: CiblageForm = { active: false, horsUE: null, premiereArrivee: null, visas: [], logements: [] };

  /** Démarche dont l'éditeur des étapes et liens officiels est ouvert. */
  contenuOuvert: number | null = null;

  /** Démarche dont la version anglaise est en cours d'édition. */
  traductionOuverte: number | null = null;

  /** Résumé lisible du ciblage, affiché sous le titre de la démarche. */
  resumeCiblage(d: Demarche): string | null {
    if (!d.cibleActive) {
      return null;
    }

    const criteres: string[] = [];
    if (d.cibleHorsUE === true) criteres.push('hors UE');
    if (d.cibleHorsUE === false) criteres.push('UE');
    if (d.ciblePremiereArrivee === true) criteres.push('première arrivée');
    if (d.ciblePremiereArrivee === false) criteres.push('déjà installés');
    if (d.cibleVisas?.length) {
      criteres.push(d.cibleVisas.map((v) => VISAS.find((x) => x.value === v)?.label ?? v).join(' ou '));
    }
    if (d.cibleLogements?.length) {
      criteres.push(d.cibleLogements.map((l) => LOGEMENTS.find((x) => x.value === l)?.label ?? l).join(' ou '));
    }

    return criteres.length ? criteres.join(' · ') : 'tous les étudiants';
  }

  ouvrirCiblage(d: Demarche): void {
    if (this.ciblageOuvert === d.id) {
      this.ciblageOuvert = null;
      return;
    }

    this.ciblageOuvert = d.id;
    this.ciblageForm = {
      active: !!d.cibleActive,
      horsUE: d.cibleHorsUE ?? null,
      premiereArrivee: d.ciblePremiereArrivee ?? null,
      visas: [...(d.cibleVisas ?? [])],
      logements: [...(d.cibleLogements ?? [])]
    };
  }

  basculer(liste: string[], valeur: string): void {
    const i = liste.indexOf(valeur);
    if (i >= 0) {
      liste.splice(i, 1);
    } else {
      liste.push(valeur);
    }
  }

  /** Enregistre le ciblage ; si la démarche est publiée, les étudiants concernés reçoivent la suggestion. */
  enregistrerCiblage(d: Demarche): void {
    this.actionEnCours = d.id;

    this.http.put<{ demarche: Demarche; suggestionsEnvoyees: number }>(
      `${this.apiUrl}/admin/demarches/${d.id}/ciblage`,
      this.ciblageForm,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (resultat) => {
        this.actionEnCours = null;
        this.ciblageOuvert = null;
        const n = resultat?.suggestionsEnvoyees ?? 0;

        this.showMessage(
          !this.ciblageForm.active
            ? `Suggestion automatique désactivée pour « ${d.titre} ».`
            : d.statutPublication === 'BROUILLON'
              ? 'Ciblage enregistré. Les étudiants concernés recevront la suggestion à la publication.'
              : n === 0
                ? 'Ciblage enregistré. Aucun nouvel étudiant concerné pour le moment.'
                : `Ciblage enregistré : ${n} étudiant${n > 1 ? 's ont' : ' a'} reçu la suggestion.`,
          'success'
        );
        this.loadDemarches();
      },
      error: (error) => {
        this.actionEnCours = null;
        this.showMessage(error.error?.message || 'Le ciblage n\'a pas pu être enregistré.', 'error');
      }
    });
  }

  // ==========================================================
  // DATE LIMITE PERSONNALISÉE (calculée depuis le profil de l'étudiant)
  // ==========================================================

  /** Démarche dont le formulaire d'échéance est ouvert. */
  echeanceOuvert: number | null = null;

  echeanceForm: EcheanceForm = { regle: '', jours: null };

  /** Résumé de la règle, affiché sous le titre (« 90 j après l'arrivée »). */
  resumeEcheance(d: Demarche): string | null {
    if (!d.echeanceReference || d.echeanceDecalageJours == null) {
      return null;
    }
    const n = Math.abs(d.echeanceDecalageJours);
    const sens = d.echeanceDecalageJours >= 0 ? 'après' : 'avant';
    const reference = d.echeanceReference === 'ARRIVEE_EN_FRANCE'
      ? 'l\'arrivée en France'
      : 'la fin du visa / titre de séjour';
    return `${n} j ${sens} ${reference}`;
  }

  ouvrirEcheance(d: Demarche): void {
    if (this.echeanceOuvert === d.id) {
      this.echeanceOuvert = null;
      return;
    }

    this.echeanceOuvert = d.id;
    this.echeanceForm = {
      regle: d.echeanceReference === 'ARRIVEE_EN_FRANCE'
        ? 'APRES_ARRIVEE'
        : d.echeanceReference === 'FIN_TITRE_SEJOUR' ? 'AVANT_FIN_TITRE' : '',
      jours: d.echeanceDecalageJours != null ? Math.abs(d.echeanceDecalageJours) : null
    };
  }

  /** Raccourcis : règles courantes des démarches étudiantes. */
  appliquerModeleEcheance(regle: EcheanceForm['regle'], jours: number): void {
    this.echeanceForm = { regle, jours };
  }

  get echeanceFormValide(): boolean {
    const jours = this.echeanceForm.jours;
    return this.echeanceForm.regle === ''
      || (jours !== null && Number.isInteger(jours) && jours >= 1 && jours <= 3650);
  }

  enregistrerEcheance(d: Demarche): void {
    if (!this.echeanceFormValide) {
      return;
    }

    const { regle, jours } = this.echeanceForm;
    const corps = regle === ''
      ? { reference: null, decalageJours: null }
      : {
          reference: regle === 'APRES_ARRIVEE' ? 'ARRIVEE_EN_FRANCE' : 'FIN_TITRE_SEJOUR',
          decalageJours: regle === 'APRES_ARRIVEE' ? jours : -(jours ?? 0)
        };

    this.actionEnCours = d.id;

    this.http.put(`${this.apiUrl}/admin/demarches/${d.id}/echeance`, corps, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.actionEnCours = null;
          this.echeanceOuvert = null;
          this.showMessage(
            regle === ''
              ? `« ${d.titre} » : la date limite générale s'applique à nouveau.`
              : `« ${d.titre} » : chaque étudiant aura sa propre date limite, calculée depuis son profil.`,
            'success'
          );
          this.loadDemarches();
        },
        error: (error) => {
          this.actionEnCours = null;
          this.showMessage(error.error?.message || 'La règle d\'échéance n\'a pas pu être enregistrée.', 'error');
        }
      });
  }

  /** Remplace description, étapes et liens par la version officielle actuelle. */
  appliquerMiseAJour(demarche: Demarche): void {
    if (!confirm(
      `Appliquer la mise à jour officielle à « ${demarche.titre} » ?\n\n`
      + 'La description, les étapes et les liens officiels seront remplacés. '
      + 'Le titre, la catégorie, la date limite et les documents requis sont conservés. '
      + 'La version anglaise des étapes et des liens sera à refaire, celle de la description à vérifier.'
    )) {
      return;
    }

    this.actionEnCours = demarche.id;

    this.http.post<Demarche>(
      `${this.spUrl}/demarches/${demarche.id}/mise-a-jour`, {}, { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.actionEnCours = null;
        this.showMessage(`« ${demarche.titre} » est à jour avec Service-Public.`, 'success');
        this.loadDemarches();
      },
      error: (error) => {
        this.actionEnCours = null;
        this.showMessage(error.error?.message || 'La mise à jour a échoué.', 'error');
      }
    });
  }


  // ==========================================================
  // HEADERS HTTP
  // ==========================================================

  /**
   * Construit les headers HTTP avec le token JWT
   * actuellement enregistré dans localStorage.
   *
   * Le token est nécessaire pour accéder aux endpoints
   * protégés de l'administration.
   */
  private getHeaders(): HttpHeaders {

    const token = this.authService.getToken();

    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token
        ? {
            Authorization: `Bearer ${token}`
          }
        : {})
    });
  }


  // ==========================================================
  // CHARGER LES DÉMARCHES
  // ==========================================================

  /**
   * Récupère toutes les démarches depuis le backend.
   *
   * GET :
   *
   * /api/demarches
   */
  loadDemarches(): void {

    this.loading = true;

    this.http.get<Demarche[]>(
      `${this.apiUrl}/demarches`,
      {
        headers: this.getHeaders()
      }
    )
    .subscribe({

      /**
       * Réponse réussie.
       */
      next: (response) => {

        this.demarches = response;

        this.loading = false;
      },


      /**
       * Erreur lors de la récupération.
       */
      error: (error) => {

        console.error(
          'Erreur lors du chargement des démarches :',
          error
        );

        this.demarches = [];

        this.loading = false;

        this.showMessage(
          'Impossible de charger les démarches.',
          'error'
        );
      }

    });
  }


  // ==========================================================
  // CHARGER LES CATÉGORIES
  // ==========================================================

  /**
   * Récupère toutes les catégories depuis le backend.
   *
   * GET :
   *
   * /api/categories
   *
   * Ces catégories sont utilisées dans le formulaire
   * de création/modification.
   */
  loadCategories(): void {

    this.http.get<Categorie[]>(
      `${this.apiUrl}/categories`,
      {
        headers: this.getHeaders()
      }
    )
    .subscribe({

      /**
       * Réponse réussie.
       */
      next: (response) => {

        this.categories = response;
      },


      /**
       * Erreur lors du chargement.
       */
      error: (error) => {

        console.error(
          'Erreur lors du chargement des catégories :',
          error
        );

        this.categories = [];

        this.showMessage(
          'Impossible de charger les catégories.',
          'error'
        );
      }

    });
  }


  // ==========================================================
  // CRÉER UNE DÉMARCHE
  // ==========================================================

  /**
   * Crée une nouvelle démarche.
   *
   * Les données du formulaire sont envoyées au backend.
   *
   * POST :
   *
   * /api/demarches
   */
  createDemarche(): void {

    /**
     * Vérification minimale du formulaire.
     */
    if (!this.isFormValid()) {
      return;
    }


    this.loading = true;


    /**
     * Objet envoyé à l'API.
     *
     * On envoie uniquement les champs nécessaires.
     */
    const payload = {

      titre: this.demarcheForm.titre.trim(),

      description:
        this.demarcheForm.description.trim(),

      categorieId:
        this.demarcheForm.categorieId,

      dateLimite:
        this.demarcheForm.dateLimite || null
    };


    this.http.post<Demarche>(
      `${this.apiUrl}/demarches`,
      payload,
      {
        headers: this.getHeaders()
      }
    )
    .subscribe({

      /**
       * Création réussie.
       */
      next: (response) => {


        this.loading = false;


        this.showMessage(
          'La démarche a été créée avec succès.',
          'success'
        );


        /**
         * Réinitialisation du formulaire.
         */
        this.resetForm();


        /**
         * On recharge la liste pour afficher
         * immédiatement la nouvelle démarche.
         */
        this.loadDemarches();
      },


      /**
       * Erreur lors de la création.
       */
      error: (error) => {

        console.error(
          'Erreur lors de la création de la démarche :',
          error
        );

        this.loading = false;

        this.showMessage(
          this.getErrorMessage(
            error,
            'Impossible de créer la démarche.'
          ),
          'error'
        );
      }

    });
  }


  // ==========================================================
  // PASSER EN MODE MODIFICATION
  // ==========================================================

  /**
   * Place le formulaire en mode modification.
   *
   * Lorsque l'administrateur clique sur "Modifier",
   * les informations de la démarche sont copiées
   * dans le formulaire.
   */
  editDemarche(demarche: Demarche): void {

    /**
     * Activation du mode modification.
     */
    this.isEditing = true;


    /**
     * Conservation de l'identifiant de la démarche.
     *
     * Il sera utilisé pour construire l'URL PUT.
     */
    this.editingId = demarche.id;


    /**
     * Remplissage du formulaire.
     */
    this.demarcheForm = {

      titre: demarche.titre,

      description: demarche.description,

      categorieId:
        demarche.categorie?.id ?? 0,

      dateLimite:
        demarche.dateLimite ?? null
    };


    /**
     * On remonte en haut de la page afin que
     * l'administrateur voie immédiatement le formulaire.
     */
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }


  // ==========================================================
  // MODIFIER UNE DÉMARCHE
  // ==========================================================

  /**
   * Envoie les modifications d'une démarche
   * au backend.
   *
   * PUT :
   *
   * /api/demarches/{id}
   */
  updateDemarche(): void {

    /**
     * Vérification de sécurité.
     */
    if (this.editingId === null) {

      this.showMessage(
        'Aucune démarche sélectionnée pour la modification.',
        'error'
      );

      return;
    }


    /**
     * Vérification du formulaire.
     */
    if (!this.isFormValid()) {
      return;
    }


    this.loading = true;


    /**
     * Données envoyées à l'API.
     */
    const payload = {

      titre:
        this.demarcheForm.titre.trim(),

      description:
        this.demarcheForm.description.trim(),

      categorieId:
        this.demarcheForm.categorieId,

      dateLimite:
        this.demarcheForm.dateLimite || null
    };


    this.http.put<Demarche>(
      `${this.apiUrl}/demarches/${this.editingId}`,
      payload,
      {
        headers: this.getHeaders()
      }
    )
    .subscribe({

      /**
       * Modification réussie.
       */
      next: (response) => {


        this.loading = false;


        this.showMessage(
          'La démarche a été modifiée avec succès.',
          'success'
        );


        /**
         * Réinitialisation du formulaire.
         */
        this.resetForm();


        /**
         * Actualisation de la liste.
         */
        this.loadDemarches();
      },


      /**
       * Erreur lors de la modification.
       */
      error: (error) => {

        console.error(
          'Erreur lors de la modification :',
          error
        );

        this.loading = false;

        this.showMessage(
          this.getErrorMessage(
            error,
            'Impossible de modifier la démarche.'
          ),
          'error'
        );
      }

    });
  }


  // ==========================================================
  // SUPPRIMER UNE DÉMARCHE
  // ==========================================================

  /**
   * Supprime une démarche.
   *
   * Avant la suppression, une confirmation est demandée
   * à l'administrateur.
   *
   * DELETE :
   *
   * /api/demarches/{id}
   */
  deleteDemarche(id: number): void {

    /**
     * Recherche de la démarche dans la liste.
     */
    const demarche = this.demarches.find(
      item => item.id === id
    );


    /**
     * Message de confirmation.
     */
    const confirmation = window.confirm(

      `Voulez-vous vraiment supprimer la démarche "${demarche?.titre ?? ''}" ?\n\n` +

      `Cette action supprimera la démarche de la liste.`
    );


    /**
     * L'administrateur a annulé.
     */
    if (!confirmation) {
      return;
    }


    this.loading = true;


    this.http.delete(
      `${this.apiUrl}/demarches/${id}`,
      {
        headers: this.getHeaders()
      }
    )
    .subscribe({

      /**
       * Suppression réussie.
       */
      next: () => {

        this.loading = false;


        this.showMessage(
          'La démarche a été supprimée avec succès.',
          'success'
        );


        /**
         * Si la démarche supprimée était celle
         * actuellement modifiée, on quitte le mode édition.
         */
        if (this.editingId === id) {

          this.resetForm();
        }


        /**
         * Actualisation de la liste.
         */
        this.loadDemarches();
      },


      /**
       * Erreur lors de la suppression.
       */
      error: (error) => {

        console.error(
          'Erreur lors de la suppression de la démarche :',
          error
        );

        this.loading = false;

        this.showMessage(
          this.getErrorMessage(
            error,
            'Impossible de supprimer la démarche.'
          ),
          'error'
        );
      }

    });
  }


  // ==========================================================
  // RÉINITIALISER LE FORMULAIRE
  // ==========================================================

  /**
   * Remet le formulaire dans son état initial.
   *
   * Cette méthode est utilisée :
   *
   * - après une création ;
   * - après une modification ;
   * - lorsque l'utilisateur clique sur "Annuler".
   */
  resetForm(): void {

    this.isEditing = false;

    this.editingId = null;


    this.demarcheForm = {

      titre: '',

      description: '',

      categorieId: 0,

      dateLimite: null
    };
  }


  // ==========================================================
  // VALIDATION DU FORMULAIRE
  // ==========================================================

  /**
   * Vérifie que les champs obligatoires sont correctement
   * renseignés avant d'envoyer la requête au backend.
   */
  private isFormValid(): boolean {

    /**
     * Vérification du titre.
     */
    if (!this.demarcheForm.titre.trim()) {

      this.showMessage(
        'Veuillez renseigner le titre de la démarche.',
        'error'
      );

      return false;
    }


    /**
     * Vérification de la description.
     */
    if (!this.demarcheForm.description.trim()) {

      this.showMessage(
        'Veuillez renseigner la description de la démarche.',
        'error'
      );

      return false;
    }


    /**
     * Vérification de la catégorie.
     *
     * 0 correspond à l'option :
     * "Sélectionnez une catégorie".
     */
    if (
      !this.demarcheForm.categorieId ||
      this.demarcheForm.categorieId <= 0
    ) {

      this.showMessage(
        'Veuillez sélectionner une catégorie.',
        'error'
      );

      return false;
    }


    return true;
  }


  // ==========================================================
  // AFFICHER UN MESSAGE
  // ==========================================================

  /**
   * Affiche un message dans le composant.
   *
   * Le message est automatiquement supprimé
   * après quelques secondes.
   */
  private showMessage(
    message: string,
    type: 'success' | 'error'
  ): void {

    this.message = message;

    this.messageType = type;


    /**
     * Suppression automatique du message après 5 secondes.
     */
    window.setTimeout(() => {

      this.message = '';

    }, 5000);
  }


  // ==========================================================
  // RÉCUPÉRER LE MESSAGE D'ERREUR
  // ==========================================================

  /**
   * Essaie de récupérer un message compréhensible
   * depuis la réponse du backend.
   *
   * Cela permet d'éviter d'afficher uniquement
   * "Http failure response".
   */
  private getErrorMessage(
    error: any,
    defaultMessage: string
  ): string {

    /**
     * Message directement envoyé par le backend.
     */
    if (
      error?.error?.message &&
      typeof error.error.message === 'string'
    ) {

      return error.error.message;
    }


    /**
     * Dans certains cas, le backend peut retourner
     * directement une chaîne de caractères.
     */
    if (
      typeof error?.error === 'string' &&
      error.error.trim()
    ) {

      return error.error;
    }


    /**
     * Message générique si aucune information
     * exploitable n'est disponible.
     */
    return defaultMessage;
  }

}