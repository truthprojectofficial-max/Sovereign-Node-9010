import { describe, it, expect } from 'vitest';
import { generateACLDemand } from '../src/services/acl-demand-generator';
import type { DeceptionReport } from '../src/types';

function makeReport(overrides: Partial<DeceptionReport> = {}): DeceptionReport {
  return {
    inputText: 'this product is the best in the world guaranteed',
    detectedPatterns: [
      {
        patternId: 'DD-001',
        patternName: 'Vague Quantifier',
        confidence: 0.85,
        matchedIndicators: ['best in the world'],
        severity: 'HIGH' as const,
      },
      {
        patternId: 'DD-003',
        patternName: 'Unsubstantiated Guarantee',
        confidence: 0.92,
        matchedIndicators: ['guaranteed'],
        severity: 'CRITICAL' as const,
      },
    ],
    entropy: {
      shannonEntropy: 3.5,
      normalizedEntropy: 0.71,
      characterDistribution: {},
      anomalyFlag: true,
    },
    deceptionProbability: 0.82,
    structuralDeceptionFlag: true,
    forensicReasoning: ['Entropy anomaly detected', 'Multiple high-severity patterns'],
    timestamp: '2026-03-07T10:00:00.000Z',
    ...overrides,
  };
}

describe('ACL Demand Generator', () => {
  it('should generate a demand document', () => {
    const demand = generateACLDemand({
      deceptionReport: makeReport(),
      consumerName: 'Test Consumer',
      supplierName: 'Dodgy Corp Pty Ltd',
      invoiceSpec: 'Magic Widget 3000',
      hardwareId: 'HW-001',
    });

    expect(typeof demand).toBe('string');
    expect(demand.length).toBeGreaterThan(100);
  });

  it('should include ACL Section 56 reference', () => {
    const demand = generateACLDemand({
      deceptionReport: makeReport(),
      consumerName: 'A',
      supplierName: 'B',
      invoiceSpec: 'C',
      hardwareId: 'D',
    });

    expect(demand).toContain('Section 56');
    expect(demand).toContain('Australian Consumer Law');
  });

  it('should include both party names', () => {
    const demand = generateACLDemand({
      deceptionReport: makeReport(),
      consumerName: 'Alice Consumer',
      supplierName: 'Bob Corp',
      invoiceSpec: 'Widget',
      hardwareId: 'HW-X',
    });

    expect(demand).toContain('Alice Consumer');
    expect(demand).toContain('Bob Corp');
  });

  it('should include invoice spec and hardware ID', () => {
    const demand = generateACLDemand({
      deceptionReport: makeReport(),
      consumerName: 'A',
      supplierName: 'B',
      invoiceSpec: 'Overpriced Gadget X',
      hardwareId: 'GADGET-42',
    });

    expect(demand).toContain('Overpriced Gadget X');
    expect(demand).toContain('GADGET-42');
  });

  it('should list each deception pattern found', () => {
    const demand = generateACLDemand({
      deceptionReport: makeReport(),
      consumerName: 'A',
      supplierName: 'B',
      invoiceSpec: 'C',
      hardwareId: 'D',
    });

    expect(demand).toContain('DD-001');
    expect(demand).toContain('Vague Quantifier');
    expect(demand).toContain('DD-003');
    expect(demand).toContain('Unsubstantiated Guarantee');
  });

  it('should include forensic evidence (entropy)', () => {
    const demand = generateACLDemand({
      deceptionReport: makeReport(),
      consumerName: 'A',
      supplierName: 'B',
      invoiceSpec: 'C',
      hardwareId: 'D',
    });

    expect(demand).toMatch(/entropy/i);
    expect(demand).toContain('3.500');
  });

  it('should include demand items (refund/replacement/correction)', () => {
    const demand = generateACLDemand({
      deceptionReport: makeReport(),
      consumerName: 'A',
      supplierName: 'B',
      invoiceSpec: 'C',
      hardwareId: 'D',
    });

    const hasRemedy = /refund|replacement|correction|remedy/i.test(demand);
    expect(hasRemedy).toBe(true);
  });

  it('should include overall deception probability', () => {
    const demand = generateACLDemand({
      deceptionReport: makeReport({ deceptionProbability: 0.95 }),
      consumerName: 'A',
      supplierName: 'B',
      invoiceSpec: 'C',
      hardwareId: 'D',
    });

    expect(demand).toContain('95.0%');
  });

  it('should include CRITICAL severity flag', () => {
    const demand = generateACLDemand({
      deceptionReport: makeReport(),
      consumerName: 'A',
      supplierName: 'B',
      invoiceSpec: 'C',
      hardwareId: 'D',
    });

    expect(demand).toContain('CRITICAL');
  });

  it('should handle a report with no patterns gracefully', () => {
    const demand = generateACLDemand({
      deceptionReport: makeReport({
        detectedPatterns: [],
        deceptionProbability: 0.1,
        structuralDeceptionFlag: false,
      }),
      consumerName: 'A',
      supplierName: 'B',
      invoiceSpec: 'C',
      hardwareId: 'D',
    });

    expect(typeof demand).toBe('string');
    expect(demand.length).toBeGreaterThan(50);
  });

  it('should include BBFB economic harm section when bbfbScore provided', () => {
    const demand = generateACLDemand({
      deceptionReport: makeReport(),
      consumerName: 'A',
      supplierName: 'B',
      invoiceSpec: 'C',
      hardwareId: 'D',
      bbfbScore: {
        law: [
          { metric: 'cost', value: 0.005, threshold: 0.01, passed: false },
          { metric: 'performance', value: 0.8, threshold: 0.01, passed: true },
        ],
        grace: { rawPenalty: 1.5, normalizedPenalty: 0.25, riskLevel: 'MEDIUM' },
        fruit: {
          compositeValueScore: 0.0003,
          weightedScores: [{ name: 'cost', weighted: 0.1 }],
          compliant: false,
          threshold: 0.0005,
        },
        overallCompliant: false,
      },
    });

    expect(demand).toContain('BBFB Economic Harm Assessment');
    expect(demand).toContain('LAW Gate');
    expect(demand).toContain('GRACE Risk');
    expect(demand).toContain('FRUIT Score');
    expect(demand).toContain('NON-COMPLIANT');
  });

  it('should omit BBFB section when bbfbScore not provided', () => {
    const demand = generateACLDemand({
      deceptionReport: makeReport(),
      consumerName: 'A',
      supplierName: 'B',
      invoiceSpec: 'C',
      hardwareId: 'D',
    });

    expect(demand).not.toContain('BBFB Economic Harm Assessment');
  });
});
