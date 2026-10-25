/**
 * FanConnect 2030 — Présentation PFE
 * Calquée sur la méthodologie d'encadrement IGA (M. Bouchib Riyami)
 * Template visuel : academic professional (forest / cream / terracotta)
 *
 * Run from repo root:
 *   node docs/rapport/presentation-pfe.js
 */

const pptxgen = require("pptxgenjs");
const path = require("path");

const RAPPORT = __dirname;
const SHOTS = path.join(RAPPORT, "ppt-assets");
const DIAG = path.join(RAPPORT, "diagrams");
const ICONS = path.join(RAPPORT, "tech-icons");

const COLOR = {
  darkBg: "1B2420",
  cream: "F1EDE3",
  beige: "E8DFC8",
  cardCream: "F5EFE2",
  ink: "1B2420",
  body: "3B3F3A",
  muted: "7A7F76",
  mutedLight: "A7A79A",
  forest: "3B5D3A",
  forestDeep: "2C4A2B",
  moss: "7A9A6A",
  terracotta: "C26A33",
  terracottaSoft: "D48A5B",
  hairline: "C9C4B4",
  hairlineDark: "2A3530",
  subtitleOnDark: "C9C4B4",
  titleOnDark: "EFE9D9",
  white: "FFFFFF",
  gold: "C9A227",
};

const FONT = {
  head: "Georgia",
  body: "Calibri",
  mono: "Consolas",
};

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.title = "FanConnect 2030 — Présentation PFE";
pres.author = "Stagiaire 5DLTI — IGA";
pres.subject = "Projet de Fin d'Études 2025/2026";

const W = 13.333;
const H = 7.5;
const MX = 0.7;
const TOTAL = 26;

function shadowSoft() {
  return { type: "outer", color: "000000", blur: 8, offset: 2, angle: 135, opacity: 0.1 };
}

function addEyebrow(slide, label, n, onDark = false) {
  const c = onDark ? COLOR.mutedLight : COLOR.muted;
  slide.addText(label, {
    x: MX, y: 0.28, w: 9.2, h: 0.28,
    fontFace: FONT.body, fontSize: 11, color: c, charSpacing: 2.4, margin: 0,
  });
  slide.addText(String(n).padStart(2, "0") + "  /  " + String(TOTAL).padStart(2, "0"), {
    x: W - MX - 1.6, y: 0.28, w: 1.6, h: 0.28,
    fontFace: FONT.body, fontSize: 11, color: c, align: "right", charSpacing: 1.5, margin: 0,
  });
}

function addFooter(slide, onDark = false) {
  const c = onDark ? COLOR.mutedLight : COLOR.muted;
  const y = 7.18;
  slide.addShape(pres.shapes.LINE, {
    x: MX, y: y - 0.08, w: W - 2 * MX, h: 0,
    line: { color: onDark ? COLOR.hairlineDark : COLOR.hairline, width: 0.75 },
  });
  slide.addText("FANCONNECT 2030   ·   PFE 5DLTI   ·   IGA 2025 / 2026", {
    x: MX, y, w: 10, h: 0.22,
    fontFace: FONT.body, fontSize: 10, color: c, charSpacing: 0.8, margin: 0,
  });
}

function addTitle(slide, text, opts = {}) {
  const {
    y = 0.62, h = 0.72, size = 28, color = COLOR.ink,
    w = W - 2 * MX, italic = false, runs = null, x = MX,
  } = opts;
  if (runs) {
    slide.addText(runs, {
      x, y, w, h,
      fontFace: FONT.head, fontSize: size, valign: "top", margin: 0,
    });
  } else {
    slide.addText(text, {
      x, y, w, h,
      fontFace: FONT.head, fontSize: size, color, italic, valign: "top", margin: 0,
    });
  }
}

function roundCard(slide, x, y, w, h, fill) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h,
    fill: { color: fill || COLOR.cardCream },
    rectRadius: 0.08,
    shadow: shadowSoft(),
  });
}

function rectCard(slide, x, y, w, h, fill) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { color: fill || COLOR.cardCream },
    shadow: shadowSoft(),
  });
}

function chip(slide, x, y, w, h, text, bg, fg) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h,
    fill: { color: bg },
    rectRadius: 0.06,
  });
  slide.addText(text, {
    x, y, w, h,
    fontFace: FONT.body, fontSize: 11, bold: true, color: fg,
    align: "center", valign: "middle", margin: 0,
  });
}

// ======================================================================
// 01  Cover
// ======================================================================
function slide01() {
  const s = pres.addSlide();
  s.background = { color: COLOR.darkBg };

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.18, h: H, fill: { color: COLOR.terracotta },
  });

  s.addText("INSTITUT DE GÉNIE APPLIQUÉ   ·   5DLTI / SRI", {
    x: MX, y: 0.55, w: 10, h: 0.28,
    fontFace: FONT.body, fontSize: 12, color: COLOR.mutedLight, charSpacing: 2.2, margin: 0,
  });

  chip(s, MX, 1.05, 3.35, 0.38, "PROJET DE FIN D'ÉTUDES", COLOR.forestDeep, COLOR.titleOnDark);

  s.addText("FanConnect 2030", {
    x: MX, y: 1.7, w: 11.5, h: 1.05,
    fontFace: FONT.head, fontSize: 48, color: COLOR.titleOnDark, margin: 0,
  });
  s.addText("Plateforme intelligente de réservation de cafés\npour regarder les matchs — Coupe du Monde 2030", {
    x: MX, y: 2.85, w: 11, h: 1.05,
    fontFace: FONT.body, fontSize: 20, color: COLOR.subtitleOnDark, margin: 0,
  });

  s.addText("Démarche projet IT appliquée  ·  méthodologie d'encadrement IGA", {
    x: MX, y: 4.05, w: 11, h: 0.35,
    fontFace: FONT.head, fontSize: 14, italic: true, color: COLOR.terracottaSoft, margin: 0,
  });

  s.addShape(pres.shapes.LINE, {
    x: MX, y: 5.55, w: W - 2 * MX, h: 0,
    line: { color: COLOR.hairlineDark, width: 0.75 },
  });

  const meta = [
    { k: "ÉTUDIANT", v: "Stagiaire 5DLTI  —  à compléter" },
    { k: "ENCADRANT ACADÉMIQUE", v: "M. Bouchib Riyami" },
    { k: "ORGANISME", v: "GM-Soft  ·  2025 / 2026" },
  ];
  meta.forEach((m, i) => {
    const x = MX + i * 4.05;
    s.addText(m.k, {
      x, y: 5.75, w: 3.8, h: 0.24,
      fontFace: FONT.body, fontSize: 10, color: COLOR.mutedLight, charSpacing: 1.6, margin: 0,
    });
    s.addText(m.v, {
      x, y: 6.02, w: 3.8, h: 0.32,
      fontFace: FONT.body, fontSize: 14, bold: true, color: COLOR.titleOnDark, margin: 0,
    });
  });
}

// ======================================================================
// 02  Plan
// ======================================================================
function slide02() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "SOMMAIRE", 2);
  addTitle(s, null, {
    runs: [
      { text: "Deux parties, ", options: { color: COLOR.ink } },
      { text: "une démarche", options: { color: COLOR.forest, italic: true } },
      { text: ".", options: { color: COLOR.ink } },
    ],
  });
  addFooter(s);

  roundCard(s, MX, 1.5, 5.85, 5.35, COLOR.white);
  s.addText("PARTIE 1", {
    x: MX + 0.3, y: 1.68, w: 5.2, h: 0.26,
    fontFace: FONT.body, fontSize: 11, color: COLOR.terracotta, charSpacing: 2, margin: 0,
  });
  s.addText("Démarche d'un projet IT", {
    x: MX + 0.3, y: 1.95, w: 5.2, h: 0.4,
    fontFace: FONT.head, fontSize: 18, color: COLOR.ink, margin: 0,
  });

  const p1 = [
    "01  Équipe et organisation",
    "02  Recherche et bibliographie",
    "03  Étude de l'existant",
    "04  Cahier des charges",
    "05  Méthode de mise en œuvre",
    "06  Analyse et conception UML",
    "07  Choix des outils",
    "08  Base de données",
    "09  Développement applicatif",
    "10  Mise en place et tests",
    "11  Manuel d'utilisation",
  ];
  s.addText(p1.map((t, i) => ({
    text: t, options: { breakLine: i < p1.length - 1 },
  })), {
    x: MX + 0.3, y: 2.45, w: 5.25, h: 4.15,
    fontFace: FONT.body, fontSize: 14, color: COLOR.body, paraSpaceAfter: 6, margin: 0,
  });

  roundCard(s, 6.85, 1.5, 5.8, 2.55, COLOR.white);
  s.addText("PARTIE 2", {
    x: 7.15, y: 1.68, w: 5.2, h: 0.26,
    fontFace: FONT.body, fontSize: 11, color: COLOR.terracotta, charSpacing: 2, margin: 0,
  });
  s.addText("Cinq règles de développement", {
    x: 7.15, y: 1.95, w: 5.2, h: 0.38,
    fontFace: FONT.head, fontSize: 18, color: COLOR.ink, margin: 0,
  });
  const p2 = [
    "Dynamiser le cycle (DevOps)",
    "Applications ouvertes et innovantes",
    "Automatiser les processus (agile)",
    "Découper en services",
    "Innover : IA, options stratégiques",
  ];
  s.addText(p2.map((t, i) => ({
    text: t, options: { bullet: true, breakLine: i < p2.length - 1 },
  })), {
    x: 7.15, y: 2.45, w: 5.2, h: 1.4,
    fontFace: FONT.body, fontSize: 14, color: COLOR.body, paraSpaceAfter: 4, margin: 0,
  });

  roundCard(s, 6.85, 4.25, 5.8, 2.6, COLOR.forest);
  s.addText("FIL CONDUCTEUR", {
    x: 7.15, y: 4.45, w: 5.2, h: 0.24,
    fontFace: FONT.body, fontSize: 11, color: COLOR.moss, charSpacing: 2, margin: 0,
  });
  s.addText("Chaque étape de la méthodologie IGA est illustrée par un livrable réel de FanConnect 2030 — de l'équipe au manuel utilisateur.", {
    x: 7.15, y: 4.8, w: 5.2, h: 1.7,
    fontFace: FONT.body, fontSize: 16, color: COLOR.titleOnDark, margin: 0,
  });
}

// ======================================================================
// 03  Contexte & problématique
// ======================================================================
function slide03() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "CADRAGE  ·  CONTEXTE", 3);
  addTitle(s, null, {
    runs: [
      { text: "2030 au Maroc, ", options: { color: COLOR.ink } },
      { text: "sans place au café.", options: { color: COLOR.terracotta, italic: true } },
    ],
  });
  addFooter(s);

  s.addText("Le football est un phénomène social et économique majeur. À l'approche de la Coupe du Monde 2030, la demande de lieux pour suivre les matchs explose. Les supporters peinent à trouver un café disponible et proche ; les propriétaires n'ont pas d'outil pour gérer réservations et affluence.", {
    x: MX, y: 1.45, w: 12, h: 1.05,
    fontFace: FONT.body, fontSize: 16, color: COLOR.body, margin: 0,
  });

  const stats = [
    { n: "2030", l: "Coupe du Monde\nau Maroc" },
    { n: "3", l: "profils : Fan,\nOwner, Admin" },
    { n: "4 mois", l: "PFE itératif\nAvril → Juillet" },
    { n: "IA", l: "Occupation\nprédictive" },
  ];
  stats.forEach((st, i) => {
    const x = MX + i * 3.15;
    roundCard(s, x, 2.65, 2.95, 1.7, COLOR.white);
    s.addText(st.n, {
      x, y: 2.78, w: 2.95, h: 0.7,
      fontFace: FONT.head, fontSize: 28, color: COLOR.forest, align: "center", margin: 0,
    });
    s.addText(st.l, {
      x: x + 0.1, y: 3.48, w: 2.75, h: 0.7,
      fontFace: FONT.body, fontSize: 13, color: COLOR.body, align: "center", margin: 0,
    });
  });

  roundCard(s, MX, 4.55, W - 2 * MX, 2.35, COLOR.forestDeep);
  s.addText("PROBLÉMATIQUE", {
    x: MX + 0.4, y: 4.72, w: 11.5, h: 0.28,
    fontFace: FONT.body, fontSize: 12, color: COLOR.moss, charSpacing: 2, margin: 0,
  });
  s.addText("Comment concevoir une plateforme fiable, sécurisée et intelligente permettant aux supporters de réserver un lieu adapté pour un match, tout en aidant les établissements à anticiper l'affluence — dans le contexte de la CDM 2030 ?", {
    x: MX + 0.4, y: 5.1, w: 11.5, h: 1.5,
    fontFace: FONT.head, fontSize: 18, italic: true, color: COLOR.titleOnDark, margin: 0,
  });
}

// ======================================================================
// 04  GM-Soft
// ======================================================================
function slide04() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "ORGANISME D'ACCUEIL", 4);
  addTitle(s, "GM-Soft — German Moroccan Software");
  addFooter(s);

  const facts = [
    { t: "Création", d: "2014  ·  SARL  ·  +10 ans" },
    { t: "Siège", d: "Béni Mellal, boulevard Hassan II" },
    { t: "Sites", d: "Casa, Rabat, Allemagne" },
    { t: "Stage", d: "Pôle Développement · GM-CAFE" },
  ];
  facts.forEach((f, i) => {
    const x = MX + (i % 2) * 3.15;
    const y = 1.5 + Math.floor(i / 2) * 1.35;
    roundCard(s, x, y, 3.0, 1.2, COLOR.white);
    s.addText(f.t, {
      x: x + 0.18, y: y + 0.16, w: 2.65, h: 0.28,
      fontFace: FONT.body, fontSize: 12, color: COLOR.terracotta, charSpacing: 1.2, margin: 0,
    });
    s.addText(f.d, {
      x: x + 0.18, y: y + 0.48, w: 2.65, h: 0.55,
      fontFace: FONT.body, fontSize: 14, color: COLOR.ink, margin: 0,
    });
  });

  s.addImage({
    path: path.join(DIAG, "05-organigramme-gmsoft.png"),
    x: 7.05, y: 1.5, w: 5.55, h: 5.55 * (760 / 1500),
    altText: "Organigramme fonctionnel GM-Soft",
  });
  s.addText("Direction → Conseil & SI, Développement, Données & sécurité, Support. FanConnect est rattaché au pôle Développement.", {
    x: MX, y: 4.3, w: 6.15, h: 1.0,
    fontFace: FONT.body, fontSize: 13, color: COLOR.body, margin: 0,
  });
  s.addText("Mission : concevoir, intégrer et faire évoluer des solutions métiers (GM-ERP, GM-POS, GM-CAFE, GM-HOTEL).", {
    x: MX, y: 5.35, w: 6.15, h: 0.9,
    fontFace: FONT.body, fontSize: 13, color: COLOR.body, margin: 0,
  });
}

// ======================================================================
// 05  Projet
// ======================================================================
function slide05() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "LE PROJET DEMANDÉ", 5);
  addTitle(s, "FanConnect relie match, lieu et réservation.");
  addFooter(s);

  const feats = [
    { n: "01", t: "Match Center", d: "Calendrier CDM, scores, groupes, classements." },
    { n: "02", t: "Lieux géolocalisés", d: "Cafés approuvés, carte, capacité, occupation." },
    { n: "03", t: "Réservation + Stripe", d: "Wizard 8 étapes, paiement, ticket QR." },
    { n: "04", t: "IA d'affluence", d: "Random Forest + recommandations proximité." },
  ];
  feats.forEach((f, i) => {
    const x = MX + i * 3.15;
    roundCard(s, x, 1.5, 3.0, 2.35, COLOR.white);
    s.addText(f.n, {
      x: x + 0.2, y: 1.65, w: 2.6, h: 0.32,
      fontFace: FONT.body, fontSize: 12, color: COLOR.terracotta, charSpacing: 1.5, margin: 0,
    });
    s.addText(f.t, {
      x: x + 0.2, y: 2.0, w: 2.6, h: 0.5,
      fontFace: FONT.head, fontSize: 16, color: COLOR.ink, margin: 0,
    });
    s.addText(f.d, {
      x: x + 0.2, y: 2.55, w: 2.6, h: 1.05,
      fontFace: FONT.body, fontSize: 13, color: COLOR.body, margin: 0,
    });
  });

  const roles = [
    { t: "FAN", d: "Découvrir, réserver, payer, suivre le ticket." },
    { t: "OWNER", d: "Établissement, occupation live, check-in QR." },
    { t: "ADMIN", d: "Validation, analytics, compétitions." },
  ];
  roles.forEach((r, i) => {
    const x = MX + i * 4.2;
    roundCard(s, x, 4.1, 4.0, 2.35, i === 1 ? COLOR.forest : COLOR.white);
    const tc = i === 1 ? COLOR.titleOnDark : COLOR.ink;
    const dc = i === 1 ? COLOR.subtitleOnDark : COLOR.body;
    s.addText(r.t, {
      x: x + 0.25, y: 4.3, w: 3.5, h: 0.4,
      fontFace: FONT.head, fontSize: 18, color: tc, margin: 0,
    });
    s.addText(r.d, {
      x: x + 0.25, y: 4.85, w: 3.5, h: 1.2,
      fontFace: FONT.body, fontSize: 15, color: dc, margin: 0,
    });
  });
}

// ======================================================================
// 06  Divider P1
// ======================================================================
function slide06() {
  const s = pres.addSlide();
  s.background = { color: COLOR.terracotta };
  s.addText("PARTIE 1", {
    x: MX, y: 2.15, w: 11, h: 0.4,
    fontFace: FONT.body, fontSize: 14, color: COLOR.beige, charSpacing: 3, margin: 0,
  });
  s.addText("La démarche du travail\nd'un projet IT", {
    x: MX, y: 2.65, w: 12, h: 1.8,
    fontFace: FONT.head, fontSize: 40, color: COLOR.white, margin: 0,
  });
  s.addText("Onze étapes — de l'équipe au manuel d'utilisation — appliquées à FanConnect 2030.", {
    x: MX, y: 4.7, w: 11, h: 0.5,
    fontFace: FONT.body, fontSize: 16, color: COLOR.beige, margin: 0,
  });
}

// ======================================================================
// 07  Équipe
// ======================================================================
function slide07() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "ÉTAPE 1  ·  CHOIX DE L'ÉQUIPE", 7);
  addTitle(s, "Une équipe courte, un rythme incrémental.");
  addFooter(s);

  const people = [
    { r: "Stagiaire PFE", d: "Conception, développement full-stack, IA, documentation." },
    { r: "Encadrant académique", d: "M. Bouchib Riyami — méthodologie, UML, validation scientifique." },
    { r: "Encadrant professionnel", d: "GM-Soft — architecture, sécurité, lien métier GM-CAFE." },
    { r: "Pilotage", d: "Sprints de 2 semaines, revues, démos Match Center / réservation / IA." },
  ];
  people.forEach((p, i) => {
    const y = 1.5 + i * 1.25;
    roundCard(s, MX, y, W - 2 * MX, 1.12, COLOR.white);
    s.addShape(pres.shapes.RECTANGLE, {
      x: MX, y, w: 0.12, h: 1.12, fill: { color: i === 0 ? COLOR.terracotta : COLOR.forest },
    });
    s.addText(String(i + 1).padStart(2, "0"), {
      x: MX + 0.4, y: y + 0.28, w: 0.7, h: 0.55,
      fontFace: FONT.head, fontSize: 22, color: COLOR.forest, margin: 0,
    });
    s.addText(p.r, {
      x: MX + 1.25, y: y + 0.16, w: 10.5, h: 0.35,
      fontFace: FONT.head, fontSize: 18, color: COLOR.ink, margin: 0,
    });
    s.addText(p.d, {
      x: MX + 1.25, y: y + 0.55, w: 10.5, h: 0.4,
      fontFace: FONT.body, fontSize: 15, color: COLOR.body, margin: 0,
    });
  });
}

// ======================================================================
// 08  Gantt
// ======================================================================
function slide08() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "ÉTAPE 1  ·  PLANNING DE TRAVAIL", 8);
  addTitle(s, "Diagramme de Gantt — Avril → Juillet");
  addFooter(s);

  const gantt = path.join(ICONS, "gantt-fanconnect-4mois.png");
  let gw = 12.0;
  let gh = gw * (900 / 1600);
  if (gh > 5.4) {
    gh = 5.4;
    gw = gh * (1600 / 900);
  }
  s.addImage({
    path: gantt,
    x: (W - gw) / 2, y: 1.42, w: gw, h: gh,
    altText: "Gantt FanConnect 2030",
  });
}

// ======================================================================
// 09  Recherche
// ======================================================================
function slide09() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "ÉTAPE 2  ·  RECHERCHE ET BIBLIOGRAPHIE", 9);
  addTitle(s, "Limiter le projet, clarifier le besoin.");
  addFooter(s);

  const items = [
    { t: "Périmètre", d: "Web full-stack : matchs, cafés, réservation, paiement test, prédiction d'occupation. Hors mobile natif et production Stripe live." },
    { t: "Problématique", d: "Réserver un lieu adapté pour un match, tout en anticipant l'affluence côté établissement." },
    { t: "Besoins fonctionnels", d: "Auth JWT, Match Center, recherche, wizard, Stripe, recos, IA, dashboards Owner / Admin." },
    { t: "Besoins non fonctionnels", d: "Sécurité, API < 2 s, Docker, Flyway, UI responsive, OpenAPI." },
    { t: "Sources", d: "GM-CAFE (métier café), encadrants, docs Spring / React / Stripe, bibliographie UML et Scrum." },
    { t: "Client interne", d: "Cadrage avec GM-Soft : livrable démontrable, architecture maintenable, lien restauration." },
  ];
  items.forEach((it, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = MX + col * 4.15;
    const y = 1.5 + row * 2.55;
    roundCard(s, x, y, 3.95, 2.35, COLOR.white);
    s.addText(it.t, {
      x: x + 0.22, y: y + 0.2, w: 3.5, h: 0.4,
      fontFace: FONT.head, fontSize: 16, color: COLOR.forest, margin: 0,
    });
    s.addText(it.d, {
      x: x + 0.22, y: y + 0.7, w: 3.5, h: 1.4,
      fontFace: FONT.body, fontSize: 14, color: COLOR.body, margin: 0,
    });
  });
}

// ======================================================================
// 10  Existant
// ======================================================================
function slide10() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "ÉTAPE 3  ·  ÉTUDE DE L'EXISTANT", 10);
  addTitle(s, "Rien n'unit match + café + IA.");
  addFooter(s);

  const rows = [
    { n: "TheFork / OpenTable", ok: "Réservation resto mature", ko: "Pas de calendrier sport ni affluence match-day" },
    { n: "Billetterie stade", ok: "Tickets d'événement", ko: "Ignore les cafés de diffusion" },
    { n: "WhatsApp / Facebook", ok: "Simple, déjà adopté", ko: "Artisanal : pas d'occupation, pas de paiement" },
    { n: "Sites de cafés isolés", ok: "Identité du lieu", ko: "Silos, pas de vision multi-établissements" },
  ];
  s.addShape(pres.shapes.RECTANGLE, {
    x: MX, y: 1.48, w: W - 2 * MX, h: 0.5, fill: { color: COLOR.forest },
  });
  s.addText("Solution proche", {
    x: MX + 0.2, y: 1.48, w: 3.4, h: 0.5,
    fontFace: FONT.body, fontSize: 13, bold: true, color: COLOR.white, valign: "middle", margin: 0,
  });
  s.addText("Apport", {
    x: MX + 3.7, y: 1.48, w: 4.2, h: 0.5,
    fontFace: FONT.body, fontSize: 13, bold: true, color: COLOR.white, valign: "middle", margin: 0,
  });
  s.addText("Limite pour FanConnect", {
    x: MX + 8.0, y: 1.48, w: 4.4, h: 0.5,
    fontFace: FONT.body, fontSize: 13, bold: true, color: COLOR.white, valign: "middle", margin: 0,
  });

  rows.forEach((r, i) => {
    const y = 2.05 + i * 0.85;
    s.addShape(pres.shapes.RECTANGLE, {
      x: MX, y, w: W - 2 * MX, h: 0.78,
      fill: { color: i % 2 === 0 ? COLOR.white : COLOR.beige },
    });
    s.addText(r.n, {
      x: MX + 0.2, y, w: 3.4, h: 0.78,
      fontFace: FONT.body, fontSize: 14, bold: true, color: COLOR.ink, valign: "middle", margin: 0,
    });
    s.addText(r.ok, {
      x: MX + 3.7, y, w: 4.2, h: 0.78,
      fontFace: FONT.body, fontSize: 14, color: COLOR.body, valign: "middle", margin: 0,
    });
    s.addText(r.ko, {
      x: MX + 8.0, y, w: 4.4, h: 0.78,
      fontFace: FONT.body, fontSize: 14, color: COLOR.terracotta, valign: "middle", margin: 0,
    });
  });

  s.addText("Critique : pas d'intégration calendrier football + géolocalisation + occupation prédictive. FanConnect comble ce vide.", {
    x: MX, y: 5.55, w: W - 2 * MX, h: 1.2,
    fontFace: FONT.head, fontSize: 16, italic: true, color: COLOR.forestDeep, margin: 0,
  });
}

// ======================================================================
// 11  Cahier des charges
// ======================================================================
function slide11() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "ÉTAPE 4  ·  CAHIER DES CHARGES", 11);
  addTitle(s, "Objectifs, exigences, public, durée.");
  addFooter(s);

  const table = [
    [
      { text: "ID", options: { fill: { color: COLOR.forest }, color: COLOR.white, bold: true, align: "center" } },
      { text: "Exigence", options: { fill: { color: COLOR.forest }, color: COLOR.white, bold: true } },
      { text: "Acteur", options: { fill: { color: COLOR.forest }, color: COLOR.white, bold: true, align: "center" } },
    ],
    ["EF01", "Inscription / authentification JWT", "Tous"],
    ["EF02", "Match Center Coupe du Monde", "Fan"],
    ["EF03", "Recherche et filtrage des établissements", "Fan"],
    ["EF04", "Wizard de réservation multi-étapes", "Fan"],
    ["EF05", "Paiement en ligne Stripe", "Fan"],
    ["EF06", "Recommandations (proximité + affluence)", "Fan"],
    ["EF07", "Prédiction d'occupation (IA)", "Fan / Owner"],
    ["EF08", "Gestion business, occupation, check-in", "Owner"],
    ["EF09", "Modération, analytics, compétitions", "Admin"],
  ].map((row, i) => {
    if (i === 0) return row;
    const bg = i % 2 === 0 ? COLOR.beige : COLOR.white;
    return row.map((c, j) => ({
      text: c,
      options: {
        fill: { color: bg },
        color: COLOR.ink,
        align: j !== 1 ? "center" : "left",
        fontFace: FONT.body,
        fontSize: 12,
      },
    }));
  });

  s.addTable(table, {
    x: MX, y: 1.42, w: 8.3, h: 5.4,
    colW: [1.15, 5.35, 1.8],
    border: [{ pt: 0 }, { pt: 0 }, { pt: 0 }, { pt: 0 }],
    fontFace: FONT.body, fontSize: 12, color: COLOR.ink, valign: "middle",
  });

  roundCard(s, 9.2, 1.42, 3.45, 5.4, COLOR.white);
  s.addText("CADRE PROJET", {
    x: 9.42, y: 1.6, w: 3.05, h: 0.28,
    fontFace: FONT.body, fontSize: 11, color: COLOR.terracotta, charSpacing: 1.5, margin: 0,
  });
  const side = [
    { k: "Publics", v: "Fans, propriétaires de cafés, administrateurs." },
    { k: "Qualité UI", v: "Clarté, simplicité, design sombre." },
    { k: "Durée", v: "4 mois (avril → juillet 2026)." },
    { k: "Budget", v: "Stack open source / freemium, Stripe test." },
    { k: "ENF", v: "JWT, Docker, Flyway, Swagger, HTTPS prod." },
  ];
  side.forEach((it, i) => {
    const y = 2.0 + i * 0.9;
    s.addText(it.k, {
      x: 9.42, y, w: 3.05, h: 0.26,
      fontFace: FONT.head, fontSize: 14, color: COLOR.forest, margin: 0,
    });
    s.addText(it.v, {
      x: 9.42, y: y + 0.28, w: 3.05, h: 0.52,
      fontFace: FONT.body, fontSize: 13, color: COLOR.body, margin: 0,
    });
  });
}

// ======================================================================
// 12  Méthode
// ======================================================================
function slide12() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "ÉTAPE 5  ·  MÉTHODE DE MISE EN ŒUVRE", 12);
  addTitle(s, "Scrum adapté à un PFE solo.");
  addFooter(s);

  const steps = [
    { n: "01", t: "Product backlog", d: "Cahier des charges priorisé : auth, matchs, cafés, booking, IA." },
    { n: "02", t: "Sprint 2 semaines", d: "Objectif démontrable : une vertical slice à chaque revue." },
    { n: "03", t: "Daily implicite", d: "Journal de bord + Git ; points avec encadrants." },
    { n: "04", t: "Sprint review", d: "Démo : Match Center, wizard, Owner, prédiction." },
    { n: "05", t: "Rétrospective", d: "Ajuster le backlog (Stripe, Flyway, FanBot)." },
    { n: "06", t: "Incrément", d: "Chaque sprint livre du logiciel utilisable." },
  ];
  steps.forEach((st, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = MX + col * 4.15;
    const y = 1.5 + row * 2.55;
    roundCard(s, x, y, 3.95, 2.35, COLOR.white);
    s.addText(st.n, {
      x: x + 0.25, y: y + 0.22, w: 3.45, h: 0.35,
      fontFace: FONT.body, fontSize: 13, color: COLOR.terracotta, charSpacing: 1.5, margin: 0,
    });
    s.addText(st.t, {
      x: x + 0.25, y: y + 0.6, w: 3.45, h: 0.45,
      fontFace: FONT.head, fontSize: 18, color: COLOR.ink, margin: 0,
    });
    s.addText(st.d, {
      x: x + 0.25, y: y + 1.15, w: 3.45, h: 0.9,
      fontFace: FONT.body, fontSize: 14, color: COLOR.body, margin: 0,
    });
  });
}

// ======================================================================
// 13  Use cases
// ======================================================================
function slide13() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "ÉTAPE 6  ·  ANALYSE ET CONCEPTION", 13);
  addTitle(s, "Diagramme de cas d'utilisation");
  addFooter(s);

  const ucW = 6.4;
  const ucH = ucW * (522 / 703);
  s.addImage({
    path: path.join(DIAG, "01-cas-utilisation.png"),
    x: MX, y: 1.45, w: ucW, h: ucH,
    altText: "Cas d'utilisation FanConnect",
  });

  roundCard(s, 7.4, 1.45, 5.2, 5.35, COLOR.white);
  s.addText("SCÉNARIO NOMINAL", {
    x: 7.65, y: 1.65, w: 4.75, h: 0.28,
    fontFace: FONT.body, fontSize: 12, color: COLOR.terracotta, charSpacing: 1.5, margin: 0,
  });
  const seq = [
    "Le fan se connecte (JWT).",
    "Il choisit un match dans le Match Center.",
    "Le système recommande des cafés (distance + IA).",
    "Wizard : lieu, date, espace, table.",
    "Paiement Stripe → ticket QR.",
    "L'owner fait le check-in le jour J.",
  ];
  seq.forEach((t, i) => {
    const y = 2.1 + i * 0.7;
    s.addShape(pres.shapes.OVAL, {
      x: 7.7, y: y + 0.05, w: 0.38, h: 0.38, fill: { color: COLOR.forest },
    });
    s.addText(String(i + 1), {
      x: 7.7, y: y + 0.05, w: 0.38, h: 0.38,
      fontFace: FONT.body, fontSize: 12, bold: true, color: COLOR.white, align: "center", valign: "middle", margin: 0,
    });
    s.addText(t, {
      x: 8.25, y, w: 4.1, h: 0.55,
      fontFace: FONT.body, fontSize: 14, color: COLOR.body, valign: "middle", margin: 0,
    });
  });
}

// ======================================================================
// 14  Classes + BDD
// ======================================================================
function slide14() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "ÉTAPE 6–8  ·  CLASSES ET BASE DE DONNÉES", 14);
  addTitle(s, "Un fan réserve une table pour un match.");
  addFooter(s);

  const clW = 6.15;
  const clH = clW * (490 / 590);
  s.addImage({
    path: path.join(DIAG, "02-classes.png"),
    x: MX, y: 1.42, w: clW, h: Math.min(clH, 5.4),
    altText: "Diagramme de classes",
  });

  const ents = [
    ["User", "FAN / OWNER / ADMIN"],
    ["Business", "Café, capacité, statut"],
    ["FootballMatch", "Compétition, kickoff"],
    ["Reservation", "Statut, ticket QR"],
    ["Payment", "Stripe, commission"],
    ["Occupancy*", "Live + snapshots IA"],
  ];
  ents.forEach((e, i) => {
    const y = 1.42 + i * 0.85;
    roundCard(s, 7.2, y, 5.4, 0.75, COLOR.white);
    s.addText(e[0], {
      x: 7.4, y, w: 2.3, h: 0.75,
      fontFace: FONT.head, fontSize: 14, color: COLOR.forest, valign: "middle", margin: 0,
    });
    s.addText(e[1], {
      x: 9.7, y, w: 2.7, h: 0.75,
      fontFace: FONT.body, fontSize: 13, color: COLOR.body, valign: "middle", margin: 0,
    });
  });
}

// ======================================================================
// 15  Séquences
// ======================================================================
function slide15() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "ÉTAPE 6  ·  DIAGRAMMES DE SÉQUENCE", 15);
  addTitle(s, "Du login au ticket QR.");
  addFooter(s);

  const s1 = path.join(SHOTS, "03-sequence-1-crop.png");
  const s2 = path.join(DIAG, "04-sequence-2.png");
  const h1 = 4.55;
  const w1 = h1 * (510 / 351);
  const h2 = 4.55;
  const w2 = h2 * (499 / 495);

  s.addText("1  Connexion et choix", {
    x: MX, y: 1.4, w: 6, h: 0.3,
    fontFace: FONT.body, fontSize: 13, color: COLOR.forest, margin: 0,
  });
  s.addImage({ path: s1, x: MX, y: 1.75, w: Math.min(w1, 6.0), h: h1 * (Math.min(w1, 6.0) / w1), altText: "Séquence 1" });

  s.addText("2  Réservation, paiement, ticket", {
    x: 7.05, y: 1.4, w: 5.6, h: 0.3,
    fontFace: FONT.body, fontSize: 13, color: COLOR.forest, margin: 0,
  });
  s.addImage({ path: s2, x: 7.15, y: 1.75, w: Math.min(w2, 5.4), h: h2 * (Math.min(w2, 5.4) / w2), altText: "Séquence 2" });
}

// ======================================================================
// 16  Architecture
// ======================================================================
function slide16() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "ÉTAPE 7  ·  ARCHITECTURE N-TIERS", 16);
  addTitle(s, "3-tiers + microservice IA.");
  addFooter(s);

  const layers = [
    { t: "Présentation", d: "React 18  ·  Vite  ·  Tailwind\nSPA fan / owner / admin", c: COLOR.forest },
    { t: "Application", d: "Spring Boot 3  ·  Java 21\nREST, JWT, JPA, OpenAPI", c: COLOR.forestDeep },
    { t: "Données", d: "PostgreSQL 16  ·  Flyway\nusers, matchs, bookings", c: COLOR.ink },
  ];
  layers.forEach((l, i) => {
    const y = 1.48 + i * 1.35;
    roundCard(s, MX, y, 7.3, 1.22, COLOR.white);
    s.addShape(pres.shapes.RECTANGLE, {
      x: MX, y, w: 0.14, h: 1.22, fill: { color: l.c },
    });
    s.addText(l.t, {
      x: MX + 0.4, y: y + 0.15, w: 6.6, h: 0.35,
      fontFace: FONT.head, fontSize: 18, color: COLOR.ink, margin: 0,
    });
    s.addText(l.d, {
      x: MX + 0.4, y: y + 0.52, w: 6.6, h: 0.55,
      fontFace: FONT.body, fontSize: 14, color: COLOR.body, margin: 0,
    });
  });

  roundCard(s, 8.25, 1.48, 4.4, 2.55, COLOR.forest);
  s.addText("SERVICE IA", {
    x: 8.5, y: 1.68, w: 3.95, h: 0.28,
    fontFace: FONT.body, fontSize: 12, color: COLOR.moss, charSpacing: 1.8, margin: 0,
  });
  s.addText("FastAPI  ·  Python\nRandom Forest\n/predict  /train", {
    x: 8.5, y: 2.1, w: 3.95, h: 1.55,
    fontFace: FONT.body, fontSize: 16, color: COLOR.titleOnDark, margin: 0,
  });

  roundCard(s, 8.25, 4.22, 4.4, 2.5, COLOR.white);
  s.addText("INTÉGRATIONS", {
    x: 8.5, y: 4.4, w: 3.95, h: 0.28,
    fontFace: FONT.body, fontSize: 12, color: COLOR.terracotta, charSpacing: 1.8, margin: 0,
  });
  s.addText("Stripe (paiement PCI)\nDocker Compose\nNginx / HTTPS en prod", {
    x: 8.5, y: 4.8, w: 3.95, h: 1.55,
    fontFace: FONT.body, fontSize: 16, color: COLOR.body, margin: 0,
  });
}

// ======================================================================
// 17  Stack
// ======================================================================
function slide17() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "ÉTAPE 7  ·  CHOIX ET DIAGNOSTIC DES OUTILS", 17);
  addTitle(s, "Stack open source, niveau entreprise.");
  addFooter(s);

  const tools = [
    ["spring-boot.png", "Spring Boot", "API REST robuste"],
    ["react.png", "React 18", "SPA interfaces"],
    ["vite.png", "Vite", "Build frontend"],
    ["postgresql.png", "PostgreSQL", "SGBDR + Flyway"],
    ["python.png", "Python", "Modèle ML"],
    ["fastapi.png", "FastAPI", "Microservice IA"],
    ["stripe.png", "Stripe", "Paiement test"],
    ["jwt.png", "JWT", "Auth stateless"],
    ["docker.png", "Docker", "Reproductibilité"],
    ["swagger.png", "OpenAPI", "Doc interactive"],
  ];
  tools.forEach((t, i) => {
    const col = i % 5;
    const row = Math.floor(i / 5);
    const x = MX + col * 2.5;
    const y = 1.5 + row * 2.6;
    roundCard(s, x, y, 2.35, 2.4, COLOR.white);
    s.addImage({
      path: path.join(ICONS, t[0]),
      x: x + 0.72, y: y + 0.28, w: 0.9, h: 0.9,
    });
    s.addText(t[1], {
      x: x + 0.1, y: y + 1.28, w: 2.15, h: 0.4,
      fontFace: FONT.head, fontSize: 14, color: COLOR.ink, align: "center", margin: 0,
    });
    s.addText(t[2], {
      x: x + 0.1, y: y + 1.7, w: 2.15, h: 0.4,
      fontFace: FONT.body, fontSize: 12, color: COLOR.body, align: "center", margin: 0,
    });
  });
}

// ======================================================================
// 18  Réalisation fan
// ======================================================================
function slide18() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "ÉTAPE 9  ·  DÉVELOPPEMENT APPLICATIF", 18);
  addTitle(s, "Parcours fan : découvrir, réserver.");
  addFooter(s);

  const shots = [
    [path.join(SHOTS, "01-accueil-hero_16x9.jpg"), "Accueil — proposition de valeur"],
    [path.join(SHOTS, "03-liste-cafes_16x9.jpg"), "Lieux géolocalisés"],
    [path.join(SHOTS, "10-cafe-details-occupation_16x9.jpg"), "Fiche café + occupation"],
    [path.join(SHOTS, "08-booking-wizard_16x9.jpg"), "Wizard 8 étapes"],
  ];
  shots.forEach((sh, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = MX + col * 6.2;
    const y = 1.42 + row * 2.75;
    const iw = 5.95;
    const ih = 1.95;
    s.addImage({
      path: sh[0], x, y, w: iw, h: ih,
      sizing: { type: "cover", w: iw, h: ih },
    });
    s.addText(sh[1], {
      x, y: y + ih + 0.06, w: iw, h: 0.28,
      fontFace: FONT.body, fontSize: 12, color: COLOR.muted, margin: 0,
    });
  });
}

// ======================================================================
// 19  Owner / admin / paiement
// ======================================================================
function slide19() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "ÉTAPE 9  ·  TABLEAUX DE BORD ET PAIEMENT", 19);
  addTitle(s, "Owner, admin, encaissement Stripe.");
  addFooter(s);

  const shots = [
    [path.join(SHOTS, "09-owner-dashboard_16x9.jpg"), "Dashboard propriétaire"],
    [path.join(SHOTS, "05-admin-dashboard_16x9.jpg"), "Admin — analytics & validation"],
    [path.join(SHOTS, "12-paiement-stripe_16x9.jpg"), "Wizard — paiement et billet QR"],
  ];
  shots.forEach((sh, i) => {
    const x = MX + i * 4.15;
    const iw = 3.95;
    const ih = iw * 9 / 16;
    s.addImage({
      path: sh[0], x, y: 1.5, w: iw, h: ih,
      sizing: { type: "cover", w: iw, h: ih },
    });
    s.addText(sh[1], {
      x, y: 1.5 + ih + 0.12, w: iw, h: 0.4,
      fontFace: FONT.body, fontSize: 13, color: COLOR.body, margin: 0,
    });
  });

  roundCard(s, MX, 4.55, W - 2 * MX, 2.3, COLOR.white);
  s.addText("Ce que le développement couvre réellement", {
    x: MX + 0.35, y: 4.72, w: 11.5, h: 0.35,
    fontFace: FONT.head, fontSize: 16, color: COLOR.ink, margin: 0,
  });
  s.addText("Interfaces React par rôle  ·  opérations métier (booking, check-in, validation)  ·  persistance PostgreSQL  ·  états (PENDING → PAID)  ·  aide à la décision (occupation, analytics, recommandations).", {
    x: MX + 0.35, y: 5.2, w: 11.5, h: 1.25,
    fontFace: FONT.body, fontSize: 16, color: COLOR.body, margin: 0,
  });
}

// ======================================================================
// 20  IA
// ======================================================================
function slide20() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "ÉTAPE 9  ·  IA, CHATBOT, AUTOMATISATION", 20);
  addTitle(s, "L'intelligence n'est pas un gadget.");
  addFooter(s);

  const blocks = [
    { t: "Agent / modèle IA", d: "Microservice FastAPI. Random Forest sur occupation courante, historique, horizon avant kickoff, fraîcheur du report owner. Sorties : 1 h, 2 h, coup d'envoi + niveau de risque." },
    { t: "FanBot", d: "Assistant conversationnel pour guider la recherche de lieu (intentions : match, café, réservation). Fallback déterministe si l'API LLM est indisponible." },
    { t: "Recommandation", d: "Rayon 5 → 10 → 20 km, score distance × occupation. Codes métier (ex. CLOSEST_LOW_CROWD) exposés au frontend." },
    { t: "Data / ETL métier", d: "Snapshots d'occupation, seed de matchs démo, features versionnées. Le backend orchestre ; l'IA ne voit que des vecteurs." },
  ];
  blocks.forEach((b, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = MX + col * 6.2;
    const y = 1.48 + row * 2.55;
    roundCard(s, x, y, 5.95, 2.35, COLOR.white);
    s.addText(b.t, {
      x: x + 0.28, y: y + 0.22, w: 5.4, h: 0.4,
      fontFace: FONT.head, fontSize: 16, color: COLOR.forest, margin: 0,
    });
    s.addText(b.d, {
      x: x + 0.28, y: y + 0.7, w: 5.4, h: 1.4,
      fontFace: FONT.body, fontSize: 14, color: COLOR.body, margin: 0,
    });
  });
}

// ======================================================================
// 21  Mise en place
// ======================================================================
function slide21() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "ÉTAPE 10  ·  MISE EN PLACE ET TESTS", 21);
  addTitle(s, "Installer, configurer, vérifier.");
  addFooter(s);

  const cols = [
    { t: "Environnement", items: ["Docker Desktop + PostgreSQL", "Java 21 / Maven, Node 20", "Profils : dev, docker, test", "Secrets dans .env, jamais commités"] },
    { t: "Déploiement local", items: ["scripts/start-backend", "frontend : npm run dev", "ai-service FastAPI", "Swagger : /api/swagger-ui"] },
    { t: "Tests", items: ["Tests Spring (auth, match, FanBot)", "Validation DTO @Valid", "Parcours fan / owner / admin", "Stripe en mode test"] },
  ];
  cols.forEach((c, i) => {
    const x = MX + i * 4.15;
    roundCard(s, x, 1.5, 3.95, 5.3, i === 1 ? COLOR.forest : COLOR.white);
    const titleC = i === 1 ? COLOR.titleOnDark : COLOR.ink;
    const bodyC = i === 1 ? COLOR.subtitleOnDark : COLOR.body;
    s.addText(c.t, {
      x: x + 0.25, y: 1.7, w: 3.45, h: 0.5,
      fontFace: FONT.head, fontSize: 18, color: titleC, margin: 0,
    });
    c.items.forEach((it, j) => {
      s.addText(it, {
        x: x + 0.25, y: 2.4 + j * 0.9, w: 3.45, h: 0.75,
        fontFace: FONT.body, fontSize: 15, color: bodyC, margin: 0,
      });
    });
  });
}

// ======================================================================
// 22  Manuel
// ======================================================================
function slide22() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "ÉTAPE 11  ·  MANUEL D'UTILISATION", 22);
  addTitle(s, "Rôles, privilèges, formation.");
  addFooter(s);

  const roles = [
    { t: "FAN", p: "Register / login, Match Center, Places, wizard, paiement, notifications, ticket QR." },
    { t: "OWNER", p: "Créer un business, documents de vérification, occupation live, check-in, revenus." },
    { t: "ADMIN", p: "Approuver les cafés, users, compétitions, analytics globaux, paiements." },
  ];
  roles.forEach((r, i) => {
    const x = MX + i * 4.15;
    roundCard(s, x, 1.48, 3.95, 2.7, COLOR.white);
    chip(s, x + 0.25, 1.68, 1.35, 0.36, r.t, COLOR.forest, COLOR.white);
    s.addText(r.p, {
      x: x + 0.25, y: 2.2, w: 3.45, h: 1.7,
      fontFace: FONT.body, fontSize: 15, color: COLOR.body, margin: 0,
    });
  });

  roundCard(s, MX, 4.4, W - 2 * MX, 2.4, COLOR.forestDeep);
  s.addText("LIVRABLES DOCUMENTAIRES", {
    x: MX + 0.4, y: 4.58, w: 11.5, h: 0.3,
    fontFace: FONT.body, fontSize: 12, color: COLOR.moss, charSpacing: 1.8, margin: 0,
  });
  s.addText("Rapport PFE  ·  GUIDE_REPRISE_PROJET  ·  README + scripts de lancement  ·  Swagger  ·  comptes de démonstration (Fan / Owner / Admin) pour former un opérateur en quelques minutes.", {
    x: MX + 0.4, y: 5.0, w: 11.5, h: 1.4,
    fontFace: FONT.body, fontSize: 16, color: COLOR.titleOnDark, margin: 0,
  });
}

// ======================================================================
// 23  Divider P2
// ======================================================================
function slide23() {
  const s = pres.addSlide();
  s.background = { color: COLOR.forestDeep };
  s.addText("PARTIE 2", {
    x: MX, y: 2.15, w: 11, h: 0.4,
    fontFace: FONT.body, fontSize: 14, color: COLOR.moss, charSpacing: 3, margin: 0,
  });
  s.addText("Cinq règles de développement\ndes projets IT", {
    x: MX, y: 2.65, w: 12, h: 1.8,
    fontFace: FONT.head, fontSize: 36, color: COLOR.titleOnDark, margin: 0,
  });
  s.addText("Appliquées concrètement à FanConnect 2030 — pas un catalogue théorique.", {
    x: MX, y: 4.7, w: 11, h: 0.5,
    fontFace: FONT.body, fontSize: 16, color: COLOR.subtitleOnDark, margin: 0,
  });
}

// ======================================================================
// 24  Cinq règles
// ======================================================================
function slide24() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "PARTIE 2  ·  RÈGLES APPLIQUÉES", 24);
  addTitle(s, "Les cinq règles, dans le code.");
  addFooter(s);

  const rules = [
    { n: "01", t: "Dynamiser le cycle", d: "Git, Docker Compose, profils Spring, scripts start-*. Dev → test → run en boucle courte." },
    { n: "02", t: "Ouvert et innovant", d: "API REST documentée, stack open source, UI web responsive, prêt mobile / partenaires." },
    { n: "03", t: "Automatiser en agile", d: "Wizard de réservation, check-in QR, snapshots d'occupation, seed de matchs, FanBot." },
    { n: "04", t: "Découper en parties", d: "Frontend / backend / ai-service. Pas un monolithe unique : contrat HTTP entre services." },
    { n: "05", t: "Innover", d: "Prédiction Random Forest, recos géolocalisées, Match Center CDM, paiement Stripe, ticket QR." },
  ];
  rules.forEach((r, i) => {
    const y = 1.45 + i * 1.02;
    roundCard(s, MX, y, W - 2 * MX, 0.92, COLOR.white);
    s.addShape(pres.shapes.RECTANGLE, {
      x: MX, y, w: 0.12, h: 0.92, fill: { color: i === 4 ? COLOR.terracotta : COLOR.forest },
    });
    s.addText(r.n, {
      x: MX + 0.35, y, w: 0.7, h: 0.92,
      fontFace: FONT.head, fontSize: 18, color: COLOR.terracotta, valign: "middle", margin: 0,
    });
    s.addText(r.t, {
      x: MX + 1.15, y: y + 0.1, w: 3.4, h: 0.72,
      fontFace: FONT.head, fontSize: 16, color: COLOR.ink, valign: "middle", margin: 0,
    });
    s.addText(r.d, {
      x: MX + 4.7, y: y + 0.1, w: 7.4, h: 0.72,
      fontFace: FONT.body, fontSize: 14, color: COLOR.body, valign: "middle", margin: 0,
    });
  });
}

// ======================================================================
// 25  Conclusion — wait I had 25 as merci. Let me recount.
// 01 cover 02 plan 03 contexte 04 gmsoft 05 projet 06 div1 07 equipe
// 08 gantt 09 recherche 10 existant 11 cahier 12 methode 13 uc
// 14 classes 15 seq 16 arch 17 stack 18 fan 19 owner 20 ia
// 21 mise 22 manuel 23 div2 24 rules → 25 conclusion 26 merci
//
// TOTAL was 25. I have 24 functions so far + conclusion + merci = 26.
// I'll set TOTAL = 26 and add conclusion + merci.
// ======================================================================
function slide25() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "CONCLUSION ET PERSPECTIVES", 25);
  addTitle(s, "Un PFE livré, un socle pour 2030.");
  addFooter(s);

  const cols = [
    { t: "Réalisé", items: ["Plateforme full-stack démontrable", "3 rôles, paiement, ticket QR", "IA d'occupation + recos", "Docker, Swagger, rapport"] },
    { t: "Apports", items: ["Architecture n-tiers réelle", "Sécurité JWT / Stripe", "ML dans un produit métier", "Méthodologie IGA appliquée"] },
    { t: "Perspectives", items: ["FanBot conversationnel enrichi", "App mobile native", "Données réelles + suivi MAE", "Alertes matchs / occupation"] },
  ];
  cols.forEach((c, i) => {
    const x = MX + i * 4.15;
    roundCard(s, x, 1.5, 3.95, 5.3, i === 0 ? COLOR.forest : COLOR.white);
    const tc = i === 0 ? COLOR.titleOnDark : COLOR.ink;
    const ic = i === 0 ? COLOR.subtitleOnDark : COLOR.body;
    s.addText(c.t, {
      x: x + 0.25, y: 1.7, w: 3.45, h: 0.5,
      fontFace: FONT.head, fontSize: 20, color: tc, margin: 0,
    });
    c.items.forEach((it, j) => {
      s.addText(it, {
        x: x + 0.25, y: 2.4 + j * 0.95, w: 3.45, h: 0.8,
        fontFace: FONT.body, fontSize: 15, color: ic, margin: 0,
      });
    });
  });
}

function slide26() {
  const s = pres.addSlide();
  s.background = { color: COLOR.darkBg };
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.18, h: H, fill: { color: COLOR.terracotta },
  });
  s.addText("MERCI", {
    x: MX, y: 2.0, w: 12, h: 1.1,
    fontFace: FONT.head, fontSize: 64, color: COLOR.titleOnDark, margin: 0,
  });
  s.addText("Questions, remarques, démonstration.", {
    x: MX, y: 3.2, w: 12, h: 0.5,
    fontFace: FONT.head, fontSize: 22, italic: true, color: COLOR.terracottaSoft, margin: 0,
  });
  s.addShape(pres.shapes.LINE, {
    x: MX, y: 4.15, w: 5.5, h: 0,
    line: { color: COLOR.hairlineDark, width: 0.75 },
  });
  s.addText("FanConnect 2030  ·  PFE 5DLTI  ·  IGA\nEncadrant académique : M. Bouchib Riyami\nOrganisme : GM-Soft  ·  Année 2025 / 2026", {
    x: MX, y: 4.4, w: 11, h: 1.4,
    fontFace: FONT.body, fontSize: 16, color: COLOR.subtitleOnDark, margin: 0,
  });
}

slide01();
slide02();
slide03();
slide04();
slide05();
slide06();
slide07();
slide08();
slide09();
slide10();
slide11();
slide12();
slide13();
slide14();
slide15();
slide16();
slide17();
slide18();
slide19();
slide20();
slide21();
slide22();
slide23();
slide24();
slide25();
slide26();

const out = path.join(RAPPORT, "Presentation_PFE_FanConnect_2030.pptx");
pres.writeFile({ fileName: out }).then(() => {
  console.log("Wrote", out);
});
