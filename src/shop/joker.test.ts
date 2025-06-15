import { describe, test, expect } from 'bun:test';
import { evaluateJokerEffect, JOKERS, type Joker, type JokerContext } from './joker.ts';
import { createCard } from '../cards';
import type { EvaluatedHand } from '../scoring/pokerHands.ts';
import { POKER_HANDS } from '../scoring/pokerHands.ts';

describe('joker', () => {
  describe('evaluateJokerEffect', () => {
    const createMockContext = (overrides?: Partial<JokerContext>): JokerContext => ({
      playedCards: [],
      evaluatedHand: {
        handType: POKER_HANDS.HIGH_CARD,
        scoringCards: [],
        kickers: [],
      },
      handsPlayed: 1,
      ...overrides,
    });

    test('flatChips effect adds chips', () => {
      const joker: Joker = {
        id: 'test-1',
        name: 'Test Joker',
        description: 'Test',
        rarity: 'common',
        effect: { type: 'flatChips', amount: 30 },
      };
      
      const effect = evaluateJokerEffect(joker, createMockContext());
      expect(effect).toEqual({
        type: 'addChips',
        value: 30,
        source: 'Test Joker',
      });
    });

    test('flatMult effect adds mult', () => {
      const joker: Joker = {
        id: 'test-2',
        name: 'Test Joker',
        description: 'Test',
        rarity: 'common',
        effect: { type: 'flatMult', amount: 4 },
      };
      
      const effect = evaluateJokerEffect(joker, createMockContext());
      expect(effect).toEqual({
        type: 'addMult',
        value: 4,
        source: 'Test Joker',
      });
    });

    test('multMult effect multiplies mult', () => {
      const joker: Joker = {
        id: 'test-3',
        name: 'Test Joker',
        description: 'Test',
        rarity: 'uncommon',
        effect: { type: 'multMult', amount: 2 },
      };
      
      const effect = evaluateJokerEffect(joker, createMockContext());
      expect(effect).toEqual({
        type: 'multiplyMult',
        value: 2,
        source: 'Test Joker',
      });
    });

    test('chipsPerHeart effect counts hearts', () => {
      const joker: Joker = {
        id: 'test-4',
        name: 'Test Joker',
        description: 'Test',
        rarity: 'common',
        effect: { type: 'chipsPerHeart', amount: 10 },
      };
      
      const context = createMockContext({
        playedCards: [
          createCard('♥', 'A'),
          createCard('♥', 'K'),
          createCard('♠', 'Q'),
        ],
      });
      
      const effect = evaluateJokerEffect(joker, context);
      expect(effect).toEqual({
        type: 'addChips',
        value: 20, // 2 hearts * 10
        source: 'Test Joker',
      });
    });

    test('multPerDiamond effect counts diamonds', () => {
      const joker: Joker = {
        id: 'test-5',
        name: 'Test Joker',
        description: 'Test',
        rarity: 'common',
        effect: { type: 'multPerDiamond', amount: 1.5 },
      };
      
      const context = createMockContext({
        playedCards: [
          createCard('♦', 'A'),
          createCard('♦', 'K'),
          createCard('♦', 'Q'),
          createCard('♠', 'J'),
        ],
      });
      
      const effect = evaluateJokerEffect(joker, context);
      expect(effect).toEqual({
        type: 'addMult',
        value: 4.5, // 3 diamonds * 1.5 = 4.5
        source: 'Test Joker',
      });
    });

    test('multIfContains effect triggers on matching hand', () => {
      const joker: Joker = {
        id: 'test-6',
        name: 'Test Joker',
        description: 'Test',
        rarity: 'uncommon',
        effect: { type: 'multIfContains', handType: 'Flush', amount: 10 },
      };
      
      const flushContext = createMockContext({
        evaluatedHand: {
          handType: POKER_HANDS.FLUSH,
          scoringCards: [],
          kickers: [],
        },
      });
      
      const effect = evaluateJokerEffect(joker, flushContext);
      expect(effect).toEqual({
        type: 'addMult',
        value: 10,
        source: 'Test Joker',
      });
    });

    test('multIfContains effect returns null on non-matching hand', () => {
      const joker: Joker = {
        id: 'test-7',
        name: 'Test Joker',
        description: 'Test',
        rarity: 'uncommon',
        effect: { type: 'multIfContains', handType: 'Flush', amount: 10 },
      };
      
      const pairContext = createMockContext({
        evaluatedHand: {
          handType: POKER_HANDS.PAIR,
          scoringCards: [],
          kickers: [],
        },
      });
      
      const effect = evaluateJokerEffect(joker, pairContext);
      expect(effect).toBeNull();
    });

    test('chipsIfPlayed effect triggers on matching rank', () => {
      const joker: Joker = {
        id: 'test-8',
        name: 'Test Joker',
        description: 'Test',
        rarity: 'common',
        effect: { type: 'chipsIfPlayed', rank: 'A', amount: 50 },
      };
      
      const context = createMockContext({
        playedCards: [
          createCard('♠', 'A'),
          createCard('♥', 'K'),
          createCard('♦', 'Q'),
        ],
      });
      
      const effect = evaluateJokerEffect(joker, context);
      expect(effect).toEqual({
        type: 'addChips',
        value: 50,
        source: 'Test Joker',
      });
    });

    test('multPerPair effect counts pairs in scoring cards', () => {
      const joker: Joker = {
        id: 'test-9',
        name: 'Test Joker',
        description: 'Test',
        rarity: 'rare',
        effect: { type: 'multPerPair', amount: 3 },
      };
      
      const twoPairHand: EvaluatedHand = {
        handType: POKER_HANDS.TWO_PAIR,
        scoringCards: [
          createCard('♠', 'K'),
          createCard('♥', 'K'),
          createCard('♦', 'Q'),
          createCard('♣', 'Q'),
        ],
        kickers: [],
      };
      
      const context = createMockContext({ evaluatedHand: twoPairHand });
      
      const effect = evaluateJokerEffect(joker, context);
      expect(effect).toEqual({
        type: 'addMult',
        value: 6, // 2 pairs * 3
        source: 'Test Joker',
      });
    });

    test('everyOtherHand effect triggers on even hands', () => {
      const joker: Joker = {
        id: 'test-10',
        name: 'Test Joker',
        description: 'Test',
        rarity: 'uncommon',
        effect: { type: 'everyOtherHand', mult: 5 },
      };
      
      // First hand (odd) - no effect
      const oddContext = createMockContext({ handsPlayed: 1 });
      expect(evaluateJokerEffect(joker, oddContext)).toBeNull();
      
      // Second hand (even) - effect triggers
      const evenContext = createMockContext({ handsPlayed: 2 });
      expect(evaluateJokerEffect(joker, evenContext)).toEqual({
        type: 'addMult',
        value: 5,
        source: 'Test Joker',
      });
      
      // Fourth hand (even) - effect triggers
      const fourthContext = createMockContext({ handsPlayed: 4 });
      expect(evaluateJokerEffect(joker, fourthContext)).toEqual({
        type: 'addMult',
        value: 5,
        source: 'Test Joker',
      });
    });
  });

  describe('JOKERS constant', () => {
    test('all jokers have required properties', () => {
      for (const joker of JOKERS) {
        expect(joker.id).toBeTruthy();
        expect(joker.name).toBeTruthy();
        expect(joker.description).toBeTruthy();
        expect(['common', 'uncommon', 'rare']).toContain(joker.rarity);
        expect(joker.effect).toBeTruthy();
        expect(joker.effect.type).toBeTruthy();
      }
    });

    test('all joker IDs are unique', () => {
      const ids = JOKERS.map(j => j.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    test('has expected number of jokers', () => {
      expect(JOKERS.length).toBe(35);
    });

    test('specific jokers exist with correct effects', () => {
      const jokerJoker = JOKERS.find(j => j.name === 'Joker');
      expect(jokerJoker).toBeDefined();
      expect(jokerJoker?.effect).toEqual({ type: 'flatMult', amount: 4 });
      
      const greedyJoker = JOKERS.find(j => j.name === 'Greedy Joker');
      expect(greedyJoker).toBeDefined();
      expect(greedyJoker?.effect).toEqual({ type: 'multPerDiamond', amount: 3 });
      
      const wrathfulJoker = JOKERS.find(j => j.name === 'Wrathful Joker');
      expect(wrathfulJoker).toBeDefined();
      expect(wrathfulJoker?.effect).toEqual({ type: 'multPerDiamond', amount: 3 });
    });
  });
});