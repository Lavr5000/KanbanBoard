#!/usr/bin/env node
/**
 * КОНВЕРТЕР БАЗЫ ЧЕКПОИНТОВ
 *
 * Преобразует checkpoints_database.json (старый формат)
 * в checkpoints_v3.json (формат для приложения)
 *
 * Автор: Claude Opus 4.5
 * Дата: 2025-12-20
 */

const fs = require('fs');
const path = require('path');

// ============ КОНФИГУРАЦИЯ ============

// Маппинг категорий (старое название → новое)
const CATEGORY_MAP = {
  'floor': { id: 'floor', name: 'Полы' },
  'walls': { id: 'walls', name: 'Стены' },
  'ceiling': { id: 'ceiling', name: 'Потолки' },
  'doors': { id: 'doors', name: 'Двери' },
  'windows': { id: 'windows', name: 'Окна' },
  'plumbing': { id: 'plumbing', name: 'Водоснабжение и водоотведение' },
  'electrical': { id: 'electrical', name: 'Электроснабжение' },
  'hvac': { id: 'hvac', name: 'Отопление и вентиляция' },
  'general': { id: 'general', name: 'Общие проверки' },
  'fire_safety': { id: 'fire_safety', name: 'Пожарная безопасность' },
  'gas': { id: 'gas', name: 'Газоснабжение' }
};

// ============ ФУНКЦИИ КОНВЕРТАЦИИ ============

/**
 * Преобразует один чекпоинт из старого формата в новый
 */
function convertCheckpoint(oldItem, categoryId) {
  return {
    id: oldItem.id,
    categoryId: categoryId,
    title: oldItem.check?.title || 'Без названия',
    description: oldItem.check?.description || '',
    tolerance: oldItem.check?.tolerance || '',
    method: oldItem.check?.method || '',
    standardReference: `${oldItem.source?.doc || ''} ${oldItem.source?.clause || ''}`.trim(),
    violationText: oldItem.templates?.violation || '',
    hintLayman: oldItem.templates?.hint || '',
    referenceImageUrl: '',
    status: null,
    userPhotos: [],
    userComment: '',
    // Дополнительные поля для совместимости
    selectedRoom: null
  };
}

/**
 * Определяет категорию чекпоинта
 */
function getCategory(item) {
  // Приоритет: filters.category → анализ ID → 'general'
  if (item.filters?.category && CATEGORY_MAP[item.filters.category]) {
    return item.filters.category;
  }

  // Попробуем определить по ID
  const id = (item.id || '').toLowerCase();
  if (id.includes('floor') || id.includes('screed') || id.includes('laminate')) return 'floor';
  if (id.includes('wall') || id.includes('plaster')) return 'walls';
  if (id.includes('ceiling')) return 'ceiling';
  if (id.includes('door')) return 'doors';
  if (id.includes('window') || id.includes('glass')) return 'windows';
  if (id.includes('plumb') || id.includes('water') || id.includes('pipe')) return 'plumbing';
  if (id.includes('electr') || id.includes('socket') || id.includes('wire')) return 'electrical';
  if (id.includes('hvac') || id.includes('heat') || id.includes('vent')) return 'hvac';
  if (id.includes('fire') || id.includes('smoke')) return 'fire_safety';
  if (id.includes('gas')) return 'gas';

  return 'general';
}

/**
 * Определяет тип отделки (draft/finish)
 */
function getFinishType(item) {
  if (item.filters?.finishType === 'finish') return 'finish';
  return 'draft'; // По умолчанию черновая
}

/**
 * Главная функция конвертации
 */
function convertDatabase(inputPath, outputPath) {
  console.log('🔄 Начинаю конвертацию...\n');

  // Читаем исходный файл
  console.log(`📖 Читаю: ${inputPath}`);
  let rawData = fs.readFileSync(inputPath, 'utf8');

  // Удаляем BOM (Byte Order Mark) если есть
  if (rawData.charCodeAt(0) === 0xFEFF) {
    rawData = rawData.slice(1);
  }
  // Также проверяем на UTF-8 BOM в виде байтов
  rawData = rawData.replace(/^\uFEFF/, '');

  const oldData = JSON.parse(rawData);

  // Собираем все чекпоинты из всех категорий
  const allItems = [];

  for (const [catName, catData] of Object.entries(oldData.categories || {})) {
    if (catData.items && Array.isArray(catData.items)) {
      console.log(`   └─ ${catName}: ${catData.items.length} items`);
      allItems.push(...catData.items);
    }
  }

  console.log(`\n📊 Всего найдено: ${allItems.length} чекпоинтов`);

  // Создаём новую структуру
  const newData = {
    version: '3.0',
    generatedAt: new Date().toISOString(),
    description: 'База проверок для приложения Аудитор Квартир (сконвертировано)',
    totalCheckpoints: allItems.length,
    categories: {}
  };

  // Инициализируем все категории
  for (const [key, info] of Object.entries(CATEGORY_MAP)) {
    newData.categories[key] = {
      id: info.id,
      name: info.name,
      draft: [],
      finish: []
    };
  }

  // Статистика
  const stats = {
    total: 0,
    byCategory: {},
    byFinishType: { draft: 0, finish: 0 },
    errors: []
  };

  // Распределяем чекпоинты
  for (const item of allItems) {
    try {
      const categoryId = getCategory(item);
      const finishType = getFinishType(item);
      const converted = convertCheckpoint(item, categoryId);

      // Убеждаемся что категория существует
      if (!newData.categories[categoryId]) {
        newData.categories[categoryId] = {
          id: categoryId,
          name: CATEGORY_MAP[categoryId]?.name || categoryId,
          draft: [],
          finish: []
        };
      }

      // Добавляем в соответствующий массив
      newData.categories[categoryId][finishType].push(converted);

      // Обновляем статистику
      stats.total++;
      stats.byCategory[categoryId] = (stats.byCategory[categoryId] || 0) + 1;
      stats.byFinishType[finishType]++;

    } catch (error) {
      stats.errors.push({ id: item.id, error: error.message });
    }
  }

  // Обновляем итоговое количество
  newData.totalCheckpoints = stats.total;

  // Сохраняем результат
  console.log(`\n💾 Сохраняю: ${outputPath}`);
  fs.writeFileSync(outputPath, JSON.stringify(newData, null, 2), 'utf8');

  // Выводим статистику
  console.log('\n' + '='.repeat(50));
  console.log('📊 СТАТИСТИКА КОНВЕРТАЦИИ');
  console.log('='.repeat(50));
  console.log(`✅ Успешно сконвертировано: ${stats.total}`);
  console.log(`📁 Черновая отделка (draft): ${stats.byFinishType.draft}`);
  console.log(`📁 Чистовая отделка (finish): ${stats.byFinishType.finish}`);
  console.log('\n📂 По категориям:');

  for (const [cat, count] of Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1])) {
    const catName = CATEGORY_MAP[cat]?.name || cat;
    console.log(`   ${catName}: ${count}`);
  }

  if (stats.errors.length > 0) {
    console.log(`\n⚠️ Ошибки (${stats.errors.length}):`);
    stats.errors.forEach(e => console.log(`   - ${e.id}: ${e.error}`));
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ КОНВЕРТАЦИЯ ЗАВЕРШЕНА!');
  console.log('='.repeat(50));

  // Проверяем размер файла
  const outputStats = fs.statSync(outputPath);
  console.log(`📦 Размер файла: ${(outputStats.size / 1024).toFixed(1)} KB`);

  return { success: true, stats };
}

// ============ ЗАПУСК ============

// Определяем пути
const args = process.argv.slice(2);

// Путь к входному файлу (можно передать как аргумент)
const inputPath = args[0] || path.join(__dirname, '../Desktop/Project_Vector/StroIKontrol_v5/checkpoints_database.json');

// Путь к выходному файлу
const outputPath = args[1] || path.join(__dirname, 'checkpoints_v3.json');

// Проверяем существование входного файла
if (!fs.existsSync(inputPath)) {
  console.error(`❌ Файл не найден: ${inputPath}`);
  console.log('\nИспользование:');
  console.log('  node convert-checkpoints.js [входной_файл] [выходной_файл]');
  console.log('\nПример:');
  console.log('  node convert-checkpoints.js ./checkpoints_database.json ./checkpoints_v3.json');
  process.exit(1);
}

// Запускаем конвертацию
try {
  convertDatabase(inputPath, outputPath);
} catch (error) {
  console.error(`❌ Ошибка: ${error.message}`);
  process.exit(1);
}
