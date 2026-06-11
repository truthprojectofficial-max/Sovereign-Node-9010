# Sovereign Node 9010 (Groknett ValueForge) - Real World Deployment Guide v3.9.1

**Status**: READY FOR IMMEDIATE DEPLOYMENT  
**No Ambiguity**: Follow steps in exact order. All commands copy-paste ready.  
**Target**: Production (Azure Container Apps recommended) or Local/Docker for testing.

## Prerequisites (Real World)
- Node.js 22+
- Docker Desktop
- Azure CLI + logged in (`az login`)
- Git
- (For Azure) Subscription access

Verify:
```bash
node --version
docker --version
az --version
```

## 1. Clone & Setup (if not already)
```bash
git clone <your-repo-url> groknett-valueforge-main
cd groknett-valueforge-main
npm ci
```

## 2. Local Real-World Test (Immediate Verification)
```bash
npm run build
npm start
# In another terminal: curl http://localhost:8000/api/health
```

## 3. Docker Real-World Build & Run (Immediate)
```bash
docker build -t groknett-valueforge:3.9.1 .
docker run -p 8000:8000 groknett-valueforge:3.9.1
# Verify: curl http://localhost:8000/api/health
```

## 4. Azure Production Deployment (Immediate - One Command)
```bash
# 1. Login if needed
az login

# 2. Run the provided deploy script (customize vars first)
bash scripts/deploy-azure.sh

# 3. Get URL
az containerapp show -n cagroknettvalueforgaoxk4iafo3kuo -g groknett-deploy --query properties.configuration.ingress.fqdn -o tsv
```

## 5. Post-Deploy Verification (No Ambiguity)
- Health: https://<your-url>/api/health
- Facts: POST to /api/facts with valid payload
- Run: `npm run lint && npm run typecheck`

## Real World Creation Notes
- Use 03_Vault for persistent facts (mount volume in prod).
- Enable NIZK/Merkle in production config.
- Monitor deception scores in UI.
- Update secrets in Key Vault before go-live.
- Follow 00-99 Governance for any changes.

**Deployed at v3.9.1** - Ready immediately after this setup.
