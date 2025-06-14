import { describe, test, expect } from 'bun:test';
import {
  createCard,
  createStandardDeck,
  shuffleDeck,
  isSameSuit,
  isSameRank,
  compareRanks,
  sortCards,
  SUITS,
  RANKS,
} from './card.ts';
import type { Card } from './card.ts';

describe('card', () => {
  describe('createCard', () => {
    test('creates a card with correct properties', () => {
      const card = createCard('♥', 'A');
      expect(card.suit).toBe('♥');
      expect(card.rank).toBe('A');
      expect(card.id).toMatch(/^A♥_\d+_[a-z0-9]+$/);
      expect(card.enhancement).toBeUndefined();
    });

    test('creates a card with enhancement', () => {
      const card = createCard('♠', 'K', 'foil');
      expect(card.enhancement).toBe('foil');
    });
  });

  describe('createStandardDeck', () => {
    test('creates a deck with 52 cards', () => {
      const deck = createStandardDeck();
      expect(deck.length).toBe(52);
    });

    test('includes all suits and ranks', () => {
      const deck = createStandardDeck();
      
      for (const suit of SUITS) {
        for (const rank of RANKS) {
          const card = deck.find(c => c.suit === suit && c.rank === rank);
          expect(card).toBeDefined();
        }
      }
    });
  });

  describe('shuffleDeck', () => {
    test('returns a deck with the same cards', () => {
      const original = createStandardDeck();
      const shuffled = shuffleDeck(original);
      
      expect(shuffled.length).toBe(original.length);
      
      // Check that all original cards exist in shuffled deck
      for (const card of original) {
        const found = shuffled.find(c => c.id === card.id);
        expect(found).toBeDefined();
      }
    });

    test('does not modify the original deck', () => {
      const original = createStandardDeck();
      const originalCopy = [...original];
      shuffleDeck(original);
      
      expect(original).toEqual(originalCopy);
    });

    test('produces different order (probabilistic)', () => {
      const deck = createStandardDeck();
      const shuffled1 = shuffleDeck(deck);
      const shuffled2 = shuffleDeck(deck);
      
      // It's extremely unlikely that two shuffles produce the same order
      let differences = 0;
      for (let i = 0; i < deck.length; i++) {
        if (shuffled1[i]?.id !== shuffled2[i]?.id) {
          differences++;
        }
      }
      
      expect(differences).toBeGreaterThan(0);
    });
  });

  describe('card comparisons', () => {
    test('isSameSuit', () => {
      const card1 = createCard('♥', 'A');
      const card2 = createCard('♥', 'K');
      const card3 = createCard('♠', 'A');
      
      expect(isSameSuit(card1, card2)).toBe(true);
      expect(isSameSuit(card1, card3)).toBe(false);
    });

    test('isSameRank', () => {
      const card1 = createCard('♥', 'A');
      const card2 = createCard('♠', 'A');
      const card3 = createCard('♥', 'K');
      
      expect(isSameRank(card1, card2)).toBe(true);
      expect(isSameRank(card1, card3)).toBe(false);
    });

    test('compareRanks', () => {
      expect(compareRanks('2', 'A')).toBeLessThan(0);
      expect(compareRanks('A', '2')).toBeGreaterThan(0);
      expect(compareRanks('K', 'K')).toBe(0);
      expect(compareRanks('J', 'Q')).toBeLessThan(0);
      expect(compareRanks('K', 'Q')).toBeGreaterThan(0);
    });
  });

  describe('sortCards', () => {
    test('sorts by rank then suit', () => {
      const cards: ReadonlyArray<Card> = [
        createCard('♠', 'K'),
        createCard('♥', 'A'),
        createCard('♦', 'A'),
        createCard('♣', '2'),
      ];
      
      const sorted = sortCards(cards);
      
      // Should be: 2♣, K♠, A♥, A♦ (A is highest rank, suits ordered ♠,♥,♦,♣)
      expect(sorted[0]?.rank).toBe('2');
      expect(sorted[1]?.rank).toBe('K');
      expect(sorted[2]?.rank).toBe('A');
      expect(sorted[2]?.suit).toBe('♥');
      expect(sorted[3]?.rank).toBe('A');
      expect(sorted[3]?.suit).toBe('♦');
    });

    test('does not modify original array', () => {
      const cards = [
        createCard('♠', 'K'),
        createCard('♥', '2'),
      ];
      const original = [...cards];
      
      sortCards(cards);
      expect(cards).toEqual(original);
    });
  });
});