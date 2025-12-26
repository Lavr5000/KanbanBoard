# TODO - Дорожная карта Kanban Board 2.0: Supabase + Testing

**Дата создания:** 2025-12-26
**Статус:** В ожидании подтверждения

---

## Краткое описание

Эволюция Kanban Board 2.0 из local-only приложения в production-ready solution с облачной базой данных, авторизацией и полноценным тестированием.

**Основные направления:**
1. Backend & Data Persistence (Supabase - PostgreSQL, Auth, Realtime)
2. Technical Quality & Testing (Unit + E2E)

---

## Checklist задач

### Фаза 1: Подготовка и настройка Supabase

#### Настройка инфраструктуры
- [ ] Создать проект в Supabase (https://supabase.com)
- [ ] Настроить environment variables (.env.local)
- [ ] Установить зависимости: `@supabase/supabase-js`, `@supabase/auth-helpers-nextjs`
- [ ] Создать файлы конфигурации Supabase client
  - [ ] `lib/supabase/client.ts` - Browser client
  - [ ] `lib/supabase/server.ts` - Server client
- [ ] Создать SQL миграции для структуры БД
  - [ ] Таблица `profiles`
  - [ ] Таблица `boards`
  - [ ] Таблица `columns`
  - [ ] Таблица `tasks`
- [ ] Настроить RLS (Row Level Security) policies
- [ ] Создать query функции
  - [ ] `lib/supabase/queries/boards.ts`
  - [ ] `lib/supabase/queries/columns.ts`
  - [ ] `lib/supabase/queries/tasks.ts`

#### Результат фазы
✅ Готовая инфраструктура для работы с базой данных

---

### Фаза 2: Интеграция Auth (авторизации)

#### Auth функции
- [ ] Создать страницу логина `app/(auth)/login/page.tsx`
- [ ] Создать страницу регистрации `app/(auth)/signup/page.tsx`
- [ ] Реализовать AuthProvider для client components
- [ ] Создать middleware для защищенных роутов
- [ ] Добавить auth helpers (`lib/auth.ts`)
- [ ] Мигрировать localStorage user session → Supabase auth
- [ ] Добавить кнопку "Выйти" в приложение
- [ ] Обновить header для авторизованных пользователей

#### Результат фазы
✅ Пользователи могут регистрироваться и логиниться

---

### Фаза 3: Миграция данных в Supabase

#### Рефакторинг Zustand store
- [ ] Разделить store на persistent data и UI state
- [ ] Оставить в Zustand только UI state:
  - [ ] `searchQuery`
  - [ ] `selectedTask`
  - [ ] `isModalOpen`
  - [ ] `dragPreview`
- [ ] Удалить из Zustand persistent data (tasks, columns, boards)

#### Интеграция Supabase queries
- [ ] Создать custom hook `hooks/useBoardData.ts`
- [ ] Заменить загрузку данных на Supabase queries
- [ ] Добавить realtime subscriptions
  - [ ] Подписка на изменения задач
  - [ ] Подписка на изменения колонок
- [ ] Реализовать optimistic updates для drag & drop
- [ ] Добавить error handling для failed mutations
- [ ] Обновить Server Components для загрузки initial data

#### Результат фазы
✅ Данные загружаются из Supabase, синхронизируются в realtime

---

### Фаза 4: Unit тесты

#### Настройка окружения
- [ ] Установить зависимости: `vitest`, `@testing-library/react`, `@vitejs/plugin-react`, `@testing-library/jest-dom`
- [ ] Создать `vitest.config.ts`
- [ ] Создать `src/__tests__/setup.ts`
- [ ] Настроить coverage reporting (threshold: 70%)

#### Тесты компонентов
- [ ] `TaskCard.test.tsx`
  - [ ] Рендер задачи с title и description
  - [ ] Отображение priority badge
  - [ ] Вызов onEdit при клике на редактирование
  - [ ] Вызов onDelete при клике на удаление
- [ ] `Column.test.tsx`
  - [ ] Рендер колонки с задачами
  - [ ] Drag & drop функциональность
- [ ] `Modal.test.tsx`
  - [ ] Открытие/закрытие модалки
  - [ ] Рендер children

#### Тесты store (UI state)
- [ ] `boardStore.test.ts`
  - [ ] Инициализация пустого state
  - [ ] Обновление search query
  - [ ] Открытие/закрытие модалки
  - [ ] Установка выбранной задачи

#### Тесты утилит
- [ ] `lib/utils.test.ts`
  - [ ] Функция слияния классов (cn)
  - [ ] Функции форматирования дат

#### Тесты query функций
- [ ] Моки для Supabase client
- [ ] Тесты для getTasks, getColumns, getBoards

#### Результат фазы
✅ 70%+ coverage, все тесты проходят

---

### Фаза 5: E2E тесты

#### Настройка Playwright
- [ ] Установить `@playwright/test`
- [ ] Создать `playwright.config.ts`
- [ ] Настроить test database (seed data)
- [ ] Создать fixtures для тестовых данных

#### E2E сценарии
- [ ] `e2e/auth.spec.ts`
  - [ ] Регистрация нового пользователя
  - [ ] Логин пользователя
  - [ ] Логаут
- [ ] `e2e/tasks.spec.ts`
  - [ ] Создание новой задачи
  - [ ] Перемещение задачи между колонками
  - [ ] Редактирование задачи
  - [ ] Удаление задачи с подтверждением
  - [ ] Поиск задач
- [ ] `e2e/realtime.spec.ts`
  - [ ] Задача сохраняется после перезагрузки страницы
  - [ ] Изменения видны в другом браузере (realtime)

#### Результат фазы
✅ Критические сценарии покрыты E2E тестами

---

### Фаза 6: Production Ready

#### Error Handling
- [ ] Создать `app/error.tsx` (error boundary)
- [ ] Создать `app/not-found.tsx` (404 page)
- [ ] Добавить timeout wrapper для Supabase queries
- [ ] Реализовать retry logic с exponential backoff

#### Graceful Degradation
- [ ] Реализовать offline mode с очередью изменений
- [ ] Добавить индикатор офлайн режима в UI
- [ ] Реализовать auto-reconnect для realtime

#### Загрузочные состояния
- [ ] Создать `TaskCardSkeleton`
- [ ] Создать `ColumnSkeleton`
- [ ] Создать `BoardSkeleton`
- [ ] Добавить Suspense с fallbacks

#### Валидация
- [ ] Установить `zod`
- [ ] Создать schema для task (`lib/validation.ts`)
- [ ] Добавить валидацию на client-side
- [ ] Добавить CHECK constraints в PostgreSQL

#### Результат фазы
✅ Приложение готово к продакшену

---

### Фаза 7: Monitoring и CI/CD

#### Monitoring (Sentry)
- [ ] Создать проект в Sentry
- [ ] Установить `@sentry/nextjs`
- [ ] Настроить `lib/sentry.ts`
- [ ] Добавить environment variables
- [ ] Настроить performance monitoring

#### CI/CD Pipeline
- [ ] Создать `.github/workflows/ci.yml`
- [ ] Добавить стадию lint
- [ ] Добавить стадию unit tests
- [ ] Добавить стадию E2E tests
- [ ] Добавить стадию build
- [ ] Настроить auto-deploy на Vercel

#### Deployment
- [ ] Подключить репозиторий к Vercel
- [ ] Настроить environment variables в Vercel
- [ ] Настроить preview деплои для PR
- [ ] Тестовый деплой на Vercel

#### Результат фазы
✅ Автоматический CI/CD, мониторинг настроен

---

### Фаза 8: Документация

#### Общая документация
- [ ] Обновить README.md
  - [ ] Описание проекта
  - [ ] Tech stack
  - [ ] Инструкция по установке
  - [ ] Инструкция по запуску
- [ ] Создать `docs/architecture.md` (общая архитектура)
- [ ] Создать `docs/database-schema.md` (структура БД)
- [ ] Создать `docs/testing.md` (как писать тесты)
- [ ] Создать `docs/deployment.md` (инструкция деплоя)

#### Результат фазы
✅ Полная документация проекта

---

## Примечания

### Приоритеты
1. **Критический:** Фазы 1-3 (Supabase интеграция + Auth)
2. **Высокий:** Фаза 4 (Unit тесты)
3. **Средний:** Фаза 5 (E2E тесты)
4. **Средний:** Фаза 6 (Production Ready)
5. **Низкий:** Фаза 7 (Monitoring & CI/CD)
6. **Низкий:** Фаза 8 (Документация)

### Принципы разработки
- **YAGNI:** Не добавлять лишние функции
- **Simplicity:** Каждое изменение должно быть максимально простым
- **No lazy fixes:** Найти root cause проблемы, не делать временные правки
- **Test-first:** Писать тесты перед реализацией (TDD)
- **Minimal impact:** Изменения должны затрагивать минимум кода

---

## Review

*После завершения всех задач заполнить этот раздел*

**Дата завершения:** [заполнить после завершения]

**Итоги:**
- [ ] Все задачи выполнены
- [ ] Все тесты проходят
- [ ] Приложение задеплоено в продакшен
- [ ] Документация полная

**Следующие шаги (future):**
- Team features (multi-user boards, assignment)
- Advanced analytics
- Mobile app (React Native)

---

## Связанные документы

- [Design doc](../docs/2025-12-26-roadmap-design.md) - Полный дизайн архитектуры
- [Текущий todo](./todo.md) - Оригинальный план локальной версии
- [Deployment plan](./git-deployment-plan.md) - План деплоя на GitHub
