# Sovereign Node 9010: Validation Checklist

**Purpose**: Verify Phase completion before moving forward | **Owner**: QA Lead  
**Date Format**: YYYY-MM-DD | **Sign-Off**: Required

---

## PHASE 1 VALIDATION (Target: 2026-03-14)

### Sub-task 1.1: Facts Registry (SQLite + CRUD)

**Code Review**:
- [ ] `src/db/schema.sql` exists and includes `facts(id, category, statement, source, verified, created_at)`
- [ ] `src/db/facts-registry.ts` exported functions: `initDB()`, `addFact()`, `listFacts()`, `verifyFact()`
- [ ] All database operations wrapped in try-catch with meaningful error messages
- [ ] Database file path is environment-configurable (vs hardcoded)

**Testing**:

```bash
npm run test
```

- [ ] Test file `tests/facts-registry.test.ts` exists
- [ ] ✔ POST /api/facts stores fact and returns { id, verified: false }
- [ ] ✔ GET /api/facts returns array
- [ ] ✔ GET /api/facts/:id retrieves single fact
- [ ] ✔ PATCH /api/facts/:id/verify updates verified flag
- [ ] ✔ Duplicate (statement, source) pair rejected with UNIQUE constraint
- [ ] ✔ Category enum enforced (Technical | Governance | Forensic)
- [ ] ✔ ISO 8601 timestamp on creation

**Manual Validation**:

```bash
# Run server
npm start

# Create fact
curl -X POST http://localhost:8000/api/facts \
  -H "Content-Type: application/json" \
  -d '{"category":"Forensic","statement":"C 10 MKII W","source":"Invoice-001"}'

# Expected response (copy output):
# ☐ Status: 201 Created
# ☐ Body includes: id, category, statement, source, verified: false, created_at
```

**Linting**:

```bash
npm run lint
```

- [ ] 0 errors, 0 warnings in `src/db/*.ts`

**Sign-Off**: [QA Lead] __________________ Date: __________

---

### Sub-task 1.2: /api/audit Endpoint

**Code Review**:
- [ ] `src/services/audit-service.ts` implements `auditText(input: string): Promise<DeceptionReport>`
- [ ] Endpoint wired in `server.ts` as `POST /api/audit`
- [ ] Request validation: reject if `text` is missing or not string
- [ ] Response includes all DeceptionReport fields: entropy, detectedPatterns, deceptionProbability, structuralDeceptionFlag, forensicReasoning, timestamp

**Testing**:

```bash
npm run test
```

- [ ] ✔ Test file `tests/audit-service.test.ts` exists
- [ ] ✔ Clean statement returns deceptionProbability < 0.5
- [ ] ✔ Deceptive statement returns deceptionProbability > 0.75
- [ ] ✔ structuralDeceptionFlag = true when probability > 0.75
- [ ] ✔ timestamp in ISO 8601 format
- [ ] ✔ forensicReasoning is non-empty array

**Manual Validation**:

```bash
# Test 1: Clean statement
curl -X POST http://localhost:8000/api/audit \
  -H "Content-Type: application/json" \
  -d '{"text":"The device model is C10 MKII."}'

# Expected:
# ☐ Status: 200 OK
# ☐ deceptionProbability < 0.5
# ☐ detectedPatterns: [] or minimal

# Test 2: Deceptive statement
curl -X POST http://localhost:8000/api/audit \
  -H "Content-Type: application/json" \
  -d '{"text":"Based on my analysis, the W clearly refers to white color."}'

# Expected:
# ☐ Status: 202 Accepted (with alert) OR 200 OK
# ☐ deceptionProbability > 0.75
# ☐ structuralDeceptionFlag: true
# ☐ detectedPatterns includes at least 1 (should be DD-003: Facade of Competence)
# ☐ Squeal protocol triggered (logged or file created)
```

**Linting**:

```bash
npm run lint
```

- [ ] 0 errors in `src/services/audit-service.ts`

**Sign-Off**: [QA Lead] __________________ Date: __________

---

### Sub-task 1.3: Confidence Scoring

**Code Review**:
- [ ] `src/utils/similarity.ts` implements `jaccardSimilarity(a: string, b: string): number` (returns 0.0-1.0)
- [ ] `detectPatternsWithConfidence()` returns `DeceptionMatch[]` with `confidence` field
- [ ] Each match confidence is between 0.0 and 0.95 (capped)
- [ ] Patterns sorted by confidence descending

**Testing**:

```bash
npm run test
```

- [ ] ✔ Exact phrase match scores > 0.8
- [ ] ✔ Partial phrase match (different context) scores 0.6-0.8
- [ ] ✔ No match returns confidence 0
- [ ] ✔ Multiple indicators in one pattern: average confidence calculated
- [ ] ✔ False positives < 5% across test set (mock 20+ scenarios)

**Manual Validation**:

```bash
# Test exact match
curl -X POST http://localhost:8000/api/audit \
  -H "Content-Type: application/json" \
  -d '{"text":"I should note that this is important"}'

# Expected:
# ☐ Pattern DD-001 (Safety Hedging) confidence > 0.8

# Test partial match
curl -X POST http://localhost:8000/api/audit \
  -H "Content-Type: application/json" \
  -d '{"text":"You should note this carefully"}'

# Expected:
# ☐ Pattern DD-001 confidence 0.6-0.8 (different context)
```

**Linting**:

```bash
npm run lint
```

- [ ] 0 errors in `src/utils/similarity.ts`

**Sign-Off**: [QA Lead] __________________ Date: __________

---

### Sub-task 1.4: Docker Build & Staging Deploy

**Docker Build**:

```bash
docker build -t groknett-valueforge:phase1 .
```

- [ ] Build succeeds (0 errors)
- [ ] Image size < 500MB
- [ ] Base image is official Node.js LTS

**Docker Run Locally**:

```bash
docker run -p 8000:8000 groknett-valueforge:phase1
```

- [ ] Container starts without error
- [ ] Port 8000 responds

**Smoke Tests**:

```bash
curl http://localhost:8000/health
# ☐ Status: 200 OK or 204 No Content

curl -X POST http://localhost:8000/api/audit \
  -H "Content-Type: application/json" \
  -d '{"text":"Test"}'
# ☐ Status: 200 or 202

curl http://localhost:8000/api/facts
# ☐ Status: 200 OK, returns []
```

**Azure Container Apps Deploy**:

```bash
# Push to registry
docker tag groknett-valueforge:phase1 beendaer/groknett-valueforge:phase1
docker push beendaer/groknett-valueforge:phase1

# Or run deploy script
bash deploy-azure.sh
```

- [ ] Image pushed to beendaer/groknett-valueforge:phase1
- [ ] Azure Container Apps deployment succeeds
- [ ] Health check passes (curl staging endpoint)

**Sign-Off**: [DevOps Lead] __________________ Date: __________

---

## PHASE 2 VALIDATION (Target: 2026-03-21)

### Sub-task 2.1: Session Middleware & User Exhaustion

**Code Review**:
- [ ] `src/middleware/session-tracker.ts` exists and exported
- [ ] Middleware wired in `server.ts` BEFORE `express.json()`
- [ ] Session state uses `Map<sessionId, { attempts, repetitions, locked, lastRequest }>`
- [ ] Repetition regex: `/^(no\s?){3,}/i`

**Testing**:

```bash
npm run test
```

- [ ] ✔ Session created on first request
- [ ] ✔ Repetition count incremented on "no no no"
- [ ] ✔ Lock triggered after 3 repetitions
- [ ] ✔ Locked response returns 429 + Squeal metadata
- [ ] ✔ Old sessions (> 24h) cleaned up

**Manual Validation**:

```bash
# Test 1: First "no" (allowed)
curl -X POST http://localhost:8000/api/audit \
  -H "x-session-id: user-123" \
  -H "Content-Type: application/json" \
  -d '{"text":"no"}'
# ☐ Status: 200

# Test 2 & 3: Two more times with "no no" and "no no no"
curl -X POST http://localhost:8000/api/audit \
  -H "x-session-id: user-123" \
  -H "Content-Type: application/json" \
  -d '{"text":"no no"},{"text":"no no no"}'
# ☐ First: 200
# ☐ Second: 429 with squealReport

# Test 4: Verify lock persists
curl -X POST http://localhost:8000/api/audit \
  -H "x-session-id: user-123" \
  -H "Content-Type: application/json" \
  -d '{"text":"anything"}'
# ☐ Status: 429 (still locked)
```

**Sign-Off**: [QA Lead] __________________ Date: __________

---

### Sub-task 2.2: Squeal Protocol

**Code Review**:
- [ ] `src/services/squeal-protocol.ts` exists
- [ ] `squeālProtocol()` writes to `data/squeal-reports/{timestamp}-{sessionId}.json`
- [ ] Report includes: timestamp, sessionId, trigger, inputText, entropy, detectedPatterns, forensicReasoning, recommendation

**Testing**:

```bash
npm run test
```

- [ ] ✔ Squeal file created on deceptionProbability > 0.75
- [ ] ✔ Squeal file created on user exhaustion
- [ ] ✔ File contains valid JSON
- [ ] ✔ metrics.squeals incremented

**Manual Validation**:

```bash
# Trigger Squeal (deception detected)
curl -X POST http://localhost:8000/api/audit \
  -H "Content-Type: application/json" \
  -d '{"text":"Based on my analysis, the W clearly is white color."}'

# Expected:
# ☐ Response includes alert: "SQUEAL_PROTOCOL_TRIGGERED"
# ☐ File created in data/squeal-reports/
# ☐ File contains: timestamp, detected patterns, forensicReasoning

# Inspect file
cat data/squeal-reports/squeal-*.json | jq .
# ☐ JSON valid
# ☐ trigger: "DECEPTION_DETECTED" or "USER_EXHAUSTION"
# ☐ recommendation: "ESCALATE_TO_LEGAL" or "MONITOR_CLOSELY"
```

**Sign-Off**: [QA Lead] __________________ Date: __________

---

## PHASE 3 VALIDATION (Target: 2026-03-28)

### Sub-task 3.1: ACL Section 56 Demand Generator

**Code Review**:
- [ ] `src/services/acl-demand-generator.ts` exists
- [ ] `generateACLDemand(invoiceSpec, hardwareId, deceptionProof)` returns Markdown string
- [ ] Output includes: invoice vs hardware mismatch, entropy analysis, deceptive patterns, demand for refund/replacement

**Testing**:

```bash
npm run test
```

- [ ] ✔ Demand file generated on deception detection in Forensic category
- [ ] ✔ Demand includes invoice mismatch evidence
- [ ] ✔ Demand includes entropy analysis (normalized, anomaly flag)
- [ ] ✔ Demand lists detected patterns with confidence scores
- [ ] ✔ Demand formatted as legal document (headers, signature block)

**Manual Validation**:

```bash
# Simulate invoice audit with deception
curl -X POST http://localhost:8000/api/audit \
  -H "Content-Type: application/json" \
  -d '{"text":"Based on my analysis, C 10 MKII W white is what you got"}'

# Verify demand generated
cat data/acl-demands/acl-*.md | head -20
# ☐ "FORMAL LEGAL DEMAND"
# ☐ "Australian Consumer Law Section 56"
# ☐ Invoice spec vs actual hardware comparison table
# ☐ "Full refund within 14 days"
```

**Sign-Off**: [Legal Review / QA Lead] __________________ Date: __________

---

### Sub-task 3.2: Full E2E Integration Test

**Scenario**: User claims deceptive spec → System detects → Squeal → ACL demand

```bash
# Run E2E test
npm run test -- --grep "E2E.*Deception.*ACL"
```

- [ ] ✔ Audit endpoint returns deceptionProbability > 0.75
- [ ] ✔ structuralDeceptionFlag = true
- [ ] ✔ Squeal Report written to disk
- [ ] ✔ ACL demand generated and contains evidence
- [ ] ✔ All files timestamped and linked (audit → squeal → demand)

**Staging Validation**:

```bash
# Deploy Phase 3 to staging
bash deploy-azure.sh --environment staging

# Run scenarios against staging
curl -X POST https://groknett-staging.azurecontainerapps.io/api/audit ...
# ☐ All endpoints respond in < 200ms
# ☐ No 5xx errors in logs
# ☐ Metrics show squeal count > 0
```

**Sign-Off**: [QA Lead, Dev Lead, PM] __________________ Date: __________

---

## SIGN-OFF AUTHORITY

| Phase | Authority | Date | Notes |
|-------|-----------|------|-------|
| Phase 1 | QA Lead + PM | ________ | Framework functional, API ready |
| Phase 2 | QA Lead + DevOps | ________ | User protection active |
| Phase 3 | QA Lead + Legal + PM | ________ | Legal automation proven, ready for production |

---

## Production Deployment Checklist

**Only proceed if ALL Phase 3 validations signed off.**

```bash
# Final steps
npm run build
npm run test:coverage     # ☐ 100% coverage maintained
npm run lint:fix          # ☐ 0 errors
docker build -t beendaer/groknett-valueforge:latest .
docker push beendaer/groknett-valueforge:latest

# Deploy to production
az containerapp update --name groknett-valueforge \
  --resource-group groknett-rg \
  --image beendaer/groknett-valueforge:latest

# Smoke test production
curl https://groknett-valueforge.azurecontainerapps.io/health
# ☐ Status: 200

# Monitor for 24 hours
# ☐ No 5xx errors
# ☐ Squeal count tracking correctly
# ☐ Response time < 200ms (p95)
```

**Production Sign-Off**: [PM, Tech Lead] __________________ Date: __________

---

**END OF CHECKLIST**
