import { describe, it, expect } from 'bun:test';
import { createCard, isRedSuit, createStandardDeck, shuffleDeck } from './card.ts';
import type { Suit, Rank } from './card.ts';

describe('card', () => {
  describe('createCard', () => {
    it('should create a card with unique id', () => {
      const card1 = createCard('♠', 'A');
      const card2 = createCard('♠', 'A');
      
      expect(card1.suit).toBe('♠');
      expect(card1.rank).toBe('A');
      expect(card1.id).not.toBe(card2.id);
    });
  });

  describe('isRedSuit', () => {
    it('should return true for red suits', () => {
      expect(isRedSuit('♥')).toBe(true);
      expect(isRedSuit('♦')).toBe(true);
    });

    it('should return false for black suits', () => {
      expect(isRedSuit('♠')).toBe(false);
      expect(isRedSuit('♣')).toBe(false);
    });
  });

  describe('createStandardDeck', () => {
    it('should create a deck with 52 cards', () => {
      const deck = createStandardDeck();
      expect(deck.length).toBe(52);
    });

    it('should have 13 cards of each suit', () => {
      const deck = createStandardDeck();
      const suits: ReadonlyArray<Suit> = ['♠', '♥', '♦', '♣'];
      
      suits.forEach(suit => {
        const cardsOfSuit = deck.filter(card => card.suit === suit);
        expect(cardsOfSuit.length).toBe(13);
      });
    });

    it('should have 4 cards of each rank', () => {
      const deck = createStandardDeck();
      const ranks: ReadonlyArray<Rank> = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
      
      ranks.forEach(rank => {
        const cardsOfRank = deck.filter(card => card.rank === rank);
        expect(cardsOfRank.length).toBe(4);
      });
    });
  });

  describe('shuffleDeck', () => {
    it('should return a new array with same cards', () => {
      const deck = createStandardDeck();
      const shuffled = shuffleDeck(deck);
      
      expect(shuffled.length).toBe(deck.length);
      expect(shuffled).not.toBe(deck); // Different array instance
      
      // Check all cards are present
      deck.forEach(card => {
        expect(shuffled.some(c => c.id === card.id)).toBe(true);
      });
    });

    it('should actually shuffle the deck', () => {
      const deck = createStandardDeck();
      const shuffled = shuffleDeck(deck);
      
      // Very unlikely to have same order after shuffle
      let sameOrder = true;
      for (let i = 0; i < deck.length; i++) {
        if (deck[i]!.id !== shuffled[i]!.id) {
          sameOrder = false;
          break;
        }
      }
      
      expect(sameOrder).toBe(false);
    });
  });
});