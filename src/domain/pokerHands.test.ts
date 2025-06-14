import { describe, test, expect } from 'bun:test';
import { evaluatePokerHand, getPokerHandByName } from './pokerHands.ts';
import { createCard, getCardChipValue } from './card.ts';
import type { Card } from './card.ts';

describe('pokerHands', () => {
  describe('getCardChipValue', () => {
    test('should return face value for number cards', () => {
      expect(getCardChipValue(createCard('♠', '2'))).toBe(2);
      expect(getCardChipValue(createCard('♠', '5'))).toBe(5);
      expect(getCardChipValue(createCard('♠', '9'))).toBe(9);
      expect(getCardChipValue(createCard('♠', '10'))).toBe(10);
    });

    test('should return 10 for face cards', () => {
      expect(getCardChipValue(createCard('♠', 'J'))).toBe(10);
      expect(getCardChipValue(createCard('♠', 'Q'))).toBe(10);
      expect(getCardChipValue(createCard('♠', 'K'))).toBe(10);
    });

    test('should return 11 for aces', () => {
      expect(getCardChipValue(createCard('♠', 'A'))).toBe(11);
    });
  });

  describe('evaluatePokerHand', () => {
    test('should detect royal flush', () => {
      const cards: ReadonlyArray<Card> = [
        createCard('♠', 'A'),
        createCard('♠', 'K'),
        createCard('♠', 'Q'),
        createCard('♠', 'J'),
        createCard('♠', '10'),
      ];
      
      const result = evaluatePokerHand(cards);
      expect(result.handType.name).toBe('Royal Flush');
      expect(result.scoringCards.length).toBe(5);
    });

    test('should detect straight flush', () => {
      const cards = [
        createCard('♥', '9'),
        createCard('♥', '8'),
        createCard('♥', '7'),
        createCard('♥', '6'),
        createCard('♥', '5'),
      ];
      
      const result = evaluatePokerHand(cards);
      expect(result.handType.name).toBe('Straight Flush');
    });

    test('should detect four of a kind', () => {
      const cards = [
        createCard('♠', 'K'),
        createCard('♥', 'K'),
        createCard('♦', 'K'),
        createCard('♣', 'K'),
        createCard('♠', '2'),
      ];
      
      const result = evaluatePokerHand(cards);
      expect(result.handType.name).toBe('Four of a Kind');
      expect(result.scoringCards.length).toBe(4);
    });

    test('should detect full house', () => {
      const cards = [
        createCard('♠', 'K'),
        createCard('♥', 'K'),
        createCard('♦', 'K'),
        createCard('♣', '2'),
        createCard('♠', '2'),
      ];
      
      const result = evaluatePokerHand(cards);
      expect(result.handType.name).toBe('Full House');
      expect(result.scoringCards.length).toBe(5);
    });

    test('should detect flush', () => {
      const cards = [
        createCard('♦', 'K'),
        createCard('♦', '10'),
        createCard('♦', '7'),
        createCard('♦', '4'),
        createCard('♦', '2'),
      ];
      
      const result = evaluatePokerHand(cards);
      expect(result.handType.name).toBe('Flush');
      expect(result.scoringCards.length).toBe(5);
    });

    test('should detect straight', () => {
      const cards = [
        createCard('♠', '6'),
        createCard('♥', '5'),
        createCard('♦', '4'),
        createCard('♣', '3'),
        createCard('♠', '2'),
      ];
      
      const result = evaluatePokerHand(cards);
      expect(result.handType.name).toBe('Straight');
      expect(result.scoringCards.length).toBe(5);
    });

    test('should detect three of a kind', () => {
      const cards = [
        createCard('♠', 'K'),
        createCard('♥', 'K'),
        createCard('♦', 'K'),
        createCard('♣', '5'),
        createCard('♠', '2'),
      ];
      
      const result = evaluatePokerHand(cards);
      expect(result.handType.name).toBe('Three of a Kind');
      expect(result.scoringCards.length).toBe(3);
    });

    test('should detect two pair', () => {
      const cards = [
        createCard('♠', 'K'),
        createCard('♥', 'K'),
        createCard('♦', '5'),
        createCard('♣', '5'),
        createCard('♠', '2'),
      ];
      
      const result = evaluatePokerHand(cards);
      expect(result.handType.name).toBe('Two Pair');
      expect(result.scoringCards.length).toBe(4);
    });

    test('should detect pair', () => {
      const cards = [
        createCard('♠', 'K'),
        createCard('♥', 'K'),
        createCard('♦', '7'),
        createCard('♣', '5'),
        createCard('♠', '2'),
      ];
      
      const result = evaluatePokerHand(cards);
      expect(result.handType.name).toBe('Pair');
      expect(result.scoringCards.length).toBe(2);
    });

    test('should detect high card', () => {
      const cards = [
        createCard('♠', 'K'),
        createCard('♥', '10'),
        createCard('♦', '7'),
        createCard('♣', '5'),
        createCard('♠', '2'),
      ];
      
      const result = evaluatePokerHand(cards);
      expect(result.handType.name).toBe('High Card');
      expect(result.scoringCards.length).toBe(1);
      const firstCard = result.scoringCards[0];
      expect(firstCard?.rank).toBe('K');
    });

    test('should handle less than 5 cards', () => {
      const cards = [
        createCard('♠', 'K'),
        createCard('♥', 'K'),
        createCard('♦', '7'),
      ];
      
      const result = evaluatePokerHand(cards);
      expect(result.handType.name).toBe('Pair');
    });

    test('should handle ace-low straight', () => {
      const cards = [
        createCard('♠', 'A'),
        createCard('♥', '2'),
        createCard('♦', '3'),
        createCard('♣', '4'),
        createCard('♠', '5'),
      ];
      
      const result = evaluatePokerHand(cards);
      expect(result.handType.name).toBe('Straight');
      expect(result.scoringCards.length).toBe(5);
    });
  });

  describe('getPokerHandByName', () => {
    test('returns correct hand type', () => {
      const flush = getPokerHandByName('Flush');
      expect(flush?.name).toBe('Flush');
      expect(flush?.baseChips).toBe(35);
      expect(flush?.baseMult).toBe(4);
    });

    test('returns undefined for invalid name', () => {
      const result = getPokerHandByName('Invalid Hand');
      expect(result).toBeUndefined();
    });
  });
});