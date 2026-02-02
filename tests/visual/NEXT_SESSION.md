# Next Session: Visual Testing with Playwright MCP

## Quick Start (после /clear)

Запусти эту команду для продолжения:

```
Continue task: Внедрить визуальное тестирование через Playwright MCP
```

## Что делать:

1. **Проверить Playwright MCP**
   - MCP уже добавлен в `.claude.json`
   - Перезапусти Claude Code после /clear

2. **Сделать скриншот текущего состояния**
   - Используй Playwright MCP tools
   - Перейди на `http://localhost:3000`
   - Сохрани скриншот в `tests/visual/before.png`

3. **Установить Playwright (если нужно)**
   ```bash
   npm install -D @playwright/test
   npx playwright install
   ```

4. **Создать визуальный тест**
   - Создай `tests/visual/glassmorphism.spec.ts`
   - Используй screenshot matching

5. **Исправить стили**
   - Замени `bg-[#121218]` на glass-классы
   - Добавь атмосферный фон

## Ключевые файлы:
- `tests/visual/PLAN.md` - полный план
- `src/app/globals.css` - glass утилиты уже есть
- `src/app/page.tsx` - нужно обновить

## Статус MCP:
✅ Playwright добавлен для проекта KanbanBoard
