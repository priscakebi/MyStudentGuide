// Importe les éléments nécessaires au composant Angular.
import { Component, OnInit } from '@angular/core';

// Permet d'utiliser les fonctionnalités communes d'Angular dans le HTML.
import { CommonModule } from '@angular/common';

// Permet d'utiliser [(ngModel)] dans les formulaires.
import { FormsModule } from '@angular/forms';

// Permet d'effectuer les requêtes HTTP vers le backend.
import { HttpClient, HttpHeaders } from '@angular/common/http';

// Permet de naviguer entre les différentes pages.
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { environment } from '../../../../environments/environment';


// Interface représentant une catégorie.
interface Categorie {
  id?: number;
  nom: string;
  description: string;
}


@Component({
  selector: 'app-categories-admin',

  // Le composant est autonome.
  standalone: true,

  // Modules et directives utilisés dans le HTML.
  imports: [
    CommonModule,
    FormsModule,
   
  ],

  // Fichiers HTML et SCSS associés.
  templateUrl: './categories-admin.html',
  styleUrl: './categories-admin.scss'
})
export class CategoriesAdmin implements OnInit {

  // URL de base de l'API des catégories.
  private apiUrl = `${environment.apiUrl}/categories`;

  // Liste des catégories récupérées depuis le backend.
  categories: Categorie[] = [];

  // Objet utilisé pour créer ou modifier une catégorie.
  categorieForm: Categorie = {
    nom: '',
    description: ''
  };

  // Permet de savoir si nous sommes en mode modification.
  isEditing = false;

  // Identifiant de la catégorie actuellement modifiée.
  editingId: number | null = null;

  // Affiche un message d'information ou d'erreur.
  message = '';

  // Permet de déterminer le type du message.
  messageType: 'success' | 'error' | '' = '';

  // Indique si une requête est actuellement en cours.
  loading = false;


  constructor(
    private http: HttpClient,
    private router: Router
  ) {}


  // Cette méthode est exécutée automatiquement au chargement de la page.
  ngOnInit(): void {
    this.loadCategories();
  }


  // Récupère toutes les catégories depuis le backend.
  loadCategories(): void {

    this.loading = true;

    this.http.get<Categorie[]>(this.apiUrl).subscribe({
      next: (data) => {

        // Stocke les catégories reçues dans le tableau.
        this.categories = data;

        this.loading = false;
      },

      error: (error) => {

        console.error('Erreur lors du chargement des catégories :', error);

        this.message = 'Impossible de charger les catégories.';
        this.messageType = 'error';

        this.loading = false;
      }
    });
  }


  // Récupère le token JWT enregistré après la connexion.
  private getHeaders(): HttpHeaders {

    const token = localStorage.getItem('token');

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }


  // Crée une nouvelle catégorie.
  createCategorie(): void {

    // Vérifie que le nom n'est pas vide.
    if (!this.categorieForm.nom.trim()) {

      this.message = 'Le nom de la catégorie est obligatoire.';
      this.messageType = 'error';

      return;
    }

    this.loading = true;

    this.http.post<Categorie>(
      this.apiUrl,
      this.categorieForm,
      { headers: this.getHeaders() }
    ).subscribe({

      next: () => {

        this.message = 'Catégorie créée avec succès.';
        this.messageType = 'success';

        // Réinitialise le formulaire.
        this.resetForm();

        // Recharge la liste.
        this.loadCategories();
      },

      error: (error) => {

        console.error('Erreur lors de la création :', error);

        this.message = 'Erreur lors de la création de la catégorie.';
        this.messageType = 'error';

        this.loading = false;
      }
    });
  }


  // Active le mode modification pour une catégorie.
  editCategorie(categorie: Categorie): void {

    this.isEditing = true;

    this.editingId = categorie.id ?? null;

    // Copie les informations de la catégorie dans le formulaire.
    this.categorieForm = {
      id: categorie.id,
      nom: categorie.nom,
      description: categorie.description
    };

    // Remonte vers le formulaire.
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }


  // Met à jour une catégorie existante.
  updateCategorie(): void {

    // Vérifie qu'une catégorie est bien sélectionnée.
    if (this.editingId === null) {
      return;
    }

    // Vérifie que le nom n'est pas vide.
    if (!this.categorieForm.nom.trim()) {

      this.message = 'Le nom de la catégorie est obligatoire.';
      this.messageType = 'error';

      return;
    }

    this.loading = true;

    this.http.put<Categorie>(
      `${this.apiUrl}/${this.editingId}`,
      this.categorieForm,
      { headers: this.getHeaders() }
    ).subscribe({

      next: () => {

        this.message = 'Catégorie modifiée avec succès.';
        this.messageType = 'success';

        // Quitte le mode modification.
        this.resetForm();

        // Recharge les catégories.
        this.loadCategories();
      },

      error: (error) => {

        console.error('Erreur lors de la modification :', error);

        this.message = 'Erreur lors de la modification de la catégorie.';
        this.messageType = 'error';

        this.loading = false;
      }
    });
  }


  // Supprime une catégorie.
  deleteCategorie(id?: number): void {

    // Vérifie que l'identifiant existe.
    if (id === undefined) {
      return;
    }

    // Demande confirmation avant suppression.
    const confirmation = confirm(
      'Voulez-vous vraiment supprimer cette catégorie ?'
    );

    if (!confirmation) {
      return;
    }

    this.loading = true;

    this.http.delete(
      `${this.apiUrl}/${id}`,
      { headers: this.getHeaders() }
    ).subscribe({

      next: () => {

        this.message = 'Catégorie supprimée avec succès.';
        this.messageType = 'success';

        // Recharge la liste après suppression.
        this.loadCategories();
      },

      error: (error) => {

        console.error('Erreur lors de la suppression :', error);

        this.message = 'Erreur lors de la suppression de la catégorie.';
        this.messageType = 'error';

        this.loading = false;
      }
    });
  }


  // Annule le mode modification et vide le formulaire.
  resetForm(): void {

    this.categorieForm = {
      nom: '',
      description: ''
    };

    this.isEditing = false;
    this.editingId = null;
  }


  // Déconnexion de l'administrateur.
  logout(): void {

    // Supprime le token JWT.
    localStorage.removeItem('token');

    // Supprime également les informations de l'utilisateur.
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    localStorage.removeItem('role');

    // Retourne vers la page de connexion.
    this.router.navigate(['/login']);
  }
}