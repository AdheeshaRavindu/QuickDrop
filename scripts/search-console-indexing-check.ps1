param(
  [string]$BaseUrl = "https://quickdrop-share-production.adheesharavindu001.workers.dev"
)

$ErrorActionPreference = "Stop"

$checks = @(
  "/",
  "/peer-to-peer-file-sharing.html",
  "/transfer-files-phone-to-laptop.html",
  "/share-text-between-devices.html",
  "/robots.txt",
  "/sitemap.xml"
)

$expectedMarkers = @{
  "/" = "Send files directly to nearby devices"
  "/peer-to-peer-file-sharing.html" = "Peer To Peer File Sharing In Browser"
  "/transfer-files-phone-to-laptop.html" = "Transfer Files From Phone To Laptop"
  "/share-text-between-devices.html" = "Share Text Between Devices Instantly"
}

$failures = @()

function Add-Failure([string]$message) {
  $script:failures += $message
  Write-Host "[FAIL] $message" -ForegroundColor Red
}

function Add-Pass([string]$message) {
  Write-Host "[PASS] $message" -ForegroundColor Green
}

Write-Host "Running Search Console indexing checks for $BaseUrl" -ForegroundColor Cyan

foreach ($path in $checks) {
  $url = "$BaseUrl$path"
  try {
    $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 25 -UseBasicParsing
  } catch {
    Add-Failure "Request failed: $url"
    continue
  }

  if ($response.StatusCode -ne 200) {
    Add-Failure "Unexpected status code $($response.StatusCode): $url"
    continue
  }

  Add-Pass "200 OK: $url"

  if ($path -eq "/" -or $path -like "*.html") {
    if ($response.Content -notmatch '<title>.+</title>') {
      Add-Failure "Missing title tag: $url"
    }
    if ($response.Content -notmatch 'meta name="description"') {
      Add-Failure "Missing meta description: $url"
    }
    if ($response.Content -notmatch 'rel="canonical"') {
      Add-Failure "Missing canonical tag: $url"
    }

    if ($expectedMarkers.ContainsKey($path)) {
      $marker = $expectedMarkers[$path]
      if ($response.Content -notmatch [regex]::Escape($marker)) {
        Add-Failure "Unexpected page content for $path (possible SPA fallback or wrong page)"
      }
    }
  }
}

$roomProbe = "$BaseUrl/room/seo-check-room"
try {
  $roomResponse = Invoke-WebRequest -Uri $roomProbe -Method GET -TimeoutSec 25 -UseBasicParsing
  $xRobots = $roomResponse.Headers["x-robots-tag"]
  if (-not $xRobots -or $xRobots -notmatch "noindex") {
    Add-Failure "Room page missing x-robots-tag noindex: $roomProbe"
  } else {
    Add-Pass "Room page has x-robots-tag: $xRobots"
  }
} catch {
  Add-Failure "Room page probe failed: $roomProbe"
}

$robotsUrl = "$BaseUrl/robots.txt"
$sitemapUrl = "$BaseUrl/sitemap.xml"

try {
  $robots = Invoke-WebRequest -Uri $robotsUrl -Method GET -TimeoutSec 25 -UseBasicParsing
  if ($robots.Content -match [regex]::Escape($sitemapUrl)) {
    Add-Pass "robots.txt references sitemap.xml"
  } else {
    Add-Failure "robots.txt does not reference sitemap.xml"
  }
} catch {
  Add-Failure "Unable to validate robots.txt"
}

Write-Host ""
Write-Host "Manual Search Console workflow:" -ForegroundColor Yellow
Write-Host "1. Open Google Search Console and verify your property for $BaseUrl"
Write-Host "2. Submit sitemap: $sitemapUrl"
Write-Host "3. Use URL Inspection on:"
Write-Host "   - $BaseUrl/"
Write-Host "   - $BaseUrl/peer-to-peer-file-sharing.html"
Write-Host "   - $BaseUrl/transfer-files-phone-to-laptop.html"
Write-Host "   - $BaseUrl/share-text-between-devices.html"
Write-Host "4. Request indexing for pages marked as not indexed"

if ($failures.Count -gt 0) {
  Write-Host ""
  Write-Host "Indexing checks completed with $($failures.Count) failure(s)." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "All indexing checks passed." -ForegroundColor Green
exit 0
