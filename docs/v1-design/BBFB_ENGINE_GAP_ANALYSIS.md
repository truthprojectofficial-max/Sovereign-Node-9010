# BBFB Engine Gap Analysis & Enhancement Plan

**Date**: January 18, 2026  
**Status**: Critical gaps identified - engine missing GRACE curves and normalization

---

## What the Engine SHOULD Be Doing (Per Framework)

The BBFB Framework defines a **4-stage pipeline**:

1. **LAW** → Binary hard gates (✓ **IMPLEMENTED**)
2. **GRACE** → Non-linear risk penalty curves applied to TCO (❌ **MISSING**)
3. **FRUIT** → WPM benefit calculation (✓ **IMPLEMENTED**)
4. **VALUE** → Benefit / TCO ratio (✓ **IMPLEMENTED**)

---

## Critical Gaps Identified

### Gap 1: GRACE Penalty Curves (HIGH PRIORITY)

**Current Implementation:**
```typescript
// lib/bbfb-engine.ts line 95
const repairCost = failureRate * catastrophicRepairCost;  // LINEAR
```

**Framework Requirement:**
- **Exponential Penalty**: `Penalty(P_f) = e^(k·P_f)` where k=2.5
- **Logistic Penalty**: `Penalty(P_f) = 1 / (1 + e^(-k·(P_f - t)))`
- **Power Penalty**: `Penalty(P_f) = P_f^α`

**Impact**: Current TCO underestimates risk for high-failure products. A 25% failure rate should receive a **disproportionately large penalty**, not just 25% × $500 = $125.

**Required Fix:**
```typescript
TCO_adjusted = TCO_base × Penalty(P_f)
```

---

### Gap 2: Data Normalization Functions (HIGH PRIORITY)

**Current State**: Engine expects pre-normalized scores (0-1.0)

**Framework Requirement**: Engine must accept **raw objective proxies** and normalize them:
- Geekbench scores (8000-15000) → 0-1.0
- Nits (300-2000) → 0-1.0
- iFixit scores (1-10) → 0-1.0
- Consumer Reports (1-5) → 0-1.0

**Required Functions:**
- `normalizeMinMax(value, min, max, higherIsBetter)`
- `normalizeComposite(metrics[], weights[])` for multi-metric attributes

---

### Gap 3: Objective Proxy Data Ingestion (MEDIUM PRIORITY)

**Current State**: No way to input raw product data (make, model, Geekbench score, etc.)

**Framework Requirement**: Accept raw product data and automatically:
1. Extract objective proxies from product object
2. Normalize each proxy
3. Calculate FRUIT
4. Apply GRACE
5. Calculate VALUE

**Required Interface:**
```typescript
interface RawProduct {
  make: string;
  model: string;
  price: number;
  // Raw proxies
  geekbenchScore?: number;
  peakBrightness?: number;  // nits
  dciP3Coverage?: number;   // %
  batteryHours?: number;
  weightKg?: number;
  ifixitScore?: number;      // 1-10
  consumerReportsReliability?: number;  // 1-5
  // Category-specific
  category: 'laptop' | 'tv' | 'speaker' | 'microwave' | 'washing_machine';
}
```

---

### Gap 4: Pivot Point Calculation (MEDIUM PRIORITY)

**Framework Requirement**: Identify the "BBFB Pivot Point" using the **Elbow Method**:
- Plot Price (X) vs CVS (Y) for all products
- Find product with maximum perpendicular distance from baseline-to-ceiling line
- This marks the transition from "High-Value Zone" to "Zone of Diminishing Returns"

**Required Function:**
```typescript
function findPivotPoint(products: CalculationResult[]): Product
```

---

### Gap 5: Temporal Scalability Tracking (LOW PRIORITY)

**Framework Requirement**: Track "Upward and Leftward" shift of Pivot Point over time:
- Semi-annual data refresh (April 15, October 15)
- Renormalize boundaries (X_min, X_max) for new market cohort
- Compare Pivot Point position year-over-year

**Required**: Database schema for historical Pivot Points

---

## What the Engine IS Currently Doing

✅ **Working:**
- LAW hard gates (binary pass/fail)
- FRUIT calculation (WPM)
- VALUE calculation (Benefit / TCO)
- Basic TCO (price + energy + linear risk)

❌ **Not Working:**
- GRACE non-linear penalties
- Raw data normalization
- Objective proxy ingestion
- Pivot Point identification
- Temporal tracking

---

## Recommended Implementation Order

1. **Add GRACE penalty curves** (Critical - affects all calculations)
2. **Add normalization functions** (Critical - needed for raw data)
3. **Add RawProduct interface** (High - enables operational use)
4. **Add Pivot Point calculation** (Medium - core framework feature)
5. **Add temporal tracking** (Low - future enhancement)

---

## Next Steps

1. Update `lib/bbfb-engine.ts` with GRACE curves
2. Add normalization utilities
3. Create `RawProduct` → `Product` transformation
4. Test with provided data (TVs, speakers, microwaves, washing machines)
5. Process framework document for deception patterns
