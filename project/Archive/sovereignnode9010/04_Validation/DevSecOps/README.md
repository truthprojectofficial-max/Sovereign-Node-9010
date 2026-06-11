# Sovereign Node 9010 - DevSecOps Workstation Toolkit (Integrated)

This directory contains the production-grade, idempotent PowerShell tooling for establishing a **deterministic, auditable, high-performance development workstation** tailored to the Sovereign Node 9010 v3.9.1 project (MSI Prestige 16 Studio class hardware recommended).

## Core Scripts

- **Discover-SystemState.ps1** — Single-command comprehensive discovery. Produces:
  - Color-coded console report (current vs recommended)
  - Timestamped JSON (machine-readable, for CI/CD, drift detection, SIEM)
  - Markdown audit report
  - Optional lightweight benchmarks (`-IncludeBenchmarks`)

- **Apply-DevEnvConfig.ps1** — Idempotent, fully logged applicator (supports `-WhatIf` dry-run).
  Covers: Long Paths, Developer Mode, Fast Startup/Hibernate disable, Best Performance power plan, WSL 2 features + defaults, recommended `.wslconfig`, Git line endings, telemetry hardening (AllowTelemetry=0, DiagTrack disabled).

- **config_resources.json** — Reference profile for in-program resource awareness (WSL caps, GPU policy, baseline mode). Loadable by the Python engines for self-reported deterministic configuration.

## Recommended Usage (see parent project docs)

Always follow the **4-Action Unified DevSecOps Build Flow** documented in:

`01_Methodology/docs/DEVSECOPS_WORKSTATION_GUIDE.md`

Typical (from project root):

```powershell
# Action 1 - Baseline (before changes)
cd 04_Validation\DevSecOps
.\Discover-SystemState.ps1 -OutputPath "..\audit" -IncludeBenchmarks

# Action 2 - Dry-run then apply (run as Administrator)
.\Apply-DevEnvConfig.ps1 -LogPath "..\logs" -WhatIf
.\Apply-DevEnvConfig.ps1 -LogPath "..\logs"

# (Reboot if WSL/power changes were applied, then re-discover for "after" evidence)

# Action 3 - Project mandatory pre-work
make pre-deploy-ps   # or: . ..\PreDeploy.ps1 ; Invoke-SovereignPreDeploy

# Action 4 - Post-verify + launch
```

All outputs (JSON, logs, MD) should be retained with release tags for full compliance/audit trail (ANAO, Section 177, DevSecOps repeatability).

## Philosophy

- **Pre-work is not optional** — the workstation environment is part of the deterministic contract.
- Everything is logged, idempotent, and future-proof (stable JSON schema).
- No black box: every change has before/after evidence.
- Portable across business deployments.

See the full married instructions + examples in the Workstation Guide.
