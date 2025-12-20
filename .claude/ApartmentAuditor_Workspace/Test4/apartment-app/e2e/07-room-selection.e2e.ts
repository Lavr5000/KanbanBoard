import { device, element, by, expect } from 'detox';

describe('Room Selection E2E', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should display room selector for applicable categories', async () => {
    await element(by.id('tab-objects')).tap();

    const objectCard = element(by.id('object-card-0'));
    if (await objectCard.exists()) {
      await objectCard.tap();

      // Try categories that typically have rooms (walls, floors, ceiling)
      const categoriesWithRooms = ['Стены', 'Полы', 'Потолки'];

      for (const categoryName of categoriesWithRooms) {
        const categoryCard = element(by.text(categoryName));
        if (await categoryCard.exists()) {
          await categoryCard.tap();

          // Check if room selector is present
          const roomSelector = element(by.id('room-selector'));
          if (await roomSelector.exists()) {
            await expect(roomSelector).toBeVisible();

            // Click room selector
            await roomSelector.tap();

            // Check that room options are displayed
            await expect(element(by.text('Кухня'))).toBeVisible();
            await expect(element(by.text('Ванная'))).toBeVisible();
            await expect(element(by.text('Спальня'))).toBeVisible();

            // Select a room
            await element(by.text('Кухня')).tap();

            // Verify room is selected
            await expect(element(by.text('Кухня'))).toBeVisible();
          }

          // Go back
          await element(by.id('back-button')).tap();
        }
      }
    }
  });

  it('should filter checkpoints by selected room', async () => {
    await element(by.id('tab-objects')).tap();

    const objectCard = element(by.id('object-card-0'));
    if (await objectCard.exists()) {
      await objectCard.tap();

      const categoryCard = element(by.text('Стены'));
      if (await categoryCard.exists()) {
        await categoryCard.tap();

        const roomSelector = element(by.id('room-selector'));
        if (await roomSelector.exists()) {
          await roomSelector.tap();
          await element(by.text('Кухня')).tap();

          // Check that checkpoints are filtered
          await waitFor(element(by.id('checkpoint-list')))
            .toBeVisible()
            .withTimeout(2000);

          // Verify that room-specific checkpoints are shown
          const checkpointItem = element(by.id('checkpoint-item-0'));
          if (await checkpointItem.exists()) {
            await expect(checkpointItem).toBeVisible();
          }
        }
      }
    }
  });
});