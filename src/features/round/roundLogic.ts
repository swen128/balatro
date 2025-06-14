import type { RoundState, RoundFinishedState } from '../../domain/roundState.ts';
import type { BossBlind } from '../../domain/blind.ts';
import type { Joker } from '../../domain/joker.ts';
import {
  drawCardsToHand,
  drawCardsToHandWithBossEffect,
  toggleCardSelection,
  playSelectedCards,
  scoreHand,
  scoreHandWithBossEffect,
  finishScoring,
  continueToNextHand,
  discardSelectedCards,
} from '../../domain/roundState.ts';

export interface RoundTransition {
  readonly nextState: RoundState;
  readonly shouldResetMoney?: boolean;
  readonly delayMs: number;
}

export function getNextRoundState(
  currentState: RoundState,
  bossBlind: BossBlind | null,
  money: number,
  jokers: ReadonlyArray<Joker> = []
): RoundTransition | null {
  switch (currentState.type) {
    case 'drawing': {
      const nextState = bossBlind
        ? drawCardsToHandWithBossEffect(currentState, bossBlind)
        : drawCardsToHand(currentState);
      return { nextState, delayMs: 500 };
    }

    case 'playing': {
      const nextState = bossBlind
        ? scoreHandWithBossEffect(currentState, bossBlind, money, jokers)
        : scoreHand(currentState, jokers);
      
      // The Ox effect requires tracking hand counts which isn't available here
      // For now, we'll handle money reset at a higher level
      return { nextState, delayMs: 1000 };
    }

    case 'scoring': {
      const nextState = finishScoring(currentState);
      return { nextState, delayMs: 2000 };
    }

    case 'played': {
      const nextState = continueToNextHand(currentState);
      return { nextState, delayMs: 1000 };
    }

    case 'selectingHand':
    case 'roundFinished':
      return null;
  }
}

export function canPlayHand(state: RoundState): boolean {
  return state.type === 'selectingHand' && state.selectedCardIds.size > 0;
}

export function handleCardClick(state: RoundState, cardId: string): RoundState | null {
  if (state.type === 'selectingHand') {
    return toggleCardSelection(state, cardId);
  }
  return null;
}

export function handlePlayHand(state: RoundState): RoundState | null {
  if (state.type === 'selectingHand') {
    return playSelectedCards(state);
  }
  return null;
}

export function isRoundFinished(state: RoundState): state is RoundFinishedState {
  return state.type === 'roundFinished';
}

export function handleDiscardCards(state: RoundState): RoundState | null {
  if (state.type === 'selectingHand') {
    return discardSelectedCards(state);
  }
  return null;
}

export function canDiscardCards(state: RoundState): boolean {
  return state.type === 'selectingHand' && 
         state.selectedCardIds.size > 0 && 
         state.discardsRemaining > 0;
}