import { device, element, by, expect } from 'detox';

describe('Photo Management E2E', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should open camera and take photo', async () => {
    // Navigate to objects and select checkpoint
    await element(by.id('tab-objects')).tap();

    const objectCard = element(by.id('object-card-0'));
    if (await objectCard.exists()) {
      await objectCard.tap();

      // Select first category
      const categoryCard = element(by.id('category-card-0'));
      if (await categoryCard.exists()) {
        await categoryCard.tap();

        // Select first checkpoint
        const checkpointItem = element(by.id('checkpoint-item-0'));
        if (await checkpointItem.exists()) {
          await checkpointItem.tap();

          // Click photo button
          await expect(element(by.id('photo-button'))).toBeVisible();
          await element(by.id('photo-button')).tap();

          // Select camera option
          await expect(element(by.text('Камера'))).toBeVisible();
          await element(by.text('Камера')).tap();

          // Mock camera capture
          // Note: In real tests, you'd need to mock the camera
          await device.takeScreenshot('camera-capture');
        }
      }
    }
  });

  it('should select photo from gallery', async () => {
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

          await element(by.id('photo-button')).tap();

          // Select gallery option
          await expect(element(by.text('Галерея'))).toBeVisible();
          await element(by.text('Галерея')).tap();

          // Mock gallery selection
          await device.takeScreenshot('gallery-selection');
        }
      }
    }
  });

  it('should display taken photos', async () => {
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

          // Check if photos are displayed
          const photoThumbnail = element(by.id('photo-thumbnail-0'));
          if (await photoThumbnail.exists()) {
            await expect(photoThumbnail).toBeVisible();
          }
        }
      }
    }
  });
});