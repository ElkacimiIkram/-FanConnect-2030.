const fs = require("fs");
const path = require("path");

const p = path.join(__dirname, "generate-rapport-pfe.js");
let s = fs.readFileSync(p, "utf8");

s = s.replace(", TableOfContents", "");
s = s.replace(/^\s*new TableOfContents\([\s\S]*?\),\r?\n/m, "");

const marker = 'h1("Table des matières"),';
const idx = s.indexOf(marker);
if (idx < 0) {
  console.error("TOC heading not found");
  process.exit(1);
}

const after = s.slice(idx + marker.length);
const nextBreak = after.indexOf("new Paragraph({ children: [new PageBreak()] })");
if (nextBreak < 0) {
  console.error("page break after TOC not found");
  process.exit(1);
}

const replacement = `h1("Table des matières"),
  p("Introduction", { align: AlignmentType.LEFT, after: 60 }),
  p("I – Présentation de la société d'accueil", { align: AlignmentType.LEFT, after: 60 }),
  p("    I.1 Description et année de création", { align: AlignmentType.LEFT, after: 40, size: 22 }),
  p("    I.2 Départements / Divisions / Services", { align: AlignmentType.LEFT, after: 40, size: 22 }),
  p("    I.3 Activités principales", { align: AlignmentType.LEFT, after: 40, size: 22 }),
  p("    I.4 Infrastructure matérielle et logicielle", { align: AlignmentType.LEFT, after: 40, size: 22 }),
  p("    I.5 Sites de production / localisation", { align: AlignmentType.LEFT, after: 40, size: 22 }),
  p("II – Projet demandé dans le stage", { align: AlignmentType.LEFT, after: 60 }),
  p("    II.1 Description détaillée du projet", { align: AlignmentType.LEFT, after: 40, size: 22 }),
  p("    II.2 Cahier des charges", { align: AlignmentType.LEFT, after: 40, size: 22 }),
  p("    II.3 Étude de l'existant", { align: AlignmentType.LEFT, after: 40, size: 22 }),
  p("    II.4 Problématique", { align: AlignmentType.LEFT, after: 40, size: 22 }),
  p("    II.5 Gestion de projet (diagramme de Gantt)", { align: AlignmentType.LEFT, after: 40, size: 22 }),
  p("    II.6 Analyse et conception", { align: AlignmentType.LEFT, after: 40, size: 22 }),
  p("    II.7 Modélisation de la BDD et de l'application", { align: AlignmentType.LEFT, after: 40, size: 22 }),
  p("    II.8 Choix des outils technologiques", { align: AlignmentType.LEFT, after: 40, size: 22 }),
  p("    II.9 Architecture technique", { align: AlignmentType.LEFT, after: 40, size: 22 }),
  p("    II.10 Réalisation", { align: AlignmentType.LEFT, after: 40, size: 22 }),
  p("Conclusion et perspectives", { align: AlignmentType.LEFT, after: 60 }),
  p("Annexes", { align: AlignmentType.LEFT, after: 60 }),
  p("Références bibliographiques", { align: AlignmentType.LEFT, after: 60 }),
  p("(Sommaire manuel — compatible Word.)", {
    italics: true,
    size: 18,
    color: GRAY,
    align: AlignmentType.CENTER,
  }),
  `;

s = s.slice(0, idx) + replacement + after.slice(nextBreak);
fs.writeFileSync(p, s);
console.log("patched OK");
