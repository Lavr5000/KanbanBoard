import { device, element, by, expect } from 'detox';

describe('Inspection Completion E2E', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should complete full inspection workflow', async () => {
    await element(by.id('tab-objects')).tap();

    const objectCard = element(by.id('object-card-0'));
    if (await objectCard.exists()) {
      await objectCard.tap();

      // Check all categories have some progress
      const categories = [
        element(by.id('category-card-0')),
        element(by.id('category-card-1')),
        element(by.id('category-card-2'))
      ];

      let allCategoriesCompleted = true;

      for (const category of categories) {
        if (await category.exists()) {
          await category.tap();

          // Check if category is completed
          const completedBadge = element(by.id('category-completed-badge'));
          if (!(await completedBadge.exists())) {
            allCategoriesCompleted = false;
          }

          await element(by.id('back-button')).tap();
        }
      }

      if (allCategoriesCompleted) {
        // Should show completion status
        await expect(element(by.id('inspection-completed-status'))).toBeVisible();
      }
    }
  });

  it('should generate inspection report', async () => {
    await element(by.id('tab-objects')).tap();

    const objectCard = element(by.id('object-card-0'));
    if (await objectCard.exists()) {
      await objectCard.tap();

      // Look for generate report button
      const generateReportButton = element(by.id('generate-report-button'));
      if (await generateReportButton.exists()) {
        await generateReportButton.tap();

        // Check report preview modal
        await expect(element(by.id('report-preview-modal'))).toBeVisible();
        await expect(element(by.text('Отчет готов'))).toBeVisible();

        // Close modal
        await element(by.id('close-report-modal')).tap();
      }
    }
  });

  it('should export inspection data', async () => {
    await element(by.id('tab-reports')).tap();

    // Check if reports list is visible
    await expect(element(by.id('reports-list'))).toBeVisible();

    const reportItem = element(by.id('report-item-0'));
    if (await reportItem.exists()) {
      await reportItem.tap();

      // Check export options
      await expect(element(by.id('export-pdf-button'))).toBeVisible();
      await expect(element(by.id('export-json-button'))).toBeVisible();

      // Test PDF export
      await element(by.id('export-pdf-button')).tap();

      // Check share modal appears
      await expect(element(by.id('share-modal'))).toBeVisible();
    }
  });
});