import { device, element, by, expect } from 'detox';

describe('Status Management E2E', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should change checkpoint status', async () => {
    await element(by.id('tab-objects')).tap();

    const objectCard = element(by.id('object-card-0'));
    if (await objectCard.exists()) {
      await objectCard.tap();

      const categoryCard = element(by.id('category-card-0'));
      if (await categoryCard.exists()) {
        await categoryCard.tap();

        // Select first checkpoint
        const checkpointItem = element(by.id('checkpoint-item-0'));
        if (await checkpointItem.exists()) {
          await checkpointItem.tap();

          // Check initial status
          await expect(element(by.id('status-selector'))).toBeVisible();

          // Change status to "Соответствует"
          await element(by.id('status-selector')).tap();
          await element(by.text('Соответствует')).tap();

          // Verify status changed
          await expect(element(by.id('status-badge-compliant'))).toBeVisible();

          // Change status to "Не соответствует"
          await element(by.id('status-selector')).tap();
          await element(by.text('Не соответствует')).tap();

          // Verify status changed
          await expect(element(by.id('status-badge-non-compliant'))).toBeVisible();
        }
      }
    }
  });

  it('should add comment to checkpoint', async () => {
    await element(by.id('tab-objects')).tap();

    const objectCard = element(by.id('object-card-0'));
    if (await objectCard.exists()) {
      await objectCard.tap();

      const categoryCard = element(by.id('category-card-0'));
      if (await categoryCard.exists()) {
        await categoryCard.tap();

        const checkpointItem = element(by.id('checkpoint-item-0'));
        if (await checkpointItem.exists()) {
          await checkpointItem.tap();

          // Add comment
          await expect(element(by.id('comment-input'))).toBeVisible();
          await element(by.id('comment-input')).typeText('Тестовый комментарий');

          // Save comment
          await element(by.id('save-comment-button')).tap();

          // Verify comment is saved
          await expect(element(by.text('Тестовый комментарий'))).toBeVisible();
        }
      }
    }
  });
});