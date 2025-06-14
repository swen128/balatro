import type { Card } from '../cards';
import { getCardChipValue } from '../cards';
import type { EvaluatedHand } from './pokerHands.ts';

export interface ChipMult {
  readonly chips: number;
  readonly mult: number;
}

export interface ScoringEffect {
  readonly type: 'addChips' | 'addMult' | 'multMult' | 'multiplyMult';
  readonly value: number;
  readonly source?: string;
}


export function calculateBaseChipMult(evaluatedHand: EvaluatedHand): ChipMult {
  const handChips = evaluatedHand.handType.baseChips;
  const cardChips = evaluatedHand.scoringCards.reduce(
    (sum, card) => sum + getCardChipValue(card),
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