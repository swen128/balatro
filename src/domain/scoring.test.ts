import { describe, it, expect } from 'bun:test';
import { calculateBaseScore, calculateFinalScore } from './scoring.ts';
import type { ScoringEffect } from './scoring.ts';
import { createCard } from './card.ts';
import { evaluatePokerHand } from './pokerHands.ts';

describe('scoring', () => {
  describe('calculateBaseScore', () => {
    it('should calculate base score for a pair', () => {
      const cards = [
        createCard('♠', 'K'), // 10 chips
        createCard('♥', 'K'), // 10 chips
        createCard('♦', '7'), // 7 chips
        createCard('♣', '5'), // 5 chips
        createCard('♠', '2'), // 2 chips
      ];
      
      const evaluatedHand = evaluatePokerHand(cards);
      const baseScore = calculateBaseScore(evaluatedHand, cards);
      
      // Pair base chips: 10
      // Card chips: 10 + 10 + 7 + 5 + 2 = 34
      // Total base chips: 10 + 34 = 44
      // Pair multiplier: 2
      expect(baseScore.chips).toBe(44);
      expect(baseScore.mult).toBe(2);
    });

    it('should calculate base score for a flush', () => {
      const cards = [
        createCard('♦', 'K'), // 10 chips
        createCard('♦', '10'), // 10 chips
        createCard('♦', '7'), // 7 chips
        createCard('♦', '4'), // 4 chips
        createCard('♦', '2'), // 2 chips
      ];
      
      const evaluatedHand = evaluatePokerHand(cards);
      const baseScore = calculateBaseScore(evaluatedHand, cards);
      
      // Flush base chips: 35
      // Card chips: 10 + 10 + 7 + 4 + 2 = 33
      // Total base chips: 35 + 33 = 68
      // Flush multiplier: 4
      expect(baseScore.chips).toBe(68);
      expect(baseScore.mult).toBe(4);
    });

    it('should calculate base score for high card', () => {
      const cards = [
        createCard('♠', 'A'), // 11 chips
        createCard('♥', '10'), // 10 chips
        createCard('♦', '7'), // 7 chips
      ];
      
      const evaluatedHand = evaluatePokerHand(cards);
      const baseScore = calculateBaseScore(evaluatedHand, cards);
      
      // High Card base chips: 5
      // Card chips: 11 + 10 + 7 = 28
      // Total base chips: 5 + 28 = 33
      // High Card multiplier: 1
      expect(baseScore.chips).toBe(33);
      expect(baseScore.mult).toBe(1);
    });
  });

  describe('calculateFinalScore', () => {
    it('should calculate final score without effects', () => {
      const baseChipMult = { chips: 50, mult: 3 };
      const effects: ScoringEffect[] = [];
      
      const finalScore = calculateFinalScore(baseChipMult, effects);
      expect(finalScore).toBe(150); // 50 * 3
    });

    it('should apply additive chip effects', () => {
      const baseChipMult = { chips: 50, mult: 3 };
      const effects = [
        { type: 'addChips' as const, value: 20 },
        { type: 'addChips' as const, value: 10 },
      ];
      
      const finalScore = calculateFinalScore(baseChipMult, effects);
      expect(finalScore).toBe(240); // (50 + 20 + 10) * 3
    });

    it('should apply multiplicative effects', () => {
      const baseChipMult = { chips: 50, mult: 3 };
      const effects = [
        { type: 'multiplyMult' as const, value: 2 },
        { type: 'multiplyMult' as const, value: 1.5 },
      ];
      
      const finalScore = calculateFinalScore(baseChipMult, effects);
      expect(finalScore).toBe(450); // 50 * (3 * 2 * 1.5)
    });

    it('should apply both chip and mult effects', () => {
      const baseChipMult = { chips: 50, mult: 3 };
      const effects = [
        { type: 'addChips' as const, value: 30 },
        { type: 'multiplyMult' as const, value: 2 },
      ];
      
      const finalScore = calculateFinalScore(baseChipMult, effects);
      expect(finalScore).toBe(480); // (50 + 30) * (3 * 2)
    });

    it('should round down to nearest integer', () => {
      const baseChipMult = { chips: 33, mult: 1.5 };
      const effects: ScoringEffect[] = [];
      
      const finalScore = calculateFinalScore(baseChipMult, effects);
      expect(finalScore).toBe(49); // Math.floor(33 * 1.5) = 49
    });
  });
});