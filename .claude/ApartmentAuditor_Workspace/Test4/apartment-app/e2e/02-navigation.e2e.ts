import { device, element, by, expect } from 'detox';

describe('Navigation E2E', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should navigate between all main tabs', async () => {
    // Check all tabs are visible
    await expect(element(by.id('tab-projects'))).toBeVisible();
    await expect(element(by.id('tab-objects'))).toBeVisible();
    await expect(element(by.id('tab-reports'))).toBeVisible();
    await expect(element(by.id('tab-profile'))).toBeVisible();

    // Navigate to Objects tab
    await element(by.id('tab-objects')).tap();
    await expect(element(by.id('objects-screen'))).toBeVisible();

    // Navigate to Reports tab
    await element(by.id('tab-reports')).tap();
    await expect(element(by.id('reports-screen'))).toBeVisible();

    // Navigate to Profile tab
    await element(by.id('tab-profile')).tap();
    await expect(element(by.id('profile-screen'))).toBeVisible();

    // Navigate back to Projects tab
    await element(by.id('tab-projects')).tap();
    await expect(element(by.id('projects-screen'))).toBeVisible();
  });

  it('should navigate to object details', async () => {
    // Go to objects tab
    await element(by.id('tab-objects')).tap();

    // Click on first object if exists
    const objectCard = element(by.id('object-card-0'));
    if (await objectCard.exists()) {
      await objectCard.tap();
      await expect(element(by.id('object-details-screen'))).toBeVisible();
    }
  });
});