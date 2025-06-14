import type { Card } from './card.ts';
import { createStandardDeck } from './card.ts';
import type { BossBlind } from './blind.ts';
import { getRandomBossBlind } from './blind.ts';

export interface RunState {
  readonly ante: number;
  readonly cash: number;
  readonly deck: ReadonlyArray<Card>;
  readonly handSize: number;
  readonly handsCount: number;
  readonly discardsCount: number;
  readonly round: number;
  readonly blindProgression: BlindProgression;
}

export type BlindProgression =
  | SmallBlindUpcoming
  | BigBlindUpcoming
  | BossBlindUpcoming;

interface SmallBlindUpcoming {
  readonly type: 'smallBlindUpcoming';
}

interface BigBlindUpcoming {
  readonly type: 'bigBlindUpcoming';
  readonly smallBlindSkipped: boolean;
  readonly smallBlindDefeated: boolean;
}

interface BossBlindUpcoming {
  readonly type: 'bossBlindUpcoming';
  readonly bossBlind: BossBlind;
  readonly smallBlindSkipped: boolean;
  readonly smallBlindDefeated: boolean;
  readonly bigBlindSkipped: boolean;
  readonly bigBlindDefeated: boolean;
}

export function createInitialRunState(): RunState {
  return {
    ante: 1,
    cash: 10,
    deck: createStandardDeck(),
    handSize: 8,
    handsCount: 4,
    discardsCount: 3,
    round: 0,
    blindProgression: {
      type: 'smallBlindUpcoming',
    },
  };
}

export function skipSmallBlind(state: RunState): RunState {
  if (state.blindProgression.type !== 'smallBlindUpcoming') {
    throw new Error('Can only skip small blind when it is upcoming');
  }
  
  return {
    ...state,
    blindProgression: {
      type: 'bigBlindUpcoming',
      smallBlindSkipped: true,
      smallBlindDefeated: false,
    },
  };
}

export function defeatSmallBlind(state: RunState, cashReward: number): RunState {
  if (state.blindProgression.type !== 'smallBlindUpcoming') {
    throw new Error('Can only defeat small blind when it is upcoming');
  }
  
  return {
    ...state,
    cash: state.cash + cashReward,
    round: state.round + 1,
    blindProgression: {
      type: 'bigBlindUpcoming',
      smallBlindSkipped: false,
      smallBlindDefeated: true,
    },
  };
}

export function skipBigBlind(state: RunState): RunState {
  if (state.blindProgression.type !== 'bigBlindUpcoming') {
    throw new Error('Can only skip big blind when it is upcoming');
  }
  
  return {
    ...state,
    blindProgression: {
      type: 'bossBlindUpcoming',
      bossBlind: getRandomBossBlind(),
      smallBlindSkipped: state.blindProgression.smallBlindSkipped,
      smallBlindDefeated: state.blindProgression.smallBlindDefeated,
      bigBlindSkipped: true,
      bigBlindDefeated: false,
    },
  };
}

export function defeatBigBlind(state: RunState, cashReward: number): RunState {
  if (state.blindProgression.type !== 'bigBlindUpcoming') {
    throw new Error('Can only defeat big blind when it is upcoming');
  }
  
  return {
    ...state,
    cash: state.cash + cashReward,
    round: state.round + 1,
    blindProgression: {
      type: 'bossBlindUpcoming',
      bossBlind: getRandomBossBlind(),
      smallBlindSkipped: state.blindProgression.smallBlindSkipped,
      smallBlindDefeated: state.blindProgression.smallBlindDefeated,
      bigBlindSkipped: false,
      bigBlindDefeated: true,
    },
  };
}

export function defeatBossBlind(state: RunState, cashReward: number): RunState {
  if (state.blindProgression.type !== 'bossBlindUpcoming') {
    throw new Error('Can only defeat boss blind when it is upcoming');
  }
  
  return {
    ...state,
    ante: state.ante + 1,
    cash: state.cash + cashReward,
    round: state.round + 1,
    blindProgression: {
      type: 'smallBlindUpcoming',
    },
  };
}

export function getCurrentBlindType(state: RunState): 'small' | 'big' | 'boss' {
  switch (state.blindProgression.type) {
    case 'smallBlindUpcoming':
      return 'small';
    case 'bigBlindUpcoming':
      return 'big';
    case 'bossBlindUpcoming':
      return 'boss';
  }
}