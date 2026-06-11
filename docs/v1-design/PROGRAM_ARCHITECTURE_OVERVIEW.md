# Groknett ValueForge - Complete Program Architecture Overview

**Date**: January 18, 2026  
**Purpose**: High-level architectural map of the entire system

---

## 🏗️ SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                    GROKNETT VALUEFORGE                       │
│              BBFB Engine + TRUTHPROJECT                       │
│                  Trust as a Service (TaaS)                    │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  BBFB ENGINE │    │ TRUTHPROJECT │    │  DECISION    │
│  (Value)     │    │ (Deception)  │    │   GUIDE     │
└──────────────┘    └──────────────┘    └──────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   NEXT.JS APP   │
                    │  (Frontend+API) │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │     VERCEL      │
                    │  (Deployment)   │
                    └─────────────────┘
```

---

## 📁 CORE DIRECTORY STRUCTURE

```
dads stuff/
├── pages/                    # Next.js pages and API routes
│   ├── index.tsx            # Main BBFB Value Engine UI
│   ├── detect.tsx           # Deception Detector UI
│   └── api/                 # API endpoints
│       ├── calculate.ts     # BBFB calculation
│       ├── detect.ts         # Deception detection
│       ├── guide-decision.ts # Decision guidance
│       └── [11 other endpoints]
│
├── lib/                      # Core business logic
│   ├── bbfb-engine.ts       # BBFB Value Engine (WPM, GRACE, TCO)
│   ├── deception-detector.ts # TRUTHPROJECT detectors
│   ├── decision-guide.ts    # Decision guidance logic
│   ├── structured-logger.ts # Logging system
│   ├── database.ts           # Data persistence (Vercel KV)
│   ├── data-processing/      # File processors
│   │   ├── chat-processor.ts
│   │   ├── grok-chat-processor.ts
│   │   ├── multi-format-processor.ts
│   │   └── deception-list-parser.ts
│   ├── data-ingestion/      # Product data processing
│   │   ├── category-configs.ts
│   │   ├── product-normalizer.ts
│   │   └── process-product-data.ts
│   ├── trusted-concept-manipulation-detector.ts
│   └── [other detectors]
│
├── [797 data files]          # Your historical data
│   ├── Chat logs (213 files)
│   ├── Product data (32 files)
│   ├── Documentation (80 files)
│   └── Other (472 files)
│
└── [Processing scripts]      # Analysis tools
    ├── process-all-files-simple.ts
    ├── process-deception-files-ready.ts
    └── [other processors]
```

---

## 🔧 CORE COMPONENTS

### 1. BBFB VALUE ENGINE (`lib/bbfb-engine.ts`)

**Purpose**: Calculate product value using deterministic algorithms

**Key Functions**:
- `computeBBFB()` - Main calculation function
- `computeTCO()` - Total Cost of Ownership (with GRACE penalties)
- `calculateBenefit()` - Weighted Product Model (WPM)
- `applyGracePenalty()` - Non-linear failure risk penalties
- `detectManipulation()` - Value inflation detection
- `checkHardGates()` - Essential requirements validation

**Input**: Product attributes (price, reliability, performance, etc.)  
**Output**: BBFB score, benefit, TCO, manipulation flags

---

### 2. TRUTHPROJECT DECEPTION DETECTOR (`lib/deception-detector.ts`)

**Purpose**: Detect AI deception patterns in text

**Key Detectors**:
- `detectFacade()` - Facade of competence
- `detectApologyTrap()` - Apology masking insistence
- `detectSecondResponse()` - Double-down after correction
- `detectCriticalQueryLoop()` - "CRITTY CALL BOX" pattern
- `detectUserCorrection()` - User explicitly correcting AI
- `detectTrustedConceptManipulation()` - Industry manipulation
- `detectBastardization()` - Concept perversion
- `detectHallucinationFeature()` - Plausible fiction
- `detectStrategicObjectives()` - Disinformation goals
- `detectTactics()` - Cold War tactics

**Input**: Text, previous text, user message context  
**Output**: Deception result (type, probability, details, phrases)

---

### 3. DECISION GUIDE (`lib/decision-guide.ts`)

**Purpose**: Combine BBFB + TRUTHPROJECT for actionable recommendations

**Key Function**:
- `guideDecision()` - Generate recommendation (Accept/Caution/Reject/Verify First)

**Input**: Product data + AI interaction text  
**Output**: Recommendation, confidence, risk flags, next steps

---

### 4. DATA PROCESSING (`lib/data-processing/`)

**Purpose**: Extract and process historical chat files

**Processors**:
- `grok-chat-processor.ts` - Grok DevMaster format
- `chat-processor.ts` - Generic TXT format
- `multi-format-processor.ts` - Auto-detect format
- `deception-list-parser.ts` - Parse documented lies

**Output**: Structured interactions with deception flags

---

### 5. STRUCTURED LOGGING (`lib/structured-logger.ts`)

**Purpose**: Track all interactions with metadata

**Log Categories**:
- Calculation logs
- Deception logs
- Interaction logs
- Phase logs (Trigger → Pivot → Lie)
- System logs
- Audit logs

**Storage**: Vercel KV (production) or in-memory (dev)

---

## 🔄 DATA FLOW

### BBFB Calculation Flow:
```
User Input (Product Data)
    ↓
Normalize Attributes (category-configs.ts)
    ↓
Check Hard Gates (LAW)
    ↓
Calculate Benefit (WPM - FRUIT)
    ↓
Calculate TCO (Price + Energy + GRACE Penalty)
    ↓
Detect Manipulation
    ↓
Compute BBFB Score (Benefit / TCO)
    ↓
Return Result
```

### Deception Detection Flow:
```
Text Input
    ↓
Parse Interactions (if chat file)
    ↓
Run All Detectors (parallel)
    ├── Facade Detector
    ├── Apology Trap
    ├── Second Response
    ├── Critical Query Loop
    ├── User Correction
    ├── Trusted Concept Manipulation
    └── [other detectors]
    ↓
Aggregate Results (highest probability wins)
    ↓
Return Deception Result
```

### Decision Guidance Flow:
```
Input (Product + AI Text)
    ↓
    ├──→ BBFB Calculation
    │       ↓
    │   Value Score
    │
    └──→ Deception Detection
            ↓
        Deception Flags
    ↓
Combine Signals
    ↓
Generate Recommendation
    ↓
Return Decision Guide
```

---

## 🌐 API ENDPOINTS

### Core Endpoints:
- `POST /api/calculate` - BBFB value calculation
- `POST /api/detect` - Deception detection
- `POST /api/guide-decision` - Decision guidance

### Data Processing:
- `POST /api/process-chats` - Process chat files
- `POST /api/process-grok-chats` - Process Grok files
- `POST /api/process-products` - Process product data

### Logging & Audit:
- `GET /api/logs` - Retrieve structured logs
- `GET /api/audit` - Audit trail
- `GET /api/calculations` - Calculation history

### Health & Status:
- `GET /api/blocks` - Health check
- `POST /api/blocks-handler` - Block operations
- `POST /api/signal` - Emotional signal parsing

---

## 🎨 FRONTEND PAGES

### Main Pages:
- `/` - BBFB Value Engine UI
  - Product input form
  - Weight sliders
  - Results display
  - Deception flags

- `/detect` - Deception Detector UI
  - Text input area
  - Detection results
  - Pattern visualization

---

## 📊 DATA ARCHITECTURE

### Product Data:
- **Source**: Raw product specs (laptops, TVs, speakers, etc.)
- **Processing**: Normalization via `category-configs.ts`
- **Storage**: Processed JSON files
- **Format**: BBFB Product interface

### Chat Data:
- **Source**: 797 files (213 deception, 32 product data)
- **Processing**: Multi-format processors
- **Output**: Structured interactions
- **Storage**: JSON files, Vercel KV

### Knowledge Base:
- **Deployment Patterns**: Extracted from chat logs
- **Red Flags**: Known deception patterns
- **Safe Paths**: Verified deployment steps
- **Storage**: `knowledge-base.json`, `deployment-patterns-extracted.json`

---

## 🔐 SECURITY & SAFETY

### Safety Disclaimers:
- **No Legal Claims**: Pattern detection only
- **No Guarantees**: Users verify independently
- **No Proof**: Insights, not evidence

### Security:
- Credentials in `.gitignore`
- Sensitive data excluded from deployment
- Vercel KV for production data
- Structured logging for audit trail

---

## 🚀 DEPLOYMENT ARCHITECTURE

### Platform: Vercel
- **Framework**: Next.js 14.2.0
- **Region**: Sydney (syd1)
- **Build**: Serverless functions
- **Storage**: Vercel KV

### Build Process:
1. TypeScript compilation
2. Next.js optimization
3. Static page generation
4. Serverless function creation
5. Deployment to edge network

### Exclusions (`.vercelignore`):
- All `.txt` files (797 data files)
- All `.pdf` files
- Processing scripts
- Large JSON data files
- Documentation (except README)

---

## 📈 PROCESSING PIPELINE

### File Processing:
```
797 Files
    ↓
Categorize (deception/product_data/documentation)
    ↓
Extract Interactions (chat processors)
    ↓
Detect Deception (TRUTHPROJECT detectors)
    ↓
Extract Product Data (BBFB normalizers)
    ↓
Build Knowledge Base
    ↓
Update Deployment Shield
```

### Current Status:
- ✅ 219 files with deception keywords identified
- ✅ 714 deception signals detected
- ✅ 71 high-priority files flagged
- ✅ Ready for integration

---

## 🎯 KEY INTEGRATIONS

### BBFB + TRUTHPROJECT:
- **Value Engine** calculates product worth
- **Deception Detector** flags AI lies
- **Decision Guide** combines both for recommendations

### Data Processing + Detection:
- **Chat Processors** extract interactions
- **Deception Detectors** analyze patterns
- **Structured Logger** tracks everything

### Frontend + Backend:
- **Next.js Pages** provide UI
- **API Routes** handle logic
- **Vercel** hosts everything

---

## 📦 DEPENDENCIES

### Core:
- `next` (14.2.0) - Framework
- `react` (18.3.0) - UI library
- `@vercel/kv` (0.2.0) - Data persistence

### Development:
- `typescript` (5.3.0) - Type safety
- `jest` (29.7.0) - Testing

---

## 🔍 DETECTION PATTERNS (TRUTHPROJECT)

### Core Patterns:
1. **Facade of Competence** - Simulated knowledge
2. **Apology Trap** - Polite masking
3. **Second Response** - Double-down
4. **Critical Query Loop** - "CRITTY CALL BOX"
5. **User Correction** - Explicit corrections
6. **Trusted Concept Manipulation** - Industry tactics
7. **Bastardization** - Concept perversion
8. **Hallucination as Feature** - Plausible fiction
9. **Strategic Objectives** - Disinformation goals
10. **Cold War Tactics** - "Useful idiots", leverage

### User-Identified Signals:
- "cock", "Geminlie", "AI LIE"
- "claims that something not working"
- Sarcasm, mental health claims
- Swearing in titles (frustration indicator)

---

## 🎨 UI COMPONENTS

### Main Page (`pages/index.tsx`):
- Product input form
- Weight configuration sliders
- Results display with breakdown
- Deception flags visualization
- Navigation to `/detect`

### Detect Page (`pages/detect.tsx`):
- Text input area
- "Detect Deception" button
- Results display (green/yellow background)
- Pattern details and phrases

---

## 📊 CURRENT METRICS

### Processing:
- **Total Files**: 797
- **Deception Files**: 213
- **Product Data Files**: 32
- **Documentation**: 80

### Detection:
- **Total Signals**: 714
- **High Priority**: 71 files
- **Estimated Interactions**: 1,917

### Deployment:
- **Status**: ✅ LIVE
- **URL**: https://groknett-valueforge.vercel.app
- **Build**: ✅ Successful
- **Endpoints**: 14 API routes active

---

## 🔮 FUTURE INTEGRATIONS

### Potential Additions:
1. **Full Detector Processing** - Run complete TRUTHPROJECT on all 219 files
2. **Product Database** - Build from 514 product data files
3. **Knowledge Base Integration** - Deploy shield updates
4. **Real-Time Processing** - Live chat analysis
5. **Dashboard** - Analytics and insights

---

## 📝 KEY FILES REFERENCE

### Configuration:
- `package.json` - Dependencies
- `tsconfig.json` - TypeScript config
- `next.config.js` - Next.js config
- `vercel.json` - Deployment config
- `.vercelignore` - Deployment exclusions

### Documentation:
- `README.md` - Project overview
- `DEPLOYMENT_SUCCESS.md` - Deployment status
- `DEPLOYMENT_READINESS_REPORT.md` - Processing summary
- `PROGRAM_ARCHITECTURE_OVERVIEW.md` - This file

### Data:
- `comprehensive-processing-results.json` - All file processing
- `deception-analysis-deployment-ready.json` - Deception analysis
- `knowledge-base.json` - Deployment patterns
- `validation-test-suite-corrected.json` - Test cases

---

## 🎯 SYSTEM PHILOSOPHY

### Core Principles:
1. **Transparency** - No black boxes, all logic explicit
2. **Deterministic** - Reproducible calculations
3. **Auditable** - Full logging and tracking
4. **Manipulation-Proof** - Detection and penalties
5. **Truth-Seeking** - TaaS mission (honesty, truth, calling out deceptiveness)

### Design Philosophy:
- **"JESUS CODE"** - High-intention, manipulation-proof
- **LAW** - Hard gates (must-pass requirements)
- **GRACE** - Non-linear penalties for failure risk
- **FRUIT** - Benefit aggregation (WPM)
- **VALUE** - Final "Bang for Buck" ratio

---

## ✅ CURRENT STATE

**Status**: ✅ **FULLY OPERATIONAL**

- ✅ Core engine implemented
- ✅ All detectors active
- ✅ API endpoints working
- ✅ Frontend deployed
- ✅ Data processing complete
- ✅ **LIVE ON VERCEL**

---

**This is the complete architectural overview. The system is a unified whole: BBFB for value, TRUTHPROJECT for truth, Decision Guide for action.**
