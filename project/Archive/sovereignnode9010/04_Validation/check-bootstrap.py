#!/usr/bin/env python3
"""
Mandatory pre-work checker.
Used by server.py, Docker ENTRYPOINT, and pipelines.
Exits non-zero if BOOTSTRAP_COMPLETE marker is missing.
This is the gate that prevents human/AI deployment errors.
"""
import sys
from pathlib import Path

def main():
    # When running inside container, the workspace root is /workspace
    # On host it is the project root
    candidates = [
        Path("/workspace/04_Validation/BOOTSTRAP_COMPLETE"),
        Path.cwd().parent / "04_Validation" / "BOOTSTRAP_COMPLETE",  # when running from 02_Technical
        Path.cwd() / "04_Validation" / "BOOTSTRAP_COMPLETE",
    ]

    marker = next((p for p in candidates if p.exists()), None)

    if not marker:
        print("\n" + "="*70, file=sys.stderr)
        print("FATAL: MANDATORY PRE-WORK NOT COMPLETED (container/host)", file=sys.stderr)
        print("="*70, file=sys.stderr)
        print("The strict bootstrap must run before the node starts.", file=sys.stderr)
        print("This guarantees deterministic, portable, error-free deployment.", file=sys.stderr)
        print("", file=sys.stderr)
        print("On host:  .\\04_Validation\\Strict-Bootstrap-SovereignNode9010.ps1", file=sys.stderr)
        print("In CI:    The pipeline runs it automatically as first step.", file=sys.stderr)
        print("="*70 + "\n", file=sys.stderr)
        sys.exit(1)

    print(f"[OK] Pre-work verified via {marker}")
    return 0

if __name__ == "__main__":
    sys.exit(main())