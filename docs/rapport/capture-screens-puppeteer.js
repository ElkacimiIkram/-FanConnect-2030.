const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");

const BASE = "http://localhost:5173";
const OUT = path.join(__dirname, "screenshots");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
fs.mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function shot(page, name) {
  const file = path.join(OUT, `${name}.png`);
  await sleep(1200);
  await page.screenshot({ path: file, fullPage: true });
  console.log("OK", name, fs.statSync(file).size);
}

async function login(page, email, password) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle2", timeout: 60000 });
  await page.waitForSelector('input[type="password"]', { timeout: 15000 });
  const emailSel = await page.$('input[type="email"]') || await page.$('input[name="email"]') || await page.$('input[type="text"]');
  await emailSel.click({ clickCount: 3 });
  await emailSel.type(email, { delay: 20 });
  const pass = await page.$('input[type="password"]');
  await pass.click({ clickCount: 3 });
  await pass.type(password, { delay: 20 });
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: "networkidle2", timeout: 20000 }).catch(() => {}),
  ]);
  await sleep(1500);
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    defaultViewport: { width: 1440, height: 900 },
    args: ["--no-sandbox", "--disable-gpu"],
  });
  const page = await browser.newPage();

  await page.goto(`${BASE}/`, { waitUntil: "networkidle2", timeout: 60000 });
  await shot(page, "01-accueil-hero");

  await page.goto(`${BASE}/matches`, { waitUntil: "networkidle2", timeout: 60000 });
  await shot(page, "02-match-center");

  await page.goto(`${BASE}/cafes`, { waitUntil: "networkidle2", timeout: 60000 });
  await shot(page, "03-liste-cafes");

  // Cafe details / occupancy if available
  const cafeHref = await page.evaluate(() => {
    const a = document.querySelector('a[href^="/cafes/"]');
    return a ? a.getAttribute("href") : null;
  });
  if (cafeHref) {
    await page.goto(`${BASE}${cafeHref}`, { waitUntil: "networkidle2", timeout: 60000 });
    await shot(page, "10-cafe-details-occupation");
  }

  await page.goto(`${BASE}/login`, { waitUntil: "networkidle2", timeout: 60000 });
  await shot(page, "04-login");

  await page.goto(`${BASE}/register`, { waitUntil: "networkidle2", timeout: 60000 });
  await shot(page, "07-register");

  // Admin screens
  await login(page, "admin@fanconnect.com", "admin123");
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle2", timeout: 60000 });
  await shot(page, "05-admin-dashboard");

  // Match detail / recommendations
  await page.goto(`${BASE}/matches`, { waitUntil: "networkidle2", timeout: 60000 });
  const matchHref = await page.evaluate(() => {
    const a = [...document.querySelectorAll("a")].find((x) => /\/matches\//.test(x.getAttribute("href") || ""));
    return a ? a.getAttribute("href") : null;
  });
  if (matchHref) {
    await page.goto(`${BASE}${matchHref}`, { waitUntil: "networkidle2", timeout: 60000 });
    await shot(page, "06-match-detail-recommandations");
  } else {
    await shot(page, "06-match-detail-recommandations");
  }

  // Clear session for fan/owner redirects
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle2" });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });

  await page.goto(`${BASE}/book`, { waitUntil: "networkidle2", timeout: 60000 });
  await shot(page, "08-booking-wizard");

  await page.goto(`${BASE}/owner/dashboard`, { waitUntil: "networkidle2", timeout: 60000 });
  await shot(page, "09-owner-dashboard");

  await browser.close();
  console.log("DONE", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
