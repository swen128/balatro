import type { Card } from './card.ts';

// Effect timing phases
export type BossEffectType = 
  | RoundStartEffect
  | HandSelectionEffect
  | PreScoringEffect
  | ScoringModifierEffect
  | PostScoringEffect
  | RoundEndEffect;

// Round start effects - applied when round begins
export type RoundStartEffect = {
  readonly kind: 'roundStart';
  readonly type: 'removeCardType';
  readonly cardType: 'face' | 'number' | 'suit';
  readonly target?: string; // specific rank or suit
};

// Hand selection effects - affect card selection/drawing
export type HandSelectionEffect = {
  readonly kind: 'handSelection';
} & (
  | { readonly type: 'discardRandomCards'; readonly count: number }
  | { readonly type: 'forceSuit'; readonly suit: string }
  | { readonly type: 'maxCardSelection'; readonly max: number }
  | { readonly type: 'preventCardPlay'; readonly rank: string }
);

// Pre-scoring effects - modify hand before scoring
export type PreScoringEffect = {
  readonly kind: 'preScoring';
} & (
  | { readonly type: 'debuffAllCardsInHand' }
  | { readonly type: 'removeAllSuits' }
  | { readonly type: 'firstHandScoresZero' }
);

// Scoring modifier effects - change how scores are calculated
export type ScoringModifierEffect = {
  readonly kind: 'scoringModifier';
} & (
  | { readonly type: 'capChips'; readonly max: number }
  | { readonly type: 'noFaceCardBonus' }
  | { readonly type: 'onlyOneHandType'; readonly handType: string }
);

// Post-scoring effects - applied after scoring
export type PostScoringEffect = {
  readonly kind: 'postScoring';
} & (
  | { readonly type: 'setMoneyToZero'; readonly condition: 'mostPlayedHand' }
  | { readonly type: 'loseMoneyPerCard'; readonly amount: number }
);

// Round end effects - applied at end of round
export type RoundEndEffect = {
  readonly kind: 'roundEnd';
  readonly type: 'gainMoneyIfCondition';
  readonly condition: string;
  readonly amount: number;
};

// Boss blind with typed effects
export interface TypedBossBlind {
  readonly type: 'boss';
  readonly name: string;
  readonly scoreMultiplier: number;
  readonly cashReward: number;
  readonly isBoss: true;
  readonly effects: ReadonlyArray<BossEffectType>;
}

// Convert old boss blinds to new typed system
export function createTypedBossBlind(
  name: string,
  effect: string,
  scoreMultiplier: number = 2,
  cashReward: number = 5
): TypedBossBlind {
  const effects = parseBossEffect(name);
  
  return {
    type: 'boss',
    name,
    scoreMultiplier,
    cashReward,
    isBoss: true,
    effects,
  };
}

// Parse old effect strings into typed effects
function parseBossEffect(name: string): ReadonlyArray<BossEffectType> {
  switch (name) {
    case 'The Window':
      return [{
        kind: 'preScoring',
        type: 'firstHandScoresZero',
      }];
      
    case 'The Hook':
      return [{
        kind: 'handSelection',
        type: 'discardRandomCards',
        count: 2,
      }];
      
    case 'The Ox':
      return [{
        kind: 'postScoring',
        type: 'setMoneyToZero',
        condition: 'mostPlayedHand',
      }];
      
    default:
      // Unknown boss - return empty array
      return [];
  }
}

// Effect application functions
export function applyHandSelectionEffect(
  effect: HandSelectionEffect,
  hand: ReadonlyArray<Card>
): ReadonlyArray<Card> {
  switch (effect.type) {
    case 'discardRandomCards': {
      if (hand.length <= effect.count) return [];
      const shuffled = [...hand].sort(() => Math.random() - 0.5);
      return shuffled.slice(effect.count);
    }
    
    case 'forceSuit':
      return hand.filter(card => card.suit === effect.suit);
      
    case 'maxCardSelection':
      return hand.slice(0, effect.max);
      
    case 'preventCardPlay':
      return hand.filter(card => card.rank !== effect.rank);
  }
}

export function shouldApplyPreScoringEffect(
  effect: PreScoringEffect,
  handsPlayed: number
): boolean {
  return effect.type === 'firstHandScoresZero'
    ? handsPlayed === 0
    : true;
}

export function applyPreScoringEffect(
  effect: PreScoringEffect,
  baseScore: number,
  handsPlayed: number
): number {
  switch (effect.type) {
    case 'firstHandScoresZero':
      return handsPlayed === 0 ? 0 : baseScore;
      
    case 'debuffAllCardsInHand':
      return Math.floor(baseScore * 0.5);
      
    case 'removeAllSuits':
      return Math.floor(baseScore * 0.75);
  }
}

export function applyScoringModifierEffect(
  effect: ScoringModifierEffect,
  chips: number,
  mult: number
): { chips: number; mult: number } {
  switch (effect.type) {
    case 'capChips':
      return { chips: Math.min(chips, effect.max), mult };
      
    case 'noFaceCardBonus':
      return { chips, mult };
      
    case 'onlyOneHandType':
      return { chips, mult };
  }
}

// Check if a boss has effects for a specific phase
export function hasBossEffectForPhase(
  boss: TypedBossBlind,
  phase: BossEffectType['kind']
): boolean {
  return boss.effects.some(effect => effect.kind === phase);
}

// Get all effects for a specific phase
export function getBossEffectsForPhase<T extends BossEffectType>(
  boss: TypedBossBlind,
  phase: T['kind']
): ReadonlyArray<T> {
  return boss.effects.filter(
    (effect): effect is T => effect.kind === phase
  );
}

// Context for boss effect application
export interface BossEffectContext {
  readonly bossBlind: TypedBossBlind | { readonly name: string };
  readonly handsPlayed: number;
  readonly totalMoney: number;
}

// Apply boss effects during hand selection
export function applyBossEffectOnHandSelection(
  hand: ReadonlyArray<Card>,
  bossBlind: TypedBossBlind | null
): ReadonlyArray<Card> {
  if (!bossBlind || !('effects' in bossBlind)) {
    return hand;
  }
  
  const handSelectionEffects = getBossEffectsForPhase<HandSelectionEffect>(
    bossBlind,
    'handSelection'
  );
  
  return handSelectionEffects.reduce(
    (currentHand, effect) => applyHandSelectionEffect(effect, currentHand),
    hand
  );
}

// Apply boss effects during scoring
export function applyBossEffectOnScoring<T extends { finalScore: number }>(
  scoringState: T,
  context: BossEffectContext
): T {
  // Handle old boss blind format
  if (!('effects' in context.bossBlind)) {
    // Legacy boss effect handling
    if (context.bossBlind.name === 'The Window' && context.handsPlayed === 0) {
      return {
        ...scoringState,
        finalScore: 0,
      };
    }
    return scoringState;
  }
  
  const boss = context.bossBlind;
  const preScoringEffects = getBossEffectsForPhase<PreScoringEffect>(boss, 'preScoring');
  
  const modifiedScore = preScoringEffects.reduce(
    (score, effect) => 
      shouldApplyPreScoringEffect(effect, context.handsPlayed)
        ? applyPreScoringEffect(effect, score, context.handsPlayed)
        : score,
    scoringState.finalScore
  );
  
  return {
    ...scoringState,
    finalScore: modifiedScore,
  };
}

// Check if money should be reset (for The Ox effect)
export function shouldResetMoney(
  bossBlind: TypedBossBlind | { readonly name: string } | null,
  playedHandType: string,
  handCounts: Record<string, number>
): boolean {
  if (!bossBlind) return false;
  
  // Handle old boss blind format
  if (!('effects' in bossBlind)) {
    if (bossBlind.name === 'The Ox') {
      // Find most played hand type
      const mostPlayedCount = Math.max(...Object.values(handCounts), 0);
      const mostPlayedHands = Object.entries(handCounts)
        .filter(([, count]) => count === mostPlayedCount)
        .map(([handType]) => handType);
      
      return mostPlayedHands.includes(playedHandType);
    }
    return false;
  }
  
  const boss = bossBlind;
  const postScoringEffects = getBossEffectsForPhase<PostScoringEffect>(boss, 'postScoring');
  
  return postScoringEffects.some(effect => {
    if (effect.type === 'setMoneyToZero' && effect.condition === 'mostPlayedHand') {
      const mostPlayedCount = Math.max(...Object.values(handCounts), 0);
      const mostPlayedHands = Object.entries(handCounts)
        .filter(([, count]) => count === mostPlayedCount)
        .map(([handType]) => handType);
      
      return mostPlayedHands.includes(playedHandType);
    }
    return false;
  });
}