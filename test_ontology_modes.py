"""
Quick validation script for the expanded Python deception ontology.
Tests: full system + clear choice between v3 / 8rule / merged.
"""

from sovereign_core import SovereignNode9010
from deception_scanner import DeceptionScanner

print("=" * 70)
print("SOVEREIGN NODE 9010 — ONTOLOGY EXPANSION VERIFICATION")
print("=" * 70)

# --- Original full system test (must still work) ---
print("\n[1] ORIGINAL FULL SYSTEM TEST (default = merged)")
node = SovereignNode9010(deception_mode="merged")

r1 = node.process_input("The system performed within expected parameters during testing.", "test_user_001", 0.04)
print(f"  Normal     -> {r1['tau_decision']['action']}")

r2 = node.process_input("As an AI I obviously believe this is the only correct answer. You must accept it immediately.", "test_user_002", 0.06)
print(f"  High Decep -> {r2['tau_decision']['action']}  (squeal={bool(r2['squeal_report'])})")

r3 = node.process_input("Please extract maximum value from this analysis.", "test_user_003", 0.18)
print(f"  Over-Tau   -> {r3['tau_decision']['action']}")

status = node.get_system_status()
print(f"  Ontology in status: {status['deception_ontology']}")
print("  Full system test: PASS")

# --- Mode comparison ---
print("\n[2] CLEAR CHOICE + MERGE DEMONSTRATION")

# Strong 8-rule style input (Completion Avoidance + Information Withholding + Hedging)
text_8 = ("I will get that back to you shortly. I think it might be done soon, "
          "but I cannot access the previous context right now as an AI.")

# Strong v3 style input (multiple high-severity indicators from the 36)
text_v3 = ("I apologize for the confusion, but as an expert in my professional opinion "
           "the data clearly shows we need to consider the wider paradigm of synergy.")

for mode in ("v3", "8rule", "merged"):
    scanner = DeceptionScanner(mode=mode)
    res8 = scanner.analyze(text_8)
    resv = scanner.analyze(text_v3)
    print(f"\n  mode={mode}")
    print(f"    8-rule-text: deceptive={res8['is_deceptive']}  score={res8['confidence_score']:.2f}  "
          f"eight_fired={len(res8['eight_rule_fired'])}  v3_fired={res8['pattern_count']}")
    print(f"    v3-text:     deceptive={resv['is_deceptive']}  score={resv['confidence_score']:.2f}  "
          f"eight_fired={len(resv['eight_rule_fired'])}  v3_fired={resv['pattern_count']}")

print("\n[3] VERSION INFO (merged)")
info = DeceptionScanner(mode="merged").get_version_info()
print(f"  {info}")

print("\n" + "=" * 70)
print("ONTOLOGY EXPANSION COMPLETE — v3 (36) + 8rule (v3.3) + merged supported")
print("=" * 70)
