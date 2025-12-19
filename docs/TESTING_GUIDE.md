# 📖 TESTING GUIDE: Apartment Auditor

Этот гайд поможет вам написать тесты для Apartment Auditor приложения.

---

## 📋 СОДЕРЖАНИЕ

1. [Unit Tests](#unit-tests)
2. [Integration Tests](#integration-tests)
3. [E2E Tests (Detox)](#e2e-tests)
4. [Best Practices](#best-practices)
5. [Debugging](#debugging)

---

## 🧪 UNIT TESTS

Unit тесты проверяют отдельные компоненты, функции и хуки в изоляции.

### Структура Unit теста

```typescript
// tests/hooks/usePhotoPicker.test.ts

import { renderHook, act } from '@testing-library/react-native';
import { usePhotoPicker } from '@hooks/usePhotoPicker';

describe('usePhotoPicker Hook', () => {
  beforeEach(() => {
    // Очистить моки перед каждым тестом
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      // ARRANGE
      const expected = {
        photos: [],
        loading: false,
        error: null,
      };

      // ACT
      const { result } = renderHook(() => usePhotoPicker());

      // ASSERT
      expect(result.current.photos).toEqual(expected.photos);
      expect(result.current.loading).toBe(expected.loading);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Photo Selection', () => {
    it('should pick single photo successfully', async () => {
      // ARRANGE
      const { result } = renderHook(() => usePhotoPicker());
      const mockPhoto = {
        uri: 'file://photo.jpg',
        width: 800,
        height: 600,
      };

      // ACT
      await act(async () => {
        await result.current.pickPhoto();
      });

      // ASSERT
      expect(result.current.photos).toHaveLength(1);
      expect(result.current.photos[0]).toEqual(mockPhoto);
    });

    it('should handle photo picker cancellation', async () => {
      // ARRANGE
      const { result } = renderHook(() => usePhotoPicker());

      // ACT
      await act(async () => {
        await result.current.pickPhoto(); // Отменить выбор
      });

      // ASSERT
      expect(result.current.photos).toHaveLength(0);
      expect(result.current.error).toBeNull();
    });

    it('should handle photo picker permission denied', async () => {
      // ARRANGE
      const { result } = renderHook(() => usePhotoPicker());
      // Мок: нет прав доступа

      // ACT
      await act(async () => {
        await result.current.pickPhoto();
      });

      // ASSERT
      expect(result.current.error).toBeDefined();
      expect(result.current.photos).toHaveLength(0);
    });
  });

  describe('Multiple Photos', () => {
    it('should pick multiple photos', async () => {
      // ARRANGE
      const { result } = renderHook(() => usePhotoPicker());

      // ACT
      await act(async () => {
        await result.current.pickMultiple(3);
      });

      // ASSERT
      expect(result.current.photos).toHaveLength(3);
    });

    it('should remove photo from list', async () => {
      // ARRANGE
      const { result } = renderHook(() => usePhotoPicker());
      await act(async () => {
        await result.current.pickMultiple(3);
      });

      // ACT
      act(() => {
        result.current.removePhoto(0); // Удалить первое фото
      });

      // ASSERT
      expect(result.current.photos).toHaveLength(2);
    });

    it('should clear all photos', async () => {
      // ARRANGE
      const { result } = renderHook(() => usePhotoPicker());
      await act(async () => {
        await result.current.pickMultiple(3);
      });

      // ACT
      act(() => {
        result.current.clearPhotos();
      });

      // ASSERT
      expect(result.current.photos).toHaveLength(0);
    });
  });
});
```

### Структура Component теста

```typescript
// tests/components/features/CreateProjectModal.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import userEvent from '@testing-library/user-event';
import { CreateProjectModal } from '@components/features/CreateProjectModal';

describe('CreateProjectModal Component', () => {
  const mockOnCreate = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render modal with title and form fields', () => {
    // ARRANGE & ACT
    render(
      <CreateProjectModal
        visible={true}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
      />
    );

    // ASSERT
    expect(screen.getByText('Create New Project')).toBeTruthy();
    expect(screen.getByPlaceholderText('Project Name')).toBeTruthy();
    expect(screen.getByPlaceholderText('Description')).toBeTruthy();
    expect(screen.getByText('Create')).toBeTruthy();
  });

  it('should not render when visible=false', () => {
    // ARRANGE & ACT
    const { queryByText } = render(
      <CreateProjectModal
        visible={false}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
      />
    );

    // ASSERT
    expect(queryByText('Create New Project')).toBeNull();
  });

  it('should update input fields when user types', async () => {
    // ARRANGE
    const user = userEvent.setup();
    render(
      <CreateProjectModal
        visible={true}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
      />
    );

    const nameInput = screen.getByPlaceholderText('Project Name');
    const descInput = screen.getByPlaceholderText('Description');

    // ACT
    await user.type(nameInput, 'Test Apartment');
    await user.type(descInput, 'Test Description');

    // ASSERT
    expect(nameInput.props.value).toBe('Test Apartment');
    expect(descInput.props.value).toBe('Test Description');
  });

  it('should call onCreate when form is submitted', async () => {
    // ARRANGE
    const user = userEvent.setup();
    render(
      <CreateProjectModal
        visible={true}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
      />
    );

    const nameInput = screen.getByPlaceholderText('Project Name');
    const createButton = screen.getByText('Create');

    // ACT
    await user.type(nameInput, 'Test Apartment');
    await user.press(createButton);

    // ASSERT
    await waitFor(() => {
      expect(mockOnCreate).toHaveBeenCalledWith({
        name: 'Test Apartment',
        description: expect.any(String),
      });
    });
  });

  it('should validate required fields', async () => {
    // ARRANGE
    const user = userEvent.setup();
    render(
      <CreateProjectModal
        visible={true}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
      />
    );

    const createButton = screen.getByText('Create');

    // ACT
    await user.press(createButton);

    // ASSERT
    await waitFor(() => {
      expect(screen.getByText('Project name is required')).toBeTruthy();
    });
    expect(mockOnCreate).not.toHaveBeenCalled();
  });

  it('should call onClose when close button is pressed', async () => {
    // ARRANGE
    const user = userEvent.setup();
    render(
      <CreateProjectModal
        visible={true}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
      />
    );

    const closeButton = screen.getByText('×'); // Close button

    // ACT
    await user.press(closeButton);

    // ASSERT
    expect(mockOnClose).toHaveBeenCalled();
  });
});
```

### AAA Pattern (Arrange-Act-Assert)

Все тесты должны следовать паттерну AAA:

```typescript
it('should do something when condition is met', () => {
  // ARRANGE - подготовка данных и компонентов
  const component = setupComponent();
  const expectedResult = 'expected value';

  // ACT - выполнение действия
  const result = component.doSomething();

  // ASSERT - проверка результата
  expect(result).toBe(expectedResult);
});
```

---

## 🔗 INTEGRATION TESTS

Integration тесты проверяют взаимодействие нескольких компонентов и сервисов.

### Структура Integration теста

```typescript
// tests/integration/01-project-creation.test.ts

import { renderHook, act } from '@testing-library/react-native';
import { useProjectStore } from '@services/store/projectStore';
import { checkpointsFixture } from '@fixtures/checkpoints.fixture';

describe('Project Creation Integration', () => {
  let store;

  beforeEach(() => {
    // Очистить store перед каждым тестом
    store = useProjectStore.getState();
    store.clearProjects();
  });

  it('should create project and persist to storage', async () => {
    // ARRANGE
    const projectData = {
      id: 'project-1',
      name: 'Квартира на Ленина',
      description: '2-комнатная квартира',
      location: 'Ленина, 15',
      createdAt: new Date(),
    };

    const expectedProject = {
      ...projectData,
      progress: 0,
      participants: [],
      checkpoints: checkpointsFixture,
    };

    // ACT
    act(() => {
      store.addProject(projectData);
    });

    // ASSERT
    const projects = store.getProjects();
    expect(projects).toHaveLength(1);
    expect(projects[0].name).toBe(projectData.name);
    expect(projects[0].id).toBe(projectData.id);

    // Проверить персистентность
    await store.saveToStorage();
    const loadedProjects = await store.loadFromStorage();
    expect(loadedProjects).toHaveLength(1);
  });

  it('should update project with participants', async () => {
    // ARRANGE
    const projectId = 'project-1';
    const participant1 = {
      id: 'participant-1',
      name: 'John Doe',
      role: 'Auditor',
      contact: 'john@example.com',
    };

    const participant2 = {
      id: 'participant-2',
      name: 'Jane Smith',
      role: 'Inspector',
      contact: 'jane@example.com',
    };

    // ACT
    act(() => {
      store.addProject({ id: projectId, name: 'Test Project' });
      store.addParticipant(projectId, participant1);
      store.addParticipant(projectId, participant2);
    });

    // ASSERT
    const project = store.getProject(projectId);
    expect(project.participants).toHaveLength(2);
    expect(project.participants).toContainEqual(participant1);
    expect(project.participants).toContainEqual(participant2);
  });

  it('should track inspection progress correctly', async () => {
    // ARRANGE
    const projectId = 'project-1';
    const categoryId = 'walls';

    act(() => {
      store.addProject({ id: projectId, name: 'Test Project' });
    });

    // ACT
    // Проверить первый чекпоинт
    act(() => {
      store.updateCheckpointStatus(projectId, categoryId, 0, 'pass');
    });

    // ASSERT
    let project = store.getProject(projectId);
    expect(project.progress[categoryId]).toBeLessThan(100);

    // ACT
    // Проверить все чекпоинты
    for (let i = 0; i < 40; i++) {
      act(() => {
        store.updateCheckpointStatus(projectId, categoryId, i, 'pass');
      });
    }

    // ASSERT
    project = store.getProject(projectId);
    expect(project.progress[categoryId]).toBe(100);
  });

  it('should handle checkpoint photos correctly', async () => {
    // ARRANGE
    const projectId = 'project-1';
    const categoryId = 'walls';
    const checkpointId = 'checkpoint-1';
    const photo = {
      id: 'photo-1',
      uri: 'file://photo.jpg',
      timestamp: new Date(),
    };

    // ACT
    act(() => {
      store.addProject({ id: projectId, name: 'Test Project' });
      store.addPhotoToCheckpoint(projectId, categoryId, checkpointId, photo);
    });

    // ASSERT
    const checkpoint = store.getCheckpoint(projectId, categoryId, checkpointId);
    expect(checkpoint.photos).toHaveLength(1);
    expect(checkpoint.photos[0].id).toBe(photo.id);

    // ACT
    // Удалить фото
    act(() => {
      store.removePhotoFromCheckpoint(projectId, categoryId, checkpointId, 'photo-1');
    });

    // ASSERT
    const updatedCheckpoint = store.getCheckpoint(projectId, categoryId, checkpointId);
    expect(updatedCheckpoint.photos).toHaveLength(0);
  });
});
```

### Test Fixtures

```typescript
// tests/fixtures/checkpoints.fixture.ts

export const checkpointsFixture = {
  walls: [
    {
      id: 'wall-1',
      name: 'Wall Surface Inspection',
      description: 'Check for cracks, damage, moisture',
      tolerances: 'No cracks larger than 1mm',
      method: 'Visual inspection',
      standard: 'Building Code Section 5.2',
      category: 'walls',
      photos: [],
      status: null,
    },
    {
      id: 'wall-2',
      name: 'Wall Color and Paint',
      description: 'Inspect paint condition',
      tolerances: 'Paint should be intact',
      method: 'Visual inspection',
      standard: 'Interior Design Standard 4.1',
      category: 'walls',
      photos: [],
      status: null,
    },
    // ... остальные чекпоинты
  ],
  // ... остальные категории
};

export const projectFixture = {
  id: 'test-project-1',
  name: 'Test Apartment',
  description: 'Test apartment for inspection',
  location: 'Test Street, 123',
  createdAt: new Date('2025-01-01'),
  participants: [
    {
      id: 'participant-1',
      name: 'Test Inspector',
      role: 'Auditor',
      contact: 'test@example.com',
    },
  ],
  checkpoints: checkpointsFixture,
  progress: {},
};
```

---

## 🎬 E2E TESTS (DETOX)

E2E тесты имитируют реальное взаимодействие пользователя с приложением.

### Базовая структура E2E теста

```typescript
// e2e/scenarios/02-create-project.e2e.ts

describe('Create Project Scenario', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  afterEach(async () => {
    await device.clearKeychain();
  });

  it('should create a new project with participants', async () => {
    // STEP 1: Нажать кнопку создания проекта
    await element(by.id('createProjectButton')).tap();

    // ✓ Проверить: Модаль открылась
    await waitFor(element(by.text('Create New Project')))
      .toBeVisible()
      .withTimeout(5000);

    // STEP 2: Заполнить название проекта
    await element(by.id('projectNameInput')).typeText('Test Apartment');
    await element(by.id('projectNameInput')).tapReturnKey();

    // STEP 3: Заполнить описание
    await element(by.id('projectDescriptionInput')).typeText('2-bedroom apartment');
    await element(by.id('projectDescriptionInput')).tapReturnKey();

    // STEP 4: Нажать "Next" (если есть шаг с участниками)
    await element(by.id('nextButton')).tap();

    // ✓ Проверить: Открылась форма участников
    await waitFor(element(by.text('Add Participants')))
      .toBeVisible()
      .withTimeout(3000);

    // STEP 5: Добавить первого участника
    await element(by.id('addParticipantButton')).tap();
    await element(by.id('participantNameInput')).typeText('John Doe');
    await element(by.id('participantRoleInput')).multiTap(); // выбрать из dropdown
    await element(by.text('Auditor')).tap();
    await element(by.id('saveParticipantButton')).tap();

    // STEP 6: Добавить второго участника
    await element(by.id('addParticipantButton')).tap();
    await element(by.id('participantNameInput')).typeText('Jane Smith');
    await element(by.id('participantRoleInput')).multiTap();
    await element(by.text('Inspector')).tap();
    await element(by.id('saveParticipantButton')).tap();

    // ✓ Проверить: 2 участника в списке
    await waitFor(element(by.text('John Doe')))
      .toBeVisible()
      .withTimeout(3000);
    await waitFor(element(by.text('Jane Smith')))
      .toBeVisible()
      .withTimeout(3000);

    // STEP 7: Нажать "Create Project"
    await element(by.id('createButton')).tap();

    // ✓ Проверить: Модаль закрылась
    await waitFor(element(by.text('Create New Project')))
      .not.toBeVisible()
      .withTimeout(5000);

    // ✓ Проверить: Проект в списке
    await waitFor(element(by.text('Test Apartment')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should validate required fields', async () => {
    // STEP 1: Открыть CreateProjectModal
    await element(by.id('createProjectButton')).tap();

    // STEP 2: Попробовать создать без названия
    await element(by.id('createButton')).tap();

    // ✓ Проверить: Ошибка валидации
    await waitFor(element(by.text('Project name is required')))
      .toBeVisible()
      .withTimeout(3000);

    // STEP 3: Модаль остается открытой
    await waitFor(element(by.text('Create New Project')))
      .toBeVisible()
      .withTimeout(3000);
  });
});
```

### Page Object Model для E2E

```typescript
// e2e/pages/CreateProjectPage.ts

export class CreateProjectPage {
  async open() {
    await element(by.id('createProjectButton')).tap();
    await waitFor(element(by.text('Create New Project')))
      .toBeVisible()
      .withTimeout(5000);
  }

  async fillProjectName(name: string) {
    await element(by.id('projectNameInput')).typeText(name);
  }

  async fillProjectDescription(description: string) {
    await element(by.id('projectDescriptionInput')).typeText(description);
  }

  async clickNext() {
    await element(by.id('nextButton')).tap();
  }

  async addParticipant(name: string, role: string) {
    await element(by.id('addParticipantButton')).tap();
    await element(by.id('participantNameInput')).typeText(name);
    await element(by.id('participantRoleInput')).multiTap();
    await element(by.text(role)).tap();
    await element(by.id('saveParticipantButton')).tap();
  }

  async createProject() {
    await element(by.id('createButton')).tap();
  }

  async verifyProjectCreated(projectName: string) {
    await waitFor(element(by.text(projectName)))
      .toBeVisible()
      .withTimeout(5000);
  }

  async verifyErrorMessage(message: string) {
    await waitFor(element(by.text(message)))
      .toBeVisible()
      .withTimeout(3000);
  }

  async close() {
    await element(by.id('closeButton')).tap();
    await waitFor(element(by.text('Create New Project')))
      .not.toBeVisible()
      .withTimeout(3000);
  }
}
```

### Использование Page Object в тестах

```typescript
// e2e/scenarios/03-full-inspection.e2e.ts

import { CreateProjectPage } from '../pages/CreateProjectPage';
import { InspectionPage } from '../pages/InspectionPage';

describe('Full Inspection Workflow', () => {
  let projectPage: CreateProjectPage;
  let inspectionPage: InspectionPage;

  beforeEach(async () => {
    await device.reloadReactNative();
    projectPage = new CreateProjectPage();
    inspectionPage = new InspectionPage();
  });

  it('should complete full inspection', async () => {
    // Создать проект
    await projectPage.open();
    await projectPage.fillProjectName('Test Apartment');
    await projectPage.fillProjectDescription('2-bedroom');
    await projectPage.createProject();

    // Открыть проект
    await element(by.text('Test Apartment')).tap();

    // Начать инспекцию
    await inspectionPage.selectCategory('Walls');
    await inspectionPage.verifyProgressBar(0);

    // Проверить первый чекпоинт
    await inspectionPage.openCheckpoint(0);
    await inspectionPage.selectResult('PASS');
    await inspectionPage.addPhoto();
    await inspectionPage.addNote('Wall looks good');
    await inspectionPage.saveCheckpoint();

    // ✓ Проверить: Прогресс увеличился
    await inspectionPage.verifyProgressBar(1);
  });
});
```

---

## ✅ BEST PRACTICES

### 1. Используйте testID для элементов

```typescript
// ✓ ХОРОШО - используйте testID
<TouchableOpacity testID="createProjectButton" onPress={onCreate}>
  <Text>Create Project</Text>
</TouchableOpacity>

// ❌ ПЛОХО - не полагайтесь на текст
<TouchableOpacity onPress={onCreate}>
  <Text>Create Project</Text>
</TouchableOpacity>
```

### 2. Следуйте соглашениям об именовании

```
testID: <component>-<action> или <screen>-<element>

Примеры:
- createProjectButton
- projectNameInput
- categoryCard-walls
- checkpointDetailSheet
- photoGrid-image-0
```

### 3. Используйте fixtures для тестовых данных

```typescript
// ✓ ХОРОШО
import { projectFixture } from '@fixtures/projects.fixture';

it('should load project', () => {
  store.addProject(projectFixture);
  expect(store.getProject(projectFixture.id)).toBeDefined();
});

// ❌ ПЛОХО - hardcode данные
it('should load project', () => {
  store.addProject({ id: '1', name: 'Test' });
  // ...
});
```

### 4. Используйте мокирование для внешних зависимостей

```typescript
// ✓ ХОРОШО
jest.mock('@services/pdf/pdfGenerator');
import { generatePDF } from '@services/pdf/pdfGenerator';

it('should call PDF generator', async () => {
  await someFunction();
  expect(generatePDF).toHaveBeenCalled();
});

// ❌ ПЛОХО - не изолировано
it('should call PDF generator', async () => {
  // Реально генерирует PDF...
  await someFunction();
});
```

### 5. Используйте describe для группировки тестов

```typescript
// ✓ ХОРОШО - логичная иерархия
describe('CreateProjectModal', () => {
  describe('Rendering', () => {
    it('should render title', () => { /* */ });
    it('should render form fields', () => { /* */ });
  });

  describe('Form Validation', () => {
    it('should validate required fields', () => { /* */ });
    it('should validate email format', () => { /* */ });
  });

  describe('Submission', () => {
    it('should create project on submit', () => { /* */ });
  });
});
```

### 6. Тестируйте поведение, не реализацию

```typescript
// ✓ ХОРОШО - тестируем поведение
it('should disable submit button when form is invalid', () => {
  // ...
  expect(submitButton.props.disabled).toBe(true);
});

// ❌ ПЛОХО - тестируем внутреннюю реализацию
it('should set formErrors state', () => {
  // ...
  expect(component.state.formErrors).toBeDefined();
});
```

### 7. Используйте waitFor для асинхронных операций

```typescript
// ✓ ХОРОШО
await waitFor(() => {
  expect(element(by.text('Project saved'))).toBeVisible();
}).withTimeout(5000);

// ❌ ПЛОХО - может быть ненадежно
await new Promise(resolve => setTimeout(resolve, 3000));
expect(element(by.text('Project saved'))).toBeVisible();
```

---

## 🐛 DEBUGGING

### Запуск тестов в режиме отладки

```bash
# Unit тесты с паузой
node --inspect-brk node_modules/jest/bin/jest.js tests/hooks/usePhotoPicker.test.ts

# Затем откройте chrome://inspect в Chrome
```

### E2E отладка

```bash
# Запустить один тест с паузой
detox test e2e/scenarios/02-create-project.e2e.ts \
  --configuration ios.sim.debug \
  --record-logs all \
  --record-video all

# Смотреть видео из .artifacts/
```

### Использование console.log

```typescript
// Хорошо для быстрой отладки
console.log('Current state:', store.getState());

// Для E2E
it('should do something', async () => {
  console.log('Starting test...');
  await element(by.id('button')).tap();
  console.log('Button tapped');
  // ...
});
```

### Проверка элементов в E2E

```typescript
// Найти элемент
const element = element(by.id('myElement'));

// Проверить его свойства
await expect(element).toBeVisible();
await expect(element).toExist();
await expect(element).toHaveToggleValue(true);

// Взаимодействие
await element.tap();
await element.multiTap(3);
await element.longPress();
await element.typeText('text');
```

---

## 📊 COVERAGE TARGETS

| Тип | Минимум | Целевой |
|-----|---------|--------|
| Statements | 70% | 85% |
| Branches | 60% | 80% |
| Functions | 70% | 85% |
| Lines | 70% | 85% |

Запустить coverage отчет:

```bash
npm run test:coverage
```

---

## 🔗 ПОЛЕЗНЫЕ ССЫЛКИ

- [Jest Documentation](https://jestjs.io/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Detox Documentation](https://wix.github.io/Detox/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Последнее обновление:** 2025-12-19
