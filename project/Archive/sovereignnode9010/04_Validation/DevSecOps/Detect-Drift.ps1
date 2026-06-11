<#
.SYNOPSIS
    Sovereign Node 9010 - Thin wrapper to invoke Inside-TAU DevSecOps Drift Detector.

.DESCRIPTION
    Calls the Python devsecops_drift_detector (which lives inside the Tau engine).
    Every drift statement is processed by Deception Scanner + BBFB + Tau gate + Merkle seal.

    AUTOMATIC AFFIDAVIT ON CRITICAL DRIFT (Human Error Prevention - default enabled):
    When CRITICAL drift is detected (PowerPlan, Telemetry, WSL allocation, DiagTrack, etc.)
    or the Tau gate returns DEFER, a full Section 177 legal affidavit is automatically
    generated at the exact moment of detection. The specific triggering fact_uuid is
    embedded in the affidavit addendum.

    "Failure is the saving grace": The script exits with code 1 on critical drift/affidavit
    so Azure Pipelines (and any calling CI) treats it as a hard failure by default.

    This is the CI / audit-friendly entry point on Windows.

.EXAMPLE
    .\Detect-Drift.ps1 -Discovery "..\audit\SovereignNode_Discovery_20260530-....json"
    .\Detect-Drift.ps1   # auto-picks latest discovery
#>

[CmdletBinding()]
param(
    [string]$Discovery,
    [switch]$NoSubmit   # only compute, do not submit to engine (for testing)
)

$ErrorActionPreference = "Stop"
$root = (Get-Item $PSScriptRoot).Parent.Parent.FullName
$python = "python"

$argsList = @()
if ($Discovery) { $argsList += @("--discovery", $Discovery) }
if ($NoSubmit)  { $argsList += "--no-submit" }

Write-Host "`n=== SOVEREIGN NODE 9010 - INSIDE-TAU DEVSECOPS DRIFT DETECTION ===" -ForegroundColor Cyan
Write-Host "All drift facts are evaluated by the deterministic Tau-gated engine (no black box)." -ForegroundColor Gray

& $python -m devsecops_drift_detector @argsList

Write-Host "`nDrift detection complete. Results (including any DEFER / affidavit triggers) are sealed in the Merkle ledger." -ForegroundColor Green
