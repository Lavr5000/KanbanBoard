$db = Get-Content .\apartment-auditor\constants\checkpoints_database.json -Encoding UTF8 | ConvertFrom-Json

# Извлекаем все записи из general
$general = @()
if ($db.categories.general.draft) { $general += $db.categories.general.draft }
if ($db.categories.general.finish) { $general += $db.categories.general.finish }
if ($db.categories.general.both) { $general += $db.categories.general.both }

Write-Host "=== ЗАПИСИ В GENERAL ($($general.Count) шт.) ===" -ForegroundColor Cyan

foreach ($item in $general) {
    Write-Host "`nID: $($item.id)" -ForegroundColor Yellow
    Write-Host "Title: $($item.check.title)"
    Write-Host "Source: $($item.source.doc) $($item.source.clause)"
    Write-Host "Materials: $($item.filters.materials -join ', ')"
}