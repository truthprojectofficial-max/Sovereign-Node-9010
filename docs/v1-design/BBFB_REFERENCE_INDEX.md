# BBFB Framework - Complete Reference Index

**Date**: January 18, 2026  
**Purpose**: Quick reference guide to all BBFB documentation and implementation

---

## Core Documentation

| File | Purpose | Status |
|------|---------|--------|
| `BBFB_FORENSIC_AUDIT_COMPLETE.md` | **MASTER THEORY** - Complete theoretical foundation | ✅ Complete |
| `BBFB_ENGINE_WHAT_IT_SHOULD_DO.md` | What the engine does (4-stage pipeline) | ✅ Complete |
| `BBFB_ENGINE_GAP_ANALYSIS.md` | Identified gaps vs. framework | ✅ Complete |
| `BBFB_FRAMEWORK_PATTERNS_ANALYSIS.md` | Extracted patterns from framework doc | ✅ Complete |
| `BBFB_MANIPULATION_VULNERABILITY_ANALYSIS.md` | **CRITICAL** - Formularized manipulation point | ✅ Complete |
| `BBFB_IMPLEMENTATION_COMPLETE.md` | Implementation status summary | ✅ Complete |
| `DATA_INGESTION_READY.md` | How to use data ingestion system | ✅ Complete |

---

## Implementation Files

### Core Engine
- `lib/bbfb-engine.ts` - Main calculation logic (LAW, GRACE, FRUIT, VALUE)
- `lib/bbfb-normalization.ts` - Normalization functions (Geekbench, nits, etc.)

### Data Ingestion
- `lib/data-ingestion/category-configs.ts` - Category configurations (AHP weights, P_f tiers)
- `lib/data-ingestion/product-normalizer.ts` - Raw data → BBFB format
- `lib/data-ingestion/process-product-data.ts` - Batch processing

### Deception Detection
- `lib/deception-detector.ts` - TRUTHPROJECT deception detection
- `pages/api/detect.ts` - Deception detection API

### APIs
- `pages/api/calculate.ts` - BBFB calculation API
- `pages/api/process-products.ts` - Raw product data processing API

---

## Key Concepts Quick Reference

### The 4-Stage Pipeline

1. **LAW** (Binary Filtration)
   - Hard gates: Minimum specs (RAM, resolution, etc.)
   - Fail = VALUE = 0

2. **GRACE** (Risk Adjustment)
   - Non-linear penalty curves: `Penalty(P_f) = e^(k × P_f)`
   - Adjusts TCO based on failure rate

3. **FRUIT** (Benefit Aggregation)
   - Weighted Product Model: `CVS = ∏(x_ij)^w_j`
   - Multiplicative = holistic quality required

4. **VALUE** (Final Ratio)
   - `BBFB = FRUIT / TCO`
   - Pivot Point = optimal trade-off

---

## Mathematical Formulas

### GRACE Penalty Curves
```
Exponential: e^(2.5 × P_f)
Logistic: 1 / (1 + e^(-20 × (P_f - 0.05)))
Power: P_f^0.5
```

### FRUIT (WPM)
```
CVS = ∏(j=1 to n) (x_ij)^w_j
```

### TCO
```
TCO = Price + (Energy × Years) + (P_f × C_r) × Penalty(P_f)
```

### Manipulation Detection
```
M = max(score_i) - median(score_i)
If M > 0.5 → Manipulation Detected → CVS × 0.8
```

### Vendor Service Friction
```
C_risk_adjusted = C_risk × (1 + (0.9 - VSS_decimal))
```

---

## Category Configurations

| Category | AHP Weights | P_f Tiers | C_r | Years |
|----------|-------------|-----------|-----|-------|
| **Laptop** | Performance: 0.419<br>Display: 0.160<br>Battery: 0.263<br>Portability: 0.097<br>Repairability: 0.062 | Tier 1: 0.15<br>Tier 2: 0.20<br>Tier 3: 0.25 | $500 USD | 4 |
| **TV** | Contrast: 0.30<br>Brightness: 0.25<br>Color: 0.25<br>Gaming: 0.20 | Tier 1: 0.12<br>Tier 2: 0.18 | $1000 AUD | 6 |
| **Speaker** | Preference: 0.40<br>Bass: 0.25<br>Sensitivity: 0.20<br>Impedance: 0.15 | All: 0.04 | $300 AUD | 15 |
| **Microwave** | Wattage: 0.30<br>CHOICE: 0.35<br>Capacity: 0.20<br>Inverter: 0.15 | Tier 1: 0.20<br>Tier 2: 0.28 | $250 AUD | 7 |

---

## Data Acquisition Requirements

### Task 1A: Proxy Identification
- Geekbench 6 (Performance)
- RTINGS/NotebookCheck (Display)
- Consumer Reports (Reliability)
- iFixit (Repairability)
- Manufacturer specs (Weight, Battery)

### Task 1B: Normalization
- Min-Max Scaling: `(x - min) / (max - min)`
- Composite: Weighted average of normalized metrics

### Task 2A: Failure Rate Data
- 3-Year P_f from large-scale studies
- Brand/model tier assignment

### Task 2B: Catastrophic Repair Cost
- Logic board/panel replacement cost
- Standardized per category

### Task 2C: Price & Lifecycle
- Current street price
- Expected years of service

---

## Operational Procedures

### Processing Raw Product Data

1. **Format**: JSON array of `RawProductData` objects
2. **API**: `POST /api/process-products`
3. **Output**: Ranked results with deception/manipulation flags

### Example Request
```json
{
  "products": [
    {
      "make": "LG",
      "model": "C4 OLED",
      "category": "tv",
      "price": 2795,
      "contrastRatio": "Infinite",
      "hdrBrightness": 850,
      "dciP3Coverage": 99,
      "inputLag": 9.2
    }
  ]
}
```

---

## Temporal Tracking

### Data Refresh Schedule
- **Full Refresh**: April 15 (AHP weights, P_f, C_r, full data)
- **Interim Refresh**: October 15 (Pricing, new models, performance updates)

### Pivot Point Tracking
- Plot Price vs. CVS
- Identify "Upward and Leftward" shifts
- Validate framework remains current

---

## Legal Context

### ACCC Complaint: "AI Washing"
- **Allegations**: Lie of Capability, Lie of Certainty, Spoliation of Evidence
- **Defendants**: Google, Microsoft, Perplexity
- **Framework Role**: Proof of Competence (deterministic automation possible)

---

## Security Architecture

### Dual-Endpoint Verification
- **Primary**: Desktop AI (Perplexity/Azure)
- **Secondary**: Pixel 7a (Mobile Node)
- **Protocol**: Hash comparison → Governance Lock on mismatch

### Governance Roles
- Perplexity: Financial Automation Custodian (High suspicion)
- Autoplexity: JESUS CODE execution
- Pixel 7a: Mobile Verification Node
- Copilot: Command AI (Strategy/Documentation)

---

## Future Enhancements

### Recommended
1. ESG metrics integration (Carbon Footprint, Recycled Materials)
2. Vendor reliability database (Service Friction coefficients)
3. Real-time proxy data feeds (Consumer Reports, iFixit)
4. Multi-currency support (USD, AUD, etc.)

---

## Quick Links

- **Theory**: `BBFB_FORENSIC_AUDIT_COMPLETE.md`
- **Implementation**: `BBFB_IMPLEMENTATION_COMPLETE.md`
- **Manipulation**: `BBFB_MANIPULATION_VULNERABILITY_ANALYSIS.md`
- **Data Ingestion**: `DATA_INGESTION_READY.md`
- **Engine Status**: `BBFB_ENGINE_WHAT_IT_SHOULD_DO.md`

---

**Last Updated**: January 18, 2026
