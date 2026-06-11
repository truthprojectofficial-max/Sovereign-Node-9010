# System Components Map - Quick Reference

## 🎯 ONE-SENTENCE SUMMARY

**Groknett ValueForge** = BBFB Value Engine (calculates product worth) + TRUTHPROJECT (detects AI deception) + Decision Guide (combines both for recommendations), deployed on Vercel.

---

## 📦 COMPONENT BREAKDOWN

### 1. **BBFB Engine** (`lib/bbfb-engine.ts`)
**What it does**: Calculates product value using math (WPM, GRACE, TCO)  
**Input**: Product specs (price, reliability, performance, etc.)  
**Output**: BBFB score (value per dollar)

### 2. **TRUTHPROJECT** (`lib/deception-detector.ts`)
**What it does**: Detects AI deception patterns in text  
**Input**: Text (AI responses, chat logs)  
**Output**: Deception type, probability, flagged phrases

### 3. **Decision Guide** (`lib/decision-guide.ts`)
**What it does**: Combines BBFB + TRUTHPROJECT for recommendations  
**Input**: Product data + AI interaction text  
**Output**: Accept/Caution/Reject/Verify First + reasoning

### 4. **Data Processors** (`lib/data-processing/`)
**What it does**: Extracts interactions from your 797 files  
**Input**: Chat files (TXT, Grok format)  
**Output**: Structured interactions with deception flags

### 5. **Frontend** (`pages/`)
**What it does**: User interface for input and results  
**Pages**: `/` (BBFB), `/detect` (Deception)

### 6. **API** (`pages/api/`)
**What it does**: Backend logic for calculations and detection  
**Endpoints**: 14 routes (calculate, detect, guide-decision, etc.)

### 7. **Logging** (`lib/structured-logger.ts`)
**What it does**: Tracks everything with metadata  
**Storage**: Vercel KV (production)

---

## 🔄 HOW IT ALL CONNECTS

```
Your 797 Files
    ↓
[Data Processors] → Extract interactions
    ↓
[TRUTHPROJECT] → Detect deception (714 signals found)
    ↓
[Knowledge Base] → Learn patterns
    ↓
[BBFB Engine] → Calculate value (when product data provided)
    ↓
[Decision Guide] → Combine both → Recommendation
    ↓
[Frontend] → Show results to user
    ↓
[API] → Handle requests
    ↓
[Vercel] → Host everything (LIVE)
```

---

## 📊 DATA FLOW SUMMARY

**Product Data Flow**:
Raw specs → Normalize → BBFB Engine → Value Score

**Deception Detection Flow**:
Text → Parse → All Detectors → Highest Probability → Deception Result

**Decision Flow**:
Product + AI Text → BBFB + TRUTHPROJECT → Combine → Recommendation

---

## 🎯 KEY NUMBERS

- **797 files** processed
- **219 files** with deception keywords
- **714 deception signals** detected
- **71 high-priority files** identified
- **14 API endpoints** active
- **2 frontend pages** deployed
- **1 live deployment** on Vercel

---

**That's the whole system in a nutshell.**
