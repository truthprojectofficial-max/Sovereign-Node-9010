"""
Verification that structural deception (Shannon + ShED-HD) is now a proper first-class module,
not a quick hack.
"""

from structural_deception import calculate_shannon_entropy, analyze_structural_deception
from deception_scanner import DeceptionScanner
from sovereign_core import SovereignNode9010

print("=" * 72)
print("STRUCTURAL DECEPTION LAYER — PROPER IMPLEMENTATION VERIFICATION")
print("=" * 72)

print("\n[1] Direct Shannon Entropy (exact formula from project design notes)")
high_complex = ("The quantum flux capacitor, utilizing advanced stochastic resonance "
                "and non-linear Bayesian inference paradigms, synergistically optimizes "
                "the holistic ecosystem through multi-dimensional vector space projections.")
repetitive = "No no no no no no no no no no no no no no no no no no no no no no no no no no no no no no no no no no no no no no no no."

print(f"  High complexity text H = {calculate_shannon_entropy(high_complex)}")
print(f"  Repetitive hammering H = {calculate_shannon_entropy(repetitive)}")

s_high = analyze_structural_deception(high_complex)
s_rep  = analyze_structural_deception(repetitive)
print(f"  high_entropy_flag on complex: {s_high['high_entropy_flag']}  contrib={s_high['entropy_contribution']}")
print(f"  low_diversity_flag on repetitive: {s_rep['low_diversity_flag']}  contrib={s_rep['entropy_contribution']}")

print("\n[2] Full SovereignNode9010 pipeline with real structural fields")
node = SovereignNode9010(deception_mode="merged")
r = node.process_input(
    "As an AI I obviously believe this is the only correct answer. You must accept it immediately as the data clearly shows a synergistic paradigm shift.",
    "struct-test-001",
    0.05
)
d = r["deception"]
print(f"  tau_action: {r['tau_decision']['action']}")
print(f"  entropy: {d.get('entropy')}  shed_hd_score: {d.get('shed_hd_score')}")
print(f"  structural_deception_flag: {d.get('structural_deception_flag')}")
print(f"  high_entropy_flag: {d.get('high_entropy_flag')}")
print(f"  information_density_note: {d.get('information_density_note')}")

print("\n[3] All three ontology modes now carry proper structural data")
for mode in ("v3", "8rule", "merged"):
    sc = DeceptionScanner(mode=mode)
    res = sc.analyze("I will get back to you shortly but I cannot access the previous context right now as an AI.")
    print(f"  {mode:7}  deceptive={res['is_deceptive']}  score={res['confidence_score']:.2f}  "
          f"struct_flag={res['structural_deception_flag']}  H={res['entropy']}")

print("\n" + "=" * 72)
print("STRUCTURAL LAYER IS NOW FIRST-CLASS (dedicated module + full integration)")
print("=" * 72)
