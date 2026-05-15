const CaptivePortalPage = require('./CaptivePortalPage');

class LightningPage extends CaptivePortalPage {
  constructor(page) {
    super(page);
  }

  getAmountInput() {
    return this.page.locator('#lightning-unit-amount');
  }

  async getAmount() {
    return this.getAmountInput().inputValue();
  }

  async setAmount(value) {
    await this.getAmountInput().fill(String(value));
  }

  async clickIncrement() {
    const buttons = this.page.locator('.tollgate-captive-portal-method-input-actions button');
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      const text = await buttons.nth(i).textContent();
      if (text.trim() === '+') {
        await buttons.nth(i).click();
        return;
      }
    }
  }

  async clickDecrement() {
    const buttons = this.page.locator('.tollgate-captive-portal-method-input-actions button');
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      const text = await buttons.nth(i).textContent();
      if (text.trim() === '–') {
        await buttons.nth(i).click();
        return;
      }
    }
  }

  async selectMint(mintUrl) {
    const options = this.page.locator('.tollgate-captive-portal-method-options button');
    const count = await options.count();
    for (let i = 0; i < count; i++) {
      const text = await options.nth(i).textContent();
      if (text.includes(mintUrl)) {
        await options.nth(i).click();
        return;
      }
    }
  }

  getPurchaseButton() {
    return this.page.locator('.tollgate-captive-portal-method-submit button');
  }

  async clickPurchase() {
    await this.getPurchaseButton().click();
  }

  async isPurchaseEnabled() {
    const btn = this.getPurchaseButton();
    return !(await btn.isDisabled());
  }

  async isInvoiceVisible() {
    return this.page.locator('.tollgate-captive-portal-method-invoice').isVisible();
  }

  getInvoiceQrCode() {
    return this.page.locator('.tollgate-captive-portal-method-invoice-svg');
  }

  getOpenWalletLink() {
    return this.page.locator('.tollgate-captive-portal-method-invoice-actions a');
  }

  getCopyButton() {
    return this.page.locator('.tollgate-captive-portal-method-invoice-actions button');
  }

  async clickOpenWallet() {
    await this.getOpenWalletLink().click();
  }

  async clickCopyInvoice() {
    await this.getCopyButton().click();
  }

  getCancelButton() {
    return this.page.locator('.tollgate-captive-portal-method-invoice-header button');
  }

  async clickCancel() {
    await this.getCancelButton().click();
  }

  async isProcessing() {
    return this.page.locator('.tollgate-captive-portal-processing').isVisible();
  }

  isAccessGranted() {
    return this.page.locator('.tollgate-captive-portal-access-granted');
  }

  getMintOptions() {
    return this.page.locator('.tollgate-captive-portal-method-options button');
  }

  isErrorVisible() {
    return this.page.locator('.status.error').isVisible();
  }
}

module.exports = LightningPage;
