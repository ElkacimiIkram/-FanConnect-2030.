/**
 * FanConnect 2030 — Soutenance de PFE
 * Présentation orale (jury) — distincte de la trame méthodologique.
 *
 * Run from repo root:
 *   node docs/rapport/presentation-soutenance.js
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
  card: "F5EFE2",
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

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.title = "Soutenance PFE — FanConnect 2030";
pres.author = "Stagiaire 5DLTI — IGA";
pres.subject = "Soutenance de Projet de Fin d'Études 2025/2026";

const W = 13.333;
const H = 7.5;
const MX = 0.7;
const TOTAL = 20;

function shadowSoft() {
  return { type: "outer", color: "000000", blur: 8, offset: 2, angle: 135, opacity: 0.1 };
}
function addEyebrow(slide, label, n, onDark = false) {
  const c = onDark ? COLOR.mutedLight : COLOR.muted;
  slide.addText(label, {
    x: MX, y: 0.28, w: 9.4, h: 0.28,
    fontFace: FONT.body, fontSize: 11, color: c, charSpacing: 2.2, margin: 0,
  });
  slide.addText(String(n).padStart(2, "0") + "  /  " + String(TOTAL).padStart(2, "0"), {
    x: W - MX - 1.6, y: 0.28, w: 1.6, h: 0.28,
    fontFace: FONT.body, fontSize: 11, color: c, align: "right", charSpacing: 1.5, margin: 0,
  });
}
function addFooter(slide, onDark = false) {
  const c = onDark ? COLOR.mutedLight : COLOR.muted;
  slide.addShape(pres.shapes.LINE, {
    x: MX, y: 7.1, w: W - 2 * MX, h: 0,
    line: { color: onDark ? COLOR.hairlineDark : COLOR.hairline, width: 0.75 },
  });
  slide.addText("SOUTENANCE PFE   ·   FANCONNECT 2030   ·   IGA 2025 / 2026", {
    x: MX, y: 7.18, w: 11.5, h: 0.22,
    fontFace: FONT.body, fontSize: 10, color: c, charSpacing: 0.6, margin: 0,
  });
}
function addTitle(slide, text, opts = {}) {
  const { y = 0.6, h = 0.72, size = 28, w = W - 2 * MX, runs = null } = opts;
  if (runs) {
    slide.addText(runs, { x: MX, y, w, h, fontFace: FONT.head, fontSize: size, valign: "top", margin: 0 });
  } else {
    slide.addText(text, { x: MX, y, w, h, fontFace: FONT.head, fontSize: size, color: COLOR.ink, valign: "top", margin: 0 });
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

// ======================================================================
// 01 Cover
// ======================================================================
function s01() {
  const s = pres.addSlide();
  s.background = { color: COLOR.darkBg };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.18, h: H, fill: { color: COLOR.terracotta } });

  s.addText("INSTITUT DE GÉNIE APPLIQUÉ   ·   CYCLE INGÉNIEUR 5DLTI", {
    x: MX, y: 0.45, w: 7.4, h: 0.28,
    fontFace: FONT.body, fontSize: 12, color: COLOR.mutedLight, charSpacing: 1.8, margin: 0,
  });
  chip(s, MX, 0.95, 4.35, 0.38, "SOUTENANCE DE PFE  ·  2025 / 2026", COLOR.forestDeep, COLOR.titleOnDark);

  s.addText("FanConnect 2030", {
    x: MX, y: 1.55, w: 7.3, h: 0.95,
    fontFace: FONT.head, fontSize: 40, color: COLOR.titleOnDark, margin: 0,
  });
  s.addText("Réserver un café pour regarder un match.\nIntelligent, géolocalisé, prêt pour 2030.", {
    x: MX, y: 2.55, w: 7.2, h: 1.15,
    fontFace: FONT.body, fontSize: 18, color: COLOR.subtitleOnDark, margin: 0,
  });

  s.addImage({
    path: path.join(SHOTS, "01-accueil-hero_16x9.jpg"),
    x: 8.15, y: 1.35, w: 4.55, h: 4.55 * 9 / 16,
    sizing: { type: "cover", w: 4.55, h: 4.55 * 9 / 16 },
  });

  s.addShape(pres.shapes.LINE, {
    x: MX, y: 5.55, w: 7.2, h: 0, line: { color: COLOR.hairlineDark, width: 0.75 },
  });
  const meta = [
    { k: "PRÉSENTÉ PAR", v: "Stagiaire 5DLTI  —  à compléter" },
    { k: "ENCADRANT", v: "M. Bouchib Riyami" },
    { k: "ORGANISME", v: "GM-Soft" },
  ];
  meta.forEach((m, i) => {
    const x = MX + i * 4.05;
    s.addText(m.k, {
      x, y: 5.75, w: 3.8, h: 0.22,
      fontFace: FONT.body, fontSize: 10, color: COLOR.mutedLight, charSpacing: 1.4, margin: 0,
    });
    s.addText(m.v, {
      x, y: 6.02, w: 3.8, h: 0.32,
      fontFace: FONT.body, fontSize: 14, bold: true, color: COLOR.titleOnDark, margin: 0,
    });
  });
}

// ======================================================================
// 02 Plan
// ======================================================================
function s02() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "PLAN DE LA SOUTENANCE", 2);
  addTitle(s, null, {
    runs: [
      { text: "Quatre temps, ", options: { color: COLOR.ink } },
      { text: "un fil.", options: { color: COLOR.forest, italic: true } },
    ],
  });
  addFooter(s);

  const parts = [
    { n: "01", t: "Contexte", d: "CDM 2030, GM-Soft, problématique." },
    { n: "02", t: "Cadrage", d: "Existant, cahier des charges, planning." },
    { n: "03", t: "Conception", d: "UML, architecture n-tiers, stack." },
    { n: "04", t: "Réalisation", d: "Interfaces, IA, sécurité, bilan." },
  ];
  parts.forEach((p, i) => {
    const x = MX + i * 3.15;
    card(s, x, 1.55, 3.0, 4.95, i === 3 ? COLOR.forest : COLOR.white);
    const tc = i === 3 ? COLOR.titleOnDark : COLOR.ink;
    const dc = i === 3 ? COLOR.subtitleOnDark : COLOR.body;
    const nc = i === 3 ? COLOR.moss : COLOR.terracotta;
    s.addText(p.n, {
      x: x + 0.25, y: 1.85, w: 2.5, h: 0.55,
      fontFace: FONT.head, fontSize: 28, color: nc, margin: 0,
    });
    s.addText(p.t, {
      x: x + 0.25, y: 2.55, w: 2.5, h: 0.7,
      fontFace: FONT.head, fontSize: 22, color: tc, margin: 0,
    });
    s.addText(p.d, {
      x: x + 0.25, y: 3.35, w: 2.5, h: 1.5,
      fontFace: FONT.body, fontSize: 16, color: dc, margin: 0,
    });
  });
}

// ======================================================================
// 03 Contexte
// ======================================================================
function s03() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "01  ·  CONTEXTE", 3);
  addTitle(s, null, {
    runs: [
      { text: "Le match se joue aussi ", options: { color: COLOR.ink } },
      { text: "au café.", options: { color: COLOR.terracotta, italic: true } },
    ],
  });
  addFooter(s);

  s.addText("À l'approche de la Coupe du Monde 2030 au Maroc, les supporters cherchent un lieu proche, disponible et vivant pour suivre les rencontres. Les cafés, eux, n'ont pas d'outil pour gérer réservations, occupation et jour de match.", {
    x: MX, y: 1.45, w: 12, h: 1.15,
    fontFace: FONT.body, fontSize: 17, color: COLOR.body, margin: 0,
  });

  const stats = [
    { n: "2030", l: "Coupe du Monde\nau Maroc" },
    { n: "3", l: "acteurs : Fan,\nOwner, Admin" },
    { n: "1 plateforme", l: "Match + lieu\n+ paiement + IA" },
    { n: "4 mois", l: "PFE GM-Soft\nAvril → Juillet" },
  ];
  stats.forEach((st, i) => {
    const x = MX + i * 3.15;
    card(s, x, 2.8, 3.0, 2.15, COLOR.white);
    s.addText(st.n, {
      x, y: 2.95, w: 3.0, h: 0.7,
      fontFace: FONT.head, fontSize: 26, color: COLOR.forest, align: "center", margin: 0,
    });
    s.addText(st.l, {
      x: x + 0.15, y: 3.7, w: 2.7, h: 1.0,
      fontFace: FONT.body, fontSize: 14, color: COLOR.body, align: "center", margin: 0,
    });
  });

  s.addText("FanConnect 2030 prolonge l'offre GM-CAFE : digitaliser le café le jour du match.", {
    x: MX, y: 5.2, w: 12, h: 1.5,
    fontFace: FONT.head, fontSize: 18, italic: true, color: COLOR.forestDeep, margin: 0,
  });
}

// ======================================================================
// 04 GM-Soft
// ======================================================================
function s04() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "01  ·  ORGANISME D'ACCUEIL", 4);
  addTitle(s, "GM-Soft — SSII maroco-allemande");
  addFooter(s);

  const facts = [
    { t: "2014", d: "SARL, siège à Béni Mellal. Sites Casa, Rabat, Allemagne." },
    { t: "Métier", d: "ERP, web/mobile, café, hôtel, POS, sécurité, support." },
    { t: "Stage", d: "Pôle Développement. Lien direct avec GM-CAFE." },
    { t: "Exigence", d: "Livrable démontrable, architecture maintenable, sécurité." },
  ];
  facts.forEach((f, i) => {
    const y = 1.48 + i * 1.25;
    card(s, MX, y, 6.15, 1.12, COLOR.white);
    s.addText(f.t, {
      x: MX + 0.28, y: y + 0.14, w: 5.6, h: 0.32,
      fontFace: FONT.head, fontSize: 16, color: COLOR.terracotta, margin: 0,
    });
    s.addText(f.d, {
      x: MX + 0.28, y: y + 0.5, w: 5.6, h: 0.48,
      fontFace: FONT.body, fontSize: 14, color: COLOR.body, margin: 0,
    });
  });

  s.addImage({
    path: path.join(DIAG, "05-organigramme-gmsoft.png"),
    x: 7.1, y: 1.55, w: 5.5, h: 5.5 * (760 / 1500),
    altText: "Organigramme GM-Soft",
  });
}

// ======================================================================
// 05 Problématique
// ======================================================================
function s05() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "01  ·  PROBLÉMATIQUE", 5);
  addTitle(s, "La question du PFE");
  addFooter(s);

  card(s, MX, 1.5, W - 2 * MX, 2.35, COLOR.forestDeep);
  s.addText("Comment concevoir une plateforme fiable, sécurisée et intelligente permettant aux supporters de réserver un lieu adapté pour un match, tout en aidant les cafés à anticiper l'affluence — dans le contexte de la CDM 2030 ?", {
    x: MX + 0.45, y: 1.75, w: 11.3, h: 1.85,
    fontFace: FONT.head, fontSize: 20, italic: true, color: COLOR.titleOnDark, margin: 0,
  });

  const qs = [
    { t: "Occupation", d: "Quels signaux pour estimer le risque d'affluence avant le coup d'envoi ?" },
    { t: "Recommandation", d: "Comment choisir un lieu : distance, capacité, prédiction IA ?" },
    { t: "Architecture", d: "Comment séparer API métier, interface et service d'apprentissage ?" },
  ];
  qs.forEach((q, i) => {
    const x = MX + i * 4.15;
    card(s, x, 4.1, 4.0, 2.55, COLOR.white);
    s.addText(q.t, {
      x: x + 0.25, y: 4.28, w: 3.5, h: 0.4,
      fontFace: FONT.head, fontSize: 16, color: COLOR.forest, margin: 0,
    });
    s.addText(q.d, {
      x: x + 0.25, y: 4.8, w: 3.5, h: 1.5,
      fontFace: FONT.body, fontSize: 15, color: COLOR.body, margin: 0,
    });
  });
}

// ======================================================================
// 06 Existant
// ======================================================================
function s06() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "02  ·  ÉTUDE DE L'EXISTANT", 6);
  addTitle(s, "Le trou : match + café + IA.");
  addFooter(s);

  s.addShape(pres.shapes.RECTANGLE, {
    x: MX, y: 1.48, w: W - 2 * MX, h: 0.5, fill: { color: COLOR.forest },
  });
  ["Solution", "Ce qu'elle fait", "Ce qui manque"].forEach((h, i) => {
    const x = MX + 0.2 + [0, 3.5, 7.7][i];
    s.addText(h, {
      x, y: 1.48, w: i === 2 ? 4.2 : 3.3, h: 0.5,
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
    const y = 2.05 + i * 0.85;
    s.addShape(pres.shapes.RECTANGLE, {
      x: MX, y, w: W - 2 * MX, h: 0.78,
      fill: { color: i % 2 === 0 ? COLOR.white : COLOR.beige },
    });
    s.addText(r[0], {
      x: MX + 0.2, y, w: 3.3, h: 0.78,
      fontFace: FONT.body, fontSize: 14, bold: true, color: COLOR.ink, valign: "middle", margin: 0,
    });
    s.addText(r[1], {
      x: MX + 3.7, y, w: 4.0, h: 0.78,
      fontFace: FONT.body, fontSize: 14, color: COLOR.body, valign: "middle", margin: 0,
    });
    s.addText(r[2], {
      x: MX + 7.9, y, w: 4.4, h: 0.78,
      fontFace: FONT.body, fontSize: 14, color: COLOR.terracotta, valign: "middle", margin: 0,
    });
  });
  s.addText("FanConnect relie calendrier football, géolocalisation, réservation, paiement et occupation prédictive.", {
    x: MX, y: 5.55, w: W - 2 * MX, h: 1.2,
    fontFace: FONT.head, fontSize: 16, italic: true, color: COLOR.forestDeep, margin: 0,
  });
}

// ======================================================================
// 07 CDC
// ======================================================================
function s07() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "02  ·  CAHIER DES CHARGES", 7);
  addTitle(s, "Quatre objectifs, neuf exigences.");
  addFooter(s);

  const objs = [
    "Parcours fluide : match → lieu → réservation.",
    "Digitaliser l'occupation côté propriétaire.",
    "IA différenciante : prédiction + recommandation.",
    "Sécurité, scalabilité, maintenabilité.",
  ];
  objs.forEach((t, i) => {
    const y = 1.48 + i * 1.2;
    card(s, MX, y, 5.7, 1.08, COLOR.white);
    s.addShape(pres.shapes.OVAL, {
      x: MX + 0.22, y: y + 0.3, w: 0.48, h: 0.48, fill: { color: COLOR.forest },
    });
    s.addText(String(i + 1), {
      x: MX + 0.22, y: y + 0.3, w: 0.48, h: 0.48,
      fontFace: FONT.body, fontSize: 14, bold: true, color: COLOR.white, align: "center", valign: "middle", margin: 0,
    });
    s.addText(t, {
      x: MX + 0.9, y: y + 0.22, w: 4.5, h: 0.65,
      fontFace: FONT.body, fontSize: 15, color: COLOR.body, valign: "middle", margin: 0,
    });
  });

  const efs = [
    ["EF01–02", "Auth JWT  ·  Match Center"],
    ["EF03–05", "Recherche  ·  Wizard  ·  Stripe"],
    ["EF06–07", "Recos  ·  Prédiction IA"],
    ["EF08–09", "Owner  ·  Admin analytics"],
  ];
  efs.forEach((e, i) => {
    const y = 1.48 + i * 1.2;
    card(s, 7.05, y, 5.55, 1.08, i === 2 ? COLOR.forest : COLOR.white);
    const c1 = i === 2 ? COLOR.titleOnDark : COLOR.forest;
    const c2 = i === 2 ? COLOR.subtitleOnDark : COLOR.body;
    s.addText(e[0], {
      x: 7.3, y: y + 0.14, w: 5.1, h: 0.32,
      fontFace: FONT.head, fontSize: 15, color: c1, margin: 0,
    });
    s.addText(e[1], {
      x: 7.3, y: y + 0.5, w: 5.1, h: 0.4,
      fontFace: FONT.body, fontSize: 14, color: c2, margin: 0,
    });
  });
}

// ======================================================================
// 08 Gantt
// ======================================================================
function s08() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "02  ·  GESTION DE PROJET", 8);
  addTitle(s, "Scrum, 4 mois, sprints démontrables.");
  addFooter(s);

  let gw = 12.0;
  let gh = gw * (900 / 1600);
  if (gh > 5.35) {
    gh = 5.35;
    gw = gh * (1600 / 900);
  }
  s.addImage({
    path: path.join(ICONS, "gantt-fanconnect-4mois.png"),
    x: (W - gw) / 2, y: 1.42, w: gw, h: gh,
    altText: "Gantt FanConnect",
  });
}

// ======================================================================
// 09 Use cases
// ======================================================================
function s09() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "03  ·  ANALYSE — CAS D'UTILISATION", 9);
  addTitle(s, "Trois acteurs, un scénario.");
  addFooter(s);

  const ucW = 6.35;
  const ucH = ucW * (522 / 703);
  s.addImage({
    path: path.join(DIAG, "01-cas-utilisation.png"),
    x: MX, y: 1.42, w: ucW, h: Math.min(ucH, 5.4),
    altText: "Cas d'utilisation",
  });

  card(s, 7.35, 1.42, 5.25, 5.4, COLOR.white);
  s.addText("SCÉNARIO NOMINAL", {
    x: 7.6, y: 1.62, w: 4.8, h: 0.28,
    fontFace: FONT.body, fontSize: 12, color: COLOR.terracotta, charSpacing: 1.4, margin: 0,
  });
  const steps = [
    "Connexion JWT",
    "Choix du match",
    "Cafés recommandés (distance + IA)",
    "Wizard : lieu, espace, table",
    "Paiement Stripe → ticket QR",
    "Check-in owner le jour J",
  ];
  steps.forEach((t, i) => {
    const y = 2.08 + i * 0.72;
    s.addShape(pres.shapes.OVAL, {
      x: 7.65, y: y + 0.08, w: 0.4, h: 0.4, fill: { color: COLOR.forest },
    });
    s.addText(String(i + 1), {
      x: 7.65, y: y + 0.08, w: 0.4, h: 0.4,
      fontFace: FONT.body, fontSize: 12, bold: true, color: COLOR.white, align: "center", valign: "middle", margin: 0,
    });
    s.addText(t, {
      x: 8.2, y, w: 4.1, h: 0.55,
      fontFace: FONT.body, fontSize: 14, color: COLOR.body, valign: "middle", margin: 0,
    });
  });
}

// ======================================================================
// 10 Classes
// ======================================================================
function s10() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "03  ·  CONCEPTION — MODÈLE MÉTIER", 10);
  addTitle(s, "Un fan réserve une table pour un match.");
  addFooter(s);

  const clW = 6.15;
  const clH = Math.min(clW * (490 / 590), 5.4);
  s.addImage({
    path: path.join(DIAG, "02-classes.png"),
    x: MX, y: 1.42, w: clW, h: clH,
    altText: "Diagramme de classes",
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
    const y = 1.42 + i * 0.85;
    card(s, 7.2, y, 5.4, 0.75, COLOR.white);
    s.addText(e[0], {
      x: 7.4, y, w: 2.2, h: 0.75,
      fontFace: FONT.head, fontSize: 14, color: COLOR.forest, valign: "middle", margin: 0,
    });
    s.addText(e[1], {
      x: 9.65, y, w: 2.75, h: 0.75,
      fontFace: FONT.body, fontSize: 13, color: COLOR.body, valign: "middle", margin: 0,
    });
  });
}

// ======================================================================
// 11 Sequence
// ======================================================================
function s11() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "03  ·  CONCEPTION — SÉQUENCE", 11);
  addTitle(s, "Du login au ticket QR.");
  addFooter(s);

  s.addText("1  Connexion et choix", {
    x: MX, y: 1.4, w: 6, h: 0.28,
    fontFace: FONT.body, fontSize: 13, color: COLOR.forest, margin: 0,
  });
  s.addText("2  Réservation, paiement, ticket", {
    x: 7.05, y: 1.4, w: 5.6, h: 0.28,
    fontFace: FONT.body, fontSize: 13, color: COLOR.forest, margin: 0,
  });

  const s1 = path.join(SHOTS, "03-sequence-1-crop.png");
  const s2 = path.join(DIAG, "04-sequence-2.png");
  const maxH = 5.15;
  const w1 = Math.min(6.05, maxH * (510 / 351));
  const h1 = w1 * (351 / 510);
  const w2 = Math.min(5.4, maxH * (499 / 495));
  const h2 = w2 * (495 / 499);
  s.addImage({ path: s1, x: MX, y: 1.75, w: w1, h: h1, altText: "Séquence 1" });
  s.addImage({ path: s2, x: 7.15, y: 1.75, w: w2, h: h2, altText: "Séquence 2" });
}

// ======================================================================
// 12 Architecture
// ======================================================================
function s12() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "03  ·  ARCHITECTURE TECHNIQUE", 12);
  addTitle(s, "3-tiers + microservice IA.");
  addFooter(s);

  const layers = [
    { t: "Présentation", d: "React 18 · Vite · Tailwind\nSPA Fan / Owner / Admin" },
    { t: "Application", d: "Spring Boot 3 · Java 21\nREST, JWT, JPA, OpenAPI" },
    { t: "Données", d: "PostgreSQL 16 · Flyway\nusers, matchs, bookings" },
  ];
  layers.forEach((l, i) => {
    const y = 1.48 + i * 1.7;
    card(s, MX, y, 7.35, 1.52, COLOR.white);
    s.addShape(pres.shapes.RECTANGLE, {
      x: MX, y, w: 0.14, h: 1.52, fill: { color: i === 2 ? COLOR.ink : COLOR.forest },
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

  card(s, 8.3, 1.48, 4.3, 3.3, COLOR.forest);
  s.addText("SERVICE IA", {
    x: 8.55, y: 1.7, w: 3.85, h: 0.28,
    fontFace: FONT.body, fontSize: 12, color: COLOR.moss, charSpacing: 1.6, margin: 0,
  });
  s.addText("FastAPI · Python\nRandom Forest\n/predict  ·  /train", {
    x: 8.55, y: 2.15, w: 3.85, h: 2.2,
    fontFace: FONT.body, fontSize: 18, color: COLOR.titleOnDark, margin: 0,
  });

  card(s, 8.3, 5.0, 4.3, 1.6, COLOR.white);
  s.addText("Stripe  ·  Docker  ·  Nginx", {
    x: 8.55, y: 5.35, w: 3.85, h: 0.9,
    fontFace: FONT.body, fontSize: 16, color: COLOR.body, margin: 0,
  });
}

// ======================================================================
// 13 Stack
// ======================================================================
function s13() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "03  ·  CHOIX TECHNOLOGIQUES", 13);
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
    const y = 1.5 + row * 2.6;
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
}

// ======================================================================
// 14 Demo fan
// ======================================================================
function s14() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "04  ·  RÉALISATION — PARCOURS FAN", 14);
  addTitle(s, "Découvrir, choisir, réserver.");
  addFooter(s);

  const shots = [
    [path.join(SHOTS, "01-accueil-hero_16x9.jpg"), "Accueil"],
    [path.join(SHOTS, "03-liste-cafes_16x9.jpg"), "Lieux géolocalisés"],
    [path.join(SHOTS, "10-cafe-details-occupation_16x9.jpg"), "Fiche café"],
    [path.join(SHOTS, "08-booking-wizard_16x9.jpg"), "Wizard 8 étapes"],
  ];
  shots.forEach((sh, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = MX + col * 6.2;
    const y = 1.42 + row * 2.75;
    const iw = 5.95;
    const ih = 1.95;
    s.addImage({ path: sh[0], x, y, w: iw, h: ih, sizing: { type: "cover", w: iw, h: ih } });
    s.addText(sh[1], {
      x, y: y + ih + 0.06, w: iw, h: 0.28,
      fontFace: FONT.body, fontSize: 13, color: COLOR.muted, margin: 0,
    });
  });
}

// ======================================================================
// 15 Demo owner admin
// ======================================================================
function s15() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "04  ·  RÉALISATION — OWNER & ADMIN", 15);
  addTitle(s, "Gérer, valider, piloter.");
  addFooter(s);

  const shots = [
    [path.join(SHOTS, "09-owner-dashboard_16x9.jpg"), "Dashboard propriétaire"],
    [path.join(SHOTS, "05-admin-dashboard_16x9.jpg"), "Admin — analytics"],
    [path.join(SHOTS, "04-login_16x9.jpg"), "Authentification JWT"],
  ];
  shots.forEach((sh, i) => {
    const x = MX + i * 4.15;
    const iw = 3.95;
    const ih = iw * 9 / 16;
    s.addImage({ path: sh[0], x, y: 1.48, w: iw, h: ih, sizing: { type: "cover", w: iw, h: ih } });
    s.addText(sh[1], {
      x, y: 1.48 + ih + 0.12, w: iw, h: 0.38,
      fontFace: FONT.body, fontSize: 14, color: COLOR.body, margin: 0,
    });
  });

  card(s, MX, 4.55, W - 2 * MX, 2.25, COLOR.white);
  s.addText("Cœur métier livré", {
    x: MX + 0.4, y: 4.72, w: 11.5, h: 0.38,
    fontFace: FONT.head, fontSize: 18, color: COLOR.ink, margin: 0,
  });
  s.addText("Vérification documentaire des établissements  ·  occupation live  ·  check-in QR  ·  analytics par ville  ·  rôles FAN / OWNER / ADMIN isolés dans l'UI et l'API.", {
    x: MX + 0.4, y: 5.2, w: 11.5, h: 1.2,
    fontFace: FONT.body, fontSize: 16, color: COLOR.body, margin: 0,
  });
}

// ======================================================================
// 16 IA
// ======================================================================
function s16() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "04  ·  INTELLIGENCE ARTIFICIELLE", 16);
  addTitle(s, "Prédire l'affluence, recommander le lieu.");
  addFooter(s);

  const blocks = [
    { t: "Modèle", d: "Random Forest (scikit-learn). Features : occupation courante, historique, horizon avant kickoff, fraîcheur du report owner." },
    { t: "Sorties", d: "Prédictions à 1 h, 2 h et coup d'envoi. Niveau de risque + recommandation textuelle." },
    { t: "Recommandation", d: "Rayon 5 → 10 → 20 km. Score distance × occupation. Codes métier (CLOSEST_LOW_CROWD)." },
    { t: "FanBot", d: "Assistant d'intentions (match, café, réservation). Fallback déterministe si l'API LLM est indisponible." },
  ];
  blocks.forEach((b, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = MX + col * 6.2;
    const y = 1.48 + row * 2.55;
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
}

// ======================================================================
// 17 Sécurité
// ======================================================================
function s17() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "04  ·  SÉCURITÉ", 17);
  addTitle(s, "La surface d'attaque est découpée.");
  addFooter(s);

  const items = [
    { t: "Auth", d: "JWT stateless, Spring Security, rôles FAN / OWNER / ADMIN." },
    { t: "API", d: "DTO @Valid, exceptions centralisées, secrets dans .env." },
    { t: "Paiement", d: "Stripe PCI-DSS. Aucun numéro de carte stocké." },
    { t: "Données", d: "Flyway, uploads isolés, base accessible seulement via le backend." },
    { t: "Prod", d: "HTTPS, Nginx, CORS restrictif, rotation des secrets." },
    { t: "Métier", d: "Vérification documentaire owner avant mise en ligne." },
  ];
  items.forEach((it, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = MX + col * 4.15;
    const y = 1.5 + row * 2.55;
    card(s, x, y, 3.95, 2.35, COLOR.white);
    s.addText(it.t, {
      x: x + 0.25, y: y + 0.25, w: 3.45, h: 0.45,
      fontFace: FONT.head, fontSize: 18, color: COLOR.forest, margin: 0,
    });
    s.addText(it.d, {
      x: x + 0.25, y: y + 0.85, w: 3.45, h: 1.2,
      fontFace: FONT.body, fontSize: 15, color: COLOR.body, margin: 0,
    });
  });
}

// ======================================================================
// 18 Conclusion
// ======================================================================
function s18() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };
  addEyebrow(s, "BILAN ET PERSPECTIVES", 18);
  addTitle(s, "Un PFE livré, un socle pour 2030.");
  addFooter(s);

  const cols = [
    {
      t: "Livré",
      fill: COLOR.forest,
      tc: COLOR.titleOnDark,
      ic: COLOR.subtitleOnDark,
      items: ["Plateforme full-stack démontrable", "3 rôles, Stripe, ticket QR", "IA d'occupation + recos", "Docker, Swagger, rapport"],
    },
    {
      t: "Apports",
      fill: COLOR.white,
      tc: COLOR.ink,
      ic: COLOR.body,
      items: ["Architecture n-tiers réelle", "Sécurité JWT / Stripe", "ML dans un produit métier", "Méthodologie IGA appliquée"],
    },
    {
      t: "Ensuite",
      fill: COLOR.white,
      tc: COLOR.ink,
      ic: COLOR.body,
      items: ["FanBot conversationnel enrichi", "Application mobile native", "Données réelles + suivi MAE", "Alertes matchs / occupation"],
    },
  ];
  cols.forEach((c, i) => {
    const x = MX + i * 4.15;
    card(s, x, 1.5, 3.95, 5.25, c.fill);
    s.addText(c.t, {
      x: x + 0.25, y: 1.7, w: 3.45, h: 0.5,
      fontFace: FONT.head, fontSize: 22, color: c.tc, margin: 0,
    });
    c.items.forEach((it, j) => {
      s.addText(it, {
        x: x + 0.25, y: 2.45 + j * 0.95, w: 3.45, h: 0.8,
        fontFace: FONT.body, fontSize: 15, color: c.ic, margin: 0,
      });
    });
  });
}

// ======================================================================
// 19 Démo live cue
// ======================================================================
function s19() {
  const s = pres.addSlide();
  s.background = { color: COLOR.forestDeep };
  s.addText("DÉMONSTRATION", {
    x: MX, y: 2.05, w: 12, h: 0.4,
    fontFace: FONT.body, fontSize: 14, color: COLOR.moss, charSpacing: 3, margin: 0,
  });
  s.addText("Parcours à montrer", {
    x: MX, y: 2.55, w: 12, h: 0.85,
    fontFace: FONT.head, fontSize: 36, color: COLOR.titleOnDark, margin: 0,
  });
  const demo = [
    "1. Accueil → Match Center",
    "2. Lieux sur la carte",
    "3. Wizard + paiement test",
    "4. Dashboard Owner / Admin",
  ];
  demo.forEach((t, i) => {
    const x = MX + (i % 2) * 6.1;
    const y = 3.7 + Math.floor(i / 2) * 1.15;
    s.addText(t, {
      x, y, w: 5.8, h: 0.9,
      fontFace: FONT.body, fontSize: 22, color: COLOR.titleOnDark, margin: 0,
    });
  });
}

// ======================================================================
// 20 Merci
// ======================================================================
function s20() {
  const s = pres.addSlide();
  s.background = { color: COLOR.darkBg };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.18, h: H, fill: { color: COLOR.terracotta } });
  s.addText("MERCI", {
    x: MX, y: 1.9, w: 12, h: 1.05,
    fontFace: FONT.head, fontSize: 60, color: COLOR.titleOnDark, margin: 0,
  });
  s.addText("Questions du jury.", {
    x: MX, y: 3.05, w: 12, h: 0.5,
    fontFace: FONT.head, fontSize: 22, italic: true, color: COLOR.terracottaSoft, margin: 0,
  });
  s.addShape(pres.shapes.LINE, {
    x: MX, y: 3.9, w: 5.2, h: 0, line: { color: COLOR.hairlineDark, width: 0.75 },
  });
  s.addText("FanConnect 2030  ·  Soutenance PFE 5DLTI\nEncadrant académique : M. Bouchib Riyami\nOrganisme : GM-Soft  ·  Année 2025 / 2026", {
    x: MX, y: 4.2, w: 11, h: 1.5,
    fontFace: FONT.body, fontSize: 16, color: COLOR.subtitleOnDark, margin: 0,
  });
}

[s01, s02, s03, s04, s05, s06, s07, s08, s09, s10, s11, s12, s13, s14, s15, s16, s17, s18, s19, s20].forEach((fn) => fn());

const out = path.join(RAPPORT, "Presentation_Soutenance_FanConnect_2030.pptx");
pres.writeFile({ fileName: out }).then(() => console.log("Wrote", out));
