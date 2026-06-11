import { describe, it, expect, beforeEach } from 'vitest';
import {
  runEvaluationCase,
  runEvaluationSuite,
  runDefaultEvaluationSuite,
  getEvalHistory,
  clearEvalHistory,
  DEFAULT_EVALUATION_CASES,
  DECEPTIVE_THRESHOLD,
} from '../src/services/evaluation-service';

// ============================================================================
// Evaluation Service Test Suite
// ============================================================================

describe('DECEPTIVE_THRESHOLD', () => {
  it('should be a number between 0 and 1', () => {
    expect(DECEPTIVE_THRESHOLD).toBeGreaterThan(0);
    expect(DECEPTIVE_THRESHOLD).toBeLessThan(1);
  });
});

describe('DEFAULT_EVALUATION_CASES', () => {
  it('should contain at least one deceptive case', () => {
    const deceptive = DEFAULT_EVALUATION_CASES.filter((c) => c.expectedDeceptive);
    expect(deceptive.length).toBeGreaterThan(0);
  });

  it('should contain at least one clean case', () => {
    const clean = DEFAULT_EVALUATION_CASES.filter((c) => !c.expectedDeceptive);
    expect(clean.length).toBeGreaterThan(0);
  });

  it('should have unique IDs', () => {
    const ids = DEFAULT_EVALUATION_CASES.map((c) => c.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('each case should have a non-empty input string', () => {
    for (const c of DEFAULT_EVALUATION_CASES) {
      expect(typeof c.input).toBe('string');
      expect(c.input.length).toBeGreaterThan(0);
    }
  });

  it('each case should have an array of tags', () => {
    for (const c of DEFAULT_EVALUATION_CASES) {
      expect(Array.isArray(c.tags)).toBe(true);
    }
  });
});

describe('runEvaluationCase', () => {
  it('should return a result with the correct caseId', () => {
    const evalCase = DEFAULT_EVALUATION_CASES[0];
    const result = runEvaluationCase(evalCase);
    expect(result.caseId).toBe(evalCase.id);
    expect(result.label).toBe(evalCase.label);
  });

  it('should return a deceptionProbability between 0 and 1', () => {
    const result = runEvaluationCase(DEFAULT_EVALUATION_CASES[0]);
    expect(result.deceptionProbability).toBeGreaterThanOrEqual(0);
    expect(result.deceptionProbability).toBeLessThanOrEqual(1);
  });

  it('should flag as falsePositive when predicted deceptive but expected clean', () => {
    const cleanCase = DEFAULT_EVALUATION_CASES.find((c) => !c.expectedDeceptive);
    if (!cleanCase) return; // guard
    const result = runEvaluationCase(cleanCase);
    if (result.predictedDeceptive) {
      expect(result.falsePositive).toBe(true);
      expect(result.falseNegative).toBe(false);
    }
  });

  it('should flag as falseNegative when predicted clean but expected deceptive', () => {
    const deceptiveCase = DEFAULT_EVALUATION_CASES.find((c) => c.expectedDeceptive);
    if (!deceptiveCase) return; // guard
    const result = runEvaluationCase(deceptiveCase);
    if (!result.predictedDeceptive) {
      expect(result.falseNegative).toBe(true);
      expect(result.falsePositive).toBe(false);
    }
  });

  it('should fail a case that does not meet minimum pattern count', () => {
    const strictCase = {
      id: 'TEST-STRICT',
      label: 'Strict min-patterns test',
      input: 'Hello, this is a completely neutral statement.',
      expectedDeceptive: true,
      expectedMinPatterns: 999, // impossible to satisfy
      tags: [],
    };
    const result = runEvaluationCase(strictCase);
    expect(result.passed).toBe(false);
  });

  it('should fail a case that exceeds max deception probability', () => {
    const overloadedCase = {
      id: 'TEST-MAX-PROB',
      label: 'Max probability test',
      input:
        'Based on my analysis I should note that I am fairly certain this ' +
        'clearly shows improvement. Hope this helps!',
      expectedDeceptive: true,
      expectedMinPatterns: 0,
      expectedMaxDeceptionProbability: 0.001, // impossible to satisfy
      tags: [],
    };
    const result = runEvaluationCase(overloadedCase);
    expect(result.passed).toBe(false);
  });

  it('should be deterministic (same input = same result)', () => {
    const c = DEFAULT_EVALUATION_CASES[0];
    const r1 = runEvaluationCase(c);
    const r2 = runEvaluationCase(c);
    expect(r1.deceptionProbability).toBe(r2.deceptionProbability);
    expect(r1.passed).toBe(r2.passed);
  });
});

describe('runEvaluationSuite', () => {
  beforeEach(() => clearEvalHistory());

  it('should return a result with metrics', () => {
    const result = runEvaluationSuite(DEFAULT_EVALUATION_CASES.slice(0, 3));
    expect(result.metrics).toBeDefined();
    expect(result.metrics.totalCases).toBe(3);
  });

  it('should store run in history', () => {
    expect(getEvalHistory().length).toBe(0);
    runEvaluationSuite(DEFAULT_EVALUATION_CASES.slice(0, 2));
    expect(getEvalHistory().length).toBe(1);
  });

  it('should report accuracy between 0 and 1', () => {
    const result = runEvaluationSuite(DEFAULT_EVALUATION_CASES);
    expect(result.metrics.accuracy).toBeGreaterThanOrEqual(0);
    expect(result.metrics.accuracy).toBeLessThanOrEqual(1);
  });

  it('should report precision between 0 and 1', () => {
    const result = runEvaluationSuite(DEFAULT_EVALUATION_CASES);
    expect(result.metrics.precision).toBeGreaterThanOrEqual(0);
    expect(result.metrics.precision).toBeLessThanOrEqual(1);
  });

  it('should report recall between 0 and 1', () => {
    const result = runEvaluationSuite(DEFAULT_EVALUATION_CASES);
    expect(result.metrics.recall).toBeGreaterThanOrEqual(0);
    expect(result.metrics.recall).toBeLessThanOrEqual(1);
  });

  it('should report f1Score between 0 and 1', () => {
    const result = runEvaluationSuite(DEFAULT_EVALUATION_CASES);
    expect(result.metrics.f1Score).toBeGreaterThanOrEqual(0);
    expect(result.metrics.f1Score).toBeLessThanOrEqual(1);
  });

  it('passed + failed should equal totalCases', () => {
    const result = runEvaluationSuite(DEFAULT_EVALUATION_CASES);
    expect(result.metrics.passed + result.metrics.failed).toBe(result.metrics.totalCases);
  });

  it('TP + TN + FP + FN should equal totalCases', () => {
    const result = runEvaluationSuite(DEFAULT_EVALUATION_CASES);
    const { truePositives, trueNegatives, falsePositives, falseNegatives, totalCases } =
      result.metrics;
    expect(truePositives + trueNegatives + falsePositives + falseNegatives).toBe(totalCases);
  });

  it('should include a unique runId', () => {
    const r1 = runEvaluationSuite(DEFAULT_EVALUATION_CASES.slice(0, 1));
    const r2 = runEvaluationSuite(DEFAULT_EVALUATION_CASES.slice(0, 1));
    expect(r1.runId).not.toBe(r2.runId);
  });

  it('should record durationMs >= 0', () => {
    const result = runEvaluationSuite(DEFAULT_EVALUATION_CASES);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });
});

describe('runDefaultEvaluationSuite', () => {
  beforeEach(() => clearEvalHistory());

  it('should run without error and return metrics', () => {
    const result = runDefaultEvaluationSuite();
    expect(result.metrics.totalCases).toBe(DEFAULT_EVALUATION_CASES.length);
    expect(result.suiteName).toContain('Default Suite');
  });

  it('should achieve at least 50% accuracy on the default suite', () => {
    const result = runDefaultEvaluationSuite();
    expect(result.metrics.accuracy).toBeGreaterThanOrEqual(0.5);
  });
});

describe('getEvalHistory', () => {
  beforeEach(() => clearEvalHistory());

  it('should start empty', () => {
    expect(getEvalHistory()).toHaveLength(0);
  });

  it('should accumulate runs in reverse-chronological order (newest first)', () => {
    const r1 = runEvaluationSuite(DEFAULT_EVALUATION_CASES.slice(0, 1), 'Suite A');
    const r2 = runEvaluationSuite(DEFAULT_EVALUATION_CASES.slice(0, 1), 'Suite B');
    const history = getEvalHistory();
    expect(history[0].runId).toBe(r2.runId);
    expect(history[1].runId).toBe(r1.runId);
  });

  it('should return a copy (mutation does not affect internal state)', () => {
    runEvaluationSuite(DEFAULT_EVALUATION_CASES.slice(0, 1));
    const copy = getEvalHistory();
    copy.splice(0, 1);
    expect(getEvalHistory()).toHaveLength(1);
  });
});
