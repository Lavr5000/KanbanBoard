# Настройки
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$InputPath = Join-Path $ScriptDir "..\INPUT_JSONS"
$OutputPath = Join-Path $ScriptDir "..\OUTPUT\checkpoints_database.json"
$CurrentDate = (Get-Date).ToString("yyyy-MM-dd")

Write-Host "INPUT: $InputPath" -ForegroundColor Gray
Write-Host "OUTPUT: $OutputPath" -ForegroundColor Gray

# Словарь маппинга
$CategoryMap = @{
    "gas" = "gas_supply"; "floor" = "floor"; "walls" = "walls";
    "ceiling" = "ceiling"; "windows" = "windows_doors"; "doors" = "windows_doors";
    "plumbing" = "plumbing"; "electrical" = "electrical";
    "heating" = "hvac"; "ventilation" = "hvac"; "fire_safety" = "fire_safety"
}

# Итоговая структура
$Database = @{
    version = "3.0"
    generated = $CurrentDate
    categories = @{}
}

# --- ФУНКЦИИ ---
function Format-Tolerance($tol) {
    if ($null -eq $tol) { return "" }
    if ($tol -is [string]) { return $tol }
    $str = ""
    if ($tol.condition) { $str += "$($tol.condition): " }
    if ($tol.value) { $str += "$($tol.value)" }
    if ($tol.unit) { $str += " $($tol.unit)" }
    return $str.Trim()
}

function Format-Method($meth) {
    if ($null -eq $meth) { return "" }
    if ($meth -is [string]) { return $meth }
    $str = ""
    if ($meth.tools) { 
        $toolsList = $meth.tools -join ', '
        $str += "[Tools: $toolsList] " 
    }
    if ($meth.procedure) { $str += $meth.procedure }
    return $str.Trim()
}

# --- ГЛАВНЫЙ ЦИКЛ ---
$Files = Get-ChildItem -Path $InputPath -Filter "*.json"
$TotalImported = 0

if ($Files.Count -eq 0) {
    Write-Error "NO FILES FOUND in INPUT_JSONS!"
    exit
}

foreach ($File in $Files) {
    Write-Host "Processing: $($File.Name)" -NoNewline
    
    try {
        # Читаем как единый текст, пробуем UTF8
        $Content = Get-Content $File.FullName -Raw -Encoding UTF8
        if (-not $Content) {
            Write-Host " -> EMPTY FILE" -ForegroundColor Yellow
            continue
        }

        $Json = $Content | ConvertFrom-Json
        
        # Диагностика ключей
        $RawItems = $null
        $SourceType = "Unknown"

        if ($null -ne $Json.checkpoints) { 
            $RawItems = $Json.checkpoints
            $SourceType = "Standard"
        } elseif ($null -ne $Json.generatedCheckpoints) { 
            $RawItems = $Json.generatedCheckpoints
            $SourceType = "Table"
        }

        if ($null -eq $RawItems -or $RawItems.Count -eq 0) {
            $keyList = $Json.PSObject.Properties.Name -join ', '
            Write-Host " -> SKIPPED (No 'checkpoints' array). Keys: $keyList" -ForegroundColor Yellow
            continue
        }

        Write-Host " -> FOUND $($RawItems.Count) items ($SourceType)" -ForegroundColor Green

        foreach ($Item in $RawItems) {
            # Нормализация категории
            $RawCat = $Item.category
            if ([string]::IsNullOrWhiteSpace($RawCat)) { $RawCat = "general" }
            
            $AppCat = if ($CategoryMap.ContainsKey($RawCat)) { $CategoryMap[$RawCat] } else { $RawCat }
            
            # Инициализация категории в базе
            if (-not $Database.categories.Contains($AppCat)) {
                $Database.categories[$AppCat] = @{ draft = @(); finish = @() }
            }

            # Сборка объекта
            $DocCode = if ($Item.normativeRef.document) { $Item.normativeRef.document } else { $Json.sourceDocument.code }
            $Clause  = if ($Item.normativeRef.section) { $Item.normativeRef.section } else { $Item.normativeRef.row }

            $NewCP = @{
                id = $Item.id
                source = @{
                    doc = $DocCode
                    clause = $Clause
                    exactQuote = $Item.normativeRef.exactQuote
                }
                check = @{
                    title = $Item.title
                    description = $Item.description
                    tolerance = Format-Tolerance $Item.tolerance
                    method = Format-Method $Item.method
                }
                filters = @{
                    category = $AppCat
                    materials = @()
                    finishType = "finish"
                }
                templates = @{
                    violation = $Item.violationText
                    hint = $Item.hintLayman
                }
            }

            # Распределение по Draft/Finish
            $Stages = @()
            if ($Item.stage -eq "all" -or $null -eq $Item.stage) { $Stages = @("draft", "finish") }
            elseif ($Item.stage -eq "draft") { $Stages = @("draft") }
            else { $Stages = @("finish") }

            foreach ($Stage in $Stages) {
                $Entry = $NewCP.Clone()
                $Entry.filters.finishType = $Stage
                # Удаляем дубликаты ID
                $Existing = $Database.categories[$AppCat][$Stage] | Where-Object { $_.id -eq $Entry.id }
                if (-not $Existing) {
                    $Database.categories[$AppCat][$Stage] += $Entry
                    $TotalImported++
                }
            }
        }
    }
    catch {
        Write-Error " -> CRITICAL ERROR: $_"
    }
}

# Сохранение
$OutputJson = $Database | ConvertTo-Json -Depth 10
$OutputJson | Set-Content -Path $OutputPath -Encoding UTF8 -Force

Write-Host ""
Write-Host "GRAND TOTAL: $TotalImported checkpoints imported." -ForegroundColor Cyan
Write-Host "Saved to: $OutputPath" -ForegroundColor Cyan