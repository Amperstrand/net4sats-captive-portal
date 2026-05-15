const { test, expect } = require('@playwright/test');
const CashuPage = require('./pages/CashuPage');

test.describe('Cashu Payment Flow', () => {
  let page;
  let cashu;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    cashu = new CashuPage(page);
    await cashu.navigate();
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('Cashu tab is default active tab', async () => {
    const activeTab = cashu.getActiveTab();
    await expect(activeTab).toHaveAttribute('data-active', 'true');
    const text = await activeTab.textContent();
    expect(text).toContain('Cashu');
  });

  test('empty state: input placeholder, disabled purchase button, mint options visible', async () => {
    const input = cashu.getTokenInput();
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('placeholder', 'cashuxyz…');

    const disabledBtn = cashu.getDisabledPurchaseButton();
    await expect(disabledBtn).toBeVisible();
    await expect(disabledBtn).toBeDisabled();

    const mintOptions = cashu.getMintOptions();
    await expect(mintOptions).toHaveCount(3);
  });

  test('paste invalid text (not cashu): CU101 error shows', async () => {
    await cashu.fillToken('invalid_text_not_cashu');
    await expect(page.locator('.status.error')).toBeVisible();
    const errorLabel = await cashu.getErrorLabel().textContent();
    expect(errorLabel).toContain('Invalid token format');
    const errorCode = await cashu.getErrorCode().textContent();
    expect(errorCode).toContain('CU101');
  });

  test('paste garbage starting with "cashu": CU102 error shows', async () => {
    await cashu.fillToken('cashuGarbageToken12345');
    await expect(page.locator('.status.error')).toBeVisible();
    const errorCode = await cashu.getErrorCode().textContent();
    expect(errorCode).toContain('CU102');
  });

  test('paste valid token (420 sats): success indicator shows, amount displays', async () => {
    await cashu.fillToken(CashuPage.VALID_TOKEN_420);
    await expect(page.locator('.status.success')).toBeVisible({ timeout: 10000 });
    const amount = await cashu.getTokenAmount().textContent();
    expect(amount).toContain('420');
    expect(amount).toContain('sat');
  });

  test('token with insufficient funds for 500sat mint: CU002 shows', async () => {
    await cashu.fillToken(CashuPage.VALID_TOKEN_420);
    await expect(page.locator('.status.success')).toBeVisible({ timeout: 10000 });

    const mintOptions = cashu.getMintOptions();
    const count = await mintOptions.count();
    for (let i = 0; i < count; i++) {
      const text = await mintOptions.nth(i).textContent();
      if (text.includes('500 sat') && text.includes('thirddomain')) {
        await mintOptions.nth(i).click();
        break;
      }
    }

    await expect(page.locator('.status.error')).toBeVisible();
    const errorCode = await cashu.getErrorCode().textContent();
    expect(errorCode).toContain('CU002');
  });

  test('token with sufficient funds for 210sat mint: purchase enabled', async () => {
    await cashu.fillToken(CashuPage.VALID_TOKEN_420);
    await expect(page.locator('.status.success')).toBeVisible({ timeout: 10000 });

    const mintOptions = cashu.getMintOptions();
    const count = await mintOptions.count();
    for (let i = 0; i < count; i++) {
      const text = await mintOptions.nth(i).textContent();
      if (text.includes('210 sat') && text.includes('mint.domain.net')) {
        await mintOptions.nth(i).click();
        break;
      }
    }

    const isEnabled = await cashu.isPurchaseEnabled();
    expect(isEnabled).toBe(true);
  });

  test('select 210sat mint: no error, purchase button enables', async () => {
    await cashu.fillToken(CashuPage.VALID_TOKEN_420);
    await expect(page.locator('.status.success')).toBeVisible({ timeout: 10000 });

    const mintOptions = cashu.getMintOptions();
    const count = await mintOptions.count();
    for (let i = 0; i < count; i++) {
      const text = await mintOptions.nth(i).textContent();
      if (text.includes('210 sat') && text.includes('mint.domain.net')) {
        await mintOptions.nth(i).click();
        break;
      }
    }

    expect(await cashu.isErrorVisible()).toBe(false);
    const isEnabled = await cashu.isPurchaseEnabled();
    expect(isEnabled).toBe(true);
  });

  test('click purchase: processing state shows', async () => {
    await cashu.fillToken(CashuPage.VALID_TOKEN_420);
    await expect(page.locator('.status.success')).toBeVisible({ timeout: 10000 });

    const mintOptions = cashu.getMintOptions();
    const count = await mintOptions.count();
    for (let i = 0; i < count; i++) {
      const text = await mintOptions.nth(i).textContent();
      if (text.includes('210 sat') && text.includes('mint.domain.net')) {
        await mintOptions.nth(i).click();
        break;
      }
    }

    await cashu.clickPurchase();
    expect(await cashu.isProcessing()).toBe(true);
    await page.screenshot({ path: 'tests/screenshots/cashu-processing.png' });
  });

  test('mock payment succeeds: access granted screen', async () => {
    await cashu.fillToken(CashuPage.VALID_TOKEN_420);
    await expect(page.locator('.status.success')).toBeVisible({ timeout: 10000 });

    const mintOptions = cashu.getMintOptions();
    const count = await mintOptions.count();
    for (let i = 0; i < count; i++) {
      const text = await mintOptions.nth(i).textContent();
      if (text.includes('210 sat') && text.includes('mint.domain.net')) {
        await mintOptions.nth(i).click();
        break;
      }
    }

    await cashu.clickPurchase();
    await expect(cashu.getAccessGranted()).toBeVisible({ timeout: 15000 });
    const title = await page.locator('.tollgate-captive-portal-access-granted h2').textContent();
    expect(title).toContain('successful');
    await page.screenshot({ path: 'tests/screenshots/cashu-access-granted.png' });
  });

  test('token input can be cleared with X button', async () => {
    await cashu.fillToken('some text');
    await expect(page.locator('.tollgate-captive-portal-method-input-actions button.cancel')).toBeVisible();
    await cashu.clearToken();
    await expect(cashu.getTokenInput()).toHaveValue('');
  });

  test('all 3 mint options are visible with correct labels', async () => {
    const mintOptions = cashu.getMintOptions();
    await expect(mintOptions).toHaveCount(3);

    const texts = await mintOptions.allTextContents();
    const has210a = texts.some(t => t.includes('210 sat') && t.includes('mint.domain.net'));
    const has210b = texts.some(t => t.includes('210 sat') && t.includes('other.mint.net'));
    const has500 = texts.some(t => t.includes('500 sat') && t.includes('thirddomain'));

    expect(has210a).toBe(true);
    expect(has210b).toBe(true);
    expect(has500).toBe(true);
  });

  test('allocation calculation displays correctly', async () => {
    await cashu.fillToken(CashuPage.VALID_TOKEN_420);
    await expect(page.locator('.status.success')).toBeVisible({ timeout: 10000 });

    const mintOptions = cashu.getMintOptions();
    const count = await mintOptions.count();
    for (let i = 0; i < count; i++) {
      const text = await mintOptions.nth(i).textContent();
      if (text.includes('210 sat') && text.includes('mint.domain.net')) {
        await mintOptions.nth(i).click();
        break;
      }
    }

    const alloc = await cashu.getTokenAllocation().textContent();
    expect(alloc.length).toBeGreaterThan(0);
  });

  test('screenshot: cashu valid token state', async () => {
    await cashu.fillToken(CashuPage.VALID_TOKEN_420);
    await expect(page.locator('.status.success')).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'tests/screenshots/cashu-valid-token.png', fullPage: true });
  });

  test('screenshot: cashu insufficient funds state', async () => {
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
    await page.screenshot({ path: 'tests/screenshots/cashu-insufficient-funds.png', fullPage: true });
  });
});
