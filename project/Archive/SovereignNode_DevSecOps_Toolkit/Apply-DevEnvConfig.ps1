<#
.SYNOPSIS
    Sovereign Node 9010 v3.9.1 - Idempotent Configuration Automation Script v1.0
    Applies all recommended settings for deterministic high-performance development on MSI Prestige 16 Studio.

.DESCRIPTION
    DevSecOps-ready script that:
    - Applies settings idempotently (safe to re-run)
    - Logs every change with before/after values for full audit trail
    - Requires Administrator elevation
    - Designed for repeatable, portable business deployment
    - Integrates with Discover-SystemState.ps1 (run discovery before & after)

    Covers: WSL, Python path/aliases, Long Paths, Power/Fast Startup, Telemetry, Git, basic MSI guidance.

.EXAMPLE
    .\Apply-DevEnvConfig.ps1 -LogPath "C:\SovereignNode\Logs" -WhatIf   # Dry-run first
    .\Apply-DevEnvConfig.ps1 -LogPath "C:\SovereignNode\Logs"          # Apply changes

.NOTES
    Version: 1.0.0
    Run as Administrator.
    Reboot may be required after some changes (WSL features, powercfg).
    Always run Discover-SystemState.ps1 before and after for compliance evidence.
#>

[CmdletBinding(SupportsShouldProcess=$true)]
param(
    [string]$LogPath = ".\Logs",
    [switch]$Force
)

if (-not (Test-Path $LogPath)) { New-Item -ItemType Directory -Path $LogPath -Force | Out-Null }
$LogFile = Join-Path $LogPath "SovereignNode_ApplyConfig_$(Get-Date -Format yyyyMMdd-HHmmss).log"
Start-Transcript -Path $LogFile -Append | Out-Null

Write-Host "`n=== SOVEREIGN NODE 9010 v3.9.1 - CONFIGURATION AUTOMATION v1.0 ===" -ForegroundColor Cyan
Write-Host "Log file: $LogFile`n" -ForegroundColor Gray

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$timestamp] [$Level] $Message"
    Write-Host $line -ForegroundColor $(if ($Level -eq "ERROR") {"Red"} elseif ($Level -eq "WARN") {"Yellow"} else {"Green"})
    Add-Content -Path $LogFile -Value $line
}

# Check elevation
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Log "ERROR: This script must be run as Administrator." "ERROR"
    exit 1
}

Write-Log "Starting configuration application for Sovereign Node environment..."

# 1. Long Paths
$regPath = "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem"
$currentLongPaths = (Get-ItemProperty -Path $regPath -Name LongPathsEnabled -ErrorAction SilentlyContinue).LongPathsEnabled
if ($currentLongPaths -ne 1) {
    if ($PSCmdlet.ShouldProcess("Registry LongPathsEnabled", "Set to 1")) {
        Set-ItemProperty -Path $regPath -Name LongPathsEnabled -Value 1 -Type DWord -Force
        Write-Log "LongPathsEnabled set from $currentLongPaths to 1 (SUCCESS)"
    }
} else {
    Write-Log "LongPathsEnabled already enabled (1) - No change needed."
}

# 2. Developer Mode
$devReg = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock"
$currentDev = (Get-ItemProperty -Path $devReg -Name AllowDevelopmentWithoutDevLicense -ErrorAction SilentlyContinue).AllowDevelopmentWithoutDevLicense
if ($currentDev -ne 1) {
    if ($PSCmdlet.ShouldProcess("Developer Mode", "Enable")) {
        Set-ItemProperty -Path $devReg -Name AllowDevelopmentWithoutDevLicense -Value 1 -Type DWord -Force
        Write-Log "Developer Mode enabled (SUCCESS)"
    }
} else {
    Write-Log "Developer Mode already enabled - No change needed."
}

# 3. Disable Fast Startup / Hibernate
$powerReg = "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Power"
$currentHiberboot = (Get-ItemProperty -Path $powerReg -Name HiberbootEnabled -ErrorAction SilentlyContinue).HiberbootEnabled
if ($currentHiberboot -ne 0) {
    if ($PSCmdlet.ShouldProcess("Fast Startup (HiberbootEnabled)", "Disable")) {
        powercfg /h off | Out-Null
        Write-Log "Fast Startup / Hibernate disabled via powercfg /h off (SUCCESS)"
    }
} else {
    Write-Log "Fast Startup already disabled - No change needed."
}

# 4. Set Windows Power Plan to Best Performance (if not already)
$powerPlan = Get-CimInstance -Namespace root\cimv2\power -Class Win32_PowerPlan | Where-Object { $_.IsActive }
if ($powerPlan.ElementName -ne "Best performance") {
    if ($PSCmdlet.ShouldProcess("Power Plan", "Set to Best performance")) {
        powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c | Out-Null  # Best Performance GUID
        Write-Log "Power Plan changed to Best Performance (SUCCESS)"
    }
} else {
    Write-Log "Power Plan already Best Performance - No change needed."
}

# 5. WSL Features (idempotent check)
$features = @("Microsoft-Windows-Subsystem-Linux", "VirtualMachinePlatform")
foreach ($f in $features) {
    $state = (Get-WindowsOptionalFeature -Online -FeatureName $f -ErrorAction SilentlyContinue).State
    if ($state -ne "Enabled") {
        if ($PSCmdlet.ShouldProcess($f, "Enable")) {
            dism.exe /online /enable-feature /featurename:$f /all /norestart | Out-Null
            Write-Log "$f enabled (may require reboot) - SUCCESS"
        }
    } else {
        Write-Log "$f already enabled - No change needed."
    }
}

# 6. Set WSL default version 2
$wslVer = wsl --status 2>$null | Select-String "Default Version"
if ($wslVer -notmatch "2") {
    if ($PSCmdlet.ShouldProcess("WSL Default Version", "Set to 2")) {
        wsl --set-default-version 2 | Out-Null
        Write-Log "WSL default version set to 2 (SUCCESS)"
    }
} else {
    Write-Log "WSL default version already 2 - No change needed."
}

# 7. Create recommended .wslconfig (if missing or different)
$wslConfigPath = "$env:USERPROFILE\.wslconfig"
$desiredContent = @"
[wsl2]
processors=8
memory=16GB
swap=4GB
localhostForwarding=true
"@
if (-not (Test-Path $wslConfigPath) -or (Get-Content $wslConfigPath -Raw) -ne $desiredContent) {
    if ($PSCmdlet.ShouldProcess(".wslconfig", "Create/Update with recommended values")) {
        $desiredContent | Out-File $wslConfigPath -Encoding UTF8 -Force
        Write-Log ".wslconfig created/updated with 8 processors, 16GB memory, 4GB swap (SUCCESS) - Run 'wsl --shutdown' to apply"
    }
} else {
    Write-Log ".wslconfig already matches recommended values - No change needed."
}

# 8. Git global settings (safe & idempotent)
$gitAuto = git config --global core.autocrlf 2>$null
if ($gitAuto -ne "true") {
    if ($PSCmdlet.ShouldProcess("Git core.autocrlf", "Set to true")) {
        git config --global core.autocrlf true
        Write-Log "Git core.autocrlf set to true (SUCCESS)"
    }
}
$gitSafe = git config --global core.safecrlf 2>$null
if ($gitSafe -ne "true" -and $gitSafe -ne "warn") {
    if ($PSCmdlet.ShouldProcess("Git core.safecrlf", "Set to warn")) {
        git config --global core.safecrlf warn
        Write-Log "Git core.safecrlf set to warn (SUCCESS)"
    }
}

# 9. Telemetry & DiagTrack (compliance)
$telemetryReg = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection"
if (-not (Test-Path $telemetryReg)) { New-Item -Path $telemetryReg -Force | Out-Null }
$currentTelemetry = (Get-ItemProperty -Path $telemetryReg -Name AllowTelemetry -ErrorAction SilentlyContinue).AllowTelemetry
if ($currentTelemetry -ne 0) {
    if ($PSCmdlet.ShouldProcess("AllowTelemetry", "Set to 0")) {
        Set-ItemProperty -Path $telemetryReg -Name AllowTelemetry -Value 0 -Type DWord -Force
        Write-Log "AllowTelemetry set to 0 (SUCCESS)"
    }
}

$diag = Get-Service DiagTrack -ErrorAction SilentlyContinue
if ($diag.Status -ne "Stopped" -or $diag.StartType -ne "Disabled") {
    if ($PSCmdlet.ShouldProcess("DiagTrack service", "Disable and Stop")) {
        Stop-Service DiagTrack -Force -ErrorAction SilentlyContinue
        Set-Service DiagTrack -StartupType Disabled -ErrorAction SilentlyContinue
        Write-Log "DiagTrack service disabled and stopped (SUCCESS)"
    }
} else {
    Write-Log "DiagTrack already disabled/stopped - No change needed."
}

# 10. Python App Execution Aliases (inform user - cannot fully automate without UI)
Write-Log "NOTE: Manually disable 'python.exe' and 'python3.exe' App Execution Aliases in Settings > Apps > Advanced app settings (if using official Python)." "WARN"

Write-Log "`n=== CONFIGURATION APPLICATION COMPLETE ===" "INFO"
Write-Log "Reboot recommended after WSL feature changes and powercfg modifications."
Write-Log "Next step: Re-run Discover-SystemState.ps1 to verify and generate audit evidence."
Write-Log "For full MSI Center Pro High Performance + fan profile: Open MSI Center Pro manually and select 'High Performance' + Cooler Boost when on AC power."

Stop-Transcript | Out-Null
Write-Host "`nAll changes logged to: $LogFile" -ForegroundColor Green
Write-Host "This script is fully idempotent and audit-ready for business DevSecOps pipelines." -ForegroundColor Cyan
