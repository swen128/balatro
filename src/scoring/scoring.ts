import type { Card } from '../cards';
import { getCardChipValue } from '../cards';
import type { EvaluatedHand, HandLevels, PokerHandKey } from './pokerHands.ts';
import type { BossBlind } from '../blinds';
import { POKER_HANDS } from './pokerHands.ts';

export interface ChipMult {
  readonly chips: number;
  readonly mult: number;
}

export interface ScoringEffect {
  readonly type: 'addChips' | 'addMult' | 'multMult' | 'multiplyMult';
  readonly value: number;
  readonly source?: string;
}


function getHandLevelKey(evaluatedHand: EvaluatedHand): PokerHandKey | null {
  // Find which POKER_HANDS key matches this hand type
  const keys: ReadonlyArray<PokerHandKey> = [
    'ROYAL_FLUSH', 'STRAIGHT_FLUSH', 'FOUR_OF_A_KIND', 'FULL_HOUSE',
    'FLUSH', 'STRAIGHT', 'THREE_OF_A_KIND', 'TWO_PAIR', 'PAIR', 'HIGH_CARD'
  ];
  
  const matchingKey = keys.find(key => POKER_HANDS[key] === evaluatedHand.handType);
  return matchingKey ?? null;
}

function getHandLevelBonus(level: number): { chips: number; mult: number } {
  return {
    chips: (level - 1) * 10,
    mult: (level - 1) * 1,
  };
}

function getHandLevelDecrease(bossBlind: BossBlind | null | undefined): number {
  return !bossBlind
    ? 0
    : ((): number => {
        const effect = bossBlind.effects.find(e => 
          e.kind === 'scoringModifier' && e.type === 'decreaseHandLevel'
        );
        
        return effect && effect.kind === 'scoringModifier' && effect.type === 'decreaseHandLevel'
          ? effect.amount
          : 0;
      })();
}

function calculateHandLevelBonus(
  evaluatedHand: EvaluatedHand,
  handLevels: HandLevels,
  handLevelDecrease: number
): { chips: number; mult: number } {
  const handKey = getHandLevelKey(evaluatedHand);
  
  return handKey === null 
    ? { chips: 0, mult: 0 }
    : ((): { chips: number; mult: number } => {
        const baseLevel = handLevels[handKey];
        const effectiveLevel = Math.max(1, baseLevel + handLevelDecrease);
        return getHandLevelBonus(effectiveLevel);
      })();
}

function getRestrictedSuit(bossBlind: BossBlind | null | undefined): { readonly suit: string } | undefined {
  return !bossBlind
    ? undefined
    : ((): { readonly suit: string } | undefined => {
        const effect = bossBlind.effects.find(e => 
          e.kind === 'scoringModifier' && e.type === 'suitGivesNoChips'
        );
        
        return effect && effect.kind === 'scoringModifier' && effect.type === 'suitGivesNoChips'
          ? effect
          : undefined;
      })();
}

function calculateCardChips(
  scoringCards: ReadonlyArray<Card>,
  restrictedSuit: { readonly suit: string } | undefined
): number {
  return scoringCards.reduce(
    (sum, card) => {
      const shouldSkip = restrictedSuit !== undefined && card.suit === restrictedSuit.suit;
      return sum + (shouldSkip ? 0 : getCardChipValue(card));
    },
    0
  );
}

export function calculateBaseChipMult(
  evaluatedHand: EvaluatedHand, 
  bossBlind?: BossBlind | null,
  handLevels?: HandLevels
): ChipMult {
  const baseHandChips = evaluatedHand.handType.baseChips;
  const baseHandMult = evaluatedHand.handType.baseMult;
  
  const handLevelDecrease = getHandLevelDecrease(bossBlind);
  
  const levelBonus = handLevels !== undefined
    ? calculateHandLevelBonus(evaluatedHand, handLevels, handLevelDecrease)
    : { chips: 0, mult: 0 };
  
  const handChips = baseHandChips + levelBonus.chips;
  const handMult = baseHandMult + levelBonus.mult;
  
  const restrictedSuit = getRestrictedSuit(bossBlind);
  const cardChips = calculateCardChips(evaluatedHand.scoringCards, restrictedSuit);
  
  return {
    chips: handChips + cardChips,
    mult: handMult,
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



export const GLASS_MULT_BONUS = 2; // x2 multiplier  
const GLASS_BREAK_CHANCE = 0.25; // 25% chance to break

export type RandomNumberGenerator = () => number;

export function determineGlassBrokenCards(
  cards: ReadonlyArray<Card>,
  randomFn: RandomNumberGenerator = Math.random
): ReadonlyArray<Card> {
  return cards.filter(card => 
    card.enhancement === 'glass' && randomFn() < GLASS_BREAK_CHANCE
  );
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
      : card.enhancement === 'glass'
      ? [{
          type: 'multiplyMult',
          value: GLASS_MULT_BONUS,
          source: `Glass ${card.rank}${card.suit}`,
        }]
      : []
  );
}