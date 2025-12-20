# ИНСТРУКЦИЯ: Восстановление Apartment Auditor

## Что было сделано

1. **Диагностика проблемы**: Все чекпоинты были в `uncategorized`, а категории пустые
2. **Конвертер создан**: `convert-checkpoints.js`
3. **База сконвертирована**: `checkpoints_v3.json` (320 чекпоинтов, 385KB)

---

## Структура файлов

```
/home/user/0-KanBanDoska/
├── tools/
│   ├── convert-checkpoints.js    ← Скрипт конвертации
│   ├── checkpoints_v3.json       ← Готовая база (РЕЗУЛЬТАТ)
│   └── INSTRUCTION_RU.md         ← Эта инструкция
│
└── .claude/ApartmentAuditor_Workspace/Test4/apartment-app/
    └── constants/
        └── checkpoints_v2.1.json  ← Старая база (замени на v3)
```

---

## ШАГ 1: Копирование базы в проект

### Вариант A: Через терминал (быстро)

```bash
cp /home/user/0-KanBanDoska/tools/checkpoints_v3.json \
   /home/user/0-KanBanDoska/.claude/ApartmentAuditor_Workspace/Test4/apartment-app/constants/checkpoints_v3.json
```

### Вариант B: Через Claude Code агента

Скажи агенту:
```
Скопируй файл /home/user/0-KanBanDoska/tools/checkpoints_v3.json
в папку constants проекта apartment-app
```

---

## ШАГ 2: Обновление импорта в коде

В файле `checkpointStore.ts` нужно изменить импорт:

**Было:**
```typescript
import checkpointsDB from '../../constants/checkpoints_v2.1.json';
```

**Стало:**
```typescript
import checkpointsDB from '../../constants/checkpoints_v3.json';
```

### Команда для агента:
```
В файле services/store/checkpointStore.ts замени импорт
checkpoints_v2.1.json на checkpoints_v3.json
```

---

## ШАГ 3: Проверка совместимости типов

Проверь что типы совпадают. Новая структура чекпоинта:

```typescript
interface DBCheckpoint {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  tolerance: string;
  method: string;
  standardReference: string;
  violationText: string;
  hintLayman: string;
  referenceImageUrl: string;
  status: null | 'complies' | 'defect' | 'not_inspected';
  userPhotos: string[];
  userComment: string;
  selectedRoom: string | null;
}
```

### Команда для агента:
```
Проверь что интерфейс DBCheckpoint в types/database.types.ts
соответствует структуре checkpoints_v3.json
```

---

## ШАГ 4: Запуск и тестирование

```bash
cd /home/user/0-KanBanDoska/.claude/ApartmentAuditor_Workspace/Test4/apartment-app

# Очистка кэша
rm -rf node_modules/.cache
npx expo start --clear
```

### Команда для агента:
```
Запусти проект apartment-app с очисткой кэша и проверь
что чекпоинты отображаются в категориях
```

---

## Возможные проблемы и решения

### Проблема: Категории не отображаются

**Причина**: Код ожидает другие имена категорий

**Решение**: Проверь маппинг категорий в `CategoryCard.tsx` или `[categoryId]/index.tsx`

```
Покажи какие categoryId используются в коде для отображения категорий
```

### Проблема: Ошибка типов TypeScript

**Причина**: Интерфейс не соответствует данным

**Решение**: Обнови `types/database.types.ts` под новую структуру

### Проблема: Error 500 при загрузке

**Причина**: JSON слишком большой для одновременной загрузки

**Решение**: Реализуй lazy loading по категориям (это уже более сложная задача)

---

## Статистика сконвертированной базы

| Категория | Количество |
|-----------|------------|
| Полы | 85 |
| Общие проверки | 61 |
| Отопление и вентиляция | 61 |
| Стены | 49 |
| Водоснабжение | 21 |
| Окна | 19 |
| Пожарная безопасность | 12 |
| Потолки | 9 |
| Электроснабжение | 2 |
| Двери | 1 |
| **ИТОГО** | **320** |

**Черновая отделка (draft):** 89
**Чистовая отделка (finish):** 231

---

## Полная последовательность команд для агента

Копируй это целиком и отправь локальному Claude Code агенту:

```
Выполни следующие шаги для интеграции новой базы чекпоинтов:

1. Скопируй файл /home/user/0-KanBanDoska/tools/checkpoints_v3.json
   в constants папку проекта apartment-app

2. В файле services/store/checkpointStore.ts обнови импорт:
   - Было: import checkpointsDB from '../../constants/checkpoints_v2.1.json'
   - Стало: import checkpointsDB from '../../constants/checkpoints_v3.json'

3. Проверь что типы в types/database.types.ts соответствуют структуре:
   - id, categoryId, title, description, tolerance, method
   - standardReference, violationText, hintLayman
   - referenceImageUrl, status, userPhotos, userComment, selectedRoom

4. Запусти проект: npx expo start --clear

5. Проверь что категории отображаются с чекпоинтами

Если есть ошибки типов - исправь их.
Если есть ошибки рантайма - выведи лог и исправь.
```

---

## Дополнительно: Конвертация другой базы

Если у тебя есть другой файл `checkpoints_database.json`, можешь сконвертировать его:

```bash
node /home/user/0-KanBanDoska/tools/convert-checkpoints.js \
  /путь/к/твоему/checkpoints_database.json \
  /путь/куда/сохранить/checkpoints_v3.json
```

---

## Контакты для вопросов

Если что-то не работает — покажи ошибку Claude Code агенту и попроси исправить.

Удачи!
