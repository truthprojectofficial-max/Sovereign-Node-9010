"""
Sovereign Node 9010 v3.9.1 — Named Constants
All magic numbers centralized here for maintainability.
"""

# ============================================================
# COMPOUND BINOMIAL GATE
# ============================================================
DECEPTION_ADJUSTMENT_FACTOR = 0.35
MAX_ADJUSTED_SIGMA = 0.95
MIN_ADJUSTED_SIGMA = 0.05
THRESHOLD_PERCENTAGE = 0.85
LEARNING_DELTA_BASE = 10.0

# ============================================================
# DECEPTION SCANNER
# ============================================================
DEFAULT_UID_THRESHOLD = 0.15
DEFAULT_CONSENSUS_THRESHOLD = 0.70

# ============================================================
# TAU CEILING DEFAULTS
# ============================================================
DEFAULT_TAU_LOGIC_COHERENCE = 0.80
DEFAULT_TAU_FACT_VERIFICATION = 0.90
DEFAULT_TAU_TONE_ADHERENCE = 0.70
DEFAULT_TAU_DECEPTION_ENTROPY = 0.60

# ============================================================
# INPUT VALIDATION
# ============================================================
MAX_STATEMENT_LENGTH = 500
MIN_STATEMENT_LENGTH = 5

# ============================================================
# LOGGING
# ============================================================
LOG_FORMAT = "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
LOG_LEVEL = "INFO"
