import type { RunState } from './runState.ts';
import type { RoundState } from './roundState.ts';
import type { BlindType, BossBlind } from '../blinds/blind.ts';
import { createInitialRunState, getCurrentBlindType, skipBlind, defeatBlind, addJoker } from './runState.ts';
import { createRoundState } from './roundState.ts';
import { createDrawPile } from '../cards/drawPile.ts';
import { SMALL_BLIND, BIG_BLIND, getBlindScoreGoal, getRandomBossBlind } from '../blinds/blind.ts';
import { JOKERS } from '../shop/joker.ts';

export type GameState =
  | MainMenuState
  | SelectingBlindState
  | PlayingRoundState
  | ShopState;

export interface MainMenuState {
  readonly type: 'mainMenu';
}

export interface SelectingBlindState {
  readonly type: 'selectingBlind';
  readonly runState: RunState;
  readonly availableBlind: BlindType | BossBlind;
  readonly bossEffect: string | null;
  readonly allBlinds: {
    readonly small: BlindType;
    readonly big: BlindType;
    readonly boss: BossBlind;
  };
}

export interface PlayingRoundState {
  readonly type: 'playingRound';
  readonly runState: RunState;
  readonly roundState: RoundState;
  readonly blind: BlindType | BossBlind;
  readonly bossEffect: string | null;
}

export interface ShopState {
  readonly type: 'shop';
  readonly runState: RunState;
}

export function createMainMenuState(): GameState {
  return {
    type: 'mainMenu',
  };
}

export function startNewRun(): GameState {
  const initialRunState = createInitialRunState();
  
  // Add some test jokers for demonstration
  const joker1 = JOKERS[0];
  const joker2 = JOKERS[2];
  const runStateWithJoker1 = joker1 ? addJoker(initialRunState, joker1) : initialRunState;
  const runState = joker2 ? addJoker(runStateWithJoker1, joker2) : runStateWithJoker1;
  
  const bossBlind = getRandomBossBlind();
  return {
    type: 'selectingBlind',
    runState,
    availableBlind: SMALL_BLIND,
    bossEffect: null,
    allBlinds: {
      small: SMALL_BLIND,
      big: BIG_BLIND,
      boss: bossBlind,
    },
  };
}

export function selectBlind(state: SelectingBlindState): PlayingRoundState {
  const drawPile = createDrawPile(state.runState.deck);
  const scoreGoal = getBlindScoreGoal(state.runState.ante, state.availableBlind);
  const roundState = createRoundState(
    drawPile,
    scoreGoal,
    state.runState.handsCount,
    state.runState.handSize,
    state.runState.discardsCount
  );
  
  return {
    type: 'playingRound',
    runState: state.runState,
    roundState,
    blind: state.availableBlind,
    bossEffect: state.bossEffect,
  };
}

export function skipBlindFromSelectScreen(state: SelectingBlindState): SelectingBlindState {
  const blindType = getCurrentBlindType(state.runState);
  
  // Cannot skip boss blind
  return blindType === 'boss' 
    ? state
    : ((): SelectingBlindState => {
        const newRunState = skipBlind(state.runState);
        const newBlindType = getCurrentBlindType(newRunState);
        
        // Get the blind info for the new state
        const { availableBlind, bossEffect } = ((): { readonly availableBlind: BlindType | BossBlind; readonly bossEffect: string | null } => {
          switch (newBlindType) {
            case 'small':
              return { availableBlind: SMALL_BLIND, bossEffect: null };
            case 'big':
              return { availableBlind: BIG_BLIND, bossEffect: null };
            case 'boss': {
              const bossBlind = newRunState.blindProgression.type === 'bossBlindUpcoming'
                ? newRunState.blindProgression.bossBlind
                : state.allBlinds.boss;
              return { availableBlind: bossBlind, bossEffect: bossBlind.effect };
            }
          }
        })();
        
        return {
          ...state,
          runState: newRunState,
          availableBlind,
          bossEffect,
          allBlinds: newBlindType === 'boss' && newRunState.blindProgression.type === 'bossBlindUpcoming'
            ? { ...state.allBlinds, boss: newRunState.blindProgression.bossBlind }
            : state.allBlinds,
        };
      })();
}

export function winRound(state: PlayingRoundState): ShopState {
  const cashReward = state.blind.cashReward;
  const newRunState = defeatBlind(state.runState, cashReward);
  
  return {
    type: 'shop',
    runState: newRunState,
  };
}

export function loseRound(): GameState {
  // In the future, we might show game over stats here
  return createMainMenuState();
}

export function returnToMenu(): GameState {
  return createMainMenuState();
}

export function leaveShop(state: ShopState): SelectingBlindState {
  const blindType = getCurrentBlindType(state.runState);
  
  // Get or create boss blind for this ante
  const bossBlind = state.runState.blindProgression.type === 'bossBlindUpcoming'
    ? state.runState.blindProgression.bossBlind
    : getRandomBossBlind();
    
  const allBlinds = {
    small: SMALL_BLIND,
    big: BIG_BLIND,
    boss: bossBlind,
  };
  
  const { availableBlind, bossEffect } = ((): { readonly availableBlind: BlindType | BossBlind; readonly bossEffect: string | null } => {
    switch (blindType) {
      case 'small':
        return { availableBlind: SMALL_BLIND, bossEffect: null };
      case 'big':
        return { availableBlind: BIG_BLIND, bossEffect: null };
      case 'boss':
        return { availableBlind: bossBlind, bossEffect: bossBlind.effect };
    }
  })();
  
  return {
    type: 'selectingBlind',
    runState: state.runState,
    availableBlind,
    bossEffect,
    allBlinds,
  };
}