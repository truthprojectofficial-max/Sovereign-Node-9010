# What the BBFB Engine Should Be Doing

**Date**: January 18, 2026  
**Status**: Engine is 75% complete - GRACE curves missing

---

## The 4-Stage Pipeline (Per Framework)

### Stage 1: LAW (Binary Filtration) ✅ **WORKING**
**Purpose**: Eliminate products that don't meet minimum requirements

**What it does:**
- Checks hard gates (e.g., "Has 16GB RAM?", "Has 1080p resolution?")
- If ANY gate fails → **VALUE = 0** (product eliminated)

**Current Status**: ✅ Implemented correctly

---

### Stage 2: GRACE (Risk Adjustment) ❌ **MISSING**
**Purpose**: Apply non-linear penalties to TCO based on failure risk

**What it SHOULD do:**
1. Calculate base TCO: `Price + Energy + (P_f × C_r)`
2. Apply penalty curve: `TCO_adjusted = TCO_base × Penalty(P_f)`
3. Penalty curves:
   - **Exponential**: `e^(2.5 × P_f)` - Small increases in failure rate = huge penalty
   - **Logistic**: `1 / (1 + e^(-20 × (P_f - 0.05)))` - Smooth S-curve
   - **Power**: `P_f^0.5` - Moderate penalty

**Example:**
- Product A: P_f = 0.15 (15%), C_r = $500
  - Current (wrong): Risk = 0.15 × $500 = $75
  - Correct (exponential): Risk = $75 × e^(2.5 × 0.15) = $75 × 1.45 = **$109**
  
- Product B: P_f = 0.25 (25%), C_r = $500
  - Current (wrong): Risk = 0.25 × $500 = $125
  - Correct (exponential): Risk = $125 × e^(2.5 × 0.25) = $125 × 1.87 = **$234**

**Impact**: High-failure products get **disproportionately penalized** (reflects real-world disruption cost)

**Current Status**: ❌ **MISSING** - TCO is linear, not penalized

---

### Stage 3: FRUIT (Benefit Calculation) ✅ **WORKING**
**Purpose**: Calculate Composite Value Score (CVS) using Weighted Product Model

**What it does:**
1. Normalize all attributes to 0-1.0 (if raw data provided)
2. Calculate: `CVS = ∏(attribute_i ^ weight_i)`
3. Multiplicative nature = if ANY attribute is 0, CVS = 0 (non-compensatory)

**Current Status**: ✅ Implemented correctly

**Note**: Currently expects pre-normalized scores. Need to add normalization functions for raw data.

---

### Stage 4: VALUE (Final Ratio) ✅ **WORKING**
**Purpose**: Calculate "Bang for Buck" = Benefit / TCO

**What it does:**
- `VALUE = FRUIT / TCO_adjusted`
- Higher VALUE = better value
- Used to rank products and find "Pivot Point"

**Current Status**: ✅ Implemented correctly

**Note**: Currently uses TCO_base (without GRACE penalty), so VALUE is slightly inflated for high-risk products.

---

## What the Engine IS Currently Doing

### ✅ **Working Correctly:**
1. LAW hard gates - eliminates non-viable products
2. FRUIT calculation - WPM works as designed
3. VALUE calculation - Benefit / TCO ratio correct
4. Basic TCO - Price + Energy + Linear Risk

### ❌ **Not Working:**
1. **GRACE penalty curves** - TCO doesn't penalize high-risk products enough
2. **Normalization** - Can't accept raw data (Geekbench scores, nits, etc.)
3. **Raw data ingestion** - Expects pre-normalized scores
4. **Pivot Point** - No function to find optimal value point

---

## The Fix Needed

### Priority 1: Add GRACE Penalty Curves

**File**: `lib/bbfb-engine.ts`

**Change**:
```typescript
// CURRENT (line 95):
const repairCost = failureRate * catastrophicRepairCost;

// SHOULD BE:
const baseRiskCost = failureRate * catastrophicRepairCost;
const penalty = applyGracePenalty(failureRate, 'exponential');
const adjustedRiskCost = baseRiskCost * penalty;
```

**Impact**: All TCO calculations will correctly penalize high-risk products.

---

### Priority 2: Add Normalization Functions

**New File**: `lib/bbfb-normalization.ts`

**Functions**:
- `normalizeMinMax(value, min, max, higherIsBetter)`
- `normalizeComposite(metrics[], weights[])`

**Impact**: Engine can accept raw product data (Geekbench, nits, iFixit scores).

---

### Priority 3: Add Raw Product Interface

**Update**: `lib/bbfb-engine.ts`

**Add**:
```typescript
interface RawProduct {
  make: string;
  model: string;
  price: number;
  category: 'laptop' | 'tv' | 'speaker' | 'microwave' | 'washing_machine';
  // Raw proxies (will be normalized)
  geekbenchScore?: number;
  peakBrightness?: number;
  // ... etc
}
```

**Impact**: Can ingest the product data you've collected (TVs, speakers, microwaves, washing machines).

---

## Summary

**The engine is 75% complete.** The core logic (LAW, FRUIT, VALUE) works correctly, but:

1. **GRACE curves are missing** - This is critical for accurate TCO
2. **Normalization is missing** - Can't process raw product data
3. **Raw data interface is missing** - Can't use your collected data yet

**Recommendation**: Fix GRACE curves first (affects all calculations), then add normalization (enables your data).

---

## Next Steps

1. ✅ **Gap analysis complete** (this document)
2. ⏳ **Implement GRACE curves** (1-2 hours)
3. ⏳ **Add normalization functions** (1-2 hours)
4. ⏳ **Add RawProduct interface** (1 hour)
5. ⏳ **Test with your data** (TVs, speakers, microwaves, washing machines)

**Ready to proceed?** I can implement the GRACE curves and normalization now.
