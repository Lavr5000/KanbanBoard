# Kanban Board PowerShell Launcher
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "     🚀 KANBAN BOARD POWERSHELL LAUNCHER" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Переходим в папку проекта
Set-Location "c:\Users\user\.claude\0 ProEKTi\kanban-board"
Write-Host "📂 Перешел в папку проекта: $(Get-Location)" -ForegroundColor Green
Write-Host ""

# Функция проверки порта
function Test-Port($Port) {
    try {
        $listener = [System.Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners()
        return $listener -contains [System.Net.IPEndPoint]::new([System.Net.IPAddress]::Any, $Port)
    }
    catch {
        return $false
    }
}

# Ищем свободный порт
$port = 3000
do {
    Write-Host "🔍 Проверяю порт $port..." -ForegroundColor Yellow
    if (Test-Port $port) {
        Write-Host "⚠️  Порт $port занят" -ForegroundColor Red
        $port++
    } else {
        Write-Host "✅ Порт $port свободен" -ForegroundColor Green
        break
    }
} while ($port -le 3010)

Write-Host ""
Write-Host "🚀 Запускаю Kanban Board на порту $port..." -ForegroundColor Cyan
Write-Host "🌐 Открою браузер автоматически через 3 секунды..." -ForegroundColor Yellow

# Запускаем npm в фоне
$job = Start-Job -ScriptBlock {
    param($ProjectPath, $Port)
    Set-Location $ProjectPath
    npm run dev -- -p $Port
} -ArgumentList "c:\Users\user\.claude\0 ProEKTi\kanban-board", $port

# Ждем немного и открываем браузер
Start-Sleep -Seconds 5
Start-Process "http://localhost:$port"

Write-Host ""
Write-Host "✅ Kanban Board запущен на http://localhost:$port" -ForegroundColor Green
Write-Host "💡 Закройте это окно или нажмите Ctrl+C для остановки сервера" -ForegroundColor Yellow
Write-Host ""

# Держим скрипт активным
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
}
finally {
    Write-Host "🛑 Останавливаю сервер..." -ForegroundColor Red
    Stop-Job $job -ErrorAction SilentlyContinue
    Remove-Job $job -ErrorAction SilentlyContinue
}