@echo off
REM Script to clean Next.js cache and kill all Node processes
REM Use this when dev server is stuck or not loading

echo Killing all Node.js processes...
taskkill /F /IM node.exe 2>nul

echo Waiting for processes to terminate...
timeout /t 2 /nobreak >nul

echo Cleaning Next.js cache...
if exist .next rmdir /s /q .next 2>nul

echo Cleaning up temp files...
if exist .turbo rmdir /s /q .turbo 2>nul

echo.
echo ============================================
echo Cleanup complete! You can now run:
echo   npm run dev
echo ============================================
echo.
