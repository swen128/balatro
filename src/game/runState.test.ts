import { describe, test, expect } from 'bun:test';
import {
  createInitialRunState,
  getCurrentBlindType,
  skipBlind,
  defeatBlind,
  addCash,
  removeCash,
  addJoker,
  removeJoker,
  setHandSize,
  setHandsCount,
  setDiscardsCount,
  updateDeck,
  type RunState,
} from './runState.ts';
import { createCard } from '../cards/card.ts';
import { JOKERS } from '../shop/joker.ts';

describe('runState', () => {
  describe('createInitialRunState', () => {
    test('creates initial state with correct defaults', () => {
      const state = createInitialRunState();
      
      expect(state.ante).toBe(1);
      expect(state.cash).toBe(10);
      expect(state.deck.length).toBe(52);
      expect(state.handSize).toBe(8);
      expect(state.handsCount).toBe(4);
      expect(state.discardsCount).toBe(3);
      expect(state.round).toBe(0);
      expect(state.blindProgression.type).toBe('smallBlindUpcoming');
      expect(state.jokers.length).toBe(0);
      expect(state.maxJokers).toBe(5);
    });
  });

  describe('getCurrentBlindType', () => {
    test('returns correct blind type for each progression state', () => {
      const smallBlindState = createInitialRunState();
      expect(getCurrentBlindType(smallBlindState)).toBe('small');
      
      const bigBlindState: RunState = {
        ...smallBlindState,
        blindProgression: { 
          type: 'bigBlindUpcoming', 
          smallBlindSkipped: false,
          smallBlindDefeated: true,
        },
      };
      expect(getCurrentBlindType(bigBlindState)).toBe('big');
      
      const bossBlindState: RunState = {
        ...smallBlindState,
        blindProgression: { 
          type: 'bossBlindUpcoming',
          bossBlind: { type: 'boss', name: 'Test Boss', effect: 'test', cashReward: 5, scoreMultiplier: 2, isBoss: true as const },
          smallBlindSkipped: false,
          smallBlindDefeated: true,
          bigBlindSkipped: false,
          bigBlindDefeated: true,
        },
      };
      expect(getCurrentBlindType(bossBlindState)).toBe('boss');
    });
  });

  describe('skipBlind', () => {
    test('skips small blind to big blind', () => {
      const initialState = createInitialRunState();
      const newState = skipBlind(initialState);
      
      expect(newState.blindProgression.type).toBe('bigBlindUpcoming');
      if (newState.blindProgression.type === 'bigBlindUpcoming') {
        expect(newState.blindProgression.smallBlindSkipped).toBe(true);
        expect(newState.blindProgression.smallBlindDefeated).toBe(false);
      }
      expect(newState.round).toBe(0); // Round doesn't change on skip
    });

    test('skips big blind to boss blind', () => {
      const bigBlindState: RunState = {
        ...createInitialRunState(),
        blindProgression: { 
          type: 'bigBlindUpcoming',
          smallBlindSkipped: false,
          smallBlindDefeated: true,
        },
      };
      
      const newState = skipBlind(bigBlindState);
      
      expect(newState.blindProgression.type).toBe('bossBlindUpcoming');
      if (newState.blindProgression.type === 'bossBlindUpcoming') {
        expect(newState.blindProgression.bigBlindSkipped).toBe(true);
        expect(newState.blindProgression.bigBlindDefeated).toBe(false);
        expect(newState.blindProgression.bossBlind).toBeDefined();
      }
      expect(newState.round).toBe(0); // Round doesn't change on skip
    });

    test('cannot skip boss blind', () => {
      const bossBlindState: RunState = {
        ...createInitialRunState(),
        blindProgression: { 
          type: 'bossBlindUpcoming',
          bossBlind: { type: 'boss', name: 'Test Boss', effect: 'test', cashReward: 5, scoreMultiplier: 2, isBoss: true as const },
          smallBlindSkipped: false,
          smallBlindDefeated: true,
          bigBlindSkipped: false,
          bigBlindDefeated: true,
        },
      };
      
      const newState = skipBlind(bossBlindState);
      expect(newState).toBe(bossBlindState); // Should return same state
    });
  });

  describe('defeatBlind', () => {
    test('defeats small blind and progresses to big blind', () => {
      const initialState = createInitialRunState();
      const cashReward = 3;
      const newState = defeatBlind(initialState, cashReward);
      
      expect(newState.blindProgression.type).toBe('bigBlindUpcoming');
      if (newState.blindProgression.type === 'bigBlindUpcoming') {
        expect(newState.blindProgression.smallBlindDefeated).toBe(true);
      }
      expect(newState.cash).toBe(13); // 10 + 3
      expect(newState.round).toBe(1); // Round increments on defeat
    });

    test('defeats boss blind and progresses to next ante', () => {
      const bossBlindState: RunState = {
        ...createInitialRunState(),
        blindProgression: { 
          type: 'bossBlindUpcoming',
          bossBlind: { type: 'boss', name: 'Test Boss', effect: 'test', cashReward: 5, scoreMultiplier: 2, isBoss: true as const },
          smallBlindSkipped: false,
          smallBlindDefeated: true,
          bigBlindSkipped: false,
          bigBlindDefeated: true,
        },
      };
      
      const newState = defeatBlind(bossBlindState, 5);
      
      expect(newState.ante).toBe(2);
      expect(newState.blindProgression.type).toBe('smallBlindUpcoming');
      expect(newState.cash).toBe(15); // 10 + 5
      expect(newState.round).toBe(1); // Reset to 1 for new ante
    });
  });

  describe('cash management', () => {
    test('adds cash', () => {
      const state = createInitialRunState();
      const newState = addCash(state, 20);
      expect(newState.cash).toBe(30);
    });

    test('removes cash', () => {
      const state = { ...createInitialRunState(), cash: 50 };
      const newState = removeCash(state, 20);
      expect(newState.cash).toBe(30);
    });

    test('does not allow negative cash', () => {
      const state = createInitialRunState();
      const newState = removeCash(state, 20);
      expect(newState.cash).toBe(0); // Should be 0, not negative
    });
  });

  describe('joker management', () => {
    test('adds joker', () => {
      const state = createInitialRunState();
      const joker = JOKERS[0];
      expect(joker).toBeDefined();
      if (!joker) return;
      
      const newState = addJoker(state, joker);
      expect(newState.jokers.length).toBe(1);
      expect(newState.jokers[0]).toBe(joker);
    });

    test('does not add joker beyond max', () => {
      let state = createInitialRunState();
      
      // Add 5 jokers (max)
      for (let i = 0; i < 5; i++) {
        const joker = JOKERS[i];
        if (joker) {
          state = addJoker(state, joker);
        }
      }
      
      expect(state.jokers.length).toBe(5);
      
      // Try to add 6th joker
      const extraJoker = JOKERS[5];
      if (extraJoker) {
        const newState = addJoker(state, extraJoker);
        expect(newState.jokers.length).toBe(5); // Should still be 5
      }
    });

    test('removes joker', () => {
      const state = createInitialRunState();
      const joker1 = JOKERS[0];
      const joker2 = JOKERS[1];
      
      if (!joker1 || !joker2) return;
      
      const stateWith2Jokers = addJoker(addJoker(state, joker1), joker2);
      expect(stateWith2Jokers.jokers.length).toBe(2);
      
      const newState = removeJoker(stateWith2Jokers, joker1.id);
      expect(newState.jokers.length).toBe(1);
      expect(newState.jokers[0]).toBe(joker2);
    });
  });

  describe('game parameters', () => {
    test('sets hand size', () => {
      const state = createInitialRunState();
      const newState = setHandSize(state, 10);
      expect(newState.handSize).toBe(10);
    });

    test('sets hands count', () => {
      const state = createInitialRunState();
      const newState = setHandsCount(state, 6);
      expect(newState.handsCount).toBe(6);
    });

    test('sets discards count', () => {
      const state = createInitialRunState();
      const newState = setDiscardsCount(state, 5);
      expect(newState.discardsCount).toBe(5);
    });

    test('updates deck', () => {
      const state = createInitialRunState();
      const newDeck = [
        createCard('♠', 'A'),
        createCard('♥', 'K'),
        createCard('♦', 'Q'),
      ];
      
      const newState = updateDeck(state, newDeck);
      expect(newState.deck.length).toBe(3);
      expect(newState.deck).toEqual(newDeck);
    });
  });
});