const { test, expect } = require('@playwright/test');

const VALID_TOKEN_420 = 'cashuBpGFteCJodHRwczovL25vZmVlcy50ZXN0bnV0LmNhc2h1LnNwYWNlYXVjc2F0YXSBomFpSAC0zSfYhhpEYXCEpGFhBGFzeF9bIlAyUEsiLHsibm9uY2UiOiI0N2Y4Y2IyYTFiYWY5ZjhkYzQ4ZDI4ZTNiMGUzODhmY2UxYmZiOTVlZjAwODE3MTg4YzkzMTU0NGMyMzJmN2ZjIiwidGFncyI6W119XWFjWCED_Eg3DCumAWtmUlJX-wQL5VMW_uTNyHKfg-K1QapLVahhZKNhZVgg5gGQFjN9-1b_jqKJgbaY4-dhmBYr5UqqUxuxqRLPUzJhc1ggaCiCFnmqkZ02PJJhVJ-vM-_9WtePRDt5cPBlST0wmORhclggE3wqT6NrH2QzGfO_MQ4jTnO59Mc2cr2KGY6vjnohKt2kYWEYIGFzeF9bIlAyUEsiLHsibm9uY2UiOiJmNjdlOWJkNmNkMThiMmI2YjQyM2U3YmU4NWRmMjUxNWU4ZGQyYWU1NzVlYTE3ZTM3YmVkNDc4MjQzZDFjMzlmIiwidGFncyI6W119XWFjWCECWcB712IIHW3sq2emd8eNAZIKUt3SAzOwpAK1CZsZ_k1hZKNhZVggBusKAQ7SDmxNBDhqt1veoTXo4Hdexjq3y-xPQoEwjtdhc1ggdHlFY6ILItNbP87l45KxFuQZb1DPRnFXz9XBkbmcQf5hclgga9odUX_scqsK_9fXhgGgwVR12-z1XBzMIGlsW7Y-B3ykYWEYgGFzeF9bIlAyUEsiLHsibm9uY2UiOiI1YTdjZmM3Mzg0MTQyYjY3Y2I1N2VlMThiOGE3NjIyODgyNTg5YTkwZjYxM2RhZDg1YjM1YzgwNjVmZWFhNTk1IiwidGFncyI6W119XWFjWCECqvNa-Cq7SE2F-X9kmX6BoE_6hdPpziwH7ucvq85dnAhhZKNhZVgguzfdpxik53NXvzJKapvLDg4p_US26WHY7pASwxpF5vxhc1ggD2ZmSOU6LscrWKIJaOvo-2jeWlVeHJXxKWabm9v9NWVhclgglhPmxos7-GuHsRff6dTfdoonXTtZPb96DkmZOqNi2wykYWEZAQBhc3hfWyJQMlBLIix7Im5vbmNlIjoiODE2Y2EwMWFhNGEzOGY5MzYyZmZiNmZlODkzZTlmZTdkZDVmYTRlZmM0MTM4YmVhZGRhMzRhNTEwYzg3ODhkYyIsInRhZ3MiOltdfV1hY1ghA3upuHXYkvqVhg5QMihMwBUuGX71aAeOQaN-8o0rHxHqYWSjYWVYINp6jhzIGN4Vn45g96IzXRm6PNO0C66C3Tpk-g1EpKNuYXNYIFDsqRFfC252PT3HyoNv9siolqEdulhBM3JlMouo-1uOYXJYIIanZZV-SoXRk30n67Wce5a1UiCZfbtl3wtmaaye2YzAYWRyU2VudCBmcm9tIE1pbmliaXRz';

const SLOW = 800;
const PAUSE = 1500;

test.describe.configure({ mode: 'default' });

test.describe('Video Walkthrough: Complete Cashu Flow', () => {

  test('cashu-complete-flow', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#tollgate-captive-portal')).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(PAUSE);

    const overlay = page.locator('.tollgate-captive-portal-pwa-overlay');
    if (await overlay.isVisible()) {
      await overlay.click({ position: { x: 5, y: 5 } });
      await page.waitForTimeout(SLOW);
    }

    await page.waitForTimeout(PAUSE);
    await page.screenshot({ path: 'tests/videos/frames/cashu-01-initial.png' });

    await page.locator('button:text("1 hour")').click();
    await page.waitForTimeout(SLOW);
    await page.locator('button:text("10 hours")').click();
    await page.waitForTimeout(SLOW);
    await page.locator('button:text("15 min")').click();
    await page.waitForTimeout(PAUSE);

    await page.locator('#cashu-token').fill(VALID_TOKEN_420);
    await page.waitForTimeout(PAUSE);

    await page.screenshot({ path: 'tests/videos/frames/cashu-02-token-valid.png' });

    const mintButtons = page.locator('.tollgate-captive-portal-method-options button');
    const count = await mintButtons.count();
    for (let i = 0; i < count; i++) {
      const text = await mintButtons.nth(i).textContent();
      if (text && text.includes('210 sat') && text.includes('mint.domain.net')) {
        await mintButtons.nth(i).click();
        break;
      }
    }
    await page.waitForTimeout(PAUSE);

    await page.screenshot({ path: 'tests/videos/frames/cashu-03-ready-to-pay.png' });
    await page.locator('.tollgate-captive-portal-method-submit button.cta').click();
    await page.waitForTimeout(PAUSE);

    await page.screenshot({ path: 'tests/videos/frames/cashu-04-processing.png' });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'tests/videos/frames/cashu-05-access-granted.png' });
    await page.waitForTimeout(3000);
  });
});

test.describe('Video Walkthrough: Complete Lightning Flow', () => {

  test('lightning-complete-flow', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#tollgate-captive-portal')).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(PAUSE);

    const overlay = page.locator('.tollgate-captive-portal-pwa-overlay');
    if (await overlay.isVisible()) {
      await overlay.click({ position: { x: 5, y: 5 } });
      await page.waitForTimeout(SLOW);
    }

    await page.waitForTimeout(PAUSE);

    await page.locator('button:text("⚡️ Lightning")').click();
    await page.waitForTimeout(PAUSE);
    await page.screenshot({ path: 'tests/videos/frames/lightning-01-tab.png' });

    await page.locator('button:text("+")').click();
    await page.waitForTimeout(SLOW);
    await page.locator('button:text("–")').click();
    await page.waitForTimeout(PAUSE);

    await page.locator('.tollgate-captive-portal-method-submit button.cta').click();
    await page.waitForTimeout(PAUSE);

    await page.screenshot({ path: 'tests/videos/frames/lightning-02-processing.png' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/videos/frames/lightning-03-invoice.png' });

    const walletLink = page.locator('a:text("Open Wallet")');
    if (await walletLink.isVisible()) {
      await page.waitForTimeout(SLOW);
    }

    const copyBtn = page.locator('button:text("Copy")');
    if (await copyBtn.isVisible()) {
      await page.waitForTimeout(SLOW);
    }

    await page.waitForTimeout(5000);

    await page.screenshot({ path: 'tests/videos/frames/lightning-04-access-granted.png' });
    await page.waitForTimeout(2000);
  });
});

test.describe('Video Walkthrough: UI Exploration', () => {

  test('ui-exploration', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#tollgate-captive-portal')).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(PAUSE);

    await page.screenshot({ path: 'tests/videos/frames/ui-01-pwa-modal.png' });
    await page.waitForTimeout(PAUSE);

    const overlay = page.locator('.tollgate-captive-portal-pwa-overlay');
    if (await overlay.isVisible()) {
      await overlay.click({ position: { x: 5, y: 5 } });
      await page.waitForTimeout(PAUSE);
    }

    await page.locator('button:text("15 min")').click();
    await page.waitForTimeout(SLOW);
    await page.locator('button:text("1 hour")').click();
    await page.waitForTimeout(SLOW);
    await page.locator('button:text("10 hours")').click();
    await page.waitForTimeout(SLOW);
    await page.locator('button:text("More")').click();
    await page.waitForTimeout(PAUSE);

    const customInput = page.locator('.tollgate-captive-portal-size-selector-custom-input');
    if (await customInput.isVisible()) {
      await customInput.fill('500');
      await page.waitForTimeout(PAUSE);
    }

    await page.locator('button:text("15 min")').click();
    await page.waitForTimeout(PAUSE);

    await page.locator('button:text("⚡️ Lightning")').click();
    await page.waitForTimeout(PAUSE);
    await page.locator('button:text("🥜 Cashu")').click();
    await page.waitForTimeout(PAUSE);

    await page.locator('.tollgate-captive-portal-footer').scrollIntoViewIfNeeded();
    await page.waitForTimeout(PAUSE);

    await page.locator('.tollgate-captive-portal-header').scrollIntoViewIfNeeded();
    await page.waitForTimeout(PAUSE);

    await page.locator('#tollgate-i18n').scrollIntoViewIfNeeded();
    await page.waitForTimeout(SLOW);

    await page.waitForTimeout(2000);
  });
});
