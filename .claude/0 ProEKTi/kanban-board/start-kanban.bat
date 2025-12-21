@echo off
chcp 65001 >nul
title Kanban Board - Quick Launch

echo ============================================
echo       🚀 KANBAN BOARD QUICK LAUNCH
echo ============================================
echo.

cd /d "c:\Users\user\.claude\0 ProEKTi\kanban-board"

echo 📂 Перешел в папку проекта: %CD%
echo.

echo 🔍 Проверяю, запущен ли уже сервер...
netstat -ano | findstr ":3000 " >nul
if %errorlevel% == 0 (
    echo ✅ Сервер уже запущен на http://localhost:3000
    echo 🌐 Открываю браузер...
    start http://localhost:3000
    goto :end
)

echo ❌ Сервер не найден, запускаю...
echo.

:: Quick cleanup if needed
if exist ".next" (
    echo 🧹 Очищаю кэш .next...
    rmdir /S /Q .next >nul 2>&1
)

echo 📦 Запускаю npm run dev...
echo.

call npm run dev

:end
echo.
echo ✅ Готово!
echo.
pause