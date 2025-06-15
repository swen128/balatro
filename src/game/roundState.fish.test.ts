import { describe, test, expect } from 'bun:test';
import { createRoundState, drawCardsToHandWithBossEffect, toggleCardSelection } from './roundState.ts';
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

  test('cards flip when selected', () => {
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
    const selectedState = toggleCardSelection(stateWithCards, firstCard.id);
    
    // Card is selected and no longer face down
    expect(selectedState.selectedCardIds.has(firstCard.id)).toBe(true);
    expect(selectedState.faceDownCardIds.has(firstCard.id)).toBe(false);
    
    // Other cards remain face down
    stateWithCards.hand.slice(1).forEach(card => {
      expect(selectedState.faceDownCardIds.has(card.id)).toBe(true);
    });
  });

  test('deselecting a card does not make it face down again', () => {
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
    
    // Select then deselect
    const selectedState = toggleCardSelection(stateWithCards, firstCard.id);
    const deselectedState = toggleCardSelection(selectedState, firstCard.id);
    
    // Card is no longer selected but remains face up
    expect(deselectedState.selectedCardIds.has(firstCard.id)).toBe(false);
    expect(deselectedState.faceDownCardIds.has(firstCard.id)).toBe(false);
  });
});