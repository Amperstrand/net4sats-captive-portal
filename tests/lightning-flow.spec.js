const { test, expect } = require('@playwright/test');
const LightningPage = require('./pages/LightningPage');

test.describe('Lightning Payment Flow', () => {
  let page;
  let lightning;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    lightning = new LightningPage(page);
    await lightning.navigate();
    await lightning.switchToLightning();
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('switch to Lightning tab shows Lightning interface', async () => {
    const activeTab = lightning.getActiveTab();
    await expect(activeTab).toHaveAttribute('data-active', 'true');
    const text = await activeTab.textContent();
    expect(text).toContain('Lightning');
  });

  test('amount input shows default value', async () => {
    const input = lightning.getAmountInput();
    await expect(input).toBeVisible();
    const value = await input.inputValue();
    expect(value).toBeTruthy();
    expect(Number(value)).toBeGreaterThan(0);
  });

  test('increment button works', async () => {
    const before = Number(await lightning.getAmount());
    await lightning.clickIncrement();
    const after = Number(await lightning.getAmount());
    expect(after).toBeGreaterThan(before);
  });

  test('decrement button works', async () => {
    await lightning.clickIncrement();
    const before = Number(await lightning.getAmount());
    await lightning.clickDecrement();
    const after = Number(await lightning.getAmount());
    expect(after).toBeLessThan(before);
  });

  test('mint selection works', async () => {
    const mintOptions = lightning.getMintOptions();
    await expect(mintOptions).toHaveCount(3);
    await mintOptions.nth(1).click();
    const active = lightning.page.locator('.tollgate-captive-portal-method-options button.active');
    await expect(active).toBeVisible();
  });

  test('purchase button shows price info', async () => {
    const btn = lightning.getPurchaseButton();
    await expect(btn).toBeVisible();
    const text = await btn.textContent();
    expect(text).toContain('Pay');
    expect(text).toContain('sat');
  });

  test('click purchase: processing state shows', async () => {
    await lightning.clickPurchase();
    expect(await lightning.isProcessing()).toBe(true);
    await page.screenshot({ path: 'tests/screenshots/lightning-processing.png', fullPage: true });
  });

  test('mock invoice generated: QR code visible', async () => {
    await lightning.clickPurchase();
    await expect(page.locator('.tollgate-captive-portal-method-invoice')).toBeVisible({ timeout: 15000 });
    await expect(lightning.getInvoiceQrCode()).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/lightning-invoice.png', fullPage: true });
  });

  test('Open Wallet link present', async () => {
    await lightning.clickPurchase();
    await expect(page.locator('.tollgate-captive-portal-method-invoice')).toBeVisible({ timeout: 15000 });
    const link = lightning.getOpenWalletLink();
    await expect(link).toBeVisible();
    const text = await link.textContent();
    expect(text).toContain('Open Wallet');
  });

  test('Copy button present', async () => {
    await lightning.clickPurchase();
    await expect(page.locator('.tollgate-captive-portal-method-invoice')).toBeVisible({ timeout: 15000 });
    const btn = lightning.getCopyButton();
    await expect(btn).toBeVisible();
    const text = await btn.textContent();
    expect(text).toContain('Copy');
  });

  test('cancel button returns to input state', async () => {
    await lightning.clickPurchase();
    await expect(page.locator('.tollgate-captive-portal-method-invoice')).toBeVisible({ timeout: 15000 });
    await lightning.clickCancel();
    await expect(lightning.getAmountInput()).toBeVisible();
    await expect(page.locator('.tollgate-captive-portal-method-invoice')).not.toBeVisible();
  });

  test('mock payment auto-detects: access granted', async () => {
    await lightning.clickPurchase();
    await expect(page.locator('.tollgate-captive-portal-method-invoice')).toBeVisible({ timeout: 15000 });
    await expect(lightning.isAccessGranted()).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'tests/screenshots/lightning-access-granted.png', fullPage: true });
  });
});
