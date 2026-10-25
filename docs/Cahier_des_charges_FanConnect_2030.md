# CAHIER DES CHARGES FONCTIONNEL ET TECHNIQUE

## FanConnect 2030
### Plateforme intelligente de réservation de cafés pour le jour de match  
### Coupe du Monde 2030

| | |
|---|---|
| **Type de document** | Cahier des charges — expression des besoins |
| **Usage** | Référence unique pour l’**analyse** (UML) et la **conception** |
| **Projet** | PFE ingénieur — Institut de Génie Appliqué (IGA) — 5DLTI |
| **Organisme d’accueil** | GM-Soft (German Moroccan Software Company) — Béni Mellal |
| **Auteur** | Kassimi |
| **Encadrant** | M. Bouchib Riyami |
| **Version** | 1.0 |
| **Date** | 21 septembre 2026 |
| **Statut** | Validé pour analyse / conception |
| **Confidentialité** | Usage académique et interne GM-Soft |

---

## Table des matières

1. Objet du document  
2. Contexte et problématique  
3. Objectifs  
4. Périmètre  
5. Analyse de l’existant  
6. Parties prenantes et acteurs  
7. Glossaire  
8. Exigences fonctionnelles détaillées  
9. Règles métier  
10. Spécification des cas d’utilisation (analyse)  
11. Modèle conceptuel des données (conception)  
12. Architecture cible (conception)  
13. Interfaces utilisateur  
14. Intégrations externes  
15. Exigences non fonctionnelles  
16. Sécurité  
17. Recette  
18. Livrables et traçabilité  
19. Annexes  

---

# 1. Objet du document

Le présent cahier des charges (CDC) spécifie **ce que le système FanConnect 2030 doit faire**, **pour qui**, **avec quelles règles**, et **dans quelles contraintes**.

Il constitue la **référence unique** à partir de laquelle sont dérivés :

| Phase | Artefacts produits à partir de ce CDC |
|---|---|
| **Analyse** | Diagramme de cas d’utilisation (include / extend), acteurs, scénarios, règles métier |
| **Conception** | Diagramme de classes, diagrammes de séquence, architecture 3-tiers, modèle relationnel |
| **Réalisation** | API REST, SPA React, service IA, paiements Stripe |
| **Recette** | Cas de test alignés sur les critères d’acceptation des EF / ENF |

**Règle de conduite :** toute fonctionnalité absente de ce document est hors contrat, sauf avenant. Toute conception (classe, endpoint, écran) doit tracer vers un identifiant d’exigence (EFxx / ENFxx / RMxx).

---

# 2. Contexte et problématique

## 2.1 Organisme d’accueil

GM-Soft (German Moroccan Software Company) est une SSII maroco-allemande (SARL, 2014) basée à Béni Mellal. Elle conçoit des logiciels métier : GM-ERP, GM-POS, **GM-CAFE**, GM-HOTEL.

FanConnect 2030 **prolonge GM-CAFE** : digitaliser le café **le jour de match** (calendrier sportif, géolocalisation, réservation, paiement, occupation prédictive).

## 2.2 Contexte métier

À l’approche de la Coupe du Monde 2030 au Maroc, les supporters cherchent un lieu **proche** et **disponible** pour regarder un match. Les cafés n’ont pas d’outil unifié : WhatsApp et le téléphone restent la norme. Il n’existe pas de lien fiable entre **le calendrier football**, **la table du café** et **l’occupation réelle**.

## 2.3 Problématique

> Comment concevoir une plateforme **fiable**, **sécurisée** et **intelligente** permettant aux supporters de réserver un lieu adapté pour un match, tout en aidant les cafés à anticiper l’affluence — dans le contexte de la CDM 2030 ?

Trois axes structurent l’analyse et la conception :

| Axe | Question de conception |
|---|---|
| **Métier** | Unifier match, lieu, table et paiement dans un seul parcours |
| **Occupation** | Estimer l’affluence avant le coup d’envoi (owner + réservations + IA) |
| **Architecture** | Séparer API métier, interface et service d’apprentissage |

---

# 3. Objectifs

## 3.1 Objectif général

Concevoir et réaliser une **plateforme web sécurisée** de réservation de cafés pour le jour de match, avec **recommandation géolocalisée** et **prédiction d’occupation**.

## 3.2 Objectifs spécifiques

| ID | Objectif | Indicateur de réussite |
|---|---|---|
| OS01 | Parcours fan bout-en-bout | Match → café → table → paiement → ticket QR |
| OS02 | Outil propriétaire | Dossier KYC, occupation live, check-in QR |
| OS03 | Pilotage administrateur | Validation des cafés, analytics, compétitions |
| OS04 | Intelligence utile | Prédiction d’affluence + recommandation de lieux |
| OS05 | Sécurité par rôles | JWT + FAN / OWNER / ADMIN isolés UI et API |

---

# 4. Périmètre

## 4.1 Inclus (dans le contrat)

- Application web SPA (React) responsive  
- API REST Spring Boot  
- Trois espaces : Fan, Propriétaire, Administrateur  
- Synchronisation des matchs (football-data.org)  
- Réservation d’une **table** d’un **café approuvé** pour un **match**  
- Paiement en ligne Stripe **mode test** (ou mode simulé si clés absentes)  
- Ticket QR unique + PDF + check-in  
- Occupation live (rapport owner + réservations pondérées)  
- Prédiction d’occupation (service Python / fallback heuristique)  
- Recommandation de cafés (distance 5 / 10 / 20 km + affluence)  
- Vérification documentaire KYC des établissements  
- Notifications in-app  
- Déploiement Docker Compose  
- Documentation OpenAPI / Swagger  

## 4.2 Exclus (hors contrat)

- Application mobile native (iOS / Android)  
- Stripe **live** (production réelle, virement owner)  
- Billetterie de stade / places FIFA  
- Remboursement automatique Stripe (seul le **statut métier** REFUNDED est géré)  
- Multi-devises hors MAD  
- Chat vocal, application TV, borne physique  

## 4.3 Hypothèses

- H1 : une table est **unique par match** (pas de double réservation PENDING/CONFIRMED).  
- H2 : le ticket n’existe **qu’après paiement** (PAID → CONFIRMED).  
- H3 : seuls les cafés **APPROVED** sont visibles et réservables.  
- H4 : le fan dispose d’un navigateur moderne et d’une connexion Internet.  
- H5 : le propriétaire peut saisir un effectif physique (walk-in).  

---

# 5. Analyse de l’existant

| Solution | Ce qu’elle fait | Ce qui manque pour le jour de match |
|---|---|---|
| TheFork / OpenTable | Réservation restaurant | Pas de calendrier sport |
| Billetterie stade | Tickets d’événement | Ignore les cafés de diffusion |
| WhatsApp / Facebook | Simple, déjà adopté | Pas d’occupation, pas de paiement, pas de table |
| Sites de cafés isolés | Identité du lieu | Pas de vision multi-établissements ni de match |

**Positionnement :** aucune offre n’unit calendrier football + géolocalisation + réservation de table + paiement + occupation prédictive. C’est l’espace de FanConnect 2030.

---

# 6. Parties prenantes et acteurs

## 6.1 Acteurs primaires (humains)

| Acteur UML | Rôle système | Description |
|---|---|---|
| **Utilisateur** | — | Super-acteur (généralisation) : s’authentifie (JWT) |
| **Fan** | `FAN_USER` | Supporter qui réserve une table pour un match |
| **Propriétaire** | `BUSINESS_OWNER` | Gère son (ses) café(s), occupation, check-in |
| **Administrateur** | `ADMIN` | Valide les cafés, pilote la plateforme |
grok
Un **ADMIN ne s’inscrit pas** via l’interface publique (compte créé hors bande / initialisation).

## 6.2 Acteurs secondaires (systèmes)

| Acteur | Rôle | Cas d’utilisation liés |
|---|---|---|
| **Stripe** | Encaissement carte (PCI-DSS) | Payer en ligne |
| **football-data.org** | Source des matchs (API v4) | Consulter les matchs |
| **Service IA occupation** | Prédiction Random Forest | Consulter l’occupation (extend) |

## 6.3 Généralisation UML (à reporter sur le DU)

```
Utilisateur
   △
   ├── Fan
   ├── Propriétaire
   └── Administrateur
```

---

# 7. Glossaire

| Terme | Définition |
|---|---|
| **Business** | Établissement partenaire (café / restaurant) |
| **Space** | Zone du café (terrasse, salle, VIP…) avec un prix match-day |
| **Table** | Table numérotée d’un space, de capacité fixe |
| **Match-day** | Jour / créneau d’un match de football |
| **Occupation effective** | Nombre de personnes retenu pour l’affichage (voir RM-OCC) |
| **Rapport owner** | Comptage physique saisi par le propriétaire |
| **Rapport frais** | Rapport owner datant de **≤ 15 minutes** |
| **Walk-in** | Client présent sans réservation |
| **Ticket code** | Identifiant `FC-` + 8 caractères UUID |
| **Payload QR** | `FANCONNECT\|TICKET\|` + ticket code |
| **KYC** | Dossier de vérification : CIN + RC + photo extérieure |
| **Commission** | 25 % du montant, retenue plateforme |
| **PENDING** | Réservation créée, non payée |
| **CONFIRMED** | Payée, ticket émis |
| **CHECKED_IN** | QR scanné à l’entrée |

---

# 8. Exigences fonctionnelles détaillées

**Priorité MoSCoW :** M = Must, S = Should, C = Could, W = Won’t (hors périmètre).

Chaque exigence est **testable**. Elle alimente un ou plusieurs cas d’utilisation (colonne CU).

---

## EF01 — Inscription et authentification JWT  
**Acteur :** Tous (sauf création ADMIN publique)  
**Priorité :** M  
**CU :** S’inscrire, S’authentifier  

**Description.**  
Le système permet de créer un compte Fan ou Owner, de s’authentifier, et d’accéder aux ressources selon le rôle porté par un JWT.

**Règles.**  
- Email unique.  
- Mot de passe hashé **BCrypt** (jamais stocké en clair).  
- Rôle `ADMIN` interdit à l’inscription publique.  
- Fan : **ville obligatoire**.  
- Token : sujet = email, claim `role`, signature HS256, expiration configurable.  
- SPA : token dans `localStorage`, header `Authorization: Bearer`.  

**Critères d’acceptation.**  
1. Inscription Fan avec ville → 201 + JWT.  
2. Email déjà utilisé → 400.  
3. Tentative rôle ADMIN → 400.  
4. Login faux → 401.  
5. Accès `/fan/**` avec JWT Owner → 403.  
6. Accès `/admin/**` sans JWT ADMIN → 403.

---

## EF02 — Match Center  
**Acteur :** Fan (public en lecture)  
**Priorité :** M  
**CU :** Consulter les matchs  

**Description.**  
Le système affiche les matchs (équipes, date, score, minute, statut, groupe, stade) synchronisés depuis football-data.org et stockés localement.

**Règles.**  
- Upsert par `externalId`.  
- Sync live ~60 s (fenêtre J → J+7 + LIVE).  
- Sync compétitions ~5 min.  
- Cache API : live ~10 s, jour ~15 s, autres ~30 s.  
- Si l’API externe est down : afficher les **dernières données PostgreSQL**.  
- Matchs `FINISHED` ou `CANCELLED` : **non réservables**.  

**Critères d’acceptation.**  
1. Liste des matchs à venir sans authentification.  
2. Détail live si `externalId` connu.  
3. Match FINISHED refusé à la réservation.

---

## EF03 — Recherche et consultation des cafés  
**Acteur :** Fan  
**Priorité :** M  
**CU :** Rechercher un café, Consulter l’occupation  

**Description.**  
Le fan consulte uniquement les établissements **APPROVED**, avec adresse, capacité, espaces, tables, occupation et prédiction.

**Règles.**  
- Filtre statut = APPROVED.  
- Occupation calculée selon **RM-OCC**.  
- Niveaux : VERT ≤ 50 %, ORANGE ≤ 80 %, ROUGE > 80 %.  

**Critères d’acceptation.**  
1. Un café PENDING n’apparaît pas au fan.  
2. La fiche affiche % d’occupation et places restantes.  
3. Un café DISABLED disparaît du Match Center.

---

## EF04 — Réservation d’une table (wizard)  
**Acteur :** Fan authentifié  
**Priorité :** M  
**CU :** Réserver une table **«include»** Auth, Match, Café, Dispo, Paiement  

**Description.**  
Le fan choisit un match, un café, un espace, une table et un `partySize`, puis crée une réservation **PENDING**.

**Préconditions.**  
Fan authentifié ; café APPROVED ; match réservable ; table active.

**Contrôles (tous obligatoires).**  
1. `partySize` ≤ capacité de la **table**.  
2. Table non déjà réservée pour ce match en statut PENDING ou CONFIRMED.  
3. Prix = `matchDayPrice` de l’espace.  
4. Création atomique : `Reservation PENDING` + `Payment PENDING` (MAD).  

**Postconditions.**  
Réservation identifiée ; paiement en attente ; pas encore de ticket.

**Critères d’acceptation.**  
1. Double réservation de la même table / même match → 400.  
2. partySize trop grand → 400.  
3. Match terminé → 400.  
4. Succès → status PENDING, payment PENDING.

---

## EF05 — Paiement en ligne  
**Acteur :** Fan + Stripe  
**Priorité :** M  
**CU :** Payer en ligne **«include»** Obtenir le ticket ; **«extend»** Paiement simulé si Stripe absent  

**Description.**  
Le fan règle la réservation. La carte **ne transite jamais** par FanConnect (PCI-DSS via Stripe).

**Règles (RM-PAY).**  
- Commission plateforme **25 %**.  
- `platformFee = amount × 0,25` ; `ownerPayout = amount − fee`.  
- Devise **MAD** ; montant Stripe en **centimes**.  
- PaymentIntent : metadata `reservationId`.  
- Confirmation : le backend **revérifie** chez Stripe (`status = succeeded` **et** metadata = cette résa).  
- Succès : Payment **PAID**, Reservation **CONFIRMED**, génération du ticket.  
- Mode simulé si clés `sk_` / `pk_` absentes (démo).  

**Critères d’acceptation.**  
1. Sans `paymentIntentId` en mode Stripe → 400.  
2. Intent d’une autre résa → 400.  
3. Succès → CONFIRMED + ticketCode `FC-xxxxxxxx`.  
4. Notifications fan, owner, admin (commission).

---

## EF06 — Ticket QR, PDF, identifiant  
**Acteur :** Fan (émission) / Owner (contrôle)  
**Priorité :** M  
**CU :** Obtenir le ticket **«extend»** Télécharger le PDF  

**Règles (RM-TCK).**  
- Code : `FC-` + 8 caractères UUID majuscules.  
- QR (ZXing) : payload `FANCONNECT|TICKET|{code}`.  
- PDF (OpenPDF) : match, café, adresse, espace, table, partySize, date, montant, QR.  
- Pas de ticket si paiement non PAID.  

**Critères d’acceptation.**  
1. GET ticket avant paiement → 400.  
2. PDF contient le code et le QR.  
3. Parser accepte le payload complet **ou** le code seul.

---

## EF07 — Recommandation de cafés  
**Acteur :** Fan  
**Priorité :** S  
**CU :** Rechercher un café (score)  

**Règles.**  
- Entrée : match + GPS optionnel (`lat`, `lng`).  
- Rayons successifs **5 km → 10 km → 20 km** jusqu’à **au moins 3** résultats.  
- Score : proximité + occupation / risque.  
- Uniquement cafés APPROVED.  

**Critères d’acceptation.**  
1. Avec GPS, les plus proches arrivent en tête à iso-occupation.  
2. Sans GPS, liste scorée sans distance.  
3. Au moins 3 cafés si le stock le permet après expansion de rayon.

---

## EF08 — Prédiction d’occupation  
**Acteur :** Fan / Owner + Service IA  
**Priorité :** S  
**CU :** Consulter l’occupation **«extend»** Prédiction IA  

**Description.**  
À partir de l’occupation effective (RM-OCC), le système prédit le pic (1 h, 2 h, coup d’envoi) et un risque LOW / MEDIUM / HIGH.

**Règles.**  
- Appel du microservice Python (Random Forest) si disponible.  
- Sinon **fallback heuristique** : +12 CDM, +8 week-end, +6 soirée 18–22 h, historique 30 j, vitesse de check-in.  
- L’UI ne parle **jamais** directement au service Python (passe par Spring).  

**Critères d’acceptation.**  
1. Service IA down → réponse heuristique (pas d’erreur bloquante).  
2. Sortie : % pic, niveau, risque, recommandation textuelle.

---

## EF09 — Gestion de l’établissement (Owner)  
**Acteur :** Propriétaire  
**Priorité :** M  
**CU :** Créer un établissement, Déposer KYC, Soumettre  

**Règles KYC (RM-KYC).**  
Documents **obligatoires** :  
- `NATIONAL_ID` (CIN)  
- `BUSINESS_REGISTRATION` (registre de commerce)  
- `EXTERIOR_PHOTO` (façade)  

Soumission impossible si une pièce manque. Statut initial **PENDING**. Invisible aux fans tant que non APPROVED.

**Critères d’acceptation.**  
1. Création → PENDING.  
2. Soumission incomplète → 400.  
3. Soumission complète → notif admins.

---

## EF10 — Occupation live (Owner)  
**Acteur :** Propriétaire  
**Priorité :** M  
**CU :** Signaler l’occupation live  

**Règles.**  
- Saisie manuelle : source `OWNER_MANUAL`, `reportedAt = now`.  
- Check-in QR : source `CHECK_IN_AUTO`, incrément `partySize` plafonné à la capacité.  
- Fraîcheur : **15 minutes** (RM-OCC).  

**Critères d’acceptation.**  
1. Un owner ne met à jour **que** son business.  
2. Un rapport de 8 min est « frais ».  
3. Un rapport de 20 min n’est plus vérité terrain.

---

## EF11 — Vérification ticket et check-in  
**Acteur :** Propriétaire  
**Priorité :** M  
**CU :** Vérifier un ticket **«extend»** Effectuer le check-in `[CONFIRMED]`  

**Règles.**  
- Recherche : `ticketCode` **ET** `business.ownerId = owner courant`.  
- PENDING / CANCELLED → invalide.  
- CHECKED_IN → déjà utilisé (idempotent).  
- CONFIRMED → valide, check-in possible.  
- Check-in : statut CHECKED_IN, `checkedInAt`, notif fan, MAJ occupation.  

**Critères d’acceptation.**  
1. Ticket d’un autre café → invalide.  
2. Double scan → alreadyCheckedIn, pas de double occupation.  
3. On peut **vérifier sans** check-in (d’où l’extend UML).

---

## EF12 — Modération des établissements (Admin)  
**Acteur :** Administrateur  
**Priorité :** M  
**CU :** Traiter une demande **«include»** Consulter le dossier ; **«extend»** Approuver / Rejeter  

**Règles.**  
- Approuver seulement si dossier soumis **et** 3 pièces présentes.  
- APPROVED : `approvedAt`, `approvedBy`, **géocodage** lat/lng, notif owner.  
- REJECTED : motif obligatoire, owner peut corriger et resoumettre.  
- DISABLED : café retiré des fans.  

**Critères d’acceptation.**  
1. Approuver un dossier incomplet → 400.  
2. Après APPROVED, le café apparaît au fan.  
3. Rejet avec motif notifié.

---

## EF13 — Pilotage administrateur  
**Acteur :** Administrateur  
**Priorité :** S  
**CU :** Superviser la plateforme  

**Périmètre.**  
Utilisateurs, compétitions, heatmap villes, top cafés, commissions, analytics globales, désactivation.

---

## EF14 — Notifications  
**Acteur :** Tous  
**Priorité :** S  

Événements minimaux : paiement OK, nouvelle résa owner, commission admin, check-in, café approuvé / rejeté / désactivé, dossier pending.

---

## EF15 — Annulation  
**Acteur :** Fan  
**Priorité :** S  
**CU :** Gérer mes réservations **«extend»** Annuler `[statut ≠ CHECKED_IN]`  

- CHECKED_IN : annulation interdite.  
- Si Payment PAID → statut métier **REFUNDED** (pas de refund Stripe automatique — hors périmètre).  
- Si PENDING → Payment FAILED.

---

## EF16 — Assistant FanBot  
**Acteur :** Fan  
**Priorité :** C  
**CU :** Consulter FanBot **«extend»** Réserver / rechercher `[aide demandée]`  

Aide à trouver un match / un café (Grok ou fallback local). Non bloquant pour le parcours principal.

---

# 9. Règles métier (cœur de l’analyse)

Ces règles **doivent** apparaître dans les diagrammes de séquence et dans OccupancyEngine / PaymentCalculator.

## RM-OCC — Occupation effective

**Constantes.**

| Constante | Valeur | Sens |
|---|---|---|
| `ARRIVAL_RATE` | 0,85 | Part des CONFIRMED non check-in encore attendus |
| `PAYMENT_RATE` | 0,60 | Part des PENDING qui paieront |
| `FRESHNESS` | 15 min | Validité du rapport owner |
| `GREEN_MAX` | 50 % | Seuil vert |
| `ORANGE_MAX` | 80 % | Seuil orange |

**Signaux.**  
`checkedIn`, `confirmed` (non arrivés), `pending`, `ownerReported`, `capacity`.

**Estimation réservations seules.**

```
estimationRésa = checkedIn
               + round(confirmed × 0,85)
               + round(pending   × 0,60)
```

**Fusion.**

- Si rapport owner **frais** (≤ 15 min) :  
  `effectif = ownerReported` (vérité terrain, walk-in inclus)  
  `walkIn = max(0, ownerReported − checkedIn)`  
  `pic = min(capacité, ownerReported + confirmed×0,85)`

- Sinon :  
  `effectif = estimationRésa`  
  (si vieux rapport : `max(estimation, ownerReported)`)  
  `pic = min(capacité, effectif + confirmed×0,85)`

- Plafond : `effectif ≤ capacité`.  
- `% = effectif / capacité × 100`.  
- Niveau : VERT / ORANGE / ROUGE.

**Exemple de recette (à coller dans le dossier de tests).**  
Café 100 places ; 20 check-in ; 40 confirmés ; 10 pending ; owner = 55 il y a 8 min.  
`estimationRésa = 20+34+6 = 60` mais rapport frais → **effectif = 55**, walk-in ≈ 35, pic = 89.

## RM-PAY — Paiement

```
fee    = amount × 0,25
payout = amount − fee
currency = MAD
```

Pas de confiance au front : retrieve Stripe obligatoire.

## RM-TCK — Ticket

```
ticketCode = "FC-" + UUID[0..8].upper()
qrPayload  = "FANCONNECT|TICKET|" + ticketCode
```

Isolation owner + unicité de check-in.

## RM-KYC — Validation café

```
PENDING  → (3 pièces + soumission) → revue admin
         → APPROVED (visible + géocodé)
         → REJECTED (motif, resoumission)
         → DISABLED (sanction)
```

## RM-RES — Cycle de vie réservation

```
PENDING → CONFIRMED → CHECKED_IN
       ↘ CANCELLED
CONFIRMED → CANCELLED (si pas check-in)
```

Contrainte d’unicité : `(table_id, match_id)` parmi les statuts actifs PENDING ∪ CONFIRMED.

---

# 10. Spécification des cas d’utilisation (pour l’analyse UML)

## 10.1 Catalogue

| ID | Cas d’utilisation | Acteur | Type |
|---|---|---|---|
| UC01 | S’inscrire | Fan, Owner | base |
| UC02 | S’authentifier (JWT) | Utilisateur | base / include |
| UC03 | Consulter les matchs | Fan, football-data.org | base / include |
| UC04 | Rechercher un café | Fan | base / include |
| UC05 | Consulter l’occupation | Fan, Owner | include de UC04 |
| UC06 | Vérifier la disponibilité de la table | Fan | include de UC07 |
| UC07 | Réserver une table | Fan | **cœur** |
| UC08 | Payer en ligne | Fan, Stripe | include de UC07 |
| UC09 | Obtenir le ticket QR | Fan | include de UC08 |
| UC10 | Gérer mes réservations | Fan | base |
| UC11 | Consulter FanBot | Fan | extend UC07 |
| UC12 | Télécharger le PDF | Fan | extend UC09 |
| UC13 | Annuler une réservation | Fan | extend UC10 |
| UC14 | Paiement simulé | Fan | extend UC08 |
| UC15 | Obtenir la prédiction IA | Fan, Service IA | extend UC05 |
| UC16 | Créer un établissement | Owner | base |
| UC17 | Déposer les documents KYC | Owner | include de UC18 |
| UC18 | Soumettre pour validation | Owner | base |
| UC19 | Signaler l’occupation live | Owner | base |
| UC20 | Vérifier un ticket QR | Owner | base |
| UC21 | Effectuer le check-in | Owner | extend UC20 |
| UC22 | Consulter le dossier | Admin | include de UC23 |
| UC23 | Traiter une demande | Admin | base |
| UC24 | Approuver un établissement | Admin | extend UC23 |
| UC25 | Rejeter un établissement | Admin | extend UC23 |
| UC26 | Superviser la plateforme | Admin | base |
| UC27 | Désactiver un établissement | Admin | extend UC26 |

## 10.2 Relations UML à tracer (obligatoire sur le DU)

**Include (flèche vers l’inclus, toujours exécuté)**  
- UC07 → UC02, UC03, UC04, UC06, UC08  
- UC08 → UC09  
- UC04 → UC05  
- UC18 → UC17  
- UC23 → UC22  

**Extend (flèche vers le cas de base, condition)**  
- UC11 → UC07 `[aide demandée]`  
- UC13 → UC10 `[≠ CHECKED_IN]`  
- UC12 → UC09 `[PDF demandé]`  
- UC14 → UC08 `[Stripe absent]`  
- UC15 → UC05 `[service IA up]`  
- UC21 → UC20 `[ticket CONFIRMED]`  
- UC24 → UC23 `[dossier complet]`  
- UC25 → UC23 `[dossier non conforme]`  
- UC27 → UC26 `[sanction]`  

## 10.3 Scénario nominal (analyse → séquence principale)

1. Fan s’authentifie (JWT).  
2. Consulte les matchs.  
3. Choisit un café recommandé (distance + occupation).  
4. Choisit espace + table libre.  
5. Crée la réservation PENDING.  
6. Paie via Stripe (ou simulé).  
7. Reçoit le ticket QR.  
8. Le jour J, l’owner scanne : CHECKED_IN + occupation.

**Scénarios alternatifs à faire figurer en `alt` / `opt` sur les séquences :** table prise, match fini, Stripe KO, ticket déjà scanné, dossier KYC incomplet, API football down, IA down.

---

# 11. Modèle conceptuel des données (pour le diagramme de classes)

## 11.1 Entités principales (et seulement elles)

Concevoir le DU de classes **sans** Controller, DTO, Repository.

| Entité | Responsabilité |
|---|---|
| `User` | Compte (email unique, rôle, BCrypt) |
| `Business` | Café, capacité, statut, GPS |
| `BusinessSpace` | Zone + prix match-day |
| `BusinessTable` | Table numérotée |
| `VerificationDocument` | Pièce KYC |
| `Competition` | Compétition (code externe WC…) |
| `FootballMatch` | Match (externalId, score, statut) |
| `Reservation` | Lien fan–table–match–ticket |
| `Payment` | Montant, commission, Stripe |
| `BusinessLiveOccupancy` | Comptage owner / check-in |
| `OccupancyEngine` | `«utility»` calcul RM-OCC |
| `PaymentCalculator` | `«utility»` RM-PAY |

Hors DU d’analyse (détail d’implémentation) : `Cafe` legacy, images galerie, `Notification`, `OccupancySnapshot`, DTO.

## 11.2 Cardinalités à reporter

```
User 1 ──possède── * Business
User 1 ──effectue── * Reservation
User 0..1 ──approuve── * Business

Business 1 ◆── 1..* BusinessSpace 1 ◆── 1..* BusinessTable
Business 1 ◆── * VerificationDocument

Competition 1 ──programme── * FootballMatch

Reservation * ── 1 Business
Reservation * ── 1 BusinessSpace
Reservation * ── 1 BusinessTable
Reservation * ── 1 FootballMatch
Reservation 1 ◆── 0..1 Payment

Business 1 ── * BusinessLiveOccupancy
FootballMatch 0..1 ── * BusinessLiveOccupancy
```

Composition (`◆`) : cycle de vie lié (cascade).

## 11.3 Énumérations

| Enum | Valeurs |
|---|---|
| Role | FAN_USER, BUSINESS_OWNER, ADMIN |
| BusinessStatus | PENDING, APPROVED, REJECTED, DISABLED |
| ReservationStatus | PENDING, CONFIRMED, CANCELLED, CHECKED_IN |
| PaymentStatus | PENDING, PAID, FAILED, REFUNDED |
| OccupancyLevel | GREEN, ORANGE, RED |
| MatchStatus | SCHEDULED, LIVE, FINISHED, CANCELLED |
| DocumentType | NATIONAL_ID, BUSINESS_REGISTRATION, EXTERIOR_PHOTO |
| OccupancyRisk | LOW, MEDIUM, HIGH |

## 11.4 Opérations minimales (compartiment méthodes)

- `User` : `sInscrire()`, `seConnecter()`  
- `Business` : `soumettreVerification()`, `estApprouve()`  
- `Reservation` : `confirmer(ticketCode)`, `annuler()`, `checkIn()`  
- `Payment` : `marquerPaye(intentId)`, `verifierChezStripe()`  
- `OccupancyEngine` : `computeBreakdown()`, `percentage()`, `level()`, `isFresh()`  
- `FootballMatch` : `estReservable()`  
- `BusinessTable` : `estReservable(matchId)`  

Héritage : `BaseEntity { id, createdAt, updatedAt }`.

---

# 12. Architecture cible (pour la conception technique)

## 12.1 Style

Architecture **3-tiers** + **microservice IA découplé**.

```
[ SPA React 18 / Vite / Tailwind ]
        HTTPS / REST JSON + JWT
[ Spring Boot 3 / Java 21 / JPA ]
        JDBC                    HTTP
[ PostgreSQL 16 ]        [ FastAPI / Random Forest ]
        │
        └── Stripe PaymentIntent (aucun PAN en base)
```

Le navigateur **n’appelle pas** le service Python.

## 12.2 Couches backend

```
controller → service → repository → entity
security (JWT filter)
dto request/response
util (OccupancyEngine, PaymentCalculator, TicketCodeParser)
```

## 12.3 Front

- Auth : Context + localStorage  
- Routes protégées par rôle  
- Trois shells UI isolés (Fan / Owner / Admin)  

## 12.4 Endpoints (contrat API — conception)

| Zone | Exemples | Auth |
|---|---|---|
| Public | `POST /auth/register`, `POST /auth/login` | non |
| Public | `GET /matches`, `GET /businesses` | non (APPROVED only) |
| Fan | `POST /fan/bookings`, `.../pay`, ticket PDF | FAN_USER |
| Owner | business, occupancy live, tickets verify/check-in | BUSINESS_OWNER |
| Admin | approve/reject, analytics, competitions | ADMIN |

Documentation : `/api/swagger-ui.html`.

## 12.5 Déploiement

Docker Compose : `postgres:5432`, `backend:8080`, `frontend:80` (Nginx reverse-proxy `/api`).

---

# 13. Interfaces utilisateur (cahier d’écrans)

| ID | Écran | Acteur | EF liées |
|---|---|---|---|
| UI01 | Accueil / hero | Public | EF02, EF03 |
| UI02 | Login / Register | Tous | EF01 |
| UI03 | Match Center | Fan | EF02 |
| UI04 | Liste / fiche café + occupation | Fan | EF03, EF08 |
| UI05 | Wizard réservation | Fan | EF04 |
| UI06 | Paiement Stripe | Fan | EF05 |
| UI07 | Mes tickets / PDF | Fan | EF06, EF15 |
| UI08 | Dashboard Owner | Owner | EF09–EF11 |
| UI09 | Upload KYC | Owner | EF09 |
| UI10 | Scan QR / check-in | Owner | EF11 |
| UI11 | Occupation live / intelligence | Owner | EF10, EF08 |
| UI12 | Dashboard Admin | Admin | EF12, EF13 |
| UI13 | Dossier de vérification | Admin | EF12 |

**Contrainte UX :** responsive (desktop + mobile web). Espaces visuellement isolés par rôle.

---

# 14. Intégrations externes

| Système | Direction | Données | Exigence |
|---|---|---|---|
| football-data.org | IN | Matchs, scores, live | Clé API, cache, upsert `externalId` |
| Stripe | OUT puis IN | PaymentIntent, statut | MAD, metadata résa, retrieve serveur |
| Service IA | OUT | Features occupation | Timeout + fallback heuristique |
| Géocodage | OUT | lat/lng à l’approbation | Recommandation distance |

---

# 15. Exigences non fonctionnelles

| ID | Catégorie | Exigence | Mesure |
|---|---|---|---|
| ENF01 | Sécurité | JWT + rôles + BCrypt + secrets `.env` | Tests 401/403 |
| ENF02 | Paiement | PCI-DSS par délégation Stripe, **aucun PAN stocké** | Revue code Payment |
| ENF03 | Performance | API métier < 2 s (hors paiement Stripe) | Mesure |
| ENF04 | Disponibilité matchs | Affichage local si API football down | Test coupure |
| ENF05 | Disponibilité IA | Fallback heuristique | Test coupure Python |
| ENF06 | Maintenabilité | Couches, Flyway, OpenAPI | Revue |
| ENF07 | Portabilité | Docker Compose | `docker compose up` |
| ENF08 | UI | Responsive, 3 espaces | Recette mobile/desktop |
| ENF09 | Audit | `createdAt` / `updatedAt` BaseEntity | Schéma |
| ENF10 | Confidentialité KYC | Documents accessibles owner + admin seulement | Tests 403 |

---

# 16. Sécurité

1. Auth stateless JWT.  
2. Filtre : signature + expiration + `UserDetails`.  
3. Autorisation par antMatchers de rôle.  
4. Owner : isolation des ressources (`business.ownerId`).  
5. Ticket : isolation owner + anti rejeu (un check-in).  
6. Paiement : vérification serveur du PaymentIntent.  
7. ADMIN non créable en public.  
8. Uploads KYC : types MIME / stockage hors web root.  
9. CORS limité aux origines de dev/prod.  
10. CSRF désactivé (API JWT stateless) — à documenter.

---

# 17. Recette

La recette est **acceptée** si :

1. Parcours fan nominal (EF04+EF05+EF06) fonctionne en mode Stripe test **et** simulé.  
2. Un café non APPROVED est invisible.  
3. RM-OCC : l’exemple 100 places / 55 owner / 8 min donne bien effectif 55.  
4. Check-in : 1er scan OK, 2e scan « déjà utilisé ».  
5. JWT : un Fan n’accède pas à `/admin/**`.  
6. API football coupée : Match Center reste lisible.  
7. Service IA coupé : occupation + prédiction heuristique OK.  
8. Carte test Stripe `4242 4242 4242 4242` (mode test).  

---

# 18. Livrables et traçabilité analyse / conception

## 18.1 Livrables projet

| Livrable | Forme |
|---|---|
| Le présent CDC | Référence besoins |
| Diagramme de cas d’utilisation | UML 2.5, include/extend |
| Diagramme de classes | Entités §11 |
| Diagrammes de séquence | Auth, résa+paiement, occupation, KYC, QR, sync matchs |
| Code source | Monorepo React + Spring + FastAPI |
| API OpenAPI | Swagger |
| Rapport / soutenance PFE | IGA |

## 18.2 Matrice CDC → UML (obligatoire)

| Exigence | Cas d’utilisation | Classes | Séquence |
|---|---|---|---|
| EF01 | UC01, UC02 | User, JwtService | Authentification |
| EF02 | UC03 | Competition, FootballMatch | Sync matchs |
| EF03 | UC04, UC05 | Business, OccupancyEngine | Occupation |
| EF04 | UC07, UC06 | Reservation, Table, Space | Réservation |
| EF05 | UC08, UC14 | Payment, PaymentCalculator | Réservation / Stripe |
| EF06 | UC09, UC12 | Reservation (ticketCode) | QR |
| EF07 | UC04 | Business (lat/lng) | (opt reco) |
| EF08 | UC15 | OccupancyEngine + IA | Occupation |
| EF09 | UC16–UC18 | Business, VerificationDocument | KYC |
| EF10 | UC19 | BusinessLiveOccupancy | Occupation |
| EF11 | UC20, UC21 | Reservation, TicketCodeParser | Check-in QR |
| EF12 | UC22–UC25 | Business, BusinessApproval | KYC |
| EF13 | UC26, UC27 | — | — |
| EF15 | UC13 | Reservation, Payment | (alt résa) |

**Consigne d’analyse :** un cas d’utilisation = un ellipse ; include/extend **uniquement** selon §10.2.  
**Consigne de conception :** une classe du DU = une entité §11 ; les utilitaires portent RM-OCC et RM-PAY.

---

# 19. Annexes

## A. Stack technique imposée (conception)

| Couche | Technologie |
|---|---|
| Front | React 18, Vite, Tailwind, Axios, React Router |
| Back | Java 21, Spring Boot 3, Spring Security, JPA |
| Base | PostgreSQL 16, Flyway |
| IA | Python, FastAPI, scikit-learn Random Forest |
| Paiement | Stripe (test) |
| Build | Maven, npm, Docker Compose |

## B. Statuts — machines à états (conception détaillée)

**Reservation**  
PENDING —payé→ CONFIRMED —scan→ CHECKED_IN  
PENDING|CONFIRMED —annulation→ CANCELLED  

**Payment**  
PENDING —succès→ PAID  
PENDING —échec→ FAILED  
PAID —annulation métier→ REFUNDED  

**Business**  
PENDING —approbation→ APPROVED  
PENDING —rejet→ REJECTED —resoumission→ PENDING  
APPROVED —admin→ DISABLED  

## C. Formules à faire figurer sur OccupancyEngine

Voir RM-OCC §9. Ne pas « simplifier » en `booked/capacity` sur le DU de conception match-day : ce calcul n’est valable que pour l’ancien modèle créneau horaire café, **pas** pour le jour de match.

## D. Documents KYC

| Type | Libellé métier |
|---|---|
| NATIONAL_ID | CIN |
| BUSINESS_REGISTRATION | Registre de commerce |
| EXTERIOR_PHOTO | Photo de la façade |

---

**Fin du cahier des charges.**  
Toute évolution (Stripe live, app native, refund automatique) fera l’objet d’un **avenant** numéroté, sans modifier silencieusement ce document.

*FanConnect 2030 — GM-Soft / IGA — v1.0 — 21/09/2026*
