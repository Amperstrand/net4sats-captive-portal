const { expect } = require('@playwright/test');
const CaptivePortalPage = require('./CaptivePortalPage');

const VALID_TOKEN_420 = 'cashuBpGFteCJodHRwczovL25vZmVlcy50ZXN0bnV0LmNhc2h1LnNwYWNlYXVjc2F0YXSBomFpSAC0zSfYhhpEYXCEpGFhBGFzeF9bIlAyUEsiLHsibm9uY2UiOiI0N2Y4Y2IyYTFiYWY5ZjhkYzQ4ZDI4ZTNiMGUzODhmY2UxYmZiOTVlZjAwODE3MTg4YzkzMTU0NGMyMzJmN2ZjIiwidGFncyI6W119XWFjWCED_Eg3DCumAWtmUlJX-wQL5VMW_uTNyHKfg-K1QapLVahhZKNhZVgg5gGQFjN9-1b_jqKJgbaY4-dhmBYr5UqqUxuxqRLPUzJhc1ggaCiCFnmqkZ02PJJhVJ-vM-_9WtePRDt5cPBlST0wmORhclggE3wqT6NrH2QzGfO_MQ4jTnO59Mc2cr2KGY6vjnohKt2kYWEYIGFzeF9bIlAyUEsiLHsibm9uY2UiOiJmNjdlOWJkNmNkMThiMmI2YjQyM2U3YmU4NWRmMjUxNWU4ZGQyYWU1NzVlYTE3ZTM3YmVkNDc4MjQzZDFjMzlmIiwidGFncyI6W119XWFjWCECWcB712IIHW3sq2emd8eNAZIKUt3SAzOwpAK1CZsZ_k1hZKNhZVggBusKAQ7SDmxNBDhqt1veoTXo4Hdexjq3y-xPQoEwjtdhc1ggdHlFY6ILItNbP87l45KxFuQZb1DPRnFXz9XBkbmcQf5hclgga9odUX_scqsK_9fXhgGgwVR12-z1XBzMIGlsW7Y-B3ykYWEYgGFzeF9bIlAyUEsiLHsibm9uY2UiOiI1YTdjZmM3Mzg0MTQyYjY3Y2I1N2VlMThiOGE3NjIyODgyNTg5YTkwZjYxM2RhZDg1YjM1YzgwNjVmZWFhNTk1IiwidGFncyI6W119XWFjWCECqvNa-Cq7SE2F-X9kmX6BoE_6hdPpziwH7ucvq85dnAhhZKNhZVgguzfdpxik53NXvzJKapvLDg4p_US26WHY7pASwxpF5vxhc1ggD2ZmSOU6LscrWKIJaOvo-2jeWlVeHJXxKWabm9v9NWVhclgglhPmxos7-GuHsRff6dTfdoonXTtZPb96DkmZOqNi2wykYWEZAQBhc3hfWyJQMlBLIix7Im5vbmNlIjoiODE2Y2EwMWFhNGEzOGY5MzYyZmZiNmZlODkzZTlmZTdkZDVmYTRlZmM0MTM4YmVhZGRhMzRhNTEwYzg3ODhkYyIsInRhZ3MiOltdfV1hY1ghA3upuHXYkvqVhg5QMihMwBUuGX71aAeOQaN-8o0rHxHqYWSjYWVYINp6jhzIGN4Vn45g96IzXRm6PNO0C66C3Tpk-g1EpKNuYXNYIFDsqRFfC252PT3HyoNv9siolqEdulhBM3JlMouo-1uOYXJYIIanZZV-SoXRk30n67Wce5a1UiCZfbtl3wtmaaye2YzAYWRyU2VudCBmcm9tIE1pbmliaXRz';

class CashuPage extends CaptivePortalPage {
  constructor(page) {
    super(page);
  }

  getTokenInput() {
    return this.page.locator('#cashu-token');
  }

  async fillToken(token) {
    await this.getTokenInput().fill(token);
  }

  async clearToken() {
    const cancelButton = this.page.locator('.tollgate-captive-portal-method-input-actions button.cancel');
    await cancelButton.click();
  }

  async selectMint(mintUrl) {
    const options = this.page.locator('.tollgate-captive-portal-method-options button');
    const count = await options.count();
    for (let i = 0; i < count; i++) {
      const btn = options.nth(i);
      const text = await btn.textContent();
      if (text.includes(mintUrl)) {
        await btn.click();
        return;
      }
    }
    throw new Error(`Mint "${mintUrl}" not found`);
  }

  async selectMintByIndex(index) {
    const options = this.page.locator('.tollgate-captive-portal-method-options button');
    await options.nth(index).click();
  }

  getSelectedMint() {
    return this.page.locator('.tollgate-captive-portal-method-options button.active');
  }

  getMintOptions() {
    return this.page.locator('.tollgate-captive-portal-method-options button');
  }

  getPurchaseButton() {
    return this.page.locator('.tollgate-captive-portal-method-submit button.cta');
  }

  getDisabledPurchaseButton() {
    return this.page.locator('.tollgate-captive-portal-method-submit button:not(.cta)');
  }

  async isPurchaseEnabled() {
    const ctaBtn = this.page.locator('.tollgate-captive-portal-method-submit button.cta');
    if (!(await ctaBtn.isVisible())) return false;
    return !(await ctaBtn.isDisabled());
  }

  async waitForPurchaseEnabled(timeout = 5000) {
    const ctaBtn = this.page.locator('.tollgate-captive-portal-method-submit button.cta');
    await ctaBtn.waitFor({ state: 'visible', timeout });
    await expect(ctaBtn).toBeEnabled({ timeout });
    return true;
  }

  async clickPurchase() {
    const ctaBtn = this.page.locator('.tollgate-captive-portal-method-submit button.cta');
    await ctaBtn.click();
  }

  async isValidToken() {
    return this.page.locator('.status.success').isVisible();
  }

  isErrorVisible() {
    return this.page.locator('.status.error').isVisible();
  }

  isSuccessVisible() {
    return this.page.locator('.tollgate-captive-portal-access-granted').isVisible();
  }

  getTokenAmount() {
    return this.page.locator('.status.success .status-info');
  }

  getTokenAllocation() {
    return this.page.locator('.status.success .status-message');
  }

  getErrorLabel() {
    return this.page.locator('.status.error .status-label');
  }

  getErrorCode() {
    return this.page.locator('.status.error .status-code');
  }

  getErrorMessage() {
    return this.page.locator('.status.error .status-message');
  }

  async isProcessing() {
    return this.page.locator('.tollgate-captive-portal-processing').isVisible();
  }

  getAccessGranted() {
    return this.page.locator('.tollgate-captive-portal-access-granted');
  }

  getAccessOptionsHeading() {
    return this.page.locator('.tollgate-captive-portal-method-options h5');
  }
}

CashuPage.VALID_TOKEN_420 = VALID_TOKEN_420;

module.exports = CashuPage;
