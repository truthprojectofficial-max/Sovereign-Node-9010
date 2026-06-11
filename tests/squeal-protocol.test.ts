import { describe, it, expect, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  writeSquealReport,
  listSquealReports,
  readSquealReport,
} from '../src/services/squeal-protocol';
import type { DeceptionReport } from '../src/types';

const SQUEAL_DIR = path.join(process.cwd(), 'data', 'squeal-reports');

// Minimal valid DeceptionReport matching the real type in types.ts
function makeReport(overrides: Partial<DeceptionReport> = {}): DeceptionReport {
  return {
    inputText: 'trust me mate this is totally legit',
    detectedPatterns: [
      {
        patternId: 'DD-001',
        patternName: 'Vague Quantifier',
        confidence: 0.85,
        matchedIndicators: ['totally legit'],
        severity: 'HIGH' as const,
      },
    ],
    entropy: {
      shannonEntropy: 3.2,
      normalizedEntropy: 0.65,
      characterDistribution: {},
      anomalyFlag: true,
    },
    deceptionProbability: 0.72,
    structuralDeceptionFlag: true,
    forensicReasoning: ['High entropy indicates obfuscation'],
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

describe('Squeal Protocol — Disk Writer', () => {
  const createdFiles: string[] = [];

  afterEach(() => {
    for (const f of createdFiles) {
      try {
        fs.unlinkSync(f);
      } catch {
        /* ignore */
      }
    }
    createdFiles.length = 0;
  });

  it('should write a squeal report to disk', () => {
    const filename = writeSquealReport(makeReport(), 'sess-abc', 'DECEPTION_DETECTED');
    expect(filename).toMatch(/^squeal-.*-sess-abc\.json$/);
    const fullPath = path.join(SQUEAL_DIR, filename);
    createdFiles.push(fullPath);
    expect(fs.existsSync(fullPath)).toBe(true);
  });

  it('should store report data faithfully', () => {
    const report = makeReport({ inputText: 'faithfulness test' });
    const filename = writeSquealReport(report, 'sess-xyz', 'USER_EXHAUSTION');
    const fullPath = path.join(SQUEAL_DIR, filename);
    createdFiles.push(fullPath);

    const read = readSquealReport(filename);
    expect(read).not.toBeNull();
    expect(read!.inputText).toBe('faithfulness test');
    expect(read!.trigger).toBe('USER_EXHAUSTION');
    expect(read!.sessionId).toBe('sess-xyz');
  });

  it('should list squeal reports', () => {
    const f1 = writeSquealReport(makeReport(), 'list-1', 'DECEPTION_DETECTED');
    const f2 = writeSquealReport(makeReport(), 'list-2', 'USER_EXHAUSTION');
    createdFiles.push(path.join(SQUEAL_DIR, f1));
    createdFiles.push(path.join(SQUEAL_DIR, f2));

    const list = listSquealReports();
    expect(list.length).toBeGreaterThanOrEqual(2);
    expect(list).toContain(f1);
    expect(list).toContain(f2);
  });

  it('should return null for non-existent report', () => {
    const read = readSquealReport('does-not-exist.json');
    expect(read).toBeNull();
  });

  it('should sanitise session ID in filename', () => {
    const filename = writeSquealReport(makeReport(), '../evil/path', 'DECEPTION_DETECTED');
    const fullPath = path.join(SQUEAL_DIR, filename);
    createdFiles.push(fullPath);
    expect(filename).not.toContain('/');
    expect(filename).not.toContain('..');
  });
});
