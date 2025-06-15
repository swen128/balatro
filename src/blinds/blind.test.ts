import { describe, it, expect } from 'bun:test';
import { createBlind, getBlindScoreGoal } from '../blinds';

describe('blind', () => {
  describe('createBlind', () => {
    it('should create small blind correctly', () => {
      const blind = createBlind('small');
      expect(blind.type).toBe('small');
      expect(blind.name).toBe('Small Blind');
      expect(blind.scoreMultiplier).toBe(1);
      expect(blind.cashReward).toBe(3);
    });

    it('should create big blind correctly', () => {
      const blind = createBlind('big');
      expect(blind.type).toBe('big');
      expect(blind.name).toBe('Big Blind');
      expect(blind.scoreMultiplier).toBe(1.5);
      expect(blind.cashReward).toBe(4);
    });

    it('should create boss blind with random effect', () => {
      const blind = createBlind('boss');
      expect(blind.type).toBe('boss');
      expect(['The Window', 'The Hook', 'The Ox', 'The Wall', 'The Needle', 'The Goad']).toContain(blind.name);
      expect(blind.scoreMultiplier).toBe(2);
      expect(blind.cashReward).toBe(5);
      
      if (blind.type === 'boss') {
        expect(blind.effects).toBeDefined();
        expect(Array.isArray(blind.effects)).toBe(true);
        expect(blind.effects.length).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('getBlindScoreGoal', () => {
    const smallBlind = createBlind('small');
    const bigBlind = createBlind('big');
    const bossBlind = createBlind('boss');

    it('should calculate correct score goals for ante 1', () => {
      expect(getBlindScoreGoal(1, smallBlind)).toBe(100);
      expect(getBlindScoreGoal(1, bigBlind)).toBe(150);
      expect(getBlindScoreGoal(1, bossBlind)).toBe(200);
    });

    it('should calculate correct score goals for ante 2', () => {
      expect(getBlindScoreGoal(2, smallBlind)).toBe(300);
      expect(getBlindScoreGoal(2, bigBlind)).toBe(450);
      expect(getBlindScoreGoal(2, bossBlind)).toBe(600);
    });

    it('should calculate correct score goals for ante 3', () => {
      expect(getBlindScoreGoal(3, smallBlind)).toBe(800);
      expect(getBlindScoreGoal(3, bigBlind)).toBe(1200);
      expect(getBlindScoreGoal(3, bossBlind)).toBe(1600);
    });

    it('should calculate correct score goals for ante 4', () => {
      expect(getBlindScoreGoal(4, smallBlind)).toBe(2000);
      expect(getBlindScoreGoal(4, bigBlind)).toBe(3000);
      expect(getBlindScoreGoal(4, bossBlind)).toBe(4000);
    });

    it('should scale correctly for higher antes', () => {
      // Ante 5 is 5000 base
      expect(getBlindScoreGoal(5, smallBlind)).toBe(5000);
      expect(getBlindScoreGoal(5, bigBlind)).toBe(7500);
      expect(getBlindScoreGoal(5, bossBlind)).toBe(10000);
    });
  });
});