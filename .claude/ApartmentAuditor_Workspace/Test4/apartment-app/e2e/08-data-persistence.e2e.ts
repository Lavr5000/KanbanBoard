import { device, element, by, expect } from 'detox';

describe('Data Persistence E2E', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should persist project data after app restart', async () => {
    // Create a new project
    await element(by.id('tab-projects')).tap();
    await element(by.id('create-project-button')).tap();

    await element(by.id('project-name-input')).typeText('Тест сохранения');
    await element(by.id('project-address-input')).typeText('ул. Сохранения, 1');
    await element(by.id('apartment-type-dropdown')).tap();
    await element(by.text('Новостройка')).tap();
    await element(by.id('create-project-submit')).tap();

    // Verify project exists
    await expect(element(by.text('Тест сохранения'))).toBeVisible();

    // Restart app
    await device.reloadReactNative();

    // Check if project still exists
    await element(by.id('tab-projects')).tap();
    await expect(element(by.text('Тест сохранения'))).toBeVisible();
  });

  it('should persist checkpoint status after app restart', async () => {
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

          // Change status
          await element(by.id('status-selector')).tap();
          await element(by.text('Не соответствует')).tap();

          // Add comment
          await element(by.id('comment-input')).typeText('Сохраненный комментарий');
          await element(by.id('save-comment-button')).tap();

          // Restart app
          await device.reloadReactNative();

          // Navigate back and verify data persisted
          await element(by.id('tab-objects')).tap();
          await objectCard.tap();
          await categoryCard.tap();
          await checkpointItem.tap();

          await expect(element(by.id('status-badge-non-compliant'))).toBeVisible();
          await expect(element(by.text('Сохраненный комментарий'))).toBeVisible();
        }
      }
    }
  });

  it('should persist mode selection after app restart', async () => {
    await element(by.id('tab-objects')).tap();

    const objectCard = element(by.id('object-card-0'));
    if (await objectCard.exists()) {
      await objectCard.tap();

      // Switch to finish mode
      await element(by.id('finish-mode-toggle')).tap();

      // Restart app
      await device.reloadReactNative();

      // Navigate back and verify mode persisted
      await element(by.id('tab-objects')).tap();
      await objectCard.tap();

      await expect(element(by.text('Чистовая проверка'))).toBeVisible();
    }
  });
});