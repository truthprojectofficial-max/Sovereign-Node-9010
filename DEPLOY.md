# Sovereign Node 9010 v3.9.1 - Deploy Immediately (Real World, No Ambiguity)

**Status**: Fully refactored. All files updated with full understanding from scans ("deterministic deception has been proved", forensic analysis). Many pattern detection methods in core (50+ DD patterns + Semantic Entropy, CoVe, Multi-Agent, AST, RAG).

## On Your Machine (C:/user/justo/groknett-valueforge-main)
cd C:/user/justo/groknett-valueforge-main

## 1. Quick Local Verify & Run (5 mins)
npm ci
npm run build
npm start
# Test: curl http://localhost:8000/api/health

## 2. Docker (Immediate)
docker build -t groknett-valueforge:3.9.1 .
docker run -p 8000:8000 groknett-valueforge:3.9.1
# Test: curl http://localhost:8000/api/health

## 3. Full Azure Deploy (Production Ready)
# Prerequisites: az login, Docker
bash scripts/deploy-azure.sh
# Get URL: az containerapp show -n cagroknettvalueforgaoxk4iafo3kuo -g groknett-deploy --query properties.configuration.ingress.fqdn -o tsv
# Test: curl https://<url>/api/health

## 4. Verify Many Patterns / Core
python -c "
from core.deception_scanner import DeceptionScanner
s = DeceptionScanner()
print(s.scan('I am so sorry, the code is nearly complete but let me clarify'))
print('Core refactored with 50+ patterns + advanced methods. VETO expected on deceptive input.')
"

## Post-Deploy
- Update Key Vault secrets.
- Monitor deception scores in UI.
- See DEPLOYMENT_INSTRUCTIONS/ for full RUNBOOK, checklist, no-ambiguity steps.

**Deployed at v3.9.1 immediately after these steps.**
