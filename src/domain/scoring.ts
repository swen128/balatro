import type { Card } from './card.ts';
import { getCardChipValue } from './card.ts';
import type { EvaluatedHand } from './pokerHands.ts';

export interface ChipMult {
  readonly chips: number;
  readonly mult: number;
}

export interface ScoringEffect {
  readonly type: 'addChips' | 'addMult' | 'multMult';
  readonly value: number;
  readonly source: string;
}

export interface ScoringContext {
  readonly baseChipMult: ChipMult;
  readonly effects: ReadonlyArray<ScoringEffect>;
  readonly playedCards: ReadonlyArray<Card>;
  readonly evaluatedHand: EvaluatedHand;
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

export function applyEffects(
  base: ChipMult,
  effects: ReadonlyArray<ScoringEffect>
): ChipMult {
  let chips = base.chips;
  let mult = base.mult;
  
  // Apply effects in order
  for (const effect of effects) {
    switch (effect.type) {
      case 'addChips':
        chips += effect.value;
        break;
      case 'addMult':
        mult += effect.value;
        break;
      case 'multMult':
        mult *= effect.value;
        break;
    }
  }
  
  return { chips, mult };
}

export function calculateFinalScore(chipMult: ChipMult): number {
  return Math.floor(chipMult.chips * chipMult.mult);
}

export function createScoringContext(
  evaluatedHand: EvaluatedHand,
  playedCards: ReadonlyArray<Card>,
  additionalEffects: ReadonlyArray<ScoringEffect> = []
): ScoringContext {
  const baseChipMult = calculateBaseChipMult(evaluatedHand);
  
  return {
    baseChipMult,
    effects: additionalEffects,
    playedCards,
    evaluatedHand,
  };
}

export function scoreHand(context: ScoringContext): number {
  const finalChipMult = applyEffects(context.baseChipMult, context.effects);
  return calculateFinalScore(finalChipMult);
}