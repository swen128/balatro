import type { Card } from '../cards';
import { getCardChipValue } from '../cards';
import type { EvaluatedHand } from './pokerHands.ts';
import type { BossBlind } from '../blinds';

export interface ChipMult {
  readonly chips: number;
  readonly mult: number;
}

export interface ScoringEffect {
  readonly type: 'addChips' | 'addMult' | 'multMult' | 'multiplyMult';
  readonly value: number;
  readonly source?: string;
}


export function calculateBaseChipMult(evaluatedHand: EvaluatedHand, bossBlind?: BossBlind | null): ChipMult {
  const handChips = evaluatedHand.handType.baseChips;
  
  // Find suit restriction effect if boss blind exists
  const restrictedSuit = bossBlind && 'effects' in bossBlind
    ? bossBlind.effects.find((e): e is { readonly kind: 'scoringModifier'; readonly type: 'suitGivesNoChips'; readonly suit: string } => 
        e.kind === 'scoringModifier' && e.type === 'suitGivesNoChips')
    : undefined;
    
  const cardChips = evaluatedHand.scoringCards.reduce(
    (sum, card) => {
      // Skip chips from restricted suit
      const shouldSkip = restrictedSuit !== undefined && card.suit === restrictedSuit.suit;
      return sum + (shouldSkip ? 0 : getCardChipValue(card));
    },
    0
  );
  
  return {
    chips: handChips + cardChips,
    mult: evaluatedHand.handType.baseMult,
  };
}

export function calculateBaseScore(evaluatedHand: EvaluatedHand, playedCards: ReadonlyArray<Card>): ChipMult {
  const handChips = evaluatedHand.handType.baseChips;
  const cardChips = playedCards.reduce(
    (sum, card) => sum + getCardChipValue(card),
    0
  );
  
  return {
    chips: handChips + cardChips,
    mult: evaluatedHand.handType.baseMult,
  };
}

export function applyEffects(
  base: ChipMult,
  effects: ReadonlyArray<ScoringEffect>
): ChipMult {
  return effects.reduce((acc, effect) => {
    switch (effect.type) {
      case 'addChips':
        return { ...acc, chips: acc.chips + effect.value };
      case 'addMult':
        return { ...acc, mult: acc.mult + effect.value };
      case 'multMult':
      case 'multiplyMult':
        return { ...acc, mult: acc.mult * effect.value };
    }
  }, base);
}

export function calculateFinalScore(chipMult: ChipMult, effects: ReadonlyArray<ScoringEffect> = []): number {
  const finalChipMult = applyEffects(chipMult, effects);
  return Math.floor(finalChipMult.chips * finalChipMult.mult);
}



export function getCardEnhancementEffects(cards: ReadonlyArray<Card>): ReadonlyArray<ScoringEffect> {
  return cards.flatMap((card): ReadonlyArray<ScoringEffect> => 
    card.enhancement === 'holographic'
      ? [{
          type: 'addMult',
          value: 10,
          source: `Holographic ${card.rank}${card.suit}`,
        }]
      : card.enhancement === 'polychrome'
      ? [{
          type: 'multiplyMult',
          value: 1.5,
          source: `Polychrome ${card.rank}${card.suit}`,
        }]
      : []
  );
}