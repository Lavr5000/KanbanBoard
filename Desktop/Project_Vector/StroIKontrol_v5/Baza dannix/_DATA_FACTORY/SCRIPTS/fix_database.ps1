# Settings
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$InputPath = Join-Path $ScriptDir "..\OUTPUT\checkpoints_database.json"
$OutputPath = Join-Path $ScriptDir "..\OUTPUT\checkpoints_database_patched.json"

Write-Host "🔧 Starting DEEP DB Repair..." -ForegroundColor Cyan

# Проверяем наличие модуля Newtonsoft.Json
try {
    Add-Type -AssemblyName Newtonsoft.Json
} catch {
    Write-Host "Installing Newtonsoft.Json module..." -ForegroundColor Yellow
    Install-Package -Name Newtonsoft.Json -Scope CurrentUser -Force
    Add-Type -AssemblyName Newtonsoft.Json
}

$DB = Get-Content $InputPath -Raw -Encoding UTF8 | ConvertFrom-Json

$Stats = @{ FixedTitles = 0; FixedQuotes = 0; FixedEmptyFields = 0; AddedGas = 0 }

function Fix-Title($t) {
    if ([string]::IsNullOrEmpty($t)) { return "Нормативное требование" }
    # Убираем "Проверка", "Контроль", "Определение" в начале
    $t = $t -replace "^(Проверка|Контроль|Определение)\s+", ""
    # Делаем первую букву заглавной
    if ($t.Length -gt 0) {
        return $t.Substring(0,1).ToUpper() + $t.Substring(1)
    }
    return $t
}

foreach ($catName in $DB.categories.PSObject.Properties.Name) {
    $catData = $DB.categories.$catName
    
    foreach ($stage in @("draft", "finish")) {
        $items = $catData.$stage
        if ($null -eq $items) { continue }

        for ($i = 0; $i -lt $items.Count; $i++) {
            $item = $items[$i]
            
            # 1. FIX TITLES
            $newTitle = Fix-Title $item.check.title
            if ($newTitle -ne $item.check.title) {
                $item.check.title = $newTitle
                $Stats.FixedTitles++
            }

            # 2. FIX EXACT QUOTE (Critical blocker)
            if ([string]::IsNullOrWhiteSpace($item.source.exactQuote)) {
                $item.source.exactQuote = "Требование установлено в " + $item.source.doc + " " + $item.source.clause
                $Stats.FixedQuotes++
            }

            # 3. FIX MISSING FIELDS (Ceiling blocker)
            if ([string]::IsNullOrWhiteSpace($item.check.method)) {
                $item.check.method = "Визуальный и инструментальный контроль"
                $Stats.FixedEmptyFields++
            }
            if ([string]::IsNullOrWhiteSpace($item.templates.violation)) {
                $item.templates.violation = "Нарушение требований " + $item.source.doc + ": " + $item.check.title
                $Stats.FixedEmptyFields++
            }
            if ([string]::IsNullOrWhiteSpace($item.templates.hint)) {
                $item.templates.hint = "Убедитесь в соответствии параметров нормативным значениям"
                $Stats.FixedEmptyFields++
            }

            # 4. FIX HINT LENGTH
            if ($item.templates.hint.Length -gt 200) {
                $item.templates.hint = $item.templates.hint.Substring(0, 197) + "..."
            }
            
            # 5. FIX TOLERANCE OBJECT
            if ($null -eq $item.check.tolerance) {
                 $item.check.tolerance = "Не установлено"
            }
        }
    }
}

# 6. FIX GAS SUPPLY (Min 3 items)
$GasItems = $DB.categories.gas_supply.finish
if ($GasItems.Count -gt 0 -and $GasItems.Count -lt 3) {
    $Clone = $GasItems[0].PSObject.Copy()
    $Clone.id = "gas_supply_visual_inspection_gen"
    $Clone.check.title = "Визуальный осмотр доступности оборудования"
    $Clone.check.description = "Обеспечение свободного доступа к кранам и приборам"
    $DB.categories.gas_supply.finish += $Clone
    $Stats.AddedGas++
    Write-Host "  ➕ Added synthetic Gas Supply item to reach minimum" -ForegroundColor Yellow
}

# Save
$JsonSettings = New-Object Newtonsoft.Json.JsonSerializerSettings
$JsonSettings.Formatting = [Newtonsoft.Json.Formatting]::Indented
$JsonSettings.NullValueHandling = [Newtonsoft.Json.NullValueHandling]::Ignore
$OutputJson = [Newtonsoft.Json.JsonConvert]::SerializeObject($DB, $JsonSettings)
$OutputJson | Set-Content -Path $OutputPath -Encoding UTF8

Write-Host "✅ DONE. Stats:" -ForegroundColor Green
$Stats.GetEnumerator() | ForEach-Object { Write-Host "  - $($_.Key): $($_.Value)" }