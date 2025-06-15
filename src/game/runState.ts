import type { Card, SpectralCard, ArcanaCard } from '../cards';
import { createStandardDeck } from '../cards';
import type { BossBlind } from '../blinds';
import { getRandomBossBlind } from '../blinds';
import type { Joker } from '../shop';

export const WINNING_ANTE = 8;

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
  readonly consumables: ReadonlyArray<SpectralCard | ArcanaCard>;
  readonly maxConsumables: number;
}

type BlindProgression =
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
    consumables: [],
    maxConsumables: 2,
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

export function addCash(state: RunState, amount: number): RunState {
  return {
    ...state,
    cash: state.cash + amount,
  };
}

export function removeCash(state: RunState, amount: number): RunState {
  return {
    ...state,
    cash: Math.max(0, state.cash - amount),
  };
}

export function setHandSize(state: RunState, handSize: number): RunState {
  return {
    ...state,
    handSize,
  };
}

export function setHandsCount(state: RunState, handsCount: number): RunState {
  return {
    ...state,
    handsCount,
  };
}

export function setDiscardsCount(state: RunState, discardsCount: number): RunState {
  return {
    ...state,
    discardsCount,
  };
}

export function updateDeck(state: RunState, deck: ReadonlyArray<Card>): RunState {
  return {
    ...state,
    deck,
  };
}

export function addConsumable(state: RunState, consumable: SpectralCard | ArcanaCard): RunState {
  return state.consumables.length >= state.maxConsumables
    ? state
    : {
        ...state,
        consumables: [...state.consumables, consumable],
      };
}

export function removeConsumable(state: RunState, consumableId: string): RunState {
  return {
    ...state,
    consumables: state.consumables.filter(c => c.id !== consumableId),
  };
}