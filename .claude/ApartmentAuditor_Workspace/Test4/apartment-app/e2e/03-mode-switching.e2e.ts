import { device, element, by, expect } from 'detox';

describe('Mode Switching E2E', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should switch between draft and finish modes', async () => {
    // Navigate to objects tab
    await element(by.id('tab-objects')).tap();

    // Select first object if exists
    const objectCard = element(by.id('object-card-0'));
    if (await objectCard.exists()) {
      await objectCard.tap();

      // Look for mode switcher
      await expect(element(by.id('finish-mode-toggle'))).toBeVisible();

      // Check initial mode (should be draft)
      await expect(element(by.text('Черновая проверка'))).toBeVisible();

      // Switch to finish mode
      await element(by.id('finish-mode-toggle')).tap();
      await expect(element(by.text('Чистовая проверка'))).toBeVisible();

      // Switch back to draft mode
      await element(by.id('finish-mode-toggle')).tap();
      await expect(element(by.text('Черновая проверка'))).toBeVisible();
    }
  });

  it('should persist mode selection', async () => {
    await element(by.id('tab-objects')).tap();

    const objectCard = element(by.id('object-card-0'));
    if (await objectCard.exists()) {
      await objectCard.tap();

      // Switch to finish mode
      await element(by.id('finish-mode-toggle')).tap();

      // Reload app
      await device.reloadReactNative();

      // Navigate back and check mode is persisted
      await element(by.id('tab-objects')).tap();
      await objectCard.tap();

      await expect(element(by.text('Чистовая проверка'))).toBeVisible();
    }
  });
});