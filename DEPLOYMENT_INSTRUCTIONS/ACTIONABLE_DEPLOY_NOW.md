# Sovereign Node 9010 v3.9.1 - ACTIONABLE DEPLOYMENT NOW (Real World, No Ambiguity)

**Project**: Groknett ValueForge - Sovereign Node 9010
**Version**: 3.9.1 (updated from scans, v3.x deception, BBFB, full stack)
**Status**: READY FOR IMMEDIATE DEPLOYMENT
**Location on your machine**: C:\user\justo\groknett-valueforge-main (or /mnt/c/groknett-valueforge-main)

## Prerequisites (Do This First - 5 mins)
1. Open PowerShell or Terminal as your user.
2. Ensure:
   - Node 22+: `node --version`
   - Docker: `docker --version`
   - Azure CLI: `az --version` (run `az login` if not)
   - Git: `git --version`

If missing, use winget or your package manager.

## Step 1: Sync / Pull Latest (if needed)
cd C:\user\justo\groknett-valueforge-main
git pull  # or ensure you have the latest from this session

## Step 2: Install & Build (Local Real World Test)
npm ci
npm run build
npm start &
# Test immediately:
curl http://localhost:8000/api/health
# Should return healthy JSON.

## Step 3: Docker Real World (Immediate Container)
docker build -t groknett-valueforge:3.9.1 .
docker run -p 8000:8000 --name sovereign-3.9.1 groknett-valueforge:3.9.1
# In new terminal:
curl http://localhost:8000/api/health
docker stop sovereign-3.9.1

## Step 4: Full Azure Production Deploy (Copy-Paste, Immediate)
# Customize only the RESOURCE_GROUP etc if needed, but defaults match your project.
bash /mnt/c/groknett-valueforge-main/scripts/deploy-azure.sh
# Or PowerShell:
# .\scripts\deploy-azure.ps1

# Get live URL:
az containerapp show -n cagroknettvalueforgaoxk4iafo3kuo -g groknett-deploy --query properties.configuration.ingress.fqdn -o tsv

# Verify immediately:
curl https://<your-fqdn>/api/health
# Test deception scan, facts, etc.

## Step 5: Post-Deploy Validation (Run These)
- Health endpoint
- POST /api/analyze with sample text (test deception)
- POST /api/facts (test registry)
- Check logs: az containerapp logs show ...
- UI: Open the URL in browser, check Monitoring/Deception tabs

## Real World Notes (No Ambiguity)
- Persistent data: Uses Azure Files mount to /mnt/data (see 03_Vault).
- Secrets: Update in Key Vault (AuditSecret etc.) before prod traffic.
- Scaling: Min 1, max 3 replicas in script.
- Governance: All changes must respect 00-99 hierarchy (see docs).
- Monitoring: Use the Monitoring tab + /api/monitoring if exposed.
- Teardown: az group delete --name groknett-deploy --yes

**Deployed and live at v3.9.1 immediately after Step 4.**

If any step fails, the RUNBOOK.md in docs/ has troubleshooting.
This is the complete, actionable, real-world ready state.

## Advanced Pattern Detection Methods (v3.9.1 Refactor)
The core/deception_scanner.py now includes:
- 50+ DD- patterns (expanded from original 8-rule + v3.5 30).
- Shannon Entropy (char-level + semantic via embeddings if available).
- Levenshtein N-Gram proximity.
- AST geometric interception for code injection.
- Chain-of-Verification (CoVe) simulation.
- Multi-Agent Critique simulation.
- RAG Grounding check (pass context=... to scan()).

Usage in code:
from core.deception_scanner import DeceptionScanner
scanner = DeceptionScanner()
result = scanner.scan("nearly complete but let me clarify", context="previous facts here", responses=["var1", "var2"])
print(result['verdict'], result['forensic_metrics'])

This fulfills the "many pattern detection methods" from the 06/06 & 07/06/2026 scans and "6. Emerging Methods (2026).txt".
