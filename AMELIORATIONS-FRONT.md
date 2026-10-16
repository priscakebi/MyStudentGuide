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

## 12. Étapes et liens officiels modifiables dans l'admin
- Gestion des démarches → « 📝 Contenu » ouvre, sous la démarche, l'éditeur des **étapes** et des **liens officiels**
  (composant `demarche-contenu-editor`).
- Étapes : ajouter (à la fin), modifier titre et description, supprimer, monter / descendre (↑ ↓).
  La numérotation reste continue (1, 2, 3…) après une suppression ou un déplacement.
- Liens officiels : ajouter, modifier (nom, adresse `http(s)://…`, description), supprimer.
- Erreurs de saisie affichées telles que l'API les renvoie (titre obligatoire, adresse invalide, longueurs maximales).
- Démarche importée de Service-Public : un avertissement rappelle que « Appliquer la mise à jour » officielle
  remplace les étapes et les liens.
- API (ADMIN) : `GET /api/admin/demarches/{id}/contenu`, `POST|PUT|DELETE …/etapes[/{etapeId}]`,
  `PUT …/etapes/ordre` (`{"ids":[…]}`, la liste complète des étapes), `POST|PUT|DELETE …/liens[/{lienId}]`.
  Chaque appel renvoie le contenu complet à jour.

## 13. Recherche dans les démarches
- Page « Mes démarches » : champ de recherche au-dessus des catégories (les deux filtres se combinent),
  nombre de résultats, et message « Aucune démarche ne correspond » avec un bouton pour tout réafficher.
- Accueil : champ de recherche dans le bandeau, qui ouvre `/demarches?q=…` et descend jusqu'aux résultats.
  La recherche reste dans l'adresse : une recherche peut être partagée ou mise en favori.
- Recherche faite dans le navigateur (aucun appel à l'API en plus), dans `utils/recherche.ts` :
  - insensible aux majuscules et aux accents (« sejour » trouve « séjour ») ; petits mots ignorés (« de », « la », « mon »…) ;
  - tous les mots cherchés doivent se retrouver dans le titre, la catégorie ou la description ;
  - synonymes du quotidien étudiant : CAF ↔ APL, sécu / ameli → carte Vitale, banque ↔ bancaire, job ↔ emploi… ;
  - pluriels (« logements ») et une faute de frappe d'une lettre sur les mots d'au moins 5 lettres (« prefecure ») ;
  - tri : titre avant catégorie avant description, et un mot exact avant un synonyme ou une faute.
- Pour ajouter un synonyme : compléter la table `SYNONYMES` de `utils/recherche.ts` (mots sans accents, en minuscules).

## 14. Checklist des documents
- Page de détail d'une démarche, section « Documents requis » : un étudiant qui a **commencé** la démarche
  coche les documents au fur et à mesure qu'il les rassemble (toute la carte est cliquable).
- Barre de progression « 2 / 5 documents prêts », qui devient verte avec « Dossier complet » quand tout est coché.
- La case change tout de suite ; si l'enregistrement échoue, elle revient en arrière avec un message.
- Étudiant qui n'a pas encore commencé la démarche : invitation à la commencer pour utiliser la checklist.
  Visiteur et administrateur : simple liste, comme avant.
- Types de documents affichés en clair (« Identité », « Domicile »… au lieu de IDENTITE, DOMICILE).
- Aucun fichier n'est envoyé : c'est un aide-mémoire. Un document supprimé par l'admin ne compte plus.
- API : `PUT /api/student-demarches/{id}/documents-prets/{documentId}?pret=true|false` (ETUDIANT propriétaire du suivi) ;
  le suivi renvoie `documentsPrets` (identifiants cochés), stocké dans la table `student_demarche_documents_prets`
  (créée automatiquement au démarrage).

## 15. Export des dates limites vers l'agenda
- Page de détail d'une démarche : bouton « Ajouter à mon agenda » sous la date limite (si elle n'est pas passée),
  pour tous les visiteurs.
- Tableau de bord, panneau « Prochaines échéances » : « Ajouter à mon agenda » exporte d'un coup toutes les
  dates limites à venir des démarches en cours (pas seulement les 3 affichées).
- Fichier `.ics` standard (Google Agenda, Apple Calendrier, Outlook) : événement « toute la journée » le jour de
  la date limite, rappels une semaine avant et la veille à 9 h, lien vers la démarche dans la description.
  Sur téléphone, ouvrir le fichier propose directement de l'ajouter à l'agenda.
- Tout est généré dans le navigateur (`src/app/utils/calendrier.ts`) : aucun changement côté API.
- Limite : c'est une copie ; si l'administrateur change ensuite la date limite, il faut réexporter.
  Certains agendas (Google Agenda en import) ignorent les rappels du fichier.

## 16. Titre de chaque page dans l'onglet du navigateur
- Chaque page a son propre titre d'onglet, suivi de « · MyStudentGuide » : « Toutes les démarches · MyStudentGuide »,
  « Mon espace · MyStudentGuide », « Démarches · Administration · MyStudentGuide »…
- Page d'une démarche : l'onglet prend le nom de la démarche, et la description lue par Google (balise `description`)
  reprend le début de son texte. Les autres pages gardent la description générale de `index.html`.
- Les titres sont déclarés dans `app.routes.ts` (propriété `title`) ; le suffixe est ajouté par
  `src/app/services/page-title.strategy.ts`. Pour une nouvelle page, il suffit d'ajouter `title: '...'` à sa route.
- Limite : l'application est rendue dans le navigateur. Google exécute le JavaScript et voit donc ces titres,
  mais d'autres robots (aperçus de liens WhatsApp, Facebook…) ne voient que « MyStudentGuide ».

## 17. Sidebars, formulaires et pied de page
- **Sidebar étudiante** : menu regroupé (Mon parcours, Explorer, Mon compte). Sur téléphone, le bouton ☰
  ne faisait rien (la sidebar restait cachée) : elle s'ouvre maintenant en tiroir, fermé par ✕, Échap,
  un clic à côté ou un changement de page.
- **Sidebar administrateur** : fond bleu nuit pour la distinguer de l'espace étudiant, menu regroupé,
  lien « Voir le site », tiroir sur téléphone au lieu d'une bande à faire défiler.
- **Formulaires** : contour bleu au focus partout (le rouge est réservé aux erreurs) ; les formulaires admin
  appliquent les limites de l'API (nom de catégorie 100 caractères, titre de démarche 150…) avec un compteur.
- **Pied de page** : navigation, sites officiels (Service-Public, ANEF, Campus France, etudiant.gouv.fr),
  mention « informations indicatives », bouton « Haut de page ».

## 18. Besoin d'aide ? (contact de l'administration)
- **Étudiant** : page `/dashboard/aide` (menu « Besoin d'aide ? », lien du pied de page, et
  « Poser une question à l'équipe » sur la page d'une démarche, qui présélectionne la démarche).
  Sujet, démarche facultative, message de 10 à 2000 caractères ; l'historique affiche les réponses
  et permet de supprimer une demande. Au plus 3 demandes en attente à la fois.
- **Administrateur** : page `/admin/aide` (« Demandes d'aide », avec compteur dans la sidebar) pour répondre,
  fermer sans suite ou rouvrir. La réponse arrive à l'étudiant en notification.
- **Données personnelles** : l'étudiant est averti de ne pas écrire de données sensibles ; les demandes
  traitées sont effacées après 12 mois (tâche nocturne) et toutes ses demandes sont supprimées avec son compte.

**Backend (MyStudentGuide-Api)** :
- `POST /api/aide`, `GET /api/aide/me`, `DELETE /api/aide/{id}` (étudiant).
- `GET /api/admin/aide?statut=`, `PUT /api/admin/aide/{id}/reponse`, `PATCH /api/admin/aide/{id}?statut=` (admin).
- Nouvelle table `demandes_aide` (créée automatiquement, `ddl-auto=update`) ; `demandesAideOuvertes` ajouté à `/api/admin/stats`.

## 19. Nettoyage du style inutilisé
- 53 classes CSS que plus aucune page n'utilisait ont été retirées de 9 pages (accueil, tableau de bord,
  démarches, suivis, profil, mot de passe oublié, administration : tableau de bord, documents, utilisateurs),
  soit environ 750 lignes de SCSS en moins. Restes d'anciennes versions des pages (carte « Ma progression »,
  décorations de l'accueil, aperçu de démarche dans la gestion des documents…).
- Vérifié avant suppression : les styles de chaque page ne s'appliquent qu'à son propre template
  (pas de `ViewEncapsulation.None` ni de `::ng-deep`), et aucune de ces classes n'est ajoutée par le code.
- Aucun changement visible : compilation et tests OK, pages contrôlées à l'œil.
- Il n'y avait aucun `console.log` dans le code ; les `console.error` des gestionnaires d'erreurs sont conservés.

## 20. Version anglaise de l'interface étudiante
- Bouton **FR / EN** dans la barre du haut, dans la barre latérale de l'espace étudiant et sur les pages de connexion,
  d'inscription et de mot de passe. À la première visite, la langue du navigateur est utilisée (anglais si le
  navigateur n'est pas en français) ; le choix est ensuite mémorisé. Le changement est immédiat, sans rechargement.
- Traduit : accueil, démarches et détail, documents, aide, notifications, connexion / inscription / mot de passe,
  espace étudiant (tableau de bord, suivis, profil, compte), menus, pied de page, titres d'onglets, dates
  (« Thursday 15 October 2026 ») et fichier agenda (.ics). L'administration reste en français.
- **Non traduit** (contenu, pas interface) : titres, descriptions et étapes des démarches (Service-Public / admin),
  notifications et réponses de l'équipe. En anglais, une note l'indique sur la page d'une démarche et des notifications.
  Les messages d'erreur de l'API sont en français : en anglais, un message générique les remplace.
- Technique, sans dépendance : `src/app/i18n/` — `LangueService` (langue courante), pipes `t` (texte) et `dateL` (date),
  textes rangés par page dans `i18n/textes/*.ts` avec le français et l'anglais côte à côte.
  Ajouter un texte : `'page.cle': { fr: '…', en: '…' }` dans le bon fichier, puis `{{ 'page.cle' | t }}` dans le template.
  Une clé mal écrite ou une traduction manquante bloque la compilation ; un test vérifie qu'il n'y a ni doublon, ni
  texte anglais vide, ni paramètre `{n}` différent entre les deux langues.
- Les tests unitaires tournent avec un navigateur simulé en français (`src/test-setup.ts`).

## 21. Administrateur sur le site public
- L'espace étudiant (`/dashboard`) renvoie un administrateur vers `/admin` (`authGuard`) : il ne voit plus un
  tableau de bord étudiant vide.
- Barre du haut : pour un administrateur, « Notifications » mène à `/admin/notifications` ; la page publique
  `/notifications` l'y redirige aussi.
- Accueil : un administrateur venu « voir le site » est salué « Bonjour Admin » et a un bouton
  « Retour à l'administration » ; la section « Mon parcours » (réservée aux étudiants) lui est masquée.

## 22. Nouveau visuel des formulaires de connexion et d'inscription
- Connexion étudiant, inscription et connexion administrateur partagent une mise en page commune
  (`src/app/pages/_auth-layout.scss`) : panneau de marque à gauche (dégradé bleu, liseré bleu-blanc-rouge,
  atouts, illustration), formulaire dans une carte à droite ; sur téléphone, le panneau devient un bandeau compact.
- Champs plus hauts avec icône (e-mail, cadenas, personne), focus bleu, bouton principal bleu,
  messages d'erreur et d'information harmonisés, lien « Retour à l'accueil » et choix FR / EN en haut.
- Administrateur : même structure, panneau bleu nuit et bouclier, textes en français.
- « Mot de passe oublié » et « Nouveau mot de passe » (étudiant et administrateur) suivent la même mise en page,
  avec un message de confirmation vert et le contrôle du mot de passe en direct.

## 23. Conformité RGPD et pages légales
- Trois pages accessibles à tous et liées en bas du pied de page : **Mentions légales** (`/mentions-legales`),
  **Politique de confidentialité** (`/confidentialite`) et **Conditions d'utilisation** (`/conditions-utilisation`).
  Texte en français (version qui fait foi) ; en anglais, un encadré l'indique avec un court résumé.
- **À compléter avant la mise en ligne** : `src/app/pages/legal/legal-info.ts` (éditeur, adresse, contact,
  directeur de publication, hébergeur de la base de données, région Render / garanties du transfert hors UE).
  Tant qu'elles ne sont pas renseignées, ces informations s'affichent surlignées en orange sur les pages.
- **Consentement à l'inscription** : case obligatoire « J'ai lu et j'accepte les conditions d'utilisation et la
  politique de confidentialité ». L'API refuse l'inscription sans elle et enregistre la version acceptée et la date
  (`User.conditionsVersion`, `User.conditionsAccepteesLe`). Version : `VERSION_CONDITIONS` (front) =
  `ConditionsUtilisation.VERSION` (API), à changer des deux côtés si les textes changent.
- **Télécharger mes données** (« Mon compte ») : `GET /api/account/export` renvoie toutes les données de l'étudiant en
  JSON (compte, profil, suivis, notifications, avis, signalements, demandes d'aide), sans le mot de passe.
- **Police hébergée par le site** (`/fonts`, paquet `@fontsource-variable/plus-jakarta-sans`) : plus aucune requête
  vers Google Fonts, donc aucune adresse IP transmise à Google.
- La déconnexion efface aussi le prénom et le nom du navigateur ; les demandes d'aide sont purgées 12 mois après
  leur traitement (et non plus après leur envoi) ; « Mon compte » indique que la suppression est immédiate et définitive.

## 24. Comptes inactifs et rappels par e-mail (API)
- **Comptes inactifs** : un compte étudiant sans connexion depuis 3 ans est prévenu par e-mail, puis supprimé
  30 jours plus tard avec toutes ses données s'il ne s'est pas reconnecté (`InactiviteService`, chaque nuit).
  Les administrateurs ne sont jamais concernés. Réglages : `app.comptes.inactivite-mois` (36),
  `app.comptes.preavis-jours` (30). La dernière connexion est enregistrée à chaque connexion réussie ;
  pour les comptes plus anciens, la date de création sert de référence.
- **Rappels d'échéance par e-mail** : en plus de la notification, un e-mail part 7 jours puis 3 jours avant la
  date limite d'une démarche en cours, avec le lien vers la démarche (une seule fois par rappel).
- La politique de confidentialité mentionne ces deux points.

## 25. Dates limites personnalisées
- **Profil** (« Situation administrative ») : deux dates facultatives, *date d'arrivée en France* et
  *fin de validité du visa / titre de séjour*, envoyées à l'API et incluses dans l'export des données.
- **Administration** (bouton « 📅 Échéance » d'une démarche) : règle « N jours après l'arrivée en France » ou
  « N jours avant la fin du titre de séjour », avec deux modèles (VLS-TS : 90 j après l'arrivée ;
  renouvellement : 60 j avant la fin du titre). `PUT /api/admin/demarches/{id}/echeance` ; une règle vide l'efface.
- **Calcul (API)** : `EcheancePersonnelle.calculer(demarche, profil)`. Chaque suivi expose
  `dateLimitePersonnelle` ; sans règle ou sans la date du profil, la date limite générale s'applique.
  Les rappels (notification + e-mail) utilisent cette date personnelle.
- **Étudiant** : la fiche affiche « Votre date limite » et la règle (« 90 jours après votre arrivée en France ») ;
  si la date manque, un lien invite à compléter le profil ou à commencer la démarche. Tableau de bord, agenda (.ics)
  et liste des démarches utilisent `dateLimiteDe(suivi)` (`student-demarche.service.ts`).
- À faire côté administration : renseigner la règle sur les démarches concernées (VLS-TS, renouvellement…).

## 26. Contenu des démarches en anglais
- **Administration → Démarches → « 🌐 Anglais »** : chaque texte français (titre, description, étapes,
  documents requis, liens officiels) est affiché en regard de son champ anglais, avec un compteur
  « 10 / 22 textes traduits ». Un badge « 🌐 Traduite en anglais » apparaît dans la liste.
  `GET / PUT /api/admin/demarches/{id}/traduction` ; un champ vide efface la traduction.
- **Catégories** : nom et description en anglais dans le formulaire. Les 8 catégories de base reçoivent
  leur traduction automatiquement au démarrage de l'API (sans remplacer celle saisie par l'admin).
  Le formulaire renvoie aussi l'icône, qui était effacée à chaque modification.
- **Étudiant (interface en anglais)** : pipe `tc` (`{{ demarche | tc: 'titre' }}` → `titreEn` s'il existe,
  sinon `titre`) sur la liste, la fiche, le tableau de bord, les suivis et la page Documents.
  La note « contenu en français » ne s'affiche plus que pour les démarches non traduites.
  La recherche trouve aussi les mots anglais (« residence permit »).
- La mise à jour officielle Service-Public remplace les étapes et les liens : leur version anglaise est
  à refaire (le message de confirmation le rappelle). Le lien « Fiche officielle Service-Public » est
  traduit automatiquement.
- Correction : la page Documents affichait des titres de démarche vides (champ `nom` au lieu de `titre`).

## 27. Suivi des erreurs (Sentry)
- **Inactif tant qu'aucun DSN n'est renseigné** : `sentryDsn` dans `src/environments/environment.prod.ts`
  (site) et la variable `SENTRY_DSN` sur Render (API). Créer l'organisation Sentry en région **EU**.
- **Site** (`services/suivi-erreurs.ts`) : erreurs Angular (`ErrorHandler`), erreurs JavaScript globales,
  promesses rejetées, et API injoignable (502 / 503 / 504, `erreurs-serveur.interceptor.ts`).
  Sentry est téléchargé seulement quand le suivi est actif (fichier séparé de 27 Ko compressés).
- **API** : `sentry-spring-boot-4-starter` + `sentry-logback` (8.59.0) ; chaque `log.error` (dont les
  erreurs 500) devient une alerte, les `log.warn` servent de contexte.
- **Aucune donnée personnelle** : ni utilisateur, ni adresse IP, ni cookies / en-têtes, adresses sans
  paramètres (jeton de réinitialisation), adresses e-mail masquées, messages de la console ignorés,
  pas de comptage des visites ni de mesure des performances. Vérifié avec un faux serveur Sentry.
- Politique de confidentialité : Sentry ajouté aux prestataires, ligne « Rapports d'erreur techniques »
  et durée de conservation (`CONSERVATION_RAPPORTS_ERREUR` dans `legal-info.ts`, à vérifier dans Sentry).

## 28. Accessibilité
- Audit automatique **axe-core** (règles WCAG 2.x A et AA) de 30 pages (visiteur, étudiant, admin), sur
  ordinateur et sur téléphone, en français et en anglais : de 223 éléments en défaut à **0**.
- **Contrastes** : rouge de la marque assombri (`#e63946` → `#d0222f`, texte blanc à 5,3:1), gris clairs
  remplacés par `#667085` (ou `#5b6474` sur fond teinté), vert « terminée » `#11704d`, barre latérale admin
  plus claire sur fond sombre. Seule la propriété `color` a été modifiée pour les gris.
- **Structure** : un seul `<main id="contenu">` par page (dans le layout public, l'espace étudiant et
  l'administration) ; les pages n'ont plus leur propre `<main>`. Niveaux de titres sans saut (h1 → h2).
- **Lien « Aller au contenu »** (FR / EN), visible au premier Tab : place le focus sur la zone principale
  (`utils/aller-au-contenu.ts` ; un simple `href="#contenu"` renverrait à l'accueil à cause de `<base href="/">`).
- Tableaux défilants de la politique de confidentialité accessibles au clavier ; contour de focus sur les
  barres du graphique admin ; « Réduire les animations » du système respecté partout.
- Pour relancer l'audit : servir le site, puis exécuter axe-core sur chaque page (extension navigateur
  « axe DevTools » ou Lighthouse → Accessibilité).

## 29. Poids du chargement initial
- Connexion, inscription et connexion administrateur passent en **chargement à la demande**
  (`loadComponent`), comme toutes les autres pages : un visiteur qui arrive sur l'accueil ne
  télécharge plus ces formulaires ni `@angular/forms`.
  Chargement initial : **535 → 418 Ko** (136 → 116 Ko compressés, −15 %).
- Budgets (`angular.json`) : nouveau budget `initial` (alerte à 450 Ko, erreur à 550 Ko) pour éviter
  qu'une page soit de nouveau importée directement ; styles d'un composant : alerte à 16 Ko.
  Les 5 feuilles de style au-dessus de 12 Ko ne contiennent ni classe inutilisée ni règle en double
  (les « doublons » sont des adaptations mobile / tablette) ; les réécrire ferait gagner moins de 1 Ko
  compressé par page, chargé seulement sur cette page.

## 30. Mise à jour de sécurité d'Angular
- Angular **21.2.18 → 21.2.25** (outils de build 21.2.19 → 21.2.24) : corrige 5 failles signalées par
  `npm audit` (dont un contournement de l'assainissement HTML et une faille XSS). `npm audit --omit=dev` :
  **0 vulnérabilité** dans le code livré aux étudiants.
- `package-lock.json` régénéré avec `npm install --before=2026-10-02` (npm 11.20) : toutes les versions
  retenues ont au moins deux semaines. npm 11.2 plantait sur ce changement (« edgesOut ») ;
  utiliser `npx npm@11.20.0 install` si besoin.
- Restent 3 alertes dans les outils de build uniquement (piscina, SDK MCP du CLI, http-cache-semantics),
  déjà présentes avant : elles disparaîtront avec une prochaine version du CLI Angular.
