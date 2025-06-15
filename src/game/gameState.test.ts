import { describe, test, expect } from 'bun:test';
import {
  createMainMenuState,
  startNewRun,
  selectBlind,
  skipBlindFromSelectScreen,
  winRound,
  loseRound,
  returnToMenu,
  leaveShop,
} from './gameState.ts';
import { SMALL_BLIND, BIG_BLIND } from '../blinds/blind.ts';

describe('gameState', () => {
  describe('createMainMenuState', () => {
    test('creates main menu state', () => {
      const state = createMainMenuState();
      expect(state.type).toBe('mainMenu');
    });
  });

  describe('startNewRun', () => {
    test('creates new run with initial state', () => {
      const state = startNewRun();
      
      expect(state.type).toBe('selectingBlind');
      if (state.type === 'selectingBlind') {
        expect(state.runState.ante).toBe(1);
        expect(state.runState.cash).toBe(10);
        expect(state.availableBlind).toEqual(SMALL_BLIND);
        expect(state.bossEffect).toBeNull();
        expect(state.allBlinds.small).toEqual(SMALL_BLIND);
        expect(state.allBlinds.big).toEqual(BIG_BLIND);
        expect(state.allBlinds.boss).toBeDefined();
        
        // Test jokers are added for demonstration
        expect(state.runState.jokers.length).toBeGreaterThan(0);
      }
    });
  });

  describe('selectBlind', () => {
    test('starts playing round when blind is selected', () => {
      const selectingState = startNewRun();
      if (selectingState.type !== 'selectingBlind') {
        throw new Error('Expected selectingBlind state');
      }
      
      const playingState = selectBlind(selectingState);
      
      expect(playingState.type).toBe('playingRound');
      expect(playingState.runState).toBe(selectingState.runState);
      expect(playingState.blind).toBe(selectingState.availableBlind);
      expect(playingState.bossEffect).toBe(selectingState.bossEffect);
      expect(playingState.roundState.type).toBe('drawing');
      expect(playingState.roundState.scoreGoal).toBeGreaterThan(0);
    });
  });

  describe('skipBlindFromSelectScreen', () => {
    test('skips small blind to big blind', () => {
      const selectingState = startNewRun();
      if (selectingState.type !== 'selectingBlind') {
        throw new Error('Expected selectingBlind state');
      }
      
      const newState = skipBlindFromSelectScreen(selectingState);
      
      expect(newState.type).toBe('selectingBlind');
      expect(newState.availableBlind).toEqual(BIG_BLIND);
      expect(newState.runState.blindProgression.type).toBe('bigBlindUpcoming');
    });

    test('skips big blind to boss blind', () => {
      let state = startNewRun();
      if (state.type !== 'selectingBlind') {
        throw new Error('Expected selectingBlind state');
      }
      
      // Skip to big blind
      state = skipBlindFromSelectScreen(state);
      
      // Skip to boss blind
      const bossState = skipBlindFromSelectScreen(state);
      
      expect(bossState.type).toBe('selectingBlind');
      expect(bossState.availableBlind.type).toBe('boss');
      expect(bossState.bossEffect).toBeTruthy();
      expect(bossState.runState.blindProgression.type).toBe('bossBlindUpcoming');
    });

    test('cannot skip boss blind', () => {
      let state = startNewRun();
      if (state.type !== 'selectingBlind') {
        throw new Error('Expected selectingBlind state');
      }
      
      // Skip to big blind, then boss blind
      state = skipBlindFromSelectScreen(state);
      state = skipBlindFromSelectScreen(state);
      
      // Try to skip boss blind
      const result = skipBlindFromSelectScreen(state);
      expect(result).toBe(state); // Should return same state
    });
  });

  describe('winRound', () => {
    test('transitions to shop after winning', () => {
      const selectingState = startNewRun();
      if (selectingState.type !== 'selectingBlind') {
        throw new Error('Expected selectingBlind state');
      }
      
      const playingState = selectBlind(selectingState);
      const nextState = winRound(playingState);
      
      expect(nextState.type).toBe('shop');
      if (nextState.type === 'shop') {
        expect(nextState.runState.cash).toBeGreaterThan(selectingState.runState.cash);
        expect(nextState.runState.blindProgression.type).toBe('bigBlindUpcoming');
      }
    });
  });

  describe('loseRound', () => {
    test('returns game over state on loss', () => {
      const selectingState = startNewRun();
      if (selectingState.type !== 'selectingBlind') {
        throw new Error('Expected selectingBlind state');
      }
      
      const playingState = selectBlind(selectingState);
      const gameOverState = loseRound(playingState);
      
      expect(gameOverState.type).toBe('gameOver');
      expect(gameOverState.runState).toBe(playingState.runState);
      expect(gameOverState.finalScore).toBeDefined();
    });
  });

  describe('returnToMenu', () => {
    test('returns to main menu', () => {
      const state = returnToMenu();
      expect(state.type).toBe('mainMenu');
    });
  });

  describe('leaveShop', () => {
    test('returns to blind selection after shop', () => {
      const selectingState = startNewRun();
      if (selectingState.type !== 'selectingBlind') {
        throw new Error('Expected selectingBlind state');
      }
      
      const playingState = selectBlind(selectingState);
      const shopState = winRound(playingState);
      
      if (shopState.type !== 'shop') {
        throw new Error('Expected shop state');
      }
      
      const newSelectingState = leaveShop(shopState);
      
      expect(newSelectingState.type).toBe('selectingBlind');
      expect(newSelectingState.availableBlind).toEqual(BIG_BLIND);
      expect(newSelectingState.runState).toBe(shopState.runState);
    });

    test('provides boss blind when leaving shop before boss', () => {
      // Create a state where we're about to face the boss
      const selectingState = startNewRun();
      if (selectingState.type !== 'selectingBlind') {
        throw new Error('Expected selectingBlind state');
      }
      
      // Skip small and big blinds to get to boss
      let state = skipBlindFromSelectScreen(selectingState);
      state = skipBlindFromSelectScreen(state);
      
      const playingState = selectBlind(state);
      const shopState = winRound(playingState);
      
      if (shopState.type !== 'shop') {
        throw new Error('Expected shop state');
      }
      
      // Manually set progression to be before boss
      const shopBeforeBoss = {
        ...shopState,
        runState: {
          ...shopState.runState,
          blindProgression: {
            type: 'bossBlindUpcoming' as const,
            bossBlind: { type: 'boss' as const, name: 'Test Boss', effects: [], effectDescription: 'Test effect', cashReward: 5, scoreMultiplier: 2, isBoss: true as const },
            smallBlindSkipped: false,
            smallBlindDefeated: true,
            bigBlindSkipped: false,
            bigBlindDefeated: true,
          },
        },
      };
      
      const newSelectingState = leaveShop(shopBeforeBoss);
      
      expect(newSelectingState.type).toBe('selectingBlind');
      expect(newSelectingState.availableBlind.type).toBe('boss');
      expect(newSelectingState.bossEffect).toBeTruthy();
    });
  });
});