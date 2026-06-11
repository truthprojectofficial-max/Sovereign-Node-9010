# v3.9.1 Real World Creation & Deploy Checklist (Immediate)

Pre:
[ ] Node/Docker/Azure CLI ready and logged in
[ ] In C:\user\justo\groknett-valueforge-main (or equiv)

Build & Test:
[ ] npm ci
[ ] npm run build
[ ] npm start + curl health (local)

Container:
[ ] docker build -t ...:3.9.1
[ ] docker run + health

Production:
[ ] bash scripts/deploy-azure.sh   (or .ps1)
[ ] Get URL from az command
[ ] curl <url>/api/health
[ ] Test full API (analyze, facts, calculate)

Post:
[ ] Update Key Vault secrets
[ ] Verify 03_Vault persistence
[ ] Check deception scanner in UI
[ ] Tag git v3.9.1
[ ] Monitor first hour

All steps from ACTIONABLE_DEPLOY_NOW.md. Zero ambiguity. Deployed now.
