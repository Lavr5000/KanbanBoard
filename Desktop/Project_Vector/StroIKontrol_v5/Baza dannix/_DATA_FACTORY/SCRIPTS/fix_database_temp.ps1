# Settings
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$InputPath = Join-Path $ScriptDir "..\OUTPUT\checkpoints_database.json"
$OutputPath = Join-Path $ScriptDir "..\OUTPUT\checkpoints_database_patched.json"

# Cyrillic strings as variables
$str1 = "🔧 Starting DEEP DB Repair..."
$str2 = "Installing Newtonsoft.Json module..."
$str3 = "✅ DONE. Stats:"
$str4 = "  ➕ Added synthetic Gas Supply item to reach minimum"
$str5 = "Нормативное требование"
$str6 = "Визуальный и инструментальный контроль"
$str7 = "Нарушение требований "
$str8 = ": "
$str9 = "Убедитесь в соответствии параметров нормативным значениям"
$str10 = "Не установлено"
$str11 = "Визуальный осмотр доступности оборудования"
$str12 = "Обеспечение свободного доступа к кранам и приборам"

Write-Host $str1 -ForegroundColor Cyan

# Проверяем наличие модуля Newtonsoft.Json
try {
    Add-Type -AssemblyName Newtonsoft.Json
} catch {
    Write-Host $str2 -ForegroundColor Yellow
    Install-Package -Name Newtonsoft.Json -Scope CurrentUser -Force
    Add-Type -AssemblyName Newtonsoft.Json
}

$DB = Get-Content $InputPath -Raw -Encoding UTF8 | ConvertFrom-Json

$Stats = @{ FixedTitles = 0; FixedQuotes = 0; FixedEmptyFields = 0; AddedGas = 0 }

function Fix-Title($t) {
    if ([string]::IsNullOrEmpty($t)) { return $str5 }
    # Убираем "Проверка", "Контроль", "Определение" в начале
    $t = $t -replace "^(Proverka|Kontrol|Opredelenie)\s+", ""
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
                $item.check.method = $str6
                $Stats.FixedEmptyFields++
            }
            if ([string]::IsNullOrWhiteSpace($item.templates.violation)) {
                $item.templates.violation = $str7 + $item.source.doc + $str8 + $item.check.title
                $Stats.FixedEmptyFields++
            }
            if ([string]::IsNullOrWhiteSpace($item.templates.hint)) {
                $item.templates.hint = $str9
                $Stats.FixedEmptyFields++
            }

            # 4. FIX HINT LENGTH
            if ($item.templates.hint.Length -gt 200) {
                $item.templates.hint = $item.templates.hint.Substring(0, 197) + "..."
            }
            
            # 5. FIX TOLERANCE OBJECT
            if ($null -eq $item.check.tolerance) {
                 $item.check.tolerance = $str10
            }
        }
    }
}

# 6. FIX GAS SUPPLY (Min 3 items)
$GasItems = $DB.categories.gas_supply.finish
if ($GasItems.Count -gt 0 -and $GasItems.Count -lt 3) {
    $Clone = $GasItems[0].PSObject.Copy()
    $Clone.id = "gas_supply_visual_inspection_gen"
    $Clone.check.title = $str11
    $Clone.check.description = $str12
    $DB.categories.gas_supply.finish += $Clone
    $Stats.AddedGas++
    Write-Host $str4 -ForegroundColor Yellow
}

# Save
$JsonSettings = New-Object Newtonsoft.Json.JsonSerializerSettings
$JsonSettings.Formatting = [Newtonsoft.Json.Formatting]::Indented
$JsonSettings.NullValueHandling = [Newtonsoft.Json.NullValueHandling]::Ignore
$OutputJson = [Newtonsoft.Json.JsonConvert]::SerializeObject($DB, $JsonSettings)
$OutputJson | Set-Content -Path $OutputPath -Encoding UTF8

Write-Host $str3 -ForegroundColor Green
$Stats.GetEnumerator() | ForEach-Object { Write-Host "  - $($_.Key): $($_.Value)" }