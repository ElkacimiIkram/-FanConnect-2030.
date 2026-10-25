/**
 * Rend les .puml FanConnect en PNG (Kroki, fallback plantuml.com).
 */
const fs = require("fs");
const path = require("path");
const https = require("https");
const zlib = require("zlib");

const SRC_DIR = __dirname;
const OUT_DIR = path.join(__dirname, "png");

const FILES = [
  "01-cas-utilisation.puml",
  "02-classes-principales.puml",
  "03-sequence-authentification.puml",
  "04-sequence-reservation-paiement.puml",
  "05-sequence-occupation.puml",
  "06-sequence-validation-owner.puml",
  "07-sequence-checkin-qr.puml",
  "08-sequence-sync-matchs.puml",
];

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";

function encode6bit(b) {
  if (b < 0) return ALPHABET[0];
  return ALPHABET[b] || "?";
}

function append3bytes(b1, b2, b3) {
  const c1 = b1 >> 2;
  const c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
  const c3 = ((b2 & 0xf) << 2) | (b3 >> 6);
  const c4 = b3 & 0x3f;
  return encode6bit(c1) + encode6bit(c2) + encode6bit(c3) + encode6bit(c4);
}

function encode64(data) {
  let r = "";
  for (let i = 0; i < data.length; i += 3) {
    if (i + 2 === data.length) r += append3bytes(data[i], data[i + 1], 0);
    else if (i + 1 === data.length) r += append3bytes(data[i], 0, 0);
    else r += append3bytes(data[i], data[i + 1], data[i + 2]);
  }
  return r;
}

function plantumlEncode(text) {
  const deflated = zlib.deflateRawSync(Buffer.from(text, "utf8"));
  return encode64(deflated);
}

function postKroki(puml) {
  const body = Buffer.from(puml, "utf8");
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "kroki.io",
        path: "/plantuml/png",
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          "Content-Length": body.length,
          Accept: "image/png",
        },
        timeout: 60000,
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const buf = Buffer.concat(chunks);
          if (res.statusCode !== 200) {
            reject(new Error(`Kroki ${res.statusCode}: ${buf.toString("utf8").slice(0, 500)}`));
            return;
          }
          resolve(buf);
        });
      }
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy(new Error("Kroki timeout"));
    });
    req.write(body);
    req.end();
  });
}

function getPlantumlCom(puml) {
  const encoded = plantumlEncode(puml);
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "www.plantuml.com",
        path: `/plantuml/png/${encoded}`,
        method: "GET",
        timeout: 60000,
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const buf = Buffer.concat(chunks);
          if (res.statusCode !== 200) {
            reject(new Error(`plantuml.com ${res.statusCode}: ${buf.toString("utf8").slice(0, 400)}`));
            return;
          }
          resolve(buf);
        });
      }
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy(new Error("plantuml.com timeout"));
    });
    req.end();
  });
}

function isPng(buf) {
  return buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
}

async function renderOne(file) {
  const puml = fs.readFileSync(path.join(SRC_DIR, file), "utf8");
  let buf;
  try {
    buf = await postKroki(puml);
  } catch (err) {
    console.warn(`  Kroki failed for ${file}: ${err.message}`);
    buf = await getPlantumlCom(puml);
  }
  if (!isPng(buf)) {
    throw new Error(`Not a PNG for ${file} (${buf.length} bytes)`);
  }
  const outName = file.replace(/\.puml$/, ".png");
  const outPath = path.join(OUT_DIR, outName);
  fs.writeFileSync(outPath, buf);
  console.log(`OK  ${outName}  (${buf.length} bytes)`);
  return outPath;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const rapportDir = path.resolve(__dirname, "..", "..", "rapport", "diagrams", "uml");
  fs.mkdirSync(rapportDir, { recursive: true });

  for (const file of FILES) {
    const outPath = await renderOne(file);
    const copy = path.join(rapportDir, path.basename(outPath));
    fs.copyFileSync(outPath, copy);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
