import { describe, test, expect } from 'bun:test';
import {
  createRoundState,
  selectCard,
  deselectCard,
  playSelectedCards,
  calculateScore,
  scoreHand,
  discardSelectedCards,
  drawNewCards,
  isRoundWon,
  isRoundLost,
  type RoundState,
} from './roundState.ts';
import { createCard } from '../cards';
import { createDrawPile, type DrawPile } from '../cards/drawPile.ts';
import { POKER_HANDS } from '../scoring/pokerHands.ts';
import { JOKERS } from '../shop/joker.ts';

describe('roundState', () => {
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
      createCard('♥', 'J'),
      createCard('♥', '10'),
    ];
    return createDrawPile(deck);
  };

  describe('createRoundState', () => {
    test('creates initial drawing state', () => {
      const drawPile = createTestDrawPile();
      const state = createRoundState(drawPile, 300, 4, 8, 3);
      
      expect(state.type).toBe('drawing');
      expect(state.score).toBe(0);
      expect(state.scoreGoal).toBe(300);
      expect(state.handsRemaining).toBe(4);
      expect(state.handSize).toBe(8);
      expect(state.handsPlayed).toBe(0);
      expect(state.discardsRemaining).toBe(3);
      expect(state.hand.length).toBe(0);
    });
  });

  describe('drawNewCards', () => {
    test('draws cards up to hand size', () => {
      const drawPile = createTestDrawPile();
      const initialState = createRoundState(drawPile, 300, 4, 5, 3);
      const state = drawNewCards(initialState);
      
      expect(state.type).toBe('selectingHand');
      expect(state.hand.length).toBe(5);
      expect(state.selectedCardIds.size).toBe(0);
    });

    test('handles drawing when already have cards', () => {
      const drawPile = createTestDrawPile();
      const initialState = createRoundState(drawPile, 300, 4, 5, 3);
      const stateWithCards = drawNewCards(initialState);
      
      // Manually create a state with fewer cards
      const stateWithFewerCards: RoundState = {
        ...stateWithCards,
        hand: stateWithCards.hand.slice(0, 3),
      };
      
      const redrawnState = drawNewCards(stateWithFewerCards);
      expect(redrawnState.hand.length).toBe(5); // Can only draw up to 5 total
    });
  });

  describe('selectCard/deselectCard', () => {
    test('selects a card', () => {
      const drawPile = createTestDrawPile();
      const state = drawNewCards(createRoundState(drawPile, 300, 4, 5, 3));
      const cardToSelect = state.hand[0];
      
      expect(cardToSelect).toBeDefined();
      if (!cardToSelect) return;
      
      const newState = selectCard(state, cardToSelect.id);
      expect(newState.selectedCardIds.has(cardToSelect.id)).toBe(true);
      expect(newState.selectedCardIds.size).toBe(1);
    });

    test('deselects a card', () => {
      const drawPile = createTestDrawPile();
      const state = drawNewCards(createRoundState(drawPile, 300, 4, 5, 3));
      const cardToSelect = state.hand[0];
      
      expect(cardToSelect).toBeDefined();
      if (!cardToSelect) return;
      
      const selectedState = selectCard(state, cardToSelect.id);
      const deselectedState = deselectCard(selectedState, cardToSelect.id);
      
      expect(deselectedState.selectedCardIds.has(cardToSelect.id)).toBe(false);
      expect(deselectedState.selectedCardIds.size).toBe(0);
    });

    test('does not select card not in hand', () => {
      const drawPile = createTestDrawPile();
      const state = drawNewCards(createRoundState(drawPile, 300, 4, 5, 3));
      
      const newState = selectCard(state, 'invalid-id');
      expect(newState.selectedCardIds.size).toBe(0);
    });

    test('limits selection to 5 cards', () => {
      const drawPile = createTestDrawPile();
      const state = drawNewCards(createRoundState(drawPile, 300, 4, 8, 3));
      
      // Select 5 cards
      let currentState = state;
      for (let i = 0; i < 5; i++) {
        const card = state.hand[i];
        if (card) {
          currentState = selectCard(currentState, card.id);
        }
      }
      
      expect(currentState.selectedCardIds.size).toBe(5);
      
      // Try to select a 6th card
      const sixthCard = state.hand[5];
      if (sixthCard) {
        const newState = selectCard(currentState, sixthCard.id);
        expect(newState.selectedCardIds.size).toBe(5); // Should not increase
      }
    });
  });

  describe('playSelectedCards', () => {
    test('plays selected cards', () => {
      const drawPile = createTestDrawPile();
      const state = drawNewCards(createRoundState(drawPile, 300, 4, 5, 3));
      
      // Select some cards
      let selectedState = state;
      for (let i = 0; i < 3; i++) {
        const card = state.hand[i];
        if (card) {
          selectedState = selectCard(selectedState, card.id);
        }
      }
      
      const playingState = playSelectedCards(selectedState);
      
      expect(playingState.type).toBe('playing');
      if (playingState.type === 'playing') {
        expect(playingState.playedCards.length).toBe(3);
        expect(playingState.evaluatedHand).toBeDefined();
      }
      expect(playingState.handsRemaining).toBe(4); // Not decremented until finishScoring
    });

    test('does not play with no cards selected', () => {
      const drawPile = createTestDrawPile();
      const state = drawNewCards(createRoundState(drawPile, 300, 4, 5, 3));
      
      const result = playSelectedCards(state);
      expect(result).toBe(state); // Should return same state
    });
  });

  describe('calculateScore', () => {
    test('calculates score without jokers or boss', () => {
      const playedCards = [
        createCard('♠', 'K'),
        createCard('♥', 'K'),
      ];
      const evaluatedHand = {
        handType: POKER_HANDS.PAIR,
        scoringCards: playedCards,
        kickers: [],
      };
      
      const result = calculateScore(playedCards, evaluatedHand, [], null, 1);
      
      expect(result.finalScore).toBeGreaterThan(0);
      expect(result.chipMult.chips).toBe(30); // Base chips for pair (10) + 2 Kings (10 each = 20)
      expect(result.chipMult.mult).toBe(2); // Base mult for pair
    });

    test('calculates score with joker effects', () => {
      const playedCards = [
        createCard('♠', 'K'),
        createCard('♥', 'K'),
      ];
      const evaluatedHand = {
        handType: POKER_HANDS.PAIR,
        scoringCards: playedCards,
        kickers: [],
      };
      
      const joker = JOKERS.find(j => j.effect.type === 'flatMult');
      expect(joker).toBeDefined();
      
      const result = calculateScore(playedCards, evaluatedHand, joker ? [joker] : [], null, 1);
      
      expect(result.effects.length).toBeGreaterThan(0);
      expect(result.finalScore).toBeGreaterThan(40); // Should be higher with joker
    });

    test('calculates score with card enhancements', () => {
      const playedCards = [
        { ...createCard('♠', 'K'), enhancement: 'foil' as const },
        createCard('♥', 'K'),
      ];
      const evaluatedHand = {
        handType: POKER_HANDS.PAIR,
        scoringCards: playedCards,
        kickers: [],
      };
      
      const result = calculateScore(playedCards, evaluatedHand, [], null, 1);
      
      // Foil adds +50 chips to the card itself
      expect(result.chipMult.chips).toBe(80); // 10 (pair base) + 10 (normal K) + 60 (foil K: 10 + 50)
    });
  });

  describe('scoreHand', () => {
    test('transitions from playing to scoring state', () => {
      const drawPile = createTestDrawPile();
      const state = drawNewCards(createRoundState(drawPile, 300, 4, 5, 3));
      
      // Select and play cards
      let selectedState = state;
      for (let i = 0; i < 2; i++) {
        const card = state.hand[i];
        if (card) {
          selectedState = selectCard(selectedState, card.id);
        }
      }
      
      const playingState = playSelectedCards(selectedState);
      if (playingState.type !== 'playing') {
        throw new Error('Expected playing state');
      }
      const scoringState = scoreHand(playingState, []);
      
      expect(scoringState.type).toBe('scoring');
      expect(scoringState.finalScore).toBeGreaterThan(0);
    });
  });

  describe('discardSelectedCards', () => {
    test('discards selected cards and decrements discard count', () => {
      const drawPile = createTestDrawPile();
      const state = drawNewCards(createRoundState(drawPile, 300, 4, 5, 3));
      
      // Select some cards
      let selectedState = state;
      const cardsToDiscard = 2;
      for (let i = 0; i < cardsToDiscard; i++) {
        const card = state.hand[i];
        if (card) {
          selectedState = selectCard(selectedState, card.id);
        }
      }
      
      const discardedState = discardSelectedCards(selectedState);
      
      expect(discardedState.hand.length).toBe(3); // Started with 5, discarded 2
      expect(discardedState.discardsRemaining).toBe(2); // Started with 3, used 1
      expect(discardedState.type).toBe('drawing'); // Returns to drawing state
    });

    test('does not discard if no cards selected', () => {
      const drawPile = createTestDrawPile();
      const state = drawNewCards(createRoundState(drawPile, 300, 4, 5, 3));
      
      const result = discardSelectedCards(state);
      expect(result).toBe(state); // Should return same state
      expect(result.discardsRemaining).toBe(3); // No change
    });

    test('does not discard if no discards remaining', () => {
      const drawPile = createTestDrawPile();
      const stateWithNoDiscards = {
        ...drawNewCards(createRoundState(drawPile, 300, 4, 5, 0)),
        discardsRemaining: 0,
      };
      
      // Select a card
      const card = stateWithNoDiscards.hand[0];
      if (card) {
        const selectedState = selectCard(stateWithNoDiscards, card.id);
        const result = discardSelectedCards(selectedState);
        expect(result).toBe(selectedState); // Should return same state
      }
    });
  });

  describe('isRoundWon/isRoundLost', () => {
    test('detects round won', () => {
      const state: RoundState = {
        type: 'selectingHand',
        drawPile: createTestDrawPile(),
        hand: [],
        score: 350,
        scoreGoal: 300,
        handsRemaining: 2,
        handSize: 8,
        handsPlayed: 2,
        discardsRemaining: 3,
        selectedCardIds: new Set(),
        faceDownCardIds: new Set(),
      };
      
      expect(isRoundWon(state)).toBe(true);
      expect(isRoundLost(state)).toBe(false);
    });

    test('detects round lost', () => {
      const state: RoundState = {
        type: 'selectingHand',
        drawPile: createTestDrawPile(),
        hand: [],
        score: 250,
        scoreGoal: 300,
        handsRemaining: 0,
        handSize: 8,
        handsPlayed: 4,
        discardsRemaining: 3,
        selectedCardIds: new Set(),
        faceDownCardIds: new Set(),
      };
      
      expect(isRoundWon(state)).toBe(false);
      expect(isRoundLost(state)).toBe(true);
    });

    test('round not over if can still play', () => {
      const state: RoundState = {
        type: 'selectingHand',
        drawPile: createTestDrawPile(),
        hand: [],
        score: 250,
        scoreGoal: 300,
        handsRemaining: 1,
        handSize: 8,
        handsPlayed: 3,
        discardsRemaining: 3,
        selectedCardIds: new Set(),
        faceDownCardIds: new Set(),
      };
      
      expect(isRoundWon(state)).toBe(false);
      expect(isRoundLost(state)).toBe(false);
    });
  });
});