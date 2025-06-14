import type { Card } from './card.ts';
import { createStandardDeck } from './card.ts';
import type { BossBlind } from './blind.ts';
import { getRandomBossBlind } from './blind.ts';
import type { Joker } from './joker.ts';

export interface RunState {
  readonly ante: number;
  readonly cash: number;
  readonly deck: ReadonlyArray<Card>;
  readonly handSize: number;
  readonly handsCount: number;
  readonly discardsCount: number;
  readonly round: number;
  readonly blindProgression: BlindProgression;
  readonly jokers: ReadonlyArray<Joker>;
  readonly maxJokers: number;
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
    jokers: [],
    maxJokers: 5,
  };
}


export function defeatBlind(state: RunState, cashReward: number): RunState {
  switch (state.blindProgression.type) {
    case 'smallBlindUpcoming':
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
        
    case 'bigBlindUpcoming':
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
        
    case 'bossBlindUpcoming':
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
}

export function skipBlind(state: RunState): RunState {
  switch (state.blindProgression.type) {
    case 'smallBlindUpcoming':
      return {
        ...state,
        blindProgression: {
          type: 'bigBlindUpcoming',
          smallBlindSkipped: true,
          smallBlindDefeated: false,
        },
      };
        
    case 'bigBlindUpcoming':
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
        
    case 'bossBlindUpcoming':
      // Cannot skip boss blind, return unchanged state
      return state;
  }
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

export function addJoker(state: RunState, joker: Joker): RunState {
  return state.jokers.length >= state.maxJokers
    ? state // Return unchanged state if at max capacity
    : {
        ...state,
        jokers: [...state.jokers, joker],
      };
}

export function removeJoker(state: RunState, jokerId: string): RunState {
  return {
    ...state,
    jokers: state.jokers.filter(j => j.id !== jokerId),
  };
}