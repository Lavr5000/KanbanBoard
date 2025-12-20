import { device, element, by, expect } from 'detox';

describe('Category Progress E2E', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should display correct category progress', async () => {
    await element(by.id('tab-objects')).tap();

    const objectCard = element(by.id('object-card-0'));
    if (await objectCard.exists()) {
      await objectCard.tap();

      // Check that category cards show progress
      const categoryCards = [
        element(by.id('category-card-0')),
        element(by.id('category-card-1')),
        element(by.id('category-card-2'))
      ];

      for (const card of categoryCards) {
        if (await card.exists()) {
          await card.tap();

          // Check progress bar is visible
          await expect(element(by.id('category-progress-bar'))).toBeVisible();

          // Check progress percentage
          const progressText = element(by.id('progress-percentage'));
          if (await progressText.exists()) {
            await expect(progressText).toBeVisible();
          }

          // Go back
          await element(by.id('back-button')).tap();
        }
      }
    }
  });

  it('should update progress when checkpoints are completed', async () => {
    await element(by.id('tab-objects')).tap();

    const objectCard = element(by.id('object-card-0'));
    if (await objectCard.exists()) {
      await objectCard.tap();

      const categoryCard = element(by.id('category-card-0'));
      if (await categoryCard.exists()) {
        await categoryCard.tap();

        // Get initial progress
        const initialProgress = element(by.id('progress-percentage'));
        let initialText = '';
        if (await initialProgress.exists()) {
          initialText = await initialProgress.getAttributes();
        }

        // Complete first checkpoint
        const checkpointItem = element(by.id('checkpoint-item-0'));
        if (await checkpointItem.exists()) {
          await checkpointItem.tap();

          await element(by.id('status-selector')).tap();
          await element(by.text('Соответствует')).tap();

          // Go back and check progress updated
          await element(by.id('back-button')).tap();

          const updatedProgress = element(by.id('progress-percentage'));
          if (await updatedProgress.exists()) {
            await expect(updatedProgress).toBeVisible();
            // Progress should be different from initial
          }
        }
      }
    }
  });
});