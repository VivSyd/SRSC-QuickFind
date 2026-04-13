param(
    [string]$ProjectRoot = "C:\Users\dasku\OneDrive\Documents\New project"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$distPath = Join-Path $ProjectRoot "dist"
if (Test-Path -LiteralPath $distPath) {
    Remove-Item -LiteralPath $distPath -Recurse -Force
}
New-Item -ItemType Directory -Path $distPath | Out-Null
New-Item -ItemType Directory -Path (Join-Path $distPath "assets") | Out-Null
New-Item -ItemType Directory -Path (Join-Path $distPath "data") | Out-Null

$rootFiles = @(
    "index.html",
    "styles.css",
    "app.js",
    "manifest.webmanifest",
    "sw.js"
)

foreach ($file in $rootFiles) {
    Copy-Item -LiteralPath (Join-Path $ProjectRoot $file) -Destination (Join-Path $distPath $file) -Force
}

$assetFiles = @(
    "srsc-icon.png",
    "srsc-icon-192.png",
    "srsc-icon-512.png",
    "srsc-logo.png"
)

foreach ($asset in $assetFiles) {
    Copy-Item -LiteralPath (Join-Path $ProjectRoot "assets\$asset") -Destination (Join-Path $distPath "assets\$asset") -Force
}

Copy-Item -LiteralPath (Join-Path $ProjectRoot "data\inventory-data.js") -Destination (Join-Path $distPath "data\inventory-data.js") -Force

Write-Output "Built deploy folder: $distPath"
