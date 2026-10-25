# Critères UML 2.5 — FanConnect 2030

Norme suivie : **UML 2.5** (OMG). Diagrammes prêts pour soutenance PFE.

## 1. Cas d'utilisation

| Critère | Application |
|---|---|
| Frontière système | Rectangle nommé **FanConnect 2030** |
| Acteurs primaires à gauche | Fan, Propriétaire, Administrateur |
| Acteurs secondaires à droite | Stripe, football-data.org, Service IA |
| Généralisation d'acteurs | triangle blanc : Fan / Owner / Admin **sont** Utilisateur |
| Association | trait **plein** acteur — cas |
| `<<include>>` | pointillés, **flèche vers le cas inclus** (toujours exécuté) |
| `<<extend>>` | pointillés, **flèche depuis l'extension vers le cas de base** (sous condition) |
| Points d'extension | zone `--` dans le cas de base |
| Condition d'extension | entre crochets `[ticket CONFIRMED]` |

**Include (obligatoire)**  
Réserver **inclut** : Authentifier, Consulter les matchs, Rechercher un café, Vérifier la dispo, Payer.  
Payer **inclut** Obtenir le ticket.  
Soumettre **inclut** Déposer les documents.  
Traiter une demande **inclut** Consulter le dossier.

**Extend (conditionnel)**  
FanBot, Annulation, PDF, paiement simulé, prédiction IA, check-in, Approuver, Rejeter, Désactiver.

## 2. Classes (domaine uniquement)

Pas de Controller, DTO, Repository, EntityListener.

| Critère | Application |
|---|---|
| Classes principales | User, Business, Space, Table, Competition, FootballMatch, Reservation, Payment, VerificationDocument, BusinessLiveOccupancy |
| Utilitaires | OccupancyEngine, PaymentCalculator (`<<utility>>`) |
| Héritage | `BaseEntity` (id, createdAt, updatedAt) |
| Composition `*--` | Business ◇ Space ◇ Table ; Reservation ◇ Payment |
| Multiplicités | toujours indiquées (`1`, `0..1`, `0..*`, `1..*`) |
| Visibilité | `-` privé, `#` protégé, `+` public |
| Énumérations | `<<enumeration>>` Role, statuts, niveaux |
| Cercle stéréotype | masqué (`hide circle`) — usage analyse métier |

## 3. Séquences

| Critère | Application |
|---|---|
| Acteur à gauche | déclencheur du scénario |
| Lifelines | composants réels (React, Spring, Stripe, PostgreSQL) |
| Barres d'activation | durée du traitement |
| Messages pleins | appels synchrones |
| Messages pointillés | retours |
| `alt` | branches (succès / erreur, Stripe / simulé) |
| `opt` | comportement optionnel (IA, PDF) |
| `loop` | répétition (documents, sync API) |
| Autonumber | numérotation des messages |
| Notes | règles métier (25 %, 15 min, 0,85 / 0,60) |

Fichiers générés : `docs/architecture/uml/png/*.png`
