const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer-core");

const BASE = "http://localhost:5173";
const OUT = path.join(__dirname, "screenshots");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function shot(page, name) {
  await sleep(1000);
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log("OK", name, fs.statSync(file).size);
}

async function login(page, email, password) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle2", timeout: 60000 });
  await page.waitForSelector('input[type="password"]', { timeout: 15000 });
  const emailSel =
    (await page.$('input[type="email"]')) ||
    (await page.$('input[name="email"]')) ||
    (await page.$('input[type="text"]'));
  await emailSel.click({ clickCount: 3 });
  await emailSel.type(email, { delay: 15 });
  const pass = await page.$('input[type="password"]');
  await pass.click({ clickCount: 3 });
  await pass.type(password, { delay: 15 });
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

  await login(page, "owner@fanconnect.com", "owner12345");
  await page.goto(`${BASE}/owner/dashboard`, { waitUntil: "networkidle2", timeout: 60000 });
  await shot(page, "09-owner-dashboard");

  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  await login(page, "fan@fanconnect.com", "fan12345");
  await page.goto(`${BASE}/book?businessId=1`, { waitUntil: "networkidle2", timeout: 60000 });
  await shot(page, "08-booking-wizard");

  await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle2", timeout: 60000 });
  await shot(page, "11-fan-dashboard");

  // Try advancing booking wizard a few steps for payment-ish screen if possible
  await page.goto(`${BASE}/book?businessId=1`, { waitUntil: "networkidle2", timeout: 60000 });
  for (let i = 0; i < 4; i++) {
    const next = await page.$('button:has-text("Next"), button:has-text("Suivant"), button:has-text("Continue")');
    // puppeteer-core CSS :has-text may not work; use evaluate
    const clicked = await page.evaluate(() => {
      const buttons = [...document.querySelectorAll("button")];
      const btn = buttons.find((b) => /next|suivant|continue|continuer|réserver|reserver|confirm/i.test(b.textContent || ""));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    await sleep(800);
    if (!clicked) break;
  }
  await shot(page, "12-paiement-stripe");

  await browser.close();
  console.log("DONE");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
