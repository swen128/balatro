import type { SelectingHandState, ScoringState } from './roundState.ts';
import type { Card } from './card.ts';
import type { BossBlind } from './blind.ts';

export interface BossEffectContext {
  readonly bossBlind: BossBlind;
  readonly handsPlayed: number;
  readonly totalMoney: number;
}

export function applyBossEffectOnHandSelection(
  state: SelectingHandState,
  context: BossEffectContext
): SelectingHandState {
  switch (context.bossBlind.name) {
    case 'The Hook': {
      // Discards 2 random cards per hand
      if (state.hand.length <= 2) {
        return state;
      }
      
      // Randomly select 2 cards to remove
      const cardIndices = Array.from({ length: state.hand.length }, (_: unknown, i: number) => i);
      const toRemove = new Set<number>();
      
      for (let i = 0; i < 2 && i < state.hand.length; i++) {
        const randomIndex = Math.floor(Math.random() * cardIndices.length);
        const cardIndex = cardIndices[randomIndex];
        if (cardIndex !== undefined) {
          toRemove.add(cardIndex);
          cardIndices.splice(randomIndex, 1);
        }
      }
      
      const newHand = state.hand.filter((_: Card, index: number) => !toRemove.has(index));
      const newSelectedIds = new Set(
        Array.from(state.selectedCardIds).filter((id: string) => 
          newHand.some((card: Card) => card.id === id)
        )
      );
      
      return {
        ...state,
        hand: newHand,
        selectedCardIds: newSelectedIds,
      };
    }
    
    default:
      return state;
  }
}

export function applyBossEffectOnScoring(
  state: ScoringState,
  context: BossEffectContext
): ScoringState {
  switch (context.bossBlind.name) {
    case 'The Window': {
      // First played hand scores 0 chips
      if (context.handsPlayed === 0) {
        return {
          ...state,
          finalScore: 0,
        };
      }
      return state;
    }
    
    case 'The Ox': {
      // Playing a #1 hand (highest scoring hand type) sets money to $0
      // For now, we'll check if it's a straight flush or better
      const highValueHands = ['Straight Flush', 'Royal Straight Flush'];
      if (highValueHands.includes(state.evaluatedHand.handType.name)) {
        // This will need to be handled at the game state level
        // For now, we'll just add a marker effect
        return state;
      }
      return state;
    }
    
    default:
      return state;
  }
}

export function getBossEffectDescription(bossBlind: BossBlind): string {
  return bossBlind.effect;
}

export function shouldResetMoney(
  state: ScoringState,
  bossBlind: BossBlind
): boolean {
  if (bossBlind.name === 'The Ox') {
    const highValueHands = ['Straight Flush', 'Royal Straight Flush'];
    return highValueHands.includes(state.evaluatedHand.handType.name);
  }
  return false;
}