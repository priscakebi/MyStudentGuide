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

## 7. Dashboards étudiant et administrateur
**Étudiant (`/dashboard`, page « Mon espace »)** :
- Bandeau de bienvenue (date, prénom) avec la progression globale en anneau et deux boutons
  (« Explorer les démarches », « Mes démarches »).
- 4 chiffres clés cliquables : démarches en cours, terminées, notifications non lues, état du profil.
- « Mes démarches en cours » : les 3 plus avancées, avec barre de progression et prochaine étape conseillée.
- « Prochaines échéances » : dates limites à venir (en rouge à 7 jours ou moins).
- « Suggéré pour vous » : suggestions de l'administration avec « Voir plus » / « Commencer ».
- Rappel « Complétez votre profil » tant que le profil n'est pas complet ; raccourcis en bas de page.

**Administrateur (`/admin`)** :
- Nouvel endpoint `GET /api/admin/stats` (ADMIN) : toutes les statistiques en une requête
  (avant, quatre listes complètes étaient téléchargées juste pour être comptées).
- Chiffres clés : étudiants inscrits (+ nouveaux de la semaine), démarches en cours, terminées, satisfaction (note moyenne des avis).
- Graphiques : taux de complétion (anneau), inscriptions des 8 dernières semaines (colonnes),
  5 démarches les plus suivies (barres). Valeurs affichées, infobulle au survol et au clavier.
- Activité récente (dernières notifications de l'admin) et bandeau « X étudiants n'ont commencé
  aucune démarche » qui renvoie vers les suggestions.

**Langue** : la locale `fr` est enregistrée (`app.config.ts`), les dates s'affichent en français
(« jeudi 15 octobre »).

## 8. Import automatique des démarches depuis Service-Public
Source : fiches pratiques de Service-Public.gouv.fr, publiées en open data par la DILA
(data.gouv.fr, **Licence Ouverte** : citer la source et la date de mise à jour).
Une fiche = `https://lecomarquage.service-public.gouv.fr/vdd/3.5/part/xml/F2231.xml`.

**Parcours admin (Gestion des démarches → « Importer depuis Service-Public »)** :
1. Choisir une fiche du catalogue (17 fiches utiles aux étudiants internationaux) ou saisir un identifiant (`F2231`).
2. Aperçu : description, étapes, liens officiels. Choisir une catégorie → « Importer en brouillon ».
3. La démarche est créée en **brouillon** (invisible des étudiants). Ajouter les documents requis, puis « Publier ».
4. Chaque nuit (4 h 30), l'API compare les fiches importées à Service-Public. Si une fiche a changé :
   badge « Mise à jour officielle », notification aux admins, bouton « Appliquer la mise à jour »
   (remplace description, étapes et liens ; garde titre, catégorie, date limite et documents).
   Bouton « Vérifier les mises à jour » pour lancer la vérification tout de suite.

**Ce qui est importé** : titre, résumé + introduction (description), chaque section de la fiche
(une étape), téléservices / sites officiels / « où s'adresser » (liens), + un lien vers la fiche.
**Pas importé** : les pièces justificatives (format trop variable) → toujours gérées par l'admin.

**Côté étudiant** : la page d'une démarche importée affiche
« Source : Service-Public.gouv.fr (DILA) · mise à jour le … » (mention obligatoire).
Les brouillons n'apparaissent ni dans la liste, ni en détail, et ne peuvent être ni commencés ni suggérés.

**API (ADMIN)** : `/api/admin/service-public/catalogue`, `/fiches/{id}`, `/import`, `/verifier`,
`/demarches/{id}/mise-a-jour`, `/demarches/{id}/publication?statut=PUBLIEE|BROUILLON`.
Nouvelles colonnes sur `demarches` (ajoutées automatiquement) : `statut_publication`, `source_id`,
`source_url`, `source_date_maj`, `source_date_disponible`. Les démarches existantes restent publiées.

**Catégories** :
- Au premier démarrage (aucune catégorie en base), l'API crée les 8 catégories de base : Séjour & visa,
  Santé, Logement, Études, Banque & budget, Emploi, Transports, Vie quotidienne (les thèmes de l'accueil).
  Si des catégories existent déjà, rien n'est créé (une catégorie supprimée ne réapparaît pas).
- « Catégories » → bouton « Ajouter les catégories de base » : crée seulement celles qui manquent
  (`POST /api/categories/defaut`, ADMIN).
- À l'import, la catégorie est pré-sélectionnée : thème du catalogue, sinon thème officiel de la fiche
  (« Social - Santé » → Santé, « Étranger - Europe » → Séjour & visa…). Une catégorie créée par l'admin
  est aussi reconnue par mots-clés (« Titre de séjour » → Séjour & visa). L'admin peut la changer.

## 9. Signalements des étudiants et préfecture de l'étudiant
**« Signaler une erreur »** (page d'une démarche, étudiants connectés) :
- Motifs : information obsolète, lien cassé, information manquante, erreur, autre + précisions facultatives.
- Un seul signalement ouvert par étudiant et par démarche ; impossible sur un brouillon.
- Les admins reçoivent une notification. Nouvelle page **Admin → Signalements** (pastille du nombre à traiter,
  bandeau sur le dashboard) : « Voir la démarche », « Corriger », « ✓ Traité » (l'étudiant est remercié
  par notification), « Rejeter », « Rouvrir ».
- API : `POST /api/demarches/{id}/signalements` (ETUDIANT), `GET /api/admin/signalements?statut=`,
  `PATCH /api/admin/signalements/{id}?statut=` (ADMIN). Nouvelle table `signalements_demarches`
  (supprimée avec la démarche ; les signalements d'un étudiant sont supprimés avec son compte).

**Carte « Ma préfecture »** (dashboard étudiant + démarches qui se font en préfecture) :
- Ville d'études du profil → département (geo.api.gouv.fr) → préfecture (API Annuaire de l'administration, DILA) :
  adresse, téléphone, horaires, prise de rendez-vous, itinéraire, fiche officielle.
- Paris : Préfecture de police. Villes homonymes : « Saint-Denis » seul donne La Réunion (la plus peuplée) ;
  la carte affiche la ville reconnue et invite à ajouter le code postal (« Saint-Denis 93200 »), qui est pris en compte.
- Ville non renseignée : la carte invite à compléter le profil. Réponses gardées 24 h en mémoire.
- API : `GET /api/annuaire/prefecture/me` (ETUDIANT), `GET /api/annuaire/prefecture?ville=` (connecté).

## 10. Protection de la connexion (force brute)
- Après **5 mots de passe incorrects en 15 minutes** pour une même adresse e-mail, la connexion à cette adresse
  est refusée pendant **15 minutes** (HTTP 429 + en-tête `Retry-After`). Les pages de connexion étudiant et admin
  affichent « Trop de tentatives de connexion. Réessayez dans N minutes ou réinitialisez votre mot de passe. »
- Le blocage est vérifié avant le mot de passe (même le bon est refusé pendant le blocage) ; une connexion réussie
  remet le compteur à zéro. Même règle pour une adresse inexistante : rien ne révèle si un compte existe.
- Par compte et non par adresse IP : sur Render, toutes les requêtes passent par le même proxy.
- Réglable sans toucher au code : `app.login.max-echecs`, `app.login.fenetre-minutes`, `app.login.blocage-minutes`.
- Compteurs en mémoire : adapté à une seule instance de l'API ; un redémarrage les remet à zéro.

## 11. Suggestions automatiques d'après le profil
- Chaque démarche a un **ciblage** (Gestion des démarches → « 🎯 Ciblage ») : activé ou non, nationalité
  (hors UE / UE / tous), arrivée en France (première arrivée / déjà installés / tous), situation (visa) et logement.
  Un critère sur « Tous » ou sans case cochée ne filtre pas ; le badge « 🎯 Suggérée à : … » résume le ciblage.
- L'étudiant dont le profil remplit **tous** les critères reçoit une notification de suggestion (Voir plus / Commencer)
  qui dit pourquoi (« D'après votre profil (vous arrivez pour la première fois en France), … »).
- Déclenché quand l'étudiant enregistre son profil, et quand l'admin publie une démarche ou enregistre son ciblage
  (le message indique combien d'étudiants ont reçu la suggestion).
- Jamais deux fois la même suggestion (table `suggestions_envoyees`), ni pour une démarche déjà commencée,
  ni si l'admin l'a déjà suggérée. Une information manquante dans le profil = critère non rempli (pas de suggestion).
- Nationalité saisie en texte libre : reconnaissance des adjectifs des pays UE / EEE / Suisse (« Italienne », « allemand »…).
- Les fiches du catalogue Service-Public arrivent avec un ciblage par défaut (ex. F2231 titre de séjour → hors UE ;
  F12006 APL → location privée, résidence étudiante, Crous ; F265 carte Vitale → première arrivée).
- API : `PUT /api/admin/demarches/{id}/ciblage` (ADMIN) ; la publication renvoie aussi le nombre de suggestions envoyées.
