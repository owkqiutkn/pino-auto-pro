# Download images from URLs (e.g. Pexels MCP S3 URLs - expire in ~30 min)
# Usage: .\download-from-urls.ps1
# Edit the $PAIRS array below with your (URL, filename) or pass inline:
#   .\download-from-urls.ps1 -Pairs @(
#     @("https://...", "coupe.jpg"),
#     @("https://...", "sedan.jpg")
#   )

$ErrorActionPreference = "Stop"
$outDir = Join-Path $PSScriptRoot "..\public\categories"

# Ensure directory exists
if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force
}

# (url, filename) pairs - REPLACE with your S3 URLs from Pexels MCP
# URLs expire in ~30 min - run soon after getting them
$PAIRS = @(
    # @("https://images.pexels.com/...", "coupe.jpg"),
    # @("https://...", "sedan.jpg"),
    # @("https://...", "suv.jpg"),
    # @("https://...", "truck.jpg")
)

param(
    [array]$Pairs = $PAIRS
)

if ($Pairs.Count -eq 0) {
    Write-Host "No pairs to download. Edit the script or pass -Pairs @(@('url','file.jpg'),...)"
    exit 1
}

foreach ($p in $Pairs) {
    $url = $p[0]
    $filename = $p[1]
    $dest = Join-Path $outDir $filename
    Write-Host "Downloading $filename ..."
    try {
        Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing
        Write-Host "Saved: $dest"
    } catch {
        Write-Error "Failed $filename : $_"
    }
}
