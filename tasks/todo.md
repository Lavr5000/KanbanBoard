# Deployment Plan: RoadmapPanel to Cloudflare Workers Production

## Context
- Локально RoadmapPanel работает корректно
- Нужно перенести на продакшн: https://lavr-ai-kanban-doska.lavr5000xxx.workers.dev
- GitHub Actions workflow failing при установке зависимостей

## Todo Items

- [x] Investigate GitHub Actions failure (run #9)
- [x] Fix the workflow issue
- [x] Trigger new deployment
- [x] Verify RoadmapPanel on production
- [x] Final review

## Review Section

### ✅ Успешно развернуто!

**Проблемы, обнаруженные и исправленные:**

#### 1. Отсутствие Supabase переменных в wrangler.toml
**Файл:** [wrangler.toml](../wrangler.toml#L14-L18)
- **Проблема:** Environment variables для Supabase не были переданы в runtime Cloudflare Workers
- **Решение:** Добавлены `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` в секцию `[vars]`

#### 2. Баг в @opennextjs/cloudflare с отсутствующим файлом
**Ошибка:** `ENOENT: no such file or directory, copyfile '.open-next/.build/open-next.config.edge.mjs'`
- **Проблема:** @opennextjs/cloudflare версии 1.14.7 пытался скопировать несуществующий файл
- **Решение:** Разделен процесс сборки на два этапа:
  1. `npm run build` - сборка Next.js
  2. `npx @opennextjs/cloudflare@latest build --skipBuild` - генерация worker bundle

#### 3. Отсутствие standalone режима в Next.js
**Ошибка:** `ENOENT: open '.next/standalone/.next/server/pages-manifest.json'`
- **Проблема:** @opennextjs/cloudflare требует standalone output
- **Решение:** Добавлен `output: 'standalone'` в [next.config.js](../next.config.js#L3)

#### 4. Устаревший API токен Cloudflare
**Ошибка:** `Authentication error [code: 10000]`
- **Проблема:** CLOUDFLARE_API_TOKEN в GitHub Secrets был недействительным
- **Решение:** Пользователь обновил токен с нужными разрешениями

### 📁 Изменённые файлы:

| Файл | Изменения |
|------|-----------|
| [wrangler.toml](../wrangler.toml) | Добавлены Supabase переменные окружения |
| [next.config.js](../next.config.js) | Добавлен `output: 'standalone'` |
| [.github/workflows/deploy-cloudflare.yml](../.github/workflows/deploy-cloudflare.yml) | Разделена сборка на 2 этапа |
| [tasks/todo.md](todo.md) | Создан план и финальный обзор |

### 🎯 Результат:

- ✅ GitHub Actions workflow работает успешно
- ✅ Деплой на Cloudflare Workers завершён
- ✅ RoadmapPanel доступен на продакшене
- ✅ Все компоненты (RoadmapPanel, useRoadmap hook, Supabase migrations) задеплоены

**Продакшн URL:** https://lavr-ai-kanban-doska.lavr5000xxx.workers.dev

### 🔧 RoadmapPanel функционал:

- [x] Панель дорожной карты внизу экрана
- [x] Сворачивание/разворачивание панели
- [x] Автосохранение через 2 секунды
- [x] Интеграция с Supabase (таблица roadmaps)
- [x] Отображение статуса сохранения

### 📝 Коммиты:

1. `616cbdb` - fix: Add Supabase environment variables to wrangler.toml
2. `08a9996` - fix: Split build step to workaround @opennextjs/cloudflare bug
3. `445e225` - fix: Add standalone output to Next.js config
