class CaptivePortalPage {
  constructor(page) {
    this.page = page;
  }

  async navigate() {
    await this.page.addInitScript(() => sessionStorage.setItem('pwa-seen', '1'));
    await this.page.goto('/');
    await this.waitForLoad();
  }

  async navigateWithPwaModal() {
    await this.page.goto('/');
    await this.waitForLoad();
    await this.page.waitForSelector('.tollgate-captive-portal-pwa-overlay', { timeout: 20000 });
  }

  async waitForLoad() {
    await this.page.waitForSelector('#tollgate-captive-portal');
    await this.page.waitForSelector('.tollgate-captive-portal-method', { timeout: 15000 });
  }

  // ─── Demo Banner ───
  getDemoBanner() {
    return this.page.locator('.demo-banner');
  }

  async isDemoMode() {
    return this.getDemoBanner().isVisible();
  }

  // ─── Header ───
  getLogo() {
    return this.page.locator('.tollgate-captive-portal-header img');
  }

  getHeading() {
    return this.page.locator('.tollgate-captive-portal-method-header h1');
  }

  // ─── Size Selector ───
  getSizeSelector() {
    return this.page.locator('.tollgate-captive-portal-size-selector');
  }

  async selectPreset(label) {
    const pills = this.page.locator('.tollgate-captive-portal-size-selector-pill');
    const count = await pills.count();
    for (let i = 0; i < count; i++) {
      const text = await pills.nth(i).textContent();
      if (text.trim() === label) {
        await pills.nth(i).click();
        return;
      }
    }
    throw new Error(`Preset "${label}" not found`);
  }

  async clickMore() {
    const pills = this.page.locator('.tollgate-captive-portal-size-selector-pill');
    const count = await pills.count();
    for (let i = 0; i < count; i++) {
      const text = await pills.nth(i).textContent();
      if (text.trim() === 'More') {
        await pills.nth(i).click();
        return;
      }
    }
    throw new Error('More button not found');
  }

  async enterCustomAmount(value) {
    const input = this.page.locator('.tollgate-captive-portal-size-selector-custom-input');
    await input.fill(String(value));
  }

  getCustomInput() {
    return this.page.locator('.tollgate-captive-portal-size-selector-custom-input');
  }

  getPills() {
    return this.page.locator('.tollgate-captive-portal-size-selector-pill');
  }

  // ─── Tab Navigation ───
  getCashuTab() {
    return this.page.locator('#tab-cashu');
  }

  getLightningTab() {
    return this.page.locator('#tab-lightning');
  }

  async switchToCashu() {
    await this.getCashuTab().click();
  }

  async switchToLightning() {
    await this.getLightningTab().click();
  }

  getActiveTab() {
    return this.page.locator('.tollgate-captive-portal-tabs button[data-active="true"]');
  }

  // ─── Footer ───
  getFooter() {
    return this.page.locator('.tollgate-captive-portal-footer');
  }

  getFooterText() {
    return this.getFooter().textContent();
  }

  getPoweredByLink() {
    return this.getFooter().locator('a');
  }

  // ─── PWA Modal ───
  getPwaModal() {
    return this.page.locator('.tollgate-captive-portal-pwa-overlay');
  }

  async isPwaModalVisible() {
    return this.getPwaModal().isVisible();
  }

  async dismissPwaModal() {
    // Click overlay to dismiss
    await this.getPwaModal().click();
  }

  async dismissPwaModalByCloseButton() {
    await this.page.locator('.tollgate-captive-portal-pwa-close').click();
  }

  // ─── Language ───
  getLanguageSelect() {
    return this.page.locator('#tollgate-i18n');
  }

  async switchLanguage(lang) {
    await this.getLanguageSelect().selectOption(lang);
  }

  // ─── Device Info ───
  getMacAddress() {
    return this.page.locator('.tollgate-captive-portal-deviceinfo');
  }

  // ─── Toast ───
  getToasts() {
    return this.page.locator('.toast-container .toast');
  }

  // ─── Screenshots ───
  async takeScreenshot(name) {
    await this.page.screenshot({
      path: `tests/screenshots/${name}`,
      fullPage: true,
    });
  }
}

module.exports = CaptivePortalPage;
