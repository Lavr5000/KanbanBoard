# 🛠️ РУКОВОДСТВО ПО РЕАЛИЗАЦИИ

## БЫСТРЫЙ СТАРТ ДЛЯ РАЗРАБОТЧИКА

Этот документ содержит практические советы по реализации каждой фазы.

---

## ФАЗА 1: ОЧИСТКА ИНТЕРФЕЙСА (ПРИОРИТЕТ: 🔴 МАКСИМАЛЬНЫЙ)

### 1.1 Убрать ID задачи с карточки

**Файл:** `/src/features/kanban/ui/KanbanCard.tsx`

**Текущий код (строка 46):**
```jsx
<span className="text-[9px] text-gray-400 font-mono tracking-tighter bg-white/5 px-2 py-0.5 rounded">#{task.id.slice(0, 5)}</span>
```

**Что сделать:**
- ✅ Убрать весь блок с ID
- ✅ Убрать flex gap-2 контейнер
- ✅ ID показывать ТОЛЬКО в модальном окне (деталях)

**После:** ID будет видно только в полном виде задачи

---

### 1.2 Убрать Priority Badge с карточки

**Файл:** `/src/features/kanban/ui/KanbanCard.tsx`

**Текущий код (строки 111-119):**
```jsx
<div className="mt-3 flex items-center justify-between">
  <span className={`text-[9px] px-2.5 py-1 rounded-lg uppercase font-bold tracking-wide backdrop-blur-sm ...`}>
    {task.priority}
  </span>
</div>
```

**Что сделать:**
- ✅ Убрать весь блок
- ✅ Оставить только цветную точку (priority indicator) в заголовке
- ✅ Priority показывать ТОЛЬКО в модальном окне

**Результат:** На карточке остаётся только цветной кружок вместо текстового бейджа

---

### 1.3 Оптимизировать отображение описания

**Файл:** `/src/features/kanban/ui/KanbanCard.tsx`

**Текущий код (строки 102-109):**
```jsx
: (
  <div onClick={() => setIsEditing(true)} className="cursor-text">
    <h4 className="text-white font-semibold text-sm mb-1.5 leading-tight">{task.title}</h4>
    <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">
      {task.description}
    </p>
  </div>
)
```

**Что сделать:**
- ✅ Показывать описание ТОЛЬКО если оно не пусто и не содержит "Введите описание..."
- ✅ Использовать line-clamp-1 вместо line-clamp-2
- ✅ Если описание пусто, показать только название

**Новый код:**
```jsx
: (
  <div onClick={() => setIsEditing(true)} className="cursor-text">
    <h4 className="text-white font-semibold text-sm leading-tight">{task.title}</h4>
    {task.description && !task.description.includes('Введите') && (
      <p className="text-gray-400 text-xs line-clamp-1 leading-relaxed mt-1">
        {task.description}
      </p>
    )}
  </div>
)
```

---

### 1.4 Отключить анимации

**Файл:** `/src/app/globals.css`

**Что сделать:**

**Убрать:**
- ❌ @keyframes slideInUp (строка 139)
- ❌ .card-entrance (строка 179)
- ❌ .shimmer-effect (строка 183)
- ❌ .pulse-glow-effect (строка 201)
- ❌ .float-animation (строка 205)

**В KanbanBoard.tsx убрать:**
```jsx
// Убрать это:
style={{ animationDelay: `${index * 100}ms` }}
className="card-entrance"
```

**Результат:** Все карточки загружаются мгновенно, нет анимаций

---

### 1.5 Создать модальное окно для редактирования

**Новый файл:** `/src/features/kanban/ui/TaskModal.tsx`

**Примерная структура:**
```typescript
export const TaskModal = ({
  task,
  isOpen,
  onClose,
  onSave
}: TaskModalProps) => {
  const [formData, setFormData] = useState(task);

  return (
    <dialog open={isOpen} className="...">
      <div className="modal-content">
        <input value={formData.title} />
        <textarea value={formData.description} />
        <select value={formData.priority} />
        {/* Кнопки: Сохранить, Отмена */}
      </div>
    </dialog>
  );
};
```

**Где использовать:**
- Вместо inline редактирования
- При клике на карточку
- В KanbanCard.tsx добавить: `<TaskModal task={task} isOpen={isEditing} />`

---

## ФАЗА 2: СТРОИТЕЛЬНЫЕ ПОЛЯ

### 2.1 Расширить тип Task

**Файл:** `/src/shared/types/task.ts`

**Текущий код:**
```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
}
```

**Новый код:**
```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';

  // НОВЫЕ ПОЛЯ:
  startDate?: Date;           // Дата начала
  endDate?: Date;             // Дата окончания
  assignee?: string;          // ФИО или ID исполнителя
  progress?: number;          // 0-100 прогресс
  category?: string;          // Категория работ
  cost?: number;              // Стоимость в рублях
}
```

**Рекомендация:** Сделать эти поля опциональными, чтобы не сломать существующие данные

---

### 2.2 Обновить Store для новых полей

**Файл:** `/src/shared/store/kanbanStore.ts`

**Что сделать:**
```typescript
addTask: (status, taskData) => set((state) => {
  const newTask: Task = {
    id: generateId(),
    title: taskData?.title || 'Новая задача',
    description: taskData?.description || '',  // Пусто вместо 'Введите описание...'
    status,
    priority: taskData?.priority || 'medium',

    // НОВЫЕ ЗНАЧЕНИЯ ПО УМОЛЧАНИЮ:
    startDate: taskData?.startDate || new Date(),
    endDate: taskData?.endDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // +3 дня
    assignee: taskData?.assignee || 'Не назначено',
    progress: taskData?.progress || 0,
    category: taskData?.category || 'Общее',
    cost: taskData?.cost || 0,

    ...taskData
  };
  return { tasks: [...state.tasks, newTask] };
}),
```

---

### 2.3 Показывать новые поля на карточке

**Файл:** `/src/features/kanban/ui/KanbanCard.tsx`

**Добавить после заголовка:**
```jsx
<div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
  {task.startDate && (
    <span className="flex items-center gap-1">
      📅 {new Date(task.startDate).toLocaleDateString('ru-RU', { day: 'short', month: 'short' })}
    </span>
  )}
  {task.assignee && task.assignee !== 'Не назначено' && (
    <span className="flex items-center gap-1">
      👤 {task.assignee.split(' ')[0].slice(0, 1)}.{task.assignee.split(' ')[1]?.slice(0, 1)}.
    </span>
  )}
  {task.progress && (
    <span className="flex items-center gap-1">
      {task.progress}%
    </span>
  )}
</div>
```

**Результат:**
```
┌──────────────────────────────────┐
│ ● Монтаж двери                    │
│ 📅 12 Dec | И.И. | 50%           │
└──────────────────────────────────┘
```

---

### 2.4 Расширить TaskModal с новыми полями

**Файл:** `/src/features/kanban/ui/TaskModal.tsx`

**Добавить поля:**
```jsx
<div className="modal-form">
  {/* Существующие поля */}
  <input value={formData.title} placeholder="Название..." />
  <textarea value={formData.description} placeholder="Описание..." />

  {/* НОВЫЕ ПОЛЯ */}
  <input
    type="date"
    value={formData.startDate}
    placeholder="Дата начала"
  />
  <input
    type="date"
    value={formData.endDate}
    placeholder="Дата окончания"
  />
  <input
    value={formData.assignee}
    placeholder="Исполнитель (ФИО)"
  />
  <input
    type="number"
    value={formData.progress}
    min="0"
    max="100"
    placeholder="Прогресс (%)"
  />
  <select value={formData.category} placeholder="Категория">
    <option>Монтаж</option>
    <option>Сварка</option>
    <option>Покраска</option>
    <option>Демонтаж</option>
  </select>
  <input
    type="number"
    value={formData.cost}
    placeholder="Стоимость (₽)"
  />
</div>
```

---

## ФАЗА 3: ДОКУМЕНТАЦИЯ И ФАЙЛЫ

### 3.1 Расширить Task для файлов

**Файл:** `/src/shared/types/task.ts`

```typescript
interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
  type: 'pdf' | 'doc' | 'xls' | 'image' | 'other';
}

interface Task {
  // ... существующие поля
  attachments?: Attachment[];  // НОВОЕ
}
```

---

### 3.2 История изменений

**Файл:** `/src/shared/types/task.ts`

```typescript
interface TaskHistory {
  id: string;
  taskId: string;
  timestamp: Date;
  changedBy: string;
  field: string;
  oldValue: any;
  newValue: any;
  description: string; // "Статус изменён: Выполняется → Готово"
}

// В Store добавить:
interface KanbanData {
  tasks: Task[];
  history: TaskHistory[];  // НОВОЕ
}
```

---

### 3.3 Компонент загрузки файлов

**Новый файл:** `/src/features/kanban/ui/FileUpload.tsx`

```typescript
export const FileUpload = ({
  taskId,
  onFileUpload
}: FileUploadProps) => {
  const handleDrop = (e: React.DragEvent) => {
    const files = e.dataTransfer.files;
    // Обработать загрузку
  };

  return (
    <div onDrop={handleDrop} className="drop-zone">
      {/* UI для загрузки файлов */}
    </div>
  );
};
```

---

## ФАЗА 4: АЛЬТЕРНАТИВНЫЕ ПРЕДСТАВЛЕНИЯ

### 4.1 Создать компонент Gantt Chart

**Новый файл:** `/src/features/kanban/ui/GanttChart.tsx`

```typescript
export const GanttChart = ({ tasks }: GanttChartProps) => {
  // Используя dates, отобразить задачи на горизонтальной временной шкале
  // SVG или Canvas для рисования
};
```

---

### 4.2 Создать Table View

**Новый файл:** `/src/features/kanban/ui/TableView.tsx`

```typescript
export const TableView = ({ tasks }: TableViewProps) => {
  return (
    <table className="w-full">
      <thead>
        <tr>
          <th>Название</th>
          <th>Дата</th>
          <th>Исполнитель</th>
          <th>Прогресс</th>
          {/* ... другие колонки */}
        </tr>
      </thead>
      <tbody>
        {/* Рендер задач */}
      </tbody>
    </table>
  );
};
```

---

### 4.3 Создать переключатель представлений

**Новый файл:** `/src/features/kanban/ui/ViewToggle.tsx`

```typescript
export const ViewToggle = ({
  currentView,
  onViewChange
}: ViewToggleProps) => {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onViewChange('kanban')}
        className={currentView === 'kanban' ? 'active' : ''}
      >
        📌 Kanban
      </button>
      <button onClick={() => onViewChange('gantt')}>📊 Gantt</button>
      <button onClick={() => onViewChange('table')}>📋 Table</button>
      <button onClick={() => onViewChange('calendar')}>📅 Calendar</button>
    </div>
  );
};
```

**В KanbanBoard.tsx:**
```typescript
const [view, setView] = useState<'kanban' | 'gantt' | 'table' | 'calendar'>('kanban');

return (
  <>
    <ViewToggle currentView={view} onViewChange={setView} />
    {view === 'kanban' && <KanbanBoardView ... />}
    {view === 'gantt' && <GanttChart ... />}
    {view === 'table' && <TableView ... />}
    {view === 'calendar' && <CalendarView ... />}
  </>
);
```

---

## ФАЗА 5: ФИЛЬТРЫ И ПОИСК

### 5.1 Создать компонент фильтров

**Новый файл:** `/src/features/kanban/ui/Filters.tsx`

```typescript
export const Filters = ({
  filters,
  onFilterChange
}: FiltersProps) => {
  return (
    <div className="filters-panel">
      <input
        placeholder="🔍 Поиск..."
        onChange={(e) => onFilterChange({ search: e.target.value })}
      />
      <input
        type="checkbox"
        label="Мои задачи"
        onChange={(e) => onFilterChange({ myTasks: e.target.checked })}
      />
      <input
        type="checkbox"
        label="Просроченные"
        onChange={(e) => onFilterChange({ overdue: e.target.checked })}
      />
      {/* Остальные фильтры */}
    </div>
  );
};
```

### 5.2 Добавить логику фильтрации в Store

```typescript
// В Store добавить:
getFilteredTasks: (filters) => {
  let result = get().tasks;

  if (filters.search) {
    result = result.filter(t =>
      t.title.toLowerCase().includes(filters.search.toLowerCase())
    );
  }

  if (filters.myTasks && filters.currentUser) {
    result = result.filter(t => t.assignee === filters.currentUser);
  }

  if (filters.overdue) {
    result = result.filter(t =>
      new Date(t.endDate) < new Date()
    );
  }

  return result;
}
```

---

## ФАЗА 6: ЭКСПОРТ

### 6.1 Экспорт в PDF

**Новый файл:** `/src/shared/utils/exportPdf.ts`

```typescript
import { jsPDF } from 'jspdf';

export const exportToPdf = (tasks: Task[], projectName: string) => {
  const doc = new jsPDF();

  // Настроить PDF документ
  // Добавить таблицу с задачами
  // Сохранить файл

  doc.save(`${projectName}.pdf`);
};
```

**Установить:** `npm install jspdf`

---

### 6.2 Экспорт в Excel

**Новый файл:** `/src/shared/utils/exportExcel.ts`

```typescript
import { writeFile, utils } from 'xlsx';

export const exportToExcel = (tasks: Task[], projectName: string) => {
  const ws = utils.json_to_sheet(tasks.map(t => ({
    Название: t.title,
    Описание: t.description,
    Дата: t.startDate ? new Date(t.startDate).toLocaleDateString('ru-RU') : '',
    Исполнитель: t.assignee,
    Прогресс: `${t.progress}%`,
    Статус: t.status,
  })));

  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Задачи');

  writeFile(wb, `${projectName}.xlsx`);
};
```

**Установить:** `npm install xlsx`

---

## 📋 ЧЕК-ЛИСТ РЕАЛИЗАЦИИ

### ФАЗА 1: Очистка интерфейса
- [ ] Убрать ID задачи (# a2b3c)
- [ ] Убрать Priority badge
- [ ] Оптимизировать отображение описания
- [ ] Отключить все анимации (slideInUp, shimmer, pulse, float)
- [ ] Создать модальное окно для редактирования
- [ ] Протестировать на всех браузерах

### ФАЗА 2: Строительные поля
- [ ] Добавить поля в тип Task
- [ ] Обновить Store для новых полей
- [ ] Показать новые поля на карточке
- [ ] Расширить модальное окно новыми полями
- [ ] Проверить сохранение в localStorage
- [ ] Протестировать функциональность

### ФАЗА 3: Документация
- [ ] Добавить поддержку вложений (Attachment)
- [ ] Создать компонент загрузки файлов (drag & drop)
- [ ] Добавить историю изменений
- [ ] Создать форму Акта выполненных работ
- [ ] Протестировать загрузку файлов

### ФАЗА 4: Альтернативные представления
- [ ] Создать Gantt Chart компонент
- [ ] Создать Table View компонент
- [ ] Создать Calendar View компонент
- [ ] Создать переключатель представлений
- [ ] Протестировать все представления

### ФАЗА 5: Фильтры
- [ ] Создать компонент фильтров
- [ ] Добавить логику фильтрации
- [ ] Тестировать все фильтры
- [ ] Тестировать комбинирование фильтров

### ФАЗА 6: Экспорт
- [ ] Реализовать экспорт в PDF
- [ ] Реализовать экспорт в Excel
- [ ] Реализовать импорт из CSV/Excel
- [ ] Тестировать экспорт/импорт

---

## 🚀 СОВЕТЫ ПО РАЗРАБОТКЕ

### 1. Придерживайтесь Clean Architecture
- Разделяйте Data Layer, Logic Layer, UI Layer
- Используйте Zustand для state management (как уже делаете)
- Не смешивайте бизнес-логику с компонентами

### 2. TypeScript - ваш друг
- Определяйте типы для каждого нового поля
- Используйте интерфейсы вместо `any`
- Проверяйте типы перед сохранением

### 3. localStorage - локальное хранилище
- Используйте Zustand persist middleware (как уже есть)
- Убедитесь, что новые поля сохраняются
- Протестируйте после перезагрузки страницы

### 4. Тестирование
- После каждой фазы создавайте несколько задач
- Проверяйте все операции: создание, редактирование, удаление
- Перезагружайте страницу и проверяйте persistency
- Тестируйте на мобильных устройствах

### 5. Performance
- Используйте React DevTools для проверки ре-рендеров
- Оптимизируйте списки при большом количестве задач (виртуализация)
- Проверяйте скорость загрузки

### 6. UX
- Не добавляйте анимации без необходимости
- Делайте кнопки большими и понятными
- Используйте иконки (lucide-react) для наглядности
- Тестируйте с реальными данными

---

## 📚 ПОЛЕЗНЫЕ РЕСУРСЫ

### Документация
- dnd-kit: https://docs.dndkit.com/
- Zustand: https://github.com/pmndrs/zustand
- Next.js: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs

### Библиотеки для рассмотрения
- jsPDF - для создания PDF
- XLSX - для работы с Excel
- React Calendar - если нужен calendar picker
- React DnD (альтернатива dnd-kit)
- Recharts - для графиков (если понадобятся)

---

## 📞 ЧАСТЫЕ ВОПРОСЫ

### Q: Где хранить данные о пользователе (исполнителе)?
A: Можно хранить просто как строку (ФИО) или создать отдельный массив пользователей в Store.

### Q: Как обработать большое количество файлов?
A: Использовать базу данных (Firebase, Supabase) вместо localStorage. Пока можно обойтись Blob URLs.

### Q: Нужна ли синхронизация между устройствами?
A: На текущем этапе нет, но в будущем можно добавить backend (Firebase, Node.js).

### Q: Как сделать резервные копии?
A: Реализовать экспорт в JSON (помимо PDF/Excel).

---

**Документ подготовлен:** 18 Декабря 2025
**Версия:** 1.0
**Для:** Kanban Board v1.0
