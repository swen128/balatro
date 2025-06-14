import type { RunState } from './runState.ts';
import type { RoundState } from './roundState.ts';
import type { BlindType, BossBlind } from './blind.ts';
import { createInitialRunState, getCurrentBlindType, skipSmallBlind, skipBigBlind, defeatSmallBlind, defeatBigBlind, defeatBossBlind } from './runState.ts';
import { createRoundState } from './roundState.ts';
import { createDrawPile } from './drawPile.ts';
import { SMALL_BLIND, BIG_BLIND, getBlindScoreGoal, getRandomBossBlind } from './blind.ts';

export type GameState =
  | MainMenuState
  | SelectingBlindState
  | PlayingRoundState
  | ShopState;

interface MainMenuState {
  readonly type: 'mainMenu';
}

interface SelectingBlindState {
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

interface ShopState {
  readonly type: 'shop';
  readonly runState: RunState;
}

export function createMainMenuState(): GameState {
  return {
    type: 'mainMenu',
  };
}

export function startNewRun(): GameState {
  const runState = createInitialRunState();
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

export function skipBlind(state: SelectingBlindState): SelectingBlindState {
  const blindType = getCurrentBlindType(state.runState);
  
  switch (blindType) {
    case 'small': {
      const newRunState = skipSmallBlind(state.runState);
      return {
        ...state,
        runState: newRunState,
        availableBlind: BIG_BLIND,
        bossEffect: null,
      };
    }
    case 'big': {
      const newRunState = skipBigBlind(state.runState);
      if (newRunState.blindProgression.type === 'bossBlindUpcoming') {
        const bossBlind = newRunState.blindProgression.bossBlind;
        return {
          ...state,
          runState: newRunState,
          availableBlind: bossBlind,
          bossEffect: bossBlind.effect,
          allBlinds: {
            ...state.allBlinds,
            boss: bossBlind,
          },
        };
      }
      throw new Error('Invalid state after skipping big blind');
    }
    case 'boss':
      throw new Error('Cannot skip boss blind');
  }
}

export function winRound(state: PlayingRoundState): ShopState {
  const blindType = getCurrentBlindType(state.runState);
  const cashReward = state.blind.cashReward;
  
  let newRunState: RunState;
  switch (blindType) {
    case 'small':
      newRunState = defeatSmallBlind(state.runState, cashReward);
      break;
    case 'big':
      newRunState = defeatBigBlind(state.runState, cashReward);
      break;
    case 'boss':
      newRunState = defeatBossBlind(state.runState, cashReward);
      break;
  }
  
  return {
    type: 'shop',
    runState: newRunState,
  };
}

export function loseRound(): GameState {
  // In the future, we might show game over stats here
  return createMainMenuState();
}

export function leaveShop(state: ShopState): SelectingBlindState {
  const blindType = getCurrentBlindType(state.runState);
  
  let availableBlind: BlindType | BossBlind;
  let bossEffect: string | null = null;
  let allBlinds: { small: BlindType; big: BlindType; boss: BossBlind };
  
  // Get or create boss blind for this ante
  if (state.runState.blindProgression.type === 'bossBlindUpcoming') {
    allBlinds = {
      small: SMALL_BLIND,
      big: BIG_BLIND,
      boss: state.runState.blindProgression.bossBlind,
    };
  } else if (blindType === 'small') {
    // Beginning of new ante, generate new boss
    allBlinds = {
      small: SMALL_BLIND,
      big: BIG_BLIND,
      boss: getRandomBossBlind(),
    };
  } else {
    // This shouldn't happen, but provide a fallback
    allBlinds = {
      small: SMALL_BLIND,
      big: BIG_BLIND,
      boss: getRandomBossBlind(),
    };
  }
  
  switch (blindType) {
    case 'small':
      availableBlind = SMALL_BLIND;
      break;
    case 'big':
      availableBlind = BIG_BLIND;
      break;
    case 'boss':
      availableBlind = allBlinds.boss;
      bossEffect = allBlinds.boss.effect;
      break;
  }
  
  return {
    type: 'selectingBlind',
    runState: state.runState,
    availableBlind,
    bossEffect,
    allBlinds,
  };
}