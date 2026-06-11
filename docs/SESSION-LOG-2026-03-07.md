# SESSION LOG — The 10-Hour Ordeal

> **Project:** Groknett ValueForge — Sovereign Node 9010
> **Date:** Friday 7 March 2026, ~2:00 PM → Saturday 8 March 2026, ~12:30 AM AEDT
> **Duration:** ~10.5 hours
> **Outcome:** App deployed and running on Azure Container Apps via GitHub Actions CI/CD

---

## TL;DR

Started from a working v3.9.1 codebase. Spent ~10 hours with Copilot doing: code cleanup, linting/formatting, feature additions, documentation, multiple failed `azd provision` attempts, and finally getting GitHub Actions CI/CD working. The app is live. The local terminal errors were irrelevant — the real pipeline runs on GitHub.

---

## TIMELINE

### Phase 1: Initial Commit + Code Cleanup (~2:00 PM – 4:30 PM)

| Time | Commit | What happened |
|------|--------|---------------|
| 2:23 PM | `a93d4dc` Initial commit: Sovereign Node 9010 v3.9.1 | First push to `beendaer/groknett-valueforge`. Full codebase: Express + Vite (React 19) + SQLite + Tailwind. |
| 4:09 PM | `09f12e8` Clean up: remove dead code, add linter configs | Added ESLint config, `.markdownlint.json`, PSScriptAnalyzer settings. Removed dead code. |
| 4:17 PM | `025671e` Add RUNBOOK.md, update docs, suppress lint warnings | Created operational runbook. Updated README. |
| 4:26 PM | `d740930` Format: Prettier auto-fix across all source files | Ran Prettier on all `.ts`, `.tsx`, `.js`, `.css` files. Standardized formatting. |

**What was going on:** Setting up the project properly — linters, formatters, documentation. All standard "clean the house" work.

---

### Phase 2: Feature Development (~8:20 PM – 9:00 PM)

| Time | Commit | What happened |
|------|--------|---------------|
| 8:21 PM | `f87b50c` Deterministic: Prettier format pass on 5 markdown files | Formatted the Markdown docs to consistent style. |
| 8:45 PM | `490ffe6` feat: Add forensic authenticity analysis to facts registry | New feature — `src/db/facts-registry.ts`, `src/db/schema.sql`, `src/utils/similarity.ts`. Added fact storage and forensic analysis capabilities. |
| 8:55 PM | `a063061` feat: Add testing, logging, and observability | Added 4 test suites (`tests/*.test.ts`), vitest config, improved server logging. |

**GitHub Actions:** Deploy #7 (490ffe6) succeeded in 2m 53s. Deploy #8 (a063061) succeeded in 3m 1s. **The CI/CD pipeline was working the whole time.**

---

### Phase 3: The `azd provision` Rabbit Hole (~9:00 PM – 12:00 AM)

This is where the pain happened. Multiple attempts to run `azd provision` **locally** — all failed. Here's every attempt:

| # | Command | Result | Error |
|---|---------|--------|-------|
| 1 | `azd provision` | Exit code 1 | Unknown — likely auth or resource conflict |
| 2 | `azd provision` | Exit code 1 | Same |
| 3 | `azd auth login --tenant-id justobemeoutlook.onmicrosoft.com --use-device-code` | Exit code 0 | **Success** — auth worked |
| 4 | `azd provision --no-prompt` | Exit code 1 | Failed again despite fresh login |
| 5 | `azd provision --no-prompt 2>&1 \| Select-Object -Last 200` | Exit code 1 | Tried to capture error output |
| 6 | `azd env set AZURE_RESOURCE_GROUP groknett-rg; azd env set AZURE_LOCATION australiaeast; azd provision` | Exit code 1 | Tried setting env vars explicitly |
| 7 | `az group delete --name groknett-rg --no-wait -y; Start-Sleep 30; azd provision` | Exit code 1 | Tried nuking the resource group and reprovisioning |
| 8 | `azd env set AZURE_RESOURCE_GROUP groknett-deploy; azd provision` | Exit code 1 | Tried a different resource group name |

**The actual error (revealed later):**
```
BadRequest: The property "enablePurgeProtection" cannot be set to false.
Enabling the purge protection for a vault is an irreversible action.
```

**What this means in plain English:**
- An earlier deployment created an Azure Key Vault (`groknett-kv`)
- When the resource group was deleted, Azure didn't fully destroy the Key Vault — it "soft-deleted" it (Azure keeps vaults for 90 days as a safety net)
- When `azd provision` tried to create a *new* Key Vault with the same name, the ghost of the old one blocked it
- The Bicep/infrastructure template tried to set `enablePurgeProtection: false`, but Azure said "no, you already turned that on and it's permanently on"

**Why it didn't matter:** The *actual* deployment pipeline (GitHub Actions → `deploy.yml`) doesn't run `azd provision`. It just:
1. Builds the Docker image
2. Pushes it to the existing Azure Container Registry
3. Updates the existing Container App

The infrastructure was already provisioned from a previous session. `azd provision` was never needed.

---

### Phase 4: Final Commits (~10:00 PM – 12:30 AM)

| Time | Commit | What happened |
|------|--------|---------------|
| 10:08 PM | `c86d0a6` JB commit msg | Workflow file update |
| 11:56 PM | `d91b2a6` commiy under duereas | Workflow update — Deploy #9 triggered, succeeded in 54s |
| 12:17 AM | `74964b9` commiy jbarnett | Latest commit (workflow resource names updated) |

**GitHub Actions:** Deploy #9 (d91b2a6) succeeded in 54 seconds.

---

## WHAT ACTUALLY GOT BUILT

### Files changed (from first to last commit): 37 files, +5,483 lines, -815 lines

### New features added:
- **Facts Registry** (`src/db/facts-registry.ts`) — SQLite-backed fact storage with forensic analysis
- **Schema** (`src/db/schema.sql`) — Database schema for facts
- **Similarity Engine** (`src/utils/similarity.ts`) — Text similarity scoring
- **4 Test Suites** — `bbfb-engine.test.ts`, `facts-registry.test.ts`, `forensic-detection.test.ts`, `similarity.test.ts`
- **Vitest config** (`vitest.config.ts`)

### Documentation created:
- `RUNBOOK.md` — Operational procedures
- `FRAMEWORK-EVALUATION.md` — Tech stack evaluation (616 lines)
- `IMPLEMENTATION-ROADMAP.md` — Development plan (616 lines)
- `INDEX.md` — Master document index (170 lines)
- `PM-DECISION.md` — Decision log for PM review (311 lines)
- `VALIDATION-CHECKLIST.md` — Pre-deploy validation (435 lines)

### Infrastructure/config:
- `eslint.config.js` — ESLint for TypeScript + React
- `.markdownlint.json` — Markdown linting rules
- `PSScriptAnalyzerSettings.psd1` — PowerShell linter config
- `azure.yaml` — Azure Developer CLI configuration
- `.github/workflows/deploy.yml` — CI/CD pipeline
- `.github/skills/deterministic-code-quality/SKILL.md` — Copilot skill definition

---

## GITHUB ACTIONS RUNS (all on `main`)

| # | Commit | Trigger | Duration | Result |
|---|--------|---------|----------|--------|
| #7 | `490ffe6` | push | 2m 53s | ✅ Success |
| #8 | `a063061` | push | 3m 1s | ✅ Success |
| #9 | `d91b2a6` | push | 54s | ✅ Success |

---

## AZURE RESOURCES (current state)

| Resource | Name | Resource Group |
|----------|------|----------------|
| Container App | `cagroknettvalueforgaoxk4iafo3kuo` | `groknett-deploy` |
| Container Registry | `acrgroknettvaaoxk4iafo3kuo` | `groknett-deploy` |
| Container Apps Environment | (auto-created) | `groknett-deploy` |

**Note:** The workflow uses resource group `groknett-deploy` (not `groknett-rg`). The `groknett-rg` group from the original manual deployment may still exist separately.

---

## SECRETS & CREDENTIALS

| What | Where | Who created it | Status |
|------|-------|----------------|--------|
| `AZURE_CREDENTIALS` | GitHub repo → Settings → Secrets → Actions | Created automatically by `azd pipeline config` (during a Copilot session) | ✅ Working — deploys succeed |

Everything else in the workflow (resource group name, ACR name, app name, image name) is **not secret** — it's hardcoded in `.github/workflows/deploy.yml`.

---

## KEY LESSONS

1. **`azd provision` ≠ deployment.** `azd provision` creates Azure infrastructure. The GitHub Actions pipeline just *uses* that infrastructure. Once the infrastructure exists, you don't need `azd provision` again.

2. **Soft-deleted Key Vaults block redeployment.** If you delete a resource group containing a Key Vault and then try to recreate it, Azure's soft-delete/purge protection causes conflicts. Fix: `az keyvault purge --name <name>`.

3. **Local terminal ≠ GitHub Actions.** Commands in VS Code terminals run on your laptop. GitHub Actions runs on GitHub's cloud servers. They are completely separate.

4. **The yellow ⚠ on a terminal tab** just means the last command in it exited with a non-zero code. It doesn't mean anything is broken — it's just a stale error.

5. **Those 8 stale terminals can be closed.** They're old sessions that will never update again.

---

## CURRENT STATE (as of 12:30 AM, 8 March 2026)

- ✅ App is deployed and live on Azure Container Apps
- ✅ GitHub Actions CI/CD pipeline works (push to `main` → auto-deploy)
- ✅ Code passes lint + typecheck + build
- ❌ Local `azd provision` broken (Key Vault conflict) — **doesn't matter**
- ⚠ 8+ stale terminal sessions open in VS Code — **safe to close**
- ⚠ `azd` version 1.23.7 installed, 1.23.8 available — **optional update**
