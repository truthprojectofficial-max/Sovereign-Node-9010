# Sovereign Node 9010 v3.9.1 — DevSecOps Workstation Guide & Unified Build Flow

**Version:** 3.9.1 (Integrated)  
**Last Updated:** 30 May 2026  
**Hardware Focus:** MSI Prestige 16 Studio 13VF-209AU (i7-13700H, 32 GB LPDDR5-4800, RTX 4060 8 GB, 150 W adapter, 165 Hz Mini-LED)  
**Purpose:** Deterministic, auditable, repeatable high-performance development environment for high-assurance Sovereign Node deployments.

> **PRE-WORK IS MANDATORY AND EQUALLY IMPORTANT AS THE CODE**  
> This guide is the outer layer of the project's strict bootstrap philosophy. Skipping workstation hardening and discovery is the #1 source of non-reproducible results and audit failures.

---

## 1. Executive Summary & Philosophy

The Sovereign Node 9010 is a high-assurance, Merkle-sealed, deception-detecting governance engine. It demands **deterministic** execution.

This requires more than Python code — it requires a **deterministic workstation**.

This integrated DevSecOps Toolkit (originally researched and delivered as the SovereignNode_DevSecOps_Toolkit) provides:

- **Discover-SystemState.ps1** — comprehensive, machine-readable system state capture (hardware, power, WSL, Python provenance, Git, security posture, telemetry, .wslconfig, optional benchmarks)
- **Apply-DevEnvConfig.ps1** — idempotent, fully-audited applicator with `-WhatIf` safety
- **Sovereign-DevSecOps-Setup.ps1** — the unified 4-action launcher that marries the above with the project's existing mandatory `PreDeploy.ps1` / Strict-Bootstrap
- `config_resources.json` — loadable profile for in-program awareness (no external agents)

**Core Principles (married from research + project):**
- Everything before code is auditable evidence.
- Before/after discovery + logs are retained with every release tag.
- Idempotent & safe-to-re-run.
- Stable JSON schema for future drift detection, CI, and business portability.
- "Repeatable performance and stability over marginal gains."

---

## 2. Confirmed Configuration (All Recommendations Validated)

### 2.1 WSL 2 & Virtualisation (Critical)
- Features: `Microsoft-Windows-Subsystem-Linux` + `VirtualMachinePlatform` → Enabled
- Default version: 2
- `.wslconfig` (in `%USERPROFILE%`):

```ini
[wsl2]
processors=8
memory=16GB
swap=4GB
localhostForwarding=true
```

**Rule:** All Sovereign Node code, repos, and volumes **must** live in native WSL/Linux filesystem (`~/projects/...`). Cross-mount I/O from `/mnt/c` incurs ~13% penalty + Defender interference.

### 2.2 Python 3.11 Runtime
- Use official python.org installer (not Microsoft Store).
- Enable "Add Python to PATH" + "Install for all users".
- Disable Windows App Execution Aliases for `python.exe` / `python3.exe` (Settings → Apps → Advanced app settings).
- Registry: `LongPathsEnabled = 1` (DWORD).

### 2.3 Git Line Endings (Cross-Platform Safety)
```powershell
git config --global core.autocrlf true
git config --global core.safecrlf warn
```

### 2.4 MSI Center Pro & Power (Hardware Specific)
- **Mandatory:** MSI Center Pro → Performance Optimizer → **High Performance** profile (when plugged in).
- Windows Power Plan: **Best performance** (EPP 0).
- `powercfg /h off` (disables Fast Startup / Hibernate — critical for WSL/Docker/dual-boot cleanliness).
- Use genuine 150 W adapter.

### 2.5 Graphics (Optimus + Stock)
- NVIDIA Control Panel → Manage 3D Settings → Preferred processor = **Auto-select** (Optimus).
- No custom CUDA overclocks for deterministic workloads.
- Optional in-code awareness (see Section 6):

```python
import torch
print("CUDA available:", torch.cuda.is_available())
```

### 2.6 Firmware / UEFI Hardening (Low-Latency Determinism)
Access: Right-Ctrl + Right-Shift + Left-Alt + F2 in Aptio Setup.

| Setting                  | Target Value          | Purpose                        | Risk |
|--------------------------|-----------------------|--------------------------------|------|
| VMD Controller           | Disabled              | Direct AHCI                    | Low  |
| CPU C-States             | Disabled              | Eliminate sleep latency        | Med  |
| Primary Graphics Mode    | PEG (Discrete Only)   | Consistent dGPU routing        | Low  |
| Secure Boot              | Enabled               | Boot integrity                 | None |
| AllowTelemetry (Reg)     | 0                     | Disable diagnostic collection  | Low  |
| DiagTrack service        | Disabled & Stopped    | Eliminate telemetry            | Low  |

---

## 3. The Two Core Scripts (Production-Ready)

Located in `04_Validation/DevSecOps/`:

### Discover-SystemState.ps1
```powershell
# Before ANY changes (mandatory baseline)
.\Discover-SystemState.ps1 -OutputPath "..\audit" -IncludeBenchmarks

# After changes (for delta evidence)
.\Discover-SystemState.ps1 -OutputPath "..\audit"
```

Outputs (timestamped):
- `SovereignNode_Discovery_YYYYMMDD-HHMMSS.json` — stable schema for automation
- `SovereignNode_Discovery_*.md` — human audit report with ✅/❌ table
- Color console summary of drift vs Recommended targets

### Apply-DevEnvConfig.ps1
```powershell
# DRY RUN FIRST (highly recommended — always)
.\Apply-DevEnvConfig.ps1 -LogPath "..\logs" -WhatIf

# Real apply (run as Administrator)
.\Apply-DevEnvConfig.ps1 -LogPath "..\logs"
```

Fully logged transcript. Safe to re-run. Reboot after WSL/power changes, then re-discover.

---

## 4. The Unified "One Build Flow — 4 Actions"

This is the **married, canonical flow** that replaces fragmented workstation + project setup instructions.

**Always execute in order. Capture artifacts with every release.**

### Action 1 — Discover & Baseline (Starting Evidence)
```powershell
cd C:\project\sovereignnode9010\04_Validation\DevSecOps

# Full baseline with lightweight benchmarks
.\Discover-SystemState.ps1 -OutputPath "..\audit" -IncludeBenchmarks
```
Review RED items. Store the JSON/MD with your audit package.

### Action 2 — Apply / Harden Workstation (Idempotent)
```powershell
# Dry run
.\Apply-DevEnvConfig.ps1 -LogPath "..\logs" -WhatIf

# Apply (Administrator)
.\Apply-DevEnvConfig.ps1 -LogPath "..\logs"
```

**Manual follow-ups (not fully automatable):**
- Open MSI Center Pro → High Performance + Cooler Boost (AC power only)
- Settings → Apps → Advanced app settings → Turn off python.exe / python3.exe aliases (if using official Python)
- `wsl --shutdown` after `.wslconfig` change

Reboot if prompted. Then **re-run Action 1** for "after" evidence.

### Action 3 — Project Mandatory Pre-Work (Existing Gate)
```powershell
# From project root — the rich, enforced experience
make pre-deploy-ps

# Or directly
. .\04_Validation\PreDeploy.ps1
Invoke-SovereignPreDeploy
```

This runs Strict-Bootstrap (hierarchy + vault + engine verification) + quality gates + `BOOTSTRAP_COMPLETE` marker.

### Action 4 — Post-Verify, Re-Discover & Launch Readiness
```powershell
# Re-capture final state (no benchmarks needed)
cd 04_Validation\DevSecOps
.\Discover-SystemState.ps1 -OutputPath "..\audit"

# Final quality + launch
make verify
python run_server.py          # or make docker-up
```

All four discovery JSONs + apply logs + bootstrap logs now form your complete, auditable workstation + project baseline for this release.

---

## 11. Inside-TAU Drift Detection (Paramount for Audit Specifications)

**"Detection is key as prevention is better than cure."**

**Human error prevention is the bread and butter of Sovereign Node 9010.**

Drift detection is **not** an external compliance script. Per the project's core philosophy and audit requirements (ANAO, Section 177, high-assurance governance), **all drift detection must occur inside the Tau refusal gate**.

#### Automatic Section 177 Affidavit Generation on Critical Drift (Default: Enabled)

**"Failure is the saving grace."**

This is deliberate, automatic human-error prevention:

- When the detector identifies **any CRITICAL drift** (or the Tau gate returns `DEFER`/`TEST FIRST`), it **automatically invokes `core.generate_affidavit()`** at the instant of detection.
- The specific **triggering `fact_uuid`** of the `DEVSECOPS_DRIFT` fact is embedded directly into the affidavit as a clearly labeled "Drift Incident Addendum" section. This gives perfect end-to-end traceability.
- The returned result also contains:
  - `legal_affidavit` (full text with embedded fact_uuid)
  - `devsecops_drift.triggering_fact_uuid`
  - `devsecops_drift.auto_affidavit_generated: true`
  - `should_fail_pipeline: true`

#### Pipeline Failure on Affidavit Generation (Intentional)

The Azure Pipelines definition is deliberately configured so that:

- Any run that produces `auto_affidavit_generated == true` or `critical_count > 0`
- ...will cause the "Inside-TAU DevSecOps Drift Detection" step to **fail hard**.

This failure is not a bug — it is the **saving grace** for audit compliance, regulatory posture, and long-term determinism. Human/configuration error is turned into an automatic, visible, non-bypassable gate.

You can temporarily bypass with `--no-fail-on-critical` (use only in development / investigation).

The golden profile documents the policy:
```json
"tau_policy": { "auto_affidavit_on_critical": true, ... }
```

### Why Inside TAU?
- External diff tools are black boxes.
- The only immutable, deception-resistant, Merkle-sealed record is one that has passed through:
  1. Deception Scanner v3.9.1 (52 patterns + new DevSecOps drift patterns)
  2. BBFB Law / GRACE / FRUIT gates
  3. Tau Ceiling (10% extraction limit)
  4. Facts Registry + cryptographic Merkle seal
  5. Optional automatic Legal Affidavit generation on refusal

### How It Works (Deterministic Flow)
1. Workstation discovery produces `SovereignNode_Discovery_*.json` (Action 1 & 4).
2. `devsecops_drift_detector.py` (in `02_Technical/`) loads the latest discovery + the **golden profile** (`04_Validation/DevSecOps/golden_devsecops_profile.json`).
3. It generates a precise, high-signal `DEVSECOPS_DRIFT` statement.
4. The statement is submitted via the normal `GrokNetCore.process_input(category="DEVSECOPS_DRIFT", ...)` path (or `/api/validate`).
5. The **full four-gate deterministic trace** is returned and the fact is sealed forever.
6. On CRITICAL drift the detector **automatically generates a full Section 177 affidavit** (no manual step required). The fact + affidavit are sealed together.

### Using the Detector
```powershell
# From project root (Python — works on any platform)
PYTHONPATH=02_Technical python 04_Validation/DevSecOps/detect_drift.py

# Or via the thin PowerShell wrapper (Windows)
cd 04_Validation\DevSecOps
.\Detect-Drift.ps1
```

The detector is also invoked automatically in Azure Pipelines as a **mandatory quality gate** in the Verify stage.

### Golden Profile
The single source of truth for "no drift" is:
`04_Validation/DevSecOps/golden_devsecops_profile.json`

Any change to recommended values must be deliberate, reviewed, and the profile updated (which will itself generate a drift fact on the next run — full traceability).

### CI / Audit Integration
- `azure-pipelines.yml` runs the drift detector on every build as a **mandatory gate**.
- The step is named to make the intent unmistakable:  
  **"Inside-TAU DevSecOps Drift Detection + Auto-Affidavit (FAIL on critical / affidavit=true)"**
- On critical drift or when an affidavit is auto-generated, the detector exits non-zero → the pipeline step (and usually the whole build) fails.
- This failure **is the saving grace** — it prevents non-deterministic or non-compliant workstations from progressing.
- Discovery JSONs + drift reports + generated affidavits are published as `devsecops-drift-artifacts`.
- On real Windows self-hosted agents: upload fresh discovery JSONs as artifacts, remove `--no-submit`, and let real `DEVSECOPS_DRIFT` facts flow through the engine. The `triggering_fact_uuid` will be permanently recorded inside the auto-generated affidavit.

This satisfies the requirement that "drift detection paramount for audit specs, has to stay inside TAU".

See `02_Technical/devsecops_drift_detector.py` for the full implementation (pure, zero new dependencies beyond the existing Sovereign Node engines).

---

## 5. One-Command Convenience (Recommended)

Instead of manual steps, use the married launcher:

```powershell
cd 04_Validation\DevSecOps
.\Sovereign-DevSecOps-Setup.ps1
```

It walks you through all 4 actions with confirmations, sensible project-relative paths, and final readiness banner.

**Pipeline / non-interactive usage:**
```powershell
.\Sovereign-DevSecOps-Setup.ps1 -NonInteractive -SkipApply
```

---

## 6. In-Program Resource Awareness (No Extra Monitoring Agents)

As recommended in the original research: keep awareness **inside** the Sovereign Node.

`04_Validation/DevSecOps/config_resources.json` (copied to project):

```json
{
  "wsl_memory_gb": 16,
  "wsl_processors": 8,
  "gpu_passthrough": false,
  "cpu_pinning": "auto",
  "baseline_mode": "deterministic"
}
```

**Example integration** (add to `02_Technical/config.py` or at server startup):

```python
import json
from pathlib import Path

def load_devsecops_resources():
    candidates = [
        Path(__file__).resolve().parent.parent.parent / "04_Validation" / "DevSecOps" / "config_resources.json",
        Path("config_resources.json"),
    ]
    for p in candidates:
        if p.exists():
            return json.loads(p.read_text())
    return {"baseline_mode": "deterministic"}  # safe default

RESOURCES = load_devsecops_resources()
print(f"[Sovereign] DevSecOps profile loaded: {RESOURCES['baseline_mode']}")
```

Optional CUDA probe (only when GPU workloads are introduced later):
```python
# import torch
# print("CUDA available for acceleration:", torch.cuda.is_available())
```

This gives the program self-knowledge of its execution environment without introducing external daemons at deploy time.

---

## 7. Baseline Benchmarks (Mandatory for Audit Evidence)

Capture before/after (the launcher includes these via `-IncludeBenchmarks`):

```powershell
# Python compile (repeatable)
Measure-Command { python -m compileall -q -j 0 "C:\project\sovereignnode9010" }

# WSL latency
Measure-Command { wsl echo "Sovereign Node benchmark" | Out-Null }

# Docker build (example)
Measure-Command { docker build -t sovereign-node-test . }

# Node dry-run startup (replace with actual command)
Measure-Command { wsl python run_server.py --mode test --dry-run }
```

Store results inside the Discovery JSON or alongside release artifacts.

---

## 8. DevSecOps Pipeline Integration Pattern

1. **Pre-change** — Run `Discover... -IncludeBenchmarks` → commit JSON to `03_Vault/audit/` or release artifact store.
2. **Apply** — Run `Apply...` (with transcript log).
3. **Post-change** — Re-run Discover → store "after" JSON + delta report.
4. **Project Bootstrap** — `make pre-deploy-ps` (or launcher Action 3).
5. **Build / Test / Deploy** — azure-pipelines, Bicep, Docker.
6. **Release Tagging** — Attach the four artifacts (pre-JSON, apply-log, post-JSON, bootstrap log) to the release.

Future extension: a drift-detection script that diffs JSONs against the golden `Recommended` section.

---

## 9. Quick Reference — Exact Commands (Windows)

From `C:\project\sovereignnode9010`:

```powershell
# Full unified flow (recommended)
cd 04_Validation\DevSecOps
.\Sovereign-DevSecOps-Setup.ps1

# Manual granular control
.\Discover-SystemState.ps1 -OutputPath "..\audit" -IncludeBenchmarks
.\Apply-DevEnvConfig.ps1 -LogPath "..\logs" -WhatIf
# ... review, apply, reboot, re-discover ...
make pre-deploy-ps
```

Cross-platform (after workstation is ready):
```bash
make pre-deploy
make run
```

---

## 10. Next Actions & Maintenance

- Run the 4-Action flow on every new dev machine or after OS/firmware updates.
- Re-run full discovery monthly or before major releases for drift evidence.
- Update `config_resources.json` only when deliberately changing WSL allocation (then re-validate with benchmarks).
- For business deployments: treat the entire `04_Validation/DevSecOps/` folder + this guide as part of the release package.

---

## Appendix: Original Research Sources

This guide is the direct marriage of:
- "Professional Research Findings & Confirmed Configuration Guide" (30 May 2026)
- Workflow notes emphasizing "Before any changes", "Dry run first", discovery as standardised command, and in-program awareness
- The existing Sovereign Node 9010 v3.9.1 strict bootstrap / PreDeploy philosophy

All core recommendations were cross-verified against Microsoft Learn, MSI, NVIDIA, and Intel documentation current as of May 2026.

**The ducks are now fully in a row — repeatable, auditable, and future-proof.**

---

*End of DevSecOps Workstation Guide*
