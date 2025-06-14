import { describe, it, expect } from 'bun:test';
import { evaluatePokerHand } from './pokerHands.ts';
import { createCard, getCardChipValue } from './card.ts';

describe('pokerHands', () => {
  describe('getCardChipValue', () => {
    it('should return face value for number cards', () => {
      expect(getCardChipValue(createCard('♠', '2'))).toBe(2);
      expect(getCardChipValue(createCard('♥', '5'))).toBe(5);
      expect(getCardChipValue(createCard('♦', '9'))).toBe(9);
      expect(getCardChipValue(createCard('♣', '10'))).toBe(10);
    });

    it('should return 10 for face cards', () => {
      expect(getCardChipValue(createCard('♠', 'J'))).toBe(10);
      expect(getCardChipValue(createCard('♥', 'Q'))).toBe(10);
      expect(getCardChipValue(createCard('♦', 'K'))).toBe(10);
    });

    it('should return 11 for aces', () => {
      expect(getCardChipValue(createCard('♠', 'A'))).toBe(11);
    });
  });

  describe('evaluatePokerHand', () => {
    it('should detect royal straight flush', () => {
      const cards = [
        createCard('♠', 'A'),
        createCard('♠', 'K'),
        createCard('♠', 'Q'),
        createCard('♠', 'J'),
        createCard('♠', '10'),
      ];
      
      const result = evaluatePokerHand(cards);
      expect(result.handType.name).toBe('Royal Straight Flush');
      expect(result.scoringCards.length).toBe(5);
    });

    it('should detect straight flush', () => {
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

    it('should detect four of a kind', () => {
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

    it('should detect full house', () => {
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

    it('should detect flush', () => {
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

    it('should detect straight', () => {
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

    it('should detect three of a kind', () => {
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

    it('should detect two pair', () => {
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

    it('should detect pair', () => {
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

    it('should detect high card', () => {
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

    it('should handle less than 5 cards', () => {
      const cards = [
        createCard('♠', 'K'),
        createCard('♥', 'K'),
        createCard('♦', '7'),
      ];
      
      const result = evaluatePokerHand(cards);
      expect(result.handType.name).toBe('Pair');
    });

    it('should handle ace-low straight', () => {
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
});