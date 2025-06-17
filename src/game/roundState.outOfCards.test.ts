import { describe, test, expect } from 'bun:test';
import { createRoundState, drawCardsToHand, drawCardsToHandWithBossEffect } from './roundState.ts';
import { createCard } from '../cards';
import { createDrawPile, type DrawPile } from '../cards/drawPile.ts';
import type { BossBlind } from '../blinds';

describe('Running out of cards', () => {
  test('loses when draw pile and hand are both empty', () => {
    // Create empty draw pile
    const emptyDrawPile: DrawPile = {
      cards: [],
      discardPile: [],
    };
    
    const initialState = createRoundState(emptyDrawPile, 300, 4, 5, 3);
    const result = drawCardsToHand(initialState);
    
    expect(result.type).toBe('roundFinished');
    if (result.type === 'roundFinished') {
      expect(result.won).toBe(false);
      expect(result.hand.length).toBe(0);
    }
  });

  test('continues when draw pile is empty but discard pile has cards', () => {
    // Create draw pile with empty main deck but cards in discard
    const drawPileWithDiscard: DrawPile = {
      cards: [],
      discardPile: [
        createCard('♠', 'A'),
        createCard('♠', 'K'),
        createCard('♠', 'Q'),
        createCard('♠', 'J'),
        createCard('♠', '10'),
      ],
    };
    
    const initialState = createRoundState(drawPileWithDiscard, 300, 4, 5, 3);
    const result = drawCardsToHand(initialState);
    
    expect(result.type).toBe('selectingHand');
    if (result.type === 'selectingHand') {
      expect(result.hand.length).toBe(5);
    }
  });

  test('The Hook effect properly triggers when hand has more cards than discard count', () => {
    // Create draw pile with 6 cards - The Hook will discard 4, leaving 2
    const minimalDrawPile: DrawPile = {
      cards: [
        createCard('♠', 'A'),
        createCard('♠', 'K'),
        createCard('♠', 'Q'),
        createCard('♠', 'J'),
        createCard('♠', '10'),
        createCard('♠', '9'),
      ],
      discardPile: [],
    };
    
    const theHook: BossBlind = {
      type: 'boss',
      name: 'The Hook',
      scoreMultiplier: 2,
      cashReward: 5,
      isBoss: true,
      effects: [{
        kind: 'handSelection',
        type: 'discardRandomCards',
        count: 4,
      }],
      effectDescription: 'Discard 4 random cards each hand',
    };
    
    const initialState = createRoundState(minimalDrawPile, 300, 4, 6, 3);
    const result = drawCardsToHandWithBossEffect(initialState, theHook);
    
    expect(result.type).toBe('selectingHand');
    if (result.type === 'selectingHand') {
      expect(result.hand.length).toBe(2); // 6 - 4 = 2
    }
  });

  test('continues when The Hook discards some cards but cards remain', () => {
    // Create draw pile with more than 3 cards
    const drawPile = createDrawPile([
      createCard('♠', 'A'),
      createCard('♠', 'K'),
      createCard('♠', 'Q'),
      createCard('♠', 'J'),
      createCard('♠', '10'),
    ]);
    
    const theHook: BossBlind = {
      type: 'boss',
      name: 'The Hook',
      scoreMultiplier: 2,
      cashReward: 5,
      isBoss: true,
      effects: [{
        kind: 'handSelection',
        type: 'discardRandomCards',
        count: 3,
      }],
      effectDescription: 'Discard 3 random cards each hand',
    };
    
    const initialState = createRoundState(drawPile, 300, 4, 5, 3);
    const result = drawCardsToHandWithBossEffect(initialState, theHook);
    
    expect(result.type).toBe('selectingHand');
    if (result.type === 'selectingHand') {
      expect(result.hand.length).toBe(2); // 5 drawn - 3 discarded = 2
    }
  });
});