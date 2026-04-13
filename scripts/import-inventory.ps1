param(
    [string]$WorkbookPath = "C:\Users\dasku\OneDrive\Documents\New project\viv codes copy.xlsx",
    [string]$OutputPath = "C:\Users\dasku\OneDrive\Documents\New project\data\inventory.json",
    [string]$ScriptOutputPath = "C:\Users\dasku\OneDrive\Documents\New project\data\inventory-data.js"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-CellColumnName {
    param([string]$CellReference)

    if ([string]::IsNullOrWhiteSpace($CellReference)) {
        return ""
    }

    return ([regex]::Match($CellReference, "^[A-Z]+")).Value
}

function Get-SharedStringText {
    param([System.Xml.XmlElement]$SharedStringItem)

    if (-not $SharedStringItem) {
        return ""
    }

    $textNodes = $SharedStringItem.SelectNodes(".//*[local-name()='t']")
    if ($textNodes.Count -eq 0) {
        return ""
    }

    return (($textNodes | ForEach-Object { $_.'#text' }) -join "")
}

function Get-CellValue {
    param(
        [System.Xml.XmlElement]$Cell,
        [string[]]$SharedStrings
    )

    if (-not $Cell) {
        return ""
    }

    $type = $Cell.GetAttribute("t")
    $valueNode = $Cell.SelectSingleNode("./*[local-name()='v']")
    $inlineNode = $Cell.SelectSingleNode("./*[local-name()='is']")

    if ($type -eq "inlineStr" -and $inlineNode) {
        $inlineTextNodes = $inlineNode.SelectNodes(".//*[local-name()='t']")
        return (($inlineTextNodes | ForEach-Object { $_.'#text' }) -join "").Trim()
    }

    if (-not $valueNode) {
        return ""
    }

    $rawValue = [string]$valueNode.InnerText

    if ($type -eq "s") {
        $index = 0
        if ([int]::TryParse($rawValue, [ref]$index) -and $index -ge 0 -and $index -lt $SharedStrings.Count) {
            return [string]$SharedStrings[$index]
        }
        return ""
    }

    return $rawValue.Trim()
}

function Normalize-Header {
    param([string]$Value)

    if ([string]::IsNullOrWhiteSpace($Value)) {
        return ""
    }

    return (($Value.ToUpperInvariant() -replace "[^A-Z0-9]+", " ").Trim() -replace "\s+", " ")
}

function Get-FirstMatchingColumn {
    param(
        [hashtable]$HeaderMap,
        [string[]]$Candidates
    )

    foreach ($candidate in $Candidates) {
        if ($HeaderMap.ContainsKey($candidate)) {
            return $HeaderMap[$candidate]
        }
    }

    return $null
}

function Test-IsHeaderRow {
    param([hashtable]$HeaderMap)

    $knownHeaders = @(
        "ITEM CODE",
        "ITEMCODE",
        "ITEM NO",
        "ITEM DESCRIPTION",
        "ITEMDESCRIPTION",
        "ITEM GROUP",
        "ITEMGROUP",
        "LOCATION",
        "SAP CODE",
        "SAPCODE"
    )

    foreach ($header in $knownHeaders) {
        if ($HeaderMap.ContainsKey($header)) {
            return $true
        }
    }

    return $false
}

if (-not (Test-Path -LiteralPath $WorkbookPath)) {
    throw "Workbook not found: $WorkbookPath"
}

$outputDirectory = Split-Path -Parent $OutputPath
if (-not (Test-Path -LiteralPath $outputDirectory)) {
    New-Item -ItemType Directory -Path $outputDirectory | Out-Null
}

$tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("sap-finder-" + [guid]::NewGuid().ToString("N"))
$zipPath = Join-Path $tempRoot "workbook.zip"
$unpackPath = Join-Path $tempRoot "unpacked"
New-Item -ItemType Directory -Path $tempRoot | Out-Null

try {
    Copy-Item -LiteralPath $WorkbookPath -Destination $zipPath
    Expand-Archive -LiteralPath $zipPath -DestinationPath $unpackPath -Force

    [xml]$sharedStringsXml = Get-Content -LiteralPath (Join-Path $unpackPath "xl\sharedStrings.xml")
    $sharedStrings = @(
        foreach ($si in $sharedStringsXml.sst.si) {
            Get-SharedStringText -SharedStringItem $si
        }
    )

    [xml]$workbookXml = Get-Content -LiteralPath (Join-Path $unpackPath "xl\workbook.xml")
    [xml]$relationshipXml = Get-Content -LiteralPath (Join-Path $unpackPath "xl\_rels\workbook.xml.rels")

    $relationshipMap = @{}
    foreach ($relationship in $relationshipXml.Relationships.Relationship) {
        $relationshipMap[$relationship.Id] = $relationship.Target
    }

    $records = New-Object System.Collections.Generic.List[object]
    $index = 1

    foreach ($sheet in $workbookXml.workbook.sheets.sheet) {
        $sheetName = ([string]$sheet.name).Trim()
        $relationshipId = $sheet.GetAttribute("id", "http://schemas.openxmlformats.org/officeDocument/2006/relationships")
        $sheetTarget = $relationshipMap[$relationshipId]

        if ([string]::IsNullOrWhiteSpace($sheetTarget)) {
            continue
        }

        $sheetPath = Join-Path (Join-Path $unpackPath "xl") $sheetTarget.Replace("/", "\")
        [xml]$sheetXml = Get-Content -LiteralPath $sheetPath

        $rows = $sheetXml.worksheet.sheetData.row
        if (-not $rows -or $rows.Count -eq 0) {
            continue
        }

        $headerRow = $rows[0]
        $headerMap = @{}

        if ($headerRow.PSObject.Properties["c"]) {
            foreach ($cell in $headerRow.c) {
                $columnName = Get-CellColumnName -CellReference $cell.r
                $headerValue = Normalize-Header -Value (Get-CellValue -Cell $cell -SharedStrings $sharedStrings)
                if (-not [string]::IsNullOrWhiteSpace($columnName) -and -not [string]::IsNullOrWhiteSpace($headerValue)) {
                    $headerMap[$headerValue] = $columnName
                }
            }
        }

        $hasHeaderRow = Test-IsHeaderRow -HeaderMap $headerMap

        if ($hasHeaderRow) {
            $itemCodeColumn = Get-FirstMatchingColumn -HeaderMap $headerMap -Candidates @("ITEM CODE", "ITEMCODE", "ITEM NO", "SAP CODE", "SAPCODE", "CODE")
            $descriptionColumn = Get-FirstMatchingColumn -HeaderMap $headerMap -Candidates @("ITEM DESCRIPTION", "ITEMDESCRIPTION", "DESCRIPTION")
            $groupColumn = Get-FirstMatchingColumn -HeaderMap $headerMap -Candidates @("ITEM GROUP", "ITEMGROUP", "GROUP")
            $branchColumn = Get-FirstMatchingColumn -HeaderMap $headerMap -Candidates @("LOCATION", "BRANCH", "SOURCING BRANCH", "SOURCINGBRANCH")
            $dataRows = $rows | Select-Object -Skip 1
        }
        else {
            $itemCodeColumn = "A"
            $descriptionColumn = "B"
            $groupColumn = "C"
            $branchColumn = "D"
            $dataRows = $rows
        }

        if (-not $itemCodeColumn -and -not $descriptionColumn) {
            continue
        }

        foreach ($row in $dataRows) {
            if (-not $row.PSObject.Properties["c"]) {
                continue
            }

            $cellMap = @{}
            foreach ($cell in $row.c) {
                $columnName = Get-CellColumnName -CellReference $cell.r
                if (-not [string]::IsNullOrWhiteSpace($columnName)) {
                    $cellMap[$columnName] = Get-CellValue -Cell $cell -SharedStrings $sharedStrings
                }
            }

            $sapCode = if ($itemCodeColumn) { [string]$cellMap[$itemCodeColumn] } else { "" }
            $itemDescriptionText = if ($descriptionColumn) { [string]$cellMap[$descriptionColumn] } else { "" }
            $itemGroup = if ($groupColumn) { [string]$cellMap[$groupColumn] } else { "" }
            $branch = if ($branchColumn) { [string]$cellMap[$branchColumn] } else { "" }

            $sapCode = $sapCode.Trim()
            $itemDescriptionText = $itemDescriptionText.Trim()
            $itemGroup = $itemGroup.Trim()
            $branch = $branch.Trim()

            if ([string]::IsNullOrWhiteSpace($sapCode) -and [string]::IsNullOrWhiteSpace($itemDescriptionText)) {
                continue
            }

            $detailParts = New-Object System.Collections.Generic.List[string]
            if (-not [string]::IsNullOrWhiteSpace($itemDescriptionText)) {
                $detailParts.Add($itemDescriptionText)
            }
            if (-not [string]::IsNullOrWhiteSpace($itemGroup)) {
                $detailParts.Add("Group: $itemGroup")
            }
            $detailParts.Add("Category: $sheetName")

            $records.Add([PSCustomObject]@{
                id = $index
                itemName = if (-not [string]::IsNullOrWhiteSpace($itemDescriptionText)) { $itemDescriptionText } else { $sapCode }
                sapCode = $sapCode
                sourcingBranch = $branch
                itemDescription = ($detailParts -join " | ")
                imageUrl = ""
                itemGroup = $itemGroup
                category = $sheetName
            })

            $index++
        }
    }

    $branches = @(
        $records |
            Where-Object { -not [string]::IsNullOrWhiteSpace($_.sourcingBranch) } |
            Select-Object -ExpandProperty sourcingBranch -Unique |
            Sort-Object
    )

    $categories = @(
        $records |
            Select-Object -ExpandProperty category -Unique |
            Sort-Object
    )

    $payload = [PSCustomObject]@{
        generatedAt = (Get-Date).ToString("s")
        recordCount = $records.Count
        branchCount = $branches.Count
        categoryCount = $categories.Count
        branches = $branches
        categories = $categories
        items = $records
    }

    $jsonPayload = $payload | ConvertTo-Json -Depth 6
    $jsonPayload | Set-Content -LiteralPath $OutputPath -Encoding UTF8
    ("window.SAP_FINDER_DATA = " + $jsonPayload + ";") | Set-Content -LiteralPath $ScriptOutputPath -Encoding UTF8
    Write-Output "Generated $($records.Count) records across $($categories.Count) sheets to $OutputPath"
}
finally {
    if (Test-Path -LiteralPath $tempRoot) {
        Remove-Item -LiteralPath $tempRoot -Recurse -Force
    }
}
