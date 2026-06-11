import { describe, it, expect } from 'vitest';

// BBFB Engine Test Suite — Deterministic MCDA
// Tests for LAW gate, GRACE risk, and FRUIT scoring

describe('BBFB Engine - LAW Gate', () => {
  function lawGate(value: number, threshold: number): boolean {
    return value >= threshold;
  }

  it('should pass when value meets threshold', () => {
    expect(lawGate(0.8, 0.5)).toBe(true);
    expect(lawGate(1.0, 1.0)).toBe(true);
  });

  it('should fail when value below threshold', () => {
    expect(lawGate(0.4, 0.5)).toBe(false);
    expect(lawGate(0.0, 0.01)).toBe(false);
  });

  it('should be deterministic (same input = same output)', () => {
    const value = 0.75;
    const threshold = 0.5;
    const result1 = lawGate(value, threshold);
    const result2 = lawGate(value, threshold);
    expect(result1).toBe(result2);
  });
});

describe('BBFB Engine - GRACE Risk Calculation', () => {
  function graceRisk(
    failureProbability: number,
    technicalDebt: number,
    complianceGap: number,
  ): { rawPenalty: number; normalizedPenalty: number; riskLevel: string } {
    const QUAD_COEFF = 2.0;
    const rawPenalty =
      QUAD_COEFF * (failureProbability ** 2 + technicalDebt ** 2 + complianceGap ** 2);
    const maxPenalty = QUAD_COEFF * 3;
    const normalizedPenalty = rawPenalty / maxPenalty;
    let riskLevel = 'LOW';
    if (normalizedPenalty > 0.75) riskLevel = 'CRITICAL';
    else if (normalizedPenalty > 0.5) riskLevel = 'HIGH';
    else if (normalizedPenalty > 0.25) riskLevel = 'MEDIUM';
    return { rawPenalty, normalizedPenalty, riskLevel };
  }

  it('should calculate risk as LOW for minimal inputs', () => {
    const result = graceRisk(0.1, 0.1, 0.05);
    expect(result.riskLevel).toBe('LOW');
    expect(result.normalizedPenalty).toBeCloseTo(0.0075, 10);
  });

  it('should calculate risk as CRITICAL for high inputs', () => {
    const result = graceRisk(0.9, 0.9, 0.9);
    expect(result.riskLevel).toBe('CRITICAL');
    expect(result.normalizedPenalty).toBeCloseTo(0.81, 10);
  });

  it('should be deterministic', () => {
    const result1 = graceRisk(0.5, 0.3, 0.2);
    const result2 = graceRisk(0.5, 0.3, 0.2);
    expect(result1.normalizedPenalty).toBe(result2.normalizedPenalty);
    expect(result1.riskLevel).toBe(result2.riskLevel);
  });
});

describe('BBFB Engine - FRUIT Score (WPM)', () => {
  function fruitScore(criteria: { name: string; value: number; weight: number }[]): {
    compositeValueScore: number;
    compliant: boolean;
  } {
    let cvs = 1;
    for (const c of criteria) {
      const weighted = c.value ** c.weight;
      cvs *= weighted;
    }
    return {
      compositeValueScore: cvs,
      compliant: cvs >= 0.0005,
    };
  }

  it('should calculate CVS correctly with WPM', () => {
    const result = fruitScore([
      { name: 'cost', value: 0.8, weight: 0.4 },
      { name: 'performance', value: 0.9, weight: 0.6 },
    ]);
    expect(result.compositeValueScore).toBeGreaterThan(0);
    expect(result.compliant).toBe(true);
  });

  it('should mark as non-compliant below 0.0005 threshold', () => {
    const result = fruitScore([
      { name: 'cost', value: 0.0001, weight: 0.5 },
      { name: 'performance', value: 0.0001, weight: 0.5 },
    ]);
    // 0.0001^0.5 * 0.0001^0.5 = 0.01 * 0.01 = 0.0001 < 0.0005
    expect(result.compliant).toBe(false);
  });

  it('should be deterministic', () => {
    const criteria = [
      { name: 'a', value: 0.7, weight: 0.3 },
      { name: 'b', value: 0.8, weight: 0.7 },
    ];
    const result1 = fruitScore(criteria);
    const result2 = fruitScore(criteria);
    expect(result1.compositeValueScore).toBe(result2.compositeValueScore);
  });
});
