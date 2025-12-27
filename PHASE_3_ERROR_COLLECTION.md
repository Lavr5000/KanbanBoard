# Отчет о сборе ошибок - Фаза 3

**Дата:** 2025-12-27
**Ветка:** claude/setup-supabase-TUKCP
**Задача:** Сбор ошибок без исправления кода

---

## Критические ошибки

### 1. Разные типы ID используются в разных частях кода
**Файлы:**
- [src/widgets/board/ui/Board.tsx](src/widgets/board/ui/Board.tsx)
- [src/lib/adapters/taskAdapter.ts](src/lib/adapters/taskAdapter.ts)
- [src/hooks/useBoardData.ts](src/hooks/useBoardData.ts)

**Проблема:**
- `task.id` из Supabase - `string` (UUID)
- `columnId` в UI типах - `Id` (который `string | number`)
- В `Board.tsx:105` преобразование `String(activeId)` - избыточное, если `activeId` уже строка
- В `taskAdapter.ts:13` - `id: task.id` напрямую присваивается (типы могут не совпадать)

**Ошибка типа:** Несоответствие типов может привести к ошибкам сравнения и поиска

---

### 2. Несоответствие статистики в useBoardStats
**Файл:** [src/entities/task/model/store.ts](src/entities/task/model/store.ts#L104)

**Проблема:**
```typescript
done: tasks.filter((t) => t.columnId === "revision").length, // Revision = done
```

**Ошибка:** Комментарий говорит "Revision = done", но это неверно. "В доработку" не равно "Готово". Это логическая ошибка в подсчете статистики.

---

### 3. Потенциальная ошибка с опциональными полями в TaskCard
**Файл:** [src/entities/task/ui/TaskCard.tsx](src/entities/task/ui/TaskCard.tsx#L103)

**Проблема:**
```typescript
{task.tags.map((tag) => (
```

**Ошибка:** `task.tags` может быть `undefined` (согласно `taskAdapter.ts:19` - `tags: []`), но в `TaskCard` нет проверки на `undefined` перед `map`. Это вызовет ошибку "Cannot read property 'map' of undefined".

---

### 4. Оптимистичные обновления не синхронизированы с UI
**Файл:** [src/hooks/useBoardData.ts](src/hooks/useBoardData.ts#L280-291)

**Проблема:** Хук возвращает `optimisticTasks` и `optimisticColumns`, но в `Board.tsx` используется `tasks` и `columns` (неоптимистичные версии).

```typescript
// В useBoardData.ts возвращается:
return {
  ...
  tasks,           // <-- Используется в Board
  optimisticTasks, // <-- Не используется
}
```

**Ошибка:** Оптимистичные обновления не работают в UI.

---

### 5. Дублирование stores - useBoardStore с данными и useBoardData с Supabase
**Файлы:**
- [src/entities/task/model/store.ts](src/entities/task/model/store.ts)
- [src/hooks/useBoardData.ts](src/hooks/useBoardData.ts)

**Проблема:**
- `useBoardStore` хранит `tasks` в localStorage (zustand persist)
- `useBoardData` загружает данные из Supabase
- Компоненты используют оба хука одновременно:
  - `Sidebar.tsx:23` использует `useBoardData` для статистики
  - `Sidebar.tsx:25` использует `useBoardStore` для `members`
  - `page.tsx:12` использует `useBoardStore` для `searchQuery`
  - `page.tsx:13` использует `useBoardStore` для `stats`

**Ошибка:** Данные могут быть рассинхронизированы. Статистика показывает данные из Supabase, но `useBoardStats` использует данные из localStorage.

---

### 6. Статистика в header показывает неправильные данные
**Файл:** [src/app/page.tsx](src/app/page.tsx#L13)

**Проблема:**
```typescript
const stats = useBoardStats();
```

`useBoardStats` использует `useBoardStore` (localStorage), но данные теперь в Supabase. Статистика показывает старые данные из localStorage, а не актуальные из Supabase.

---

### 7. Несоответствие полей при редактировании задачи
**Файл:** [src/features/task-operations/ui/EditTaskModal.tsx](src/features/task-operations/ui/EditTaskModal.tsx#L37-41)

**Проблема:**
```typescript
updateTask(String(task.id), {
  title: content,
  priority: priority,
  // Note: type, assigneeId, status, tags not yet in Supabase schema
});
```

**Ошибка:** В `EditTaskModal` пользователь может изменить `type` и `assigneeId`, но эти изменения НЕ сохраняются в Supabase и НЕ обновляют UI. Пользователь думает, что сохранил, но данные не изменились.

---

### 8. Статистика "done" всегда показывает задачи из "revision"
**Файл:** [src/entities/task/model/store.ts](src/entities/task/model/store.ts#L104)

**Проблема:**
```typescript
done: tasks.filter((t) => t.columnId === "revision").length,
```

В UI нет колонки "Готово" или "Done", поэтому счетчик `done` показывает задачи из "В доработку". Это путает пользователя.

---

## Предупреждения (Warnings)

### 1. Ошибка компиляции в AuthProvider
**Файл:** [src/providers/AuthProvider.tsx](src/providers/AuthProvider.tsx#L35)

```typescript
}, [supabase.auth])
```

**Предупреждение:** `supabase.auth` не должен быть в dependency array (это объект, который создается каждый раз). Рекомендуется убрать `auth` из зависимостей.

---

### 2. Console.log в production коде
**Файлы:**
- [src/widgets/board/ui/Board.tsx](src/widgets/board/ui/Board.tsx) (строки 48, 58, 93, 104, 119, 126, 160)
- [src/entities/task/model/store.ts](src/entities/task/model/store.ts) (строки 73, 76)

Отладочные логи с эмодзи должны быть удалены в production.

---

### 3. Неиспользуемая переменная в Sidebar
**Файл:** [src/widgets/sidebar/ui/Sidebar.tsx](src/widgets/sidebar/ui/Sidebar.tsx#L32)

```typescript
const columnNames = columns.map(c => c.title.toLowerCase());
```

Переменная `columnNames` создана, но не используется.

---

### 4. Hardcoded значения в Sidebar
**Файл:** [src/widgets/sidebar/ui/Sidebar.tsx](src/widgets/sidebar/ui/Sidebar.tsx#L195)

```typescript
<span className="text-sm text-white font-medium truncate">
  Dashboard дизайн
</span>
```

Название проекта захардкожено, не загружается из Supabase.

---

### 5. Hardcoded счетчик уведомлений
**Файл:** [src/app/page.tsx](src/app/page.tsx#L101)

```typescript
<span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full text-[10px] text-white flex items-center justify-center border-2 border-[#121218]">
  3
</span>
```

Число "3" захардкожено, не показывает реальное количество уведомлений.

---

## Известные ограничения (по документации)

Согласно `phase-3-testing-instructions.md`:

1. Кнопка "Очистить доску" закомментирована
2. Поля `task.type`, `task.assigneeId`, `task.tags` не сохраняются в Supabase
3. Члены команды (members) пока из старого стора, не из Supabase

---

## Итого

**Критических ошибок:** 8
**Предупреждений:** 5
**Известных ограничений:** 3

---

**Собрал:** Claude (local agent)
**Статус:** Отчет создан, исправления НЕ применялись
