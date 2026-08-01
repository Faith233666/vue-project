param (
    [string]$CommitMsg = "update: sync and deploy fullstack code"
)

$ErrorActionPreference = "Continue"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$frontendPath = (Get-Item "$scriptDir\..\..\..").FullName
$backendPath = (Get-Item "$scriptDir\..\..\..\..\sqLite").FullName

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Starting Fullstack Commit & Deploy... " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Backend
Write-Host "[1/2] Processing Backend ($backendPath)..." -ForegroundColor Yellow
if (Test-Path $backendPath) {
    Set-Location $backendPath
    $backendStatus = git status --porcelain
    if ($backendStatus) {
        git add .
        git commit -m "$CommitMsg (backend)"
        git push origin main
        Write-Host " -> Backend pushed to GitHub successfully! Render deploy triggered." -ForegroundColor Green
    } else {
        Write-Host " -> Backend has no changes, skipping." -ForegroundColor Gray
    }
}

# 2. Frontend
Write-Host "[2/2] Processing Frontend ($frontendPath)..." -ForegroundColor Yellow
if (Test-Path $frontendPath) {
    Set-Location $frontendPath
    $frontendStatus = git status --porcelain
    if ($frontendStatus) {
        git add .
        git commit -m "$CommitMsg (frontend)"
        git push origin main
        Write-Host " -> Frontend pushed to GitHub successfully! Netlify deploy triggered." -ForegroundColor Green
    } else {
        Write-Host " -> Frontend has no changes, skipping." -ForegroundColor Gray
    }
}

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Fullstack Commit & Deploy Complete! " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
