
// Boss effect types organized by when they apply
type BossEffectType = 
  | HandSelectionEffect
  | PreScoringEffect
  | ScoringModifierEffect
  | PostScoringEffect
  | RoundEndEffect;

// Hand selection effects - applied when selecting cards to play
type HandSelectionEffect = {
  readonly kind: 'handSelection';
} & (
  | { readonly type: 'discardRandomCards'; readonly count: number }
  | { readonly type: 'forceSuit'; readonly suit: string }
  | { readonly type: 'maxCardSelection'; readonly max: number }
  | { readonly type: 'preventCardPlay'; readonly rank: string }
  | { readonly type: 'exactCardCount'; readonly count: number }
);

// Pre-scoring effects - modify score before calculation
type PreScoringEffect = {
  readonly kind: 'preScoring';
} & (
  | { readonly type: 'firstHandScoresZero' }
  | { readonly type: 'debuffAllCardsInHand' }
  | { readonly type: 'removeAllSuits' }
);

// Scoring modifier effects - modify chip/mult calculation
type ScoringModifierEffect = {
  readonly kind: 'scoringModifier';
} & (
  | { readonly type: 'capChips'; readonly max: number }
  | { readonly type: 'noFaceCardBonus' }
  | { readonly type: 'onlyOneHandType'; readonly handType: string }
  | { readonly type: 'suitGivesNoChips'; readonly suit: string }
);

// Post-scoring effects - applied after score calculation
type PostScoringEffect = {
  readonly kind: 'postScoring';
} & (
  | { readonly type: 'setMoneyToZero'; readonly condition: 'mostPlayedHand' }
  | { readonly type: 'loseMoneyPerCard'; readonly amount: number }
);

// Round end effects - applied at end of round
type RoundEndEffect = {
  readonly kind: 'roundEnd';
  readonly type: 'gainMoneyIfCondition';
  readonly condition: string;
  readonly amount: number;
};

// Boss blind with typed effects
export interface BossBlind {
  readonly type: 'boss';
  readonly name: string;
  readonly scoreMultiplier: number;
  readonly cashReward: number;
  readonly isBoss: true;
  readonly effects: ReadonlyArray<BossEffectType>;
  readonly effectDescription: string;
}




function shouldApplyPreScoringEffect(
  effect: PreScoringEffect,
  handsPlayed: number
): boolean {
  return effect.type === 'firstHandScoresZero'
    ? handsPlayed === 0
    : true;
}

function applyPreScoringEffect(
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



// Get all effects for a specific phase
function getBossEffectsForPhase<T extends BossEffectType>(
  boss: BossBlind,
  phase: T['kind']
): ReadonlyArray<T> {
  return boss.effects.filter((effect): effect is T => effect.kind === phase);
}

// Context for boss effect application
interface BossEffectContext {
  readonly bossBlind: BossBlind | { readonly name: string };
  readonly handsPlayed: number;
  readonly totalMoney: number;
  readonly evaluatedHand?: { readonly handType: { readonly name: string } };
}


// Apply boss effects during scoring
export function applyBossEffectOnScoring<T extends { finalScore: number }>(
  scoringState: T,
  context: BossEffectContext
): T {
  // Handle old boss blind format
  return !('effects' in context.bossBlind)
    ? context.bossBlind.name === 'The Window' && context.handsPlayed === 0
      ? {
          ...scoringState,
          finalScore: 0,
        }
      : scoringState
    : ((): T => {
        const boss = context.bossBlind;
        
        // Apply pre-scoring effects
        const preScoringEffects = getBossEffectsForPhase<PreScoringEffect>(boss, 'preScoring');
        const afterPreScoring = preScoringEffects.reduce(
          (score, effect) => 
            shouldApplyPreScoringEffect(effect, context.handsPlayed)
              ? applyPreScoringEffect(effect, score, context.handsPlayed)
              : score,
          scoringState.finalScore
        );
        
        // Apply scoring modifier effects
        const scoringModifierEffects = getBossEffectsForPhase<ScoringModifierEffect>(boss, 'scoringModifier');
        const modifiedScore = scoringModifierEffects.reduce((score, effect) => {
          switch (effect.type) {
            case 'onlyOneHandType':
              // If hand type doesn't match, score is 0
              return context.evaluatedHand && context.evaluatedHand.handType.name !== effect.handType
                ? 0
                : score;
            case 'capChips':
              return Math.min(score, effect.max);
            case 'noFaceCardBonus':
              // This would need to be handled in calculateScore, not here
              return score;
            case 'suitGivesNoChips':
              // This is handled in calculateBaseChipMult, not here
              return score;
          }
        }, afterPreScoring);
        
        return {
          ...scoringState,
          finalScore: modifiedScore,
        };
      })();
}

