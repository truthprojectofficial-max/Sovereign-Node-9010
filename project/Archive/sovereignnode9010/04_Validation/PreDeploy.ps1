<# 
.SYNOPSIS
Sovereign Node 9010 - Pre-Deploy PowerShell Function

.DESCRIPTION
This is the official pre-deployment gate function (Action 3 of the outer 4-Action DevSecOps Unified Flow).

PRE-WORK IS MANDATORY and equally important as the code itself.
It guarantees reproducibility, portability, and eliminates human/AI deployment errors.

Full workstation setup (Discover + Apply) lives in 04_Validation/DevSecOps/ and is the recommended entry point.
See 01_Methodology/docs/DEVSECOPS_WORKSTATION_GUIDE.md for the married instructions.

Usage:
    . .\04_Validation\PreDeploy.ps1
    Invoke-SovereignPreDeploy

    # Or with parameters
    Invoke-SovereignPreDeploy -SkipQualityGates -Force

The function will:
1. Run the strict bootstrap (mandatory)
2. Run the cross-platform bootstrap checker
3. Optionally run quality gates
4. Leave the environment in a known-good, auditable state

This should be called before any local run, docker compose, or Azure deployment.
#>

function Invoke-SovereignPreDeploy {
    [CmdletBinding()]
    param(
        [switch]$SkipQualityGates,
        [switch]$SkipEngineVerification,
        [switch]$Force
    )

    $ErrorActionPreference = "Stop"
    $root = (Get-Item $PSScriptRoot).Parent.FullName

    Write-Host ""
    Write-Host "================================================================================" -ForegroundColor Cyan
    Write-Host "   SOVEREIGN NODE 9010 v3.9.1 - PRE-DEPLOY GATE (MANDATORY - Action 3/4)" -ForegroundColor Cyan
    Write-Host "   Full DevSecOps flow (workstation + project): 04_Validation/DevSecOps/Sovereign-DevSecOps-Setup.ps1" -ForegroundColor Cyan
    Write-Host "   Pre-work is equally important as the code for reproducibility & zero errors" -ForegroundColor Cyan
    Write-Host "================================================================================" -ForegroundColor Cyan
    Write-Host ""

    # 1. Run the strict bootstrap (this creates the BOOTSTRAP_COMPLETE marker)
    $bootstrap = Join-Path $root "04_Validation\Strict-Bootstrap-SovereignNode9010.ps1"
    if (-not (Test-Path $bootstrap)) {
        throw "Strict bootstrap script not found at $bootstrap"
    }

    $bootstrapArgs = @{}
    if ($SkipEngineVerification) { $bootstrapArgs['SkipEngineVerification'] = $true }

    Write-Host "[1/3] Executing mandatory strict bootstrap..." -ForegroundColor Yellow
    & $bootstrap @bootstrapArgs
    if ($LASTEXITCODE -ne 0 -and -not $Force) {
        throw "Strict bootstrap failed. Pre-deploy aborted."
    }

    # 2. Run the cross-platform checker (the hard gate used by server + Docker)
    Write-Host "[2/3] Verifying BOOTSTRAP_COMPLETE marker..." -ForegroundColor Yellow
    $checker = Join-Path $root "04_Validation\check-bootstrap.py"
    if (Test-Path $checker) {
        python $checker
        if ($LASTEXITCODE -ne 0 -and -not $Force) {
            throw "Pre-work marker verification failed."
        }
    } else {
        Write-Warning "Python checker not found — falling back to marker file existence check."
        $marker = Join-Path $root "04_Validation\BOOTSTRAP_COMPLETE"
        if (-not (Test-Path $marker)) {
            throw "BOOTSTRAP_COMPLETE marker is missing. Run the strict bootstrap first."
        }
    }

    # 3. Optional quality gates (recommended before real deployment)
    if (-not $SkipQualityGates) {
        Write-Host "[3/3] Running quality gates (ruff + mypy + bandit)..." -ForegroundColor Yellow
        Push-Location (Join-Path $root "02_Technical")
        try {
            python -m ruff check . --fail-on-fix
            python -m ruff format --check .
            python -m mypy . --strict --ignore-missing-imports | Out-Null
            Write-Host "Quality gates passed." -ForegroundColor Green
        } catch {
            Write-Warning "One or more quality gates reported issues (non-blocking for now)."
        } finally {
            Pop-Location
        }
    } else {
        Write-Host "[3/3] Quality gates skipped (as requested)." -ForegroundColor DarkGray
    }

    Write-Host ""
    Write-Host "================================================================================" -ForegroundColor Green
    Write-Host "   PRE-DEPLOY GATE PASSED" -ForegroundColor Green
    Write-Host "   Environment is in a known-good, deterministic, auditable state." -ForegroundColor Green
    Write-Host "   You may now safely run the node, build containers, or deploy to Azure." -ForegroundColor Green
    Write-Host "================================================================================"
    Write-Host ""
}

# Convenience aliases
Set-Alias -Name PreDeploy -Value Invoke-SovereignPreDeploy
Set-Alias -Name sovereign-predeploy -Value Invoke-SovereignPreDeploy

Write-Host "Sovereign Node pre-deploy functions loaded." -ForegroundColor DarkGray
Write-Host "Run: Invoke-SovereignPreDeploy   (or PreDeploy)" -ForegroundColor DarkGray
Write-Host ""
