import { describe, test, expect } from 'bun:test';
import { evaluateJokerEffect, JOKERS, getRandomJoker, type Joker, type JokerContext } from './joker.ts';
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
        type: 'flatChips',
        amount: 30,
      };
      
      const effects = evaluateJokerEffect(joker, createMockContext());
      expect(effects).toEqual([{
        type: 'addChips',
        value: 30,
        source: 'Test Joker',
      }]);
    });

    test('flatMult effect adds mult', () => {
      const joker: Joker = {
        id: 'test-2',
        name: 'Test Joker',
        description: 'Test',
        rarity: 'common',
        type: 'flatMult',
        amount: 4,
      };
      
      const effects = evaluateJokerEffect(joker, createMockContext());
      expect(effects).toEqual([{
        type: 'addMult',
        value: 4,
        source: 'Test Joker',
      }]);
    });

    test('multMult effect multiplies mult', () => {
      const joker: Joker = {
        id: 'test-3',
        name: 'Test Joker',
        description: 'Test',
        rarity: 'uncommon',
        type: 'multMult',
        amount: 2,
      };
      
      const effects = evaluateJokerEffect(joker, createMockContext());
      expect(effects).toEqual([{
        type: 'multiplyMult',
        value: 2,
        source: 'Test Joker',
      }]);
    });

    test('chipsPerHeart effect counts hearts', () => {
      const joker: Joker = {
        id: 'test-4',
        name: 'Test Joker',
        description: 'Test',
        rarity: 'common',
        type: 'chipsPerHeart',
        amount: 10,
      };
      
      const context = createMockContext({
        playedCards: [
          createCard('♥', 'A'),
          createCard('♥', 'K'),
          createCard('♠', 'Q'),
        ],
      });
      
      const effects = evaluateJokerEffect(joker, context);
      expect(effects).toEqual([{
        type: 'addChips',
        value: 20, // 2 hearts * 10
        source: 'Test Joker',
      }]);
    });

    test('multPerDiamond effect counts diamonds', () => {
      const joker: Joker = {
        id: 'test-5',
        name: 'Test Joker',
        description: 'Test',
        rarity: 'common',
        type: 'multPerDiamond',
        amount: 1.5,
      };
      
      const context = createMockContext({
        playedCards: [
          createCard('♦', 'A'),
          createCard('♦', 'K'),
          createCard('♦', 'Q'),
          createCard('♠', 'J'),
        ],
      });
      
      const effects = evaluateJokerEffect(joker, context);
      expect(effects).toEqual([{
        type: 'addMult',
        value: 4.5, // 3 diamonds * 1.5 = 4.5
        source: 'Test Joker',
      }]);
    });

    test('multIfContains effect triggers on matching hand', () => {
      const joker: Joker = {
        id: 'test-6',
        name: 'Test Joker',
        description: 'Test',
        rarity: 'uncommon',
        type: 'multIfContains',
        handType: 'Flush',
        amount: 10,
      };
      
      const flushContext = createMockContext({
        evaluatedHand: {
          handType: POKER_HANDS.FLUSH,
          scoringCards: [],
          kickers: [],
        },
      });
      
      const effects = evaluateJokerEffect(joker, flushContext);
      expect(effects).toEqual([{
        type: 'addMult',
        value: 10,
        source: 'Test Joker',
      }]);
    });

    test('multIfContains effect returns null on non-matching hand', () => {
      const joker: Joker = {
        id: 'test-7',
        name: 'Test Joker',
        description: 'Test',
        rarity: 'uncommon',
        type: 'multIfContains',
        handType: 'Flush',
        amount: 10,
      };
      
      const pairContext = createMockContext({
        evaluatedHand: {
          handType: POKER_HANDS.PAIR,
          scoringCards: [],
          kickers: [],
        },
      });
      
      const effects = evaluateJokerEffect(joker, pairContext);
      expect(effects).toEqual([]);
    });

    test('chipsIfPlayed effect triggers on matching rank', () => {
      const joker: Joker = {
        id: 'test-8',
        name: 'Test Joker',
        description: 'Test',
        rarity: 'common',
        type: 'chipsIfPlayed',
        rank: 'A',
        amount: 50,
      };
      
      const context = createMockContext({
        playedCards: [
          createCard('♠', 'A'),
          createCard('♥', 'K'),
          createCard('♦', 'Q'),
        ],
      });
      
      const effects = evaluateJokerEffect(joker, context);
      expect(effects).toEqual([{
        type: 'addChips',
        value: 50,
        source: 'Test Joker',
      }]);
    });

    test('multPerPair effect counts pairs in scoring cards', () => {
      const joker: Joker = {
        id: 'test-9',
        name: 'Test Joker',
        description: 'Test',
        rarity: 'rare',
        type: 'multPerPair',
        amount: 3,
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
      
      const effects = evaluateJokerEffect(joker, context);
      expect(effects).toEqual([{
        type: 'addMult',
        value: 6, // 2 pairs * 3
        source: 'Test Joker',
      }]);
    });

    test('everyOtherHand effect triggers on even hands', () => {
      const joker: Joker = {
        id: 'test-10',
        name: 'Test Joker',
        description: 'Test',
        rarity: 'uncommon',
        type: 'everyOtherHand',
        mult: 5,
      };
      
      // First hand (odd) - no effect
      const oddContext = createMockContext({ handsPlayed: 1 });
      expect(evaluateJokerEffect(joker, oddContext)).toEqual([]);
      
      // Second hand (even) - effect triggers
      const evenContext = createMockContext({ handsPlayed: 2 });
      expect(evaluateJokerEffect(joker, evenContext)).toEqual([{
        type: 'addMult',
        value: 5,
        source: 'Test Joker',
      }]);
      
      // Fourth hand (even) - effect triggers
      const fourthContext = createMockContext({ handsPlayed: 4 });
      expect(evaluateJokerEffect(joker, fourthContext)).toEqual([{
        type: 'addMult',
        value: 5,
        source: 'Test Joker',
      }]);
    });
  });

  describe('JOKERS constant', () => {
    test('all jokers have required properties', () => {
      for (const joker of JOKERS) {
        expect(joker.id).toBeTruthy();
        expect(joker.name).toBeTruthy();
        expect(joker.description).toBeTruthy();
        expect(['common', 'uncommon', 'rare']).toContain(joker.rarity);
        expect(joker.type).toBeTruthy();
      }
    });

    test('all joker IDs are unique', () => {
      const ids = JOKERS.map(j => j.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });


    test('specific jokers exist with correct effects', () => {
      const jokerJoker = JOKERS.find(j => j.name === 'Joker');
      expect(jokerJoker).toBeDefined();
      expect(jokerJoker?.type).toBe('flatMult');
      if (jokerJoker?.type === 'flatMult') {
        expect(jokerJoker.amount).toBe(4);
      }
      
      const greedyJoker = JOKERS.find(j => j.name === 'Greedy Joker');
      expect(greedyJoker).toBeDefined();
      expect(greedyJoker?.type).toBe('multPerDiamond');
      if (greedyJoker?.type === 'multPerDiamond') {
        expect(greedyJoker.amount).toBe(3);
      }
      
      const wrathfulJoker = JOKERS.find(j => j.name === 'Wrathful Joker');
      expect(wrathfulJoker).toBeDefined();
      expect(wrathfulJoker?.type).toBe('multPerSuit');
      if (wrathfulJoker?.type === 'multPerSuit') {
        expect(wrathfulJoker.suits).toEqual(['♠']);
        expect(wrathfulJoker.mult).toBe(3);
      }
    });
  });

  describe('getRandomJoker', () => {
    test('returns a joker with unique ID', () => {
      const joker1 = getRandomJoker();
      const joker2 = getRandomJoker();
      
      expect(joker1.id).not.toBe(joker2.id);
      expect(joker1.name).toBeDefined();
      expect(joker1.description).toBeDefined();
      expect(joker1.rarity).toBeDefined();
      expect(joker1.type).toBeDefined();
    });

    test('returns joker of specified rarity', () => {
      const commonJoker = getRandomJoker('common');
      expect(commonJoker.rarity).toBe('common');

      const uncommonJoker = getRandomJoker('uncommon');
      expect(uncommonJoker.rarity).toBe('uncommon');

      const rareJoker = getRandomJoker('rare');
      expect(rareJoker.rarity).toBe('rare');
    });

    test('returns any joker when rarity not specified', () => {
      const joker = getRandomJoker();
      expect(['common', 'uncommon', 'rare']).toContain(joker.rarity);
    });
  });
});