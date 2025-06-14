import { describe, it, expect } from 'bun:test';
import { createDrawPile, drawCards, addToDiscardPile, reshuffleIfNeeded } from './drawPile.ts';
import { createStandardDeck } from './card.ts';

describe('drawPile', () => {
  describe('createDrawPile', () => {
    it('should create a draw pile with shuffled deck', () => {
      const drawPile = createDrawPile();
      
      expect(drawPile.cards.length).toBe(52);
      expect(drawPile.discardPile.length).toBe(0);
      
      // Check that deck is shuffled (very unlikely to be in original order)
      const standardDeck = createStandardDeck();
      let sameOrder = true;
      for (let i = 0; i < 10; i++) {
        const drawPileCard = drawPile.cards[i];
        const standardCard = standardDeck[i];
        if (drawPileCard && standardCard && drawPileCard.id !== standardCard.id) {
          sameOrder = false;
          break;
        }
      }
      expect(sameOrder).toBe(false);
    });
  });

  describe('drawCards', () => {
    it('should draw specified number of cards', () => {
      const drawPile = createDrawPile();
      const [drawnCards, newPile] = drawCards(drawPile, 5);
      
      expect(drawnCards.length).toBe(5);
      expect(newPile.cards.length).toBe(47);
      expect(newPile.discardPile.length).toBe(0);
    });

    it('should draw from the top of the deck', () => {
      const drawPile = createDrawPile();
      const topCards = drawPile.cards.slice(0, 3);
      const [drawnCards, newPile] = drawCards(drawPile, 3);
      
      expect(drawnCards).toEqual(topCards);
      expect(newPile.cards).toEqual(drawPile.cards.slice(3));
    });

    it('should handle drawing more cards than available', () => {
      const drawPile = {
        cards: createStandardDeck().slice(0, 3),
        discardPile: [],
      };
      
      const [drawnCards, newPile] = drawCards(drawPile, 5);
      
      expect(drawnCards.length).toBe(3);
      expect(newPile.cards.length).toBe(0);
    });

    it('should return immutable draw pile', () => {
      const drawPile = createDrawPile();
      const [, newPile] = drawCards(drawPile, 5);
      
      expect(newPile).not.toBe(drawPile);
      expect(newPile.cards).not.toBe(drawPile.cards);
    });
  });

  describe('addToDiscardPile', () => {
    it('should add cards to discard pile', () => {
      const drawPile = createDrawPile();
      const cardsToDiscard = drawPile.cards.slice(0, 3);
      
      const newPile = addToDiscardPile(drawPile, cardsToDiscard);
      
      expect(newPile.discardPile.length).toBe(3);
      expect(newPile.discardPile).toEqual(cardsToDiscard);
      expect(newPile.cards.length).toBe(52); // Draw pile unchanged
    });

    it('should append to existing discard pile', () => {
      let drawPile = createDrawPile();
      const firstDiscard = drawPile.cards.slice(0, 2);
      const secondDiscard = drawPile.cards.slice(2, 5);
      
      drawPile = addToDiscardPile(drawPile, firstDiscard);
      drawPile = addToDiscardPile(drawPile, secondDiscard);
      
      expect(drawPile.discardPile.length).toBe(5);
      expect(drawPile.discardPile).toEqual([...firstDiscard, ...secondDiscard]);
    });
  });

  describe('reshuffleIfNeeded', () => {
    it('should not reshuffle if enough cards available', () => {
      const drawPile = createDrawPile();
      const reshuffled = reshuffleIfNeeded(drawPile, 5);
      
      expect(reshuffled).toBe(drawPile); // Same reference
    });

    it('should reshuffle discard pile when not enough cards', () => {
      const drawPile = {
        cards: createStandardDeck().slice(0, 2),
        discardPile: createStandardDeck().slice(2, 12),
      };
      
      const reshuffled = reshuffleIfNeeded(drawPile, 5);
      
      expect(reshuffled.cards.length).toBe(12); // 2 + 10
      expect(reshuffled.discardPile.length).toBe(0);
      expect(reshuffled).not.toBe(drawPile);
    });

    it('should shuffle the cards from discard pile', () => {
      const cards = createStandardDeck().slice(0, 2);
      const discard = createStandardDeck().slice(2, 22);
      const drawPile = { cards, discardPile: discard };
      
      const reshuffled = reshuffleIfNeeded(drawPile, 5);
      
      // Original cards should be at the beginning
      expect(reshuffled.cards.slice(0, 2)).toEqual(cards);
      
      // Remaining cards should be shuffled (very unlikely to be in same order)
      const reshuffledDiscard = reshuffled.cards.slice(2);
      let sameOrder = true;
      for (let i = 0; i < Math.min(5, reshuffledDiscard.length); i++) {
        const reshuffledCard = reshuffledDiscard[i];
        const discardCard = discard[i];
        if (reshuffledCard && discardCard && reshuffledCard.id !== discardCard.id) {
          sameOrder = false;
          break;
        }
      }
      expect(sameOrder).toBe(false);
    });

    it('should handle case with no discard pile', () => {
      const drawPile = {
        cards: createStandardDeck().slice(0, 2),
        discardPile: [],
      };
      
      const reshuffled = reshuffleIfNeeded(drawPile, 5);
      
      expect(reshuffled).toBe(drawPile); // No change needed
    });
  });
});