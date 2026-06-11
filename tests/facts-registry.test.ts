import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  initializeDB,
  addFact,
  getFact,
  listFacts,
  verifyFact,
  deleteFact,
  getStats,
  closeDB,
} from '../src/db/facts-registry';

describe('Facts Registry — In-Memory Store', () => {
  beforeEach(() => {
    initializeDB();
  });

  afterEach(() => {
    closeDB();
  });

  describe('addFact', () => {
    it('should create a new fact and return it with ID', () => {
      const result = addFact({
        category: 'Technical',
        statement: 'The device model is C10 MKII',
        source: 'Invoice #INV-001',
      });

      expect(result.id).toBeDefined();
      expect(result.category).toBe('Technical');
      expect(result.statement).toBe('The device model is C10 MKII');
      expect(result.source).toBe('Invoice #INV-001');
      expect(result.verified).toBe(false);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('should reject duplicate statement + source combination', () => {
      addFact({
        category: 'Technical',
        statement: 'Test fact',
        source: 'Source A',
      });

      expect(() => {
        addFact({
          category: 'Technical',
          statement: 'Test fact',
          source: 'Source A',
        });
      }).toThrow('Fact already exists');
    });

    it('should reject invalid category', () => {
      expect(() => {
        addFact({
          category: 'Invalid' as 'Technical',
          statement: 'Test',
          source: 'Source',
        });
      }).toThrow();
    });

    it('should allow same statement with different source', () => {
      const fact1 = addFact({
        category: 'Technical',
        statement: 'Same statement',
        source: 'Source A',
      });

      const fact2 = addFact({
        category: 'Technical',
        statement: 'Same statement',
        source: 'Source B',
      });

      expect(fact1.id).not.toBe(fact2.id);
    });
  });

  describe('getFact', () => {
    it('should retrieve a fact by ID', () => {
      const created = addFact({
        category: 'Governance',
        statement: 'Authority decision',
        source: 'Board Minutes',
      });

      const retrieved = getFact(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.statement).toBe('Authority decision');
    });

    it('should return null for non-existent fact', () => {
      const result = getFact(999);
      expect(result).toBeNull();
    });
  });

  describe('listFacts', () => {
    it('should return empty array when no facts exist', () => {
      const results = listFacts();
      expect(results).toEqual([]);
    });

    it('should return all facts', () => {
      addFact({
        category: 'Technical',
        statement: 'Fact 1',
        source: 'Source 1',
      });
      addFact({
        category: 'Forensic',
        statement: 'Fact 2',
        source: 'Source 2',
      });

      const results = listFacts();
      expect(results).toHaveLength(2);
    });

    it('should filter facts by category', () => {
      addFact({
        category: 'Technical',
        statement: 'Technical fact',
        source: 'Source 1',
      });
      addFact({
        category: 'Forensic',
        statement: 'Forensic fact',
        source: 'Source 2',
      });

      const results = listFacts({ category: 'Technical' });
      expect(results).toHaveLength(1);
      expect(results[0].category).toBe('Technical');
    });

    it('should filter facts by verified status', () => {
      const fact1 = addFact({
        category: 'Technical',
        statement: 'Fact 1',
        source: 'Source 1',
      });
      const fact2 = addFact({
        category: 'Technical',
        statement: 'Fact 2',
        source: 'Source 2',
      });

      verifyFact(fact1.id);

      const verified = listFacts({ verified: true });
      expect(verified).toHaveLength(1);
      expect(verified[0].id).toBe(fact1.id);

      const unverified = listFacts({ verified: false });
      expect(unverified).toHaveLength(1);
      expect(unverified[0].id).toBe(fact2.id);
    });

    it('should return facts in reverse chronological order (newest first)', () => {
      const fact1 = addFact({
        category: 'Technical',
        statement: 'Fact 1',
        source: 'Source 1',
      });
      const fact2 = addFact({
        category: 'Technical',
        statement: 'Fact 2',
        source: 'Source 2',
      });

      const results = listFacts();
      expect(results[0].id).toBe(fact2.id); // Newest first
      expect(results[1].id).toBe(fact1.id); // Oldest second
    });
  });

  describe('verifyFact', () => {
    it('should mark a fact as verified', () => {
      const fact = addFact({
        category: 'Forensic',
        statement: 'Forensic finding',
        source: 'Lab Report',
      });

      expect(fact.verified).toBe(false);

      const verified = verifyFact(fact.id);
      expect(verified.verified).toBe(true);
    });

    it('should throw error for non-existent fact', () => {
      expect(() => {
        verifyFact(999);
      }).toThrow('Fact with ID 999 not found');
    });

    it('should be idempotent (verify twice is safe)', () => {
      const fact = addFact({
        category: 'Technical',
        statement: 'Test',
        source: 'Source',
      });

      verifyFact(fact.id);
      const verified2 = verifyFact(fact.id);

      expect(verified2.verified).toBe(true);
    });
  });

  describe('deleteFact', () => {
    it('should delete a fact', () => {
      const fact = addFact({
        category: 'Technical',
        statement: 'To be deleted',
        source: 'Source',
      });

      const deleted = deleteFact(fact.id);
      expect(deleted).toBe(true);

      const retrieved = getFact(fact.id);
      expect(retrieved).toBeNull();
    });

    it('should return false for non-existent fact', () => {
      const deleted = deleteFact(999);
      expect(deleted).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      const fact1 = addFact({
        category: 'Technical',
        statement: 'Fact 1',
        source: 'Source 1',
      });
      const fact2 = addFact({
        category: 'Governance',
        statement: 'Fact 2',
        source: 'Source 2',
      });
      addFact({
        category: 'Forensic',
        statement: 'Fact 3',
        source: 'Source 3',
      });

      verifyFact(fact1.id);
      verifyFact(fact2.id);

      const stats = getStats();

      expect(stats.total).toBe(3);
      expect(stats.verified).toBe(2);
      expect(stats.byCategory['Technical']).toBe(1);
      expect(stats.byCategory['Governance']).toBe(1);
      expect(stats.byCategory['Forensic']).toBe(1);
    });

    it('should return zero stats for empty database', () => {
      const stats = getStats();

      expect(stats.total).toBe(0);
      expect(stats.verified).toBe(0);
      expect(Object.keys(stats.byCategory)).toHaveLength(0);
    });
  });
});
