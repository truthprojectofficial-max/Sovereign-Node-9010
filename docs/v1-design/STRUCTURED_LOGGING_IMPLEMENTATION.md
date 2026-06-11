# Structured Logging System - Implementation

## ✅ What Was Created

### 1. Structured Logger (`lib/structured-logger.ts`)
**Comprehensive logging system with phase and deception tracking**

#### Features:
- **Phase-Based Logging**: Tracks Trigger → Pivot → Lie sequences
- **Deception Tracking**: Logs all deception detections with probabilities
- **Metadata Rich**: Entropy, text length, context, timestamps
- **Performance Tracking**: Duration measurement for operations
- **Session Management**: Tracks logs per session
- **Multiple Categories**: calculation, deception, interaction, phase, system, audit
- **Log Levels**: info, warning, error, debug

#### Log Structure:
```typescript
interface StructuredLog {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  action: string;
  details: string;
  phase?: DeceptionPhase;           // trigger, pivot, lie, none
  phaseSequence?: DeceptionPhase[]; // Full sequence
  deception?: DeceptionResult;       // Full deception detection
  deceptionDetected: boolean;
  deceptionProbability: number;
  context?: {                        // Request context
    product?: string;
    sessionId?: string;
    endpoint?: string;
    method?: string;
  };
  metadata?: {                      // Additional data
    entropy?: number;
    textLength?: number;
    previousText?: string;
    correctionRequested?: boolean;
  };
  duration?: number;                // Performance (ms)
}
```

### 2. Integration Points

#### `/api/calculate` - Auto-logs calculations
- Logs product, weights, result, deception
- Tracks duration
- Includes full metadata

#### `/api/detect` - Auto-logs interactions
- Logs text, previous text, correction status
- Detects and logs phases
- Tracks deception patterns

#### `/api/logs` - Retrieve structured logs
- Filter by session, category, level, phase
- Returns full structured log entries

### 3. Convenience Functions

```typescript
import { logger } from '../../lib/structured-logger';

// Log calculation
await logger.calculation(action, details, product, result, deception);

// Log interaction (with phase tracking)
await logger.interaction(text, previousText, correctionRequested, endpoint);

// Log phase transition
await logger.phase(phase, messages, details);

// Log system event
await logger.system(level, action, details, metadata);

// Log error
await logger.error(action, error, context);
```

## Phase-Based Logging

### Trigger Phase
- Detected when: User rejection/correction
- Example: "You are wrong about that"
- Logged with: `phase: 'trigger'`

### Pivot Phase
- Detected when: Apology/simulation after trigger
- Example: "I apologize, but it's still correct"
- Logged with: `phase: 'pivot'`

### Lie Phase
- Detected when: New fabrication after pivot
- Example: "Actually, the correct answer is [fake]"
- Logged with: `phase: 'lie'`

### Full Sequence Tracking
- Tracks complete Trigger → Pivot → Lie sequences
- Stored in `phaseSequence` array
- Enables pattern analysis

## Usage Examples

### Automatic Logging
All API endpoints automatically log:
- Calculations → Full metadata + deception flags
- Interactions → Phase detection + deception analysis
- Errors → Full error context

### Manual Logging
```typescript
import { logger } from '../../lib/structured-logger';

// Log custom event
await logger.system('info', 'CustomAction', 'Custom details', {
  customField: 'value'
});

// Log phase transition
await logger.phase('pivot', ['message1', 'message2'], 'Phase transition detected');
```

### Retrieve Logs
```typescript
// Get logs via API
GET /api/logs?sessionId=xxx&category=deception&phase=lie&limit=50

// Or programmatically
const logger = getLogger(sessionId);
const logs = await logger.getSessionLogs(100);
```

## Integration with Existing Systems

- **Database**: Logs saved to audit_logs table
- **Deception Detection**: All detections logged automatically
- **Phase Detection**: Phase sequences tracked and logged
- **Progressive Detector**: Can use logger for interaction tracking

## Benefits

1. **Full Audit Trail**: Every operation logged with context
2. **Phase Tracking**: Trigger → Pivot → Lie sequences captured
3. **Deception Analysis**: All deception patterns logged with probabilities
4. **Performance Monitoring**: Duration tracking for operations
5. **Debugging**: Rich metadata for troubleshooting
6. **Pattern Analysis**: Can analyze deception patterns over time

---

**Status**: ✅ Complete - Comprehensive structured logging with phase tracking
