<#
.SYNOPSIS
    Standardised Sovereign Node 9010 v3.9.1 Environment Discovery v1.0
    Comprehensive, auditable, future-proof system state capture for DevSecOps compliance.

.DESCRIPTION
    Single-command discovery that inventories hardware, OS settings, WSL/Docker/Python/Git state,
    power configuration, MSI Center Pro status, registry keys, services, and security posture.
    Outputs:
      - Human-readable console report (color-coded current vs recommended)
      - Machine-readable JSON (timestamped) for CI/CD, drift detection, and automation
      - Optional Markdown report for audit logs

    Designed for repeatable, portable deployment across business environments.
    Run as Administrator for full accuracy.

.PARAMETER OutputPath
    Directory for JSON/Markdown output (default: current directory)

.PARAMETER IncludeBenchmarks
    Switch to run lightweight baseline tests (compile time, simple WSL command) - optional, non-intrusive

.EXAMPLE
    .\Discover-SystemState.ps1 -OutputPath "C:\SovereignNode\Discovery" -IncludeBenchmarks

.NOTES
    Version: 1.0.0
    Author: Grok-assisted Sovereign Node Toolkit
    Compatible with: Windows 11 Pro (build 22000+), MSI Prestige 16 Studio series
    Future-proof: JSON schema stable; extendable via $Discovery hashtable
#>

[CmdletBinding()]
param(
    [string]$OutputPath = ".",
    [switch]$IncludeBenchmarks
)

# Ensure output directory
if (-not (Test-Path $OutputPath)) { New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null }
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$JsonPath = Join-Path $OutputPath "SovereignNode_Discovery_$Timestamp.json"
$MdPath   = Join-Path $OutputPath "SovereignNode_Discovery_$Timestamp.md"

Write-Host "`n=== SOVEREIGN NODE 9010 v3.9.1 - STANDARDISED SYSTEM STATE DISCOVERY v1.0 ===" -ForegroundColor Cyan
Write-Host "Timestamp: $(Get-Date -Format o)" -ForegroundColor Gray
Write-Host "Computer: $env:COMPUTERNAME | User: $env:USERNAME`n" -ForegroundColor Gray

$Discovery = [ordered]@{
    Meta = @{
        ScriptVersion     = "1.0.0"
        Timestamp         = Get-Date -Format o
        ComputerName      = $env:COMPUTERNAME
        UserName          = $env:USERNAME
        PowerShellVersion = $PSVersionTable.PSVersion.ToString()
        OSBuild           = (Get-CimInstance Win32_OperatingSystem).BuildNumber
    }

    # === HARDWARE ===
    Hardware = @{
        CPU = Get-CimInstance Win32_Processor | Select-Object Name, NumberOfCores, NumberOfLogicalProcessors, MaxClockSpeed
        TotalRAM_GB = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 2)
        GPU_NVIDIA = Get-CimInstance Win32_VideoController | Where-Object { $_.Name -like "*NVIDIA*" } | Select-Object Name, AdapterRAM_GB, DriverVersion, @{N='Status';E={$_.Status}}
        GPU_Intel  = Get-CimInstance Win32_VideoController | Where-Object { $_.Name -like "*Intel*" } | Select-Object Name, DriverVersion
        Storage = Get-CimInstance Win32_DiskDrive | Select-Object Model, Size_GB, @{N='Interface';E={$_.InterfaceType}}
        Display = Get-CimInstance Win32_VideoController | Select-Object CurrentHorizontalResolution, CurrentVerticalResolution, CurrentRefreshRate
        PowerAdapter = "150W (20V 7.5A) - Verify physically connected for full performance"
    }

    # === OS & POWER CONFIGURATION ===
    OS_Power = @{
        WindowsEdition = (Get-CimInstance Win32_OperatingSystem).Caption
        PowerPlan_Active = (Get-CimInstance -Namespace root\cimv2\power -Class Win32_PowerPlan | Where-Object IsActive).ElementName
        BestPerformance_Recommended = "Best performance"
        FastStartup_Enabled = (Get-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Power" -Name HiberbootEnabled -ErrorAction SilentlyContinue).HiberbootEnabled -eq 1
        Hibernate_Enabled = (Get-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Power" -Name HibernateEnabled -ErrorAction SilentlyContinue).HibernateEnabled -eq 1
        LongPathsEnabled = (Get-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name LongPathsEnabled -ErrorAction SilentlyContinue).LongPathsEnabled -eq 1
        DeveloperMode = (Get-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock" -Name AllowDevelopmentWithoutDevLicense -ErrorAction SilentlyContinue).AllowDevelopmentWithoutDevLicense -eq 1
    }

    # === WSL & VIRTUALISATION ===
    WSL = @{
        DefaultVersion = (wsl --status 2>$null | Select-String "Default Version").ToString().Trim()
        InstalledDistros = wsl --list --verbose 2>$null | Out-String
        WSL2_MemoryLimit_GB = if (Test-Path "$env:USERPROFILE\.wslconfig") { (Get-Content "$env:USERPROFILE\.wslconfig" | Select-String "memory=" | ForEach-Object { ($_ -split "=")[1].Trim() }) } else { "Not configured" }
        WSL2_Processors = if (Test-Path "$env:USERPROFILE\.wslconfig") { (Get-Content "$env:USERPROFILE\.wslconfig" | Select-String "processors=" | ForEach-Object { ($_ -split "=")[1].Trim() }) } else { "Not configured" }
        DockerDesktop_Installed = (Get-AppxPackage *Docker* -ErrorAction SilentlyContinue) -ne $null
    }

    # === KEY SOFTWARE VERSIONS & SOURCES ===
    Software = @{
        Python = @{
            Version = (python --version 2>$null) -or "Not in PATH"
            Source  = if ((Get-Command python -ErrorAction SilentlyContinue).Source -like "*Microsoft*Store*") { "Microsoft Store (NOT RECOMMENDED)" } else { "Official / Custom" }
        }
        Git = @{
            Version = (git --version 2>$null)
            core_autocrlf = (git config --global core.autocrlf 2>$null)
            core_safecrlf = (git config --global core.safecrlf 2>$null)
        }
        MSI_Center_Pro = (Get-AppxPackage *MSI* -ErrorAction SilentlyContinue | Select-Object Name, Version)
        NVIDIA_Driver = (Get-CimInstance Win32_VideoController | Where-Object Name -like "*NVIDIA*").DriverVersion
    }

    # === SECURITY & TELEMETRY (Audit Critical) ===
    Security_Telemetry = @{
        SecureBoot = (Confirm-SecureBootUEFI -ErrorAction SilentlyContinue)
        TPM_Enabled = (Get-Tpm).TpmReady
        BitLocker_C_Drive = (Get-BitLockerVolume -MountPoint "C:" -ErrorAction SilentlyContinue).ProtectionStatus
        AllowTelemetry = (Get-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection" -Name AllowTelemetry -ErrorAction SilentlyContinue).AllowTelemetry
        DiagTrack_Service = (Get-Service DiagTrack -ErrorAction SilentlyContinue).Status
        SearchOrderConfig = (Get-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DriverSearching" -Name SearchOrderConfig -ErrorAction SilentlyContinue).SearchOrderConfig
    }

    # === MSI CENTER PRO STATUS ===
    MSI_Center = @{
        PerformanceOptimizer_Mode = "Check manually in MSI Center Pro → Performance Optimizer (High Performance recommended when plugged in)"
        FanProfile = "Auto / Advanced / Cooler Boost recommended for sustained loads"
    }

    # === RECOMMENDED TARGETS (for drift detection) ===
    Recommended = @{
        PowerPlan = "Best performance"
        FastStartup = $false
        LongPaths = $true
        DeveloperMode = $true
        WSL_DefaultVersion = 2
        WSL_Memory = "16GB"
        WSL_Processors = 8
        Git_autocrlf = "true"
        Telemetry = 0
        DiagTrack = "Disabled"
    }
}

# Lightweight optional benchmarks (non-intrusive)
if ($IncludeBenchmarks) {
    Write-Host "`n[INFO] Running lightweight baseline benchmarks..." -ForegroundColor Yellow
    $Discovery.Benchmarks = @{
        Python_CompileTime_ms = try {
            $sw = [System.Diagnostics.Stopwatch]::StartNew()
            python -m py_compile -q "$env:TEMP\test_compile.py" 2>$null
            $sw.Stop()
            $sw.ElapsedMilliseconds
        } catch { "N/A" }
        WSL_Echo_Time_ms = try {
            $sw = [System.Diagnostics.Stopwatch]::StartNew()
            wsl echo "benchmark" | Out-Null
            $sw.Stop()
            $sw.ElapsedMilliseconds
        } catch { "N/A" }
    }
}

# Output JSON (machine-readable, future-proof for automation)
$Discovery | ConvertTo-Json -Depth 6 | Out-File $JsonPath -Encoding UTF8
Write-Host "`n[OK] JSON report saved: $JsonPath" -ForegroundColor Green

# Human-readable console summary with color coding
Write-Host "`n--- CURRENT vs RECOMMENDED (Key Items) ---" -ForegroundColor Cyan
$checks = @(
    @{Name="Power Plan"; Current=$Discovery.OS_Power.PowerPlan_Active; Target=$Discovery.Recommended.PowerPlan; Good=($Discovery.OS_Power.PowerPlan_Active -eq "Best performance")}
    @{Name="Fast Startup"; Current=$Discovery.OS_Power.FastStartup_Enabled; Target=$false; Good=(-not $Discovery.OS_Power.FastStartup_Enabled)}
    @{Name="Long Paths Enabled"; Current=$Discovery.OS_Power.LongPathsEnabled; Target=$true; Good=$Discovery.OS_Power.LongPathsEnabled}
    @{Name="Developer Mode"; Current=$Discovery.OS_Power.DeveloperMode; Target=$true; Good=$Discovery.OS_Power.DeveloperMode}
    @{Name="WSL Default Version"; Current=$Discovery.WSL.DefaultVersion; Target="2"; Good=($Discovery.WSL.DefaultVersion -match "2")}
    @{Name="WSL .wslconfig Memory"; Current=$Discovery.WSL.WSL2_MemoryLimit_GB; Target="16GB"; Good=($Discovery.WSL.WSL2_MemoryLimit_GB -eq "16GB")}
    @{Name="Telemetry (AllowTelemetry)"; Current=$Discovery.Security_Telemetry.AllowTelemetry; Target=0; Good=($Discovery.Security_Telemetry.AllowTelemetry -eq 0)}
)

foreach ($c in $checks) {
    $color = if ($c.Good) { "Green" } else { "Red" }
    Write-Host ("{0,-25} Current: {1,-20} Target: {2,-10}" -f $c.Name, $c.Current, $c.Target) -ForegroundColor $color
}

Write-Host "`n[INFO] Full detailed report (Markdown) saved to: $MdPath" -ForegroundColor Gray
Write-Host "Run this script regularly or before/after changes for full audit trail.`n" -ForegroundColor Cyan

# Generate simple Markdown summary
$MdContent = @"
# Sovereign Node 9010 v3.9.1 - System State Discovery Report
**Generated:** $(Get-Date -Format o)  
**Computer:** $env:COMPUTERNAME  
**Script Version:** 1.0.0

## Hardware Summary
- **CPU:** $($Discovery.Hardware.CPU.Name) ($($Discovery.Hardware.CPU.NumberOfLogicalProcessors) logical cores)
- **RAM:** $($Discovery.Hardware.TotalRAM_GB) GB
- **Primary GPU:** $($Discovery.Hardware.GPU_NVIDIA.Name) (Driver $($Discovery.Hardware.GPU_NVIDIA.DriverVersion))

## Critical Configuration Status
| Setting                  | Current Value          | Recommended     | Status    |
|--------------------------|------------------------|-----------------|-----------|
| Power Plan               | $($Discovery.OS_Power.PowerPlan_Active) | Best performance | $(if ($Discovery.OS_Power.PowerPlan_Active -eq "Best performance") {"✅"} else {"❌"}) |
| Fast Startup             | $($Discovery.OS_Power.FastStartup_Enabled) | Disabled        | $(if (-not $Discovery.OS_Power.FastStartup_Enabled) {"✅"} else {"❌"}) |
| Long Paths               | $($Discovery.OS_Power.LongPathsEnabled) | Enabled         | $(if ($Discovery.OS_Power.LongPathsEnabled) {"✅"} else {"❌"}) |
| WSL Default Version      | $($Discovery.WSL.DefaultVersion) | 2               | $(if ($Discovery.WSL.DefaultVersion -match "2") {"✅"} else {"❌"}) |
| .wslconfig Memory        | $($Discovery.WSL.WSL2_MemoryLimit_GB) | 16GB            | $(if ($Discovery.WSL.WSL2_MemoryLimit_GB -eq "16GB") {"✅"} else {"❌"}) |
| Telemetry (AllowTelemetry)| $($Discovery.Security_Telemetry.AllowTelemetry) | 0               | $(if ($Discovery.Security_Telemetry.AllowTelemetry -eq 0) {"✅"} else {"❌"}) |

## Next Steps
1. Review any ❌ items above.
2. Run the companion Apply-DevEnvConfig.ps1 script to remediate.
3. Re-run this discovery after changes for audit compliance.
4. Store JSON in version control or SIEM for drift detection.

**Full JSON data:** See $JsonPath
"@
$MdContent | Out-File $MdPath -Encoding UTF8

Write-Host "Discovery complete. Use the JSON for automation and the Markdown for human audit logs." -ForegroundColor Green
