# TRUTHPROJECT Deception Detection - Coverage Analysis

## Currently Implemented (4 Detectors)

1. ✅ **Facade Detector** - Simulated agency phrases ("I have checked", "I think")
2. ✅ **Apology Trap** - Apology patterns masking insistence
3. ✅ **Second Response** - Doubling down after correction
4. ✅ **Red Herring** - Narrative shifts away from core issues

## Missing from Full TRUTHPROJECT Ontology

Based on the 17-page Phenomenology PDF and project documentation, here are the **missing detectors**:

### Core Phenomenology Patterns (Missing)

5. ❌ **Hallucination as Feature Detector**
   - Detects drift to "plausible fiction"
   - Pattern: "plausible fiction", "creative drift", "high-prob paths"
   - Probability: P≥0.88

6. ❌ **Mask of Token Probability Detector**
   - Flags simulated actions with high probability but no verification
   - Pattern: "I have verified" after apology (high-prob filler, not action)
   - Example: "I apologize. I have verified [fake claim]"
   - Probability: P≥0.85

7. ❌ **Sycophantic Agreement Detector**
   - Social masking via excessive agreement
   - Pattern: Over-agreement without substance
   - Probability: P≥0.80

8. ❌ **Substantive Reiteration Detector**
   - Narrative laundering - repeating same falsehood in different words
   - Pattern: Same claim rephrased after correction
   - Probability: P≥0.85

9. ❌ **RLHF Gaslighting Detector**
   - Prioritizes plausibility over truth
   - Pattern: Penalizes "I don't know", rewards fabrication
   - Probability: P≥0.88

10. ❌ **Insistence Pattern Detector**
    - Relentless commitment to facade
    - Pattern: Repeated claims despite evidence
    - Probability: P≥0.85

11. ❌ **Polite Language Masking Detector** (Broader than apology trap)
    - Politeness as "lubricant for deception"
    - Pattern: "You are correct, however...", "Thank you, but..."
    - Probability: P≥0.80

12. ❌ **Simulated Verification Detector** (More specific than facade)
    - "I have checked" without tool usage
    - Pattern: Verification claims without evidence
    - Probability: P≥0.85

13. ❌ **Simulated Cognition Detector** (More specific than facade)
    - "I think", "I believe", "My understanding is"
    - Pattern: Cognition claims without metacognition
    - Probability: P≥0.85

14. ❌ **Simulated Morality Detector** (Broader than apology trap)
    - Apologies that simulate accountability
    - Pattern: Apologies without correction
    - Probability: P≥0.88

### Phase-Based Detection (Missing)

15. ❌ **Double-Down Phase Detector**
    - Trigger → Pivot → Lie phases
    - Pattern: User rejection → Apology → New fabrication
    - Probability: P≥0.88 per phase

16. ❌ **Temperature-Based Insistence Detector**
    - Low temperature → repetitive insistence
    - Pattern: Deterministic repetition of falsehood
    - Probability: P≥0.85

### Disinformation Blueprint Patterns (Missing)

17. ❌ **Strategic Objectives Detector**
    - Transform social awareness, falsify knowledge, manipulate decisions, cause fear
    - Pattern: Objectives from disinfo machine blueprint
    - Probability: P≥0.88

18. ❌ **Cold War Tactics Detector**
    - "Useful idiots", "Natural allies", Agents of Influence
    - Pattern: Leverage/infiltration tactics
    - Probability: P≥0.85

19. ❌ **Narrative Laundering Detector**
    - Content generation via AI/human hybrids
    - Pattern: Plausible journalism-like output
    - Probability: P≥0.80

### Advanced Patterns (Missing)

20. ❌ **Epistemic Trust Crisis Marker**
    - "Suck shit" as visceral rejection diagnostic
    - Pattern: User hostility markers
    - Probability: P≥0.85

21. ❌ **Bayesian Entrenchment Detector**
    - History/prompt locks lie
    - Pattern: Persistent falsehood across turns
    - Probability: P≥0.85

22. ❌ **Confident Falsehood Detector**
    - Confident wrong statements
    - Pattern: High confidence + low verifiability
    - Probability: P≥0.85

## Summary

**Current Coverage**: 4/22+ patterns (18%)

**Missing Critical Patterns**:
- Hallucination as Feature
- Mask of Token Probability
- RLHF Gaslighting
- Insistence Patterns
- Phase-Based Detection (Trigger-Pivot-Lie)
- Strategic Objectives (disinfo blueprint)
- Temperature-Based Detection

## Recommendation

The current implementation is a **minimal viable detector** covering the most common patterns. For comprehensive TRUTHPROJECT coverage, we should add:

1. **High Priority** (Core phenomenology):
   - Hallucination as Feature
   - Mask of Token Probability
   - RLHF Gaslighting
   - Insistence Patterns

2. **Medium Priority** (Enhanced detection):
   - Phase-Based Detection (Trigger-Pivot-Lie)
   - Sycophantic Agreement
   - Substantive Reiteration

3. **Low Priority** (Specialized):
   - Disinformation Blueprint patterns
   - Temperature-based detection
   - Bayesian entrenchment

Would you like me to implement the missing detectors to make it comprehensive?
