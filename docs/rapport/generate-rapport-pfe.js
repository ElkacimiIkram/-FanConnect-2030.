const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, LevelFormat, ImageRun,
} = require("docx");
const fs = require("fs");
const path = require("path");

const ICON_DIR = path.join(__dirname, "tech-icons");
const SCREEN_DIR = path.join(__dirname, "screenshots");
const DIAGRAM_DIR = path.join(__dirname, "diagrams");
function loadIcon(name) {
  return fs.readFileSync(path.join(ICON_DIR, `${name}.png`));
}
function loadScreen(name) {
  return fs.readFileSync(path.join(SCREEN_DIR, `${name}.png`));
}
function loadDiagram(name) {
  return fs.readFileSync(path.join(DIAGRAM_DIR, `${name}.png`));
}
function pngSize(buf) {
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}
function diagramBlock(fileName, title, description) {
  const data = loadDiagram(fileName);
  const { width: iw, height: ih } = pngSize(data);
  const maxW = 520;
  const maxH = 420;
  let tw = maxW;
  let th = Math.round((ih / iw) * tw);
  if (th > maxH) {
    th = maxH;
    tw = Math.round((iw / ih) * th);
  }
  return [
    new Paragraph({
      spacing: { before: 200, after: 80 },
      children: [
        new TextRun({
          text: title,
          font: "Times New Roman",
          size: 24,
          bold: true,
          color: BLUE,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new ImageRun({
          type: "png",
          data,
          transformation: { width: tw, height: th },
          altText: { name: title, description, title },
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 160 },
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({
          text: description,
          font: "Times New Roman",
          size: 22,
          italics: true,
          color: "333333",
        }),
      ],
    }),
  ];
}

function screenshotBlock(fileName, title, description) {
  const data = loadScreen(fileName);
  const { width: iw, height: ih } = pngSize(data);
  const maxW = 500;
  const maxH = 380;
  let tw = maxW;
  let th = Math.round((ih / iw) * tw);
  if (th > maxH) {
    th = maxH;
    tw = Math.round((iw / ih) * th);
  }
  return [
    new Paragraph({
      spacing: { before: 200, after: 80 },
      children: [
        new TextRun({
          text: title,
          font: "Times New Roman",
          size: 24,
          bold: true,
          color: BLUE,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new ImageRun({
          type: "png",
          data,
          transformation: { width: tw, height: th },
          altText: {
            name: title,
            description,
            title,
          },
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 160 },
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({
          text: description,
          font: "Times New Roman",
          size: 22,
          italics: true,
          color: "333333",
        }),
      ],
    }),
  ];
}

const A4_W = 11906;
const A4_H = 16838;
const MARGIN = 1134;
const CONTENT_W = A4_W - MARGIN * 2;

const thin = { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" };
const borders = { top: thin, bottom: thin, left: thin, right: thin };
const thickBlue = { style: BorderStyle.SINGLE, size: 24, color: "1F4E79" };

const BLUE = "1F4E79";
const LIGHT_BLUE = "D6E3F0";
const GRAY = "666666";
const PLACEHOLDER = "B00020";

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

function blankLine() {
  return new Paragraph({ spacing: { after: 120 }, children: [] });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 240 },
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

function placeholder(label) {
  return new Paragraph({
    spacing: { after: 160, line: 276 },
    alignment: AlignmentType.JUSTIFIED,
    children: [
      new TextRun({
        text: `[À COMPLÉTER] ${label}`,
        font: "Times New Roman",
        size: 24,
        italics: true,
        color: PLACEHOLDER,
      }),
    ],
  });
}

function bullet(text, ref = "bullets") {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { after: 80, line: 276 },
    children: [new TextRun({ text, font: "Times New Roman", size: 24 })],
  });
}

function codeLine(text) {
  return new Paragraph({
    spacing: { after: 20, line: 240 },
    alignment: AlignmentType.LEFT,
    shading: { fill: "F4F6F8", type: ShadingType.CLEAR },
    children: [
      new TextRun({
        text,
        font: "Consolas",
        size: 16,
      }),
    ],
  });
}

function numbered(text, ref = "numbers") {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { after: 80, line: 276 },
    children: [new TextRun({ text, font: "Times New Roman", size: 24 })],
  });
}

function caption(text) {
  return new Paragraph({
    spacing: { before: 80, after: 200 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text, font: "Times New Roman", size: 20, italics: true, color: GRAY })],
  });
}

function cell(text, width, opts = {}) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [
      new Paragraph({
        alignment: opts.align || AlignmentType.LEFT,
        children: [
          new TextRun({
            text,
            font: "Times New Roman",
            size: opts.size || 20,
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
      ...rows.map(
        (r) => new TableRow({ children: r.map((v, i) => cell(String(v), colWidths[i])) })
      ),
    ],
  });
}

function coverLine(label, value, empty = false) {
  return new Paragraph({
    spacing: { after: 120 },
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({ text: `${label} : `, font: "Times New Roman", size: 24, bold: true }),
      new TextRun({
        text: empty ? "................................................" : value,
        font: "Times New Roman",
        size: 24,
        italics: empty,
        color: empty ? PLACEHOLDER : "000000",
      }),
    ],
  });
}

function techCardCell(iconName, title, definition, width) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: "F7FAFC", type: ShadingType.CLEAR },
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [
          new ImageRun({
            type: "png",
            data: loadIcon(iconName),
            transformation: { width: 72, height: 72 },
            altText: { name: title, description: definition, title },
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [
          new TextRun({ text: title, font: "Times New Roman", size: 22, bold: true, color: BLUE }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 40 },
        children: [
          new TextRun({ text: definition, font: "Times New Roman", size: 18, color: "333333" }),
        ],
      }),
    ],
  });
}

function techCardsTable(items) {
  // items: array of [icon, title, definition], 2 per row
  const colW = Math.floor(CONTENT_W / 2);
  const rows = [];
  for (let i = 0; i < items.length; i += 2) {
    const left = items[i];
    const right = items[i + 1];
    const cells = [techCardCell(left[0], left[1], left[2], colW)];
    if (right) {
      cells.push(techCardCell(right[0], right[1], right[2], colW));
    } else {
      cells.push(
        new TableCell({
          borders,
          width: { size: colW, type: WidthType.DXA },
          children: [new Paragraph({ children: [] })],
        })
      );
    }
    rows.push(new TableRow({ children: cells }));
  }
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [colW, colW],
    rows,
  });
}

function bulletLevel(ref) {
  return {
    reference: ref,
    levels: [
      {
        level: 0,
        format: LevelFormat.BULLET,
        text: "•",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } },
      },
    ],
  };
}

function numberLevel(ref, pattern) {
  return {
    reference: ref,
    levels: [
      {
        level: 0,
        format: LevelFormat.DECIMAL,
        text: pattern,
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } },
      },
    ],
  };
}

const children = [
  // COVER
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    border: { bottom: thickBlue },
    children: [new TextRun({ text: "ROYAUME DU MAROC", font: "Times New Roman", size: 28, bold: true })],
  }),
  blankLine(),
  p("[Nom de l'établissement / École / Université]", {
    align: AlignmentType.CENTER, italics: true, color: PLACEHOLDER, after: 60,
  }),
  p("[Filière : 5DLTI / Ingénieur d'État]", {
    align: AlignmentType.CENTER, italics: true, color: PLACEHOLDER, after: 60,
  }),
  p("[Département / Option]", {
    align: AlignmentType.CENTER, italics: true, color: PLACEHOLDER, after: 200,
  }),
  blankLine(),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 200 },
    children: [new TextRun({ text: "RAPPORT DE STAGE / PFE", font: "Times New Roman", size: 36, bold: true, color: BLUE })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [new TextRun({ text: "Projet de Fin d'Études", font: "Times New Roman", size: 28, italics: true })],
  }),
  blankLine(),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 120 },
    border: {
      top: { style: BorderStyle.SINGLE, size: 12, color: BLUE },
      bottom: { style: BorderStyle.SINGLE, size: 12, color: BLUE },
    },
    children: [new TextRun({ text: "FanConnect 2030", font: "Times New Roman", size: 40, bold: true, color: BLUE })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 160, after: 80 },
    children: [
      new TextRun({
        text: "Plateforme intelligente de réservation de cafés et lieux",
        font: "Times New Roman",
        size: 24,
        italics: true,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [
      new TextRun({
        text: "pour regarder les matchs de football — Coupe du Monde 2030",
        font: "Times New Roman",
        size: 24,
        italics: true,
      }),
    ],
  }),
  blankLine(),
  blankLine(),
  coverLine("Préparé par", "", true),
  coverLine("Encadrant académique", "", true),
  coverLine("Encadrant professionnel", "", true),
  coverLine("Organisme d'accueil", "GM-Soft (German Moroccan Software Company)", false),
  coverLine("Année universitaire", "2025 / 2026", false),
  blankLine(),
  blankLine(),
  p(
    "Les champs en rouge marqués [À COMPLÉTER] sont volontairement laissés vides pour que vous les remplissiez (entreprise, identité, etc.).",
    { align: AlignmentType.CENTER, italics: true, size: 18, color: GRAY, after: 80 }
  ),
  new Paragraph({ children: [new PageBreak()] }),

  // REMERCIEMENTS
  h1("Remerciements"),
  p(
    "Au terme de ce projet de fin d'études, je tiens à exprimer ma profonde gratitude à toutes les personnes qui ont contribué, par leur encadrement, leurs conseils et leur soutien, à la réalisation de FanConnect 2030 et à la rédaction du présent rapport."
  ),
  p(
    "Mes remerciements s'adressent en premier lieu à mon encadrant académique, pour la qualité de son suivi, sa disponibilité et ses orientations méthodologiques. Ses remarques m'ont permis de structurer le travail, de renforcer la rigueur scientifique du rapport et de relier les choix techniques aux objectifs du PFE."
  ),
  p(
    "Je remercie chaleureusement mon encadrant professionnel au sein de GM-Soft (German Moroccan Software Company), pour m'avoir accueilli, fait confiance et guidé tout au long du stage. Ses conseils sur l'architecture, la qualité du code, la sécurité et le lien avec les solutions métiers de l'entreprise (notamment GM-CAFE) ont été déterminants."
  ),
  p(
    "J'exprime également ma reconnaissance à l'ensemble de l'équipe de GM-Soft — direction, pôle développement, support et collaborateurs croisés au quotidien — pour l'ambiance de travail, le partage d'expérience et l'ouverture sur les pratiques d'une SSII maroco-allemande. Merci à GM-Soft de m'avoir permis de mener un projet concret, de la conception à la démonstration."
  ),
  p(
    "Mes remerciements vont aussi à l'établissement de formation et à l'ensemble du corps enseignant, dont les enseignements en génie logiciel, bases de données, web et intelligence artificielle ont constitué le socle de ce travail."
  ),
  p(
    "Enfin, je dédie une pensée particulière à ma famille et à mes proches, pour leur soutien moral, leur patience et leurs encouragements tout au long de cette année universitaire."
  ),
  p(
    "Que toutes les personnes qui ont contribué, de près ou de loin, à la réussite de ce projet trouvent ici l'expression de ma sincère gratitude."
  ),
  new Paragraph({ children: [new PageBreak()] }),

  // RESUME
  h1("Résumé"),
  p(
    "Le présent rapport décrit la conception et la réalisation de FanConnect 2030, une plateforme full-stack de réservation intelligente de cafés et établissements sportifs permettant aux supporters de réserver une place pour regarder les matchs de football, notamment dans le contexte de la Coupe du Monde 2030."
  ),
  p(
    "La solution intègre un backend Spring Boot (Java 21), un frontend React, une base de données PostgreSQL, un service de paiement Stripe, ainsi qu'un microservice d'intelligence artificielle (Python / FastAPI / scikit-learn) dédié à la prédiction d'affluence. Un moteur de recommandation de lieux, basé sur la proximité géographique et le niveau d'occupation, complète l'expérience utilisateur."
  ),
  p(
    "Ce document suit le plan de rédaction imposé pour le rapport de stage / PFE (5DLTI / Ingénieur d'État). La partie relative à la société d'accueil est laissée volontairement à compléter."
  ),
  blankLine(),
  p(
    "Mots-clés : réservation, football, Coupe du Monde 2030, Spring Boot, React, PostgreSQL, intelligence artificielle, Random Forest, recommandation, Stripe.",
    { italics: true }
  ),
  blankLine(),
  h2("Abstract"),
  p(
    "This report presents the design and implementation of FanConnect 2030, a smart café and sports venue reservation platform that helps football fans book seats to watch matches, with a focus on the 2030 World Cup context. The system combines a Spring Boot backend, a React frontend, PostgreSQL, Stripe payments, and an AI occupancy-prediction microservice based on Random Forest, together with proximity-aware venue recommendations.",
    { italics: true }
  ),
  new Paragraph({ children: [new PageBreak()] }),

  // TOC
  h1("Table des matières"),
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
  p("Liste des tableaux", { align: AlignmentType.LEFT, after: 60 }),
  p("Liste des figures", { align: AlignmentType.LEFT, after: 60 }),
  p("Annexes", { align: AlignmentType.LEFT, after: 60 }),
  p("Références bibliographiques", { align: AlignmentType.LEFT, after: 60 }),
  p("(Sommaire manuel — compatible Word.)", {
    italics: true,
    size: 18,
    color: GRAY,
    align: AlignmentType.CENTER,
  }),
  new Paragraph({ children: [new PageBreak()] }),

  h1("Liste des tableaux"),
  bullet("Tableau 1 — Exigences fonctionnelles principales"),
  bullet("Tableau 2 — Exigences non fonctionnelles"),
  bullet("Tableau 3 — Planning prévisionnel (Gantt simplifié)"),
  bullet("Tableau 4 — Principales entités de la base de données"),
  bullet("Tableau 5 — Stack technologique et justifications"),
  bullet("Tableau 6 — Rôles et permissions"),
  bullet("Tableau A.1 — Catalogue de matchs de démo"),
  bullet("Tableau A.2 — Features du service IA d'occupation"),
  bullet("Tableau A.3 — Exemple de snapshot d'occupation"),
  bullet("Tableau A.4 — Comptes de démonstration"),
  bullet("Tableau A.5 — Statuts métier"),
  new Paragraph({ children: [new PageBreak()] }),

  h1("Liste des figures"),
  bullet("Figure 1 — Organigramme fonctionnel de GM-Soft"),
  bullet("Figure 2 — Diagramme de Gantt FanConnect 2030 (avril → juillet)"),
  bullet("Figure 3 — Diagramme de cas d'utilisation"),
  bullet("Figure 4 — Diagramme de classes (simplifié)"),
  bullet("Figure 5 — Diagramme de séquence (1/2) : connexion et choix"),
  bullet("Figure 6 — Diagramme de séquence (2/2) : réservation, paiement, ticket"),
  bullet("Figure 7 — Technologies de FanConnect 2030 (icône + définition)"),
  bullet("Figure 8 — Page d'accueil (Hero FanConnect)"),
  bullet("Figure 9 — Match Center Coupe du Monde"),
  bullet("Figure 10 — Catalogue des cafés / lieux"),
  bullet("Figure 11 — Détail d'un établissement et occupation"),
  bullet("Figure 12 — Recommandations de lieux pour un match"),
  bullet("Figure 13 — Wizard de réservation"),
  bullet("Figure 14 — Étape de paiement (Stripe)"),
  bullet("Figure 15 — Dashboard Owner"),
  bullet("Figure 16 — Dashboard Admin (vérification / analytics)"),
  bullet("Figure 17 — Intelligence d'occupation / prédiction IA"),
  bullet("Figure 18 — Authentification"),
  new Paragraph({ children: [new PageBreak()] }),

  // INTRODUCTION
  h1("Introduction"),
  p(
    "Le football constitue un phénomène social et économique majeur. À l'approche de la Coupe du Monde 2030, organisée notamment au Maroc, la demande de lieux adaptés pour suivre les rencontres en commun (cafés, bars sportifs, espaces fans) augmente fortement. Or, les supporters peinent souvent à trouver un établissement disponible, proche et adapté à l'ambiance recherchée, tandis que les propriétaires disposent rarement d'outils numériques pour gérer réservations, occupation et diffusion des matchs."
  ),
  p("Dans ce contexte, le projet FanConnect 2030 vise à concevoir et développer une plateforme web intelligente permettant :"),
  bullet("aux fans de découvrir les matchs, localiser des établissements et réserver une place ;"),
  bullet("aux propriétaires de gérer leurs espaces, vérifier leur établissement et suivre l'affluence ;"),
  bullet("aux administrateurs de modérer le catalogue, les compétitions et les validations ;"),
  bullet("d'exploiter l'intelligence artificielle pour prédire l'occupation et recommander les meilleurs lieux."),
  blankLine(),
  p(
    "Le présent rapport s'articule autour de deux grandes parties. La première présente l'organisme d'accueil du stage, GM-Soft (German Moroccan Software Company), SSII maroco-allemande spécialisée dans les solutions informatiques et la transformation digitale. La seconde détaille le projet FanConnect 2030 : cahier des charges, étude de l'existant, problématique, gestion de projet, analyse et conception, choix technologiques, architecture, sécurité et réalisation. Une conclusion et des perspectives clôturent le document, suivies des annexes et des références bibliographiques."
  ),
  new Paragraph({ children: [new PageBreak()] }),

  // PARTIE I
  h1("I – Présentation de la société d'accueil"),
  p(
    "Le stage de fin d'études s'est déroulé au sein de GM-Soft (German Moroccan Software Company), société de services d'ingénierie informatique (SSII) spécialisée dans le développement de solutions informatiques et la transformation digitale des entreprises. Présente au Maroc et en Allemagne, elle accompagne ses clients de la conception à la maintenance de systèmes d'information adaptés à leurs métiers."
  ),

  h2("I.1 Description et année de création"),
  p(
    "Raison sociale : GM-Soft — German Moroccan Software Company. Forme juridique : société à responsabilité limitée (SARL). L'entreprise a été créée en 2014 et accumule plus de dix années d'expérience. Son siège est situé à Béni Mellal (boulevard Hassan II). Elle dispose également d'implantations à Casablanca et Rabat, ainsi qu'en Allemagne."
  ),
  p(
    "GM-Soft se positionne comme un éditeur et intégrateur de solutions métiers, à la croisée de l'expertise et de la rigueur allemandes et de la proximité de ses équipes marocaines. Elle revendique plus de 100 clients et plus de 100 projets réalisés, auprès d'acteurs des secteurs public et privé."
  ),
  p(
    "Mission : concevoir, développer, intégrer et faire évoluer des solutions informatiques sur mesure, fiables et sécurisées, afin d'optimiser la gestion et l'automatisation des processus des organisations. Vision : accompagner durablement la digitalisation des entreprises et des collectivités, en privilégiant la qualité, l'innovation, la fiabilité, la sécurité et la personnalisation."
  ),
  p(
    "La démarche projet de GM-Soft suit un cycle complet : analyse des besoins du client, développement et implémentation de la solution, puis accompagnement (formation, maintenance et évolution des systèmes)."
  ),

  h2("I.2 Départements / Divisions / Services"),
  p(
    "En tant que SSII, GM-Soft s'organise autour de plusieurs pôles complémentaires, typiques d'une société d'ingénierie logicielle :"
  ),
  bullet("Direction générale : stratégie, partenariats Maroc–Allemagne et pilotage des projets ;"),
  bullet("Pôle développement logiciel : applications web et mobiles, ERP et solutions métiers (GM-ERP, GM-POS, GM-CAFE, GM-HOTEL, GM-SEC, etc.) ;"),
  bullet("Pôle conseil et systèmes d'information : cadrage, intégration, accompagnement au changement ;"),
  bullet("Pôle bases de données et infrastructure : administration, sécurité et exploitation ;"),
  bullet("Pôle support, maintenance et formation : assistance utilisateurs et évolution des solutions livrées."),
  blankLine(),
  p(
    "Le présent PFE a été réalisé au sein du pôle développement, sous l'encadrement d'un ingénieur professionnel chargé d'orienter les choix techniques, de valider les livrables et d'assurer la cohérence du projet FanConnect 2030 avec les pratiques de l'entreprise (qualité du code, sécurité, documentation)."
  ),
  p(
    "GM-Soft n'ayant pas communiqué d'organigramme nominatif officiel, la figure ci-dessous présente un organigramme fonctionnel reconstitué à partir des activités et solutions publiées par l'entreprise (ERP, web/mobile, métiers café/hôtel, sécurité, support). Il sert à situer le stage dans le pôle Développement."
  ),
  ...diagramBlock(
    "05-organigramme-gmsoft",
    "Figure 1 — Organigramme fonctionnel de GM-Soft",
    "La direction générale pilote quatre pôles (Conseil & SI, Développement, Données & sécurité, Support) sur les sites de Béni Mellal, Casablanca, Rabat et l'Allemagne. Le PFE FanConnect 2030 est rattaché au pôle Développement (applications web, solutions métiers type GM-CAFE)."
  ),

  h2("I.3 Activités principales"),
  p(
    "GM-Soft intervient dans le secteur du développement logiciel, de l'intégration de systèmes d'information et du conseil digital. Elle met son expertise au service de l'hôtellerie, de l'industrie, du commerce, de l'agriculture, du BTP, de l'administration publique et de l'e-commerce."
  ),
  p("Ses principales activités sont les suivantes :"),
  bullet("développement et intégration de solutions ERP ;"),
  bullet("développement d'applications web et mobiles ;"),
  bullet("développement de solutions e-commerce ;"),
  bullet("conseil et accompagnement en systèmes d'information ;"),
  bullet("administration et gestion des bases de données ;"),
  bullet("sécurité informatique et protection des données ;"),
  bullet("maintenance, support technique et évolution des solutions ;"),
  bullet("formation et accompagnement des utilisateurs."),
  blankLine(),
  p("Parmi les solutions phares de l'entreprise figurent :"),
  bullet("GM-ERP : gestion intégrée des entreprises ;"),
  bullet("GM-POS : gestion des points de vente ;"),
  bullet("GM-CAFE : solution dédiée aux cafés et restaurants — en lien direct avec le domaine de FanConnect 2030 ;"),
  bullet("GM-HOTEL : gestion hôtelière ;"),
  bullet("GM-SEC : gestion de l'état civil des communes ;"),
  bullet("des solutions métiers pour l'agriculture, l'industrie, le commerce, le BTP et la paie."),
  blankLine(),
  p(
    "FanConnect 2030 s'inscrit dans cette offre : une plateforme web et mobile de réservation de cafés pour les matchs de la Coupe du Monde, qui prolonge l'expertise GM-CAFE par l'intelligence d'occupation, la géolocalisation et le paiement en ligne."
  ),

  h2("I.4 Infrastructure matérielle et logicielle"),
  p(
    "L'environnement de travail repose sur des postes de développement individuels (ordinateurs portables / fixes, connexion Internet sécurisée) et sur des serveurs d'application et de bases de données pour les tests et l'exploitation des solutions clients."
  ),
  p(
    "Durant le stage, le développement de FanConnect 2030 a mobilisé une stack alignée sur les pratiques actuelles de l'ingénierie logicielle : Java 21 / Spring Boot 3 pour le backend, React (Vite, Tailwind) pour le frontend, PostgreSQL pour la persistance, Python / FastAPI pour le service d'intelligence artificielle, Docker pour l'industrialisation, Git pour le versionnement, et Stripe (mode test) pour le paiement."
  ),
  p(
    "Les outils collaboratifs classiques d'une SSII (Git, IDE type IntelliJ / VS Code, documentation technique, messagerie interne) ont permis le suivi du projet, les revues de code et la capitalisation des livrables. La politique de sécurité interne insiste sur la confidentialité des données clients, la gestion des accès et la protection des systèmes (authentification, sauvegardes, bonnes pratiques de développement sécurisé)."
  ),

  h2("I.5 Sites de production / localisation"),
  p(
    "GM-Soft dispose de plusieurs sites : Béni Mellal (siège), Casablanca et Rabat au Maroc, ainsi qu'une présence en Allemagne. Cette organisation lui permet de combiner proximité client au Maroc et ouverture internationale."
  ),
  p(
    "Le stage s'est déroulé au Maroc, au contact des équipes de développement de GM-Soft, dans un mode de travail encadré (présentiel et/ou hybride selon l'organisation interne). Les échanges avec l'encadrant professionnel ont porté sur le cadrage fonctionnel, les choix d'architecture et la validation des démonstrations (Match Center, réservation, FanBot, prédiction d'occupation)."
  ),
  new Paragraph({ children: [new PageBreak()] }),

  // PARTIE II
  h1("II – Projet demandé dans le stage"),

  h2("II.1 Description détaillée du projet"),
  p(
    "FanConnect 2030 est une plateforme web de réservation intelligente de cafés et lieux sportifs destinée aux supporters de football. Elle permet de :"
  ),
  bullet("consulter un centre de matchs (calendrier, compétitions, Coupe du Monde) ;", "bullets2"),
  bullet("rechercher des établissements géolocalisés diffusant un match ;", "bullets2"),
  bullet("réserver une table / un espace selon la capacité et l'occupation ;", "bullets2"),
  bullet("payer en ligne via Stripe ;", "bullets2"),
  bullet("recevoir des notifications et suivre le statut de la réservation ;", "bullets2"),
  bullet("prédire l'affluence grâce à un service IA (Random Forest) ;", "bullets2"),
  bullet("obtenir des recommandations de lieux basées sur la proximité et le risque d'occupation.", "bullets2"),
  blankLine(),
  p("Trois profils utilisateurs sont distingués :"),
  bullet("Fan / Supporter : navigation, réservation, paiement, consultation des recommandations ;", "bullets2"),
  bullet("Owner / Propriétaire : gestion du business, vérification, occupation live, check-in ;", "bullets2"),
  bullet("Admin : validation des établissements, analytics, gestion des compétitions.", "bullets2"),
  blankLine(),
  p(
    "Le projet est organisé en monorepo comprenant : backend Spring Boot, frontend React (Vite + Tailwind), service IA Python (FastAPI), base PostgreSQL, Docker Compose et scripts de démarrage."
  ),

  h2("II.2 Cahier des charges"),
  h3("II.2.1 Objectifs du projet"),
  numbered("Offrir une expérience fluide de découverte et de réservation de lieux pour regarder les matchs.", "frs"),
  numbered("Aider les propriétaires à digitaliser la gestion de leurs espaces et de l'occupation.", "frs"),
  numbered("Intégrer des fonctionnalités d'intelligence artificielle différenciantes (prédiction + recommandation).", "frs"),
  numbered("Garantir sécurité, scalabilité et maintenabilité via une architecture moderne.", "frs"),

  h3("II.2.2 Exigences fonctionnelles"),
  simpleTable(
    ["ID", "Exigence fonctionnelle", "Acteur"],
    [
      ["EF01", "Inscription / authentification JWT", "Tous"],
      ["EF02", "Consultation du Match Center (WC 2030)", "Fan"],
      ["EF03", "Recherche et filtrage des établissements", "Fan"],
      ["EF04", "Réservation guidée (wizard multi-étapes)", "Fan"],
      ["EF05", "Paiement en ligne (Stripe)", "Fan"],
      ["EF06", "Recommandations de lieux (proximité + affluence)", "Fan"],
      ["EF07", "Prédiction d'occupation (IA)", "Fan / Owner"],
      ["EF08", "Gestion du business et vérification", "Owner"],
      ["EF09", "Occupation live et check-in tickets", "Owner"],
      ["EF10", "Modération admin et analytics", "Admin"],
      ["EF11", "Notifications utilisateurs", "Tous"],
    ],
    [900, 6200, 2538]
  ),
  caption("Tableau 1 — Exigences fonctionnelles principales"),

  h3("II.2.3 Exigences non fonctionnelles"),
  simpleTable(
    ["ID", "Exigence non fonctionnelle"],
    [
      ["ENF01", "Sécurité : JWT, rôles, validation des entrées, HTTPS en prod"],
      ["ENF02", "Performance : réponses API < 2 s en conditions normales"],
      ["ENF03", "Disponibilité : architecture conteneurisable (Docker)"],
      ["ENF04", "Maintenabilité : code structuré, migrations Flyway, documentation"],
      ["ENF05", "Usabilité : UI responsive (React + Tailwind)"],
      ["ENF06", "Interopérabilité : API REST documentée (OpenAPI / Swagger)"],
    ],
    [1200, 8438]
  ),
  caption("Tableau 2 — Exigences non fonctionnelles"),

  h2("II.3 Étude de l'existant"),
  p(
    "Avant la conception de FanConnect 2030, plusieurs solutions proches existent sur le marché, sans couvrir pleinement le besoin combiné « match + lieu + réservation + IA » :"
  ),
  bullet(
    "Applications de réservation de restaurants (ex. TheFork, OpenTable) : excellentes pour la restauration, mais peu centrées sur le sport et les matchs en direct.",
    "bullets3"
  ),
  bullet(
    "Plateformes d'événements / billetterie : gèrent les tickets de stade, pas les cafés de diffusion.",
    "bullets3"
  ),
  bullet(
    "Réseaux sociaux et groupes WhatsApp / Facebook : méthode artisanale, sans occupation temps réel ni paiement structuré.",
    "bullets3"
  ),
  bullet(
    "Sites de cafés individuels : silos d'information, pas de vision globale multi-établissements.",
    "bullets3"
  ),
  blankLine(),
  p(
    "Limites de l'existant : absence d'intégration calendrier football + géolocalisation + occupation prédictive ; manque d'outils unifiés pour owners et fans ; faible personnalisation intelligente des suggestions de lieux."
  ),

  h2("II.4 Problématique"),
  p(
    "Comment concevoir et réaliser une plateforme numérique fiable, sécurisée et intelligente permettant aux supporters de réserver facilement un lieu adapté pour regarder un match, tout en aidant les établissements à anticiper l'affluence et optimiser leur remplissage, dans le contexte de la Coupe du Monde 2030 ?"
  ),
  blankLine(),
  p("Sous-questions :"),
  bullet(
    "Quels indicateurs utiliser pour estimer le risque d'occupation d'un établissement avant le coup d'envoi ?",
    "bullets3"
  ),
  bullet(
    "Comment recommander un lieu pertinent en combinant distance, capacité et prédiction IA ?",
    "bullets3"
  ),
  bullet(
    "Quelle architecture technique choisir pour séparer clairement API métier, interface et service d'apprentissage automatique ?",
    "bullets3"
  ),

  h2("II.5 Gestion de projet (diagramme de Gantt)"),
  p(
    "Le projet FanConnect 2030 a été planifié sur la période d'avril à juillet, selon une approche itérative (sprints). Le tableau suivant synthétise les phases, puis le diagramme de Gantt visualise leur enchaînement dans le temps."
  ),
  simpleTable(
    ["Phase", "Tâches principales", "Période"],
    [
      ["1. Cadrage", "Besoins, cahier des charges, planning", "Avril"],
      ["2. Conception", "UML, MCD/MLD, architecture", "Avril – Mai"],
      ["3. Backend", "API Spring Boot, sécurité JWT, Flyway", "Mai"],
      ["4. Frontend", "UI React, parcours fan/owner/admin", "Mai – Juin"],
      ["5. IA", "Service FastAPI + Random Forest", "Juin"],
      ["6. Intégrations", "Stripe, géoloc, notifications, match center", "Juin – Juillet"],
      ["7. Tests & doc", "Tests, Docker, rapport PFE", "Juillet"],
    ],
    [1800, 5200, 2638]
  ),
  caption("Tableau 3 — Planning prévisionnel (Avril → Juillet)"),
  blankLine(),
  p("Diagramme de Gantt du projet (Avril → Juillet) :", { bold: true }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 80 },
    children: [
      new ImageRun({
        type: "png",
        data: loadIcon("gantt-fanconnect-4mois"),
        transformation: { width: 620, height: 349 },
        altText: {
          name: "Diagramme de Gantt FanConnect",
          description: "Planning Gantt d'avril à juillet du projet FanConnect 2030",
          title: "Gantt Avril-Juillet",
        },
      }),
    ],
  }),
  caption("Figure 2 — Diagramme de Gantt FanConnect 2030 (Avril → Juillet)"),
  p(
    "Lecture du diagramme : en avril, cadrage et conception ; en mai, développement backend Spring Boot puis démarrage du frontend React ; en juin, poursuite du frontend, service IA et début des intégrations ; en juillet, finalisation des intégrations, tests, Docker et rédaction du rapport PFE. Le suivi avec l'encadrant s'étend sur toute la période."
  ),

  h2("II.6 Analyse et conception du cahier des charges"),
  h3("II.6.1 Acteurs du système"),
  bullet("Visiteur (non authentifié) : consulter matchs et établissements publics.", "bullets4"),
  bullet("Fan : réserver, payer, recevoir notifications, voir recommandations.", "bullets4"),
  bullet("Owner : gérer business, occupation, vérification, check-in.", "bullets4"),
  bullet("Admin : valider établissements, analytics, compétitions.", "bullets4"),
  bullet("Service IA : prédire l'occupation à différents horizons temporels.", "bullets4"),
  bullet("Passerelle de paiement Stripe : encaisser les réservations.", "bullets4"),

  h3("II.6.2 Cas d'utilisation principaux"),
  p(
    "Les cas d'utilisation majeurs sont : S'inscrire / Se connecter ; Consulter le Match Center ; Rechercher un établissement ; Obtenir des recommandations IA ; Réserver une place ; Payer ; Gérer un business ; Mettre à jour l'occupation live ; Valider un établissement ; Consulter les analytics."
  ),
  ...diagramBlock(
    "01-cas-utilisation",
    "Figure 3 — Diagramme de cas d'utilisation",
    "Trois acteurs : le Fan consulte matchs et cafés, réserve et paie (include ticket QR) ; le Propriétaire dépose son établissement, gère l'occupation et le check-in ; l'Administrateur valide les cafés et supervise la plateforme."
  ),

  h3("II.6.3 Scénarios"),
  p("Scénario nominal — Réservation fan :"),
  numbered("Le fan se connecte et choisit un match dans le Match Center.", "nfrs"),
  numbered("Le système propose des lieux recommandés (distance + occupation prédite).", "nfrs"),
  numbered("Le fan sélectionne un établissement et lance le wizard de réservation.", "nfrs"),
  numbered("Il choisit l'espace / la table, confirme les détails, puis paie via Stripe.", "nfrs"),
  numbered(
    "Une confirmation et une notification sont générées ; le ticket peut être check-in par l'owner.",
    "nfrs"
  ),

  h2("II.7 Modélisation de la BDD et de l'application"),
  p(
    "La base de données PostgreSQL est versionnée via Flyway. Les principales entités métier sont résumées ci-dessous."
  ),
  simpleTable(
    ["Entité", "Rôle"],
    [
      ["User", "Comptes et rôles (FAN, OWNER, ADMIN)"],
      ["Business / Cafe", "Établissements diffusant les matchs"],
      ["BusinessSpace / BusinessTable", "Espaces et tables réservables"],
      ["FootballMatch / Competition", "Matchs et compétitions"],
      ["Reservation", "Réservations fans"],
      ["Payment", "Paiements et commissions"],
      ["BusinessLiveOccupancy", "Occupation temps réel"],
      ["OccupancySnapshot", "Historique pour l'IA"],
      ["Notification", "Alertes utilisateurs"],
      ["VerificationDocument", "Documents de vérification owner"],
    ],
    [3200, 6438]
  ),
  caption("Tableau 4 — Principales entités de la base de données"),
  ...diagramBlock(
    "02-classes",
    "Figure 4 — Diagramme de classes (simplifié)",
    "Un User (FAN / OWNER / ADMIN) possède des Business et effectue des Reservation. Une réservation relie un café (Business / Space / Table), un FootballMatch (issu d'une Competition) et un Payment Stripe. Cœur métier : un fan réserve une table d'un café pour un match."
  ),
  ...diagramBlock(
    "03-sequence-1",
    "Figure 5 — Diagramme de séquence (1/2) : connexion et choix",
    "Le fan se connecte (POST /auth/login, JWT), puis choisit un match (GET /matches) et un café (GET /businesses + occupation). Les échanges impliquent le frontend React, le backend Spring Boot et PostgreSQL."
  ),
  ...diagramBlock(
    "04-sequence-2",
    "Figure 6 — Diagramme de séquence (2/2) : réservation, paiement, ticket",
    "POST /fan/bookings crée une Reservation PENDING. Stripe fournit le PaymentIntent ; après paiement carte, POST /fan/bookings/{id}/pay confirme la réservation, enregistre le paiement et délivre le ticket QR."
  ),

  h2("II.8 Choix des outils technologiques"),
  h3("II.8.1 Justifications techniques"),
  simpleTable(
    ["Couche", "Technologie", "Justification"],
    [
      ["Backend", "Java 21 + Spring Boot 3", "Robustesse, sécurité, écosystème entreprise"],
      ["Frontend", "React 18 + Vite + Tailwind", "SPA moderne, productivité UI"],
      ["Base", "PostgreSQL 16 + Flyway", "Fiabilité relationnelle + migrations"],
      ["IA", "Python + FastAPI + scikit-learn", "Standard ML, API légère"],
      ["Paiement", "Stripe", "PCI-DSS, intégration rapide"],
      ["Auth", "JWT + Spring Security", "API stateless sécurisée"],
      ["DevOps", "Docker Compose", "Reproductibilité des environnements"],
      ["Docs API", "SpringDoc OpenAPI", "Documentation interactive"],
    ],
    [1600, 3200, 4838]
  ),
  caption("Tableau 5 — Stack technologique et justifications"),

  h3("II.8.2 Licences de l'entreprise"),
  p(
    "GM-Soft s'appuie principalement sur des technologies ouvertes ou largement répandues en entreprise, ce qui a guidé les choix du PFE. Côté poste de travail : systèmes Windows, IDE (IntelliJ IDEA / VS Code), Git. Côté projet FanConnect 2030 : Spring Boot, React, PostgreSQL, FastAPI, Docker et Stripe (clés de test) — des briques gratuites ou freemium, adaptées à un stage tout en restant professionnelles. Les licences payantes éventuelles (suite bureautique, outils internes GM-ERP / GM-CAFE) restent du périmètre entreprise et n'ont pas conditionné le code livré."
  ),

  h3("II.8.3 Exigences de l'entreprise"),
  p(
    "Les exigences de GM-Soft pour le stage ont porté sur : un livrable démontrable (parcours fan, owner et admin) ; une architecture maintenable (couches Spring, API REST documentée, base versionnée par Flyway) ; la sécurité (JWT, rôles, validation des établissements) ; la qualité (code structuré, tests, documentation) ; et un lien métier avec l'offre existante (cafés / restauration, digitalisation des processus). Le calendrier du PFE (environ quatre mois) a imposé de prioriser le cœur fonctionnel : matchs, réservation, paiement, occupation IA et assistant FanBot."
  ),

  h3("II.8.4 Choix selon budget et portabilité"),
  p(
    "Dans une logique de budget étudiant / startup et de portabilité multiplateforme, le projet privilégie des technologies open source ou freemium : PostgreSQL, React, Spring Boot, Python/scikit-learn, Docker. Stripe est utilisé en mode test. Les outils choisis fonctionnent sous Windows, Linux et macOS, facilitant le travail en équipe et le déploiement."
  ),

  h2("II.9 Architecture technique"),
  h3("II.9.1 Schéma global"),
  p(
    "L'architecture globale de FanConnect 2030 est une architecture 3-tiers enrichie d'un microservice IA. Le schéma ci-dessous présente chaque technologie utilisée, avec une courte définition de son rôle dans le projet."
  ),
  blankLine(),
  p("Couches principales :", { bold: true }),
  bullet("Client : navigateur / SPA React (Vite + Tailwind).", "bullets5"),
  bullet("API métier : Spring Boot (controllers → services → repositories → JPA).", "bullets5"),
  bullet("Données : PostgreSQL (migrations Flyway).", "bullets5"),
  bullet("IA : service FastAPI exposant /predict et /train (Random Forest / scikit-learn).", "bullets5"),
  bullet("Paiement : API Stripe.", "bullets5"),
  bullet("Conteneurisation : Docker Compose pour PostgreSQL et le déploiement.", "bullets5"),
  blankLine(),
  p("Technologies du projet — image et définition :", { bold: true }),
  techCardsTable([
    [
      "spring-boot",
      "Spring Boot (Java 21)",
      "Framework backend Java permettant de construire rapidement une API REST robuste, sécurisée et structurée (controllers, services, JPA).",
    ],
    [
      "react",
      "React 18",
      "Bibliothèque JavaScript pour construire l'interface utilisateur sous forme de SPA : pages fans, owners, admin, cartes et tableaux de bord.",
    ],
    [
      "vite",
      "Vite",
      "Outil de build et serveur de développement ultra-rapide utilisé pour lancer et empaqueter le frontend React.",
    ],
    [
      "postgresql",
      "PostgreSQL 16",
      "Système de gestion de base de données relationnelle qui stocke utilisateurs, matchs, réservations, paiements et snapshots d'occupation.",
    ],
    [
      "python",
      "Python + scikit-learn",
      "Langage et bibliothèque ML utilisés pour entraîner le modèle Random Forest de prédiction d'affluence des établissements.",
    ],
    [
      "fastapi",
      "FastAPI",
      "Framework web Python léger qui expose le microservice IA (/predict, /train, /health) consommé par le backend Spring Boot.",
    ],
    [
      "stripe",
      "Stripe",
      "Passerelle de paiement sécurisée (mode test) pour encaisser les réservations sans stocker les numéros de carte dans FanConnect.",
    ],
    [
      "jwt",
      "JWT + Spring Security",
      "Mécanisme d'authentification stateless et contrôle d'accès par rôles (FAN, OWNER, ADMIN) pour sécuriser l'API.",
    ],
    [
      "docker",
      "Docker Compose",
      "Outil de conteneurisation qui facilite le démarrage reproductible de PostgreSQL et le déploiement multi-services.",
    ],
    [
      "swagger",
      "OpenAPI / Swagger",
      "Documentation interactive de l'API REST (SpringDoc) permettant de tester et comprendre les endpoints du backend.",
    ],
  ]),
  caption("Figure 7 — Technologies de FanConnect 2030 (icône + définition)"),
  blankLine(),
  p(
    "Flux typique de recommandation intelligente : le frontend demande des lieux pour un match → le backend calcule distance et score → il interroge éventuellement le service IA d'occupation → il renvoie une liste triée de venues avec raisons (ex. CLOSEST_LOW_CROWD)."
  ),
  p(
    "Schéma logique (résumé) : React (UI) ↔ Spring Boot (API) ↔ PostgreSQL (données) ; Spring Boot ↔ FastAPI/IA (prédictions) ; Spring Boot ↔ Stripe (paiements).",
    { italics: true }
  ),

  h3("II.9.2 Couches de sécurité"),
  p("La sécurité est intégrée à plusieurs niveaux :"),
  bullet("Authentification JWT et filtre Spring Security.", "bullets5"),
  bullet(
    "Autorisation par rôles (FanRoute, OwnerRoute, AdminRoute côté UI ; SecurityConfig côté API).",
    "bullets5"
  ),
  bullet("Validation des DTOs (@Valid) et gestion centralisée des exceptions.", "bullets5"),
  bullet("Secrets externalisés (.env), jamais commités en clair.", "bullets5"),
  bullet("Paiements délégués à Stripe (pas de stockage de numéros de carte).", "bullets5"),
  bullet("Vérification documentaire des owners avant approbation.", "bullets5"),

  simpleTable(
    ["Rôle", "Permissions principales"],
    [
      ["FAN", "Réserver, payer, notifications, recommandations"],
      ["OWNER", "Gérer business, occupation, check-in, vérification"],
      ["ADMIN", "Valider businesses, analytics, compétitions"],
    ],
    [2200, 7438]
  ),
  caption("Tableau 6 — Rôles et permissions"),

  h3("II.9.3 Paragraphe sur la sécurité"),
  p(
    "La sécurité constitue un pilier du projet. Au-delà de l'authentification et du contrôle d'accès, FanConnect 2030 limite la surface d'attaque en séparant les responsabilités : le frontend ne détient jamais la clé secrète Stripe ni les secrets JWT ; le service IA n'expose que des endpoints de prédiction ; la base est accessible uniquement via le backend. Les migrations Flyway assurent un schéma contrôlé, et les uploads de vérification sont stockés de manière isolée. En production, le déploiement doit imposer HTTPS, un reverse proxy (Nginx), des politiques CORS restrictives et une rotation des secrets."
  ),

  h2("II.10 Réalisation"),
  h3("II.10.1 Modules réalisés"),
  bullet("Authentification et gestion des profils.", "bullets6"),
  bullet("Match Center Coupe du Monde (calendrier, groupes, standings).", "bullets6"),
  bullet("Catalogue businesses + carte / géolocalisation.", "bullets6"),
  bullet("Wizard de réservation + paiement Stripe.", "bullets6"),
  bullet("Dashboards Owner et Admin.", "bullets6"),
  bullet("Occupation live + snapshots historiques.", "bullets6"),
  bullet("Service IA de prédiction d'affluence (Random Forest).", "bullets6"),
  bullet("Moteur de recommandations proximity-first.", "bullets6"),

  h3("II.10.2 Captures d'écran"),
  p(
    "Cette sous-section présente les principales interfaces réalisées. Chaque capture est accompagnée d'une courte description précisant l'acteur concerné et le besoin couvert."
  ),
  ...screenshotBlock(
    "01-accueil-hero",
    "Figure 8 — Page d'accueil (Hero FanConnect)",
    "Acteur : Visiteur / Fan. Écran d'entrée de la plateforme présentant la proposition de valeur (réserver un café pour regarder un match), l'accès à la Coupe du Monde 2030 et les actions principales (explorer les lieux, Match Center)."
  ),
  ...screenshotBlock(
    "02-match-center",
    "Figure 9 — Match Center Coupe du Monde",
    "Acteur : Fan. Centre de matchs dédié à la Coupe du Monde : onglets Matchs, Calendrier, Groupes, Classements et Équipes. Permet de consulter le calendrier et d'accéder ensuite aux lieux recommandés pour un match."
  ),
  ...screenshotBlock(
    "03-liste-cafes",
    "Figure 10 — Catalogue des cafés / lieux",
    "Acteur : Fan. Liste des établissements disponibles (cartes avec image, ville, capacité, statut). Sert de point d'entrée pour découvrir un lieu et lancer une réservation."
  ),
  ...screenshotBlock(
    "10-cafe-details-occupation",
    "Figure 11 — Détail d'un établissement et occupation",
    "Acteur : Fan. Fiche détaillée d'un café (adresse, capacité, description) avec informations utiles avant réservation, notamment le contexte d'occupation / capacité du lieu."
  ),
  ...screenshotBlock(
    "06-match-detail-recommandations",
    "Figure 12 — Recommandations de lieux pour un match",
    "Acteur : Fan. Écran lié au Match Center permettant d'associer un match à des lieux recommandés (proximité + affluence). Illustre le volet intelligent de suggestion de venues."
  ),
  ...screenshotBlock(
    "08-booking-wizard",
    "Figure 13 — Wizard de réservation",
    "Acteur : Fan authentifié. Parcours guidé de réservation (multi-étapes) : choix du lieu/espace, confirmation des détails, puis bascule vers le paiement. Couvre le besoin central de réserver une place pour un match."
  ),
  ...screenshotBlock(
    "12-paiement-stripe",
    "Figure 14 — Étape de paiement (Stripe)",
    "Acteur : Fan. Étape du parcours de réservation dédiée au paiement en ligne via Stripe (mode test). Garantit un encaissement sécurisé sans stockage de numéro de carte dans FanConnect."
  ),
  ...screenshotBlock(
    "09-owner-dashboard",
    "Figure 15 — Dashboard Owner",
    "Acteur : Propriétaire (Owner). Tableau de bord permettant de gérer ses établissements, suivre les réservations/occupation et accéder aux actions de vérification et de check-in."
  ),
  ...screenshotBlock(
    "05-admin-dashboard",
    "Figure 16 — Dashboard Admin (vérification / analytics)",
    "Acteur : Administrateur. Vue globale de la plateforme (utilisateurs, établissements, réservations, revenus) avec panneaux de vérification, compétitions et analytics."
  ),
  ...screenshotBlock(
    "13-intelligence-occupation",
    "Figure 17 — Intelligence d'occupation / prédiction IA",
    "Acteur : Fan / Owner. Visualisation liée à l'occupation du lieu (capacité, remplissage). S'appuie sur le service IA (Random Forest) pour anticiper l'affluence et guider la réservation."
  ),
  ...screenshotBlock(
    "04-login",
    "Figure 18 — Authentification",
    "Acteur : Tous. Écran de connexion JWT permettant d'accéder aux espaces protégés (Fan, Owner, Admin) selon le rôle de l'utilisateur."
  ),

  h3("II.10.3 Extraits de code source"),
  p("Exemple 1 — Endpoint de prédiction IA (FastAPI) :"),
  p('@app.post("/predict")', { align: AlignmentType.LEFT, size: 20 }),
  p("def predict_occupancy(request: PredictRequest):", { align: AlignmentType.LEFT, size: 20 }),
  p("    payload = request.model_dump(by_alias=False)", { align: AlignmentType.LEFT, size: 20 }),
  p("    return predict(payload)", { align: AlignmentType.LEFT, size: 20 }),
  blankLine(),
  p(
    "Exemple 2 — Entraînement Random Forest (extrait conceptuel) : le service génère / charge des features (occupation courante, historique, horizon temporel avant kickoff, fraîcheur du report owner, etc.), entraîne un RandomForestRegressor, persiste le modèle (.pkl) et expose des prédictions à 1h, 2h et au coup d'envoi, avec niveau de risque et recommandation textuelle."
  ),
  blankLine(),
  p(
    "Exemple 3 — Recommandation de lieux (backend) : pour un match donné, le service charge les businesses approuvés, élargit progressivement le rayon de recherche (5 km → 10 km → 20 km), calcule un score IA combinant distance et occupation, puis retourne une liste triée avec un code de raison (ex. CLOSEST_LOW_CROWD)."
  ),
  placeholder("Ajouter 1 à 2 extraits de code supplémentaires (contrôleur Spring, composant React, etc.)."),
  new Paragraph({ children: [new PageBreak()] }),

  // CONCLUSION
  h1("Conclusion et perspectives"),
  p(
    "Ce projet de fin d'études a permis de concevoir et de réaliser FanConnect 2030, une plateforme complète reliant supporters, établissements et données de matchs autour d'une expérience de réservation intelligente. Sur le plan technique, la séparation backend / frontend / service IA a favorisé la modularité. Sur le plan fonctionnel, l'intégration de la prédiction d'affluence et des recommandations géolocalisées constitue un apport différenciant par rapport aux solutions classiques de réservation."
  ),
  p(
    "Les principaux apports personnels du stage / PFE incluent le renforcement des compétences en architecture full-stack, en sécurité des API, en intégration de paiements, et en mise en œuvre concrète d'un modèle de machine learning dans un produit métier."
  ),
  blankLine(),
  p("Perspectives d'évolution :"),
  bullet("Ajouter un assistant conversationnel IA (chatbot fan) pour guider la recherche de lieux.", "bullets7"),
  bullet("Améliorer le matching personnalisé selon les préférences et l'historique du supporter.", "bullets7"),
  bullet(
    "Mettre en place des alertes intelligentes (occupation, matchs favoris, meilleures fenêtres de réservation).",
    "bullets7"
  ),
  bullet(
    "Enrichir le modèle ML avec des données réelles de production et un suivi de performance (MAE, drift).",
    "bullets7"
  ),
  bullet("Développer une application mobile et des tableaux de bord avancés pour les owners.", "bullets7"),
  blankLine(),
  p(
    "En définitive, FanConnect 2030 pose les bases d'une solution scalable, utile et alignée avec les enjeux numériques de l'écosystème football autour de 2030."
  ),
  new Paragraph({ children: [new PageBreak()] }),

  // ANNEXES
  h1("Annexes"),
  h2("Annexe A — Tableaux de données"),
  p(
    "Cette annexe présente des extraits de données utilisées pour le développement, les tests et la démonstration de FanConnect 2030 (catalogue de matchs de démo, features du modèle d'occupation, comptes de test)."
  ),

  h3("A.1 Catalogue de matchs de démonstration (CDM 2030)"),
  p(
    "En l'absence de calendrier officiel 2030 et hors période de Coupe du Monde, un seeder injecte des matchs autour de la date du jour (live, terminé, à venir) afin que le Match Center et les réservations restent testables."
  ),
  simpleTable(
    ["ID externe", "Rencontre", "Statut", "Lieu"],
    [
      ["demo-wc2030-finished-1", "Sénégal – Croatie", "FINISHED", "Casablanca"],
      ["demo-wc2030-live-1", "Maroc – Espagne", "LIVE", "Rabat"],
      ["demo-wc2030-live-2", "Portugal – France", "LIVE", "Lisbonne"],
      ["demo-wc2030-today-1", "Brésil – Argentine", "SCHEDULED", "Tanger"],
      ["demo-wc2030-today-2", "Allemagne – Angleterre", "SCHEDULED", "Madrid"],
      ["demo-wc2030-tomorrow-1", "Maroc – Portugal", "SCHEDULED", "Casablanca"],
      ["demo-wc2030-upcoming-2", "Maroc – Brésil (finale)", "SCHEDULED", "Casablanca"],
    ],
    [2400, 2800, 1800, 2638]
  ),
  caption("Tableau A.1 — Extrait du catalogue de matchs de démo"),

  h3("A.2 Variables du modèle d'occupation (Random Forest)"),
  simpleTable(
    ["Feature", "Signification"],
    [
      ["current_occupancy_pct", "Occupation actuelle (en %)"],
      ["checked_in_ratio", "Places check-in / capacité"],
      ["confirmed_ratio", "Réservations confirmées non arrivées / capacité"],
      ["pending_ratio", "Réservations en attente / capacité"],
      ["owner_report_fresh", "1 si le gérant a déclaré l'affluence récemment"],
      ["match_importance", "Importance du match (groupe, demi, finale)"],
      ["minutes_to_kickoff_norm", "Temps restant avant le coup d'envoi (normalisé)"],
      ["hour_of_day / day_of_week", "Heure et jour (saisonnalité)"],
      ["historical_peak_pct", "Pic historique d'occupation du lieu"],
      ["horizon_hours", "Horizon de prédiction (1 h, 2 h, kickoff)"],
    ],
    [3600, 6038]
  ),
  caption("Tableau A.2 — Features du service IA d'occupation"),

  h3("A.3 Exemple de snapshot d'occupation"),
  simpleTable(
    ["Champ", "Exemple"],
    [
      ["Café", "Green Leaf Café — Casablanca"],
      ["Match", "Maroc vs Espagne (LIVE)"],
      ["Capacité", "40"],
      ["Check-in / confirmés / pending", "8 / 12 / 4"],
      ["Occupation effective", "≈ 55 % (ORANGE)"],
      ["Prédiction kickoff", "78 % (risque MEDIUM)"],
      ["Recommandation", "Book soon — crowd building fast"],
    ],
    [3600, 6038]
  ),
  caption("Tableau A.3 — Exemple de données d'occupation pour un couple café × match"),

  h3("A.4 Comptes de démonstration"),
  simpleTable(
    ["Rôle", "Identifiant", "Mot de passe"],
    [
      ["Administrateur", "admin@fanconnect.com", "admin123"],
      ["Fan", "compte créé via /register (rôle FAN_USER)", "choisi à l'inscription"],
      ["Owner", "compte créé via /register (rôle BUSINESS_OWNER)", "choisi à l'inscription"],
    ],
    [2200, 4800, 2638]
  ),
  caption("Tableau A.4 — Comptes utilisés pour les tests et la soutenance"),

  h3("A.5 Statuts métier"),
  simpleTable(
    ["Objet", "Valeurs"],
    [
      ["Reservation", "PENDING → CONFIRMED → CHECKED_IN (ou CANCELLED)"],
      ["Payment", "PENDING → PAID (ou FAILED / REFUNDED)"],
      ["Business", "PENDING → APPROVED (ou REJECTED / DISABLED)"],
      ["Match", "SCHEDULED → LIVE → FINISHED (ou CANCELLED)"],
      ["Occupation", "GREEN / ORANGE / RED"],
    ],
    [2800, 6838]
  ),
  caption("Tableau A.5 — Principaux statuts du domaine"),

  h2("Annexe B — Codes sources complémentaires"),
  p(
    "Les extraits ci-dessous illustrent des points d'architecture déjà présentés : sécurité des API, réservation fan, features IA, client HTTP frontend et construction Docker."
  ),

  h3("B.1 Configuration Spring Security (extrait)"),
  p("Fichier : backend/.../config/SecurityConfig.java — routes publiques vs Fan / Owner / Admin."),
  codeLine(".authorizeHttpRequests(auth -> auth"),
  codeLine("    .requestMatchers(\"/auth/**\", \"/swagger-ui/**\").permitAll()"),
  codeLine("    .requestMatchers(HttpMethod.GET, \"/matches/**\").permitAll()"),
  codeLine("    .requestMatchers(\"/assistant/**\").permitAll()"),
  codeLine("    .requestMatchers(\"/fan/**\").hasRole(\"FAN_USER\")"),
  codeLine("    .requestMatchers(\"/owner/**\").hasAnyRole(\"BUSINESS_OWNER\", \"ADMIN\")"),
  codeLine("    .requestMatchers(\"/admin/**\").hasRole(\"ADMIN\")"),
  codeLine("    .anyRequest().authenticated())"),
  blankLine(),

  h3("B.2 Création d'une réservation fan"),
  p("Fichier : backend/.../controller/FanBookingController.java"),
  codeLine("@PostMapping"),
  codeLine("@PreAuthorize(\"hasRole('FAN_USER')\")"),
  codeLine("public ResponseEntity<ApiResponse<ReservationResponse>> create("),
  codeLine("        @Valid @RequestBody CreateBusinessBookingRequest request) {"),
  codeLine("    ReservationResponse booking = bookingService.createBusinessBooking(request);"),
  codeLine("    return ResponseEntity.status(HttpStatus.CREATED)"),
  codeLine("            .body(ApiResponse.success(\"Booking created — proceed to payment\", booking));"),
  codeLine("}"),
  blankLine(),

  h3("B.3 Construction du vecteur de features IA"),
  p("Fichier : ai-service/app/features.py"),
  codeLine("return np.array(["),
  codeLine("    current,"),
  codeLine("    checked_in / capacity,"),
  codeLine("    confirmed / capacity,"
  ),
  codeLine("    pending / capacity,"),
  codeLine("    1.0 if payload.get(\"owner_report_fresh\") else 0.0,"),
  codeLine("    float(payload.get(\"match_importance\", 0.5)),"),
  codeLine("    min(1.0, minutes_to_kickoff / 360.0),"),
  codeLine("    horizon_hours,"),
  codeLine("], dtype=np.float32)"),
  blankLine(),

  h3("B.4 Client HTTP React (JWT)"),
  p("Fichier : frontend/src/api/axios.js"),
  codeLine("api.interceptors.request.use((config) => {"),
  codeLine("  const token = authStorage.getToken();"),
  codeLine("  if (token) {"),
  codeLine("    config.headers.Authorization = `Bearer ${token}`;"),
  codeLine("  }"),
  codeLine("  return config;"),
  codeLine("});"),
  blankLine(),

  h3("B.5 Dockerfile du backend (multi-stage)"),
  p("Fichier : docker/backend/Dockerfile"),
  codeLine("FROM maven:3.9.9-eclipse-temurin-21 AS build"),
  codeLine("WORKDIR /app"),
  codeLine("COPY backend/pom.xml ."),
  codeLine("RUN mvn dependency:go-offline -B"),
  codeLine("COPY backend/src ./src"),
  codeLine("RUN mvn clean package -DskipTests -B"),
  codeLine("FROM eclipse-temurin:21-jre-alpine"),
  codeLine("COPY --from=build /app/target/*.jar app.jar"),
  codeLine("ENTRYPOINT [\"java\", \"-jar\", \"app.jar\"]"),
  blankLine(),
  p(
    "Ces extraits ne remplacent pas le dépôt Git : ils servent de preuves de conception (sécurité par rôles, wizard de réservation, pipeline ML, client authentifié, industrialisation Docker)."
  ),
  h2("Annexe C — Glossaire"),
  bullet("Fan : utilisateur supporter réservant une place.", "bullets8"),
  bullet("Owner : propriétaire d'établissement.", "bullets8"),
  bullet("Occupation / Occupancy : taux de remplissage d'un lieu.", "bullets8"),
  bullet(
    "Random Forest : algorithme d'apprentissage automatique par forêts d'arbres décisionnels.",
    "bullets8"
  ),
  bullet("JWT : JSON Web Token, mécanisme d'authentification stateless.", "bullets8"),
  new Paragraph({ children: [new PageBreak()] }),

  // REFERENCES
  h1("Références bibliographiques"),
  h2("Liens web / plateformes e-learning / MOOC"),
  numbered("Documentation Spring Boot — https://docs.spring.io/spring-boot/", "refs"),
  numbered("Documentation React — https://react.dev/", "refs"),
  numbered("FastAPI — https://fastapi.tiangolo.com/", "refs"),
  numbered("scikit-learn — https://scikit-learn.org/", "refs"),
  numbered("Stripe Docs — https://docs.stripe.com/", "refs"),
  numbered("PostgreSQL Documentation — https://www.postgresql.org/docs/", "refs"),
  numbered("OpenClassrooms / FUN-MOOC / Coursera / edX / Udemy — parcours Java, React, ML", "refs"),

  h2("Articles / magazines / webinaires"),
  placeholder("Ajouter articles de presse ou webinaires suivis pendant le stage."),

  h2("Articles de recherche"),
  placeholder(
    "Ajouter 1–3 références académiques (recommandation, prédiction d'affluence, UX réservation, etc.)."
  ),

  h2("Livres"),
  p("Gamma E. et al., Design Patterns: Elements of Reusable Object-Oriented Software.", {
    italics: true, size: 22,
  }),
  p("Fowler M., Patterns of Enterprise Application Architecture.", { italics: true, size: 22 }),
  placeholder("Compléter avec vos ouvrages de référence (UML, Spring, ML, gestion de projet)."),
  blankLine(),
  blankLine(),
  p("— Fin du rapport —", { align: AlignmentType.CENTER, bold: true, color: BLUE }),
  p("Complétez tous les champs [À COMPLÉTER] avant impression / dépôt.", {
    align: AlignmentType.CENTER, italics: true, size: 20, color: PLACEHOLDER,
  }),
];

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Times New Roman", size: 24 } } },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 32, bold: true, font: "Times New Roman", color: BLUE },
        paragraph: { spacing: { before: 360, after: 240 }, outlineLevel: 0 },
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 28, bold: true, font: "Times New Roman", color: BLUE },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 },
      },
      {
        id: "Heading3",
        name: "Heading 3",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 24, bold: true, font: "Times New Roman", color: "2E75B6" },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 },
      },
    ],
  },
  numbering: {
    config: [
      bulletLevel("bullets"),
      bulletLevel("bullets2"),
      bulletLevel("bullets3"),
      bulletLevel("bullets4"),
      bulletLevel("bullets5"),
      bulletLevel("bullets6"),
      bulletLevel("bullets7"),
      bulletLevel("bullets8"),
      numberLevel("frs", "%1."),
      numberLevel("nfrs", "%1."),
      numberLevel("numbers", "%1."),
      numberLevel("refs", "[%1]"),
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: A4_W, height: A4_H },
          margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BLUE, space: 4 } },
              children: [
                new TextRun({
                  text: "Rapport PFE — FanConnect 2030",
                  font: "Times New Roman",
                  size: 18,
                  italics: true,
                  color: GRAY,
                }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              border: { top: { style: BorderStyle.SINGLE, size: 6, color: BLUE, space: 4 } },
              children: [
                new TextRun({ text: "Page ", font: "Times New Roman", size: 18, color: GRAY }),
                new TextRun({ children: [PageNumber.CURRENT], font: "Times New Roman", size: 18, color: GRAY }),
                new TextRun({ text: " / ", font: "Times New Roman", size: 18, color: GRAY }),
                new TextRun({
                  children: [PageNumber.TOTAL_PAGES],
                  font: "Times New Roman",
                  size: 18,
                  color: GRAY,
                }),
              ],
            }),
          ],
        }),
      },
      children,
    },
  ],
});

async function main() {
  const buffer = await Packer.toBuffer(doc);
  const candidates = [
    path.join(__dirname, "Rapport_PFE_FanConnect_2030.docx"),
    path.join(__dirname, "Rapport_PFE_FanConnect_2030_v2.docx"),
    path.join(__dirname, "Rapport_PFE_FanConnect_2030_v3.docx"),
    path.join(__dirname, "Rapport_PFE_FanConnect_2030_GANTT.docx"),
    path.join(__dirname, "Rapport_PFE_FanConnect_2030_v4.docx"),
  ];
  let out = null;
  let lastErr = null;
  for (const candidate of candidates) {
    try {
      fs.writeFileSync(candidate, buffer);
      out = candidate;
      break;
    } catch (err) {
      lastErr = err;
      if (!err || err.code !== "EBUSY") throw err;
    }
  }
  if (!out) throw lastErr || new Error("Impossible d'ecrire le rapport");
  console.log("OK:", out);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
