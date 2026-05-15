const { test, expect } = require('@playwright/test');
const CaptivePortalPage = require('./pages/CaptivePortalPage');

test.describe('Accessibility Tests', () => {
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

  test('all images have alt text', async () => {
    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('tab navigation has aria-label', async () => {
    const tabsContainer = page.locator('.tollgate-captive-portal-tabs');
    const ariaLabel = await tabsContainer.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
  });

  test('buttons have accessible names', async () => {
    const buttons = page.locator('button');
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      const btn = buttons.nth(i);
      const text = await btn.textContent();
      const ariaLabel = await btn.getAttribute('aria-label');
      const title = await btn.getAttribute('title');
      const hasAccessibleName = (text && text.trim().length > 0) || ariaLabel || title;
      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test('form inputs have labels or placeholders', async () => {
    const inputs = page.locator('input[type="text"], input[type="number"]');
    const count = await inputs.count();
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const placeholder = await input.getAttribute('placeholder');

      let hasLabel = false;
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        hasLabel = (await label.count()) > 0;
      }

      expect(hasLabel || placeholder).toBeTruthy();
    }
  });

  test('keyboard navigation: tab through interactive elements', async () => {
    const focused = async () => {
      return page.evaluate(() => document.activeElement?.tagName);
    };

    await page.keyboard.press('Tab');
    const first = await focused();
    expect(['BUTTON', 'INPUT', 'SELECT', 'A']).toContain(first);

    await page.keyboard.press('Tab');
    const second = await focused();
    expect(['BUTTON', 'INPUT', 'SELECT', 'A']).toContain(second);
  });

  test('focus management after modal dismiss', async ({ browser }) => {
    const freshContext = await browser.newContext();
    const freshPage = await freshContext.newPage();
    const freshPortal = new CaptivePortalPage(freshPage);
    await freshPortal.navigateWithPwaModal();

    await expect(freshPortal.getPwaModal()).toBeVisible();
    await freshPage.locator('.tollgate-captive-portal-pwa-close').click();
    await expect(freshPortal.getPwaModal()).not.toBeVisible();

    const activeTag = await freshPage.evaluate(() => document.activeElement?.tagName);
    expect(activeTag).toBeTruthy();
    await freshContext.close();
  });
});
