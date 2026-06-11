"""
Sovereign Node 9010 v3.9.1 — Configuration
Central configuration with environment variable fallbacks.
Deterministic defaults that work on Windows, Linux, macOS.
"""

import os
from pathlib import Path

# ============================================================
# PROJECT-RELATIVE DATA DIRECTORY (deterministic + portable)
# ============================================================
# Resolves relative to this config.py file so it works no matter
# where you run the project from (critical for deterministic deployment).
_PROJECT_ROOT = Path(__file__).resolve().parent
DATA_DIR = _PROJECT_ROOT / "data"
VAULT_DIR = DATA_DIR / "vault"
LOGS_DIR = DATA_DIR / "logs"

# Create on import (safe, idempotent)
for _d in (DATA_DIR, VAULT_DIR, LOGS_DIR):
    _d.mkdir(parents=True, exist_ok=True)

# ============================================================
# DATABASE & STORAGE (env overrides supported for CI / prod)
# ============================================================
SOVEREIGN_DB_PATH = os.getenv("SOVEREIGN_DB_PATH", str(VAULT_DIR / "facts_registry.db"))

SOVEREIGN_LEDGER_PATH = os.getenv("SOVEREIGN_LEDGER_PATH", str(VAULT_DIR / "facts_registry.json"))

# ============================================================
# DECEPTION SCANNER THRESHOLDS
# ============================================================
UID_THRESHOLD = float(os.getenv("UID_THRESHOLD", "0.15"))
CONSENSUS_THRESHOLD = float(os.getenv("CONSENSUS_THRESHOLD", "0.70"))

# ============================================================
# TAU CEILINGS (BBFB Engine)
# ============================================================
TAU_CEILINGS = {
    "logic_coherence": float(os.getenv("TAU_LOGIC_COHERENCE", "0.80")),
    "fact_verification": float(os.getenv("TAU_FACT_VERIFICATION", "0.90")),
    "tone_adherence": float(os.getenv("TAU_TONE_ADHERENCE", "0.70")),
    "deception_entropy": float(os.getenv("TAU_DECEPTION_ENTROPY", "0.60")),
}

# ============================================================
# COMPOUND BINOMIAL GATE DEFAULTS
# ============================================================
DEFAULT_S0 = float(os.getenv("DEFAULT_S0", "55.0"))
DEFAULT_K1 = float(os.getenv("DEFAULT_K1", "18.0"))
DEFAULT_K2 = float(os.getenv("DEFAULT_K2", "10.0"))
DEFAULT_T1 = float(os.getenv("DEFAULT_T1", "3.0"))
DEFAULT_T2 = float(os.getenv("DEFAULT_T2", "3.0"))
DEFAULT_R = float(os.getenv("DEFAULT_R", "0.05"))
DEFAULT_SIGMA1 = float(os.getenv("DEFAULT_SIGMA1", "0.30"))
DEFAULT_SIGMA2 = float(os.getenv("DEFAULT_SIGMA2", "0.20"))
DEFAULT_N1 = int(os.getenv("DEFAULT_N1", "3"))
DEFAULT_N2 = int(os.getenv("DEFAULT_N2", "3"))

# ============================================================
# BACKWARD-COMPATIBLE ALIASES (for existing imports)
# ============================================================
BASE_DIR = DATA_DIR
# VAULT_DIR already defined above

# ============================================================
# DEVSECOPS WORKSTATION PROFILE (in-program awareness - no extra agents)
# ============================================================
# Loaded from the integrated DevSecOps toolkit if present.
# Provides deterministic knowledge of WSL caps, GPU policy, baseline mode etc.
# See 04_Validation/DevSecOps/config_resources.json and the Workstation Guide.
DEVSECOPS_RESOURCES: dict = {"baseline_mode": "deterministic"}
try:
    _ds_path = _PROJECT_ROOT.parent / "04_Validation" / "DevSecOps" / "config_resources.json"
    if _ds_path.exists():
        import json as _json
        DEVSECOPS_RESOURCES = _json.loads(_ds_path.read_text(encoding="utf-8"))
except Exception:
    pass  # Safe fallback; never break startup for optional profile

# Optional convenience: expose key values
WSL_MEMORY_GB = DEVSECOPS_RESOURCES.get("wsl_memory_gb", 16)
WSL_PROCESSORS = DEVSECOPS_RESOURCES.get("wsl_processors", 8)
