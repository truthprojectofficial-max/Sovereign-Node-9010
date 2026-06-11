# RUNBOOK — Sovereign Node 9010 (Groknett ValueForge)

> Copy-paste-ready commands. Every section is self-contained.
> Updated: 2026-03-07 | Git: `09f12e8` on `main`

---

## A. ENVIRONMENT PREREQUISITES

Install these **before** running any commands. Check marks show what you already have.

| #   | Tool               | Min Version | Install Command (Windows)             | Verify                      |
| --- | ------------------ | ----------- | ------------------------------------- | --------------------------- |
| 1   | **Node.js**        | 22.x        | `winget install OpenJS.NodeJS.LTS`    | `node --version`            |
| 2   | **npm**            | 10.x        | Included with Node.js                 | `npm --version`             |
| 3   | **Azure CLI**      | 2.60+       | `winget install Microsoft.AzureCLI`   | `az --version`              |
| 4   | **Git**            | 2.40+       | `winget install Git.Git`              | `git --version`             |
| 5   | **GitHub CLI**     | 2.80+       | `winget install GitHub.cli`           | `gh --version`              |
| 6   | **Docker Desktop** | 4.x         | `winget install Docker.DockerDesktop` | `docker --version`          |
| 7   | **PowerShell**     | 5.1+        | Pre-installed on Windows              | `$PSVersionTable.PSVersion` |

### Quick verification — run this block to confirm everything

```powershell
node --version          # expect v22.x
npm --version           # expect 10.x
az --version            # expect 2.60+
git --version           # expect 2.40+
gh --version            # expect 2.80+
docker --version        # expect 24.x+ (only needed for local Docker testing)
```

### Azure authentication

```powershell
az login                             # opens browser, sign in with justbeme@outlook.com
az account set --subscription "89238eae-c7cf-41c6-b4d8-bba51519879c"
az account show --query "{name:name, id:id}" -o table
```

### GitHub authentication

```powershell
gh auth login --web --git-protocol https
gh auth status                       # expect: Logged in to github.com as beendaer
```

---

## B. REPRODUCIBLE INSTRUCTION LIST (From Zero)

Follow these in order. Each step is copy-paste ready.

### B1. Get the code

```powershell
git clone https://github.com/beendaer/groknett-valueforge.git
cd groknett-valueforge
```

### B2. Install dependencies

```powershell
npm install
```

### B3. Create local environment file

```powershell
Copy-Item .env.example .env
```

Then edit `.env` to contain:

```ini
PORT=8000
DB_PATH=./data/database.sqlite
```

### B4. Validate code quality (lint, types, build)

```powershell
npm run lint           # ESLint — expect: 0 errors, 0 warnings
npm run typecheck      # TypeScript — expect: 0 errors
npm run build          # Vite build — expect: dist/ created
```

### B5. Local smoke test

```powershell
# Terminal 1 — start server
$env:PORT = "8000"; $env:DB_PATH = "./data/database.sqlite"; npx tsx server.ts

# Terminal 2 — test endpoints (open a second PowerShell)
Invoke-RestMethod http://localhost:8000/api/health
# Expected: status = operational, node = SOVEREIGN-NODE-9010, version = 3.9.1
```

Stop server with `Ctrl+C` when done.

### B6. Docker local test (optional)

```powershell
docker build -t groknett-valueforge:latest .
docker run -d -p 8000:8000 --name gvf-test groknett-valueforge:latest
Invoke-RestMethod http://localhost:8000/api/health
docker stop gvf-test; docker rm gvf-test
```

### B7. Register Azure resource providers (first-time only)

```powershell
az provider register --namespace Microsoft.ContainerRegistry
az provider register --namespace Microsoft.App
az provider register --namespace Microsoft.OperationalInsights
az provider register --namespace Microsoft.Storage
az provider register --namespace Microsoft.KeyVault
```

### B8. Deploy to Azure

```powershell
.\deploy-azure.ps1
```

This runs 8 steps automatically (Resource Group → ACR → Storage → Key Vault → Container Apps Env → Mount → Deploy → Health probes). Takes ~5-10 min on first run.

### B9. Verify live deployment

```powershell
$fqdn = az containerapp show --name groknett-valueforge-app --resource-group groknett-rg --query "properties.configuration.ingress.fqdn" -o tsv
Invoke-RestMethod "https://$fqdn/api/health"
```

### B10. Set up CI/CD (first-time only)

```powershell
# Create service principal (save the JSON output)
az ad sp create-for-rbac --name "groknett-cicd" --role Contributor --scopes /subscriptions/89238eae-c7cf-41c6-b4d8-bba51519879c --sdk-auth

# Add JSON output as GitHub secret
gh secret set AZURE_CREDENTIALS --repo beendaer/groknett-valueforge
# Paste the full JSON when prompted, then press Ctrl+D (or Enter then Ctrl+Z on Windows)
```

After this, every push to `main` auto-deploys via GitHub Actions.

---

## C. COMMAND REFERENCE (Quick Copy-Paste)

### Day-to-day development

| Task                    | Command             |
| ----------------------- | ------------------- |
| Start dev servers       | `npm run dev`       |
| Lint                    | `npm run lint`      |
| Auto-fix lint           | `npm run lint:fix`  |
| Format code             | `npm run format`    |
| Type check              | `npm run typecheck` |
| Production build        | `npm run build`     |
| Start production server | `npm start`         |

### Git workflow

| Task                             | Command                       |
| -------------------------------- | ----------------------------- |
| Check status                     | `git status`                  |
| Stage all changes                | `git add .`                   |
| Commit                           | `git commit -m "description"` |
| Push to GitHub (triggers deploy) | `git push`                    |
| View recent commits              | `git log --oneline -10`       |

### Azure management

| Task                    | Command                                                                                                                                                                                                                          |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Login                   | `az login`                                                                                                                                                                                                                       |
| Show subscription       | `az account show -o table`                                                                                                                                                                                                       |
| View container app logs | `az containerapp logs show --name groknett-valueforge-app --resource-group groknett-rg --follow`                                                                                                                                 |
| View app config         | `az containerapp show --name groknett-valueforge-app --resource-group groknett-rg -o table`                                                                                                                                      |
| Restart app             | `az containerapp revision restart --name groknett-valueforge-app --resource-group groknett-rg --revision $(az containerapp revision list --name groknett-valueforge-app --resource-group groknett-rg --query "[0].name" -o tsv)` |
| View Key Vault secrets  | `az keyvault secret list --vault-name groknett-kv -o table`                                                                                                                                                                      |
| Update a secret         | `az keyvault secret set --vault-name groknett-kv --name AuditSecret --value "NEW-VALUE"`                                                                                                                                         |
| Check CI/CD run status  | `gh run list --repo beendaer/groknett-valueforge --limit 5`                                                                                                                                                                      |
| Trigger manual deploy   | `gh workflow run deploy.yml --repo beendaer/groknett-valueforge`                                                                                                                                                                 |
| View workflow run log   | `gh run view --repo beendaer/groknett-valueforge --log`                                                                                                                                                                          |

### Docker commands

| Task                | Command                                                            |
| ------------------- | ------------------------------------------------------------------ |
| Build image         | `docker build -t groknett-valueforge:latest .`                     |
| Run container       | `docker run -d -p 8000:8000 --name gvf groknett-valueforge:latest` |
| View container logs | `docker logs gvf --tail 50`                                        |
| Stop and remove     | `docker stop gvf; docker rm gvf`                                   |

### ACR (Azure Container Registry)

| Task                | Command                                                                                      |
| ------------------- | -------------------------------------------------------------------------------------------- |
| Build + push to ACR | `az acr build --registry groknettacr --image groknett-valueforge:latest --file Dockerfile .` |
| List images         | `az acr repository list --name groknettacr -o table`                                         |
| Show tags           | `az acr repository show-tags --name groknettacr --repository groknett-valueforge -o table`   |

---

## D. TROUBLESHOOTING

### D1. Local development issues

| Problem                     | Cause                               | Fix                                                                                                                   |
| --------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Port 8000 already in use    | Another process on port 8000        | `netstat -ano \| Select-String ":8000.*LISTENING"` then `Stop-Process -Id <PID> -Force` — or use `$env:PORT = "8001"` |
| `npm ci` fails with EPERM   | Locked files in node_modules        | Delete `node_modules` folder, then run `npm install` instead                                                          |
| `npx tsx` not found         | tsx not installed                   | `npm install` (it is a transitive dependency)                                                                         |
| SQLite file locked error    | Another server process holds the DB | Stop all running server instances first                                                                               |
| `npm run lint` shows errors | Code quality issues                 | Run `npm run lint:fix` to auto-fix, manually resolve the rest                                                         |
| `npm run typecheck` fails   | TypeScript errors in code           | Check the error file/line; ensure types.ts and sql-js.d.ts are present                                                |
| Build fails                 | Missing dependencies or bad imports | Run `npm install`, then `npm run build` again                                                                         |

### D2. Docker issues

| Problem                        | Cause                             | Fix                                                                      |
| ------------------------------ | --------------------------------- | ------------------------------------------------------------------------ |
| `docker build` fails on npm ci | Package lock mismatch             | Delete `package-lock.json`, run `npm install` locally, then rebuild      |
| Container exits immediately    | Server crash on startup           | `docker logs <container>` — check for missing env vars or port conflicts |
| HEALTHCHECK failing            | App not responding on /api/health | Check container logs: `docker logs gvf --tail 30`                        |
| Image too large                | node_modules bloat                | Ensure `.dockerignore` excludes `node_modules`, `.git`, `dist`           |

### D3. Azure deployment issues

| Problem                                       | Cause                            | Fix                                                                                                  |
| --------------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `az login` expired                            | Token expired                    | Run `az login` again                                                                                 |
| `az acr build` fails                          | Registry doesn't exist yet       | Ensure step 2 (ACR create) ran first                                                                 |
| `az containerapp create` fails with SKU error | Region capacity                  | Try `--sku B1` or a different region                                                                 |
| Storage mount not working                     | Storage key changed              | Re-run step 6: `az containerapp env storage set ...` with new key                                    |
| App returns 502/503                           | Container failing to start       | Run `az containerapp logs show --name groknett-valueforge-app --resource-group groknett-rg --follow` |
| Health check fails after deploy               | Container still starting up      | Wait 60 seconds; startup probe allows up to 50s (5s x 10 retries)                                    |
| REST PATCH (step 8) fails                     | API version mismatch             | Check `az version`; update Azure CLI: `az upgrade`                                                   |
| `Standard_ZRS` error on storage               | Region doesn't support ZRS       | Already fixed — script uses `Standard_LRS`                                                           |
| Resource provider not registered              | First deployment on subscription | Run the provider registration commands in section B7                                                 |

### D4. CI/CD issues

| Problem                      | Cause                              | Fix                                                                                                                                                                                  |
| ---------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| GitHub Actions fails on push | Missing `AZURE_CREDENTIALS` secret | Add the secret: `gh secret set AZURE_CREDENTIALS --repo beendaer/groknett-valueforge` (paste service principal JSON)                                                                 |
| Deploy job fails "az login"  | Service principal expired          | Re-create: `az ad sp create-for-rbac --name "groknett-cicd" --role Contributor --scopes /subscriptions/89238eae-c7cf-41c6-b4d8-bba51519879c --sdk-auth` and update the GitHub secret |
| Deploy steps are skipped with a warning about subscription state | Azure subscription is not `Enabled` | Check subscription status/billing in Azure, then re-run the workflow after `az account show --query state --output tsv` returns `Enabled` |
| Workflow not triggering      | Push to wrong branch               | Workflow triggers on `main` only; check `git branch`                                                                                                                                 |
| `gh` auth fails with 403     | Missing `workflow` scope           | `gh auth refresh --scopes workflow`                                                                                                                                                  |
| Health check step fails      | App still deploying                | The workflow waits 30s; if not enough, increase `sleep` in deploy.yml                                                                                                                |

### D5. Quick diagnostic script

Run this to check everything at once:

```powershell
Write-Host "=== Local ===" -ForegroundColor Cyan
node --version
npm --version
git log --oneline -1

Write-Host "`n=== Azure ===" -ForegroundColor Cyan
az account show --query "{sub:name, id:id}" -o table

Write-Host "`n=== Container App ===" -ForegroundColor Cyan
$fqdn = az containerapp show --name groknett-valueforge-app --resource-group groknett-rg --query "properties.configuration.ingress.fqdn" -o tsv
$health = Invoke-RestMethod "https://$fqdn/api/health"
Write-Host "URL:     https://$fqdn"
Write-Host "Status:  $($health.status)"
Write-Host "Version: $($health.version)"

Write-Host "`n=== GitHub ===" -ForegroundColor Cyan
gh auth status
gh run list --repo beendaer/groknett-valueforge --limit 3

Write-Host "`n=== ACR ===" -ForegroundColor Cyan
az acr repository show-tags --name groknettacr --repository groknett-valueforge -o table
```

---

## E. INFRASTRUCTURE VALUES (Reference)

| Resource              | Name                                                                              | Key Detail                                     |
| --------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------- |
| Subscription          | `89238eae-c7cf-41c6-b4d8-bba51519879c`                                            | Pay-as-you-go                                  |
| Tenant                | `8866ce38-3627-49b9-978b-dab99cfe2e41`                                            | justobemeoutlook.onmicrosoft.com               |
| Resource Group        | `groknett-rg`                                                                     | australiaeast                                  |
| Container App         | `groknett-valueforge-app`                                                         | 0.5 CPU, 1 GiB, 1-3 replicas                   |
| Container Environment | `groknett-env`                                                                    | Storage mount: sqlitedata                      |
| Container Registry    | `groknettacr`                                                                     | Basic SKU, admin enabled                       |
| Storage Account       | `groknettstorage`                                                                 | Standard_LRS                                   |
| File Share            | `groknett-data`                                                                   | 1 GB, mounted at /mnt/data                     |
| Key Vault             | `groknett-kv`                                                                     | Secret: AuditSecret (placeholder)              |
| Service Principal     | `groknett-cicd`                                                                   | clientId: a123cd9c-b364-48b0-950b-65cf773359ba |
| GitHub Repo           | `beendaer/groknett-valueforge`                                                    | Private, main branch                           |
| Live URL              | `groknett-valueforge-app.blackocean-6e9dabfd.australiaeast.azurecontainerapps.io` | HTTPS only                                     |

---

## F. TEARDOWN (Destroy Everything)

**Action needed:** Only run this if you want to delete ALL Azure resources. Irreversible.

```powershell
# 1. Download database first (if needed)
$key = az storage account keys list --account-name groknettstorage --resource-group groknett-rg --query "[0].value" -o tsv
az storage file download --account-name groknettstorage --account-key $key --share-name groknett-data --path database.sqlite --dest ./data/database.sqlite

# 2. Delete entire resource group (all resources inside it)
az group delete --name groknett-rg --yes --no-wait

# 3. Purge Key Vault soft-delete
az keyvault purge --name groknett-kv --location australiaeast

# 4. Delete service principal (optional)
az ad sp delete --id a123cd9c-b364-48b0-950b-65cf773359ba
```

---

_Runbook — Sovereign Node 9010 | 2026-03-07_
