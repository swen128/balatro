import { describe, test, expect } from 'bun:test';
import { createRoundState, drawCardsToHandWithBossEffect, toggleCardSelection, playSelectedCards } from './roundState.ts';
import { createCard } from '../cards';
import { createDrawPile, type DrawPile } from '../cards/drawPile.ts';
import type { BossBlind } from '../blinds';

describe('The Fish boss blind', () => {
  const createTestDrawPile = (): DrawPile => {
    const deck = [
      createCard('♠', 'A'),
      createCard('♠', 'K'),
      createCard('♠', 'Q'),
      createCard('♠', 'J'),
      createCard('♠', '10'),
      createCard('♥', 'A'),
      createCard('♥', 'K'),
      createCard('♥', 'Q'),
    ];
    return createDrawPile(deck);
  };

  test('cards start face down with The Fish', () => {
    const drawPile = createTestDrawPile();
    const initialState = createRoundState(drawPile, 300, 4, 5, 3);
    const theFish: BossBlind = {
      type: 'boss',
      name: 'The Fish',
      scoreMultiplier: 2,
      cashReward: 5,
      isBoss: true,
      effects: [{
        kind: 'cardVisibility',
        type: 'cardsStartFaceDown',
      }],
      effectDescription: 'Cards drawn face down',
    };
    
    const stateWithCards = drawCardsToHandWithBossEffect(initialState, theFish);
    
    expect(stateWithCards.type).toBe('selectingHand');
    expect(stateWithCards.hand.length).toBe(5);
    expect(stateWithCards.faceDownCardIds.size).toBe(5);
    
    // All cards should be face down
    stateWithCards.hand.forEach(card => {
      expect(stateWithCards.faceDownCardIds.has(card.id)).toBe(true);
    });
  });

  test('cards without The Fish are not face down', () => {
    const drawPile = createTestDrawPile();
    const initialState = createRoundState(drawPile, 300, 4, 5, 3);
    
    const stateWithCards = drawCardsToHandWithBossEffect(initialState, null);
    
    expect(stateWithCards.type).toBe('selectingHand');
    expect(stateWithCards.hand.length).toBe(5);
    expect(stateWithCards.faceDownCardIds.size).toBe(0);
  });

  test('cards remain face down when selected', () => {
    const drawPile = createTestDrawPile();
    const initialState = createRoundState(drawPile, 300, 4, 5, 3);
    const theFish: BossBlind = {
      type: 'boss',
      name: 'The Fish',
      scoreMultiplier: 2,
      cashReward: 5,
      isBoss: true,
      effects: [{
        kind: 'cardVisibility',
        type: 'cardsStartFaceDown',
      }],
      effectDescription: 'Cards drawn face down',
    };
    
    const stateWithCards = drawCardsToHandWithBossEffect(initialState, theFish);
    const firstCard = stateWithCards.hand[0];
    
    expect(firstCard).toBeDefined();
    if (!firstCard) return;
    
    // Card is face down initially
    expect(stateWithCards.faceDownCardIds.has(firstCard.id)).toBe(true);
    
    // Select the card
    expect(stateWithCards.type).toBe('selectingHand');
    if (stateWithCards.type !== 'selectingHand') return;
    
    const selectedState = toggleCardSelection(stateWithCards, firstCard.id);
    
    // Card is selected but still face down
    expect(selectedState.selectedCardIds.has(firstCard.id)).toBe(true);
    expect(selectedState.faceDownCardIds.has(firstCard.id)).toBe(true);
    
    // All cards remain face down
    stateWithCards.hand.forEach(card => {
      expect(selectedState.faceDownCardIds.has(card.id)).toBe(true);
    });
  });

  test('cards are revealed when played', () => {
    const drawPile = createTestDrawPile();
    const initialState = createRoundState(drawPile, 300, 4, 5, 3);
    const theFish: BossBlind = {
      type: 'boss',
      name: 'The Fish',
      scoreMultiplier: 2,
      cashReward: 5,
      isBoss: true,
      effects: [{
        kind: 'cardVisibility',
        type: 'cardsStartFaceDown',
      }],
      effectDescription: 'Cards drawn face down',
    };
    
    const stateWithCards = drawCardsToHandWithBossEffect(initialState, theFish);
    
    // Select some cards
    expect(stateWithCards.type).toBe('selectingHand');
    if (stateWithCards.type !== 'selectingHand') return;
    
    const selectedState = stateWithCards.hand.slice(0, 3).reduce(
      (state, card) => toggleCardSelection(state, card.id),
      stateWithCards
    );
    
    // Cards are selected but still face down
    selectedState.hand.slice(0, 3).forEach(card => {
      expect(selectedState.selectedCardIds.has(card.id)).toBe(true);
      expect(selectedState.faceDownCardIds.has(card.id)).toBe(true);
    });
    
    // Play the selected cards
    const playingState = playSelectedCards(selectedState);
    
    expect(playingState.type).toBe('playing');
    
    // Played cards are now revealed (not face down)
    if (playingState.type === 'playing') {
      playingState.playedCards.forEach(card => {
        expect(playingState.faceDownCardIds.has(card.id)).toBe(false);
      });
      
      // Unplayed cards remain face down
      playingState.hand.slice(3).forEach(card => {
        expect(playingState.faceDownCardIds.has(card.id)).toBe(true);
      });
    }
  });
});