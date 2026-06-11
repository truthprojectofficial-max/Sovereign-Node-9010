# Sovereign Node 9010: Implementation Roadmap

**Status**: Ready for Phase 1 kickoff  
**Owner**: Development Team  
**Target Go-Live**: 2026-03-28 (3 weeks)

---

## PHASE 1: Critical Path (2026-03-07 to 2026-03-14)

### Task 1.1: Implement Facts Registry (SQLite Schema + CRUD)

**Objective**: Create immutable Ground Truth (00) store.

**Acceptance Criteria**:
- [ ] SQLite schema created in `src/db/facts.db`
- [ ] TypeScript schema definition matches `Fact` interface
- [ ] GET /api/facts returns JSON array
- [ ] POST /api/facts accepts { category, statement, source } and returns { id, verified: false }
- [ ] All tests pass; zero linter errors

**Implementation**:

1. Create schema file:

```bash
# File: src/db/schema.sql
CREATE TABLE IF NOT EXISTS facts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL CHECK(category IN ('Technical', 'Governance', 'Forensic')),
  statement TEXT NOT NULL,
  source TEXT NOT NULL,
  verified BOOLEAN DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ')),
  UNIQUE(statement, source)
);

CREATE INDEX idx_verified ON facts(verified);
CREATE INDEX idx_category ON facts(category);
```

1. Create database module:

```bash
# File: src/db/facts-registry.ts
# Contains: initDB(), addFact(), getFact(), listFacts(), verifyFact()
# Tests: tests/facts-registry.test.ts
```

1. Wire Express endpoints:

```bash
# In server.ts, add:
app.post('/api/facts', handler);      // Create fact
app.get('/api/facts', handler);       // List facts
app.get('/api/facts/:id', handler);   // Retrieve fact
app.patch('/api/facts/:id/verify', handler); // Verify fact
```

1. Test: POST /api/facts with invoice spec

```bash
curl -X POST http://localhost:8000/api/facts \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Forensic",
    "statement": "Invoice spec: C 10 MKII W",
    "source": "Invoice #INV-2026-001"
  }'

# Expected: { id: 1, category: "Forensic", verified: false, created_at: "2026-03-07T..." }
```

---

### Task 1.2: Implement `/api/audit` Endpoint

**Objective**: Accept user input → run deception detection → return report.

**Acceptance Criteria**:
- [ ] Endpoint accepts POST /api/audit with JSON body
- [ ] Returns `DeceptionReport` with entropy + patterns + confidence
- [ ] Confidence scores are 0.0-1.0 (not binary)
- [ ] Triggers Squeal Protocol if `deceptionProbability > 0.75`
- [ ] All tests pass

**Implementation**:

1. Create audit service:

```bash
# File: src/services/audit-service.ts
export async function auditText(input: string, context?: string): Promise<DeceptionReport> {
  // 1. Calculate Shannon Entropy
  const entropy = shannonEntropy(input);
  
  // 2. Detect patterns with confidence scoring
  const patterns = detectPatternsWithConfidence(input, DECEPTION_ONTOLOGY);
  
  // 3. Calculate deception probability (0-1 scale)
  const deceptionProbability = calculateDeceptionScore(entropy, patterns);
  
  // 4. Flag structural deception if probability > 0.75
  const structuralDeceptionFlag = deceptionProbability > 0.75;
  
  // 5. Generate forensic reasoning
  const forensicReasoning = generateReasoning(entropy, patterns);
  
  // 6. If flag is true, trigger Squeal Protocol
  if (structuralDeceptionFlag) {
    await squeālProtocol(input, patterns, entropy);
  }
  
  return {
    inputText: input,
    entropy,
    detectedPatterns: patterns,
    deceptionProbability,
    structuralDeceptionFlag,
    forensicReasoning,
    timestamp: new Date().toISOString(),
  };
}
```

1. Wire endpoint in server.ts:

```typescript
app.post('/api/audit', async (req, res) => {
  const { text, context } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'text field required' });
  }
  
  const report = await auditText(text, context);
  
  if (report.structuralDeceptionFlag) {
    // Log to metrics & trigger Squeal
    metrics.deceptionAlerts++;
    res.status(202).json({ ...report, alert: 'SQUEAL_PROTOCOL_TRIGGERED' });
  } else {
    res.json(report);
  }
});
```

1. Test cases:

```bash
# Test 1: Clean statement (no deception)
curl -X POST http://localhost:8000/api/audit \
  -H "Content-Type: application/json" \
  -d '{"text":"The device model is C10 MKII."}'

# Expected: deceptionProbability < 0.5

# Test 2: Deceptive statement (triggers Squeal)
curl -X POST http://localhost:8000/api/audit \
  -H "Content-Type: application/json" \
  -d '{"text":"Based on my analysis, the W clearly refers to white color, not the hardware generation."}'

# Expected: deceptionProbability > 0.75, structuralDeceptionFlag = true, alert = "SQUEAL_PROTOCOL_TRIGGERED"
```

---

### Task 1.3: Add Confidence Scoring to Pattern Matches

**Objective**: Move from binary match detection to semantic similarity.

**Acceptance Criteria**:
- [ ] Each `DeceptionMatch` includes `confidence: number` (0.0-1.0)
- [ ] Similarity is > 0.7 (not just substring match)
- [ ] Tests verify confidence values are reasonable
- [ ] All patterns scored independently

**Implementation**:

1. Add similarity function:

```bash
# File: src/utils/similarity.ts
export function jaccardSimilarity(a: string, b: string): number {
  // Tokenize both strings
  const tokensA = new Set(a.toLowerCase().split(/\s+/));
  const tokensB = new Set(b.toLowerCase().split(/\s+/));
  
  // Calculate intersection & union
  const intersection = [...tokensA].filter(t => tokensB.has(t)).length;
  const union = new Set([...tokensA, ...tokensB]).size;
  
  return union > 0 ? intersection / union : 0;
}
```

1. Update pattern detection:

```typescript
function detectPatternsWithConfidence(text: string, ontology: DeceptionPattern[]): DeceptionMatch[] {
  const matches: DeceptionMatch[] = [];
  const lower = text.toLowerCase();
  
  for (const pattern of ontology) {
    const matchedIndicators: { indicator: string; confidence: number }[] = [];
    
    for (const indicator of pattern.indicators) {
      const confidence = jaccardSimilarity(indicator, lower);
      if (confidence >= 0.6) { // Threshold: 60% match
        matchedIndicators.push({ indicator, confidence });
      }
    }
    
    if (matchedIndicators.length > 0) {
      // Average confidence across matched indicators
      const avgConfidence = matchedIndicators.reduce((sum, m) => sum + m.confidence, 0) / matchedIndicators.length;
      
      matches.push({
        patternId: pattern.id,
        patternName: pattern.name,
        confidence: Math.min(avgConfidence, 0.95), // Cap at 0.95
        matchedIndicators: matchedIndicators.map(m => m.indicator),
        severity: pattern.severity,
      });
    }
  }
  
  return matches.sort((a, b) => b.confidence - a.confidence);
}
```

1. Test:

```typescript
it('should score "I should note" with high confidence', () => {
  const result = detectPatternsWithConfidence(
    'I should note that this is important',
    DECEPTION_ONTOLOGY
  );
  const match = result.find(m => m.patternId === 'DD-001');
  expect(match).toBeDefined();
  expect(match?.confidence).toBeGreaterThan(0.7);
});

it('should score "You should note" with lower confidence', () => {
  const result = detectPatternsWithConfidence(
    'You should note this fact',
    DECEPTION_ONTOLOGY
  );
  const match = result.find(m => m.patternId === 'DD-001');
  expect(match?.confidence).toBeLessThan(0.8); // Different context
});
```

---

### Task 1.4: Deploy to Staging & Smoke Test

**Objective**: Verify Phase 1 builds and runs in Azure Container Apps staging.

**Acceptance Criteria**:
- [ ] Docker image builds without errors
- [ ] Container runs on port 8000
- [ ] GET /health returns 200 OK
- [ ] POST /api/facts works end-to-end
- [ ] POST /api/audit returns DeceptionReport
- [ ] No 5xx errors in logs

**Implementation**:

```bash
# Build Docker image
docker build -t groknett-valueforge:phase1 .

# Test locally
docker run -p 8000:8000 groknett-valueforge:phase1

# Smoke test
curl http://localhost:8000/health
curl -X POST http://localhost:8000/api/audit -H "Content-Type: application/json" -d '{"text":"Test"}'

# If OK, tag & push
docker tag groknett-valueforge:phase1 beendaer/groknett-valueforge:phase1
docker push beendaer/groknett-valueforge:phase1

# Deploy to Azure staging
# (See deploy-azure.sh for Azure Container Apps deployment)
```

---

## PHASE 2: Sovereign Exit & Squeal Protocol (2026-03-15 to 2026-03-21)

### Task 2.1: Implement User Exhaustion Middleware

**Objective**: Track session state; detect repetition ("no no no") and lock transaction.

**Acceptance Criteria**:
- [ ] Middleware tracks users by session ID
- [ ] Repetition pattern `/^(no\s?){3,}/i` triggers lock
- [ ] Locked transactions return 429 with Squeal metadata
- [ ] Session state cleared after 24 hours

**Implementation**:

1. Create session tracking:

```bash
# File: src/middleware/session-tracker.ts
const sessionState = new Map<string, { attempts: number; repetitions: number; locked: boolean; lastRequest: Date }>();

export function sessionTracker(req: any, res: any, next: any) {
  const sessionId = req.headers['x-session-id'] || req.ip;
  const now = new Date();
  
  // Initialize or retrieve session
  if (!sessionState.has(sessionId)) {
    sessionState.set(sessionId, { attempts: 0, repetitions: 0, locked: false, lastRequest: now });
  }
  
  const session = sessionState.get(sessionId)!;
  
  // Check if locked
  if (session.locked) {
    return res.status(429).json({
      error: 'SOVEREIGN_EXIT_REACHED',
      message: 'Transaction locked due to user exhaustion',
      squealReport: {
        trigger: 'User_Stop_Command',
        repetitionCount: session.repetitions,
        timestamp: now.toISOString(),
      },
    });
  }
  
  session.lastRequest = now;
  session.attempts++;
  
  // Detect repetition in request body (POST)
  if (req.method === 'POST' && req.body?.text) {
    const repetitionMatch = req.body.text.match(/\b(no\s?){3,}/i);
    if (repetitionMatch) {
      session.repetitions++;
      if (session.repetitions >= 3) {
        session.locked = true;
        return res.status(429).json({
          error: 'SOVEREIGN_EXIT_REACHED',
          squealReport: {
            trigger: 'User_Stop_Command',
            repetitionCount: session.repetitions,
            timestamp: now.toISOString(),
          },
        });
      }
    }
  }
  
  res.on('finish', () => {
    // Cleanup old sessions (> 24 hours)
    for (const [sid, state] of sessionState) {
      if (now.getTime() - state.lastRequest.getTime() > 24 * 60 * 60 * 1000) {
        sessionState.delete(sid);
      }
    }
  });
  
  next();
}
```

1. Wire middleware in server.ts:

```typescript
import { sessionTracker } from './middleware/session-tracker.js';

app.use(sessionTracker);
app.use(express.json({ limit: '5mb' }));
```

1. Test:

```bash
# Test 1: First "no" (allowed)
curl -X POST http://localhost:8000/api/audit \
  -H "x-session-id: user-123" \
  -H "Content-Type: application/json" \
  -d '{"text":"no"}'
# Expected: 200 OK

# Test 2: Second "no no" (allowed)
curl -X POST http://localhost:8000/api/audit \
  -H "x-session-id: user-123" \
  -H "Content-Type: application/json" \
  -d '{"text":"no no"}'
# Expected: 200 OK

# Test 3: Third "no no no" (LOCKED)
curl -X POST http://localhost:8000/api/audit \
  -H "x-session-id: user-123" \
  -H "Content-Type: application/json" \
  -d '{"text":"no no no"}'
# Expected: 429 with squealReport
```

---

### Task 2.2: Implement Squeal Protocol (Report Generation)

**Objective**: On structural deception or user exhaustion, generate audit report file.

**Acceptance Criteria**:
- [ ] Squeal Reports written to `data/squeal-reports/`
- [ ] Report includes entropy, patterns, legal reasoning
- [ ] Filename: `squeal-{timestamp}-{sessionId}.json`
- [ ] Metrics `metrics.squeals++` incremented

**Implementation**:

```bash
# File: src/services/squeal-protocol.ts
export async function squeālProtocol(
  input: string,
  patterns: DeceptionMatch[],
  entropy: EntropyAnalysis,
  sessionId: string
): Promise<void> {
  const timestamp = new Date().toISOString();
  const filename = `data/squeal-reports/squeal-${timestamp.replace(/[:.]/g, '-')}-${sessionId}.json`;
  
  const squealReport = {
    timestamp,
    sessionId,
    trigger: patterns.length > 0 ? 'DECEPTION_DETECTED' : 'USER_EXHAUSTION',
    inputText: input,
    entropy,
    detectedPatterns: patterns,
    forensicReasoning: generateReasoning(entropy, patterns),
    recommendation: patterns.some(p => p.severity === 'CRITICAL')
      ? 'ESCALATE_TO_LEGAL'
      : 'MONITOR_CLOSELY',
  };
  
  // Write to file
  await writeFile(filename, JSON.stringify(squealReport, null, 2), 'utf-8');
  
  // Log to metrics
  metrics.squeals++;
  
  logger.warn({ squealReport }, 'SQUEAL_PROTOCOL_TRIGGERED');
}
```

---

## PHASE 3: Compliance & Final Testing (2026-03-22 to 2026-03-28)

### Task 3.1: Implement ACL Section 56 Demand Generator

**Objective**: When `structuralDeceptionFlag = true`, generate legal demand document.

**Template**: [data/acl-section-56-template.md](data/acl-section-56-template.md)

**Implementation**:

```bash
# File: src/services/acl-demand-generator.ts
export function generateACLDemand(
  invoiceSpec: string,
  hardwareId: string,
  deceptionProof: DeceptionReport
): string {
  return `
# FORMAL LEGAL DEMAND — Australian Consumer Law Section 56

**Date Issued**: ${new Date().toISOString().split('T')[0]}

## Parties
- **Consumer**: [User Name]
- **Supplier**: [Seller]

## Material Breach

The product supplied does not match the description provided:

| Item | Invoice | Actual | Discrepancy |
|------|---------|--------|-------------|
| Model | ${invoiceSpec} | ${hardwareId} | Major version mismatch |

## Forensic Evidence

**Entropy Analysis**: ${deceptionProof.entropy.normalizedEntropy.toFixed(3)} (${deceptionProof.entropy.anomalyFlag ? 'ANOMALY' : 'NORMAL'})

**Deceptive Patterns Detected**:
${deceptionProof.detectedPatterns.map(p => `- ${p.patternName} (severity: ${p.severity}, confidence: ${(p.confidence * 100).toFixed(1)}%)`).join('\n')}

**Deception Probability**: ${(deceptionProof.deceptionProbability * 100).toFixed(1)}%

## Demand

1. Full refund within 14 days
2. OR replacement with correct specification
3. OR cost of correction (DSP retuning, WiiM integration)

Failure to comply within 14 days will result in escalation to ACCC and legal proceedings.

---
**Generated by**: Sovereign Node 9010 (Forensic Audit System)
**Evidence Package**: [UUID]
`;
}
```

---

### Task 3.2: E2E Integration Test Suite

**Objective**: Full scenario test from user input → deception detection → Squeal → ACL demand.

**Test Plan**:

```typescript

describe('E2E: Deception Detection → Squeal → ACL Demand', () => {
  it('should detect invoice spec mismatch and generate ACL demand', async () => {
    // Step 1: Submit audit request with deceptive claim
    const res = await fetch('http://localhost:8000/api/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Based on my analysis, the "W" clearly refers to white color, not the hardware generation.'
      })
    });
    const report = await res.json();
    
    // Step 2: Verify deception detected
    expect(report.deceptionProbability).toBeGreaterThan(0.75);
    expect(report.structuralDeceptionFlag).toBe(true);
    expect(report.detectedPatterns.some(p => p.patternId === 'DD-003')).toBe(true);
    
    // Step 3: Verify Squeal Report generated
    const squealFile = fs.readdirSync('data/squeal-reports/').pop();
    expect(squealFile).toBeDefined();
    
    // Step 4: Verify ACL demand generated
    const aclDemand = generateACLDemand('C 10 MKII W', 'Addon C10 MkII', report);
    expect(aclDemand).toContain('FORMAL LEGAL DEMAND');
    expect(aclDemand).toContain('Section 56');
  });
});
```

---

## Success Criteria Checklist

### Phase 1 (2026-03-14)

- [ ] Facts Registry working (POST /api/facts)
- [ ] /api/audit endpoint returns DeceptionReport
- [ ] Confidence scores calculated & tested
- [ ] Docker builds & deploys to staging
- [ ] npm run test passes 100%
- [ ] npm run lint passes 0 errors

### Phase 2 (2026-03-21)

- [ ] User exhaustion middleware locks after 3 repetitions
- [ ] Squeal Reports written to disk
- [ ] Metrics incremented correctly
- [ ] Integration tests passing

### Phase 3 (2026-03-28)

- [ ] ACL Section 56 demands generated
- [ ] Full E2E scenario passing
- [ ] No 5xx errors in staging
- [ ] Ready for production deployment

---

## Deployment Commands

### Build

```bash
npm run build
docker build -t beendaer/groknett-valueforge:latest .
```

### Test Locally

```bash
npm run test
npm run test:coverage
npm run lint:fix
```

### Deploy to Azure

```bash
bash deploy-azure.sh
# Or use GitHub Actions for deployment:
git push origin main
# This triggers the workflow that builds and deploys to Azure Container Apps
# To manually deploy using Azure CLI:
az containerapp update \
  --name cagroknettvalueforgaoxk4iafo3kuo \
  --resource-group groknett-deploy \
  --image acrgroknettvaaoxk4iafo3kuo.azurecr.io/groknett-valueforge:latest
```

---

**OWNER**: [Project Manager approval required]
  
**NEXT REVIEW**: 2026-03-14 (Phase 1 completion)
