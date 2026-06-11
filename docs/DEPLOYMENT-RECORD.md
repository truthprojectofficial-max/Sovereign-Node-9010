# DEPLOYMENT RECORD — Sovereign Node 9010

> **Groknett ValueForge** | TaaS Monolith v3.9.1
> Generated: 2026-03-07 | Recreatable from scratch

---

## TL;DR

Everything needed to destroy and rebuild this entire deployment from zero.
Every Azure resource, every file, every config value, every command — documented here.

---

## 1. LIVE DEPLOYMENT

| Field       | Value                                                                                                |
| ----------- | ---------------------------------------------------------------------------------------------------- |
| **URL**     | Run `az containerapp show -n cagroknettvalueforgaoxk4iafo3kuo -g groknett-deploy --query properties.configuration.ingress.fqdn -o tsv` to get current URL |
| **Health**  | `<APP_URL>/api/health`                                                                                |
| **Status**  | Deployed via GitHub Actions                                                                          |
| **Version** | 3.9.1                                                                                               |
| **GitHub**  | `https://github.com/beendaer/groknett-valueforge` (private)                                          |
| **CI/CD**   | GitHub Actions — auto-deploys on push to `main`                                                      |

---

## 2. AZURE SUBSCRIPTION

| Field                 | Value                                  |
| --------------------- | -------------------------------------- |
| **Subscription ID**   | `89238eae-c7cf-41c6-b4d8-bba51519879c` |
| **Subscription Name** | Subscription 1                         |
| **Tenant ID**         | `8866ce38-3627-49b9-978b-dab99cfe2e41` |
| **Directory**         | justobemeoutlook.onmicrosoft.com       |
| **Owner**             | justbeme@outlook.com                   |
| **Plan**              | Azure Plan (Pay-as-you-go)             |

---

## 3. AZURE RESOURCE INVENTORY

All resources live in **Resource Group: `groknett-deploy`** | **Region: `australiaeast`**

| Resource                    | Type                                     | Name                                | Key Config                                                    |
| --------------------------- | ---------------------------------------- | ----------------------------------- | ------------------------------------------------------------- |
| Container App               | Microsoft.App/containerApps              | `cagroknettvalueforgaoxk4iafo3kuo` | 0.5 CPU, 1 GiB RAM, 1-3 replicas, port 8000                   |
| Container Apps Environment  | Microsoft.App/managedEnvironments        | (auto-created by azd)               | Managed by Azure Developer CLI                                |
| Container Registry          | Microsoft.ContainerRegistry/registries   | `acrgroknettvaaoxk4iafo3kuo`       | Basic SKU, admin enabled, image: `groknett-valueforge:latest` |
| Storage Account             | Microsoft.Storage/storageAccounts        | (if created)                        | Standard_LRS, StorageV2, Hot tier                             |
| File Share (mounted)        | Azure Files share                        | (if created)                        | Mounted at `/mnt/data`                                        |
| Key Vault                   | Microsoft.KeyVault/vaults                | (if created)                        | Secrets management                                            |
| Log Analytics Workspace     | Microsoft.OperationalInsights/workspaces | (auto-created)                      | Auto-created with Container Apps Environment                  |

### Container App Configuration

```
Image:        acrgroknettvaaoxk4iafo3kuo.azurecr.io/groknett-valueforge:latest
CPU:          0.5 cores
Memory:       1 GiB
Min replicas: 1
Max replicas: 3
Target port:  8000
Ingress:      external

Environment variables:
  PORT      = 8000
  DB_PATH   = /mnt/data/database.sqlite
  NODE_ENV  = production

Volume mounts:
  sqlitedata → /mnt/data (Azure Files: groknett-data on groknettstorage)

Health probes:
  Liveness:  GET /api/health :8000 (every 30s, 10s delay, 3 retries)
  Readiness: GET /api/health :8000 (every 10s, 5s delay, 3 retries)
  Startup:   GET /api/health :8000 (every 5s, 3s delay, 10 retries)
```

### Key Vault Secrets

| Secret Name   | Status | Value                                                                   |
| ------------- | ------ | ----------------------------------------------------------------------- |
| `AuditSecret` | Active | `CHANGE-ME-BEFORE-GO-LIVE` (placeholder — update before production use) |

---

## 4. FILE MAP

```
c:\Users\Sover\2.0 attempt push to azure\
│
├── DEPLOYMENT-RECORD.md          ← THIS FILE
├── README.md                     ← Project docs, quick-start, API reference
├── azure-push-manifest.json      ← Crypto-sealed deployment manifest (SHA-256)
│
├── ── Source Code ──
│   ├── server.ts                 ← Express backend (BBFB, Deception, Facts, Health)
│   ├── src/
│   │   ├── App.tsx               ← React 19 UI (5 tabs)
│   │   ├── main.tsx              ← DOM mount
│   │   ├── constants.ts          ← 30-pattern deception ontology + BBFB config
│   │   ├── types.ts              ← TypeScript interfaces
│   │   ├── index.css             ← Tailwind + sovereign grid overlay
│   │   └── vite-env.d.ts         ← Vite env type declarations
│   ├── index.html                ← Vite entry point
│   └── sql-js.d.ts               ← sql.js type declarations
│
├── ── Configuration ──
│   ├── package.json              ← npm deps, scripts, v3.9.1
│   ├── package-lock.json         ← Pinned dependency lock
│   ├── tsconfig.json             ← TypeScript (strict, ES2022)
│   ├── tsconfig.node.json        ← TypeScript for build tools
│   ├── vite.config.ts            ← Vite build + dev proxy
│   ├── tailwind.config.js        ← Sovereign color palette
│   ├── postcss.config.js         ← PostCSS + Tailwind + Autoprefixer
│   ├── eslint.config.js          ← ESLint (TS + React)
│   ├── .prettierrc               ← Prettier (semicolons, single quotes, 2-space)
│   ├── .env                      ← Runtime env vars (PORT, DB_PATH)
│   ├── .env.example              ← Template for .env
│   ├── .gitignore                ← Excludes: node_modules, dist, .env, *.sqlite*
│   └── .dockerignore             ← Docker build exclusions
│
├── ── Deployment ──
│   ├── Dockerfile                ← Multi-stage (node:22-alpine), HEALTHCHECK
│   ├── deploy-azure.ps1          ← 8-step PowerShell deploy (Windows)
│   ├── deploy-azure.sh           ← 8-step Bash deploy (Linux/macOS/CI)
│   └── generate-manifest.js      ← Creates azure-push-manifest.json with SHA-256
│
├── ── CI/CD ──
│   └── .github/
│       ├── workflows/deploy.yml  ← GitHub Actions: lint → build → ACR push → deploy
│       ├── instructions/         ← Copilot governance instructions
│       ├── hooks/                ← Pre-commit lint trigger
│       └── skills/               ← Deterministic code quality skill
│
├── ── Data ──
│   ├── data/
│   │   ├── database.sqlite       ← Runtime SQLite (Facts registry, auto-created)
│   │   ├── detection-raw.json    ← 21-file deception scan results
│   │   └── DETECTION-REPORT-2026-03-07.md  ← Forensic analysis report
│   └── test-data/
│       ├── 01-corporate-evasion.txt
│       ├── 02-user-correction.txt
│       └── 03-kelvanistic-baseline.txt
│
├── ── Build Outputs (generated, not committed) ──
│   ├── dist/                     ← Vite production build (~357 KB JS, ~15 KB CSS)
│   └── node_modules/             ← npm packages (~700 MB)
│
└── ── IDE ──
    └── .vscode/settings.json     ← Disable CSS validation for Tailwind
```

---

## 5. TECHNOLOGY STACK

| Layer     | Technology               | Version        |
| --------- | ------------------------ | -------------- |
| Runtime   | Node.js (Alpine)         | 22.x           |
| Backend   | Express                  | 4.21.0         |
| Frontend  | React                    | 19.0.0         |
| Bundler   | Vite                     | 6.0.0          |
| CSS       | Tailwind CSS             | 3.4.17         |
| Language  | TypeScript (strict)      | 5.7.0          |
| Database  | sql.js (SQLite in-mem)   | 1.11.0         |
| Linter    | ESLint                   | 9.17.0         |
| Formatter | Prettier                 | 3.4.2          |
| Animation | Motion (Framer)          | 12.0.0         |
| Icons     | lucide-react             | 0.468.0        |
| Container | Docker (multi-stage)     | node:22-alpine |
| Cloud     | Azure Container Apps     | australiaeast  |
| Registry  | Azure Container Registry | Basic SKU      |
| Storage   | Azure Files (mounted)    | Standard_LRS   |
| Secrets   | Azure Key Vault          | —              |
| CI/CD     | GitHub Actions           | —              |

---

## 6. API ENDPOINTS

| Method | Route                         | Purpose                                   |
| ------ | ----------------------------- | ----------------------------------------- |
| GET    | `/api/health`                 | System status + uptime                    |
| POST   | `/api/calculate`              | BBFB Engine (LAW, GRACE, FRUIT)           |
| POST   | `/api/analyze`                | Deception Scanner (30 patterns + entropy) |
| GET    | `/api/facts`                  | List all facts from SQLite                |
| POST   | `/api/facts`                  | Insert a new fact                         |
| GET    | `/api/calculate/truthproject` | Red herring detection test                |
| GET    | `/*`                          | SPA fallback (serves React app)           |

---

## 7. RECREATE FROM SCRATCH

### Prerequisites

- Windows with PowerShell 5.1+
- Azure CLI installed and logged in (`az login`)
- Node.js 22+ installed
- Docker Desktop installed (for local testing only)

### Step-by-step: Full recreation

```powershell
# ── A. Clone / copy source code to a folder ──
# All source files listed in Section 4 must be present.

# ── B. Install dependencies ──
npm install

# ── C. Verify code quality ──
npm run lint          # ESLint — expect 0 errors
npm run typecheck     # TypeScript — expect 0 errors
npm run build         # Vite production build → dist/

# ── D. Local smoke test ──
$env:PORT = "8000"
$env:DB_PATH = "./data/database.sqlite"
npx tsx server.ts
# In another terminal:
#   curl http://localhost:8000/api/health
#   Should return: {"status":"operational","node":"SOVEREIGN-NODE-9010","version":"3.9.1",...}
# Stop server with Ctrl+C

# ── E. Docker test (optional) ──
docker build -t groknett-valueforge:latest .
docker run -d -p 8000:8000 --name gvf-test groknett-valueforge:latest
# curl http://localhost:8000/api/health
docker stop gvf-test; docker rm gvf-test

# ── F. Deploy to Azure ──
az login
.\deploy-azure.ps1
# Script runs all 8 steps automatically.
# At the end, prints the live URL.
```

### Deploy script walkthrough (8 steps)

| Step | What it creates                                                                      | Command                                                    |
| ---- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| 1    | Resource Group `groknett-deploy` in `australiaeast`                                  | `az group create`                                          |
| 2    | Container Registry `acrgroknettvaaoxk4iafo3kuo` (Basic, admin) + builds/pushes image | `az acr create` + `az acr build`                           |
| 3    | Storage Account (if created) + File Share (if created)                               | `az storage account create` + `az storage share-rm create` |
| 4    | Key Vault (if created) + secrets                                                     | `az keyvault create` + `az keyvault secret set`            |
| 5    | Container Apps Environment (auto-created)                                            | Managed by azd/GitHub Actions                              |
| 6    | Mount Azure Files (if configured)                                                    | `az containerapp env storage set`                          |
| 7    | Container App `cagroknettvalueforgaoxk4iafo3kuo` (0.5 CPU, 1 GiB, 1-3 replicas, port 8000) | `az containerapp create`                          |
| 8    | Health probes (liveness/readiness/startup) + volume mount (if configured)            | `az rest --method PATCH`                                   |

---

## 8. TEARDOWN (Delete Everything)

```powershell
# This deletes ALL resources in the resource group — irreversible
az group delete --name groknett-deploy --yes --no-wait

# Purge Key Vault (if it exists and has soft-delete protection)
az keyvault purge --name <KEY_VAULT_NAME> --location australiaeast
```

**Warning:** This destroys the container app, registry, storage, key vault, and all data.
The SQLite database on Azure Files will be lost. Download it first if needed:

```powershell
# Download database before teardown (if storage exists)
$key = az storage account keys list --account-name <STORAGE_NAME> --resource-group groknett-deploy --query "[0].value" -o tsv
az storage file download --account-name <STORAGE_NAME> --account-key $key --share-name groknett-data --path database.sqlite --dest ./data/database.sqlite
```

---

## 9. ENVIRONMENT VARIABLES

### Local development (.env)

```ini
PORT=8000
DB_PATH=./data/database.sqlite
```

### Azure Container App (set during deployment)

```
PORT      = 8000
DB_PATH   = /mnt/data/database.sqlite
NODE_ENV  = production
```

### Key Vault secrets (to be configured)

```powershell
# Replace placeholder with real values
az keyvault secret set --vault-name groknett-kv --name AuditSecret --value "<real-audit-secret>"
az keyvault secret set --vault-name groknett-kv --name GeminiApiKey --value "<real-api-key>"
```

---

## 10. CI/CD PIPELINE

### GitHub Actions (.github/workflows/deploy.yml)

**Trigger:** Push to `main` or manual dispatch

**Jobs:**

1. **validate** — checkout → Node 22 → `npm ci` → lint → typecheck → build → upload dist/
2. **deploy** — checkout → Azure login → ACR build + push → Container Apps update → health check

### Setup required

```powershell
# 1. Initialize git repo
cd "c:\Users\Sover\2.0 attempt push to azure"
git init
git add .
git commit -m "Initial commit: Sovereign Node 9010 v3.9.1"

# 2. GitHub repo already exists:
git remote add origin https://github.com/beendaer/groknett-valueforge.git
git branch -M main
git push -u origin main

# 3. Create Azure service principal for CI/CD
az ad sp create-for-rbac --name "groknett-cicd" --role Contributor --scopes /subscriptions/89238eae-c7cf-41c6-b4d8-bba51519879c --sdk-auth

# 4. Copy the JSON output and add it as a GitHub secret:
#    Repository → Settings → Secrets → Actions → New: AZURE_CREDENTIALS = <paste JSON>
```

---

## 11. NPM SCRIPTS

| Command                | What it does                                              |
| ---------------------- | --------------------------------------------------------- |
| `npm run dev`          | Start both Express backend + Vite dev server (hot reload) |
| `npm run build`        | Production build → `dist/` (~357 KB JS, ~15 KB CSS)       |
| `npm start`            | Start Express server (serves built app)                   |
| `npm run lint`         | ESLint check (0 warnings enforced)                        |
| `npm run lint:fix`     | ESLint auto-fix                                           |
| `npm run format`       | Prettier format all source files                          |
| `npm run format:check` | Prettier check (no write)                                 |
| `npm run typecheck`    | TypeScript compiler check (no emit)                       |

---

## 12. DEPLOYMENT MANIFEST (Cryptographic Seal)

```json
{
  "artifact_id": "TRUTH-2026-03-07-FINAL-SSOT-V4",
  "project_status": "THE_DONE",
  "destination": "Azure Container Apps (Project: GroknettValueForge)",
  "structural_mapping": {
    "00_strategy": "Azure Key Vault",
    "01_methodology": "Deception Detection (30-Pattern Ontology)",
    "02_execution": "Container Apps (Express + React)",
    "03_data_proxies": "Azure Blob Storage / Azure Files",
    "04_validation": "Immutable SQLite Audit Ledger"
  },
  "integrity_benchmarks": {
    "factual_verification": "BERT (99.09%)",
    "narrative_verification": "LSTM (97.00%)"
  },
  "timestamp": "2026-03-07T02:24:41.289Z",
  "cryptographic_seal": "b64e8da680e170afeea698663eb94e9dc2e12642dcaa27244290a7157ce8833c"
}
```

Regenerate: `node generate-manifest.js`

---

## 13. REGISTERED AZURE RESOURCE PROVIDERS

These must be registered on the subscription for deployment to work:

```powershell
az provider register --namespace Microsoft.ContainerRegistry
az provider register --namespace Microsoft.App
az provider register --namespace Microsoft.OperationalInsights
az provider register --namespace Microsoft.Storage
az provider register --namespace Microsoft.KeyVault
```

---

## 14. KNOWN ISSUES & NOTES

| Issue                                  | Resolution                                                                                          |
| -------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Port 8000 occupied locally             | Use alternative port: `$env:PORT = "8001"`                                                          |
| `Standard_ZRS` SKU error on storage    | Fixed: using `Standard_LRS` instead                                                                 |
| WSL/bash not available on Windows      | Use `deploy-azure.ps1` (PowerShell equivalent)                                                      |
| `npm ci` EPERM on rollup binary        | Use `npm install` if `npm ci` fails due to locked files                                             |
| Key Vault `AuditSecret` is placeholder | Must be updated before production use                                                               |
| Key Vault `GeminiApiKey` not set       | Add when ready: `az keyvault secret set --vault-name groknett-kv --name GeminiApiKey --value <key>` |

> For copy-paste commands, troubleshooting, and environment prerequisites see **RUNBOOK.md** in this repo.

---

## 15. DEPLOYMENT TRACE LOG

### Sequence of commands executed (2026-03-07)

```
1. npm install                    → 349 packages, 0 vulnerabilities
2. npm run lint                   → 0 errors, 0 warnings
3. npm run typecheck              → 0 errors
4. npm run build                  → dist/ (357 KB JS, 15 KB CSS)
5. npx tsx server.ts              → smoke test on :8001 — all endpoints OK
6. docker build -t groknett-valueforge:latest .   → 34s, success
7. docker run -p 8002:8000        → container smoke test — all OK
8. node generate-manifest.js      → azure-push-manifest.json sealed
9. az login                       → authenticated
10. az provider register (×5)     → ContainerRegistry, App, OperationalInsights, Storage, KeyVault
11. azd init + azd up             → Resource group groknett-deploy created, resources provisioned
12. GitHub Actions workflow       → Continuous deployment on push to main
```

### Result

App deployed via GitHub Actions. To get current URL:
```bash
az containerapp show -n cagroknettvalueforgaoxk4iafo3kuo -g groknett-deploy --query properties.configuration.ingress.fqdn -o tsv
```

### Post-deployment (2026-03-07)

```
21. gh auth login                  → authenticated as beendaer
22. gh repo create beendaer/groknett-valueforge --private
23. git push -u origin main        → a93d4dc pushed
24. az ad sp create-for-rbac       → groknett-cicd (a123cd9c-b364-48b0-950b-65cf773359ba)
25. gh secret set AZURE_CREDENTIALS → service principal JSON stored
26. gh workflow run deploy.yml     → run 22792446421 → completed/success
27. deploy-azure.ps1 cleanup       → removed dead code, added linter configs
28. git push                        → 09f12e8 pushed
```

---

_End of Deployment Record — Sovereign Node 9010 | Updated 2026-03-07_
