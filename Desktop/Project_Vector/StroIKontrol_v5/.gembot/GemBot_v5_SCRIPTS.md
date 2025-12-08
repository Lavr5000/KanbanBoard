# СКРИПТЫ И ШАБЛОНЫ ДЛЯ ПРОЕКТА

## ПОЛНЫЙ СПИСОК (проверь что ВСЕ созданы!)

```
scripts/ — РОВНО 5 файлов:
├── check-all.ps1      # Все проверки
├── checkpoint.ps1     # Git commit
├── show-status.ps1    # Статус из .context/
├── tree-structure.ps1 # Структура проекта
└── init-context.ps1   # Создание .context/

.context/ — РОВНО 7 файлов:
├── 00_session_state.json
├── 01_product_vision.md
├── 02_active_roadmap.md
├── 03_tech_stack.md
├── 04_decision_log.md
├── 05_error_log.md
└── 06_system_patterns.md
```

---

## ЗАДАЧА #0: Инициализация проекта

Kilo Code должен создать эти файлы В ПЕРВУЮ ОЧЕРЕДЬ.

---

## СКРИПТЫ (scripts/)

### scripts/check-all.ps1
```powershell
# Полная проверка проекта
Write-Host "=== CHECK ALL ===" -ForegroundColor Cyan

Write-Host "`n[1/5] Expo Doctor (версии)..." -ForegroundColor Yellow
npx expo-doctor
if ($LASTEXITCODE -ne 0) { 
    Write-Host "VERSIONS MISMATCH - run: npx expo install --fix" -ForegroundColor Red
    exit 1 
}
Write-Host "VERSIONS OK" -ForegroundColor Green

Write-Host "`n[2/5] TypeScript..." -ForegroundColor Yellow
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) { Write-Host "TSC FAILED" -ForegroundColor Red; exit 1 }
Write-Host "TSC OK" -ForegroundColor Green

Write-Host "`n[3/5] ESLint..." -ForegroundColor Yellow
npx eslint app/ components/ store/ --ext .ts,.tsx --max-warnings 0
if ($LASTEXITCODE -ne 0) { Write-Host "ESLINT FAILED" -ForegroundColor Red; exit 1 }
Write-Host "ESLINT OK" -ForegroundColor Green

Write-Host "`n[4/5] Tests..." -ForegroundColor Yellow
npm test -- --passWithNoTests --watchAll=false
if ($LASTEXITCODE -ne 0) { Write-Host "TESTS FAILED" -ForegroundColor Red; exit 1 }
Write-Host "TESTS OK" -ForegroundColor Green

Write-Host "`n[5/5] Build check..." -ForegroundColor Yellow
npx expo export --platform android --output-dir dist-check 2>$null
if ($LASTEXITCODE -ne 0) { Write-Host "BUILD FAILED" -ForegroundColor Red; exit 1 }
Remove-Item -Recurse -Force dist-check
Write-Host "BUILD OK" -ForegroundColor Green

Write-Host "`n=== ALL CHECKS PASSED ===" -ForegroundColor Green
```

### scripts/checkpoint.ps1
```powershell
# Создать checkpoint перед изменениями
param([string]$message = "checkpoint")

Write-Host "Creating checkpoint: $message" -ForegroundColor Cyan

git add -A
git commit -m $message

if ($LASTEXITCODE -eq 0) {
    Write-Host "Checkpoint created!" -ForegroundColor Green
    git log --oneline -1
} else {
    Write-Host "No changes to commit" -ForegroundColor Yellow
}
```

### scripts/show-status.ps1
```powershell
# Показать текущий статус проекта
Write-Host "=== PROJECT STATUS ===" -ForegroundColor Cyan

if (Test-Path ".context/00_session_state.json") {
    Write-Host "`nSession State:" -ForegroundColor Yellow
    Get-Content ".context/00_session_state.json" | ConvertFrom-Json | Format-List
} else {
    Write-Host "No session state found" -ForegroundColor Red
}

if (Test-Path ".context/02_active_roadmap.md") {
    Write-Host "`nActive Tasks:" -ForegroundColor Yellow
    Select-String -Path ".context/02_active_roadmap.md" -Pattern "- \[.\]" | ForEach-Object { $_.Line }
}
```

### scripts/tree-structure.ps1
```powershell
# Показать структуру проекта (без node_modules)
Write-Host "=== PROJECT STRUCTURE ===" -ForegroundColor Cyan

function Show-Tree {
    param([string]$Path, [int]$Indent = 0)
    $items = Get-ChildItem -Path $Path -Force | Where-Object { 
        $_.Name -notin @('node_modules', '.git', 'dist', '.expo', 'dist-check') 
    }
    foreach ($item in $items) {
        $prefix = "  " * $Indent + "├── "
        Write-Host "$prefix$($item.Name)"
        if ($item.PSIsContainer -and $Indent -lt 3) {
            Show-Tree -Path $item.FullName -Indent ($Indent + 1)
        }
    }
}

Show-Tree -Path "."
```

### scripts/init-context.ps1
```powershell
# Инициализация папки .context/
Write-Host "Creating .context/ folder..." -ForegroundColor Cyan

New-Item -ItemType Directory -Force -Path ".context" | Out-Null

# Создаём файлы из шаблонов (см. ниже)
Write-Host ".context/ initialized" -ForegroundColor Green
```

---

## ШАБЛОНЫ ФАЙЛОВ ПАМЯТИ (.context/)

### .context/00_session_state.json
```json
{
  "project": "ApartmentAuditor",
  "current_phase": 1,
  "current_task": "1.1",
  "status": "in_progress",
  "last_completed": null,
  "blockers": [],
  "last_updated": "2025-11-28T10:00:00"
}
```

### .context/01_product_vision.md
```markdown
# Видение продукта

## Название
Apartment Auditor (Аудитор Квартир)

## Цель
Мобильное приложение для проверки квартир при приёмке от застройщика.
Позволяет любителям находить дефекты профессионального уровня.

## Ключевые функции
1. 8 категорий проверки (72 пункта по ГОСТ/СНиП)
2. Фотофиксация дефектов
3. Генерация PDF-акта со ссылками на нормативы

## Платформы
- Android (Expo Go)
- iOS (Expo Go)

## Заказчик
Денис
```

### .context/02_active_roadmap.md
```markdown
# Дорожная карта

## Этап 0: Инициализация ✅
- [x] Создать Expo проект
- [x] Настроить TypeScript
- [x] Создать .context/
- [x] Создать scripts/

## Этап 1: Навигация ⏳
- [ ] expo-router с табами ← ТЕКУЩАЯ
- [ ] Заглушки всех экранов
- [ ] Проверить переходы

## Этап 2: ObjectList + CreateObject 🔒
- [ ] UI списка
- [ ] Форма создания
- [ ] Zustand store
- [ ] AsyncStorage

## Этап 3: ObjectDetails 🔒
- [ ] Grid 8 плиток
- [ ] Прогресс категорий

## Этап 4: Checklist 🔒
- [ ] UI проверки
- [ ] Камера/галерея
- [ ] Авто-переход

## Этап 5: Participants 🔒
- [ ] Modal форма

## Этап 6: PDF Report 🔒
- [ ] HTML шаблон
- [ ] expo-print

## Этап 7: Полировка 🔒
- [ ] Тестирование
- [ ] Баги

---
Легенда: ✅ готово | ⏳ в работе | 🔒 не начато
```

### .context/03_tech_stack.md
```markdown
# Технологический стек

## Core
| Пакет | Версия | Статус |
|-------|--------|--------|
| expo | ~52.0.0 | ✅ |
| react-native | 0.76.x | ✅ |
| typescript | ~5.3.0 | ✅ |
| expo-router | ~4.0.0 | ✅ |

## UI
| Пакет | Версия | Статус |
|-------|--------|--------|
| react-native-paper | ^5.x | 🔒 |
| lucide-react-native | ^0.x | 🔒 |

## Data
| Пакет | Версия | Статус |
|-------|--------|--------|
| zustand | ^4.x | 🔒 |
| @react-native-async-storage/async-storage | ^1.x | 🔒 |

## Media
| Пакет | Версия | Статус |
|-------|--------|--------|
| expo-camera | ~16.x | 🔒 |
| expo-image-picker | ~16.x | 🔒 |
| expo-print | ~14.x | 🔒 |

---
Легенда: ✅ установлен | 🔒 будет установлен
```

### .context/04_decision_log.md
```markdown
# Журнал решений

## 2025-11-28 | Выбор роутера
**Вопрос:** expo-router или react-navigation?
**Решение:** expo-router 4.x
**Причина:** Файловая маршрутизация, стандарт для Expo SDK 52

## 2025-11-28 | Стейт менеджмент
**Вопрос:** Redux, Zustand, Jotai?
**Решение:** Zustand
**Причина:** Минимальный бойлерплейт, хорошая интеграция с React

## 2025-11-28 | PDF генерация
**Вопрос:** react-native-pdf, expo-print?
**Решение:** expo-print
**Причина:** Нативная интеграция с Expo, генерация из HTML
```

### .context/05_error_log.md
```markdown
# Журнал ошибок

## Шаблон записи
```
### [ДАТА] | Задача #X.Y | [СТАТУС: РЕШЕНО/ОТКРЫТО]

**Ошибка:**
Текст ошибки

**Причина:**
Почему произошло

**Решение:**
Как исправили

**Файлы:**
- файл1.tsx
- файл2.ts
```

---

## История

(записи появятся по мере работы)
```

### .context/06_system_patterns.md
```markdown
# Паттерны проекта

Этот файл — "учебник" для агента.
Записывай сюда ЧТО РАБОТАЕТ и КАК ДЕЛАТЬ ПРАВИЛЬНО.

## Навигация
- expo-router использует файловую структуру
- Динамические роуты: [id].tsx
- Табы: (tabs)/_layout.tsx

## Стили
- Цвета ТОЛЬКО из constants/colors.ts
- Никаких inline hex-кодов!

## Zustand Store
- Один store: useProjectStore.ts
- Persist через AsyncStorage

## Камера/Фото
- expo-image-picker для галереи
- expo-camera для съёмки
- Сохранять как file:// пути, НЕ base64

## PDF
- expo-print с HTML шаблоном
- НЕ использовать react-native-pdf

## Частые ошибки
- btoa не работает в React Native → использовать Buffer
- localhost не работает на телефоне → expo start --tunnel

---
(добавлять по мере обнаружения паттернов)
```

---

## ИСПОЛЬЗОВАНИЕ

### ПРЕДУПРЕЖДЕНИЕ: ИСПОЛЬЗОВАНИЕ SCENARIOS

**⚠️ NEVER run .ps1 directly. ALWAYS use 'powershell -File'**

### При старте проекта:
```powershell
# Kilo Code выполняет:
powershell -ExecutionPolicy Bypass -File .\scripts\init-context.ps1
```

### После каждой задачи:
```powershell
# Kilo Code выполняет:
powershell -ExecutionPolicy Bypass -File .\scripts\check-all.ps1

# Затем обновляет:
# - .context/00_session_state.json (новый статус)
# - .context/02_active_roadmap.md (отметить ✅)
```

### При ошибке:
```powershell
# Kilo Code добавляет запись в:
# - .context/05_error_log.md
```

### Для анализа проекта:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\show-status.ps1    # Где мы сейчас?
powershell -ExecutionPolicy Bypass -File .\scripts\tree-structure.ps1 # Какие файлы есть?
```