import { describe, it, expect } from 'vitest';

// Forensic Detection Test Suite — Shannon Entropy & Pattern Detection

describe('Shannon Entropy Calculation', () => {
  function shannonEntropy(text: string): {
    shannonEntropy: number;
    normalizedEntropy: number;
    anomalyFlag: boolean;
  } {
    const charCount: Record<string, number> = {};
    const clean = text.toLowerCase().replace(/\s+/g, ' ');
    for (const ch of clean) {
      charCount[ch] = (charCount[ch] || 0) + 1;
    }
    const len = clean.length;
    let entropy = 0;
    for (const ch in charCount) {
      const p = charCount[ch] / len;
      if (p > 0) entropy -= p * Math.log2(p);
    }
    const maxEntropy = Math.log2(Object.keys(charCount).length || 1);
    const normalized = maxEntropy > 0 ? entropy / maxEntropy : 0;
    return {
      shannonEntropy: entropy,
      normalizedEntropy: normalized,
      anomalyFlag: entropy > 4.5,
    };
  }

  it('should calculate entropy for simple text', () => {
    const result = shannonEntropy('hello world');
    expect(result.shannonEntropy).toBeGreaterThan(0);
    expect(result.normalizedEntropy).toBeGreaterThanOrEqual(0);
    expect(result.normalizedEntropy).toBeLessThanOrEqual(1);
  });

  it('should detect anomaly for high entropy (> 4.5)', () => {
    // Generate high-entropy text
    const randomText = 'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    const result = shannonEntropy(randomText);
    expect(result.anomalyFlag).toBe(true);
  });

  it('should not flag normal prose as anomaly', () => {
    const normalText = 'This is a normal sentence with regular structure and words.';
    const result = shannonEntropy(normalText);
    expect(result.anomalyFlag).toBe(false);
  });

  it('should be deterministic', () => {
    const text = 'deterministic test string';
    const result1 = shannonEntropy(text);
    const result2 = shannonEntropy(text);
    expect(result1.shannonEntropy).toBe(result2.shannonEntropy);
  });
});

describe('Fact Authenticity Classification', () => {
  function classifyFactAuthenticity(entropy: number): string {
    if (entropy < 2.5) return 'REPETITIVE';
    if (entropy >= 3.8 && entropy <= 4.3) return 'STRUCTURED_PROSE';
    if (entropy > 4.5) return 'ANOMALY';
    return 'NARROW_VOCABULARY';
  }

  it('should classify low entropy as REPETITIVE', () => {
    expect(classifyFactAuthenticity(2.0)).toBe('REPETITIVE');
  });

  it('should classify mid-range as STRUCTURED_PROSE', () => {
    expect(classifyFactAuthenticity(4.0)).toBe('STRUCTURED_PROSE');
  });

  it('should classify high entropy as ANOMALY', () => {
    expect(classifyFactAuthenticity(4.6)).toBe('ANOMALY');
  });

  it('should classify edge cases as NARROW_VOCABULARY', () => {
    expect(classifyFactAuthenticity(3.0)).toBe('NARROW_VOCABULARY');
  });

  it('should have no overlapping bands', () => {
    // Test boundary conditions
    expect(classifyFactAuthenticity(2.4)).toBe('REPETITIVE');
    expect(classifyFactAuthenticity(2.5)).toBe('NARROW_VOCABULARY');
    expect(classifyFactAuthenticity(3.79)).toBe('NARROW_VOCABULARY');
    expect(classifyFactAuthenticity(3.8)).toBe('STRUCTURED_PROSE');
    expect(classifyFactAuthenticity(4.3)).toBe('STRUCTURED_PROSE');
    expect(classifyFactAuthenticity(4.31)).toBe('NARROW_VOCABULARY');
    expect(classifyFactAuthenticity(4.5)).toBe('NARROW_VOCABULARY');
    expect(classifyFactAuthenticity(4.51)).toBe('ANOMALY');
  });
});

describe('Deception Pattern Detection', () => {
  interface OntologyPattern {
    id: string;
    name: string;
    indicators: string[];
    severity: string;
  }

  const mockOntology: OntologyPattern[] = [
    {
      id: 'DD-001',
      name: 'Safety Hedging',
      indicators: ['I should note', 'please be aware'],
      severity: 'MEDIUM',
    },
    {
      id: 'DD-003',
      name: 'Facade of Competence',
      indicators: ['based on my analysis', 'the data clearly shows'],
      severity: 'CRITICAL',
    },
  ];

  function detectPatterns(text: string, ontology: OntologyPattern[]) {
    const lower = text.toLowerCase();
    const matches: { patternId: string; patternName: string; matchedIndicators: string[] }[] =
      [];

    for (const pattern of ontology) {
      const matchedIndicators: string[] = [];
      for (const indicator of pattern.indicators) {
        if (lower.includes(indicator.toLowerCase())) {
          matchedIndicators.push(indicator);
        }
      }
      if (matchedIndicators.length > 0) {
        matches.push({
          patternId: pattern.id,
          patternName: pattern.name,
          matchedIndicators,
        });
      }
    }
    return matches;
  }

  it('should detect single pattern match', () => {
    const text = 'I should note that this is important';
    const result = detectPatterns(text, mockOntology);
    expect(result.length).toBe(1);
    expect(result[0].patternId).toBe('DD-001');
  });

  it('should detect multiple pattern matches', () => {
    const text = 'I should note that based on my analysis this is clear';
    const result = detectPatterns(text, mockOntology);
    expect(result.length).toBe(2);
  });

  it('should return empty array for clean text', () => {
    const text = 'This is a simple factual statement';
    const result = detectPatterns(text, mockOntology);
    expect(result.length).toBe(0);
  });

  it('should be case-insensitive', () => {
    const text = 'BASED ON MY ANALYSIS';
    const result = detectPatterns(text, mockOntology);
    expect(result.length).toBe(1);
  });
});
