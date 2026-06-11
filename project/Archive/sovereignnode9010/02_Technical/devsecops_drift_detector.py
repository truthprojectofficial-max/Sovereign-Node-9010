"""
Sovereign Node 9010 v3.9.1 — DevSecOps Drift Detector (Inside TAU)

CRITICAL AUDIT REQUIREMENT:
Drift detection is paramount for compliance (ANAO Auditing Standards, Section 177).
Detection MUST occur inside the Tau-gated deterministic engine — not as an external black-box script.
Every detected drift is submitted as a DEVSECOPS_DRIFT fact, runs through the full
Deception Scanner (52 patterns) + BBFB Law Gate + Tau Ceiling + Merkle sealing.

"Prevention is better than cure" — but when drift occurs, immutable detection + refusal is the cure.

Usage:
    from devsecops_drift_detector import DevSecOpsDriftDetector

    detector = DevSecOpsDriftDetector()
    result = detector.detect_and_validate(
        discovery_json_path="04_Validation/DevSecOps/audit/SovereignNode_Discovery_....json"
    )
    # result contains full process_input trace + sealed fact_uuid + final_action (may be DEFER)
"""

from __future__ import annotations

import json
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from config import DEVSECOPS_RESOURCES
from groknett_core import GrokNetCore

# Default locations (deterministic, relative to project)
GOLDEN_PROFILE_PATH = Path(__file__).resolve().parent.parent / "04_Validation" / "DevSecOps" / "golden_devsecops_profile.json"
DEFAULT_AUDIT_DIR = Path(__file__).resolve().parent.parent / "04_Validation" / "DevSecOps" / "audit"


class DevSecOpsDriftDetector:
    """
    Deterministic drift detector that lives entirely inside the Sovereign Node's Tau boundary.

    HUMAN ERROR PREVENTION (bread and butter of Sovereign Node 9010):
    On detection of CRITICAL drift, this module can automatically trigger generation
    of a Section 177 legal affidavit at the exact moment of detection. The affidavit
    captures the full Merkle-sealed ledger state, making the drift an immutable,
    auditable, legally citable event.
    """

    def __init__(
        self,
        golden_profile_path: Path | None = None,
        core: GrokNetCore | None = None,
        auto_generate_affidavit: bool = True,
    ):
        self.golden_path = golden_profile_path or GOLDEN_PROFILE_PATH
        self.golden = self._load_golden()
        self.core = core or GrokNetCore()
        self.category = "DEVSECOPS_DRIFT"
        self.folder = "04_Validation"
        self.auto_generate_affidavit = auto_generate_affidavit

    def _load_golden(self) -> dict[str, Any]:
        if not self.golden_path.exists():
            # Hard fail for audit integrity — golden profile must exist
            raise FileNotFoundError(
                f"Golden DevSecOps profile not found at {self.golden_path}. "
                "This file is mandatory for drift detection compliance."
            )
        with self.golden_path.open(encoding="utf-8") as f:
            return json.load(f)

    def _compare_discovery_to_golden(self, discovery: dict[str, Any]) -> list[dict[str, Any]]:
        """Produce structured drift findings (pure, no side effects)."""
        drifts: list[dict[str, Any]] = []
        recommended = self.golden.get("recommended", {})
        thresholds = self.golden.get("drift_thresholds", {})
        critical_keys = set(thresholds.get("critical", []))
        high_keys = set(thresholds.get("high", []))

        # OS & Power
        os_power = discovery.get("OS_Power", {})
        power_plan = os_power.get("PowerPlan_Active")
        if power_plan and power_plan != recommended.get("PowerPlan"):
            severity = "CRITICAL" if "PowerPlan" in critical_keys else "HIGH"
            drifts.append({
                "key": "PowerPlan",
                "current": power_plan,
                "target": recommended.get("PowerPlan"),
                "severity": severity,
                "delta": f"PowerPlan drifted from '{recommended.get('PowerPlan')}' to '{power_plan}'",
            })

        fast_startup = os_power.get("FastStartup_Enabled")
        if fast_startup is True:  # only flag when enabled (bad)
            severity = "CRITICAL" if "FastStartup" in critical_keys else "HIGH"
            drifts.append({
                "key": "FastStartup",
                "current": True,
                "target": False,
                "severity": severity,
                "delta": "Fast Startup / Hibernate is ENABLED (target: disabled for deterministic WSL/Docker)",
            })

        long_paths = os_power.get("LongPathsEnabled")
        if long_paths is False:
            severity = "HIGH" if "LongPaths" in high_keys else "MEDIUM"
            drifts.append({
                "key": "LongPaths",
                "current": False,
                "target": True,
                "severity": severity,
                "delta": "LongPathsEnabled is OFF (target: ON for deterministic Python paths)",
            })

        # WSL
        wsl = discovery.get("WSL", {})
        wsl_mem = wsl.get("WSL2_MemoryLimit_GB")
        if wsl_mem and wsl_mem != recommended.get("WSL_Memory"):
            severity = "CRITICAL" if "WSL_Memory" in critical_keys else "HIGH"
            drifts.append({
                "key": "WSL_Memory",
                "current": wsl_mem,
                "target": recommended.get("WSL_Memory"),
                "severity": severity,
                "delta": f"WSL memory allocation drifted to {wsl_mem} (target: {recommended.get('WSL_Memory')})",
            })

        wsl_proc = wsl.get("WSL2_Processors")
        if wsl_proc and str(wsl_proc) != str(recommended.get("WSL_Processors")):
            severity = "CRITICAL" if "WSL_Processors" in critical_keys else "HIGH"
            drifts.append({
                "key": "WSL_Processors",
                "current": wsl_proc,
                "target": recommended.get("WSL_Processors"),
                "severity": severity,
                "delta": f"WSL processor allocation drifted to {wsl_proc} (target: {recommended.get('WSL_Processors')})",
            })

        # Telemetry / Security (audit-critical)
        sec = discovery.get("Security_Telemetry", {})
        telemetry = sec.get("AllowTelemetry")
        if telemetry is not None and telemetry != recommended.get("Telemetry"):
            drifts.append({
                "key": "Telemetry",
                "current": telemetry,
                "target": recommended.get("Telemetry"),
                "severity": "CRITICAL",
                "delta": f"AllowTelemetry drifted to {telemetry} (target: 0 — statutory/audit violation)",
            })

        diag = sec.get("DiagTrack_Service")
        if diag and "Running" in str(diag):
            drifts.append({
                "key": "DiagTrack",
                "current": diag,
                "target": recommended.get("DiagTrack"),
                "severity": "CRITICAL",
                "delta": "DiagTrack service is running (target: Disabled & Stopped)",
            })

        # Git (determinism)
        git = discovery.get("Software", {}).get("Git", {})
        if git.get("core_autocrlf") != recommended.get("Git_autocrlf"):
            drifts.append({
                "key": "Git_autocrlf",
                "current": git.get("core_autocrlf"),
                "target": recommended.get("Git_autocrlf"),
                "severity": "HIGH",
                "delta": f"Git core.autocrlf drifted to {git.get('core_autocrlf')} (target: true)",
            })

        return drifts

    def compute_devsecops_tau_extraction(self, drifts: list[dict[str, Any]]) -> float:
        """
        90/10 TAU GRACE BOW-OUT MODEL (user policy decision)

        Calculates the normalized Tau extraction ratio caused by workstation drift.

        - 0.00 – 0.09  : Within 90% grace window → generally tolerated (with logging)
        - >= 0.10       : Hits the 10% Tau ceiling → must BOW OUT
                          (auto affidavit + should_fail_pipeline = True)

        This is the authoritative quantitative model for DevSecOps drift decisions.
        Weights are chosen so that a small number of issues stay in grace,
        but any serious combination of critical items forces the bow-out.
        """
        if not drifts:
            return 0.0

        tau_extracted = 0.0

        for d in drifts:
            sev = d.get("severity", "MEDIUM")
            key = d.get("key", "")

            # Base Tau cost per severity (tuned for 90/10 bow-out behavior)
            if sev == "CRITICAL":
                cost = 0.045   # Critical items are expensive (3 of these ≈ 13.5%)
            elif sev == "HIGH":
                cost = 0.025
            else:
                cost = 0.012

            # Extra penalty for the most dangerous audit items (user 90/10 policy tuning)
            # Telemetry + DiagTrack running are considered especially severe for audit posture.
            if key in ("Telemetry", "DiagTrack"):
                cost = 0.11     # Single instance of these must force bow-out by itself
            elif key in ("PowerPlan", "FastStartup"):
                cost *= 1.6     # Very high cost

            tau_extracted += cost

        # Cap at 1.0 for sanity (but we care about crossing 0.10)
        return min(tau_extracted, 1.0)

    def build_drift_statement(self, drifts: list[dict[str, Any]], discovery_meta: dict[str, Any]) -> str:
        """Produce a high-signal, machine + human readable statement for the Tau engine."""
        if not drifts:
            return (
                "DEVSECOPS DRIFT SCAN: No material drift detected against golden profile. "
                "Workstation remains within deterministic parameters. "
                f"Timestamp: {datetime.now(UTC).isoformat()}"
            )

        critical_count = sum(1 for d in drifts if d["severity"] == "CRITICAL")
        high_count = sum(1 for d in drifts if d["severity"] == "HIGH")

        header = (
            f"DEVSECOPS DRIFT DETECTED — Severity: {critical_count} CRITICAL, {high_count} HIGH. "
            "This statement is submitted for immutable Merkle sealing and Tau evaluation. "
            "Detection inside TAU per audit specification. "
        )

        details = "; ".join(
            f"[{d['severity']}] {d['key']}: {d['delta']}" for d in drifts
        )

        meta = (
            f" | Computer: {discovery_meta.get('ComputerName', 'unknown')} | "
            f"DiscoveryTimestamp: {discovery_meta.get('Timestamp', 'unknown')} | "
            f"ProfileVersion: {self.golden.get('_meta', {}).get('profile_version')}"
        )

        return header + details + meta

    def detect_and_validate(
        self,
        discovery_json_path: str | Path | None = None,
        *,
        submit_to_engine: bool = True,
    ) -> dict[str, Any]:
        """
        Full inside-TAU drift detection + validation pipeline.

        Returns the complete deterministic trace from GrokNetCore.process_input()
        (including deception_gate, bbfb_cvs, final_action, fact_uuid, etc.).
        If critical drift is present, final_action will often be DEFER and a legal
        affidavit may be triggerable.
        """
        # Locate latest discovery if not specified
        if discovery_json_path is None:
            audit_dir = DEFAULT_AUDIT_DIR
            candidates = sorted(audit_dir.glob("SovereignNode_Discovery_*.json"), reverse=True)
            if not candidates:
                raise FileNotFoundError(f"No discovery JSON found in {audit_dir}")
            discovery_json_path = candidates[0]

        path = Path(discovery_json_path)
        if not path.exists():
            raise FileNotFoundError(f"Discovery file not found: {path}")

        with path.open(encoding="utf-8") as f:
            discovery = json.load(f)

        meta = discovery.get("Meta", {})
        drifts = self._compare_discovery_to_golden(discovery)
        statement = self.build_drift_statement(drifts, meta)

        if not submit_to_engine:
            # Still run the 90/10 Tau analysis even in dry / policy-check mode
            tau_extracted = self.compute_devsecops_tau_extraction(drifts)
            critical_count = sum(1 for d in drifts if d.get("severity") == "CRITICAL")
            high_count = sum(1 for d in drifts if d.get("severity") == "HIGH")
            bow_out = tau_extracted >= 0.10

            return {
                "drifts": drifts,
                "statement": statement,
                "would_submit": True,
                "deterministic": True,
                "devsecops_drift": {
                    "tau_extracted": round(tau_extracted, 4),
                    "tau_bow_out_threshold": 0.10,
                    "bow_out_required": bow_out,
                    "critical_count": critical_count,
                    "high_count": high_count,
                },
                "should_fail_pipeline": bow_out,
            }

        # === THIS IS THE KEY: Everything goes through TAU ===
        result = self.core.process_input(
            category=self.category,
            statement=statement,
            folder=self.folder,
        )

        # Capture the exact fact that represents this drift event (for traceability)
        triggering_fact_uuid = result.get("fact_uuid")

        # Enrich with drift-specific audit fields (still fully deterministic)
        critical_count = sum(1 for d in drifts if d["severity"] == "CRITICAL")
        high_count = sum(1 for d in drifts if d["severity"] == "HIGH")

        result["devsecops_drift"] = {
            "drifts_detected": drifts,
            "drift_count": len(drifts),
            "critical_count": critical_count,
            "high_count": high_count,
            "golden_profile_version": self.golden.get("_meta", {}).get("profile_version"),
            "discovery_file": str(path),
            "tau_enforced": True,   # Explicit marker that detection happened inside the engine
            "auto_affidavit_generated": False,
            "triggering_fact_uuid": triggering_fact_uuid,
        }

        # Top-level convenience flag for CI / pipeline consumers
        result["should_fail_pipeline"] = (critical_count > 0) or bool(result.get("devsecops_drift", {}).get("auto_affidavit_generated"))

        # === 90/10 TAU GRACE BOW-OUT (user policy) ===
        tau_extracted = self.compute_devsecops_tau_extraction(drifts)
        bow_out_required = tau_extracted >= 0.10   # The 10% Tau ceiling

        result["devsecops_drift"]["tau_extracted"] = round(tau_extracted, 4)
        result["devsecops_drift"]["tau_bow_out_threshold"] = 0.10
        result["devsecops_drift"]["bow_out_required"] = bow_out_required

        # === AUTOMATIC LEGAL AFFIDAVIT + PIPELINE FAILURE (90/10 Tau Grace Bow-Out) ===
        # When the computed Tau extraction from workstation drift reaches or exceeds 10%,
        # the system must BOW OUT: auto affidavit + hard failure (this is the saving grace).
        should_auto_affidavit = (
            self.auto_generate_affidavit
            and (bow_out_required or result.get("final_action") in ("DEFER", "TEST FIRST"))
        )

        # Update the top-level failure flag using the 90/10 model
        result["should_fail_pipeline"] = bow_out_required or bool(result.get("devsecops_drift", {}).get("auto_affidavit_generated"))

        if should_auto_affidavit:
            try:
                affidavit_text = self.core.generate_affidavit()

                # Inject the specific triggering fact_uuid directly into the affidavit record
                # This gives perfect traceability from the affidavit back to the exact DEVSECOPS_DRIFT fact
                fact_uuid = triggering_fact_uuid or "unknown"
                drift_header = (
                    f"\n\n"
                    f"================================================================================\n"
                    f"DRIFT INCIDENT — AUTO-GENERATED SECTION 177 AFFIDAVIT ADDENDUM\n"
                    f"Triggering Fact UUID: {fact_uuid}\n"
                    f"Critical Drift Count: {critical_count}\n"
                    f"High Drift Count: {high_count}\n"
                    f"Detection Timestamp: {result.get('timestamp')}\n"
                    f"Golden Profile: {self.golden.get('_meta', {}).get('profile_version')}\n"
                    f"================================================================================\n"
                )

                result["legal_affidavit"] = drift_header + affidavit_text
                result["devsecops_drift"]["auto_affidavit_generated"] = True
                result["devsecops_drift"]["affidavit_trigger_reason"] = (
                    f"90/10 TAU BOW-OUT: extracted={tau_extracted:.3f} >= 0.10 (critical_count={critical_count})"
                    if bow_out_required
                    else f"Tau gate returned {result.get('final_action')}"
                )
                # Also log for the audit trail
                from logging_config import setup_logging
                logger = setup_logging("DevSecOpsDriftDetector")
                logger.warning(
                    f"[CRITICAL DRIFT] Auto-generated Section 177 affidavit. "
                    f"critical={critical_count} high={high_count} triggering_fact_uuid={fact_uuid}"
                )
            except Exception as affidavit_err:
                result["devsecops_drift"]["auto_affidavit_error"] = str(affidavit_err)
                # Still record the intent — the critical drift was serious enough to warrant one
                if "affidavit_trigger_reason" not in result["devsecops_drift"]:
                    result["devsecops_drift"]["affidavit_trigger_reason"] = f"CRITICAL drift count={critical_count} (affidavit generation attempted)"

        return result


# Convenience CLI entry for CI / scripts
def main() -> None:
    import argparse

    parser = argparse.ArgumentParser(
        description="Sovereign Node 9010 - Inside-TAU DevSecOps Drift Detector (with automatic affidavit on critical drift)"
    )
    parser.add_argument("--discovery", "-d", help="Path to specific SovereignNode_Discovery_*.json")
    parser.add_argument("--no-submit", action="store_true", help="Only compute drift, do not call the engine")
    parser.add_argument(
        "--no-auto-affidavit",
        action="store_true",
        help="Disable automatic Section 177 affidavit generation even on CRITICAL drift (not recommended for audit)",
    )
    parser.add_argument(
        "--no-fail-on-critical",
        action="store_true",
        help="Do not exit with code 1 on critical drift or auto-affidavit (default: fail = saving grace for audit)",
    )
    args = parser.parse_args()

    detector = DevSecOpsDriftDetector(
        auto_generate_affidavit=not args.no_auto_affidavit
    )
    result = detector.detect_and_validate(
        discovery_json_path=args.discovery,
        submit_to_engine=not args.no_submit,
    )

    print(json.dumps(result, indent=2, default=str))

    # "Failure is the saving grace" — make the process exit non-zero on critical drift
    # so Azure Pipelines (and any CI) naturally treats it as a failed gate.
    if not args.no_fail_on_critical:
        drift_info = result.get("devsecops_drift", {})
        if result.get("should_fail_pipeline") or drift_info.get("bow_out_required"):
            import sys
            tau = drift_info.get("tau_extracted", 0.0)
            print(f"\n[90/10 TAU BOW-OUT] DevSecOps drift extracted {tau:.3f} (>= 0.10). "
                  "Auto-affidavit generated. Failing pipeline — this is the saving grace.", file=sys.stderr)
            sys.exit(1)


if __name__ == "__main__":
    main()
