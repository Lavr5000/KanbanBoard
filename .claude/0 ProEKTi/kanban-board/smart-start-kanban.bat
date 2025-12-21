@echo off
chcp 65001 >nul
title Kanban Board - Smart Launch

echo ============================================
echo     🧠 KANBAN BOARD SMART LAUNCH
echo ============================================
echo.

cd /d "c:\Users\user\.claude\0 ProEKTi\kanban-board"

echo 📂 Перешел в папку проекта: %CD%
echo.

:: Проверяем порты в порядке приоритета
set "PORT=3000"
:check_port
echo 🔍 Проверяю порт %PORT%...
netstat -an | findstr ":%PORT% " >nul
if %errorlevel% == 0 (
    echo ⚠️  Порт %PORT% занят
    set /a PORT+=1
    goto :check_port
)

echo ✅ Порт %PORT% свободен
echo.

:: Запускаем приложение
echo 🚀 Запускаю Kanban Board на порту %PORT%...
echo.
echo 🌐 Открою браузер автоматически через 5 секунд...
timeout /t 5 /nobreak >nul

:: Запускаем в фоне и открываем браузер
start /B npm run dev -- -p %PORT%
timeout /t 3 /nobreak >nul
start http://localhost:%PORT%

echo.
echo ✅ Kanban Board запущен на http://localhost:%PORT%
echo 💡 Используйте Ctrl+C в консоли для остановки сервера
echo.
echo Нажмите любую клавишу для выхода...
pause >nul