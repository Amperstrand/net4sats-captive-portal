const { test, expect } = require('@playwright/test');
const CaptivePortalPage = require('./pages/CaptivePortalPage');
const CashuPage = require('./pages/CashuPage');
const LightningPage = require('./pages/LightningPage');

test.describe('Screenshot Capture', () => {
  test('01-initial-load with PWA modal', async ({ browser }) => {
    const page = await browser.newPage();
    const portal = new CaptivePortalPage(page);
    await portal.navigateWithPwaModal();
    await page.screenshot({ path: 'tests/screenshots/01-initial-load.png', fullPage: true });
    await page.close();
  });

  test('02-cashu-tab-clean (modal dismissed)', async ({ browser }) => {
    const page = await browser.newPage();
    const portal = new CaptivePortalPage(page);
    await portal.navigate();
    await page.screenshot({ path: 'tests/screenshots/02-cashu-tab-clean.png', fullPage: true });
    await page.close();
  });

  test('03-lightning-tab-clean', async ({ browser }) => {
    const page = await browser.newPage();
    const portal = new CaptivePortalPage(page);
    await portal.navigate();
    await portal.switchToLightning();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'tests/screenshots/03-lightning-tab-clean.png', fullPage: true });
    await page.close();
  });

  test('04-cashu-15min-selected', async ({ browser }) => {
    const page = await browser.newPage();
    const portal = new CaptivePortalPage(page);
    await portal.navigate();
    await portal.selectPreset('15 min');
    await page.screenshot({ path: 'tests/screenshots/04-cashu-15min-selected.png', fullPage: true });
    await page.close();
  });

  test('05-cashu-valid-token', async ({ browser }) => {
    const page = await browser.newPage();
    const cashu = new CashuPage(page);
    await cashu.navigate();
    await cashu.fillToken(CashuPage.VALID_TOKEN_420);
    await expect(page.locator('.status.success')).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'tests/screenshots/05-cashu-valid-token.png', fullPage: true });
    await page.close();
  });

  test('06-cashu-insufficient-funds', async ({ browser }) => {
    const page = await browser.newPage();
    const cashu = new CashuPage(page);
    await cashu.navigate();
    await cashu.fillToken(CashuPage.VALID_TOKEN_420);
    await expect(page.locator('.status.success')).toBeVisible({ timeout: 10000 });

    const mintOptions = cashu.getMintOptions();
    const count = await mintOptions.count();
    for (let i = 0; i < count; i++) {
      const text = await mintOptions.nth(i).textContent();
      if (text.includes('500 sat')) {
        await mintOptions.nth(i).click();
        break;
      }
    }
    await expect(page.locator('.status.error')).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/06-cashu-insufficient-funds.png', fullPage: true });
    await page.close();
  });

  test('07-lightning-invoice', async ({ browser }) => {
    const page = await browser.newPage();
    const lightning = new LightningPage(page);
    await lightning.navigate();
    await lightning.switchToLightning();
    await lightning.clickPurchase();
    await expect(page.locator('.tollgate-captive-portal-method-invoice')).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: 'tests/screenshots/07-lightning-invoice.png', fullPage: true });
    await page.close();
  });

  test('08-lightning-access-granted', async ({ browser }) => {
    const page = await browser.newPage();
    await page.route('**/balance.html', route => route.fulfill({ status: 200, body: '<html><body>Balance page</body></html>', contentType: 'text/html' }));
    const lightning = new LightningPage(page);
    await lightning.navigate();
    await lightning.switchToLightning();
    await lightning.clickPurchase();
    await expect(page.locator('.tollgate-captive-portal-method-invoice')).toBeVisible({ timeout: 15000 });
    await expect(lightning.isAccessGranted()).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(700);
    await page.screenshot({ path: 'tests/screenshots/08-lightning-access-granted.png' });
    await page.close();
  });
});
