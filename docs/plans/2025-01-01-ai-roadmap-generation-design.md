# Design: AI Roadmap Generation

**Date:** 2025-01-01
**Status:** Approved

## Overview

Добавить в RoadmapPanel возможность генерировать структурированную дорожную карту через диалог с AI. AI задаёт вопросы, пользователь отвечает (выбирает вариант или пишет свой), в итоге получается roadmap с нумерованными задачами.

---

## Architecture

### Components

1. **Frontend:** Новый хук `useRoadmapAI` в `src/features/roadmap/hooks/`
   - Управляет состоянием диалога (массив сообщений)
   - Отправляет запросы к DeepSeek API с историей
   - Парсит ответ AI, извлекает вопросы и варианты ответов

2. **API:** Новый endpoint `/api/ai/roadmap` в `src/app/api/ai/roadmap/route.ts`
   - Принимает: `{ messages: Array<{role, content}> }`
   - Возвращает: `{ content: string }` — текст ответа AI
   - Использует специальный system prompt для roadmap generation

3. **UI:** Компонент `RoadmapAIChat` — модальное окно с чатом
   - Список сообщений (AI + пользователь)
   - AI сообщения содержат текст + кнопки с вариантами ответов
   - Поле ввода для своего ответа
   - Кнопки "Применить" и "Отмена"

4. **Parser:** Функция `parseRoadmapTasks` в `src/features/roadmap/lib/`
   - Ищет маркер `<!-- AI_GENERATED -->`
   - Парсит строки вида "1. Текст задачи", "2. Текст задачи"
   - Возвращает массив строк (названия задач)

### Data Flow

```
Пользователь кликает "AI" в RoadmapPanel
→ Открывается RoadmapAIChat
→ Пользователь вводит идею
→ AI отвечает вопросом + варианты
→ Пользователь выбирает или пишет ответ
→ (повторяется 3-5 раз)
→ AI генерирует финальный roadmap с маркером и нумерованными задачами
→ Пользователь нажимает "Применить"
→ RoadmapPanel обновляется, появляется кнопка "Создать задачи"
→ Пользователь нажимает "Создать задачи"
→ Первые 5 задач создаются в колонке "Новые задачи"
```

---

## System Prompt

```
Ты - AI-ассистент для создания дорожных карт (roadmap) проектов. Твоя задача - помочь пользователю превратить идею в структурированный план с нумерованным списком задач.

Правила:
1. Задавай вопросы по одному за раз
2. После вопроса предлагай 3-4 варианта ответа в формате: ВАРИАНТЫ: [опция1, опция2, опция3]
3. Если пользователь не выбрал вариант, а написал свой ответ - продолжай диалог
4. После 3-5 итераций сформируй финальную roadmap

Формат финальной roadmap (когда у тебя достаточно информации):

<!-- AI_GENERATED -->

# Дорожная карта: [Название проекта]

## Обзор
[1-2 предложения о цели проекта]

## Задачи
1. [Название первой задачи]
2. [Название второй задачи]
3. [Название третьей задачи]
...и так далее

## Следующие шаги
[Рекомендация по приоритету первых 3-5 задач]

ВАЖНО: Формируй финальную roadmap только когда у тебя есть достаточно информации. До этого задавай уточняющие вопросы.
```

---

## File Structure

**New files:**
```
src/
├── features/
│   └── roadmap/
│       ├── hooks/
│       │   └── useRoadmapAI.ts           # Хук для AI чата
│       ├── lib/
│       │   ├── parser.ts                 # Парсинг задач из roadmap
│       │   └── task-creator.ts           # Создание задач в БД
│       └── ui/
│           └── RoadmapAIChat.tsx         # Компонент модалки чата
├── app/
│   └── api/
│       └── ai/
│           └── roadmap/
│               └── route.ts              # API endpoint
└── lib/
    └── deepseek.ts                       # Добавить generateRoadmapChat()
```

**Modified files:**
```
src/features/roadmap/ui/RoadmapPanel.tsx  # Добавить AI кнопку и интеграцию
```

---

## Implementation Plan

### Phase 1: Base Infrastructure
1. Create `/api/ai/roadmap` endpoint
2. Add `generateRoadmapChat()` to `deepseek.ts`
3. Create `useRoadmapAI` hook

### Phase 2: UI Components
1. Create `RoadmapAIChat` component
2. Add chat styles
3. Integrate into `RoadmapPanel`

### Phase 3: Parsing and Task Creation
1. Create `parser.ts` with parsing functions
2. Create `task-creator.ts`
3. Add "Create Tasks" button to RoadmapPanel

### Phase 4: Testing and Polish
1. Test full flow
2. Add edge case handling
3. Check API error handling

---

## Key Technical Decisions

1. **Stateless chat:** Вся история на клиенте, каждый запрос отправляет полный контекст
2. **Marker-based identification:** Маркер `<!-- AI_GENERATED -->` для отличия AI-roadmap
3. **Numbered list format:** "1. Текст", "2. Текст" — простой и парсимый формат
4. **DeepSeek reuse:** Используем существующий API ключ и инфраструктуру
5. **Task limit:** Создаём только первые 5 задач для избежания спама

---

## Edge Cases

1. **Empty AI response:** Показать ошибку и предложить попробовать снова
2. **No "New Tasks" column:** Создать в первой колонке доски
3. **Invalid task format:** Пропустить невалидные строки, логировать ошибку
4. **API rate limits:** Показать дружественное сообщение с задержкой
5. **User edits AI roadmap:** Маркер остаётся, кнопка создания задач доступна

---

## Future Enhancements

- Сохранять историю AI-диалогов в БД
- Редактирование AI-roadmap с регенерацией
- Экспорт roadmap в markdown/PDF
- Шаблоны roadmap для разных типов проектов
- Приоритеты и теги для задач
