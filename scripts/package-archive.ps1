# ============================================================================
# Package Archive Script — Sovereign Node 9010 (Groknett ValueForge v2.10.0)
#
# Creates a deploy-ready .zip of the project, excluding dev-only files.
# Output: groknett-valueforge-<date>.zip in the project root.
#
# Run:  .\scripts\package-archive.ps1
# ============================================================================

$ErrorActionPreference = "Stop"

# ---- Configuration ----
$ProjectRoot   = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
if (-not (Test-Path (Join-Path $PSScriptRoot "..\package.json"))) {
    $ProjectRoot = Split-Path -Parent $PSScriptRoot
}
Set-Location $ProjectRoot

$Timestamp     = Get-Date -Format "yyyy-MM-dd"
$ArchiveName   = "groknett-valueforge-$Timestamp.zip"
$StagingDir    = Join-Path $env:TEMP "groknett-archive-staging"

Write-Host ""
Write-Host "=== Sovereign Node 9010: Package Archive ===" -ForegroundColor Cyan
Write-Host "    Project root: $ProjectRoot"
Write-Host "    Output:       $ArchiveName"
Write-Host ""

# ---- Step 1: Clean previous staging ----
Write-Host "1/7  Cleaning staging directory..." -ForegroundColor Yellow
if (Test-Path $StagingDir) { Remove-Item $StagingDir -Recurse -Force }
New-Item -ItemType Directory -Path $StagingDir | Out-Null

# ---- Step 2: Build the Vite production bundle ----
Write-Host "2/7  Running 'npm run build' (Vite production build)..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { throw "Vite build failed — fix errors before packaging." }

# ---- Step 3: Run tests to confirm green ----
Write-Host "3/7  Running 'npm test' (Vitest — 108 tests)..." -ForegroundColor Yellow
npm test
if ($LASTEXITCODE -ne 0) { throw "Tests failed — fix failures before packaging." }

# ---- Step 4: Copy deploy-essential files to staging ----
Write-Host "4/7  Copying deploy-essential files to staging..." -ForegroundColor Yellow

# Root config & entry files
$rootFiles = @(
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "tsconfig.node.json",
    "vite.config.ts",
    "vitest.config.ts",
    "eslint.config.js",
    "tailwind.config.js",
    "postcss.config.js",
    "Dockerfile",
    "azure.yaml",
    "azure-push-manifest.json",
    "sql-js.d.ts",
    "index.html",
    "server.ts",
    "README.md"
)

foreach ($f in $rootFiles) {
    $src = Join-Path $ProjectRoot $f
    if (Test-Path $src) {
        Copy-Item $src -Destination $StagingDir
        Write-Host "      + $f" -ForegroundColor Gray
    } else {
        Write-Host "      ~ $f (not found, skipped)" -ForegroundColor DarkYellow
    }
}

# Directories to include (with all contents)
$includeDirs = @(
    "src",
    "dist",
    "scripts",
    "tests",
    "data\squeal-reports"
)

foreach ($d in $includeDirs) {
    $src = Join-Path $ProjectRoot $d
    $dst = Join-Path $StagingDir $d
    if (Test-Path $src) {
        Copy-Item $src -Destination $dst -Recurse
        $count = (Get-ChildItem $dst -Recurse -File).Count
        Write-Host "      + $d/ ($count files)" -ForegroundColor Gray
    } else {
        Write-Host "      ~ $d/ (not found, skipped)" -ForegroundColor DarkYellow
    }
}

# Ensure data directory exists (for SQLite at runtime)
$dataDir = Join-Path $StagingDir "data"
if (-not (Test-Path $dataDir)) { New-Item -ItemType Directory -Path $dataDir | Out-Null }

# ---- Step 5: Install production dependencies in staging ----
Write-Host "5/7  Installing production dependencies (npm ci --omit=dev)..." -ForegroundColor Yellow
Push-Location $StagingDir
npm ci --omit=dev 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "      npm ci failed, falling back to npm install --omit=dev" -ForegroundColor DarkYellow
    npm install --omit=dev 2>&1 | Out-Null
}
Pop-Location

# ---- Step 6: Create the .zip archive ----
Write-Host "6/7  Compressing to $ArchiveName..." -ForegroundColor Yellow
$ArchivePath = Join-Path $ProjectRoot $ArchiveName
if (Test-Path $ArchivePath) { Remove-Item $ArchivePath -Force }
Compress-Archive -Path "$StagingDir\*" -DestinationPath $ArchivePath -CompressionLevel Optimal

$sizeMB = [math]::Round((Get-Item $ArchivePath).Length / 1MB, 2)

# ---- Step 7: Clean up staging ----
Write-Host "7/7  Cleaning up staging directory..." -ForegroundColor Yellow
Remove-Item $StagingDir -Recurse -Force

# ---- Done ----
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host " Archive Created Successfully" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host " File:  $ArchivePath" -ForegroundColor White
Write-Host " Size:  $sizeMB MB" -ForegroundColor White
Write-Host ""
Write-Host " Contents:" -ForegroundColor Cyan
Write-Host "   - Vite production build (dist/)" -ForegroundColor Gray
Write-Host "   - Express server (server.ts)" -ForegroundColor Gray
Write-Host "   - All source (src/)" -ForegroundColor Gray
Write-Host "   - All tests (tests/)" -ForegroundColor Gray
Write-Host "   - Deploy scripts (scripts/)" -ForegroundColor Gray
Write-Host "   - Dockerfile + azure.yaml" -ForegroundColor Gray
Write-Host "   - Production node_modules" -ForegroundColor Gray
Write-Host ""
Write-Host " To deploy from this archive:" -ForegroundColor Cyan
Write-Host "   1. Unzip to a clean directory" -ForegroundColor Gray
Write-Host "   2. docker build -t groknett-valueforge ." -ForegroundColor Gray
Write-Host "   3. docker run -p 8000:8000 groknett-valueforge" -ForegroundColor Gray
Write-Host "   -- or --" -ForegroundColor Gray
Write-Host "   2. azd up" -ForegroundColor Gray
Write-Host ""
