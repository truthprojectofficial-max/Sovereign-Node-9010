#!/usr/bin/env python3
"""
Sovereign Node 9010 — DevSecOps 90/10 Tau Grace Bow-Out Stress, Gap & Edge Test Suite

Purpose:
- Explicitly test the 90/10 Tau Grace Bow-Out policy (user's call) for workstation drift.
- Identify gaps, fragile edges, and stress points in the current implementation.
- Generate synthetic discovery states at various Tau extraction levels.
- Report clearly when the bow-out threshold is (or is not) correctly enforced.

Run from project root:
    PYTHONPATH=02_Technical python 04_Validation/DevSecOps/Stress-Test-90-10-Tau-Grace-Bowout.py
"""

import json
import tempfile
from pathlib import Path
from datetime import UTC, datetime

# Make the detector importable
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent / "02_Technical"))

from devsecops_drift_detector import DevSecOpsDriftDetector


def make_fake_discovery(**kwargs):
    """Create a controlled fake discovery JSON. Accepts overrides for drifted fields."""
    # Defaults = perfect golden state
    powerplan = kwargs.get("powerplan", "Best performance")
    fast_startup = kwargs.get("fast_startup", False)
    long_paths = kwargs.get("long_paths", True)
    wsl_mem = kwargs.get("wsl_mem", "16GB")
    wsl_proc = kwargs.get("wsl_proc", 8)
    telemetry = kwargs.get("telemetry", 0)
    diagtrack = kwargs.get("diagtrack", "Disabled")
    git_autocrlf = kwargs.get("git_autocrlf", "true")

    disc = {
        "Meta": {
            "Timestamp": datetime.now(UTC).isoformat(),
            "ComputerName": "STRESS-TEST-90-10"
        },
        "OS_Power": {
            "PowerPlan_Active": powerplan,
            "FastStartup_Enabled": fast_startup,
            "LongPathsEnabled": long_paths
        },
        "WSL": {
            "WSL2_MemoryLimit_GB": wsl_mem,
            "WSL2_Processors": wsl_proc
        },
        "Security_Telemetry": {
            "AllowTelemetry": telemetry,
            "DiagTrack_Service": diagtrack
        },
        "Software": {
            "Git": {"core_autocrlf": git_autocrlf}
        }
    }
    return disc


def run_scenario(name: str, description: str, discovery_overrides: dict, expected_bow_out: bool):
    """Run one controlled stress/edge scenario."""
    print(f"\n{'='*70}")
    print(f"SCENARIO: {name}")
    print(f"Description: {description}")
    print(f"Expected bow-out (Tau >= 0.10): {expected_bow_out}")

    disc = make_fake_discovery(**discovery_overrides)
    tmp = Path(tempfile.mkdtemp())
    path = tmp / "discovery.json"
    path.write_text(json.dumps(disc))

    detector = DevSecOpsDriftDetector(auto_generate_affidavit=True)
    result = detector.detect_and_validate(str(path), submit_to_engine=False)  # no-submit for pure policy test

    drift = result.get("devsecops_drift", {})
    tau = drift.get("tau_extracted", 0.0)
    bow_out = drift.get("bow_out_required", False)
    critical = drift.get("critical_count", 0)

    print(f"  Tau extracted     : {tau:.4f}")
    print(f"  Bow-out required  : {bow_out}")
    print(f"  Critical items    : {critical}")
    print(f"  should_fail       : {result.get('should_fail_pipeline')}")

    status = "PASS" if bow_out == expected_bow_out else "!!! GAP / EDGE FAILURE !!!"
    print(f"  RESULT: {status}")

    if bow_out != expected_bow_out:
        print("  *** This is a gap or edge case that needs attention. ***")

    return {"name": name, "tau": tau, "bow_out": bow_out, "expected": expected_bow_out, "status": status}


def main():
    print("Sovereign Node 9010 — 90/10 Tau Grace Bow-Out Stress Test Suite")
    print("Policy: 90% grace window. At 10% Tau extraction -> mandatory bow-out (affidavit + fail).")
    print("This is the user's explicit policy call.\n")

    scenarios = [
        # Clean baseline
        ("CLEAN", "No drift at all — perfect workstation", {}, False),

        # Grace zone (under 10%)
        ("ONE_MINOR", "Single HIGH item only (should stay in grace)", 
         {"git_autocrlf": "false"}, False),

        ("TWO_HIGH", "Two HIGH items (still under ~5-6% Tau)", 
         {"git_autocrlf": "false", "wsl_mem": "8GB"}, False),

        # Near the edge
        ("NEAR_EDGE_09", "Carefully tuned to ~0.09 (should NOT bow out)", 
         {"powerplan": "Balanced", "git_autocrlf": "false"}, False),  # PowerPlan is expensive

        # Bow-out zone
        ("EXACT_10", "Hits or exceeds 0.10 — must BOW OUT", 
         {"powerplan": "Balanced", "fast_startup": True}, True),

        ("THREE_CRITICAL", "Three expensive critical items (clear bow-out)", 
         {"powerplan": "Balanced", "fast_startup": True, "telemetry": 1}, True),

        ("TELEMETRY_ONLY", "Single worst audit item (Telemetry) — should force bow-out by itself", 
         {"telemetry": 1}, True),

        # Stress combinations
        ("MIXED_GRACE_PLUS_ONE", "Several small issues + one that pushes over",
         {"git_autocrlf": "false", "wsl_mem": "8GB", "wsl_proc": 4, "powerplan": "Balanced"}, True),

        ("MISSING_FIELDS", "Discovery JSON with many missing fields (robustness edge)", 
         {"powerplan": None, "wsl_mem": None}, False),  # Should be lenient

        ("ALL_CRITICAL", "Maximum stress — many critical items at once",
         {"powerplan": "Balanced", "fast_startup": True, "telemetry": 3, "diagtrack": "Running"}, True),
    ]

    results = []
    for name, desc, overrides, expected in scenarios:
        res = run_scenario(name, desc, overrides, expected)
        results.append(res)

    # Summary
    print("\n" + "="*70)
    print("STRESS TEST SUMMARY — 90/10 TAU GRACE BOW-OUT")
    print("="*70)

    failures = [r for r in results if "GAP" in r["status"]]
    passes = [r for r in results if "PASS" in r["status"]]

    print(f"Total scenarios : {len(results)}")
    print(f"Passed          : {len(passes)}")
    print(f"Gaps/Edges found: {len(failures)}")

    if failures:
        print("\n!!! GAPS / EDGE CASES REQUIRING ATTENTION !!!")
        for f in failures:
            print(f"  - {f['name']}: got tau={f['tau']:.3f}, bow_out={f['bow_out']}, expected={f['expected']}")
    else:
        print("\nAll scenarios respected the 90/10 Tau Grace Bow-Out policy.")

    print("\nPolicy reminder: 90/10 Tau grace bow-out is the user's explicit decision.")
    print("Bow-out at >= 0.10 Tau extraction forces auto-affidavit + pipeline failure (saving grace).")


if __name__ == "__main__":
    main()
