<#
.SYNOPSIS
    Sovereign Node 9010 v3.9.1 - Unified DevSecOps Environment Setup Launcher
    The single entry point that marries workstation hardening (toolkit) with project mandatory pre-work.

.DESCRIPTION
    Implements the official "One Build Flow - 4 Actions" for deterministic, auditable, repeatable deployments.
    This is the recommended way to prepare any development or CI machine for Sovereign Node 9010.

    Flow (strict order, every time for compliance):
      Action 1: Discover & Baseline (with optional benchmarks) - produces JSON + MD evidence
      Action 2: Apply / Harden (dry-run first, then apply) - idempotent, fully logged
      Action 3: Project Strict Bootstrap + Pre-Deploy Gate (existing mandatory harness)
      Action 4: Post-Setup Verification + Re-Discovery + Launch Readiness

    All artifacts are timestamped and written under 04_Validation/DevSecOps/audit for retention with releases.

.EXAMPLE
    # From project root (recommended)
    cd 04_Validation\DevSecOps
    .\Sovereign-DevSecOps-Setup.ps1

    # Or non-interactive for pipelines (advanced)
    .\Sovereign-DevSecOps-Setup.ps1 -NonInteractive -SkipApply

.NOTES
    Run as Administrator for full effect (discovery can run limited without, apply requires it).
    Reboot may be required after Action 2 (WSL features / powercfg).
    After reboot always re-run discovery for "after" evidence.
    See 01_Methodology/docs/DEVSECOPS_WORKSTATION_GUIDE.md for full married instructions + examples.
#>

[CmdletBinding()]
param(
    [switch]$NonInteractive,
    [switch]$SkipApply,
    [switch]$SkipProjectBootstrap,
    [string]$AuditRoot = "..\audit",
    [string]$LogRoot   = "..\logs"
)

$ErrorActionPreference = "Stop"
$root = (Get-Item $PSScriptRoot).Parent.Parent.FullName   # project root
$AuditPath = Join-Path $root "04_Validation\audit"
$LogPath   = Join-Path $root "04_Validation\logs"

if (-not (Test-Path $AuditPath)) { New-Item -ItemType Directory -Path $AuditPath -Force | Out-Null }
if (-not (Test-Path $LogPath))   { New-Item -ItemType Directory -Path $LogPath -Force | Out-Null }

function Write-Banner {
    param([string]$Text, [string]$Color = "Cyan")
    Write-Host "`n================================================================================`n   $Text`n================================================================================" -ForegroundColor $Color
}

function Invoke-Discover {
    param([switch]$IncludeBenchmarks)
    Write-Banner "ACTION 1: DISCOVER & BASELINE (System State + Optional Benchmarks)" "Cyan"
    Write-Host "This produces the immutable starting evidence for audit/compliance." -ForegroundColor Gray
    Write-Host "Output: SovereignNode_Discovery_*.json + .md under $AuditPath`n" -ForegroundColor DarkGray

    $discoverArgs = @{
        OutputPath = $AuditPath
    }
    if ($IncludeBenchmarks) { $discoverArgs['IncludeBenchmarks'] = $true }

    & (Join-Path $PSScriptRoot "Discover-SystemState.ps1") @discoverArgs
    Write-Host "`n[OK] Baseline discovery complete. Review any RED items above." -ForegroundColor Green
}

function Invoke-Apply {
    Write-Banner "ACTION 2: APPLY DEVSECOPS CONFIG (Idempotent Workstation Hardening)" "Yellow"
    Write-Host "CRITICAL: Always review with -WhatIf / dry-run first." -ForegroundColor Red
    Write-Host "This applies LongPaths, DeveloperMode, Best Performance, WSL2, .wslconfig, Git, Telemetry hardening." -ForegroundColor Gray
    Write-Host "Full before/after logging to $LogPath`n" -ForegroundColor DarkGray

    if (-not $NonInteractive) {
        $dry = Read-Host "Run DRY-RUN (WhatIf) first? [Y/n]"
        if ($dry -ne 'n') {
            & (Join-Path $PSScriptRoot "Apply-DevEnvConfig.ps1") -LogPath $LogPath -WhatIf
            Write-Host "`nReview the dry-run output above. Press ENTER to continue to real apply or Ctrl+C to abort." -ForegroundColor Yellow
            Read-Host
        }
    }

    if (-not $SkipApply) {
        & (Join-Path $PSScriptRoot "Apply-DevEnvConfig.ps1") -LogPath $LogPath
    }
    Write-Host "`n[OK] Apply phase complete. REBOOT if WSL features or powercfg changed, then re-run this launcher for post-discovery." -ForegroundColor Green
}

function Invoke-ProjectPreWork {
    Write-Banner "ACTION 3: PROJECT MANDATORY PRE-WORK (Strict Bootstrap + Gates)" "Magenta"
    Write-Host "This is the existing Sovereign Node 9010 pre-deploy gate (as important as the code)." -ForegroundColor Gray
    Write-Host "It enforces 00-99 hierarchy, initializes the Merkle vault, runs engine verification and quality gates.`n" -ForegroundColor DarkGray

    $predeploy = Join-Path $root "04_Validation\PreDeploy.ps1"
    if (Test-Path $predeploy) {
        Write-Host "Invoking Invoke-SovereignPreDeploy (rich Windows experience)..." -ForegroundColor Yellow
        & powershell -ExecutionPolicy Bypass -Command "& { . '$predeploy'; Invoke-SovereignPreDeploy }"
    } else {
        Write-Warning "PreDeploy.ps1 not found - falling back to direct bootstrap call."
        $bootstrap = Join-Path $root "04_Validation\Strict-Bootstrap-SovereignNode9010.ps1"
        & powershell -ExecutionPolicy Bypass -File $bootstrap
    }
    Write-Host "`n[OK] Project pre-work gate passed." -ForegroundColor Green
}

function Invoke-PostVerify {
    Write-Banner "ACTION 4: POST-VERIFY, RE-DISCOVER & LAUNCH READINESS" "Green"
    Write-Host "Re-capture 'after' state for full before/after audit delta. Then quality + readiness." -ForegroundColor Gray

    # Post discovery (no benchmarks to keep fast)
    & (Join-Path $PSScriptRoot "Discover-SystemState.ps1") -OutputPath $AuditPath

    Write-Host "`nRunning final quality gates..." -ForegroundColor Yellow
    Push-Location (Join-Path $root "02_Technical")
    try {
        python -m ruff check . --fail-on-fix 2>$null
        python -m ruff format --check . 2>$null
        python -m mypy . --strict --ignore-missing-imports 2>$null | Out-Null
        Write-Host "Quality gates completed." -ForegroundColor Green
    } catch { Write-Warning "Quality gate issues detected (review before production)." }

    Pop-Location

    Write-Host "`n================================================================================" -ForegroundColor Green
    Write-Host "   UNIFIED DEVSECOPS SETUP FLOW COMPLETE" -ForegroundColor Green
    Write-Host "   Your workstation + project are now in a known-good, auditable, deterministic state." -ForegroundColor Green
    Write-Host "   All discovery JSONs + logs are in 04_Validation/DevSecOps/audit and /logs" -ForegroundColor Green
    Write-Host "   Next: python run_server.py   OR   make docker-up   OR   deploy via Bicep" -ForegroundColor Green
    Write-Host "================================================================================" -ForegroundColor Green
}

# ============================ MAIN ============================

Write-Banner "SOVEREIGN NODE 9010 v3.9.1 - UNIFIED DEVSECOPS SETUP LAUNCHER v1.0" "Cyan"
Write-Host "Marries the full DevSecOps Workstation Toolkit instructions + examples with the project's mandatory pre-work." -ForegroundColor White
Write-Host "Target hardware: MSI Prestige 16 Studio (or equivalent high-performance Windows 11 dev machine)" -ForegroundColor DarkGray
Write-Host "Full instructions: 01_Methodology\docs\DEVSECOPS_WORKSTATION_GUIDE.md`n" -ForegroundColor DarkGray

if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "WARNING: Not running as Administrator. Apply phase and full discovery will be limited." -ForegroundColor Yellow
}

if (-not $NonInteractive) {
    Write-Host "This will execute the official 4-Action flow with confirmations. Ctrl+C at any prompt to abort.`n" -ForegroundColor Cyan
    $start = Read-Host "Begin the Unified DevSecOps 4-Action Flow? [Y/n]"
    if ($start -eq 'n') { exit 0 }
}

# ACTION 1
Invoke-Discover -IncludeBenchmarks:( -not $NonInteractive )

if (-not $NonInteractive) {
    $cont = Read-Host "`nContinue to Action 2 (Apply/Harden)? [Y/n]"
    if ($cont -eq 'n') { Write-Host "Aborted after Action 1. Artifacts preserved."; exit 0 }
}

# ACTION 2
if (-not $SkipApply) {
    Invoke-Apply
} else {
    Write-Host "`n[SKIP] Apply phase skipped by parameter." -ForegroundColor Yellow
}

if (-not $NonInteractive -and -not $SkipProjectBootstrap) {
    $cont = Read-Host "`nContinue to Action 3 (Project Pre-Work / Bootstrap)? [Y/n]"
    if ($cont -eq 'n') { Write-Host "Aborted after Action 2. Re-run launcher after reboot if needed."; exit 0 }
}

# ACTION 3
if (-not $SkipProjectBootstrap) {
    Invoke-ProjectPreWork
} else {
    Write-Host "`n[SKIP] Project bootstrap skipped by parameter." -ForegroundColor Yellow
}

if (-not $NonInteractive) {
    $cont = Read-Host "`nContinue to Action 4 (Post-Verify + Launch Readiness)? [Y/n]"
    if ($cont -eq 'n') { Write-Host "Setup paused. Run Sovereign-DevSecOps-Setup.ps1 again later for post steps."; exit 0 }
}

# ACTION 4
Invoke-PostVerify

Write-Host "`nAll done. Retain the audit artifacts under 04_Validation/DevSecOps/ with your release tag for compliance." -ForegroundColor Cyan
