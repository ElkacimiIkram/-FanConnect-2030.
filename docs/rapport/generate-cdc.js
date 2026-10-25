/**
 * Génère LE cahier des charges unique FanConnect 2030 (.docx)
 * Usage : node generate-cdc.js   (depuis docs/rapport)
 */
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, LevelFormat, TableOfContents,
} = require("docx");
const fs = require("fs");
const path = require("path");

const A4_W = 11906;
const A4_H = 16838;
const MARGIN = 1134;
const CONTENT_W = A4_W - MARGIN * 2;
const BLUE = "1F4E79";
const LIGHT_BLUE = "D6E3F0";
const GRAY = "666666";
const thin = { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" };
const borders = { top: thin, bottom: thin, left: thin, right: thin };

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after ?? 160, before: opts.before ?? 0, line: 276 },
    alignment: opts.align || AlignmentType.JUSTIFIED,
    children: [
      new TextRun({
        text,
        font: "Times New Roman",
        size: opts.size || 24,
        bold: !!opts.bold,
        italics: !!opts.italics,
        color: opts.color || "000000",
      }),
    ],
  });
}
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 240 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: BLUE, space: 4 } },
    children: [new TextRun({ text, font: "Times New Roman", size: 32, bold: true, color: BLUE })],
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 160 },
    children: [new TextRun({ text, font: "Times New Roman", size: 28, bold: true, color: BLUE })],
  });
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 120 },
    children: [new TextRun({ text, font: "Times New Roman", size: 24, bold: true, color: "2E75B6" })],
  });
}
function bullet(text, ref = "bullets") {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { after: 80, line: 276 },
    children: [new TextRun({ text, font: "Times New Roman", size: 22 })],
  });
}
function codeLine(text) {
  return new Paragraph({
    spacing: { after: 40, line: 240 },
    shading: { fill: "F4F6F8", type: ShadingType.CLEAR },
    children: [new TextRun({ text, font: "Consolas", size: 18 })],
  });
}
function cell(text, width, opts = {}) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children: [
      new Paragraph({
        alignment: opts.align || AlignmentType.LEFT,
        children: [
          new TextRun({
            text: String(text),
            font: "Times New Roman",
            size: opts.size || 18,
            bold: !!opts.bold,
            color: opts.color || "000000",
          }),
        ],
      }),
    ],
  });
}
function simpleTable(headers, rows, colWidths) {
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({
        children: headers.map((h, i) =>
          cell(h, colWidths[i], { bold: true, fill: LIGHT_BLUE, align: AlignmentType.CENTER })
        ),
      }),
      ...rows.map((r) => new TableRow({ children: r.map((v, i) => cell(v, colWidths[i])) })),
    ],
  });
}
function coverLine(label, value) {
  return new Paragraph({
    spacing: { after: 120 },
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({ text: `${label}  :  `, font: "Times New Roman", size: 24, bold: true }),
      new TextRun({ text: value, font: "Times New Roman", size: 24 }),
    ],
  });
}

const W2 = [2400, CONTENT_W - 2400];
const W3 = [1800, 2800, CONTENT_W - 4600];
const W4 = [1400, 2200, 1600, CONTENT_W - 5200];
const W5 = [1200, 1800, 1400, 1200, CONTENT_W - 5600];

const children = [
  new Paragraph({
    spacing: { after: 200 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "ROYAUME DU MAROC", font: "Times New Roman", size: 22, bold: true, color: BLUE })],
  }),
  new Paragraph({
    spacing: { after: 80 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Institut de Génie Appliqué — IGA", font: "Times New Roman", size: 24, bold: true })],
  }),
  new Paragraph({
    spacing: { after: 400 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Cycle ingénieur  ·  Filière 5DLTI  ·  2025 / 2026", font: "Times New Roman", size: 22, italics: true, color: GRAY })],
  }),
  new Paragraph({
    spacing: { after: 200 },
    alignment: AlignmentType.CENTER,
    border: { top: { style: BorderStyle.SINGLE, size: 18, color: BLUE, space: 8 }, bottom: { style: BorderStyle.SINGLE, size: 18, color: BLUE, space: 8 } },
    children: [new TextRun({ text: "CAHIER DES CHARGES", font: "Times New Roman", size: 48, bold: true, color: BLUE })],
  }),
  new Paragraph({
    spacing: { before: 200, after: 80 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "FanConnect 2030", font: "Times New Roman", size: 40, bold: true })],
  }),
  new Paragraph({
    spacing: { after: 400 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Plateforme intelligente de réservation de cafés pour regarder les matchs — Coupe du Monde 2030", font: "Times New Roman", size: 24, italics: true })],
  }),
  p("Document unique d’expression des besoins. Il sert de référence à l’analyse UML (cas d’utilisation, règles métier) et à la conception (classes, séquences, architecture, recette).", { align: AlignmentType.CENTER, italics: true }),
  coverLine("Présenté par", "Kassimi"),
  coverLine("Encadrant", "M. Bouchib Riyami"),
  coverLine("Organisme d’accueil", "GM-Soft — Béni Mellal — Pôle Développement"),
  coverLine("Version", "1.0  —  21 septembre 2026"),
  coverLine("Statut", "Document unique — complet"),
  new Paragraph({ children: [new PageBreak()] }),

  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { after: 240 },
    children: [new TextRun({ text: "Table des matières", font: "Times New Roman", size: 32, bold: true, color: BLUE })],
  }),
  new TableOfContents("Sommaire", { hyperlink: true, headingStyleRange: "1-3" }),
  new Paragraph({ children: [new PageBreak()] }),

  h1("1. Objet du document"),
  p("Le présent cahier des charges est LE document unique de spécification de FanConnect 2030. Il décrit ce que le système doit faire, pour qui, avec quelles règles métier, et dans quelles contraintes techniques."),
  p("Toute analyse UML, toute conception (classes, séquences, API) et toute recette doivent tracer vers un identifiant de ce document (EFxx, ENFxx, RMxx, UCxx). Une fonctionnalité absente de ce cahier est hors contrat, sauf avenant."),
  simpleTable(
    ["Phase", "Artefacts dérivés de ce cahier"],
    [
      ["Analyse", "Acteurs, cas d’utilisation (include / extend), scénarios, règles métier"],
      ["Conception", "Diagramme de classes, séquences, architecture 3-tiers, modèle relationnel"],
      ["Réalisation", "API REST Spring Boot, SPA React, service IA, Stripe"],
      ["Recette", "Cas de test alignés sur les critères d’acceptation"],
    ],
    W2
  ),

  h1("2. Contexte et problématique"),
  h2("2.1 Organisme d’accueil"),
  p("GM-Soft (German Moroccan Software Company) est une SSII maroco-allemande (SARL, 2014) basée à Béni Mellal. Solutions : GM-ERP, GM-POS, GM-CAFE, GM-HOTEL. FanConnect 2030 prolonge GM-CAFE : digitaliser le café le jour de match (calendrier sportif, géolocalisation, réservation, paiement, occupation prédictive)."),
  h2("2.2 Contexte métier"),
  p("À l’approche de la Coupe du Monde 2030 au Maroc, les supporters cherchent un lieu proche et disponible pour regarder un match. Les cafés n’ont pas d’outil unifié : WhatsApp et le téléphone restent la norme. Il n’existe pas de lien fiable entre le calendrier football, la table du café et l’occupation réelle."),
  h2("2.3 Problématique"),
  p("Comment concevoir une plateforme fiable, sécurisée et intelligente permettant aux supporters de réserver un lieu adapté pour un match, tout en aidant les cafés à anticiper l’affluence — dans le contexte de la CDM 2030 ?", { italics: true, bold: true }),
  simpleTable(
    ["Axe", "Question de conception"],
    [
      ["Métier", "Unifier match, lieu, table et paiement dans un seul parcours"],
      ["Occupation", "Estimer l’affluence avant le coup d’envoi (owner + réservations + IA)"],
      ["Architecture", "Séparer API métier, interface et service d’apprentissage"],
    ],
    W2
  ),

  h1("3. Objectifs"),
  h2("3.1 Objectif général"),
  p("Concevoir et réaliser une plateforme web sécurisée de réservation de cafés pour le jour de match, avec recommandation géolocalisée et prédiction d’occupation."),
  h2("3.2 Objectifs spécifiques"),
  simpleTable(
    ["ID", "Objectif", "Indicateur"],
    [
      ["OS01", "Parcours fan bout-en-bout", "Match → café → table → paiement → ticket QR"],
      ["OS02", "Outil propriétaire", "KYC, occupation live, check-in QR"],
      ["OS03", "Pilotage administrateur", "Validation, analytics, compétitions"],
      ["OS04", "Intelligence utile", "Prédiction d’affluence + recommandation"],
      ["OS05", "Sécurité par rôles", "JWT + FAN / OWNER / ADMIN isolés"],
    ],
    W3
  ),

  h1("4. Périmètre"),
  h2("4.1 Inclus"),
  bullet("SPA React responsive — trois espaces Fan / Owner / Admin"),
  bullet("API REST Spring Boot 3, Java 21, JWT, OpenAPI"),
  bullet("PostgreSQL 16, migrations Flyway"),
  bullet("Synchronisation des matchs (football-data.org)"),
  bullet("Réservation d’une table d’un café APPROVED pour un match"),
  bullet("Paiement Stripe mode test (ou simulé si clés absentes)"),
  bullet("Ticket QR unique + PDF + check-in propriétaire"),
  bullet("Occupation live (rapport owner + réservations pondérées)"),
  bullet("Prédiction d’occupation (Python Random Forest ou heuristique)"),
  bullet("Recommandation de cafés (5 / 10 / 20 km + affluence)"),
  bullet("KYC : CIN + registre de commerce + photo de façade"),
  bullet("Notifications in-app, Docker Compose"),
  h2("4.2 Exclus"),
  bullet("Application mobile native iOS / Android"),
  bullet("Stripe live (production réelle, virement owner)"),
  bullet("Billetterie de stade / places FIFA"),
  bullet("Remboursement automatique Stripe (seul le statut métier REFUNDED)"),
  bullet("Multi-devises hors MAD, chat vocal, borne physique"),
  h2("4.3 Hypothèses"),
  bullet("H1 — Une table est unique par match (PENDING ou CONFIRMED)."),
  bullet("H2 — Le ticket n’existe qu’après paiement PAID → CONFIRMED."),
  bullet("H3 — Seuls les cafés APPROVED sont visibles et réservables."),
  bullet("H4 — Le propriétaire peut saisir un effectif physique (walk-in)."),

  h1("5. Analyse de l’existant"),
  simpleTable(
    ["Solution", "Ce qu’elle fait", "Manque pour le jour de match"],
    [
      ["TheFork / OpenTable", "Réservation restaurant", "Pas de calendrier sport"],
      ["Billetterie stade", "Tickets d’événement", "Ignore les cafés de diffusion"],
      ["WhatsApp / Facebook", "Simple, déjà adopté", "Pas d’occupation ni de paiement"],
      ["Sites de cafés isolés", "Identité du lieu", "Pas de vision multi-établissements"],
    ],
    W3
  ),
  p("Positionnement : aucune offre n’unit calendrier football, géolocalisation, réservation de table, paiement et occupation prédictive. C’est l’espace de FanConnect 2030."),

  h1("6. Acteurs"),
  h2("6.1 Acteurs primaires"),
  simpleTable(
    ["Acteur UML", "Rôle", "Description"],
    [
      ["Utilisateur", "—", "Super-acteur : s’authentifie (JWT)"],
      ["Fan", "FAN_USER", "Réserve une table pour un match"],
      ["Propriétaire", "BUSINESS_OWNER", "Gère café, occupation, check-in"],
      ["Administrateur", "ADMIN", "Valide les cafés, pilote la plateforme"],
    ],
    W3
  ),
  p("Un compte ADMIN ne s’inscrit pas via l’interface publique."),
  h2("6.2 Acteurs secondaires"),
  simpleTable(
    ["Système", "Rôle", "Cas liés"],
    [
      ["Stripe", "Encaissement carte PCI-DSS", "Payer en ligne"],
      ["football-data.org", "Source des matchs API v4", "Consulter les matchs"],
      ["Service IA", "Prédiction Random Forest", "Occupation (extend)"],
    ],
    W3
  ),
  p("Généralisation UML : Fan, Propriétaire et Administrateur héritent d’Utilisateur (triangle blanc)."),

  h1("7. Glossaire"),
  simpleTable(
    ["Terme", "Définition"],
    [
      ["Business", "Établissement partenaire (café / restaurant)"],
      ["Space", "Zone du café (terrasse, salle…) avec prix match-day"],
      ["Table", "Table numérotée d’un space, capacité fixe"],
      ["Occupation effective", "Effectif retenu pour l’affichage (règle RM-OCC)"],
      ["Rapport owner frais", "Comptage physique datant de 15 minutes ou moins"],
      ["Walk-in", "Client présent sans réservation"],
      ["Ticket code", "Identifiant FC- + 8 caractères UUID"],
      ["Payload QR", "FANCONNECT|TICKET| + ticket code"],
      ["KYC", "CIN + registre de commerce + photo extérieure"],
      ["Commission", "25 % du montant, retenue plateforme"],
    ],
    W2
  ),

  h1("8. Exigences fonctionnelles détaillées"),
  p("Priorité MoSCoW : M = Must, S = Should, C = Could. Chaque exigence est testable et alimente un ou plusieurs cas d’utilisation."),

  h3("EF01 — Inscription et authentification JWT  |  M  |  Tous"),
  p("Création de compte Fan ou Owner, authentification, accès selon le rôle porté par un JWT. Email unique. Mot de passe BCrypt. Rôle ADMIN interdit à l’inscription publique. Fan : ville obligatoire. Token : sub = email, claim role, HS256. SPA : localStorage + header Authorization Bearer."),
  p("Acceptation : inscription Fan → 201 + JWT ; email déjà utilisé → 400 ; rôle ADMIN → 400 ; login faux → 401 ; Fan sur /admin/** → 403."),

  h3("EF02 — Match Center  |  M  |  Fan (lecture publique)"),
  p("Affichage des matchs (équipes, date, score, minute, statut, groupe, stade) synchronisés depuis football-data.org, stockés en PostgreSQL. Upsert par externalId. Sync live ~60 s (J à J+7 + LIVE), compétitions ~5 min. Cache 10 / 15 / 30 s. Si l’API est down : dernières données locales. Matchs FINISHED ou CANCELLED non réservables."),

  h3("EF03 — Recherche et consultation des cafés  |  M  |  Fan"),
  p("Uniquement les établissements APPROVED. Occupation selon RM-OCC. Niveaux VERT ≤ 50 %, ORANGE ≤ 80 %, ROUGE > 80 %. Un café PENDING ou DISABLED n’apparaît pas au fan."),

  h3("EF04 — Réservation d’une table (wizard)  |  M  |  Fan"),
  p("Le fan choisit match, café, espace, table et partySize. Création atomique Reservation PENDING + Payment PENDING (MAD). Contrôles : café APPROVED, match réservable, table active, partySize ≤ capacité table, table non déjà PENDING/CONFIRMED pour ce match. Prix = matchDayPrice de l’espace. Pas de ticket à ce stade."),
  p("Include UML : Authentifier, Consulter les matchs, Rechercher un café, Vérifier la disponibilité, Payer."),

  h3("EF05 — Paiement en ligne  |  M  |  Fan + Stripe"),
  p("La carte ne transite jamais par FanConnect (PCI-DSS Stripe). Commission 25 % : fee = amount × 0,25 ; ownerPayout = amount − fee. Devise MAD, montant en centimes. PaymentIntent avec metadata reservationId. Le backend revérifie chez Stripe (status succeeded ET metadata = cette résa). Succès : Payment PAID, Reservation CONFIRMED, génération du ticket. Mode simulé si clés sk_ / pk_ absentes. Include : Obtenir le ticket. Extend : paiement simulé."),

  h3("EF06 — Ticket QR, PDF, identifiant  |  M"),
  p("Code FC- + 8 caractères UUID majuscules. QR ZXing : FANCONNECT|TICKET|{code}. PDF OpenPDF : match, café, adresse, espace, table, partySize, date, montant, QR. Pas de ticket si non PAID. Le parser accepte le payload complet ou le code seul."),

  h3("EF07 — Recommandation de cafés  |  S  |  Fan"),
  p("Match + GPS optionnel. Rayons 5 puis 10 puis 20 km jusqu’à au moins 3 résultats. Score proximité + occupation / risque. Cafés APPROVED uniquement."),

  h3("EF08 — Prédiction d’occupation  |  S  |  Fan / Owner + IA"),
  p("À partir de l’effectif RM-OCC : pic 1 h, 2 h, coup d’envoi ; risque LOW / MEDIUM / HIGH. Microservice Python Random Forest si disponible, sinon heuristique (+12 CDM, +8 week-end, +6 soirée 18–22 h, historique 30 j, vitesse check-in). L’UI n’appelle jamais Python directement. Extend de Consulter l’occupation."),

  h3("EF09 — Gestion établissement et KYC  |  M  |  Owner"),
  p("Création du café en PENDING (invisible). Documents obligatoires : NATIONAL_ID (CIN), BUSINESS_REGISTRATION (RC), EXTERIOR_PHOTO (façade). Soumission impossible si une pièce manque. Notif admins. Include : Déposer documents."),

  h3("EF10 — Occupation live  |  M  |  Owner"),
  p("Saisie manuelle source OWNER_MANUAL, reportedAt = now. Check-in QR : CHECK_IN_AUTO, +partySize plafonné à la capacité. Fraîcheur 15 minutes (RM-OCC). Un owner ne met à jour que son business."),

  h3("EF11 — Vérification ticket et check-in  |  M  |  Owner"),
  p("Recherche ticketCode ET business.ownerId = owner courant. PENDING / CANCELLED : invalide. CHECKED_IN : déjà utilisé (idempotent). CONFIRMED : valide, check-in possible. Check-in : CHECKED_IN + checkedInAt + notif fan + occupation. On peut vérifier sans faire entrer : le check-in est un extend [CONFIRMED]."),

  h3("EF12 — Modération admin  |  M"),
  p("Traiter une demande include Consulter le dossier. Approuver seulement si 3 pièces + soumission : APPROVED, approvedAt, géocodage lat/lng, notif. Rejeter : motif obligatoire, resoumission possible. DISABLED : retiré des fans. Extend : Approuver [dossier complet] / Rejeter [non conforme]."),

  h3("EF13 — Pilotage admin  |  S"),
  p("Utilisateurs, compétitions, heatmap villes, top cafés, commissions, analytics, désactivation (extend Superviser)."),

  h3("EF14 — Notifications  |  S"),
  p("Paiement OK, nouvelle résa owner, commission admin, check-in, café approuvé / rejeté / désactivé, dossier pending."),

  h3("EF15 — Annulation  |  S  |  Fan"),
  p("Interdite si CHECKED_IN. Si PAID → statut métier REFUNDED (pas de refund Stripe automatique, hors périmètre). Si PENDING → Payment FAILED. Extend de Gérer mes réservations."),

  h3("EF16 — Assistant FanBot  |  C"),
  p("Aide match / café (Grok ou fallback). Non bloquant. Extend de Réserver [aide demandée]."),

  h1("9. Règles métier"),
  h2("9.1 RM-OCC — Occupation effective (cœur différenciant)"),
  simpleTable(
    ["Constante", "Valeur", "Sens"],
    [
      ["ARRIVAL_RATE", "0,85", "% des CONFIRMED encore attendus"],
      ["PAYMENT_RATE", "0,60", "% des PENDING qui paieront"],
      ["FRESHNESS", "15 min", "Validité du rapport owner"],
      ["GREEN_MAX", "50 %", "Seuil vert"],
      ["ORANGE_MAX", "80 %", "Seuil orange"],
    ],
    W3
  ),
  p("Signaux : checkedIn, confirmed (non arrivés), pending, ownerReported, capacity."),
  codeLine("estimationRésa = checkedIn + round(confirmed × 0,85) + round(pending × 0,60)"),
  p("Si rapport owner ≤ 15 min : effectif = ownerReported (vérité terrain, walk-in inclus) ; walkIn = max(0, owner − checkedIn) ; pic = min(capa, owner + confirmed×0,85). Sinon : effectif = estimationRésa (éventuellement max avec un vieux rapport). Plafond à la capacité. % = effectif / capacité × 100 → VERT / ORANGE / ROUGE."),
  p("Exemple de recette : café 100 places, 20 check-in, 40 confirmés, 10 pending, owner = 55 il y a 8 min. estimationRésa = 60 mais rapport frais → effectif = 55, walk-in ≈ 35, pic = 89 %.", { bold: true }),
  p("Ne pas simplifier le jour de match en booked/capacity : ce calcul n’est valable que pour l’ancien modèle créneau horaire café."),

  h2("9.2 RM-PAY — Paiement"),
  codeLine("fee = amount × 0,25     payout = amount − fee     currency = MAD"),
  p("Pas de confiance au front : retrieve Stripe obligatoire (succeeded + metadata reservationId)."),

  h2("9.3 RM-TCK — Ticket"),
  codeLine('ticketCode = "FC-" + UUID[0..8].upper()'),
  codeLine('qrPayload  = "FANCONNECT|TICKET|" + ticketCode'),
  p("Isolation owner + un seul check-in."),

  h2("9.4 RM-KYC — Cycle du café"),
  codeLine("PENDING → (3 pièces + soumission) → APPROVED | REJECTED | plus tard DISABLED"),
  p("Seul APPROVED est visible et réservable. APPROVED déclenche le géocodage (recommandations)."),

  h2("9.5 RM-RES — Cycle de la réservation"),
  codeLine("PENDING → CONFIRMED → CHECKED_IN     (ou CANCELLED avant check-in)"),
  p("Contrainte : une table, un match, au plus une résa active PENDING ou CONFIRMED."),

  h1("10. Cas d’utilisation (analyse UML 2.5)"),
  p("Frontière système : rectangle FanConnect 2030. Acteurs primaires à gauche, secondaires à droite. Include : pointillés vers l’inclus (toujours). Extend : pointillés depuis l’extension vers le cas de base (condition)."),
  simpleTable(
    ["ID", "Cas", "Acteur", "Type"],
    [
      ["UC01", "S’inscrire", "Fan, Owner", "base"],
      ["UC02", "S’authentifier (JWT)", "Utilisateur", "include"],
      ["UC03", "Consulter les matchs", "Fan + API football", "include"],
      ["UC04", "Rechercher un café", "Fan", "include"],
      ["UC05", "Consulter l’occupation", "Fan, Owner", "include UC04"],
      ["UC06", "Vérifier la disponibilité", "Fan", "include UC07"],
      ["UC07", "Réserver une table", "Fan", "CŒUR"],
      ["UC08", "Payer en ligne", "Fan + Stripe", "include UC07"],
      ["UC09", "Obtenir le ticket QR", "Fan", "include UC08"],
      ["UC10", "Gérer mes réservations", "Fan", "base"],
      ["UC11", "Consulter FanBot", "Fan", "extend UC07"],
      ["UC12", "Télécharger le PDF", "Fan", "extend UC09"],
      ["UC13", "Annuler une réservation", "Fan", "extend UC10"],
      ["UC14", "Paiement simulé", "Fan", "extend UC08"],
      ["UC15", "Prédiction IA", "Fan + IA", "extend UC05"],
      ["UC16", "Créer un établissement", "Owner", "base"],
      ["UC17", "Déposer les documents KYC", "Owner", "include UC18"],
      ["UC18", "Soumettre pour validation", "Owner", "base"],
      ["UC19", "Signaler l’occupation live", "Owner", "base"],
      ["UC20", "Vérifier un ticket QR", "Owner", "base"],
      ["UC21", "Effectuer le check-in", "Owner", "extend UC20"],
      ["UC22", "Consulter le dossier", "Admin", "include UC23"],
      ["UC23", "Traiter une demande", "Admin", "base"],
      ["UC24", "Approuver un établissement", "Admin", "extend UC23"],
      ["UC25", "Rejeter un établissement", "Admin", "extend UC23"],
      ["UC26", "Superviser la plateforme", "Admin", "base"],
      ["UC27", "Désactiver un établissement", "Admin", "extend UC26"],
    ],
    W4
  ),
  h2("10.1 Include (obligatoire)"),
  bullet("UC07 → UC02, UC03, UC04, UC06, UC08"),
  bullet("UC08 → UC09"),
  bullet("UC04 → UC05"),
  bullet("UC18 → UC17"),
  bullet("UC23 → UC22"),
  h2("10.2 Extend (conditionnel)"),
  bullet("UC11 → UC07  [aide demandée]"),
  bullet("UC13 → UC10  [≠ CHECKED_IN]"),
  bullet("UC12 → UC09  [PDF demandé]"),
  bullet("UC14 → UC08  [Stripe absent]"),
  bullet("UC15 → UC05  [service IA up]"),
  bullet("UC21 → UC20  [ticket CONFIRMED]"),
  bullet("UC24 → UC23  [dossier complet]"),
  bullet("UC25 → UC23  [dossier non conforme]"),
  bullet("UC27 → UC26  [sanction]"),
  h2("10.3 Scénario nominal (séquence principale)"),
  p("1. Fan s’authentifie (JWT). 2. Consulte les matchs. 3. Choisit un café recommandé. 4. Choisit espace + table libre. 5. Crée PENDING. 6. Paie Stripe (ou simulé). 7. Reçoit le QR. 8. Owner scanne : CHECKED_IN + occupation."),
  p("Alternatives à tracer en alt/opt : table prise, match fini, Stripe KO, ticket déjà scanné, KYC incomplet, API football down, IA down."),

  h1("11. Modèle conceptuel des données (conception classes)"),
  p("Diagramme de classes d’analyse : sans Controller, DTO, Repository. hide circle. Composition = cycle de vie lié."),
  simpleTable(
    ["Classe", "Responsabilité"],
    [
      ["User", "Compte email unique, rôle, BCrypt"],
      ["Business", "Café, capacité, statut, GPS"],
      ["BusinessSpace", "Zone + prix match-day"],
      ["BusinessTable", "Table numérotée"],
      ["VerificationDocument", "Pièce KYC"],
      ["Competition", "Compétition (code externe WC…)"],
      ["FootballMatch", "Match, externalId, score, statut"],
      ["Reservation", "Lien fan–table–match–ticket"],
      ["Payment", "Montant, commission, Stripe"],
      ["BusinessLiveOccupancy", "Comptage owner / check-in"],
      ["OccupancyEngine «utility»", "RM-OCC"],
      ["PaymentCalculator «utility»", "RM-PAY"],
    ],
    W2
  ),
  p("Hors DU d’analyse : Cafe legacy, images, Notification, OccupancySnapshot, DTO."),
  h2("11.1 Cardinalités"),
  codeLine("User 1 —possède— * Business     User 1 —effectue— * Reservation"),
  codeLine("Business 1 ◆— 1..* Space 1 ◆— 1..* Table     Business 1 ◆— * VerificationDocument"),
  codeLine("Competition 1 — * FootballMatch"),
  codeLine("Reservation * — 1 Business, 1 Space, 1 Table, 1 Match"),
  codeLine("Reservation 1 ◆— 0..1 Payment"),
  h2("11.2 Énumérations"),
  simpleTable(
    ["Enum", "Valeurs"],
    [
      ["Role", "FAN_USER, BUSINESS_OWNER, ADMIN"],
      ["BusinessStatus", "PENDING, APPROVED, REJECTED, DISABLED"],
      ["ReservationStatus", "PENDING, CONFIRMED, CANCELLED, CHECKED_IN"],
      ["PaymentStatus", "PENDING, PAID, FAILED, REFUNDED"],
      ["OccupancyLevel", "GREEN, ORANGE, RED"],
      ["MatchStatus", "SCHEDULED, LIVE, FINISHED, CANCELLED"],
      ["DocumentType", "NATIONAL_ID, BUSINESS_REGISTRATION, EXTERIOR_PHOTO"],
    ],
    W2
  ),
  h2("11.3 Opérations"),
  bullet("User : sInscrire(), seConnecter()"),
  bullet("Business : soumettreVerification(), estApprouve()"),
  bullet("Reservation : confirmer(ticketCode), annuler(), checkIn()"),
  bullet("Payment : marquerPaye(intentId), verifierChezStripe()"),
  bullet("OccupancyEngine : computeBreakdown(), percentage(), level(), isFresh()"),
  bullet("FootballMatch : estReservable()   BusinessTable : estReservable(matchId)"),
  p("Héritage : BaseEntity { id, createdAt, updatedAt }."),

  h1("12. Architecture cible"),
  p("Architecture 3-tiers + microservice IA découplé. Le navigateur n’appelle pas le service Python."),
  codeLine("[ SPA React 18 / Vite / Tailwind ]"),
  codeLine("        HTTPS / REST JSON + JWT"),
  codeLine("[ Spring Boot 3 / Java 21 / JPA / Security ]"),
  codeLine("   JDBC → PostgreSQL 16          HTTP → FastAPI Random Forest"),
  codeLine("                                 Stripe PaymentIntent (aucun PAN en base)"),
  p("Couches backend : controller → service → repository → entity ; security JWT ; dto ; util (OccupancyEngine, PaymentCalculator, TicketCodeParser). Front : AuthContext + localStorage, routes protégées par rôle, 3 shells UI."),
  simpleTable(
    ["Zone", "Exemples", "Auth"],
    [
      ["Public", "POST /auth/register, /login ; GET /matches, /businesses", "non"],
      ["Fan", "POST /fan/bookings, .../pay, ticket.pdf", "FAN_USER"],
      ["Owner", "business, occupancy live, tickets verify/check-in", "BUSINESS_OWNER"],
      ["Admin", "approve/reject, analytics, competitions", "ADMIN"],
    ],
    W3
  ),
  p("Swagger : /api/swagger-ui.html. Docker Compose : postgres:5432, backend:8080, frontend:80 (Nginx /api)."),

  h1("13. Interfaces utilisateur"),
  simpleTable(
    ["ID", "Écran", "Acteur", "EF"],
    [
      ["UI01", "Accueil", "Public", "EF02 EF03"],
      ["UI02", "Login / Register", "Tous", "EF01"],
      ["UI03", "Match Center", "Fan", "EF02"],
      ["UI04", "Fiche café + occupation", "Fan", "EF03 EF08"],
      ["UI05", "Wizard réservation", "Fan", "EF04"],
      ["UI06", "Paiement Stripe", "Fan", "EF05"],
      ["UI07", "Mes tickets / PDF", "Fan", "EF06 EF15"],
      ["UI08", "Dashboard Owner", "Owner", "EF09–11"],
      ["UI09", "Upload KYC", "Owner", "EF09"],
      ["UI10", "Scan QR / check-in", "Owner", "EF11"],
      ["UI11", "Occupation live", "Owner", "EF10 EF08"],
      ["UI12", "Dashboard Admin", "Admin", "EF12 EF13"],
      ["UI13", "Dossier de vérification", "Admin", "EF12"],
    ],
    W4
  ),
  p("Contrainte UX : responsive desktop + mobile web. Espaces visuellement isolés par rôle."),

  h1("14. Intégrations externes"),
  simpleTable(
    ["Système", "Flux", "Données", "Exigence"],
    [
      ["football-data.org", "IN", "Matchs, scores, live", "Clé, cache, upsert externalId"],
      ["Stripe", "OUT puis IN", "PaymentIntent", "MAD, metadata, retrieve serveur"],
      ["Service IA", "OUT", "Features occupation", "Timeout + fallback heuristique"],
      ["Géocodage", "OUT", "lat / lng à l’approbation", "Recommandation distance"],
    ],
    W4
  ),

  h1("15. Exigences non fonctionnelles"),
  simpleTable(
    ["ID", "Catégorie", "Exigence"],
    [
      ["ENF01", "Sécurité", "JWT + rôles + BCrypt + secrets .env"],
      ["ENF02", "Paiement", "PCI-DSS Stripe, aucun PAN stocké"],
      ["ENF03", "Performance", "API métier < 2 s (hors Stripe)"],
      ["ENF04", "Résilience matchs", "Affichage local si API football down"],
      ["ENF05", "Résilience IA", "Fallback heuristique"],
      ["ENF06", "Maintenabilité", "Couches, Flyway, OpenAPI"],
      ["ENF07", "Portabilité", "Docker Compose"],
      ["ENF08", "UI", "Responsive, 3 espaces"],
      ["ENF09", "Audit", "createdAt / updatedAt BaseEntity"],
      ["ENF10", "KYC", "Documents owner + admin seulement"],
    ],
    W3
  ),

  h1("16. Sécurité"),
  bullet("Auth stateless JWT (signature, expiration, UserDetails)."),
  bullet("Autorisation par rôle (antMatchers + method security)."),
  bullet("Isolation owner : business.ownerId, ticket du café de l’owner."),
  bullet("Anti rejeu ticket : un seul check-in."),
  bullet("Paiement : vérification serveur du PaymentIntent."),
  bullet("ADMIN non créable en public."),
  bullet("Uploads KYC hors web root, accès restreint."),
  bullet("CORS limité. CSRF désactivé (API JWT) — à documenter."),

  h1("17. Recette — critères d’acceptation globaux"),
  bullet("Parcours fan EF04+EF05+EF06 en Stripe test ET en mode simulé."),
  bullet("Café non APPROVED invisible au fan."),
  bullet("RM-OCC : exemple 100 places / owner 55 / 8 min → effectif 55."),
  bullet("Check-in : 1er scan OK, 2e scan déjà utilisé."),
  bullet("Fan n’accède pas à /admin/**."),
  bullet("API football coupée : Match Center lisible."),
  bullet("IA coupée : occupation + heuristique OK."),
  bullet("Carte test Stripe 4242 4242 4242 4242."),

  h1("18. Matrice de traçabilité CDC → UML"),
  p("Cette matrice relie chaque exigence aux diagrammes d’analyse et de conception. Elle est obligatoire dans le rapport."),
  simpleTable(
    ["EF", "Cas d’utilisation", "Classes", "Séquence"],
    [
      ["EF01", "UC01 UC02", "User", "Authentification"],
      ["EF02", "UC03", "Competition, FootballMatch", "Sync matchs"],
      ["EF03", "UC04 UC05", "Business, OccupancyEngine", "Occupation"],
      ["EF04", "UC07 UC06", "Reservation, Table, Space", "Réservation"],
      ["EF05", "UC08 UC14", "Payment, PaymentCalculator", "Réservation / Stripe"],
      ["EF06", "UC09 UC12", "Reservation (ticketCode)", "QR"],
      ["EF07", "UC04", "Business (GPS)", "—"],
      ["EF08", "UC15", "OccupancyEngine + IA", "Occupation"],
      ["EF09", "UC16–18", "Business, VerificationDocument", "KYC"],
      ["EF10", "UC19", "BusinessLiveOccupancy", "Occupation"],
      ["EF11", "UC20 UC21", "Reservation, TicketCodeParser", "Check-in QR"],
      ["EF12", "UC22–25", "Business", "KYC"],
      ["EF13", "UC26 UC27", "—", "—"],
      ["EF15", "UC13", "Reservation, Payment", "alt résa"],
    ],
    W4
  ),
  p("Consigne analyse : un ovale = un UCxx ; include/extend uniquement §10. Consigne conception : une classe = une entité §11 ; OccupancyEngine et PaymentCalculator portent RM-OCC et RM-PAY."),

  h1("19. Stack technique"),
  simpleTable(
    ["Couche", "Technologie"],
    [
      ["Front", "React 18, Vite, Tailwind, Axios, React Router"],
      ["Back", "Java 21, Spring Boot 3, Spring Security, JPA"],
      ["Base", "PostgreSQL 16, Flyway"],
      ["IA", "Python, FastAPI, scikit-learn Random Forest"],
      ["Paiement", "Stripe (mode test)"],
      ["Build", "Maven, npm, Docker Compose"],
    ],
    W2
  ),

  h1("20. Machines à états"),
  h3("Reservation"),
  codeLine("PENDING —payé→ CONFIRMED —scan→ CHECKED_IN"),
  codeLine("PENDING | CONFIRMED —annulation→ CANCELLED"),
  h3("Payment"),
  codeLine("PENDING —succès→ PAID     PENDING —échec→ FAILED     PAID —annul. métier→ REFUNDED"),
  h3("Business"),
  codeLine("PENDING —approbation→ APPROVED     PENDING —rejet→ REJECTED —resoumission→ PENDING"),
  codeLine("APPROVED —admin→ DISABLED"),

  h1("21. Livrables"),
  simpleTable(
    ["Livrable", "Forme"],
    [
      ["Le présent cahier des charges", "Document unique de référence"],
      ["Diagramme de cas d’utilisation", "UML 2.5 include/extend"],
      ["Diagramme de classes", "Entités §11"],
      ["Diagrammes de séquence", "Auth, résa+paiement, occupation, KYC, QR, matchs"],
      ["Code source", "Monorepo React + Spring + FastAPI"],
      ["API OpenAPI", "Swagger"],
      ["Rapport / soutenance PFE", "IGA"],
    ],
    W2
  ),
  p("Toute évolution (Stripe live, application native, refund automatique) fera l’objet d’un avenant numéroté, sans modifier silencieusement ce document."),
  p("Fin du cahier des charges unique — FanConnect 2030 — GM-Soft / IGA — version 1.0 — 21 septembre 2026.", { bold: true, align: AlignmentType.CENTER }),
];

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Times New Roman", size: 24 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Times New Roman", color: BLUE },
        paragraph: { spacing: { before: 360, after: 240 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Times New Roman", color: BLUE },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Times New Roman", color: "2E75B6" },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: A4_W, height: A4_H },
        margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: BLUE, space: 4 } },
          children: [
            new TextRun({ text: "FanConnect 2030  —  Cahier des charges", font: "Times New Roman", size: 18, color: BLUE, italics: true }),
          ],
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC", space: 6 } },
          children: [
            new TextRun({ text: "IGA  ·  GM-Soft  ·  PFE 2025/2026  ·  Page ", font: "Times New Roman", size: 16, color: GRAY }),
            new TextRun({ children: [PageNumber.CURRENT], font: "Times New Roman", size: 16, color: GRAY }),
          ],
        })],
      }),
    },
    children,
  }],
});

const outDir = path.resolve(__dirname, "..");
const out1 = path.join(outDir, "Cahier_des_charges_FanConnect_2030.docx");
const out2 = path.resolve(__dirname, "..", "..", "Cahier_des_charges_FanConnect_2030.docx");

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(out1, buf);
  fs.writeFileSync(out2, buf);
  console.log("OK", out1);
  console.log("OK", out2);
  console.log("bytes", buf.length);
});
