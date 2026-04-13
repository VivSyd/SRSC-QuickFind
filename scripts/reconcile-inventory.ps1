param(
    [string]$MasterWorkbookPath = "C:\Users\dasku\OneDrive\Documents\New project\MASTER LIST.xlsx",
    [string]$LegacyWorkbookPath = "C:\Users\dasku\OneDrive\Documents\New project\viv codes copy.xlsx",
    [switch]$IncludeLegacyExtras,
    [string]$OutputPath = "C:\Users\dasku\OneDrive\Documents\New project\data\inventory.json",
    [string]$ScriptOutputPath = "C:\Users\dasku\OneDrive\Documents\New project\data\inventory-data.js",
    [string]$ReportPath = "C:\Users\dasku\OneDrive\Documents\New project\data\reconcile-report.txt"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Convert-ToRecord {
    param([object]$Item)

    return [PSCustomObject]@{
        id = 0
        itemName = [string]$Item.itemName
        sapCode = [string]$Item.sapCode
        sourcingBranch = [string]$Item.sourcingBranch
        itemDescription = [string]$Item.itemDescription
        imageUrl = [string]$Item.imageUrl
        itemGroup = [string]$Item.itemGroup
        category = [string]$Item.category
    }
}

function Get-UniqueSapSet {
    param([object[]]$Rows)

    return [System.Collections.Generic.HashSet[string]]::new(
        [string[]]@(
            $Rows |
                ForEach-Object { ([string]$_.sapCode).Trim().ToUpperInvariant() } |
                Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
        )
    )
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$importScriptPath = Join-Path $scriptDir "import-inventory.ps1"
if (-not (Test-Path -LiteralPath $importScriptPath)) {
    throw "Import script not found: $importScriptPath"
}

if (-not (Test-Path -LiteralPath $MasterWorkbookPath)) {
    throw "Master workbook not found: $MasterWorkbookPath"
}

$outputDirectory = Split-Path -Parent $OutputPath
if (-not (Test-Path -LiteralPath $outputDirectory)) {
    New-Item -ItemType Directory -Path $outputDirectory | Out-Null
}

$tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("sap-finder-reconcile-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $tempRoot | Out-Null

try {
    $masterJsonPath = Join-Path $tempRoot "master-inventory.json"
    $masterJsPath = Join-Path $tempRoot "master-inventory-data.js"

    powershell -NoProfile -ExecutionPolicy Bypass -File $importScriptPath `
        -WorkbookPath $MasterWorkbookPath `
        -OutputPath $masterJsonPath `
        -ScriptOutputPath $masterJsPath | Out-Null

    $masterPayload = Get-Content -Raw -LiteralPath $masterJsonPath | ConvertFrom-Json
    $recordsBySap = [ordered]@{}

    foreach ($row in $masterPayload.items) {
        $sap = ([string]$row.sapCode).Trim().ToUpperInvariant()
        if ([string]::IsNullOrWhiteSpace($sap)) {
            continue
        }
        if (-not $recordsBySap.Contains($sap)) {
            $recordsBySap[$sap] = Convert-ToRecord -Item $row
        }
    }

    $addedFromLegacy = New-Object System.Collections.Generic.List[string]
    $legacyPayload = $null
    if ($IncludeLegacyExtras) {
        if (-not (Test-Path -LiteralPath $LegacyWorkbookPath)) {
            throw "Legacy workbook not found: $LegacyWorkbookPath"
        }

        $legacyJsonPath = Join-Path $tempRoot "legacy-inventory.json"
        $legacyJsPath = Join-Path $tempRoot "legacy-inventory-data.js"

        powershell -NoProfile -ExecutionPolicy Bypass -File $importScriptPath `
            -WorkbookPath $LegacyWorkbookPath `
            -OutputPath $legacyJsonPath `
            -ScriptOutputPath $legacyJsPath | Out-Null

        $legacyPayload = Get-Content -Raw -LiteralPath $legacyJsonPath | ConvertFrom-Json
        foreach ($row in $legacyPayload.items) {
            $sap = ([string]$row.sapCode).Trim().ToUpperInvariant()
            if ([string]::IsNullOrWhiteSpace($sap)) {
                continue
            }
            if (-not $recordsBySap.Contains($sap)) {
                $recordsBySap[$sap] = Convert-ToRecord -Item $row
                $addedFromLegacy.Add($sap)
            }
        }
    }

    $records = New-Object System.Collections.Generic.List[object]
    $index = 1
    foreach ($entry in $recordsBySap.GetEnumerator()) {
        $entry.Value.id = $index
        $records.Add($entry.Value)
        $index++
    }

    $branches = @(
        $records |
            Where-Object { -not [string]::IsNullOrWhiteSpace($_.sourcingBranch) } |
            Select-Object -ExpandProperty sourcingBranch -Unique |
            Sort-Object
    )
    $categories = @(
        $records |
            Where-Object { -not [string]::IsNullOrWhiteSpace($_.category) } |
            Select-Object -ExpandProperty category -Unique |
            Sort-Object
    )

    $finalPayload = [PSCustomObject]@{
        generatedAt = (Get-Date).ToString("s")
        recordCount = $records.Count
        branchCount = $branches.Count
        categoryCount = $categories.Count
        branches = $branches
        categories = $categories
        items = $records
    }

    $jsonPayload = $finalPayload | ConvertTo-Json -Depth 6
    $jsonPayload | Set-Content -LiteralPath $OutputPath -Encoding UTF8
    ("window.SAP_FINDER_DATA = " + $jsonPayload + ";") | Set-Content -LiteralPath $ScriptOutputPath -Encoding UTF8

    $masterUniqueSap = (Get-UniqueSapSet -Rows $masterPayload.items).Count
    $legacyUniqueSap = if ($legacyPayload) { (Get-UniqueSapSet -Rows $legacyPayload.items).Count } else { 0 }
    $modeLabel = if ($IncludeLegacyExtras) { "master-plus-legacy-extras" } else { "master-only" }

    $reportLines = @(
        "Reconciled On: $(Get-Date -Format s)",
        "Mode: $modeLabel",
        "Master Workbook: $MasterWorkbookPath",
        "Legacy Workbook: $LegacyWorkbookPath",
        "Master Records: $($masterPayload.recordCount)",
        "Master Unique SAP: $masterUniqueSap",
        "Legacy Unique SAP: $legacyUniqueSap",
        "Added From Legacy: $($addedFromLegacy.Count)",
        "Added SAP Codes: $($addedFromLegacy -join ', ')",
        "Final Records: $($finalPayload.recordCount)",
        "Final Categories: $($finalPayload.categoryCount)",
        "Final Branches: $($finalPayload.branchCount)"
    )

    $reportLines | Set-Content -LiteralPath $ReportPath -Encoding UTF8
    Write-Output "Reconciliation completed ($modeLabel) with $($finalPayload.recordCount) records."
}
finally {
    if (Test-Path -LiteralPath $tempRoot) {
        Remove-Item -LiteralPath $tempRoot -Recurse -Force
    }
}
