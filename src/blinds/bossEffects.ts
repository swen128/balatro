type BossEffectType = 
  | HandSelectionEffect
  | PreScoringEffect
  | ScoringModifierEffect
  | PostScoringEffect
  | RoundEndEffect
  | CardVisibilityEffect;
type HandSelectionEffect = {
  readonly kind: 'handSelection';
} & (
  | { readonly type: 'discardRandomCards'; readonly count: number }
  | { readonly type: 'forceSuit'; readonly suit: string }
  | { readonly type: 'maxCardSelection'; readonly max: number }
  | { readonly type: 'preventCardPlay'; readonly rank: string }
  | { readonly type: 'exactCardCount'; readonly count: number }
);
type PreScoringEffect = {
  readonly kind: 'preScoring';
} & (
  | { readonly type: 'firstHandScoresZero' }
  | { readonly type: 'debuffAllCardsInHand' }
  | { readonly type: 'removeAllSuits' }
);
type ScoringModifierEffect = {
  readonly kind: 'scoringModifier';
} & (
  | { readonly type: 'capChips'; readonly max: number }
  | { readonly type: 'noFaceCardBonus' }
  | { readonly type: 'onlyOneHandType'; readonly handType: string }
  | { readonly type: 'suitGivesNoChips'; readonly suit: string }
);
type PostScoringEffect = {
  readonly kind: 'postScoring';
} & (
  | { readonly type: 'setMoneyToZero'; readonly condition: 'mostPlayedHand' }
  | { readonly type: 'loseMoneyPerCard'; readonly amount: number }
);
type RoundEndEffect = {
  readonly kind: 'roundEnd';
  readonly type: 'gainMoneyIfCondition';
  readonly condition: string;
  readonly amount: number;
};
type CardVisibilityEffect = {
  readonly kind: 'cardVisibility';
  readonly type: 'cardsStartFaceDown';
};
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



interface BossEffectContext {
  readonly bossBlind: BossBlind;
  readonly handsPlayed: number;
  readonly totalMoney: number;
  readonly evaluatedHand?: { readonly handType: { readonly name: string } };
}

export function applyBossEffectOnScoring(
  finalScore: number,
  context: BossEffectContext  
): number {
  const boss = context.bossBlind;
  
  const preScoringEffects = boss.effects.filter(e => e.kind === 'preScoring');
  const afterPreScoring = preScoringEffects.reduce(
    (score, effect) => 
      effect.kind === 'preScoring' && shouldApplyPreScoringEffect(effect, context.handsPlayed)
        ? applyPreScoringEffect(effect, score, context.handsPlayed)
        : score,
    finalScore
  );
  
  const scoringModifierEffects = boss.effects.filter(e => e.kind === 'scoringModifier');
  const modifiedScore = scoringModifierEffects.reduce((score, effect) => {
    switch (effect.type) {
      case 'onlyOneHandType':
        return context.evaluatedHand && context.evaluatedHand.handType.name !== effect.handType
          ? 0
          : score;
      case 'capChips':
        return Math.min(score, effect.max);
      case 'noFaceCardBonus':
        return score;
      case 'suitGivesNoChips':
        return score;
    }
  }, afterPreScoring);
  
  return modifiedScore;
}

