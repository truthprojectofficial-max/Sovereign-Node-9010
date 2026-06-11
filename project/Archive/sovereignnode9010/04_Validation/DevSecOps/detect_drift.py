#!/usr/bin/env python3
"""
Thin CLI wrapper for Inside-TAU DevSecOps Drift Detector.
Located here for easy discovery alongside the PowerShell scripts and golden profile.
All real logic lives in 02_Technical/devsecops_drift_detector.py (inside the engine).

AUTOMATIC AFFIDAVIT BEHAVIOR (default ON):
On any CRITICAL drift (or Tau DEFER), a full Section 177 legal affidavit is
automatically generated at detection time. The specific triggering fact_uuid
is embedded in the affidavit addendum.

"Failure is the saving grace" — the script exits non-zero (1) on critical drift
by default so Azure Pipelines and other CI systems fail the build automatically.
This is intentional and the primary human-error prevention mechanism.
"""

import sys
from pathlib import Path

# Ensure the core module is importable when running from this folder
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT / "02_Technical"))

from devsecops_drift_detector import main

if __name__ == "__main__":
    main()
