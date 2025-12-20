import { device, element, by, expect } from 'detox';

describe('Project Creation E2E', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should create a new project successfully', async () => {
    // Navigate to projects tab
    await expect(element(by.id('tab-projects'))).toBeVisible();
    await element(by.id('tab-projects')).tap();

    // Click create project button
    await expect(element(by.id('create-project-button'))).toBeVisible();
    await element(by.id('create-project-button')).tap();

    // Fill in project details
    await expect(element(by.id('project-name-input'))).toBeVisible();
    await element(by.id('project-name-input')).typeText('Тестовый проект');

    await expect(element(by.id('project-address-input'))).toBeVisible();
    await element(by.id('project-address-input')).typeText('ул. Тестовая, 1');

    // Select apartment type
    await expect(element(by.id('apartment-type-dropdown'))).toBeVisible();
    await element(by.id('apartment-type-dropdown')).tap();
    await element(by.text('Новостройка')).tap();

    // Submit project
    await expect(element(by.id('create-project-submit'))).toBeVisible();
    await element(by.id('create-project-submit')).tap();

    // Verify project was created
    await expect(element(by.text('Тестовый проект'))).toBeVisible();
  });

  it('should validate required fields', async () => {
    await element(by.id('tab-projects')).tap();
    await element(by.id('create-project-button')).tap();

    // Try to submit without filling fields
    await element(by.id('create-project-submit')).tap();

    // Should show validation error
    await expect(element(by.text('Название проекта обязательно'))).toBeVisible();
  });
});