# 📝 SCENARIO TEMPLATE: E2E Test Template

Используйте этот шаблон для создания новых E2E сценариев тестирования для Apartment Auditor.

---

## TEMPLATE: Базовый Сценарий

```typescript
// e2e/scenarios/XX-scenario-name.e2e.ts

describe('[CATEGORY] [SCENARIO NAME]', () => {
  beforeAll(async () => {
    // Запустить приложение один раз в начале всех тестов
    await device.launchApp();
  });

  beforeEach(async () => {
    // Перезагрузить приложение перед каждым тестом
    await device.reloadReactNative();
  });

  afterEach(async () => {
    // Очистить состояние после каждого теста
    await device.clearKeychain();
  });

  it('should [specific behavior] when [condition]', async () => {
    // ARRANGE - подготовка
    // Навигация, открытие экранов, и т.д.

    // ACT - действие
    // Взаимодействие с UI: нажатие кнопок, ввод текста, и т.д.

    // ASSERT - проверка
    // Проверка результата и состояния
  });
});
```

---

## EXAMPLE 1: Create Project Scenario

```typescript
// e2e/scenarios/02-create-project.e2e.ts

import { CreateProjectPage } from '../pages/CreateProjectPage';

describe('[PROJECT] Create Project with Participants', () => {
  let projectPage: CreateProjectPage;

  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    projectPage = new CreateProjectPage();
  });

  it('should create project with valid data', async () => {
    // ARRANGE
    const projectName = 'Test Apartment - Unit Test';
    const description = '2-bedroom apartment';
    const participants = [
      { name: 'John Doe', role: 'Auditor' },
      { name: 'Jane Smith', role: 'Inspector' },
    ];

    // ACT - STEP 1: Open CreateProjectModal
    await projectPage.open();
    await waitFor(element(by.text('Create New Project')))
      .toBeVisible()
      .withTimeout(5000);

    // ACT - STEP 2: Fill Project Details
    await projectPage.fillProjectName(projectName);
    await projectPage.fillProjectDescription(description);

    // ACT - STEP 3: Add Participants
    for (const participant of participants) {
      await projectPage.addParticipant(participant.name, participant.role);
    }

    // ACT - STEP 4: Submit Form
    await projectPage.createProject();

    // ASSERT - Check Modal Closed
    await waitFor(element(by.text('Create New Project')))
      .not.toBeVisible()
      .withTimeout(5000);

    // ASSERT - Check Project in List
    await waitFor(element(by.text(projectName)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should validate required fields', async () => {
    // ARRANGE
    await projectPage.open();

    // ACT - Try to create without name
    await projectPage.createProject();

    // ASSERT
    await waitFor(element(by.text('Project name is required')))
      .toBeVisible()
      .withTimeout(3000);

    // ASSERT - Modal should remain open
    await expect(element(by.text('Create New Project'))).toBeVisible();
  });

  it('should close modal on cancel', async () => {
    // ARRANGE
    await projectPage.open();

    // ACT
    await projectPage.close();

    // ASSERT
    await waitFor(element(by.text('Create New Project')))
      .not.toBeVisible()
      .withTimeout(3000);
  });
});
```

---

## EXAMPLE 2: Inspection Workflow Scenario

```typescript
// e2e/scenarios/03-full-inspection.e2e.ts

import { InspectionPage } from '../pages/InspectionPage';
import { CreateProjectPage } from '../pages/CreateProjectPage';

describe('[INSPECTION] Complete Inspection Workflow', () => {
  let inspectionPage: InspectionPage;
  let projectPage: CreateProjectPage;

  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    inspectionPage = new InspectionPage();
    projectPage = new CreateProjectPage();
  });

  it('should complete full inspection cycle for single category', async () => {
    // ARRANGE - Create a project
    await projectPage.open();
    await projectPage.fillProjectName('Inspection Test Apartment');
    await projectPage.createProject();

    // ACT - PHASE 1: Select Project and Start Inspection
    await element(by.text('Inspection Test Apartment')).tap();
    await waitFor(element(by.text('Object Details')))
      .toBeVisible()
      .withTimeout(5000);

    // ACT - PHASE 2: Select Category
    const categoryName = 'Walls';
    await inspectionPage.selectCategory(categoryName);
    await waitFor(element(by.text('Walls')))
      .toBeVisible()
      .withTimeout(5000);

    // ACT - PHASE 3: Inspect First 5 Checkpoints
    for (let i = 0; i < 5; i++) {
      // Open checkpoint
      await inspectionPage.openCheckpoint(i);

      // Select result
      await inspectionPage.selectResult('PASS');

      // Add photo
      await inspectionPage.addPhoto();

      // Add note
      await inspectionPage.addNote(`Checkpoint ${i + 1} looks good`);

      // Select room
      await inspectionPage.selectRoom('Living Room');

      // Save
      await inspectionPage.saveCheckpoint();

      // Verify progress updated
      const progress = await inspectionPage.getProgress();
      expect(progress).toBeGreaterThan(0);
    }

    // ASSERT - Check progress bar
    const finalProgress = await inspectionPage.getProgress();
    expect(finalProgress).toBeGreaterThan(0);
  });
});
```

---

## EXAMPLE 3: Photo Management Scenario

```typescript
// e2e/scenarios/04-photo-workflow.e2e.ts

import { InspectionPage } from '../pages/InspectionPage';

describe('[PHOTOS] Photo Management Workflow', () => {
  let inspectionPage: InspectionPage;

  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    inspectionPage = new InspectionPage();
  });

  it('should add and manage photos in checkpoint', async () => {
    // ARRANGE - Open existing project and checkpoint
    await inspectionPage.openProject('Test Apartment');
    await inspectionPage.selectCategory('Walls');
    await inspectionPage.openCheckpoint(0);

    // ACT - Add single photo
    await inspectionPage.addPhoto();

    // ASSERT - Photo should be visible
    await waitFor(element(by.id('photoGrid')))
      .toBeVisible()
      .withTimeout(3000);

    // ACT - Add second photo
    await inspectionPage.addPhoto();

    // ASSERT - Should have 2 photos
    const photoCount = await inspectionPage.getPhotoCount();
    expect(photoCount).toBe(2);

    // ACT - Remove first photo (swipe left)
    await element(by.id('photo-0')).multiTap();
    await element(by.id('deletePhotoButton')).tap();

    // ASSERT - Should have 1 photo
    const updatedCount = await inspectionPage.getPhotoCount();
    expect(updatedCount).toBe(1);

    // ACT - Save checkpoint
    await inspectionPage.saveCheckpoint();

    // ASSERT - Checkpoint should be updated
    await waitFor(element(by.text('Checkpoint saved')))
      .toBeVisible()
      .withTimeout(3000);
  });
});
```

---

## EXAMPLE 4: Error Handling Scenario

```typescript
// e2e/scenarios/08-error-handling.e2e.ts

describe('[ERROR] Error Handling and Recovery', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should handle permission denied gracefully', async () => {
    // ARRANGE - Simulate permission denied
    // Это зависит от конкретного устройства/эмулятора

    // ACT - Try to add photo without permission
    // This would require native permission mocking

    // ASSERT - Should show error message
    // await waitFor(element(by.text('Permission denied')))
    //   .toBeVisible()
    //   .withTimeout(3000);
  });

  it('should handle network errors', async () => {
    // ARRANGE - Simulate offline mode
    await device.disableSynchronization();

    // ACT - Try to export PDF
    await element(by.id('exportButton')).tap();

    // ASSERT - Should show error
    await waitFor(element(by.text('Network error')))
      .toBeVisible()
      .withTimeout(3000);

    // ACT - Enable sync
    await device.enableSynchronization();
  });

  it('should persist data on app crash', async () => {
    // ARRANGE - Create project
    await element(by.id('createProjectButton')).tap();
    await element(by.id('projectNameInput')).typeText('Crash Test');
    await element(by.id('createButton')).tap();

    // ACT - Kill and relaunch app
    await device.sendToBackground({ duration: 1 });
    await device.launchApp({ newInstance: false });

    // ASSERT - Data should be restored
    await waitFor(element(by.text('Crash Test')))
      .toBeVisible()
      .withTimeout(5000);
  });
});
```

---

## PAGE OBJECT PATTERN: CheckpointPage Example

```typescript
// e2e/pages/CheckpointPage.ts

export class CheckpointPage {
  async openCheckpoint(checkpointIndex: number) {
    const checkpointElement = element(
      by.id(`checkpoint-${checkpointIndex}`)
    );
    await waitFor(checkpointElement)
      .toBeVisible()
      .withTimeout(3000);
    await checkpointElement.tap();
  }

  async selectResult(result: 'pass' | 'fail' | 'noncompliant') {
    const buttonId = `result-${result}`;
    await element(by.id(buttonId)).tap();
  }

  async addPhoto() {
    await element(by.id('addPhotoButton')).tap();
    await waitFor(element(by.text('Camera Roll')))
      .toBeVisible()
      .withTimeout(5000);
    // Select first photo
    await element(by.id('photo-0')).tap();
    await element(by.text('Choose')).tap();
  }

  async addNote(note: string) {
    await element(by.id('addNoteButton')).tap();
    await element(by.id('noteInput')).typeText(note);
    await element(by.id('saveNoteButton')).tap();
  }

  async selectRoom(room: string) {
    await element(by.id('roomSelector')).tap();
    await element(by.text(room)).tap();
  }

  async saveCheckpoint() {
    await element(by.id('saveButton')).tap();
    await waitFor(element(by.text('Checkpoint saved')))
      .toBeVisible()
      .withTimeout(3000);
  }

  async getProgress(): Promise<number> {
    const element = await element(by.id('progressBar'));
    const attrs = await element.getAttributes();
    return parseInt(attrs.progress || '0');
  }

  async getPhotoCount(): Promise<number> {
    const photoGrid = await element(by.id('photoGrid'));
    const attrs = await photoGrid.getAttributes();
    return parseInt(attrs.itemCount || '0');
  }
}
```

---

## BEST PRACTICES FOR SCENARIOS

### 1. Use Descriptive Names
```typescript
// ✓ GOOD
it('should save checkpoint with pass result and photo', async () => { });

// ❌ BAD
it('should work', async () => { });
```

### 2. Use Page Objects
```typescript
// ✓ GOOD
const inspectionPage = new InspectionPage();
await inspectionPage.selectResult('PASS');
await inspectionPage.addPhoto();

// ❌ BAD
await element(by.id('button1')).tap();
await element(by.id('button2')).tap();
```

### 3. Use Fixtures for Test Data
```typescript
// ✓ GOOD
import { testParticipants } from '@fixtures/projects.fixture';
await projectPage.addParticipant(
  testParticipants.inspector.name,
  testParticipants.inspector.role
);

// ❌ BAD
await projectPage.addParticipant('John Doe', 'Inspector');
```

### 4. Use Clear Arrange-Act-Assert
```typescript
// ✓ GOOD
it('should complete checkpoint inspection', async () => {
  // ARRANGE
  await inspectionPage.openProject('Test Apartment');

  // ACT
  await inspectionPage.selectCategory('Walls');
  await inspectionPage.openCheckpoint(0);
  await inspectionPage.selectResult('PASS');

  // ASSERT
  expect(progress).toBeGreaterThan(0);
});
```

### 5. Add Meaningful Assertions
```typescript
// ✓ GOOD
await waitFor(element(by.text('Checkpoint saved')))
  .toBeVisible()
  .withTimeout(3000);

// ❌ BAD
await new Promise(r => setTimeout(r, 3000));
```

---

## CHECKLIST: Before Submitting New Scenario

- [ ] Scenario has descriptive name
- [ ] Uses Page Object Pattern
- [ ] Uses Arrange-Act-Assert structure
- [ ] Uses testIDs (not text selectors)
- [ ] Uses fixtures for test data
- [ ] Includes proper error handling
- [ ] All waits have timeout
- [ ] No hardcoded delays (use waitFor)
- [ ] Documented with comments
- [ ] Passes locally before PR

---

**Last Updated:** 2025-12-19
