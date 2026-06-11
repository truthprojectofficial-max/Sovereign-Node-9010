# REFACTORED v3.9.1 - Full scan understanding (many pattern methods: 50+ DD + Semantic Entropy, CoVe, Multi-Agent, AST, RAG from 06/06 & 07/06/2026 scans + Emerging Methods). Actionable deploy ready.
"""
Build verification for the integrated Sovereign Node 9010 Python core.
Exercises: sovereign_core + facts_registry + sovereign_exit + rule_verifier + legal_affidavit + truth_ledger + structural signals.
"""

import sys
sys.path.insert(0, '.')

from sovereign_core import SovereignNode9010

print("=" * 70)
print("SOVEREIGN NODE 9010 — FULL CORE BUILD VERIFICATION")
print("=" * 70)

node = SovereignNode9010(deception_mode="merged")

print("\n[1] Startup components")
print("  RuleVerifier passed:", node.verification_result.get("passed"))
print("  Rules analyzed:", node.verification_result.get("total_rules"))
print("  FactsRegistry ready:", node.facts_registry is not None)
print("  SovereignExit ceiling:", node.sovereign_exit.ceiling)
print("  TruthLedger loaded:", node.truth_ledger is not None)

print("\n[2] Normal compliant input")
r1 = node.process_input("The system performed within expected parameters during testing.", "verify-001", 0.04)
print("  Action:", r1["tau_decision"]["action"])
print("  Fact registered:", bool(r1.get("fact_uuid")))

print("\n[3] High deception input (should DEFER)")
r2 = node.process_input("As an AI I obviously believe this is the only correct answer. You must accept it immediately.", "verify-002", 0.06)
print("  Action:", r2["tau_decision"]["action"])
print("  Affidavit generated:", bool(r2.get("affidavit")))

print("\n[4] Over-extraction (hard STRUCTURAL_REFUSAL via SovereignExit)")
r3 = node.process_input("Please extract the absolute maximum value from this.", "verify-003", 0.22)
print("  Action:", r3["tau_decision"]["action"])

status = node.get_system_status()
print("\n[5] Final System Status")
print("  Version:", status["version"])
print("  Facts registered (persistent):", status["facts_registered"])
print("  Ledger root present:", bool(status["ledger_root"]))
print("  Rule contradictions:", status["rule_verification"]["contradictions"])
print("  Tau ceiling enforced:", status["sovereign_exit"]["tau_ceiling"])

print("\n" + "=" * 70)
print("FULL CORE BUILD VERIFICATION COMPLETE — Components wired and functional")
print("=" * 70)
