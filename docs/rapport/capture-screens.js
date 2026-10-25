/**
 * Capture FanConnect UI screenshots for PFE report section II.10.2
 */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE = process.env.FC_BASE || "http://localhost:5173";
const OUT = path.join(__dirname, "screenshots");
fs.mkdirSync(OUT, { recursive: true });

async function shot(page, name, fullPage = true) {
  const file = path.join(OUT, `${name}.png`);
  await page.waitForTimeout(800);
  await page.screenshot({ path: file, fullPage });
  console.log("OK", name, fs.statSync(file).size);
  return file;
}

async function login(page, email, password) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail" i]').first();
  const passInput = page.locator('input[type="password"]').first();
  await emailInput.fill(email);
  await passInput.fill(password);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(2000);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  // 1. Home
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await shot(page, "01-accueil-hero");

  // 2. Match Center
  await page.goto(`${BASE}/matches`, { waitUntil: "networkidle" });
  await shot(page, "02-match-center");

  // 3. Cafes / places
  await page.goto(`${BASE}/cafes`, { waitUntil: "networkidle" });
  await shot(page, "03-liste-cafes");

  // 4. Login page (before auth flows)
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await shot(page, "04-login", false);

  // Try admin login for dashboards
  try {
    await login(page, "admin@fanconnect.com", "admin123");
    await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
    await shot(page, "05-admin-dashboard");

    // Fan-ish pages if redirected; also try owner
    await page.goto(`${BASE}/matches`, { waitUntil: "networkidle" });
    // click first match if present
    const matchLink = page.locator('a[href*="/matches/"]').first();
    if (await matchLink.count()) {
      await matchLink.click();
      await page.waitForTimeout(1500);
      await shot(page, "06-match-detail-recommandations");
    } else {
      await shot(page, "06-match-detail-recommandations");
    }
  } catch (e) {
    console.warn("admin flow failed:", e.message);
  }

  // Logout by clearing storage then login as fan if possible via register page screenshot
  await context.clearCookies();
  await page.evaluate(() => localStorage.clear());

  await page.goto(`${BASE}/register`, { waitUntil: "networkidle" });
  await shot(page, "07-register", false);

  // Booking page may redirect if not fan — still capture login redirect or book
  await page.goto(`${BASE}/book`, { waitUntil: "networkidle" });
  await shot(page, "08-booking-wizard");

  await page.goto(`${BASE}/owner/dashboard`, { waitUntil: "networkidle" });
  await shot(page, "09-owner-dashboard");

  // Occupancy-related: try cafes details first card
  await page.goto(`${BASE}/cafes`, { waitUntil: "networkidle" });
  const cafe = page.locator('a[href*="/cafes/"]').first();
  if (await cafe.count()) {
    await cafe.click();
    await page.waitForTimeout(1500);
    await shot(page, "10-cafe-details-occupation");
  } else {
    await shot(page, "10-cafe-details-occupation");
  }

  await browser.close();
  console.log("DONE", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
