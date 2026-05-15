const { test, expect } = require('@playwright/test');
const CaptivePortalPage = require('./pages/CaptivePortalPage');

test.describe('Smoke Tests', () => {
  let page;
  let portal;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    portal = new CaptivePortalPage(page);
    await portal.navigate();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('page loads without console errors', async () => {
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.reload();
    await portal.waitForLoad();
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('net::ERR') && !e.includes('404')
    );
    expect(criticalErrors.length).toBe(0);
  });

  test('title is "Tollgate Captive Portal"', async () => {
    await expect(page).toHaveTitle('Tollgate Captive Portal');
  });

  test('demo banner is visible', async () => {
    const banner = portal.getDemoBanner();
    await expect(banner).toBeVisible();
    const text = await banner.textContent();
    expect(text).toContain('Demo Mode');
    expect(text).toContain('simulated data');
  });

  test('logo renders', async () => {
    const logo = portal.getLogo();
    await expect(logo).toBeVisible();
  });

  test('both tabs (Cashu/Lightning) are visible', async () => {
    await expect(portal.getCashuTab()).toBeVisible();
    await expect(portal.getLightningTab()).toBeVisible();
    const cashuText = await portal.getCashuTab().textContent();
    const lightningText = await portal.getLightningTab().textContent();
    expect(cashuText).toContain('Cashu');
    expect(lightningText).toContain('Lightning');
  });

  test('MAC address shows "1A:2B:3C:4D:5E"', async () => {
    const mac = portal.getMacAddress();
    await expect(mac).toBeVisible();
    const text = await mac.textContent();
    expect(text).toContain('1A:2B:3C:4D:5E');
  });

  test('footer shows "net4sats · Powered by TollGate"', async () => {
    const footerText = await portal.getFooterText();
    expect(footerText).toContain('net4sats');
    expect(footerText).toContain('Powered by');
    expect(footerText).toContain('TollGate');
  });

  test('size selector shows 4 buttons (15 min, 1 hour, 10 hours, More)', async () => {
    const pills = portal.getPills();
    await expect(pills).toHaveCount(4);
    const texts = await pills.allTextContents();
    expect(texts.map(t => t.trim())).toEqual(['15 min', '1 hour', '10 hours', 'More']);
  });
});
