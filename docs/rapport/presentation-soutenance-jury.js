/**
 * FanConnect 2030 — Soutenance PFE (17 diapos)
 * Plan : garde → entreprise (1 slide) → contexte → … → questions.
 *
 *   node docs/rapport/presentation-soutenance-jury.js
 */

const pptxgen = require("pptxgenjs");
const path = require("path");
const fs = require("fs");

const RAPPORT = __dirname;
const SHOTS = path.join(RAPPORT, "ppt-assets");
const DIAG = path.join(RAPPORT, "diagrams");
const ICONS = path.join(RAPPORT, "tech-icons");

const COLOR = {
  darkBg: "1B2420",
  cream: "F1EDE3",
  beige: "E8DFC8",
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
};

const FONT = { head: "Georgia", body: "Calibri" };
const W = 13.333;
const H = 7.5;
const MX = 0.7;
const TOTAL = 17;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.title = "Soutenance PFE — FanConnect 2030";
pres.author = "Kassimi — 5DLTI — IGA";
pres.subject = "Soutenance de Projet de Fin d'Études 2025/2026";

function shadowSoft() {
  return { type: "outer", color: "000000", blur: 8, offset: 2, angle: 135, opacity: 0.1 };
}
function addEyebrow(slide, label, n) {
  slide.addText(label, {
    x: MX, y: 0.28, w: 9.4, h: 0.26,
    fontFace: FONT.body, fontSize: 11, color: COLOR.muted, charSpacing: 2.2, margin: 0,
  });
  slide.addText(String(n).padStart(2, "0") + "  /  " + String(TOTAL).padStart(2, "0"), {
    x: W - MX - 1.6, y: 0.28, w: 1.6, h: 0.26,
    fontFace: FONT.body, fontSize: 11, color: COLOR.muted, align: "right", charSpacing: 1.5, margin: 0,
  });
}
function addFooter(slide) {
  slide.addShape(pres.shapes.LINE, {
    x: MX, y: 7.08, w: W - 2 * MX, h: 0,
    line: { color: COLOR.hairline, width: 0.75 },
  });
  slide.addText("SOUTENANCE PFE   ·   FANCONNECT 2030   ·   GM-SOFT  ·   IGA 2025 / 2026", {
    x: MX, y: 7.16, w: 11.9, h: 0.22,
    fontFace: FONT.body, fontSize: 10, color: COLOR.muted, charSpacing: 0.5, margin: 0,
  });
}
function addTitle(slide, text, opts = {}) {
  const { y = 0.56, h = 0.62, size = 26, runs = null } = opts;
  if (runs) {
    slide.addText(runs, { x: MX, y, w: W - 2 * MX, h, fontFace: FONT.head, fontSize: size, valign: "top", margin: 0 });
  } else {
    slide.addText(text, {
      x: MX, y, w: W - 2 * MX, h, fontFace: FONT.head, fontSize: size, color: COLOR.ink, valign: "top", margin: 0,
    });
  }
}
function card(slide, x, y, w, h, fill) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, fill: { color: fill || COLOR.white }, rectRadius: 0.08, shadow: shadowSoft(),
  });
}
function chip(slide, x, y, w, h, text, bg, fg) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: bg }, rectRadius: 0.06 });
  slide.addText(text, {
    x, y, w, h, fontFace: FONT.body, fontSize: 11, bold: true, color: fg,
    align: "center", valign: "middle", margin: 0,
  });
}
function notes(slide, text) {
  slide.addNotes(text);
}

// ======================================================================
// 01 Page de garde
// ======================================================================
function s01() {
  const s = pres.addSlide();
  s.background = { color: COLOR.darkBg };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.18, h: H, fill: { color: COLOR.terracotta } });

  s.addText("INSTITUT DE GÉNIE APPLIQUÉ   ·   CYCLE INGÉNIEUR 5DLTI", {
    x: MX, y: 0.42, w: 8, h: 0.26,
    fontFace: FONT.body, fontSize: 12, color: COLOR.mutedLight, charSpacing: 1.6, margin: 0,
  });
  chip(s, MX, 0.86, 4.45, 0.36, "SOUTENANCE DE PFE  ·  2025 / 2026", COLOR.forestDeep, COLOR.titleOnDark);

  s.addText("FanConnect 2030", {
    x: MX, y: 1.42, w: 7.4, h: 0.8,
    fontFace: FONT.head, fontSize: 38, color: COLOR.titleOnDark, margin: 0,
  });
  s.addText("Plateforme intelligente de réservation de cafés\npour regarder les matchs — Coupe du Monde 2030", {
    x: MX, y: 2.28, w: 7.2, h: 0.85,
    fontFace: FONT.body, fontSize: 16, color: COLOR.subtitleOnDark, margin: 0,
  });

  s.addImage({
    path: path.join(SHOTS, "01-accueil-hero_16x9.jpg"),
    x: 8.2, y: 1.15, w: 4.45, h: 4.45 * 9 / 16,
    sizing: { type: "cover", w: 4.45, h: 4.45 * 9 / 16 },
  });

  s.addShape(pres.shapes.LINE, {
    x: MX, y: 4.55, w: 7.2, h: 0, line: { color: COLOR.hairlineDark, width: 0.75 },
  });
  const meta = [
    { k: "PRÉSENTÉ PAR", v: "Kassimi" },
    { k: "ENCADRANT", v: "M. Bouchib Riyami" },
    { k: "ORGANISME", v: "GM-Soft  ·  Béni Mellal" },
  ];
  meta.forEach((m, i) => {
    const x = MX + i * 4.05;
    s.addText(m.k, {
      x, y: 4.78, w: 3.85, h: 0.2,
      fontFace: FONT.body, fontSize: 10, color: COLOR.mutedLight, charSpacing: 1.3, margin: 0,
    });
    s.addText(m.v, {
      x, y: 5.02, w: 3.85, h: 0.32,
      fontFace: FONT.body, fontSize: 15, bold: true, color: COLOR.titleOnDark, margin: 0,
    });
  });
  s.addText("Stage Pôle Développement  ·  Année universitaire 2025 / 2026", {
    x: MX, y: 6.55, w: 12, h: 0.28,
    fontFace: FONT.body, fontSize: 13, color: COLOR.mutedLight, margin: 0,
  });
  notes(s, "Saluer le jury. Une phrase : FanConnect relie match, café et réservation, réalisé en stage chez GM-Soft Béni Mellal. Enchaîner sur l'entreprise, 40 secondes.");
}

// ======================================================================
// 02 Entreprise d'accueil — UNE SEULE SLIDE
// ======================================================================
function s02() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "ENTREPRISE D'ACCUEIL", 2);
  addTitle(s, "GM-Soft — German Moroccan Software");
  addFooter(s);

  card(s, MX, 1.32, 4.15, 3.55, COLOR.forestDeep);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: MX + 0.28, y: 1.55, w: 1.15, h: 1.15, fill: { color: COLOR.forest }, rectRadius: 0.12,
  });
  s.addText("GM", {
    x: MX + 0.28, y: 1.55, w: 1.15, h: 1.15,
    fontFace: FONT.head, fontSize: 22, color: COLOR.titleOnDark, align: "center", valign: "middle", margin: 0,
  });
  s.addText("GM-SOFT", {
    x: MX + 1.55, y: 1.7, w: 2.35, h: 0.45,
    fontFace: FONT.head, fontSize: 20, color: COLOR.titleOnDark, margin: 0,
  });
  s.addText("Made in Germany", {
    x: MX + 1.55, y: 2.18, w: 2.35, h: 0.28,
    fontFace: FONT.body, fontSize: 12, color: COLOR.moss, margin: 0,
  });
  s.addText("SSII maroco-allemande.\nConception, intégration et évolution de logiciels métier (ERP, POS, café, hôtel, web / mobile).", {
    x: MX + 0.28, y: 2.95, w: 3.6, h: 1.55,
    fontFace: FONT.body, fontSize: 14, color: COLOR.subtitleOnDark, margin: 0,
  });

  const facts = [
    { k: "Siège", v: "Béni Mellal — Bd Hassan II" },
    { k: "Sites", v: "Casa, Rabat, Allemagne" },
    { k: "Création", v: "2014  ·  SARL  ·  +10 ans" },
    { k: "Solutions", v: "GM-ERP, GM-POS, GM-CAFE, GM-HOTEL" },
  ];
  facts.forEach((f, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 5.1 + col * 3.95;
    const y = 1.32 + row * 1.75;
    card(s, x, y, 3.8, 1.6, COLOR.white);
    s.addText(f.k, {
      x: x + 0.22, y: y + 0.22, w: 3.35, h: 0.28,
      fontFace: FONT.body, fontSize: 12, color: COLOR.terracotta, charSpacing: 1.2, margin: 0,
    });
    s.addText(f.v, {
      x: x + 0.22, y: y + 0.58, w: 3.35, h: 0.75,
      fontFace: FONT.body, fontSize: 15, color: COLOR.body, margin: 0,
    });
  });

  card(s, MX, 5.05, 6.05, 1.8, COLOR.white);
  s.addText("ÉQUIPE D'ACCUEIL", {
    x: MX + 0.25, y: 5.18, w: 5.55, h: 0.24,
    fontFace: FONT.body, fontSize: 11, color: COLOR.terracotta, charSpacing: 1.3, margin: 0,
  });
  s.addText("Pôle Développement  ·  lien métier GM-CAFE", {
    x: MX + 0.25, y: 5.48, w: 5.55, h: 1.05,
    fontFace: FONT.body, fontSize: 16, color: COLOR.ink, margin: 0,
  });

  card(s, 7.0, 5.05, 5.6, 1.8, COLOR.forest);
  s.addText("MON RÔLE", {
    x: 7.25, y: 5.18, w: 5.15, h: 0.24,
    fontFace: FONT.body, fontSize: 11, color: COLOR.moss, charSpacing: 1.3, margin: 0,
  });
  s.addText("Conception, développement full-stack, service IA d'occupation, documentation du PFE.", {
    x: 7.25, y: 5.48, w: 5.15, h: 1.1,
    fontFace: FONT.body, fontSize: 15, color: COLOR.titleOnDark, margin: 0,
  });
  notes(s, "40 secondes max. Nom, siège Béni Mellal, solutions GM-CAFE. Ton rôle : full-stack + IA. Puis le projet.");
}

// ======================================================================
// 03 Contexte
// ======================================================================
function s03() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "CONTEXTE DU PROJET", 3);
  addTitle(s, null, {
    runs: [
      { text: "Le match se joue aussi ", options: { color: COLOR.ink } },
      { text: "au café.", options: { color: COLOR.terracotta, italic: true } },
    ],
  });
  addFooter(s);

  s.addText("À l'approche de la Coupe du Monde 2030 au Maroc, les supporters cherchent un lieu proche et disponible. Les cafés n'ont pas d'outil pour gérer réservations, occupation et jour de match. WhatsApp reste la norme.", {
    x: MX, y: 1.32, w: 12, h: 0.95,
    fontFace: FONT.body, fontSize: 16, color: COLOR.body, margin: 0,
  });

  const stats = [
    { n: "2030", l: "Coupe du Monde\nau Maroc" },
    { n: "3 rôles", l: "Fan, Owner,\nAdmin" },
    { n: "1 plateforme", l: "Match + lieu\n+ paiement + IA" },
    { n: "4 mois", l: "Stage GM-Soft\nAvril → Juillet" },
  ];
  stats.forEach((st, i) => {
    const x = MX + i * 3.15;
    card(s, x, 2.4, 3.0, 2.15, COLOR.white);
    s.addText(st.n, {
      x, y: 2.55, w: 3.0, h: 0.7,
      fontFace: FONT.head, fontSize: 24, color: COLOR.forest, align: "center", margin: 0,
    });
    s.addText(st.l, {
      x: x + 0.15, y: 3.3, w: 2.7, h: 1.0,
      fontFace: FONT.body, fontSize: 14, color: COLOR.body, align: "center", margin: 0,
    });
  });

  card(s, MX, 4.75, W - 2 * MX, 2.05, COLOR.forestDeep);
  s.addText("FanConnect 2030 prolonge GM-CAFE : digitaliser le café le jour du match — calendrier sportif, géolocalisation, réservation, paiement et occupation prédictive.", {
    x: MX + 0.4, y: 5.05, w: 11.3, h: 1.45,
    fontFace: FONT.head, fontSize: 18, italic: true, color: COLOR.titleOnDark, margin: 0,
  });
  notes(s, "Contexte métier, pas l'entreprise. CDM 2030, cafés saturés, pas d'outil. Lien GM-CAFE en une phrase.");
}

// ======================================================================
// 04 Problématique
// ======================================================================
function s04() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "PROBLÉMATIQUE", 4);
  addTitle(s, "La question du PFE");
  addFooter(s);

  card(s, MX, 1.32, W - 2 * MX, 2.15, COLOR.forestDeep);
  s.addText("Comment concevoir une plateforme fiable, sécurisée et intelligente permettant aux supporters de réserver un lieu adapté pour un match, tout en aidant les cafés à anticiper l'affluence — dans le contexte de la CDM 2030 ?", {
    x: MX + 0.4, y: 1.52, w: 11.4, h: 1.75,
    fontFace: FONT.head, fontSize: 20, italic: true, color: COLOR.titleOnDark, margin: 0,
  });

  const qs = [
    { t: "Métier", d: "Unifier match, lieu, table et paiement dans un seul parcours." },
    { t: "Occupation", d: "Estimer l'affluence avant le coup d'envoi." },
    { t: "Architecture", d: "Séparer API métier, interface et service d'apprentissage." },
  ];
  qs.forEach((q, i) => {
    const x = MX + i * 4.15;
    card(s, x, 3.7, 4.0, 3.05, COLOR.white);
    s.addText(q.t, {
      x: x + 0.25, y: 3.92, w: 3.5, h: 0.45,
      fontFace: FONT.head, fontSize: 18, color: COLOR.forest, margin: 0,
    });
    s.addText(q.d, {
      x: x + 0.25, y: 4.5, w: 3.5, h: 1.85,
      fontFace: FONT.body, fontSize: 16, color: COLOR.body, margin: 0,
    });
  });
  notes(s, "Lire la problématique une fois. Les trois axes structurent la suite.");
}

// ======================================================================
// 05 Objectifs
// ======================================================================
function s05() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "OBJECTIFS", 5);
  addTitle(s, "Un objectif général, quatre cibles.");
  addFooter(s);

  card(s, MX, 1.3, W - 2 * MX, 1.15, COLOR.white);
  s.addText("Concevoir et réaliser une plateforme web sécurisée de réservation de cafés pour le jour de match, avec recommandation géolocalisée et prédiction d'occupation.", {
    x: MX + 0.3, y: 1.48, w: 11.5, h: 0.85,
    fontFace: FONT.body, fontSize: 16, color: COLOR.body, margin: 0,
  });

  const objs = [
    { n: "01", t: "Parcours fan", d: "Match → lieu → table → paiement → ticket QR." },
    { n: "02", t: "Outil owner", d: "Établissement, occupation live, check-in." },
    { n: "03", t: "Pilotage admin", d: "Validation, analytics, compétitions." },
    { n: "04", t: "IA utile", d: "Prédiction d'affluence + recommandation." },
  ];
  objs.forEach((o, i) => {
    const x = MX + i * 3.15;
    card(s, x, 2.65, 3.0, 2.15, COLOR.white);
    s.addText(o.n, {
      x: x + 0.2, y: 2.8, w: 2.6, h: 0.28,
      fontFace: FONT.body, fontSize: 12, color: COLOR.terracotta, charSpacing: 1.3, margin: 0,
    });
    s.addText(o.t, {
      x: x + 0.2, y: 3.15, w: 2.6, h: 0.4,
      fontFace: FONT.head, fontSize: 16, color: COLOR.ink, margin: 0,
    });
    s.addText(o.d, {
      x: x + 0.2, y: 3.62, w: 2.6, h: 0.9,
      fontFace: FONT.body, fontSize: 14, color: COLOR.body, margin: 0,
    });
  });

  card(s, MX, 5.02, 6.05, 1.8, COLOR.forest);
  s.addText("DANS LE PÉRIMÈTRE", {
    x: MX + 0.25, y: 5.16, w: 5.55, h: 0.26,
    fontFace: FONT.body, fontSize: 11, color: COLOR.moss, charSpacing: 1.3, margin: 0,
  });
  s.addText("Web SPA, API REST, Stripe test, IA d'occupation, Docker, 3 rôles.", {
    x: MX + 0.25, y: 5.5, w: 5.55, h: 1.05,
    fontFace: FONT.body, fontSize: 15, color: COLOR.titleOnDark, margin: 0,
  });
  card(s, 7.0, 5.02, 5.6, 1.8, COLOR.white);
  s.addText("HORS PÉRIMÈTRE", {
    x: 7.25, y: 5.16, w: 5.15, h: 0.26,
    fontFace: FONT.body, fontSize: 11, color: COLOR.terracotta, charSpacing: 1.3, margin: 0,
  });
  s.addText("Application mobile native, Stripe live, billetterie stade.", {
    x: 7.25, y: 5.5, w: 5.15, h: 1.05,
    fontFace: FONT.body, fontSize: 15, color: COLOR.body, margin: 0,
  });
  notes(s, "Périmètre net : ce qui est livré ET ce qui est exclu.");
}

// ======================================================================
// 06 Analyse des besoins
// ======================================================================
function s06() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "ANALYSE DES BESOINS", 6);
  addTitle(s, "Le trou : match + café + IA.");
  addFooter(s);

  s.addShape(pres.shapes.RECTANGLE, {
    x: MX, y: 1.32, w: W - 2 * MX, h: 0.46, fill: { color: COLOR.forest },
  });
  ["Solution", "Ce qu'elle fait", "Ce qui manque"].forEach((h, i) => {
    const x = MX + 0.2 + [0, 3.5, 7.7][i];
    s.addText(h, {
      x, y: 1.32, w: i === 2 ? 4.2 : 3.3, h: 0.46,
      fontFace: FONT.body, fontSize: 13, bold: true, color: COLOR.white, valign: "middle", margin: 0,
    });
  });
  const rows = [
    ["TheFork / OpenTable", "Réservation resto", "Pas de calendrier sport"],
    ["Billetterie stade", "Tickets d'événement", "Ignore les cafés de diffusion"],
    ["WhatsApp / Facebook", "Simple, déjà adopté", "Pas d'occupation ni de paiement"],
    ["Sites de cafés isolés", "Identité du lieu", "Pas de vision multi-établissements"],
  ];
  rows.forEach((r, i) => {
    const y = 1.84 + i * 0.9;
    s.addShape(pres.shapes.RECTANGLE, {
      x: MX, y, w: W - 2 * MX, h: 0.84,
      fill: { color: i % 2 === 0 ? COLOR.white : COLOR.beige },
    });
    s.addText(r[0], {
      x: MX + 0.2, y, w: 3.3, h: 0.84,
      fontFace: FONT.body, fontSize: 15, bold: true, color: COLOR.ink, valign: "middle", margin: 0,
    });
    s.addText(r[1], {
      x: MX + 3.7, y, w: 4.0, h: 0.84,
      fontFace: FONT.body, fontSize: 15, color: COLOR.body, valign: "middle", margin: 0,
    });
    s.addText(r[2], {
      x: MX + 7.9, y, w: 4.4, h: 0.84,
      fontFace: FONT.body, fontSize: 15, color: COLOR.terracotta, valign: "middle", margin: 0,
    });
  });
  s.addText("Aucune offre n'unit calendrier football, géolocalisation, réservation, paiement et occupation prédictive.", {
    x: MX, y: 5.55, w: W - 2 * MX, h: 1.2,
    fontFace: FONT.head, fontSize: 16, italic: true, color: COLOR.forestDeep, margin: 0,
  });
  notes(s, "TheFork est fort sur le resto, pas sur le jour de match. Le besoin est à l'intersection.");
}

// ======================================================================
// 07 Fonctionnalités
// ======================================================================
function s07() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "FONCTIONNALITÉS", 7);
  addTitle(s, "Neuf exigences, trois acteurs.");
  addFooter(s);

  const table = [
    [
      { text: "ID", options: { fill: { color: COLOR.forest }, color: COLOR.white, bold: true, align: "center" } },
      { text: "Fonctionnalité", options: { fill: { color: COLOR.forest }, color: COLOR.white, bold: true } },
      { text: "Acteur", options: { fill: { color: COLOR.forest }, color: COLOR.white, bold: true, align: "center" } },
    ],
    ["EF01", "Inscription et authentification JWT", "Tous"],
    ["EF02", "Match Center Coupe du Monde", "Fan"],
    ["EF03", "Recherche et filtrage des établissements", "Fan"],
    ["EF04", "Wizard de réservation multi-étapes", "Fan"],
    ["EF05", "Paiement en ligne Stripe", "Fan"],
    ["EF06", "Recommandations (proximité + affluence)", "Fan"],
    ["EF07", "Prédiction d'occupation (IA)", "Fan / Owner"],
    ["EF08", "Gestion business, occupation, check-in QR", "Owner"],
    ["EF09", "Modération, analytics, compétitions", "Admin"],
  ].map((row, i) => {
    if (i === 0) return row;
    const bg = i % 2 === 0 ? COLOR.beige : COLOR.white;
    return row.map((c, j) => ({
      text: c,
      options: {
        fill: { color: bg }, color: COLOR.ink,
        align: j !== 1 ? "center" : "left",
        fontFace: FONT.body, fontSize: 13,
      },
    }));
  });

  s.addTable(table, {
    x: MX, y: 1.28, w: 8.35, h: 5.5,
    colW: [1.2, 5.25, 1.9],
    border: [{ pt: 0 }, { pt: 0 }, { pt: 0 }, { pt: 0 }],
    fontFace: FONT.body, fontSize: 13, color: COLOR.ink, valign: "middle",
  });

  card(s, 9.25, 1.28, 3.4, 5.5, COLOR.white);
  s.addText("ENF", {
    x: 9.5, y: 1.48, w: 2.95, h: 0.26,
    fontFace: FONT.body, fontSize: 12, color: COLOR.terracotta, charSpacing: 1.5, margin: 0,
  });
  const enf = [
    { k: "Sécurité", v: "JWT, rôles, secrets .env" },
    { k: "Performance", v: "API métier < 2 s" },
    { k: "Maintenabilité", v: "Couches, Flyway, OpenAPI" },
    { k: "Portabilité", v: "Docker Compose" },
    { k: "UI", v: "Responsive, 3 espaces" },
    { k: "Paiement", v: "PCI-DSS via Stripe" },
  ];
  enf.forEach((e, i) => {
    const y = 1.88 + i * 0.75;
    s.addText(e.k, {
      x: 9.5, y, w: 2.95, h: 0.24,
      fontFace: FONT.head, fontSize: 14, color: COLOR.forest, margin: 0,
    });
    s.addText(e.v, {
      x: 9.5, y: y + 0.26, w: 2.95, h: 0.38,
      fontFace: FONT.body, fontSize: 13, color: COLOR.body, margin: 0,
    });
  });
  notes(s, "Cœur différenciant : EF04 à EF07. ENF à droite pour les questions sécurité / Docker.");
}

// ======================================================================
// 08 Conception UML
// ======================================================================
function s08() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "CONCEPTION UML", 8);
  addTitle(s, "Trois acteurs, un modèle métier.");
  addFooter(s);

  const ucW = 6.15;
  const ucH = Math.min(ucW * (522 / 703), 5.35);
  s.addImage({
    path: path.join(DIAG, "01-cas-utilisation.png"),
    x: MX, y: 1.28, w: ucW, h: ucH,
    altText: "Cas d'utilisation",
  });

  const ents = [
    ["User", "FAN / OWNER / ADMIN"],
    ["Business", "Café, capacité, statut"],
    ["FootballMatch", "Compétition, kickoff"],
    ["Reservation", "Statut, ticket QR"],
    ["Payment", "Stripe, commission"],
    ["Occupancy", "Live + snapshots IA"],
  ];
  ents.forEach((e, i) => {
    const y = 1.28 + i * 0.88;
    card(s, 7.15, y, 5.45, 0.78, COLOR.white);
    s.addText(e[0], {
      x: 7.35, y, w: 2.25, h: 0.78,
      fontFace: FONT.head, fontSize: 14, color: COLOR.forest, valign: "middle", margin: 0,
    });
    s.addText(e[1], {
      x: 9.65, y, w: 2.7, h: 0.78,
      fontFace: FONT.body, fontSize: 13, color: COLOR.body, valign: "middle", margin: 0,
    });
  });
  notes(s, "Phrase clé : un User réserve une table d'un Business pour un FootballMatch. Scénario : login → match → reco → wizard → Stripe → QR.");
}

// ======================================================================
// 09 Architecture
// ======================================================================
function s09() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "ARCHITECTURE", 9);
  addTitle(s, "3-tiers + microservice IA.");
  addFooter(s);

  const layers = [
    { t: "Présentation", d: "React 18 · Vite · Tailwind\nSPA Fan / Owner / Admin" },
    { t: "Application", d: "Spring Boot 3 · Java 21\nREST, JWT, JPA, OpenAPI" },
    { t: "Données", d: "PostgreSQL 16 · Flyway\nusers, matchs, bookings" },
  ];
  layers.forEach((l, i) => {
    const y = 1.32 + i * 1.72;
    card(s, MX, y, 7.35, 1.55, COLOR.white);
    s.addShape(pres.shapes.RECTANGLE, {
      x: MX, y, w: 0.14, h: 1.55, fill: { color: i === 2 ? COLOR.ink : COLOR.forest },
    });
    s.addText(l.t, {
      x: MX + 0.4, y: y + 0.2, w: 6.7, h: 0.4,
      fontFace: FONT.head, fontSize: 20, color: COLOR.ink, margin: 0,
    });
    s.addText(l.d, {
      x: MX + 0.4, y: y + 0.68, w: 6.7, h: 0.65,
      fontFace: FONT.body, fontSize: 15, color: COLOR.body, margin: 0,
    });
  });

  card(s, 8.3, 1.32, 4.3, 3.35, COLOR.forest);
  s.addText("SERVICE IA", {
    x: 8.55, y: 1.52, w: 3.85, h: 0.28,
    fontFace: FONT.body, fontSize: 12, color: COLOR.moss, charSpacing: 1.5, margin: 0,
  });
  s.addText("FastAPI · Python\nRandom Forest\n/predict  ·  /train\nAppelé par l'API Java", {
    x: 8.55, y: 1.95, w: 3.85, h: 2.4,
    fontFace: FONT.body, fontSize: 18, color: COLOR.titleOnDark, margin: 0,
  });
  card(s, 8.3, 4.88, 4.3, 1.85, COLOR.white);
  s.addText("INTÉGRATIONS", {
    x: 8.55, y: 5.05, w: 3.85, h: 0.26,
    fontFace: FONT.body, fontSize: 11, color: COLOR.terracotta, charSpacing: 1.3, margin: 0,
  });
  s.addText("Stripe  ·  Docker  ·  Nginx", {
    x: 8.55, y: 5.45, w: 3.85, h: 0.95,
    fontFace: FONT.body, fontSize: 16, color: COLOR.body, margin: 0,
  });
  notes(s, "Navigateur → Spring → Postgres. Spring appelle Python pour l'IA. Stripe jamais en base.");
}

// ======================================================================
// 10 Technologies
// ======================================================================
function s10() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "TECHNOLOGIES UTILISÉES", 10);
  addTitle(s, "Open source, niveau entreprise.");
  addFooter(s);

  const tools = [
    ["spring-boot.png", "Spring Boot", "API REST"],
    ["react.png", "React 18", "SPA"],
    ["postgresql.png", "PostgreSQL", "SGBDR"],
    ["python.png", "Python", "Modèle ML"],
    ["fastapi.png", "FastAPI", "Service IA"],
    ["stripe.png", "Stripe", "Paiement"],
    ["jwt.png", "JWT", "Auth"],
    ["docker.png", "Docker", "Déploiement"],
    ["swagger.png", "OpenAPI", "Documentation"],
    ["vite.png", "Vite", "Build UI"],
  ];
  tools.forEach((t, i) => {
    const col = i % 5;
    const row = Math.floor(i / 5);
    const x = MX + col * 2.5;
    const y = 1.35 + row * 2.6;
    card(s, x, y, 2.35, 2.4, COLOR.white);
    s.addImage({ path: path.join(ICONS, t[0]), x: x + 0.72, y: y + 0.28, w: 0.9, h: 0.9 });
    s.addText(t[1], {
      x: x + 0.1, y: y + 1.28, w: 2.15, h: 0.4,
      fontFace: FONT.head, fontSize: 14, color: COLOR.ink, align: "center", margin: 0,
    });
    s.addText(t[2], {
      x: x + 0.1, y: y + 1.7, w: 2.15, h: 0.4,
      fontFace: FONT.body, fontSize: 13, color: COLOR.body, align: "center", margin: 0,
    });
  });
  notes(s, "Justifier 2 choix : Spring (sécurité, JPA) ; FastAPI à part pour le cycle ML.");
}

// ======================================================================
// 11 Réalisation
// ======================================================================
function s11() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "RÉALISATION", 11);
  addTitle(s, "Découvrir, réserver, piloter.");
  addFooter(s);

  const shots = [
    [path.join(SHOTS, "01-accueil-hero_16x9.jpg"), "Accueil"],
    [path.join(SHOTS, "08-booking-wizard_16x9.jpg"), "Wizard de réservation"],
    [path.join(SHOTS, "09-owner-dashboard_16x9.jpg"), "Dashboard Owner"],
    [path.join(SHOTS, "05-admin-dashboard_16x9.jpg"), "Dashboard Admin"],
  ];
  shots.forEach((sh, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = MX + col * 6.2;
    const y = 1.28 + row * 2.7;
    const iw = 5.95;
    const ih = 2.05;
    s.addImage({ path: sh[0], x, y, w: iw, h: ih, sizing: { type: "cover", w: iw, h: ih } });
    s.addText(sh[1], {
      x, y: y + ih + 0.06, w: iw, h: 0.28,
      fontFace: FONT.body, fontSize: 13, color: COLOR.muted, margin: 0,
    });
  });
  notes(s, "40 secondes. La démo montrera le parcours. Ici : preuve visuelle des 3 espaces.");
}

// ======================================================================
// 12 Intelligence artificielle
// ======================================================================
function s12() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "INTELLIGENCE ARTIFICIELLE", 12);
  addTitle(s, "Prédire l'affluence, recommander le lieu.");
  addFooter(s);

  const blocks = [
    { t: "Modèle", d: "Random Forest (scikit-learn). Features : occupation courante, historique, horizon avant kickoff, fraîcheur du report owner." },
    { t: "Sorties", d: "Prédictions à 1 h, 2 h et coup d'envoi. Risque LOW / MEDIUM / HIGH + recommandation textuelle." },
    { t: "Recommandation", d: "Rayon 5 → 10 → 20 km. Score distance × occupation. Codes métier (CLOSEST_LOW_CROWD)." },
    { t: "FanBot", d: "Assistant d'intentions (match, café, réservation). Fallback déterministe si l'API LLM est indisponible." },
  ];
  blocks.forEach((b, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = MX + col * 6.2;
    const y = 1.32 + row * 2.55;
    card(s, x, y, 5.95, 2.35, COLOR.white);
    s.addText(b.t, {
      x: x + 0.3, y: y + 0.22, w: 5.35, h: 0.4,
      fontFace: FONT.head, fontSize: 18, color: COLOR.forest, margin: 0,
    });
    s.addText(b.d, {
      x: x + 0.3, y: y + 0.75, w: 5.35, h: 1.3,
      fontFace: FONT.body, fontSize: 15, color: COLOR.body, margin: 0,
    });
  });
  notes(s, "Honnêteté : données synthétiques + signaux métier. Fallback si Python est down. OccupancyEngine mélange report owner (15 min) et réservations.");
}

// ======================================================================
// 13 Démonstration
// ======================================================================
function s13() {
  const s = pres.addSlide();
  s.background = { color: COLOR.forestDeep };
  s.addText("DÉMONSTRATION", {
    x: MX, y: 1.45, w: 12, h: 0.32,
    fontFace: FONT.body, fontSize: 14, color: COLOR.moss, charSpacing: 3, margin: 0,
  });
  s.addText("Parcours à montrer", {
    x: MX, y: 1.9, w: 12, h: 0.7,
    fontFace: FONT.head, fontSize: 34, color: COLOR.titleOnDark, margin: 0,
  });
  const demo = [
    { n: "1", t: "Accueil → Match Center" },
    { n: "2", t: "Lieux sur la carte + occupation" },
    { n: "3", t: "Wizard + paiement test Stripe" },
    { n: "4", t: "Dashboard Owner / Admin" },
  ];
  demo.forEach((t, i) => {
    const x = MX + (i % 2) * 6.15;
    const y = 2.95 + Math.floor(i / 2) * 1.55;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w: 5.85, h: 1.35, fill: { color: "24332C" }, rectRadius: 0.08,
    });
    s.addText(t.n, {
      x: x + 0.25, y: y + 0.35, w: 0.55, h: 0.65,
      fontFace: FONT.head, fontSize: 24, color: COLOR.terracottaSoft, margin: 0,
    });
    s.addText(t.t, {
      x: x + 0.95, y: y + 0.35, w: 4.6, h: 0.65,
      fontFace: FONT.body, fontSize: 20, color: COLOR.titleOnDark, valign: "middle", margin: 0,
    });
  });
  notes(s, "App déjà ouverte. Comptes fan / owner / admin. Carte Stripe test 4242.");
}

// ======================================================================
// 14 Résultats
// ======================================================================
function s14() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "RÉSULTATS", 14);
  addTitle(s, "Un PFE livré et démontrable.");
  addFooter(s);

  const cols = [
    {
      t: "Livré", fill: COLOR.forest, tc: COLOR.titleOnDark, ic: COLOR.subtitleOnDark,
      items: ["Plateforme full-stack 3 rôles", "Stripe test + ticket QR", "IA d'occupation + recos", "Docker, Swagger, rapport"],
    },
    {
      t: "Apports", fill: COLOR.white, tc: COLOR.ink, ic: COLOR.body,
      items: ["Architecture n-tiers réelle", "Sécurité JWT / Stripe", "ML dans un produit métier", "Lien métier GM-CAFE"],
    },
    {
      t: "Validation", fill: COLOR.white, tc: COLOR.ink, ic: COLOR.body,
      items: ["Tests métier (occupation, geo, paiement)", "Parcours Fan / Owner / Admin", "Routes protégées par rôle", "Health checks API + IA"],
    },
  ];
  cols.forEach((c, i) => {
    const x = MX + i * 4.15;
    card(s, x, 1.32, 3.95, 5.4, c.fill);
    s.addText(c.t, {
      x: x + 0.25, y: 1.52, w: 3.45, h: 0.5,
      fontFace: FONT.head, fontSize: 22, color: c.tc, margin: 0,
    });
    c.items.forEach((it, j) => {
      s.addText(it, {
        x: x + 0.25, y: 2.25 + j * 1.0, w: 3.45, h: 0.85,
        fontFace: FONT.body, fontSize: 15, color: c.ic, margin: 0,
      });
    });
  });
  notes(s, "Ce qui est livré, pas ce qui est promis. Validation = tests + recette des 3 rôles.");
}

// ======================================================================
// 15 Limites & perspectives
// ======================================================================
function s15() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "LIMITES ET PERSPECTIVES", 15);
  addTitle(s, "Ce qui reste pour 2030.");
  addFooter(s);

  card(s, MX, 1.32, 6.05, 5.4, COLOR.white);
  s.addText("LIMITES", {
    x: MX + 0.3, y: 1.52, w: 5.45, h: 0.35,
    fontFace: FONT.body, fontSize: 13, color: COLOR.terracotta, charSpacing: 1.5, margin: 0,
  });
  const lim = [
    { t: "Données IA", d: "Modèle entraîné sans saison CDM réelle — MAE à recalibrer en production." },
    { t: "Paiement", d: "Stripe en mode test. Pas de webhooks live ni de facturation réelle." },
    { t: "Mobile", d: "SPA responsive, pas d'application native." },
    { t: "Couverture tests", d: "Règles métier unitaires ; parcours recettés manuellement." },
  ];
  lim.forEach((it, i) => {
    const y = 2.0 + i * 1.1;
    s.addText(it.t, {
      x: MX + 0.3, y, w: 5.45, h: 0.32,
      fontFace: FONT.head, fontSize: 16, color: COLOR.ink, margin: 0,
    });
    s.addText(it.d, {
      x: MX + 0.3, y: y + 0.35, w: 5.45, h: 0.6,
      fontFace: FONT.body, fontSize: 14, color: COLOR.body, margin: 0,
    });
  });

  card(s, 7.0, 1.32, 5.6, 5.4, COLOR.forest);
  s.addText("PERSPECTIVES", {
    x: 7.3, y: 1.52, w: 5.05, h: 0.35,
    fontFace: FONT.body, fontSize: 13, color: COLOR.moss, charSpacing: 1.5, margin: 0,
  });
  const next = [
    "FanBot conversationnel enrichi",
    "Application mobile native",
    "Données réelles + suivi MAE",
    "Alertes matchs / occupation",
  ];
  next.forEach((t, i) => {
    s.addText((i + 1) + ".  " + t, {
      x: 7.3, y: 2.15 + i * 1.0, w: 5.05, h: 0.75,
      fontFace: FONT.body, fontSize: 18, color: COLOR.titleOnDark, margin: 0,
    });
  });
  notes(s, "Le jury valorise les limites assumées. Ne pas promettre une prod 2030 déjà prête.");
}

// ======================================================================
// 16 Conclusion
// ======================================================================
function s16() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "CONCLUSION", 16);
  addTitle(s, "Réponse à la problématique.");
  addFooter(s);

  s.addText("Oui : une plateforme n-tiers, sécurisée par JWT et Stripe, permet au fan de réserver un café pour un match, et au propriétaire d'anticiper l'affluence grâce à un moteur d'occupation et un modèle Random Forest.", {
    x: MX, y: 1.32, w: 12, h: 1.25,
    fontFace: FONT.body, fontSize: 17, color: COLOR.body, margin: 0,
  });

  const take = [
    { n: "01", t: "Cadrage", d: "Besoin réel GM-CAFE × CDM 2030, périmètre tenu." },
    { n: "02", t: "Conception", d: "UML, 3-tiers, microservice IA découplé." },
    { n: "03", t: "Produit", d: "Trois rôles, parcours complet jusqu'au QR." },
    { n: "04", t: "Rigueur", d: "Tests métier, Docker, honnêteté sur l'IA." },
  ];
  take.forEach((t, i) => {
    const x = MX + i * 3.15;
    card(s, x, 2.8, 3.0, 3.9, i === 3 ? COLOR.forest : COLOR.white);
    const tc = i === 3 ? COLOR.titleOnDark : COLOR.ink;
    const dc = i === 3 ? COLOR.subtitleOnDark : COLOR.body;
    const nc = i === 3 ? COLOR.moss : COLOR.terracotta;
    s.addText(t.n, {
      x: x + 0.2, y: 3.05, w: 2.6, h: 0.35,
      fontFace: FONT.body, fontSize: 13, color: nc, charSpacing: 1.2, margin: 0,
    });
    s.addText(t.t, {
      x: x + 0.2, y: 3.55, w: 2.6, h: 0.55,
      fontFace: FONT.head, fontSize: 20, color: tc, margin: 0,
    });
    s.addText(t.d, {
      x: x + 0.2, y: 4.3, w: 2.6, h: 1.9,
      fontFace: FONT.body, fontSize: 15, color: dc, margin: 0,
    });
  });
  notes(s, "Refermer la boucle : relire la problématique (slide 4) et y répondre en une phrase.");
}

// ======================================================================
// 17 Questions
// ======================================================================
function s17() {
  const s = pres.addSlide();
  s.background = { color: COLOR.darkBg };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.18, h: H, fill: { color: COLOR.terracotta } });
  s.addText("MERCI", {
    x: MX, y: 1.7, w: 12, h: 1.0,
    fontFace: FONT.head, fontSize: 56, color: COLOR.titleOnDark, margin: 0,
  });
  s.addText("Questions du jury.", {
    x: MX, y: 2.8, w: 12, h: 0.5,
    fontFace: FONT.head, fontSize: 22, italic: true, color: COLOR.terracottaSoft, margin: 0,
  });
  s.addShape(pres.shapes.LINE, {
    x: MX, y: 3.55, w: 5.2, h: 0, line: { color: COLOR.hairlineDark, width: 0.75 },
  });
  s.addText("FanConnect 2030  ·  Soutenance PFE 5DLTI\nPrésenté par Kassimi\nEncadrant académique : M. Bouchib Riyami\nOrganisme : GM-Soft  ·  Béni Mellal  ·  2025 / 2026", {
    x: MX, y: 3.85, w: 11, h: 1.7,
    fontFace: FONT.body, fontSize: 16, color: COLOR.subtitleOnDark, margin: 0,
  });
  notes(s, "Rester debout. Répéter la question. Si vous ne savez pas : dire comment vous le mesureriez.");
}

[s01, s02, s03, s04, s05, s06, s07, s08, s09, s10, s11, s12, s13, s14, s15, s16, s17].forEach((fn) => fn());

const out = path.join(RAPPORT, "Presentation_Soutenance_Jury_FanConnect_2030.pptx");
const alias = path.join(RAPPORT, "Presentation_Soutenance_FanConnect_2030.pptx");
const rootCopy = path.join(RAPPORT, "..", "..", "Presentation_Soutenance_Jury_FanConnect_2030.pptx");

pres.writeFile({ fileName: out }).then(() => {
  fs.copyFileSync(out, alias);
  fs.copyFileSync(out, rootCopy);
  console.log("Wrote", out);
  console.log("Wrote", alias);
  console.log("Wrote", rootCopy);
});
