# 📊 TEST DATA GUIDE: Apartment Auditor

Руководство по использованию тестовых данных и fixtures в тестах.

---

## 📋 СТРУКТУРА ТЕСТОВЫХ ДАННЫХ

Все тестовые данные находятся в директории `tests/fixtures/`:

```
tests/fixtures/
├── projects.fixture.ts ........ Фиксчуры проектов и участников
├── checkpoints.fixture.ts ..... Фиксчуры чекпоинтов по категориям
└── photos.fixture.ts ......... (опционально) Фиксчуры фотографий
```

---

## 🏢 PROJECTS FIXTURES

### Импорт

```typescript
import {
  basicProject,
  projectWithParticipants,
  projectPartiallyCompleted,
  projectFullyCompleted,
  createTestProject,
  createTestParticipant,
  testParticipants,
} from '@fixtures/projects.fixture';
```

### Использование в Tests

#### Unit Test

```typescript
import { useProjectStore } from '@services/store/projectStore';
import { basicProject } from '@fixtures/projects.fixture';

describe('Project Store', () => {
  it('should add project to store', () => {
    // ARRANGE
    const store = useProjectStore.getState();
    const project = basicProject;

    // ACT
    store.addProject(project);

    // ASSERT
    expect(store.getProject(project.id)).toEqual(project);
  });
});
```

#### Integration Test

```typescript
import { projectWithParticipants } from '@fixtures/projects.fixture';

describe('Project with Participants Integration', () => {
  it('should load project with all participants', async () => {
    // ARRANGE
    const project = projectWithParticipants;

    // ACT
    await store.addProject(project);

    // ASSERT
    const loaded = store.getProject(project.id);
    expect(loaded.participants).toHaveLength(3);
    expect(loaded.participants[0].name).toBe('John Doe');
  });
});
```

#### E2E Test (Detox)

```typescript
import { testParticipants } from '@fixtures/projects.fixture';

describe('Create Project with Inspector', () => {
  it('should create project with inspector participant', async () => {
    // ARRANGE
    const projectPage = new CreateProjectPage();
    const inspector = testParticipants.inspector;

    // ACT
    await projectPage.open();
    await projectPage.fillProjectName('E2E Test Project');
    await projectPage.addParticipant(inspector.name, inspector.role);
    await projectPage.createProject();

    // ASSERT
    await waitFor(element(by.text(inspector.name)))
      .toBeVisible()
      .withTimeout(3000);
  });
});
```

---

### Available Projects

#### basicProject
Самый простой проект без участников для базовых тестов.

```typescript
{
  id: 'project-basic-001',
  name: 'Test Apartment',
  description: 'Simple test apartment for unit testing',
  location: 'Test Street, 123',
  createdAt: new Date('2025-01-01T10:00:00Z'),
  participants: [],
  progress: { /* все категории 0% */ }
}
```

**Используйте когда:**
- Тестируете базовую функциональность создания проекта
- Не нужны участники
- Нужна чистая начальная точка

#### projectWithParticipants
Проект с 3 участниками разных ролей.

```typescript
{
  id: 'project-with-participants-001',
  name: 'Apartment with Inspectors',
  participants: [
    { id: 'participant-1', name: 'John Doe', role: 'Lead Auditor', ... },
    { id: 'participant-2', name: 'Jane Smith', role: 'Inspector', ... },
    { id: 'participant-3', name: 'Bob Johnson', role: 'Photographer', ... }
  ],
  progress: { /* все категории 0% */ }
}
```

**Используйте когда:**
- Тестируете функциональность участников
- Нужны несколько разных ролей
- Тестируете участие в инспекции

#### projectPartiallyCompleted
Проект с частичным прогрессом (смешанные 0-100%).

```typescript
{
  id: 'project-partial-001',
  progress: {
    walls: 100,        // Завершено
    floors: 75,        // Почти завершено
    ceiling: 50,       // На половине
    windows: 25,       // Только начали
    doors: 0,          // Не начинали
    // ... остальные 0
  }
}
```

**Используйте когда:**
- Тестируете отображение смешанного прогресса
- Нужна реалистичная ситуация частичной инспекции
- Тестируете фильтрацию по статусу

#### projectFullyCompleted
Проект со 100% прогрессом во всех категориях.

```typescript
{
  id: 'project-completed-001',
  progress: { /* все категории 100% */ }
}
```

**Используйте когда:**
- Тестируете экспорт завершенного проекта
- Нужно проверить поведение завершенного проекта
- Тестируете статусы и бейджи

---

### Factory Functions

#### createTestProject()

Создает новый проект с генерируемым ID и текущей датой.

```typescript
import { createTestProject } from '@fixtures/projects.fixture';

// Создать с дефолтными значениями
const project = createTestProject();

// Создать с переопределением некоторых полей
const customProject = createTestProject({
  name: 'My Custom Project',
  location: 'Custom Location',
  participants: [
    { id: '1', name: 'Alice', role: 'Auditor', contact: 'alice@example.com' }
  ]
});
```

#### createTestParticipant()

Создает нового участника с генерируемым ID.

```typescript
import { createTestParticipant } from '@fixtures/projects.fixture';

const participant = createTestParticipant({
  name: 'Test Inspector',
  role: 'Inspector',
  contact: 'test@example.com'
});
```

---

## ✅ CHECKPOINTS FIXTURES

### Импорт

```typescript
import {
  checkpointsFixture,
  allCheckpointsFlat,
  wallsCheckpoints,
  floorsCheckpoints,
  ceilingCheckpoints,
  windowsCheckpoints,
  doorsCheckpoints,
  plumbingCheckpoints,
  electricalCheckpoints,
  hvacCheckpoints,
  gasCheckpoints,
  createTestCheckpoint,
} from '@fixtures/checkpoints.fixture';
```

### Структура

```typescript
checkpointsFixture = {
  walls: [ /* 5 checkpoints */ ],
  floors: [ /* 5 checkpoints */ ],
  ceiling: [ /* 5 checkpoints */ ],
  windows: [ /* 5 checkpoints */ ],
  doors: [ /* 5 checkpoints */ ],
  plumbing: [ /* 5 checkpoints */ ],
  electrical: [ /* 5 checkpoints */ ],
  hvac: [ /* 5 checkpoints */ ],
  gas: [ /* 5 checkpoints */ ]
}

// Всего 45 checkpoints
allCheckpointsFlat = [ /* все 45 checkpoints в одном массиве */ ]
```

### Использование в Tests

#### Unit Test: Checkpoint Validation

```typescript
import { wallsCheckpoints } from '@fixtures/checkpoints.fixture';

describe('Checkpoint Validation', () => {
  it('should validate checkpoint structure', () => {
    // ARRANGE
    const checkpoint = wallsCheckpoints[0];

    // ASSERT
    expect(checkpoint).toHaveProperty('id');
    expect(checkpoint).toHaveProperty('name');
    expect(checkpoint).toHaveProperty('category');
    expect(checkpoint).toHaveProperty('description');
    expect(checkpoint).toHaveProperty('tolerances');
    expect(checkpoint).toHaveProperty('method');
    expect(checkpoint).toHaveProperty('standard');
    expect(checkpoint.category).toBe('walls');
  });
});
```

#### Integration Test: Category Filtering

```typescript
import { checkpointsFixture } from '@fixtures/checkpoints.fixture';

describe('Category Filtering', () => {
  it('should filter checkpoints by category', () => {
    // ARRANGE
    const store = useCategoryStore.getState();
    const wallCheckpoints = checkpointsFixture.walls;

    // ACT
    store.loadCheckpoints('walls', wallCheckpoints);

    // ASSERT
    expect(store.getCheckpoints('walls')).toHaveLength(5);
  });
});
```

#### E2E Test: Inspection Progress

```typescript
import { wallsCheckpoints } from '@fixtures/checkpoints.fixture';

describe('Inspection Progress', () => {
  it('should update progress when checking checkpoints', async () => {
    // ARRANGE
    const inspectionPage = new InspectionPage();
    const totalCheckpoints = wallsCheckpoints.length;

    // ACT
    await inspectionPage.selectCategory('walls');

    // Check first checkpoint
    for (let i = 0; i < totalCheckpoints; i++) {
      await inspectionPage.openCheckpoint(i);
      await inspectionPage.selectResult('PASS');
      await inspectionPage.saveCheckpoint();
    }

    // ASSERT
    const progress = await inspectionPage.getProgress();
    expect(progress).toBe(100);
  });
});
```

---

### Available Checkpoint Categories

Каждая категория имеет примерно 5 чекпоинтов:

#### walls (Стены)
- Wall Surface Condition
- Paint/Finish Quality
- Wall Plumb and Level
- Wallpaper/Covering Condition
- Baseboard Condition

#### floors (Полы)
- Floor Surface Condition
- Floor Level and Flatness
- Carpet/Flooring Material
- Transitions and Thresholds
- Subfloor Condition

#### ceiling (Потолок)
- Ceiling Surface Condition
- Ceiling Height and Level
- Paint/Finish Quality
- Insulation Visible
- Light Fixtures and Hardware

#### windows (Окна)
- Window Glass Condition
- Window Frame Condition
- Window Operation
- Window Seals and Weatherstripping
- Window Hardware

#### doors (Двери)
- Door Surface Condition
- Door Frame Condition
- Door Operation
- Door Locks and Hardware
- Door Weatherstripping

#### plumbing (Сантехника)
- Sink Operation
- Toilet Operation
- Shower/Tub Operation
- Visible Pipes
- Water Heater

#### electrical (Электричество)
- Outlets and Switches
- Light Fixtures
- Smoke Detectors
- Circuit Breaker Panel
- Electrical Safety

#### hvac (HVAC)
- Heating System Operation
- Air Conditioning Operation
- Ventilation System
- Thermostat Operation
- HVAC Unit Condition

#### gas (Газ)
- Gas Appliance Operation
- Gas Odor Check
- Gas Meter Condition
- Gas Line Inspection
- Gas Shut-off Valve

---

### Checkpoint Structure

```typescript
interface TestCheckpoint {
  id: string;                    // Уникальный ID
  name: string;                  // Название чекпоинта
  category: string;              // Категория (walls, floors, etc)
  description: string;           // Подробное описание
  tolerances: string;            // Допуски и стандарты
  method: string;                // Метод проверки
  standard: string;              // Стандарт/код
  photos?: string[];             // Массив фото (опционально)
  notes?: string[];              // Массив примечаний (опционально)
  status?: 'pass' | 'fail' | 'noncompliant' | null;  // Статус проверки
  room?: string;                 // Комната (опционально)
  timestamp?: Date;              // Время проверки (опционально)
}
```

---

### Factory Function: createTestCheckpoint()

```typescript
import { createTestCheckpoint } from '@fixtures/checkpoints.fixture';

// Создать с дефолтными значениями
const checkpoint = createTestCheckpoint();

// Создать с переопределением
const customCheckpoint = createTestCheckpoint({
  name: 'Custom Checkpoint',
  category: 'walls',
  description: 'Custom description',
  status: 'pass',
  photos: ['photo-1.jpg', 'photo-2.jpg'],
  room: 'Living Room'
});
```

---

## 🎯 BEST PRACTICES

### 1. Используйте правильную фиксчуру для сценария

```typescript
// ✓ GOOD - Используем подходящую фиксчуру
it('should export completed project', () => {
  const project = projectFullyCompleted;
  // ...
});

// ❌ BAD - Используем неподходящую фиксчуру
it('should export completed project', () => {
  const project = basicProject; // Не подходит!
  // ...
});
```

### 2. Не изменяйте фиксчуры напрямую

```typescript
// ✓ GOOD - Создайте копию
const project = { ...basicProject, name: 'Modified' };

// ❌ BAD - Изменяете оригинальную фиксчуру
basicProject.name = 'Modified'; // Влияет на другие тесты!
```

### 3. Используйте factory функции для уникальных данных

```typescript
// ✓ GOOD - Каждый тест получает уникальный ID
const project1 = createTestProject({ name: 'Project 1' });
const project2 = createTestProject({ name: 'Project 2' });

// ❌ BAD - Повторяющиеся IDs могут вызвать конфликты
const project1 = { ...basicProject, name: 'Project 1' };
const project2 = { ...basicProject, name: 'Project 2' }; // Одинаковый ID!
```

### 4. Документируйте использованные фиксчуры

```typescript
// ✓ GOOD
describe('Export Completed Project', () => {
  // Using: projectFullyCompleted fixture
  it('should export all inspection results', () => {
    // ...
  });
});

// ❌ BAD - Непонятно какая фиксчура используется
describe('Export Completed Project', () => {
  it('should export all inspection results', () => {
    // ...
  });
});
```

---

## 🔍 DEBUGGING FIXTURES

### Просмотр содержимого фиксчуры

```typescript
import { basicProject, checkpointsFixture } from '@fixtures';

// В консоли при запуске тестов
console.log('Basic Project:', JSON.stringify(basicProject, null, 2));
console.log('Walls Checkpoints:', checkpointsFixture.walls.length);
```

### Проверка структуры

```typescript
// Убедитесь, что фиксчура соответствует интерфейсу
const project: TestProject = basicProject; // TypeScript проверит

// Проверить наличие всех полей
Object.keys(basicProject).forEach(key => {
  console.log(`${key}: ${basicProject[key]}`);
});
```

---

## 📝 СОЗДАНИЕ НОВОЙ ФИКСЧУРЫ

Если вам нужна новая фиксчура для специфического сценария:

### 1. Добавьте в существующий файл

```typescript
// tests/fixtures/projects.fixture.ts

export const projectForPhotoTesting: TestProject = {
  id: 'project-photo-test',
  name: 'Photo Testing Project',
  description: 'Project with predefined photos',
  location: 'Photo Test Location',
  createdAt: new Date(),
  participants: [],
  progress: { /* ... */ }
};
```

### 2. Или создайте новый файл

```typescript
// tests/fixtures/photos.fixture.ts

export interface TestPhoto {
  id: string;
  uri: string;
  timestamp: Date;
  checkpointId: string;
  // ...
}

export const testPhotos: TestPhoto[] = [
  {
    id: 'photo-1',
    uri: 'file://mock-photo-1.jpg',
    timestamp: new Date(),
    checkpointId: 'checkpoint-1',
  },
  // ...
];
```

### 3. Экспортируйте из индекса (если есть)

```typescript
// tests/fixtures/index.ts
export * from './projects.fixture';
export * from './checkpoints.fixture';
export * from './photos.fixture'; // Новый файл
```

---

## 🎓 ПРИМЕРЫ КОМПЛЕКСНОГО ИСПОЛЬЗОВАНИЯ

### Example: Complete Test Suite

```typescript
// tests/integration/inspection-workflow.test.ts

import { projectWithParticipants } from '@fixtures/projects.fixture';
import { checkpointsFixture } from '@fixtures/checkpoints.fixture';
import { useProjectStore } from '@services/store/projectStore';

describe('Complete Inspection Workflow', () => {
  let store;

  beforeEach(() => {
    store = useProjectStore.getState();
  });

  it('should complete inspection of walls category', async () => {
    // ARRANGE
    const project = projectWithParticipants;
    const wallCheckpoints = checkpointsFixture.walls;

    store.addProject(project);
    store.loadCheckpoints(project.id, 'walls', wallCheckpoints);

    // ACT
    for (const checkpoint of wallCheckpoints) {
      store.updateCheckpointStatus(
        project.id,
        'walls',
        checkpoint.id,
        'pass',
        ['photo-1.jpg']
      );
    }

    // ASSERT
    const updatedProject = store.getProject(project.id);
    expect(updatedProject.progress.walls).toBe(100);
    expect(updatedProject.participants).toHaveLength(3);
  });
});
```

---

**Last Updated:** 2025-12-19

