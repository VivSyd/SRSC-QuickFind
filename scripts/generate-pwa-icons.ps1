param(
    [string]$SourceIconPath = "C:\Users\dasku\OneDrive\Documents\New project\assets\srsc-icon.png"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

if (-not (Test-Path -LiteralPath $SourceIconPath)) {
    throw "Source icon not found: $SourceIconPath"
}

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$assetsDir = Join-Path $root "assets"
$icon192 = Join-Path $assetsDir "srsc-icon-192.png"
$icon512 = Join-Path $assetsDir "srsc-icon-512.png"

$inputBitmap = [System.Drawing.Bitmap]::FromFile($SourceIconPath)

function New-SquareIcon {
    param(
        [System.Drawing.Bitmap]$InputBitmap,
        [int]$Size,
        [string]$OutputPath
    )

    $canvas = New-Object System.Drawing.Bitmap($Size, $Size)
    $graphics = [System.Drawing.Graphics]::FromImage($canvas)
    $graphics.Clear([System.Drawing.Color]::White)

    $scale = [Math]::Min($Size / $InputBitmap.Width, $Size / $InputBitmap.Height)
    $width = [int]([Math]::Round($InputBitmap.Width * $scale))
    $height = [int]([Math]::Round($InputBitmap.Height * $scale))
    $x = [int](($Size - $width) / 2)
    $y = [int](($Size - $height) / 2)

    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.DrawImage($InputBitmap, $x, $y, $width, $height)
    $canvas.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)

    $graphics.Dispose()
    $canvas.Dispose()
}

try {
    New-SquareIcon -InputBitmap $inputBitmap -Size 192 -OutputPath $icon192
    New-SquareIcon -InputBitmap $inputBitmap -Size 512 -OutputPath $icon512
}
finally {
    $inputBitmap.Dispose()
}

Write-Output "Generated icons: $icon192, $icon512"
