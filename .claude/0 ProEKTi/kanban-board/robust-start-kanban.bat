@echo off
chcp 65001 >nul
title 🚀 Kanban Board - Robust Launcher with Diagnostics
color 0A

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║            🔧 KANBAN BOARD - ROBUST LAUNCHER                ║
echo ║                  Full Diagnostics & Recovery                ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

cd /d "c:\Users\user\.claude\0 ProEKTi\kanban-board"
if %errorlevel% neq 0 (
    echo ❌ ERROR: Cannot find project directory!
    echo    Expected: c:\Users\user\.claude\0 ProEKTi\kanban-board
    pause
    exit /b 1
)

echo 📂 Project directory: %CD%
echo.

:: ══════════════════════════════════════════════════════════════
:: STEP 1: DIAGNOSTICS
:: ══════════════════════════════════════════════════════════════
echo 🔍 STEP 1: System Diagnostics
echo ────────────────────────────────────────────────────────────────
echo.

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Please install Node.js first.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do echo ✅ Node.js: %%i
)

:: Check npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm not found!
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version') do echo ✅ npm: %%i
)

:: Check package.json
if not exist "package.json" (
    echo ❌ package.json not found!
    pause
    exit /b 1
) else (
    echo ✅ package.json found
)

:: Check node_modules
if not exist "node_modules" (
    echo ⚠️  node_modules not found, will install...
    set NEED_INSTALL=1
) else (
    echo ✅ node_modules found
)

echo.

:: ══════════════════════════════════════════════════════════════
:: STEP 2: PORT CLEANUP
:: ══════════════════════════════════════════════════════════════
echo 🔧 STEP 2: Port Cleanup
echo ────────────────────────────────────────────────────────────────
echo.

:: Kill processes on ports 3000-3010
for /l %%p in (3000,1,3010) do (
    echo   Checking port %%p...
    for /f "tokens=5" %%i in ('netstat -ano ^| findstr ":%%p "') do (
        if not "%%i"=="" (
            echo     ❌ Found process %%i, killing...
            taskkill /F /PID %%i >nul 2>&1
            if !errorlevel! equ 0 (
                echo     ✅ Killed process %%i
            ) else (
                echo     ⚠️  Could not kill process %%i
            )
        )
    )
)
echo.

:: ══════════════════════════════════════════════════════════════
:: STEP 3: CACHE CLEANUP
:: ══════════════════════════════════════════════════════════════
echo 🧹 STEP 3: Cache Cleanup
echo ────────────────────────────────────────────────────────────────
echo.

if exist ".next" (
    echo   🗑️  Removing .next cache...
    rmdir /S /Q .next >nul 2>&1
    echo   ✅ .next cache removed
) else (
    echo   ✅ .next cache not found (clean)
)

if exist "node_modules\.cache" (
    echo   🗑️  Removing node_modules cache...
    rmdir /S /Q "node_modules\.cache" >nul 2>&1
    echo   ✅ node_modules cache removed
) else (
    echo   ✅ node_modules cache not found (clean)
)

echo.

:: ══════════════════════════════════════════════════════════════
:: STEP 4: DEPENDENCY CHECK
:: ══════════════════════════════════════════════════════════════
echo 📦 STEP 4: Dependencies Check
echo ────────────────────────────────────────────────────────────────
echo.

if defined NEED_INSTALL (
    echo   📥 Installing dependencies...
    npm install --force
    if %errorlevel% neq 0 (
        echo   ❌ npm install failed!
        pause
        exit /b 1
    )
    echo   ✅ Dependencies installed
) else (
    echo   ✅ Dependencies verified
)

echo.

:: ══════════════════════════════════════════════════════════════
:: STEP 5: FIND FREE PORT
:: ══════════════════════════════════════════════════════════════
echo 🔍 STEP 5: Finding Free Port
echo ────────────────────────────────────────────────────────────────
echo.

set "PORT=3000"
:check_port
netstat -ano | findstr ":%PORT% " >nul
if %errorlevel% equ 0 (
    echo   ⚠️  Port %PORT% is busy
    set /a PORT+=1
    if %PORT% gtr 3010 (
        echo   ❌ No free ports found between 3000-3010!
        pause
        exit /b 1
    )
    goto :check_port
) else (
    echo   ✅ Port %PORT% is free
)
echo.

:: ══════════════════════════════════════════════════════════════
:: STEP 6: LAUNCH APPLICATION
:: ══════════════════════════════════════════════════════════════
echo 🚀 STEP 6: Launching Kanban Board
echo ────────────────────────────────────────────────────────────────
echo.
echo   🌐 Starting on http://localhost:%PORT%
echo   ⏳ Please wait, this may take 30-60 seconds...
echo.

:: Start in background
start "Kanban Board" cmd /c "npm run dev -- -p %PORT%"

:: Wait for server to start
echo   ⏳ Waiting for server to start...
timeout /t 10 /nobreak >nul

:: Try to open browser
echo   🌐 Opening browser...
start http://localhost:%PORT%

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                     🎉 SUCCESS!                              ║
echo ║                                                                ║
echo ║  Kanban Board is running at:                                  ║
echo ║  http://localhost:%PORT%                                        ║
echo ║                                                                ║
echo ║  💡 Keep this window open to keep the server running           ║
echo ║  💡 Press Ctrl+C in the server window to stop                  ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo Press any key to exit this launcher...
pause >nul