param(
    [string]$RootPath = "C:\Users\dasku\OneDrive\Documents\New project",
    [int]$Port = 8080,
    [string]$HostAddress = "0.0.0.0"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $RootPath)) {
    throw "Root path not found: $RootPath"
}

if ($HostAddress -eq "0.0.0.0") {
    $prefix = "http://*:$Port/"
}
else {
    $prefix = "http://$HostAddress`:$Port/"
}

$mimeMap = @{
    ".html" = "text/html; charset=utf-8"
    ".css" = "text/css; charset=utf-8"
    ".js" = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".webmanifest" = "application/manifest+json; charset=utf-8"
    ".png" = "image/png"
    ".jpg" = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg" = "image/svg+xml"
    ".ico" = "image/x-icon"
}

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Output "SRSC App server running at $prefix (root: $RootPath)"

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $requestPath = [System.Uri]::UnescapeDataString($context.Request.Url.AbsolutePath.TrimStart('/'))

        if ([string]::IsNullOrWhiteSpace($requestPath)) {
            $requestPath = "index.html"
        }

        $localPath = Join-Path $RootPath $requestPath
        if ((Test-Path -LiteralPath $localPath) -and ((Get-Item -LiteralPath $localPath).PSIsContainer)) {
            $localPath = Join-Path $localPath "index.html"
        }

        if (-not (Test-Path -LiteralPath $localPath)) {
            $context.Response.StatusCode = 404
            $bytes = [System.Text.Encoding]::UTF8.GetBytes("Not Found")
            $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
            $context.Response.Close()
            continue
        }

        $extension = [System.IO.Path]::GetExtension($localPath).ToLowerInvariant()
        $contentType = if ($mimeMap.ContainsKey($extension)) { $mimeMap[$extension] } else { "application/octet-stream" }
        $bytes = [System.IO.File]::ReadAllBytes($localPath)

        $context.Response.StatusCode = 200
        $context.Response.ContentType = $contentType
        $context.Response.ContentLength64 = $bytes.Length
        $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
        $context.Response.Close()
    }
}
finally {
    $listener.Stop()
    $listener.Close()
}
