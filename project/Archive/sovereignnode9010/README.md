# Sovereign Node 9010 v3.9.1

**PRE-WORK IS MANDATORY AND EQUALLY IMPORTANT AS THE CODE**

Skipping the strict bootstrap is the #1 source of human/AI errors, non-reproducible deployments, and broken portability.  
The bootstrap (hierarchy + vault initialization + engine verification) is not optional — it is part of the deliverable.

**You will not be able to start the node (host or container) without completing it.**

**NEW: Unified DevSecOps Build Flow (4 Actions)** — The full workstation + project pre-work is now a single repeatable flow.

**Critical:** Drift detection + **automatic Section 177 affidavit generation on CRITICAL drift** (with embedded `fact_uuid`) is enforced **inside TAU**.  
Azure Pipelines is configured to **fail hard** on `affidavit=true` or critical drift — this failure is the saving grace for audit and human error prevention. See the full guide.

See [01_Methodology/docs/DEVSECOPS_WORKSTATION_GUIDE.md](01_Methodology/docs/DEVSECOPS_WORKSTATION_GUIDE.md) for the married instructions, examples, and compliance reasoning.

**Recommended (Windows):**
```powershell
cd 04_Validation\DevSecOps
.\Sovereign-DevSecOps-Setup.ps1
```
This orchestrates Discover → Apply (with dry-run safety) → Project Bootstrap → Post-Verify in one guided experience.

High-assurance, Merkle-sealed fact validation and governance node.

Pure Python (stdlib + minimal deps), PEP 8 / Ruff + MyPy enforced, pre-commit + GitHub Actions CI.

## Core Philosophy

- **BBFB Constraint Engine** (LAW / GRACE / FRUIT / DEBT)
- **Deception Detection** — 52-pattern multimodal scanner (`deception_scanner_v3_9_1.py`)
- **Deterministic Rule Verification**
- **Cryptographic Audit Trail** — HMAC-SHA256 Merkle seals on every fact and affidavit
- **Legal Affidavit Generation** for Section 177 / major failure events
- **Tau Refusal Gate** (X-TAAS-AUTH)

## Project Layout (Strict 00-99 Spatial Hierarchy)

```
c:\project\sovereignnode9010\
├── 00_Strategy/
├── 01_Methodology/                # (documentation & audits)
├── 02_Technical/                  # All core engines + server.py
├── 03_Vault/                      # Merkle facts_registry.db (persistent)
├── 04_Validation/                 # Strict bootstrap, PreDeploy.ps1, DevSecOps/ (Discover+Apply+Launcher), checkers, .azcli scripts
├── 99_Archive/
├── Dockerfile
├── docker-compose.yml
├── azure-pipelines.yml
├── Makefile
├── run_server.py
└── README.md
```

## Quick Start (Windows / WSL recommended)

```powershell
# From inside the project
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Or with uv (recommended)
uv sync
```

### Run static analysis (enforced in CI)

```bash
ruff check .
ruff format --check .
mypy .
```

## Running the Deterministic Node (HTTP + Dashboard)

This is the **deployment layer**.

```powershell
# From C:\project\sovereignnode9010 with venv already created
.\.venv\Scripts\Activate.ps1
python server.py
```

Open http://localhost:8000

### Key Endpoints

- `GET /` — Retro terminal dashboard (full no-black-box view)
- `GET /api/health` — Liveness + determinism declaration
- `GET /api/facts` — All sealed facts from the Merkle ledger
- `GET /api/affidavits` — Generated Section 177 rejections
- `GET /api/verify` — Current ontology + gate status (52 patterns, contradictions engine)
- `POST /api/validate` — **The core deterministic pipeline**
  - Body: `{ "statement": "...", "category": "02_Technical" }`
  - Headers: `X-TAAS-AUTH: <your token>`
  - Returns the **complete decision trace**:
    - deception_gate (score + exact rules_fired)
    - valuation_gate
    - bbfb_cvs
    - final_action + reason
    - fact_uuid + registry_stats
    - `deterministic: true`, `black_box: false`

### Environment Variables (Production)

```powershell
$env:SOVEREIGN_DB_PATH = "C:\data\sovereign\facts.db"
$env:TAAS_AUTH_TOKEN = "super-secret-long-token"
$env:AUDIT_SECRET_KEY = "another-long-secret-for-merkle"
$env:PORT = "8000"
```

## MANDATORY PRE-WORK (Equal Importance to the Code)

**Now part of the 4-Action DevSecOps flow (Action 3).**

```powershell
# Best option on Windows (includes outer workstation setup)
cd 04_Validation\DevSecOps
.\Sovereign-DevSecOps-Setup.ps1

# Or project pre-deploy gate only (Git Bash / WSL / macOS / Linux)
make pre-deploy
```

This is **not optional**. The node (and all deployment paths) will hard-fail without it.

See `04_Validation/PreDeploy.ps1`, the `Makefile`, and the full [DevSecOps Workstation Guide](01_Methodology/docs/DEVSECOPS_WORKSTATION_GUIDE.md).

### Determinism & No Black Box Guarantees

- Every call to `process_input` is **pure** given the same inputs + current sealed ledger state.
- The returned object always contains `"deterministic": true` and `"black_box": false`.
- All deception rules are symbolic + entropy-based (no ML models).
- The 52-pattern ontology is fully introspectable via the verifier.
- Every accepted or rejected fact produces an immutable HMAC-SHA256 Merkle entry.
- The server never hides intermediate scores or rule firings.

### Shutdown

Ctrl+C performs graceful `core.shutdown()` — all connections and the audit ledger are properly closed.

## Deployment Notes (Windows-first)

- Recommended: Run inside WSL2 or a clean Dev Drive for maximum determinism and speed.
- The node is designed to be long-lived. It holds the FactsRegistry connection open.
- For production, front with a reverse proxy (Caddy / nginx) + proper secret management (never commit TAAS_AUTH_TOKEN).
- All state lives in `data/vault/` (or `$SOVEREIGN_DB_PATH`). Back this directory up.

See `docs/USER_INSTRUCTIONS_v3.9.1.md` and the security/legal audits in `docs/`.

## Azure Deployment with Private Endpoints (Recommended for Production)

### Option 1: Bicep (Preferred - Declarative)
```powershell
# 1. Mandatory pre-work (critical)
make pre-deploy-ps     # or PreDeploy

# 2. (One-time) Create GitHub OIDC identity (highly recommended)
.\04_Validation\Setup-GitHubOIDC.ps1 `
    -GitHubRepo "yourorg/sovereign-node-9010" `
    -Environment "production" `
    -SubscriptionId "xxxxxxxx-..." `
    -ResourceGroupName "rg-sovereign-node-private"

# 3. Deploy using Bicep helper
cd 04_Validation
.\Deploy-PrivateBicep.ps1 `
    -ResourceGroupName "rg-sovereign-private" `
    -ContainerImage "youracr.azurecr.io/sovereign-node-9010:latest" `
    -TaaS "your-taas-secret" `
    -AuditSecret "your-audit-secret"
```

See:
- `04_Validation/bicep/sovereign-node-private.bicep`
- `04_Validation/Setup-GitHubOIDC.ps1` (creates the federated identity + role assignments)

**GitHub Actions version** (recommended for CI/CD):
- `.github/workflows/deploy-private-bicep.yml` (uses OIDC)
- One-time setup script: `04_Validation/Setup-GitHubOIDC.ps1`
  - Creates the App Registration + Federated Credential
  - Assigns least-privilege roles
  - Outputs the exact secrets you need
- Fully enforces mandatory pre-work before any deployment
- Aligns with ANAO Auditing Standards (F2024L00057) for auditable, ethical, least-privilege access.

### Option 2: Classic .azcli (Private Endpoints)
```powershell
. .\04_Validation\Deploy-SovereignNode9010-PrivateEndpoints.azcli
```

Both versions create:
- VNet + subnets
- Private Endpoints for ACR, Key Vault, Storage (Azure Files for 03_Vault)
- Container App with VNet integration + persistent volume

The Bicep version is recommended for production as it is declarative and easier to version/control.


## On-Disk Structure (Strict 00-99 Spatial Hierarchy)

The project now follows the hardened geometric isolation model from the production notes:

```
C:\project\sovereignnode9010\
├── 00_Strategy/
├── 01_Methodology/          # (docs moved here)
├── 02_Technical/            # All core engines + server.py
│   ├── groknett_core.py
│   ├── deception_scanner_v3_9_1.py
│   ├── ...
│   └── server.py
├── 03_Vault/                # Merkle facts_registry.db + law.json (persistent)
├── 04_Validation/           # Strict-Bootstrap-*.ps1 + audit logs
├── 99_Archive/
├── Dockerfile
├── docker-compose.yml
├── azure-pipelines.yml
├── run_server.py            # Convenience launcher
└── README.md
```

## MANDATORY PRE-WORK (Run This First — Every Time)

**This is now Action 3 of the outer 4-Action DevSecOps Unified Flow.**

For the complete workstation + project preparation (recommended):

```powershell
cd 04_Validation\DevSecOps
.\Sovereign-DevSecOps-Setup.ps1
```

Or run the project bootstrap in isolation (still mandatory):

```powershell
cd C:\project\sovereignnode9010

# This is NOT optional. It is as important as the source code for reproducibility.
.\04_Validation\Strict-Bootstrap-SovereignNode9010.ps1
```

This script:
- Enforces the 00-99 hierarchy on disk
- Initializes the cryptographic 03_Vault
- Verifies every deterministic engine still works after any changes
- Writes the `BOOTSTRAP_COMPLETE` guard file

Without this file the server, Docker container, Azure Container App, and CI pipelines will refuse to start.

**Full married instructions + before/after discovery + apply workflow:** see `01_Methodology/docs/DEVSECOPS_WORKSTATION_GUIDE.md`.

## Running Locally After Reorganization

```powershell
cd C:\project\sovereignnode9010

# 1. Mandatory pre-work (see above)
.\04_Validation\Strict-Bootstrap-SovereignNode9010.ps1

# 2. Run the node
python run_server.py
# or
python -m 02_Technical.server
```

## Containerized Deterministic Runs (Docker + Compose)

```bash
docker compose up -d
# Dashboard: http://localhost:8000
```

The container enforces the full 00-99 hierarchy internally + all hardening flags (`NO_NETWORK=1`, non-root, read-only code, etc.).

## Azure Pipelines

`azure-pipelines.yml` at root performs:
- Strict bootstrap + quality gates
- Builds the hardened Docker image
- Runtime verification inside the container (health + deterministic contract)
- Publishes the image (configure ACR service connection)

## Key Files

- `04_Validation/Strict-Bootstrap-SovereignNode9010.ps1` — the stricter harness
- `azure-pipelines.yml` — full CI for the deterministic node
- `Dockerfile` / `docker-compose.yml` — production container with 00-99 + hardening

All "no black box" and deterministic guarantees are preserved and now structurally enforced on disk.

### Pre-commit

```bash
pre-commit install
```

## Key Modules

- `groknett_core.py` — Orchestration, fact validation pipeline, Tau gate
- `deception_scanner_v3_9_1.py` — Heavy multimodal deception ontology (52 patterns)
- `rule_verifier_v3_9_1.py` — Deterministic rule engine
- `facts_registry.py` — Persistent sealed registry (SQLite)
- `cidi_governance_engine.py` — Core CVS / BBFB math
- `legal_affidavit_generator.py` — Automatic Section 177 affidavit creation on rejection

## Previous Context

This is the **official clean v3.9.1 production release** assembled from iterative development.
See `docs/` for the full security audit, legal audit, and user instructions.

## Status

Production-ready core library. Runnable server entrypoint (dashboard + /api/validate) can be added from prior `main.py` artifacts if needed.

License / Usage: Proprietary high-assurance system.
