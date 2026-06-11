import { describe, it, expect } from 'vitest';
import { jaccardSimilarity, calculatePatternConfidence } from '../src/utils/similarity.js';

// ============================================================================
// Jaccard Similarity Test Suite
// Comprehensive coverage of edge cases and typical scenarios
// ============================================================================

describe('Jaccard Similarity Calculation', () => {
  it('should return 1.0 for identical sets', () => {
    const setA = ['apple', 'banana', 'cherry'];
    const setB = ['apple', 'banana', 'cherry'];
    expect(jaccardSimilarity(setA, setB)).toBe(1.0);
  });

  it('should return 0.0 for completely disjoint sets', () => {
    const setA = ['apple', 'banana'];
    const setB = ['orange', 'grape'];
    expect(jaccardSimilarity(setA, setB)).toBe(0.0);
  });

  it('should return 1.0 for two empty sets', () => {
    expect(jaccardSimilarity([], [])).toBe(1.0);
  });

  it('should return 0.0 when one set is empty', () => {
    expect(jaccardSimilarity(['apple'], [])).toBe(0.0);
    expect(jaccardSimilarity([], ['apple'])).toBe(0.0);
  });

  it('should calculate correct Jaccard index for partial overlap', () => {
    const setA = ['a', 'b', 'c'];
    const setB = ['b', 'c', 'd'];
    // Intersection: {b, c} = 2
    // Union: {a, b, c, d} = 4
    // Jaccard: 2/4 = 0.5
    expect(jaccardSimilarity(setA, setB)).toBe(0.5);
  });

  it('should handle case-insensitive matching', () => {
    const setA = ['Apple', 'BANANA'];
    const setB = ['apple', 'banana'];
    expect(jaccardSimilarity(setA, setB)).toBe(1.0);
  });

  it('should trim whitespace from elements', () => {
    const setA = [' apple ', 'banana'];
    const setB = ['apple', ' banana '];
    expect(jaccardSimilarity(setA, setB)).toBe(1.0);
  });

  it('should handle duplicate elements in sets', () => {
    const setA = ['apple', 'apple', 'banana'];
    const setB = ['apple', 'banana', 'banana'];
    // Sets deduplicate: {apple, banana} vs {apple, banana}
    expect(jaccardSimilarity(setA, setB)).toBe(1.0);
  });

  it('should calculate correct index for single element overlap', () => {
    const setA = ['a', 'b', 'c', 'd'];
    const setB = ['d', 'e', 'f', 'g'];
    // Intersection: {d} = 1
    // Union: {a, b, c, d, e, f, g} = 7
    // Jaccard: 1/7 ≈ 0.142857
    const result = jaccardSimilarity(setA, setB);
    expect(result).toBeCloseTo(0.142857, 5);
  });

  it('should be symmetric: J(A, B) = J(B, A)', () => {
    const setA = ['x', 'y', 'z'];
    const setB = ['y', 'z', 'w'];
    expect(jaccardSimilarity(setA, setB)).toBe(jaccardSimilarity(setB, setA));
  });

  it('should handle single-element sets with match', () => {
    const setA = ['apple'];
    const setB = ['apple'];
    expect(jaccardSimilarity(setA, setB)).toBe(1.0);
  });

  it('should handle single-element sets with no match', () => {
    const setA = ['apple'];
    const setB = ['banana'];
    expect(jaccardSimilarity(setA, setB)).toBe(0.0);
  });

  it('should calculate correct index for subset relationship', () => {
    const setA = ['a', 'b'];
    const setB = ['a', 'b', 'c', 'd'];
    // Intersection: {a, b} = 2
    // Union: {a, b, c, d} = 4
    // Jaccard: 2/4 = 0.5
    expect(jaccardSimilarity(setA, setB)).toBe(0.5);
  });

  it('should return deterministic results for same inputs', () => {
    const setA = ['alpha', 'beta', 'gamma'];
    const setB = ['beta', 'gamma', 'delta'];
    const result1 = jaccardSimilarity(setA, setB);
    const result2 = jaccardSimilarity(setA, setB);
    expect(result1).toBe(result2);
  });

  it('should handle large sets efficiently', () => {
    const setA = Array.from({ length: 100 }, (_, i) => `item_${i}`);
    const setB = Array.from({ length: 100 }, (_, i) => `item_${i + 50}`);
    // Intersection: 50 items (50-99)
    // Union: 150 items (0-149)
    // Jaccard: 50/150 ≈ 0.333333
    const result = jaccardSimilarity(setA, setB);
    expect(result).toBeCloseTo(0.333333, 5);
  });

  it('should handle special characters in strings', () => {
    const setA = ['hello@world', 'foo#bar', 'test$value'];
    const setB = ['hello@world', 'test$value'];
    // Intersection: 2
    // Union: 3
    // Jaccard: 2/3 ≈ 0.666667
    const result = jaccardSimilarity(setA, setB);
    expect(result).toBeCloseTo(0.666667, 5);
  });

  it('should handle numeric strings correctly', () => {
    const setA = ['123', '456', '789'];
    const setB = ['456', '789', '012'];
    // Intersection: {456, 789} = 2
    // Union: {123, 456, 789, 012} = 4
    // Jaccard: 2/4 = 0.5
    expect(jaccardSimilarity(setA, setB)).toBe(0.5);
  });
});

describe('Pattern Confidence Calculation', () => {
  it('should return base Jaccard score without prioritization', () => {
    const pattern = ['indicator1', 'indicator2', 'indicator3'];
    const matched = ['indicator1', 'indicator2'];
    // Jaccard: 2/3 ≈ 0.666667
    const confidence = calculatePatternConfidence(pattern, matched, false);
    expect(confidence).toBeCloseTo(0.666667, 5);
  });

  it('should apply 15% boost for prioritized patterns', () => {
    const pattern = ['indicator1', 'indicator2', 'indicator3'];
    const matched = ['indicator1', 'indicator2'];
    // Base Jaccard: 2/3 ≈ 0.666667
    // With 15% boost: 0.666667 * 1.15 ≈ 0.766667
    const confidence = calculatePatternConfidence(pattern, matched, true);
    expect(confidence).toBeCloseTo(0.766667, 5);
  });

  it('should cap prioritized confidence at 1.0', () => {
    const pattern = ['indicator1', 'indicator2'];
    const matched = ['indicator1', 'indicator2'];
    // Base Jaccard: 1.0
    // With 15% boost: 1.0 * 1.15 = 1.15, capped at 1.0
    const confidence = calculatePatternConfidence(pattern, matched, true);
    expect(confidence).toBe(1.0);
  });

  it('should return 0.0 for no matched indicators', () => {
    const pattern = ['indicator1', 'indicator2', 'indicator3'];
    const matched: string[] = [];
    const confidence = calculatePatternConfidence(pattern, matched, false);
    expect(confidence).toBe(0.0);
  });

  it('should handle single indicator match', () => {
    const pattern = ['indicator1', 'indicator2', 'indicator3', 'indicator4'];
    const matched = ['indicator2'];
    // Jaccard: 1/4 = 0.25
    const confidence = calculatePatternConfidence(pattern, matched, false);
    expect(confidence).toBe(0.25);
  });

  it('should be deterministic for same inputs', () => {
    const pattern = ['a', 'b', 'c'];
    const matched = ['a', 'c'];
    const conf1 = calculatePatternConfidence(pattern, matched, false);
    const conf2 = calculatePatternConfidence(pattern, matched, false);
    expect(conf1).toBe(conf2);
  });

  it('should apply case-insensitive matching in confidence calculation', () => {
    const pattern = ['ALERT', 'WARNING', 'ERROR'];
    const matched = ['alert', 'warning'];
    // Should match despite case difference
    const confidence = calculatePatternConfidence(pattern, matched, false);
    expect(confidence).toBeCloseTo(0.666667, 5);
  });
});
