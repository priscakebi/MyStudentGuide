# Améliorations du front (MyStudentGuide)

## 1. Problème du « double clic » : corrigé
**Cause** : Angular 21 démarre par défaut sans zone.js (mode « zoneless »). Les pages modifient des
propriétés simples (`this.loading = false`, `this.items = data`...) dans les réponses HTTP, mais Angular
n'est pas prévenu : l'écran ne se met à jour qu'au clic suivant.

**Correction** : `zone.js` ajouté (`package.json`, `angular.json` → `polyfills`) et
`provideZoneChangeDetection({ eventCoalescing: true })` dans `app.config.ts`.

> ⚠️ Après avoir récupéré le projet, lance **`npm install`** (nouvelle dépendance `zone.js`),
> puis relance `ng serve`.

## 2. Connexion administrateur : ajoutée
- Nouvelle page **`/admin-login`** (`pages/admin-login/`).
- Un compte non ADMIN est refusé et sa session supprimée immédiatement.
- `/admin/**` : si tu n'es pas connecté → redirection vers `/admin-login` (avec retour à la page demandée après connexion).
- Session expirée côté admin → retour sur `/admin-login` avec un message.
- Lien « Espace administrateur » ajouté en bas de la page de connexion étudiant.
- La route `/account` (page admin) **n'était protégée par aucun guard** : elle est maintenant réservée aux admins.

## 3. Améliorations reprises de la passe précédente
- `environments/` : URL de l'API centralisée (+ `fileReplacements` de production ajoutés dans `angular.json`).
- `authGuard` / `adminGuard` corrigés (`inject(Router)`, expiration du JWT, `returnUrl`).
- `AuthService` : `register()`, `isAdmin()`, détection de token expiré.
- Interceptor : le token n'est envoyé qu'à l'API ; un 401 déconnecte l'utilisateur.
- Inscription branchée sur `POST /api/auth/register`.
- Page de connexion étudiant : utilise `AuthService`, gère `returnUrl` et « session expirée »,
  plus aucun `console.log` du token.

## Compte administrateur
Le formulaire admin ne permet pas de **créer** un administrateur : il faut qu'un compte avec le rôle
`ADMIN` existe déjà en base (colonne `role` de la table `users`).

## Non vérifié / à faire
- Je n'ai pas pu lancer `ng build` (pas d'accès réseau pour `npm install`) : seule la syntaxe TypeScript a été contrôlée.
- ~59 `console.log/error` restent dans les pages (sans données sensibles connues).
- La page `/forgot-password` n'existe pas : le lien « Mot de passe oublié ? » redirige vers l'accueil.

## 4. Renommage, navbar et page d'accueil
- **MyCampusGuide / MyCampusGYDE → MyStudentGuide** partout (31 fichiers : pages, navbar, footer, `index.html`,
  README, `angular.json`, nom du package `my-student-guide`).
- **Navbar** : sans utilisateur connecté, seuls le logo, « Accueil » et « Se connecter » sont affichés.
  « Mes démarches », « Documents » et « Notifications » n'apparaissent qu'une fois connecté.
  L'état de connexion est relu à chaque navigation (connexion, déconnexion, token expiré) ;
  l'avatar d'un administrateur mène à `/admin`.
- **Page d'accueil** : un visiteur non connecté voit « Bienvenue sur MyStudentGuide » avec les boutons
  « Se connecter » / « Créer un compte » et un bandeau final d'appel à l'action
  (avant : « Bonjour Étudiant 👋 » même sans connexion). Un étudiant connecté voit « Bonjour <prénom> »
  et « Continuer mon parcours ». Le bouton « Commencer » est protégé contre le double envoi.

## 5. Démarches ouvertes à tous, suggestions au lieu d'attributions
*(remplace le comportement de la navbar décrit au point 4)*

- **Navbar** : « Mes démarches », « Documents » et « Notifications » sont visibles par tous.
  `/demarches`, `/demarches/:id` et `/documents` n'ont plus d'`authGuard`. Un visiteur qui clique sur
  « Notifications » arrive sur `/notifications`, qui l'invite à se connecter.
- **Page « Mes démarches » (`/demarches`)** : affiche **toutes** les démarches (filtre par catégorie).
  « Voir plus » ouvre le détail ; « Commencer » est désactivé pour un visiteur ou un admin.
  Un étudiant connecté qui clique sur « Commencer » crée son suivi, directement « en cours ».
  Le détail d'une démarche a aussi un bouton « Commencer cette démarche ».
- **Plus d'attribution** : dans l'admin (Utilisateurs), « Attribuer » devient « Suggérer une démarche ».
  L'étudiant reçoit une notification avec « Voir plus » / « Commencer ».
- **Dashboard → Mes démarches (`/dashboard/suivis`)** : seulement les démarches commencées (en cours / terminées).
  Le statut « À faire » disparaît ; un bouton « Retirer » supprime le suivi.

**Backend (MyStudentGuide-Api)** :
- `GET /api/student-demarches/me` (étudiant) : démarches commencées.
- `POST /api/student-demarches/start/{demarcheId}` (étudiant) : commence une démarche (crée un profil vide si besoin).
- `POST /api/student-demarches/suggest?studentProfileId=&demarcheId=` (admin) : remplace `/assign`, qui est supprimé.
- `GET /api/documents-requis/demarche/{id}` est maintenant public.
- `Notification` : nouvelle colonne `demarche_id` (ajoutée automatiquement, `ddl-auto=update`).
- Les rappels automatiques ne concernent plus que les démarches EN_COURS.
- Les anciens suivis « À faire » restent en base mais ne sont plus affichés côté étudiant.

<!-- • npm test
• npx ng test --watch=false -->
## 6. Formulaires conformes, page d'accueil et écran de chargement
**Règles des champs (CNIL / ANSSI)**, identiques côté front (`utils/form-rules.ts`) et API (`validation/FormRules.java`) :
- Mot de passe : 12 à 72 caractères, avec une majuscule, une minuscule, un chiffre et un caractère spécial
  (les lettres accentuées comptent). Checklist en direct sous le champ.
  S'applique à l'inscription, à la réinitialisation et au changement de mot de passe (étudiant et admin),
  **pas à la connexion** : les comptes créés avec l'ancienne règle (8 caractères) se connectent toujours.
- E-mail : format `nom@domaine.ext`, 254 caractères maximum (inscription et connexion).
- Prénom / nom : 2 à 50 lettres, espaces, tirets et apostrophes.
- Connexion : le `returnUrl` accepte maintenant toute page interne (hors admin), par ex. `/demarches`.

**Écran de chargement** (`components/login-loader`) : après connexion ou inscription d'un étudiant,
2,8 s d'écran bleu avec liseré tricolore et deux bandes d'icônes qui défilent (démarches, vie étudiante,
France). Les animations sont coupées si le système demande de réduire les animations.

**Charte graphique et accueil** :
- Police Plus Jakarta Sans pour toute l'appli (avant : police par défaut du navigateur), `lang="fr"`,
  couleurs de la marque en variables CSS (`styles.scss`).
- Hero avec illustration d'étudiants devant la tour Eiffel (`public/images/etudiants-france.svg`),
  badges flottants et points forts.
- Nouvelle section « Toutes vos démarches, par thème » : 8 cartes (Séjour & visa, Santé, Logement, Études,
  Banque & budget, Emploi, Transports, Vie quotidienne), chacune listant des exemples de démarches.
- Illustration dans la section « Notre objectif » (`public/images/etudiant-demarches.svg`).
