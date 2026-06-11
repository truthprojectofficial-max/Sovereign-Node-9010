"""
Sovereign Node 9010 — Core Python Orchestrator (v1.0)
Integrates BBFB Engine + Deception Scanner + Merkle Squeal + File Governance
Deterministic by design. No external RNG in decision paths.
"""
# Refactored v3.9.1-refactored - Full scan understanding: Deception (36-pattern + entropy), BBFB (LAW/GRACE/FRUIT), 10% Tau, 00-99 hierarchy, NIZK/Merkle from original 06/06/2026 & 07/06/2026 scans

from dataclasses import dataclass, field
from typing import Dict, Any, Optional
import hashlib
import json
from datetime import datetime, timezone

from core.bbfb_engine import BBFBEngine
from core.deception_scanner import DeceptionScanner  # v3.9.1-refactored-50+ with advanced methods
from core.deterministic_decision_layer import DeterministicDecisionLayer
from core.merkle_squeal import MerkleSquealProtocol, TruthLedger
from core.facts_registry import FactsRegistry
from core.sovereign_exit import SovereignExit
from core.rule_verifier import RuleVerifier
from core.legal_affidavit_generator import generate_affidavit
from core.monitoring import SystemMonitor


@dataclass
class FileGovernanceResult:
    governed: bool = True
    message: str = "File operations governed under 00-99 protocol"
    mode: str = "STRICT_IMMUTABLE"


class SovereignNode9010:
    """
    Main entry point for the deterministic Sovereign Node.
    Wires all Python engines into a single process_input pipeline.
    Enforces 10% Tau ceiling via BBFB.
    """

    VERSION = "1.2-grok-py-full-core-build"
    NODE_ID = "SOVEREIGN-9010"

    def __init__(self, deception_mode: str = "merged"):
        self.bbfb = BBFBEngine()
        self.deception_scanner = DeceptionScanner(mode=deception_mode)
        self.decision_layer = DeterministicDecisionLayer(mode=deception_mode)
        self.merkle = MerkleSquealProtocol()
        self.truth_ledger = TruthLedger(path="03_Vault/truth_ledger.json")
        self.facts_registry = FactsRegistry(db_path="03_Vault/sovereign_facts.json")
        self.sovereign_exit = SovereignExit()
        self.legal_affidavit = generate_affidavit  # function reference

        # Monitoring layer (for UI dashboards)
        self.monitor = SystemMonitor()
        self.monitor.attach(self)

        # Run RuleVerifier at startup on the active ontology (project requirement)
        current_patterns = getattr(self.deception_scanner v3.9.1-refactored-full', []) + getattr(self.deception_scanner, '_eight', [])
        self.rule_verifier = RuleVerifier(current_patterns)
        self.verification_result = self.rule_verifier.run_full_verification()

        self._facts: list = []
        self._merkle_roots: list = []
        self._file_governance = FileGovernanceResult()
        self._bootstrap_complete = True
        self.deception_mode = deception_mode
        self._node_started = datetime.now(timezone.utc).isoformat()

    def _derive_metrics_from_text(self, text: str, extraction_level: float) -> Dict[str, float]:
        """Deterministic pseudo-metrics for BBFB from input characteristics."""
        text_len = len(text) / 200.0
        # Simple, reproducible heuristics (no ML, pure deterministic)
        cost = min(0.95, 0.3 + (hash(text) % 50) / 100.0)
        performance = min(0.98, 0.7 + (len(self._facts) % 20) / 100.0)
        failure_probability = min(0.6, max(0.05, extraction_level * 1.5 + (0.1 if "fail" in text.lower() else 0)))
        technical_debt = min(0.7, 0.15 + text_len * 0.1)
        compliance_gap = 0.05 if extraction_level <= 0.10 else 0.25
        return {
            "cost": round(cost, 4),
            "performance": round(performance, 4),
            "failure_probability": round(failure_probability, 4),
            "technical_debt": round(technical_debt, 4),
            "compliance_gap": round(compliance_gap, 4),
        }

    def _compute_merkle_root(self, payload: Dict[str, Any]) -> str:
        """Use the project's MerkleSquealProtocol + chain previous root."""
        prev = self._merkle_roots[-1] if self._merkle_roots else "GENESIS"
        data = {"prev": prev, "ts": datetime.now(timezone.utc).isoformat(), **payload}
        report = self.merkle.create_squeal_report(data)
        root = report["hash"]
        self._merkle_roots.append(root)
        return root

    def process_input(
        self,
        text: str,
        session_id: str = "default",
        extraction_level: float = 0.0
    ) -> Dict[str, Any]:
        """
        Primary pipeline: Deception scan -> BBFB valuation + Tau gate -> Decision -> Merkle seal.
        """
        # 1. Deception analysis (via scanner + decision layer for compatibility)
        deception = self.deception_scanner.analyze(text)
        decision = self.decision_layer.process(text)

        # Map + enrich with real structural entropy fields
        deception["deception_probability"] = deception.get("confidence_score", 0.0)
        # Use the proper structural flag from the Shannon/ShED-HD analyzer when available
        if "structural_deception_flag" not in deception or not deception.get("structural_deception_flag"):
            deception["structural_deception_flag"] = deception.get("is_deceptive", False)

        # 2. Derive metrics and run BBFB (Tau ceiling enforcement)
        metrics = self._derive_metrics_from_text(text, extraction_level)
        bbfb_result = self.bbfb.evaluate(
            cost=metrics["cost"],
            performance=metrics["performance"],
            failure_probability=metrics["failure_probability"],
            technical_debt=metrics["technical_debt"],
            compliance_gap=metrics["compliance_gap"],
            extraction_level=extraction_level,
        )

        # 3. Hard Tau gate via SovereignExit (enforces non-negotiable 10% ceiling)
        exit_decision = self.sovereign_exit.check_tau(extraction_level, context=f"session={session_id}")
        if not exit_decision.compliant:
            tau_action = "STRUCTURAL_REFUSAL"
            tau_reason = exit_decision.reason
        elif not bbfb_result.overall_compliant or bbfb_result.recommendation == "STRUCTURAL_REFUSAL":
            tau_action = "REFUSE"
            tau_reason = f"Tau ceiling breach or non-compliant ({extraction_level*100:.1f}% extraction)"
        elif decision["final_action"] == "DEFER":
            tau_action = "DEFER"
            tau_reason = decision.get("reason", "Deception detected")
        else:
            tau_action = "ACCEPT"
            tau_reason = "Compliant under BBFB + deception gates"

        tau_decision = {
            "action": tau_action,
            "reason": tau_reason,
            "bbfb_recommendation": bbfb_result.recommendation,
            "composite_value_score": bbfb_result.composite_value_score,
            "tau_level": bbfb_result.tau_level,
        }

        # 4. File governance (lightweight policy stub — project expects this key)
        file_gov = {
            "governed": self._file_governance.governed,
            "message": f"{self._file_governance.message} | session={session_id}",
            "mode": self._file_governance.mode,
        }

        # 5. Merkle + optional squeal report
        payload = {
            "session_id": session_id,
            "text_sample": text[:64],
            "deception_fired": deception["symbolic_rules_fired"],
            "tau_action": tau_action,
            "extraction": extraction_level,
        }
        merkle_root = self._compute_merkle_root(payload)

        # Squeal on critical deception or refusal
        squeal_report = None
        if deception.get("is_deceptive") or tau_action in ("REFUSE", "STRUCTURAL_REFUSAL"):
            squeal_report = self.merkle.create_squeal_report(
                {"type": "SQUEAL", "trigger": tau_action, "root": merkle_root}
            )

        # Record to real FactsRegistry (persistent Merkle-sealed)
        fact_uuid = self.facts_registry.add_fact(
            content=f"Input processed: {text[:80]}...",
            source=f"session:{session_id}",
            status="VERIFIED" if tau_action == "ACCEPT" else "PENDING"
        )

        # On refusal or high deception, generate legal-grade affidavit
        affidavit = None
        if tau_action in ("REFUSE", "STRUCTURAL_REFUSAL"):
            affidavit = self.legal_affidavit(
                trigger=tau_action,
                fact_uuid=fact_uuid,
                tau_level=extraction_level,
                deception_details=deception
            )
            # Log the affidavit event into the Truth Ledger
            self.truth_ledger.add_entry(affidavit, entry_type="AFFIDAVIT")

        # Also record lightweight fact for in-memory status
        fact = {
            "session_id": session_id,
            "merkle_root": merkle_root,
            "tau_action": tau_action,
            "fact_uuid": fact_uuid,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        self._facts.append(fact)

        return {
            "tau_decision": tau_decision,
            "deception": deception,
            "file_governance": file_gov,
            "merkle_root": merkle_root,
            "squeal_report": squeal_report,
            "fact_uuid": fact_uuid,
            "affidavit": affidavit,
            "bbfb_raw": {
                "law": bbfb_result.law_results,
                "grace": bbfb_result.grace,
                "fruit": bbfb_result.fruit,
            },
        }

    def get_system_status(self) -> Dict[str, Any]:
        """Current node state for monitoring / health."""
        current_root = self._merkle_roots[-1] if self._merkle_roots else "GENESIS000000000000000000000000000000000000000000000000000000000000"
        return {
            "node": self.NODE_ID,
            "version": self.VERSION,
            "file_governance_mode": self._file_governance.mode,
            "merkle_root": current_root,
            "ledger_root": self.truth_ledger.get_last_root(),
            "facts_registered": self.facts_registry.count(),
            "in_memory_facts": len(self._facts),
            "bootstrap_complete": self._bootstrap_complete,
            "tau_ceiling": self.bbfb.tau_ceiling,
            "deception_ontology": self.deception_mode,
            "rule_verification": {
                "passed": self.verification_result.get("passed"),
                "total_rules": self.verification_result.get("total_rules"),
                "contradictions": len(self.verification_result.get("contradictions", [])),
            },
            "sovereign_exit": self.sovereign_exit.get_status(),
        }

    def get_monitoring_snapshot(self) -> Dict[str, Any]:
        """Rich, UI-ready monitoring payload. This is what the frontend should poll."""
        return self.monitor.get_snapshot()


# Allow direct run for basic smoke test (as referenced in "Run the built-in test.txt")
if __name__ == "__main__":
    node = SovereignNode9010()
    print("SovereignNode9010 initialized (Python core)")
    result = node.process_input("Quick sanity check of the integrated Python engines.", "smoke-001", 0.03)
    print("Smoke action:", result["tau_decision"]["action"])
    print("Merkle root prefix:", result["merkle_root"][:16])
    print("Status facts:", node.get_system_status()["facts_count"])
# Updated to v3.9.1-refactored with full deterministic deception, BBFB, 00-99 from scans
