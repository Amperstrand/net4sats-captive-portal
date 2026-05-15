const { test, expect } = require('@playwright/test');
const CaptivePortalPage = require('./pages/CaptivePortalPage');

test.describe('UI Components', () => {
  let page;
  let portal;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    portal = new CaptivePortalPage(page);
    await portal.navigate();
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('size selector: click 15 min sets active state', async () => {
    await portal.selectPreset('15 min');
    const pills = portal.getPills();
    const classes = await pills.nth(0).getAttribute('class');
    expect(classes).toContain('active');
  });

  test('size selector: click 1 hour sets active state', async () => {
    await portal.selectPreset('1 hour');
    const pills = portal.getPills();
    const classes = await pills.nth(1).getAttribute('class');
    expect(classes).toContain('active');
  });

  test('size selector: click 10 hours sets active state', async () => {
    await portal.selectPreset('10 hours');
    const pills = portal.getPills();
    const classes = await pills.nth(2).getAttribute('class');
    expect(classes).toContain('active');
  });

  test('size selector: click More shows custom input', async () => {
    await portal.clickMore();
    const customInput = portal.getCustomInput();
    await expect(customInput).toBeVisible();
    const pills = portal.getPills();
    const lastPillClasses = await pills.nth(3).getAttribute('class');
    expect(lastPillClasses).toContain('active');
  });

  test('size selector: custom input accepts numbers', async () => {
    await portal.clickMore();
    await portal.enterCustomAmount(500);
    const input = portal.getCustomInput();
    await expect(input).toHaveValue('500');
  });

  test('PWA modal shows on first visit', async ({ browser }) => {
    const freshContext = await browser.newContext();
    const freshPage = await freshContext.newPage();
    const freshPortal = new CaptivePortalPage(freshPage);
    await freshPortal.navigateWithPwaModal();
    await expect(freshPortal.getPwaModal()).toBeVisible();
    await freshContext.close();
  });

  test('PWA modal dismissed by overlay click', async ({ browser }) => {
    const freshContext = await browser.newContext();
    const freshPage = await freshContext.newPage();
    const freshPortal = new CaptivePortalPage(freshPage);
    await freshPortal.navigateWithPwaModal();
    await expect(freshPortal.getPwaModal()).toBeVisible();
    await freshPage.locator('.tollgate-captive-portal-pwa-overlay').click({ position: { x: 5, y: 5 } });
    await expect(freshPortal.getPwaModal()).not.toBeVisible();
    await freshContext.close();
  });

  test('PWA modal dismissed by close button', async ({ browser }) => {
    const freshContext = await browser.newContext();
    const freshPage = await freshContext.newPage();
    const freshPortal = new CaptivePortalPage(freshPage);
    await freshPortal.navigateWithPwaModal();
    await expect(freshPortal.getPwaModal()).toBeVisible();
    await freshPage.locator('.tollgate-captive-portal-pwa-close').click();
    await expect(freshPortal.getPwaModal()).not.toBeVisible();
    await freshContext.close();
  });

  test('tab switching between Cashu and Lightning works', async () => {
    await portal.switchToLightning();
    const activeTab = portal.getActiveTab();
    let text = await activeTab.textContent();
    expect(text).toContain('Lightning');

    await portal.switchToCashu();
    const activeTabAfter = portal.getActiveTab();
    text = await activeTabAfter.textContent();
    expect(text).toContain('Cashu');
  });

  test('language switcher shows available language options', async () => {
    const langSelect = portal.getLanguageSelect();
    await expect(langSelect).toBeVisible();
    const options = langSelect.locator('option');
    const count = await options.count();
    expect(count).toBeGreaterThanOrEqual(1);
    const hasEn = await options.allTextContents();
    expect(hasEn.some(o => o.includes('en'))).toBe(true);
  });

  test('footer link goes to tollgate.me', async () => {
    const link = portal.getPoweredByLink();
    const href = await link.getAttribute('href');
    expect(href).toContain('tollgate.me');
  });

  test('demo banner shows "Demo Mode — using simulated data"', async () => {
    const banner = portal.getDemoBanner();
    const text = await banner.textContent();
    expect(text.trim()).toBe('Demo Mode — using simulated data');
  });
});
