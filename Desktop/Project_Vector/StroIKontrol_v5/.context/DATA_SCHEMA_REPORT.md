# Отчет о сравнении схем данных

=== ЗАДАЧА #60 ===
СХЕМА КОДА: Плоская (Checkpoint) с возможностью разделения по стадиям (draft/finish)
СХЕМА JSON: Плоская (V2) с полем stage для каждого чекпоинта
ВЕРДИКТ: Частично совместимы (требуется минимальная конвертация)
ОТЧЕТ: .context/DATA_SCHEMA_REPORT.md

## Current TS Interface

```typescript
export interface Checkpoint {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  tolerance: string;
  method: string;
  standardReference: string;
  violationText: string;
  hintLayman: string;
  stage: 'draft' | 'finish';
  referenceImageUrl: string;
  status: 'pending' | 'completed' | 'failed' | null;
  userPhotos: string[];
  userComment: string;
}

export interface CheckpointsDatabase {
  categories: Record<string, {
    id: string;
    name: string;
    checkpoints?: Checkpoint[];
    draft?: Checkpoint[];
    finish?: Checkpoint[];
    items?: Checkpoint[];
  }>;
}
```

## New JSON Structure

```json
{
  "version": "2.0",
  "generatedAt": "2025-12-13T04:51:55.716678",
  "description": "База проверок для приложения Аудитор Квартир",
  "totalCheckpoints": 351,
  "categories": {
    "floor": {
      "id": "floor",
      "name": "Пол",
      "checkpoints": [
        {
          "id": "sp29_floor_subbase_sand",
          "categoryId": "floor",
          "title": "Толщина песчаного подстилающего слоя",
          "description": "Проверка толщины песчаного основания под полом...",
          "tolerance": "минимальная толщина песчаного подстилающего слоя: 60 мм",
          "method": "[Tools: ruler, measuring_tape] Измерить толщину песчаного слоя...",
          "standardReference": "СП 29.13330.2011 п. 9.4",
          "violationText": "Нарушено требование п.9.4 СП 29.13330.2011...",
          "hintLayman": "Под полом должна быть подушка из песка не менее 6см толщиной...",
          "stage": "draft",
          "referenceImageUrl": "",
          "status": null,
          "userPhotos": [],
          "userComment": ""
        }
      ]
    }
  }
}
```

## Critical Mismatches

### 1. Группировка по стадиям
- **JSON**: Все чекпоинты в одном массиве `checkpoints` с полем `stage`
- **Код**: Ожидает разделение по массивам `draft` и `finish` ИЛИ использует фильтрацию по полю `stage`

### 2. Дополнительные метаданные
- **JSON**: Содержит метаданные `version`, `generatedAt`, `description`, `totalCheckpoints`
- **Код**: Не ожидает этих полей в структуре CheckpointsDatabase

### 3. Отсутствующие поля в коде
- **JSON**: Имеет метаданные, которые не используются в интерфейсе CheckpointsDatabase
- **Код**: Не определяет обработку этих метаданных

## Logic Check

### Функция загрузки данных
В файле `store/useProjectStore.ts` есть функция `getNormativeCheckpoints`, которая:
1. Загружает данные из `./assets/checkpoints_database.json`
2. Преобразует их в формат CheckpointsDatabase
3. Фильтрует чекпоинты по материалам проекта

### Проблемы совместимости
1. **Разделение по стадиям**: Код может не корректно обрабатывать структуру, где все чекпоинты в одном массиве
2. **Фильтрация**: Возможно потребуется модификация функции фильтрации для корректной работы с полем `stage`

### Рекомендации по миграции
1. **Минимальная конвертация**: Разделить массив `checkpoints` на `draft` и `finish` на основе поля `stage`
2. **Или модификация кода**: Адаптировать логику фильтрации для работы с полем `stage`

## Заключение

Структура данных в checkpoints_final.json **частично совместима** с кодом приложения. Основные поля чекпоинтов совпадают, но требуется адаптация логики обработки для корректного разделения по стадиям. Рекомендуется выполнить минимальную конвертацию данных при миграции.