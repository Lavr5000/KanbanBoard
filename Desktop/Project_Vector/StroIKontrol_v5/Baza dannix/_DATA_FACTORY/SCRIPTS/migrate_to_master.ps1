# Settings
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$InputPath = Join-Path $ScriptDir "..\INPUT_JSONS"
$OutputPath = Join-Path $ScriptDir "..\OUTPUT\checkpoints_database_master.json"
$CurrentDate = (Get-Date).ToString("yyyy-MM-dd")

Write-Host "🚀 STARTING MASTER MIGRATION..." -ForegroundColor Cyan

# 1. DATABASE STRUCTURE (Flat as required by QA)
$MasterDB = @{
    version = "3.0"
    generated = $CurrentDate
    checkpoints = @()
}

# Category mapping (File -> App)
$CatMap = @{
    "gas" = "gas_supply"; "floor" = "floor"; "walls" = "walls";
    "ceiling" = "ceiling"; "windows" = "windows_doors"; "doors" = "windows_doors";
    "plumbing" = "plumbing"; "electrical" = "electrical";
    "heating" = "hvac"; "ventilation" = "hvac"; "fire_safety" = "fire_safety"
}

# Helper for title cleaning
function Clean-Title($t) {
    if ([string]::IsNullOrEmpty($t)) { return "Normative requirement" }
    # Remove "Check", "Control"
    $t = $t -replace "^(Check|Control|Determine)\s+", ""
    # Capitalize
    return $t.Substring(0,1).ToUpper() + $t.Substring(1)
}

# Helper for Tolerance
function Format-Tolerance($tol) {
    # If already object with value/unit - return
    if ($tol.value -or $tol.unit) { return $tol }
    # If string - try to split or return stub object
    if ($tol -is [string]) {
        return @{ value = $tol; unit = ""; condition = "see description" }
    }
    return @{ value = "Not regulated"; unit = ""; condition = "" }
}

# 2. DATA COLLECTION
$Files = Get-ChildItem -Path $InputPath -Filter "*.json"
$ImportedIDs = @{}

foreach ($File in $Files) {
    Write-Host "  Processing: $($File.Name)" -NoNewline
    
    try {
        $Content = Get-Content $File.FullName -Raw -Encoding UTF8
        if (-not $Content) { continue }
        $Json = $Content | ConvertFrom-Json
        
        # Determine data array
        $RawItems = if ($Json.checkpoints) { $Json.checkpoints } elseif ($Json.generatedCheckpoints) { $Json.generatedCheckpoints }
        if (-not $RawItems) { Write-Host " -> SKIP (No data)" -ForegroundColor Yellow; continue }

        foreach ($Item in $RawItems) {
            # Determine category
            $RawCat = if ($Item.category) { $Item.category } elseif ($Item.applicableCategories) { $Item.applicableCategories[0] } else { "general" }
            $FinalCat = if ($CatMap[$RawCat]) { $CatMap[$RawCat] } else { $RawCat }

            # Determine Stages (Draft/Finish)
            $Stages = @()
            if ($Item.stage -eq "all" -or $null -eq $Item.stage) { $Stages = @("draft", "finish") }
            elseif ($Item.stage -eq "draft") { $Stages = @("draft") }
            else { $Stages = @("finish") }

            # Form NormativeRef (combine into one string)
            $Doc = if ($Item.normativeRef.document) { $Item.normativeRef.document } else { $Json.sourceDocument.code }
            $Clause = if ($Item.normativeRef.section) { $Item.normativeRef.section } else { $Item.normativeRef.row }
            $RefString = "$Doc $Clause".Trim()

            foreach ($Stage in $Stages) {
                # Generate unique ID
                $BaseID = $Item.id
                if (-not $BaseID) { $BaseID = "auto_" + [Guid]::NewGuid().ToString().Substring(0,8) }
                $UniqueID = "${BaseID}_${Stage}"

                # Skip duplicates
                if ($ImportedIDs.ContainsKey($UniqueID)) { continue }
                $ImportedIDs[$UniqueID] = $true

                # 3. CREATE FLAT OBJECT (per QA requirements)
                $NewCP = @{
                    id = $UniqueID
                    title = Clean-Title $Item.title
                    category = $FinalCat
                    stage = $Stage
                    description = if ($Item.description) { $Item.description } else { $Item.title }
                    
                    # Structured tolerance
                    tolerance = Format-Tolerance $Item.tolerance
                    
                    # Single normative field
                    normativeRef = $RefString
                    
                    # Texts
                    violationText = if ($Item.violationText) { $Item.violationText } else { "Violation of requirements $RefString" }
                    hintLayman = if ($Item.hintLayman) { 
                        if ($Item.hintLayman.Length -gt 200) { $Item.hintLayman.Substring(0, 197) + "..." } else { $Item.hintLayman }
                    } else { "Check compliance with regulations" }
                    
                    # Control method
                    method = if ($Item.method.procedure) { $Item.method.procedure } else { "Visual inspection" }
                }

                $MasterDB.checkpoints += $NewCP
            }
        }
        Write-Host " -> OK" -ForegroundColor Green
    }
    catch {
        Write-Error "Error in $($File.Name): $_"
    }
}

# 4. FILL GAPS (Generate placeholders for empty categories)
$RequiredCats = @("floor", "walls", "ceiling", "electrical", "plumbing", "hvac", "gas_supply", "windows_doors", "fire_safety")
$ExistingCats = $MasterDB.checkpoints | Select-Object -ExpandProperty category -Unique

foreach ($ReqCat in $RequiredCats) {
    if ($ExistingCats -notcontains $ReqCat) {
        Write-Host "  Missing category: $ReqCat. Generating placeholders..." -ForegroundColor Yellow
        for ($i=1; $i -le 3; $i++) {
            $MasterDB.checkpoints += @{
                id = "placeholder_${ReqCat}_${i}_finish"
                title = "Basic check $ReqCat #$i"
                category = $ReqCat
                stage = "finish"
                description = "Need to fill data for this category"
                tolerance = @{ value = "-"; unit = "" }
                normativeRef = "SP/GOST"
                violationText = "Defect in category $ReqCat"
                hintLayman = "Check work quality"
                method = "Visual inspection"
            }
        }
    }
}

# Save
try {
    # Check for Newtonsoft.Json
    $null = [Newtonsoft.Json.JsonConvert]
} catch {
    # If not available, use built-in ConvertTo-Json
    $OutputJson = $MasterDB | ConvertTo-Json -Depth 10
    $OutputJson | Set-Content -Path $OutputPath -Encoding UTF8
    Write-Host "✅ MASTER DB GENERATED: $($MasterDB.checkpoints.Count) records." -ForegroundColor Green
    exit
}

# If Newtonsoft.Json is available
$JsonSettings = New-Object Newtonsoft.Json.JsonSerializerSettings
$JsonSettings.Formatting = [Newtonsoft.Json.Formatting]::Indented
$JsonSettings.NullValueHandling = [Newtonsoft.Json.NullValueHandling]::Ignore
$OutputJson = [Newtonsoft.Json.JsonConvert]::SerializeObject($MasterDB, $JsonSettings)
$OutputJson | Set-Content -Path $OutputPath -Encoding UTF8

Write-Host "✅ MASTER DB GENERATED: $($MasterDB.checkpoints.Count) records." -ForegroundColor Green