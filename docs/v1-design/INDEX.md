# v1.0 Design Archive — Discovery Index

> Cherry-picked architecture and design documents from the Groknett ValueForge v1.0 era
> (Next.js + Vercel KV, January 2026). These capture the original design thinking,
> threat models, and framework specifications that informed the current 2.0 rewrite
> (Express + Vite + better-sqlite3, targeting Azure Container Apps).

## How to Use This Archive

These are **read-only reference documents**. They are not maintained or updated.
Use them when you need to understand *why* a design decision was made, trace the
lineage of a feature, or compare v1.0 intent against v2.0 implementation.

---

## BBFB Engine Design (7 docs)

Core specifications for the Balanced Bias Forensic Budgeting engine.

| Document | What It Covers |
|----------|---------------|
| [BBFB_ENGINE_WHAT_IT_SHOULD_DO.md](BBFB_ENGINE_WHAT_IT_SHOULD_DO.md) | Design spec — what the BBFB engine is supposed to calculate (WPM, GRACE, TCO) |
| [BBFB_ENGINE_GAP_ANALYSIS.md](BBFB_ENGINE_GAP_ANALYSIS.md) | Gap analysis between spec and v1.0 implementation, with enhancement plan |
| [BBFB_REFERENCE_INDEX.md](BBFB_REFERENCE_INDEX.md) | Complete reference index for the BBFB framework documents |
| [BBFB_FRAMEWORK_PATTERNS_ANALYSIS.md](BBFB_FRAMEWORK_PATTERNS_ANALYSIS.md) | Deception pattern analysis within the BBFB framework |
| [BBFB_FORENSIC_AUDIT_COMPLETE.md](BBFB_FORENSIC_AUDIT_COMPLETE.md) | Full forensic audit and technical operationalization (454 lines — most detailed) |
| [BBFB_MANIPULATION_VULNERABILITY_ANALYSIS.md](BBFB_MANIPULATION_VULNERABILITY_ANALYSIS.md) | Formularized vulnerability analysis of the BBFB engine |
| [BBFB_VS_DECEPTION_DETECTION_CLARIFICATION.md](BBFB_VS_DECEPTION_DETECTION_CLARIFICATION.md) | Clarification of boundary between BBFB calculations and deception detection |

## TRUTHPROJECT / Deception Detection (7 docs)

Threat modelling, detection gaps, and deception taxonomy.

| Document | What It Covers |
|----------|---------------|
| [TRUTHPROJECT_DETECTION_GAPS.md](TRUTHPROJECT_DETECTION_GAPS.md) | Coverage analysis — what the 4 original detectors catch vs miss |
| [COMPREHENSIVE_DECEPTION_MAP.md](COMPREHENSIVE_DECEPTION_MAP.md) | Full deception taxonomy from large chat file analysis (290 lines) |
| [COMPREHENSIVE_DETECTION_IMPLEMENTED.md](COMPREHENSIVE_DETECTION_IMPLEMENTED.md) | Summary of all detectors ported from Python to TypeScript |
| [DECEPTION_ANALYSIS_REPORT.md](DECEPTION_ANALYSIS_REPORT.md) | File-scan deception analysis report |
| [DEPLOYMENT_DECEPTION_ANALYSIS.md](DEPLOYMENT_DECEPTION_ANALYSIS.md) | Known deception patterns from deployment history |
| [PERPLEXITY_DECEPTION_ANALYSIS.md](PERPLEXITY_DECEPTION_ANALYSIS.md) | Perplexity-based deception analysis |
| [TRUSTED_CONCEPT_MANIPULATION_SUMMARY.md](TRUSTED_CONCEPT_MANIPULATION_SUMMARY.md) | Summary of trusted-concept manipulation patterns |

## TaaS Framework (3 docs)

Trust-as-a-Service credibility framework and readiness assessment.

| Document | What It Covers |
|----------|---------------|
| [TAAS_CREDIBILITY_FRAMEWORK.md](TAAS_CREDIBILITY_FRAMEWORK.md) | Core TaaS credibility framework: "Freedom Through Diligence" (252 lines) |
| [TAAS_READINESS_ASSESSMENT.md](TAAS_READINESS_ASSESSMENT.md) | Honest operational readiness report for TaaS deployment |
| [TAAS_CREDIBILITY_AND_MANIPULATION_DETECTION.md](TAAS_CREDIBILITY_AND_MANIPULATION_DETECTION.md) | Combined credibility framework + trusted concept manipulation detection |

## Architecture & Infrastructure (5 docs)

System architecture, data layer, logging, and security.

| Document | What It Covers |
|----------|---------------|
| [PROGRAM_ARCHITECTURE_OVERVIEW.md](PROGRAM_ARCHITECTURE_OVERVIEW.md) | Complete program architecture overview (516 lines — largest doc) |
| [SYSTEM_COMPONENTS_MAP.md](SYSTEM_COMPONENTS_MAP.md) | Quick-reference component map: BBFB, TRUTHPROJECT, Decision Guide, API routes |
| [KV_SCHEMA.md](KV_SCHEMA.md) | Vercel KV (Redis) schema — key patterns, data structures, retention policies |
| [DATABASE_IMPLEMENTATION.md](DATABASE_IMPLEMENTATION.md) | Database persistence layer implementation details |
| [STRUCTURED_LOGGING_IMPLEMENTATION.md](STRUCTURED_LOGGING_IMPLEMENTATION.md) | Structured logging system design and implementation |

## Product Strategy & Safety (3 docs)

Product positioning, security considerations, and strategic analysis.

| Document | What It Covers |
|----------|---------------|
| [PRODUCT_POSITIONING_AND_SAFETY.md](PRODUCT_POSITIONING_AND_SAFETY.md) | Product positioning and safety framework for TaaS (287 lines) |
| [SECURITY_NOTES.md](SECURITY_NOTES.md) | Credentials management and security considerations |
| [STRATEGIC_DECISION_ANALYSIS.md](STRATEGIC_DECISION_ANALYSIS.md) | Analysis of "process now vs later" strategic options |

## Methodology & Verification (5 docs)

Ground truth methodology, code verification, and real-world validation.

| Document | What It Covers |
|----------|---------------|
| [GROUND_TRUTH_EXPLANATION.md](GROUND_TRUTH_EXPLANATION.md) | Explanation of the ground truth methodology |
| [GROUND_TRUTH_METHODOLOGY_ANALYSIS.md](GROUND_TRUTH_METHODOLOGY_ANALYSIS.md) | Critical analysis of the ground truth methodology |
| [CODE_VERIFICATION_CHECKLIST.md](CODE_VERIFICATION_CHECKLIST.md) | "No Black Boxes" code verification checklist |
| [OPTION_VS_RECOMMENDATION_ANALYSIS.md](OPTION_VS_RECOMMENDATION_ANALYSIS.md) | Language analysis: options vs recommendations framing |
| [REAL_WORLD_OUTPUT_18_MONTHS.md](REAL_WORLD_OUTPUT_18_MONTHS.md) | First real-world output after 18 months of development |

---

**Source**: Google Drive archive `drive-download-20260307T174438Z-3-001.zip`
(218 MB, 514 files total — 30 design docs extracted, remainder discarded).

**Date archived**: 2026-03-08
