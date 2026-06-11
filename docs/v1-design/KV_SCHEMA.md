# Vercel KV Schema Documentation

This document defines the key patterns, data structures, and retention policies used in the Vercel KV (Redis) implementation for this project.

## Environment Prefixing

All keys are prefixed to allow multiple environments (preview, development, production) to share the same KV instance without collision.

**Prefix Format:** `{env}:`
- `production:` (when `VERCEL_ENV` or `NODE_ENV` is production)
- `preview:` (for Vercel preview deployments)
- `development:` (for local development)
- `local:` (fallback default)

---

## Data Structures

### 1. Blocks (Content Items)

Used to store content blocks that can be verified or elevated.

| Type | Key Pattern | Value | Retention |
|------|------------|-------|-----------|
| **Object** | `{env}:block:{id}` | JSON Object (Block) | Indefinite (until explicit deletion) |
| **List** | `{env}:blocks:list` | List of `{id}` strings | Max 2,000 items (Trimmed on insert) |

**Block Object Structure:**
```json
{
  "id": "string",           // Unique ID
  "type": "string",         // e.g., "claim", "evidence"
  "content": "string",      // Text content
  "verified": 0 | 1,        // 1 = Verified
  "elevated": 0 | 1,        // 1 = Elevated
  "createdAt": "ISO8601"    // Timestamp
}
```

### 2. Audit Logs

Used to track system actions, user interactions, and security events.

| Type | Key Pattern | Value | Retention |
|------|------------|-------|-----------|
| **Object** | `{env}:audit:{id}` | JSON Object (AuditLog) | Indefinite (until explicit deletion) |
| **List** | `{env}:audit:list` | List of `{id}` strings | Max 5,000 items (Trimmed on insert) |

**AuditLog Object Structure:**
```json
{
  "id": "string",           // Unique ID
  "action": "string",       // e.g., "Init", "Calculate", "Detect"
  "details": "string",      // Description or payload summary
  "tone": "string",         // e.g., "Neutral", "Alarm"
  "intensity": "string",    // e.g., "Low", "High"
  "timestamp": "ISO8601",   // Timestamp
  "context": {              // Optional context for session tracking
    "sessionId": "string",
    "ip": "string"
  }
}
```

### 3. Calculations

Used to store BBFB product value calculations.

| Type | Key Pattern | Value | Retention |
|------|------------|-------|-----------|
| **Object** | `{env}:calc:{id}` | JSON Object (CalculationRecord) | Indefinite (until explicit deletion) |
| **List** | `{env}:calculations:list` | List of `{id}` strings | Max 2,000 items (Trimmed on insert) |

**CalculationRecord Object Structure:**
```json
{
  "id": "string",           // Unique ID
  "product": {              // Product Input
    "name": "string",
    "price": number,
    "features": [...]
  },
  "weights": { ... },       // Weight configuration used
  "result": { ... },        // Calculation output (Score, TCO, etc.)
  "deception": { ... },     // Deception detection results (optional)
  "timestamp": "ISO8601"    // Timestamp
}
```

---

## Implementation Details

- **Atomic Operations:** Not strictly enforced; lists are updated after object storage.
- **Consistency:** Eventual consistency; list pointers are reliable for retrieval.
- **Serialization:** All objects are stored as `JSON.stringify` strings.
- **Validation:** Schema validation occurs at the application layer (`lib/database.ts`).

## Migration & Cleanup

To clear data for a specific environment (e.g., reset development data):

1. **List keys:** `KEYS development:*`
2. **Delete keys:** `DEL key1 key2 ...`

*Note: Vercel KV does not support `FLUSHDB` for a specific prefix, so deletion must be key-based.*
