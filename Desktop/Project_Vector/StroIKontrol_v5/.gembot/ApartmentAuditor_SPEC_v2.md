# Apartment Auditor — Спецификация v2.0

## ЦВЕТА
| Роль | Код | Использование |
|------|-----|---------------|
| Primary | #2196F3 | Кнопки, акценты, FAB |
| Background | #F5F5F5 | Фон экранов |
| Surface | #FFFFFF | Карточки, модалки |
| Соответствует | #27AE60 | Статус OK |
| Дефект | #EB5757 | Статус ошибки |
| Не осмотрено | #BDBDBD | Статус пропуска |
| Text Primary | #212121 | Заголовки |
| Text Secondary | #757575 | Подписи |

---

## 8 КАТЕГОРИЙ
| ID | Название | Иконка (lucide) |
|----|----------|-----------------|
| floor | Пол | `layers` |
| walls | Стены | `grid-3x3` |
| ceiling | Потолок | `arrow-up` |
| windows | Окна | `square` |
| doors | Двери | `door-open` |
| electrical | Электрика | `zap` |
| plumbing | Водоснабжение | `droplet` |
| hvac | Отопление/Вентиляция | `thermometer` |

---

## ЭКРАНЫ

### 1. ObjectList (Главный)
```
ПУТЬ: /objects
ТАБЫ: Актуальные | Архив

КОМПОНЕНТЫ:
├── Header: "Мои объекты"
├── TabBar: переключение актуальные/архив
├── FlatList: карточки проектов
│   └── ProjectCard: фото, название, адрес, дата, прогресс %
└── FAB: кнопка "+" → CreateObject

ДЕЙСТВИЯ:
- Tap карточка → ObjectDetails
- Tap FAB → CreateObject
- Long press → меню (Архивировать/Удалить)
```

### 2. CreateObject
```
ПУТЬ: /objects/create

ФОРМА:
├── name: TextInput (обязательно)
│   placeholder: "Название (например, ЖК Лес)"
├── address: TextInput (обязательно)
│   placeholder: "Адрес"
└── coverPhoto: ImagePicker (опционально)
    label: "Фото объекта"

КНОПКА "Сохранить":
- disabled (бледный) → пока форма невалидна
- active (Primary) → когда name + address заполнены
- action: создать Project, navigate → ObjectDetails
```

### 3. ObjectDetails (Dashboard)
```
ПУТЬ: /objects/:id

HEADER:
├── title: {project.name}
├── subtitle: {project.address}
└── rightAction: иконка "users" → Participants

BODY:
└── Grid 2x4: 8 плиток категорий
    ├── Иконка + Название
    ├── Прогресс (X/Y проверено)
    └── Состояние: empty | in-progress | completed
        - empty: серая рамка
        - in-progress: Primary рамка + прогресс
        - completed: зелёная галочка

FOOTER:
└── Button "Сформировать PDF"
    - visible: если есть хоть 1 проверенный пункт
    - action: navigate → ReportPreview
```

### 4. Checklist (Процесс проверки)
```
ПУТЬ: /objects/:id/check/:categoryId

HEADER:
├── ProgressBar: текущий / всего
├── Название категории
└── Счётчик ошибок (красный badge)

BODY (ScrollView):
├── ReferenceImage: эталонное фото (как должно быть)
├── Description: текст требования
├── StandardRef: "СНиП 3.04.01-87 п. 4.2" (ссылка)
├── UserPhotos: сетка добавленных фото
│   └── кнопки: Камера | Галерея
└── Comment: TextInput (опционально)

FOOTER (Fixed, 3 кнопки):
├── "Не соответствует" (Дефект #EB5757)
│   └── requirePhoto: true (не даёт нажать без фото)
├── "Не осмотрено" (Серый #BDBDBD)
└── "Соответствует" (Зелёный #27AE60)

АНИМАЦИЯ:
- При нажатии кнопки → карточка уезжает влево
- Появляется следующий пункт
- Последний пункт → возврат в ObjectDetails
```

### 5. Participants (Modal)
```
ПУТЬ: /objects/:id/participants

СПИСОК:
└── FlatList участников
    └── ParticipantCard: ФИО, Должность, Организация

ДОБАВЛЕНИЕ:
├── Button "Импорт из контактов" → expo-contacts
└── Button "Добавить вручную" → форма

ФОРМА:
├── lastName: TextInput (обязательно)
├── firstName: TextInput (обязательно)
├── middleName: TextInput
├── organization: TextInput
├── position: TextInput
├── phone: TextInput
└── email: TextInput
```

### 6. ReportPreview
```
ПУТЬ: /objects/:id/report

BODY:
├── Сводка: "Проверено X пунктов, дефектов Y"
├── Рекомендация: плитка с текстом
│   └── "Направить претензию застройщику"
└── Preview: миниатюра первой страницы PDF

ACTIONS:
├── Button "Открыть PDF"
│   └── states: loading → active
│   └── action: expo-print → Share dialog
└── Button "Поделиться"
    └── action: Share (Email, WhatsApp, Files)
```

### 7. Services (Вкладка)
```
ПУТЬ: /services

СПИСОК:
├── "Сообщить о проблеме" → Linking.openURL(email)
├── "Оставить отзыв" → Store link
└── "О программе" → версия, лицензии
```

---

## TYPESCRIPT ТИПЫ

```typescript
// Статусы проверки
type CheckStatus = 'complies' | 'defect' | 'not_inspected' | null;

// Участник осмотра
interface Participant {
  id: string;
  firstName: string;      // Имя (обязательно)
  lastName: string;       // Фамилия (обязательно)
  middleName?: string;    // Отчество
  organization?: string;  // Организация
  position?: string;      // Должность
  phone?: string;
  email?: string;
  isImportedFromContacts: boolean;
}

// Пункт чек-листа
interface Checkpoint {
  id: string;
  categoryId: string;           // 'walls', 'floor', etc.
  title: string;                // "Царапины на стеклопакете"
  description: string;          // Как должно быть
  standardReference: string;    // "СНиП 3.04.01-87 п. 4.2"
  referenceImageUrl: string;    // Эталонное фото (assets)
  
  // Данные пользователя:
  status: CheckStatus;
  userPhotos: string[];         // file:// пути (НЕ base64!)
  userComment?: string;
  timestamp?: number;
}

// Категория (плитка на dashboard)
interface Category {
  id: string;                   // 'walls', 'floor', etc.
  name: string;                 // "Стены", "Пол"
  icon: string;                 // lucide icon name
  checkpoints: Checkpoint[];
  // Вычисляемые:
  get progress(): number;       // 0-100%
  get defectCount(): number;
  get checkedCount(): number;
  get totalCount(): number;
}

// Проект (Квартира)
interface Project {
  id: string;
  name: string;                 // "ЖК Лес"
  address: string;
  coverPhoto?: string;          // file:// путь
  dateCreated: number;
  dateUpdated: number;
  isArchived: boolean;
  
  participants: Participant[];
  categories: Category[];       // 8 категорий, создаются при init
}

// Для генератора PDF
interface ReportData {
  project: Project;
  generatedAt: string;
  categoriesIncluded: Category[]; // только с проверками
  totalChecked: number;
  totalDefects: number;
}
```

---

## PDF СТРУКТУРА (Акт осмотра)

```
┌─────────────────────────────────────────┐
│  [Логотип] АУДИТОР КВАРТИР              │
│                                         │
│  АКТ ОСМОТРА ПОМЕЩЕНИЯ                  │
│                                         │
│  Дата: {generatedAt}                    │
│  Адрес: {project.address}               │
├─────────────────────────────────────────┤
│  УЧАСТНИКИ ОСМОТРА                      │
│  ┌─────────┬───────────┬────────────┐   │
│  │ ФИО     │ Должность │ Организация│   │
│  ├─────────┼───────────┼────────────┤   │
│  │ ...     │ ...       │ ...        │   │
│  └─────────┴───────────┴────────────┘   │
├─────────────────────────────────────────┤
│  1. ОКОННЫЕ БЛОКИ                       │
│                                         │
│  ✗ Царапины на стеклопакете             │
│    Нарушение: СНиП 3.04.01-87 п. 4.2    │
│    [фото] [фото] [фото]                 │
│    Комментарий: ...                     │
│                                         │
│  ✓ Герметизация швов — соответствует    │
├─────────────────────────────────────────┤
│  2. СТЕНЫ                               │
│  ...                                    │
├─────────────────────────────────────────┤
│  ИТОГО                                  │
│  Проверено пунктов: {totalChecked}      │
│  Выявлено дефектов: {totalDefects}      │
├─────────────────────────────────────────┤
│  ЗАКЛЮЧЕНИЕ                             │
│  Отделка выполнена с замечаниями.       │
│  Рекомендуется направить претензию.     │
├─────────────────────────────────────────┤
│  ПОДПИСИ СТОРОН                         │
│                                         │
│  _____________ / {participant1} /       │
│  _____________ / {participant2} /       │
└─────────────────────────────────────────┘
```

**Реализация:** expo-print с HTML-шаблоном, фото в base64

---

## СТЕК

| Пакет | Версия | Назначение |
|-------|--------|------------|
| expo | ~52.0.0 | Платформа |
| react-native | 0.76+ | UI |
| expo-router | 4.x | Навигация |
| zustand | 5.x | State |
| @react-native-async-storage | latest | Persist |
| expo-camera | latest | Съёмка |
| expo-image-picker | latest | Галерея |
| expo-print | latest | PDF |
| expo-sharing | latest | Share |
| expo-contacts | latest | Импорт контактов |
| lucide-react-native | latest | Иконки |

---

## СТРУКТУРА ПАПОК

```
app/
├── (tabs)/
│   ├── _layout.tsx          # Tab navigator
│   ├── index.tsx            # → redirect to /objects
│   ├── objects/
│   │   ├── index.tsx        # ObjectList
│   │   ├── create.tsx       # CreateObject
│   │   └── [id]/
│   │       ├── index.tsx    # ObjectDetails
│   │       ├── participants.tsx
│   │       ├── report.tsx
│   │       └── check/
│   │           └── [categoryId].tsx  # Checklist
│   └── services.tsx
├── _layout.tsx              # Root layout
components/
├── ProjectCard.tsx
├── CategoryTile.tsx
├── CheckpointCard.tsx
├── ParticipantCard.tsx
├── PhotoGrid.tsx
└── StatusButton.tsx
constants/
├── colors.ts                # Все цвета
├── categories.ts            # 8 категорий + иконки
└── checkpoints/             # Пункты проверки по категориям
    ├── floor.ts
    ├── walls.ts
    └── ...
store/
├── useProjectStore.ts       # Zustand + persist
└── types.ts                 # TypeScript интерфейсы
services/
├── pdfGenerator.ts          # HTML шаблон + expo-print
└── contactsImport.ts        # expo-contacts helper
assets/
└── reference/               # Эталонные фото
    ├── floor/
    ├── walls/
    └── ...
```

---

## КРИТИЧЕСКИЕ ПРАВИЛА

1. **Фото хранить как file:// пути**, НЕ base64 (экономия памяти)
2. **Base64 только для PDF** — конвертировать при генерации
3. **expo start --tunnel** — ВСЕГДА (Windows + телефон)
4. **Статус "Дефект" требует фото** — валидация перед сохранением
5. **Категории создаются при создании Project** — 8 штук сразу
