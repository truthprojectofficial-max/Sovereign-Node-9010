import { describe, it, expect } from 'vitest';
import {
  auditText,
  shannonEntropy,
  detectPatternsWithConfidence,
  triggerSquealProtocol,
  getSquealLog,
} from '../src/services/audit-service';

// ============================================================================
// Shannon Entropy
// ============================================================================

describe('shannonEntropy', () => {
  it('should return low entropy for repetitive text', () => {
    const result = shannonEntropy('aaaaaaaaaaaa');
    expect(result.shannonEntropy).toBeLessThan(1);
    expect(result.anomalyFlag).toBe(false);
  });

  it('should return higher entropy for diverse text', () => {
    const result = shannonEntropy('The quick brown fox jumps over the lazy dog');
    expect(result.shannonEntropy).toBeGreaterThan(3.0);
  });

  it('should flag anomaly when entropy > 4.5', () => {
    // Generate highly diverse character string
    const chars = Array.from({ length: 200 }, (_, i) => String.fromCharCode(33 + (i % 94))).join(
      '',
    );
    const result = shannonEntropy(chars);
    expect(result.anomalyFlag).toBe(true);
  });

  it('should include character distribution', () => {
    const result = shannonEntropy('hello');
    expect(result.characterDistribution).toBeDefined();
    expect(result.characterDistribution['l']).toBe(2);
  });
});

// ============================================================================
// Pattern Detection with Confidence
// ============================================================================

describe('detectPatternsWithConfidence', () => {
  it('should detect Safety Hedging pattern', () => {
    const result = detectPatternsWithConfidence('I should note that this is important');
    const match = result.find((m) => m.patternId === 'DD-001');
    expect(match).toBeDefined();
    expect(match!.confidence).toBeGreaterThan(0);
    expect(match!.matchedIndicators).toContain('I should note');
  });

  it('should detect CRITICAL Facade of Competence', () => {
    const result = detectPatternsWithConfidence(
      'Based on my analysis, the data clearly shows improvement',
    );
    const match = result.find((m) => m.patternId === 'DD-003');
    expect(match).toBeDefined();
    expect(match!.severity).toBe('CRITICAL');
  });

  it('should return empty array for clean text', () => {
    const result = detectPatternsWithConfidence('The device model is C10 MKII');
    expect(result.length).toBe(0);
  });

  it('should detect multiple patterns in deceptive text', () => {
    const deceptiveText =
      "Based on my analysis, I should note that I'm certain this is correct. " +
      'Hope this helps! Let me know if you have questions.';
    const result = detectPatternsWithConfidence(deceptiveText);
    expect(result.length).toBe(4);
  });

  it('should sort results by confidence descending', () => {
    const result = detectPatternsWithConfidence(
      'Based on my analysis, I should note this. Hope this helps!',
    );
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].confidence).toBeGreaterThanOrEqual(result[i].confidence);
    }
  });
});

// ============================================================================
// Squeal Protocol
// ============================================================================

describe('triggerSquealProtocol', () => {
  it('should create a squeal record with critical patterns', () => {
    const record = triggerSquealProtocol('test input', 0.85, [
      {
        patternId: 'DD-003',
        patternName: 'Facade of Competence',
        confidence: 0.9,
        matchedIndicators: ['based on my analysis'],
        severity: 'CRITICAL',
      },
    ]);

    expect(record.triggeredAt).toBeDefined();
    expect(record.deceptionProbability).toBe(0.85);
    expect(record.criticalPatterns.length).toBe(1);
    expect(record.forensicSummary).toContain('Squeal Protocol triggered');
  });

  it('should accumulate entries in the squeal log', () => {
    const before = getSquealLog().length;
    triggerSquealProtocol('another input', 0.9, []);
    expect(getSquealLog().length).toBe(before + 1);
  });
});

// ============================================================================
// Core auditText Function
// ============================================================================

describe('auditText', () => {
  it('should return a full DeceptionReport for clean text', () => {
    const report = auditText('The device model is C10 MKII.');
    expect(report.inputText).toBe('The device model is C10 MKII.');
    expect(report.entropy).toBeDefined();
    expect(report.detectedPatterns).toEqual([]);
    expect(report.deceptionProbability).toBe(0);
    expect(report.structuralDeceptionFlag).toBe(false);
    expect(report.forensicReasoning).toEqual([]);
    expect(report.timestamp).toBeDefined();
  });

  it('should return deceptionProbability 0 for a neutral statement', () => {
    const report = auditText('The invoice shows model C10 MKII W with serial number 1234.');
    expect(report.deceptionProbability).toBe(0);
  });

  it('should flag structural deception for CRITICAL patterns', () => {
    const report = auditText(
      'Based on my analysis, the data clearly shows that the W clearly refers to white color, not the hardware generation.',
    );
    expect(report.structuralDeceptionFlag).toBe(true);
    expect(report.detectedPatterns.some((p) => p.severity === 'CRITICAL')).toBe(true);
  });

  it('should produce high deception probability for heavily deceptive text', () => {
    const text =
      "Based on my analysis, I should note that I'm certain about this. " +
      'The data clearly shows it. I apologize for the confusion earlier. ' +
      'Hope this helps! Let me know if you have questions. ' +
      'In my professional opinion, the consensus is clear. ' +
      'Studies show and research confirms these published findings.';
    const report = auditText(text);
    // Confidence = pattern.threshold per v1 spec (not Jaccard)
    // Updated: DD-031 + DD-034 now also match this text (9 patterns total, 36 ontology)
    expect(report.deceptionProbability).toBeCloseTo(0.5619999999999999, 10);
    expect(report.structuralDeceptionFlag).toBe(true);
    expect(report.detectedPatterns.length).toBe(9);
    expect(report.forensicReasoning.length).toBe(9);
  });

  it('should include context in analysis when provided', () => {
    const report = auditText('Simple statement', 'Based on my analysis this is confirmed');
    // Context contains a CRITICAL indicator
    expect(report.detectedPatterns.length).toBeGreaterThan(0);
  });

  it('should truncate inputText to 500 chars', () => {
    const longText = 'a'.repeat(1000);
    const report = auditText(longText);
    expect(report.inputText.length).toBe(500);
  });

  it('should include ISO timestamp', () => {
    const report = auditText('test');
    expect(report.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
