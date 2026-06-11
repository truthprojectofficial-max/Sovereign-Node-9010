"""
Sovereign Node 9010 — CiDi Governance Engine (v3.0.0)
Calculates the Option Gate / LAW Gate waiting value before execution.
Zero-Dependency • Pure Python • Standard Library Only

Implements the Barnett Binary Faith-Basis (BBFB) mathematical engine.
Integrates LAW, GRACE, and FRUIT pillars with late-bound Option Gates.
Enforces 10% Tau Extraction Ceiling and multiplicative veto gates.
"""

from enum import Enum
from typing import Any


class GateStatus(Enum):
    PASSED = 1
    FAILED = 0
    WAITING_FOR_VERIFICATION = -1


class BBFBEngine:
    """
    Executes the Barnett Binary Faith-Basis (BBFB) mathematical engine.
    LAW Gate: Multiplicative binary veto gauntlet (strict thresholds).
    GRACE: Forgiveness/penalty adjustment factor.
    FRUIT: Positive outcome multiplier.
    Enforces non-negotiable 10% Tau Veto Ceiling.
    """

    def __init__(self, tau_ceilings: dict[str, float]):
        self.tau_ceilings = tau_ceilings
        self.tau_extraction_limit = 0.10  # Non-negotiable 10% Tau Veto Ceiling
        self.law_grace_fruit_weights = {"law": 1.0, "grace": 0.3, "fruit": 0.7}

    def evaluate_law_gate(self, cognitive_metrics: dict[str, Any]) -> tuple[int, GateStatus]:
        """
        Executes the multiplicative binary veto gauntlet.
        If any metric falls below its threshold, immediate 0 veto (FAILED).
        Supports deferred values (WAITING_FOR_VERIFICATION) to prevent premature zero collapse.
        """
        score = 1
        has_waiting_values = False

        for parameter, threshold in self.tau_ceilings.items():
            confidence_value = cognitive_metrics.get(parameter)

            if confidence_value is None:
                has_waiting_values = True
                continue

            if confidence_value < threshold:
                return 0, GateStatus.FAILED
            score *= 1  # Multiplicative identity for passed gates

        if has_waiting_values:
            return score, GateStatus.WAITING_FOR_VERIFICATION

        return score, GateStatus.PASSED

    def calculate_cvs(
        self, law_score: int, gate_status: GateStatus, fruit: float, grace: float, metabolic_debt: float
    ) -> float:
        """
        Computes the final Composite Value Score (CVS).
        Enforces structural refusal (0.0000) if LAW gate FAILED.
        Applies metabolic debt penalty scaled by gate status.
        Respects 10% Tau limit implicitly via upstream controls.
        """
        if gate_status == GateStatus.FAILED or law_score == 0:
            return 0.0000  # Hard Refusal State (LAW veto)

        # Deferred penalty to prevent execution bleed on incomplete data
        if gate_status == GateStatus.WAITING_FOR_VERIFICATION:
            deferred_penalty = metabolic_debt * 0.75
            raw_score = float(law_score * (fruit - grace - deferred_penalty))
        else:
            # Nominal execution
            raw_score = float(law_score * (fruit - grace - (metabolic_debt * 0.5)))

        # Enforce upper bound (Tau ceiling proxy)
        return min(raw_score, 1.0)  # Cap at 1.0 for normalized CVS

    def check_tau_ceiling(self, extraction_ratio: float) -> bool:
        """
        Enforces the non-negotiable 10% Tau Extraction Ceiling.
        Returns False (veto) if extraction exceeds limit.
        """
        return extraction_ratio <= self.tau_extraction_limit

    def compute_law_grace_fruit(self, metrics: dict[str, float]) -> dict[str, float]:
        """
        Computes the three pillars: LAW (veto product), GRACE (adjustment), FRUIT (yield).
        """
        law = 1.0
        for param, thresh in self.tau_ceilings.items():
            val = metrics.get(param, 0.0)
            law *= 1.0 if val >= thresh else 0.0

        grace = metrics.get("grace_factor", 1.0)
        fruit = metrics.get("fruit_yield", 1.0)

        return {"law": law, "grace": grace, "fruit": fruit, "cvs_raw": law * (fruit - grace)}


if __name__ == "__main__":
    # Example usage demonstrating BBFB execution
    system_tau = {
        "logic_coherence": 0.8,
        "fact_verification": 0.9,
        "tone_adherence": 0.7,
        "deception_entropy": 0.6,  # Shannon entropy threshold for deception detection
    }

    engine = BBFBEngine(tau_ceilings=system_tau)

    # Test case 1: All metrics present and passing
    active_session_metrics = {
        "logic_coherence": 0.85,
        "fact_verification": 0.95,
        "tone_adherence": 0.72,
        "deception_entropy": 0.55,
    }

    law, status = engine.evaluate_law_gate(active_session_metrics)
    cvs = engine.calculate_cvs(law_score=law, gate_status=status, fruit=4.251, grace=1.120, metabolic_debt=2.100)
    print("--- BBFB SYSTEM AUDIT LOG (Test 1: Full Pass) ---")
    print(f"LAW Gate Output Multiplier : {law}")
    print(f"Option Gate Status Metric   : {status.name}")
    print(f"Calculated Composite Value  : {cvs:.4f}")
    print(f"Tau Ceiling Check (0.05 extraction): {engine.check_tau_ceiling(0.05)}")

    # Test case 2: Deferred metric (WAITING)
    deferred_metrics = {
        "logic_coherence": 0.85,
        "fact_verification": None,  # Deferred - Option Gate triggered
        "tone_adherence": 0.72,
        "deception_entropy": 0.55,
    }
    law2, status2 = engine.evaluate_law_gate(deferred_metrics)
    cvs2 = engine.calculate_cvs(law2, status2, 4.251, 1.120, 2.100)
    print("\n--- BBFB SYSTEM AUDIT LOG (Test 2: Deferred) ---")
    print(f"LAW Gate Output Multiplier : {law2}")
    print(f"Option Gate Status Metric   : {status2.name}")
    print(f"Calculated Composite Value  : {cvs2:.4f}")

    # Test case 3: LAW violation (FAILED)
    failed_metrics = {
        "logic_coherence": 0.75,  # Below 0.8 threshold
        "fact_verification": 0.95,
        "tone_adherence": 0.72,
        "deception_entropy": 0.55,
    }
    law3, status3 = engine.evaluate_law_gate(failed_metrics)
    cvs3 = engine.calculate_cvs(law3, status3, 4.251, 1.120, 2.100)
    print("\n--- BBFB SYSTEM AUDIT LOG (Test 3: LAW FAILED) ---")
    print(f"LAW Gate Output Multiplier : {law3}")
    print(f"Option Gate Status Metric   : {status3.name}")
    print(f"Calculated Composite Value  : {cvs3:.4f}")
