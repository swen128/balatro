import type { RoundState } from '../game';
import type { BossBlind } from '../blinds';
import type { Joker } from '../shop';
import type { Card } from '../cards';
import type { HandLevels } from '../scoring';
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
} from '../game/roundState.ts';

interface RoundTransition {
  readonly nextState: RoundState;
  readonly shouldResetMoney?: boolean;
  readonly delayMs: number;
  readonly brokenGlassCards?: ReadonlyArray<Card>;
}

export function getNextRoundState(
  currentState: RoundState,
  bossBlind: BossBlind | null,
  money: number,
  jokers: ReadonlyArray<Joker> = [],
  handLevels?: HandLevels
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
        ? scoreHandWithBossEffect(currentState, bossBlind, money, jokers, handLevels)
        : scoreHand(currentState, jokers, bossBlind, handLevels);
      return { nextState, delayMs: 1000 };
    }

    case 'scoring': {
      const nextState = finishScoring(currentState);
      return { 
        nextState, 
        delayMs: 2000,
        ...(currentState.brokenGlassCards ? { brokenGlassCards: currentState.brokenGlassCards } : {}),
      };
    }

    case 'played': {
      const nextState = continueToNextHand(currentState);
      return { 
        nextState, 
        delayMs: 1000,
        ...(currentState.brokenGlassCards ? { brokenGlassCards: currentState.brokenGlassCards } : {}),
      };
    }

    case 'selectingHand':
    case 'roundFinished':
      return null;
  }
}

export function canPlayHand(state: RoundState, bossBlind: BossBlind | null = null): boolean {
  return state.type !== 'selectingHand' || state.selectedCardIds.size === 0
    ? false
    : bossBlind
    ? ((): boolean => {
        const exactCountEffect = bossBlind.effects.find(
          e => e.kind === 'handSelection' && e.type === 'exactCardCount'
        );
        
        return exactCountEffect && exactCountEffect.type === 'exactCardCount'
          ? state.selectedCardIds.size === exactCountEffect.count
          : true;
      })()
    : true;
}

export function handleCardClick(state: RoundState, cardId: string): RoundState | null {
  return state.type === 'selectingHand'
    ? toggleCardSelection(state, cardId)
    : null;
}

export function handlePlayHand(state: RoundState): RoundState | null {
  return state.type === 'selectingHand'
    ? playSelectedCards(state)
    : null;
}

export function handleDiscardCards(state: RoundState): RoundState | null {
  return state.type === 'selectingHand'
    ? discardSelectedCards(state)
    : null;
}

export function canDiscardCards(state: RoundState): boolean {
  return state.type === 'selectingHand' && 
         state.selectedCardIds.size > 0 && 
         state.discardsRemaining > 0;
}