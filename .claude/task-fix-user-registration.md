# Задача: Исправление Race Condition при регистрации пользователя

## Контекст
Новые пользователи получали ошибку `Foreign key constraint violation on boards_user_id_fkey` при регистрации через мобильный телефон.

## Что нужно сделать

### 1. Автоматические действия (агент выполняет сам)

```bash
# Клонировать репозиторий
git clone https://github.com/Lavr5000/KanbanBoard.git
cd KanbanBoard

# Переключиться на ветку с исправлением
git checkout claude/fix-user-registration-fk-IjqD6

# Установить зависимости
npm install

# Проверить что билд работает
npm run build
```

### 2. Применить миграцию в Supabase (ТРЕБУЕТ ДЕЙСТВИЯ ПОЛЬЗОВАТЕЛЯ)

Пользователю нужно выполнить SQL в Supabase Dashboard:

**URL**: https://supabase.com/dashboard/project/sqhtukwjmlaxuvemkydn/sql

**SQL для выполнения** (файл `supabase/migrations/20250106_fix_boards_user_fk.sql`):

```sql
-- Drop old FK constraint
ALTER TABLE boards DROP CONSTRAINT IF EXISTS boards_user_id_fkey;

-- Add new FK referencing auth.users directly
ALTER TABLE boards
  ADD CONSTRAINT boards_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;
```

> **ВАЖНО**: Эта миграция уже была выполнена вручную. Проверьте, что FK уже ссылается на `auth.users(id)`.

### 3. Проверка (агент выполняет)

```bash
# Запустить локально для тестирования
npm run dev
```

Проверить:
- [ ] Регистрация нового пользователя работает
- [ ] Первая доска создаётся автоматически
- [ ] Нет ошибок FK constraint

### 4. Деплой (если используется Cloudflare Workers)

```bash
npm run deploy:cloudflare
```

## Файлы изменений

| Файл | Описание |
|------|----------|
| `supabase/migrations/20250106_fix_boards_user_fk.sql` | Миграция FK |
| `docs/setup-rls.sql` | Обновлена документация |

## Что сообщить пользователю

После выполнения задачи, сообщить:

1. **Если миграция НЕ была применена ранее**:
   > Вам нужно выполнить SQL миграцию в Supabase Dashboard. Откройте SQL Editor и выполните содержимое файла `supabase/migrations/20250106_fix_boards_user_fk.sql`

2. **Если всё готово**:
   > Исправление задокументировано в репозитории. Миграция была применена ранее. Деплой выполнен. Новые пользователи теперь могут регистрироваться без ошибок.

## Причина проблемы (для справки)

- `boards.user_id` ссылался на `public.users(id)`
- Триггер `handle_new_user()` создаёт запись в `public.users` ПОСЛЕ регистрации
- Приложение пытается создать доску ДО срабатывания триггера
- Решение: FK теперь ссылается на `auth.users(id)`, который существует сразу
