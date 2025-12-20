import { device, element, by, expect } from 'detox';

describe('Apartment Auditor E2E Tests', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should launch the app', async () => {
    await expect(element(by.id('app-root'))).toBeVisible();
  });
});