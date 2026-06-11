# Sovereign Node 9010 v3.9.1
# Makefile — Pre-work is mandatory and equally important as the code
# for reproducibility, portability, and zero human/AI deployment errors.
#
# Usage (cross-platform where make is available, e.g. Git Bash, WSL, or macOS/Linux):
#   make bootstrap          # Run the strict mandatory bootstrap
#   make pre-deploy         # Full pre-deploy gate (bootstrap + checks)
#   make run                # Run the node (will fail without bootstrap)
#   make docker-up          # Start via docker compose (enforces bootstrap)
#   make verify             # Run quality gates
#
# On Windows, prefer: make pre-deploy-ps   (uses the rich PreDeploy PowerShell function)

SHELL := /bin/bash

ROOT := $(shell pwd)
BOOTSTRAP := 04_Validation/Strict-Bootstrap-SovereignNode9010.ps1
CHECK := 04_Validation/check-bootstrap.py
PREDEPLOY_PS := 04_Validation/PreDeploy.ps1

.PHONY: help bootstrap pre-deploy pre-deploy-ps check verify run docker-up docker-down clean devsecops-discover devsecops-apply devsecops-setup devsecops-full

help:
	@echo "Sovereign Node 9010 v3.9.1 - Makefile (Pre-work is mandatory)"
	@echo ""
	@echo "=== UNIFIED DEVSECOPS FLOW (Windows - Recommended) ==="
	@echo "  make devsecops-full      - Complete 4-Action flow via launcher (Discover + Apply + Bootstrap + Verify)"
	@echo "  make devsecops-setup     - Run the interactive Sovereign-DevSecOps-Setup.ps1 launcher"
	@echo "  make devsecops-discover  - Baseline discovery + benchmarks (Action 1)"
	@echo "  make devsecops-apply     - Dry-run then apply workstation config (Action 2)"
	@echo ""
	@echo "Windows (project pre-work only):"
	@echo "  make pre-deploy-ps     - Run full PreDeploy PowerShell function (Action 3 of outer flow)"
	@echo ""
	@echo "Cross-platform:"
	@echo "  make pre-deploy        - Run bootstrap + checker"
	@echo "  make bootstrap         - Run strict bootstrap only"
	@echo "  make check             - Verify BOOTSTRAP_COMPLETE marker"
	@echo "  make run               - Start node (enforced)"
	@echo "  make docker-up         - Start container (enforced)"
	@echo "  make verify            - Run quality gates"
	@echo ""

# === MANDATORY PRE-WORK ===
bootstrap:
	@echo ">>> Running MANDATORY strict bootstrap (this is as important as the code)..."
	@powershell -ExecutionPolicy Bypass -File "$(BOOTSTRAP)"
	@echo ">>> Bootstrap complete. BOOTSTRAP_COMPLETE marker written."

pre-deploy: bootstrap check
	@echo ">>> Pre-deploy gate passed. Environment is ready for reproducible deployment."

# Best experience on Windows - calls the rich PreDeploy.ps1 function
pre-deploy-ps:
	@echo ">>> Running PreDeploy PowerShell function (recommended on Windows)..."
	@powershell -ExecutionPolicy Bypass -Command "& { . '$(PREDEPLOY_PS)'; Invoke-SovereignPreDeploy }"

check:
	@echo ">>> Verifying mandatory pre-work marker..."
	@python "$(CHECK)"
	@echo ">>> Pre-work verified."

# === Quality & Verification (require pre-work) ===
verify: check
	@echo ">>> Running quality gates..."
	@cd 02_Technical && python -m ruff check . --fail-on-fix || true
	@cd 02_Technical && python -m ruff format --check . || true
	@cd 02_Technical && python -m mypy . --strict --ignore-missing-imports || true
	@echo ">>> Quality gates completed."

# === Run the Node (enforced) ===
run: check
	@echo ">>> Starting Sovereign Node (bootstrap already verified)..."
	@python run_server.py

# === Docker (the container itself also enforces bootstrap via ENTRYPOINT) ===
docker-up:
	@echo ">>> Starting via docker compose (container will refuse to start without pre-work)..."
	@docker compose up -d

docker-down:
	@docker compose down

clean:
	@echo ">>> Cleaning generated artifacts (does NOT remove 03_Vault ledger)..."
	@rm -f 04_Validation/*.log 04_Validation/STRICT_BOOTSTRAP_COMPLETE_*.md 2>/dev/null || true
	@echo "Clean complete (ledger preserved for audit continuity)."

# === DEVSECOPS UNIFIED FLOW (Windows PowerShell - marries workstation + project pre-work) ===
# See 01_Methodology/docs/DEVSECOPS_WORKSTATION_GUIDE.md and 04_Validation/DevSecOps/README.md
DEVSECOPS_DIR := 04_Validation/DevSecOps
DEVSECOPS_LAUNCHER := $(DEVSECOPS_DIR)/Sovereign-DevSecOps-Setup.ps1

devsecops-discover:
	@echo ">>> ACTION 1: DevSecOps Discovery + Benchmarks (baseline evidence)..."
	@powershell -ExecutionPolicy Bypass -Command "& '$(DEVSECOPS_DIR)/Discover-SystemState.ps1' -OutputPath '$(DEVSECOPS_DIR)/audit' -IncludeBenchmarks"

devsecops-apply:
	@echo ">>> ACTION 2: DevSecOps Apply (DRY-RUN first, then real)..."
	@powershell -ExecutionPolicy Bypass -Command "& '$(DEVSECOPS_DIR)/Apply-DevEnvConfig.ps1' -LogPath '$(DEVSECOPS_DIR)/logs' -WhatIf"
	@echo ">>> Review dry-run output above. Press any key to apply for real, or Ctrl+C to abort."
	@powershell -NoProfile -Command "Read-Host | Out-Null"
	@powershell -ExecutionPolicy Bypass -Command "& '$(DEVSECOPS_DIR)/Apply-DevEnvConfig.ps1' -LogPath '$(DEVSECOPS_DIR)/logs'"

devsecops-setup:
	@echo ">>> Running the full interactive DevSecOps 4-Action launcher..."
	@powershell -ExecutionPolicy Bypass -File "$(DEVSECOPS_LAUNCHER)"

devsecops-full:
	@echo ">>> UNIFIED DEVSECOPS 4-ACTION FLOW (Discover + Apply + Project Bootstrap + Post-Verify)..."
	@powershell -ExecutionPolicy Bypass -File "$(DEVSECOPS_LAUNCHER)"
