import type { Card } from './card.ts';
import type { DrawPile } from './drawPile.ts';
import { drawCards, discardCards } from './drawPile.ts';
import type { EvaluatedHand } from './pokerHands.ts';
import { evaluatePokerHand } from './pokerHands.ts';
import type { ChipMult } from './scoring.ts';
import { calculateBaseChipMult, calculateFinalScore, applyEffects } from './scoring.ts';

export type RoundState = 
  | DrawingState
  | SelectingHandState
  | PlayingState
  | ScoringState
  | PlayedState
  | RoundFinishedState;

interface BaseRoundState {
  readonly drawPile: DrawPile;
  readonly hand: ReadonlyArray<Card>;
  readonly score: number;
  readonly scoreGoal: number;
  readonly handsRemaining: number;
  readonly handSize: number;
}

interface DrawingState extends BaseRoundState {
  readonly type: 'drawing';
}

interface SelectingHandState extends BaseRoundState {
  readonly type: 'selectingHand';
  readonly selectedCardIds: ReadonlySet<string>;
}

interface PlayingState extends BaseRoundState {
  readonly type: 'playing';
  readonly playedCards: ReadonlyArray<Card>;
  readonly evaluatedHand: EvaluatedHand;
}

interface ScoringState extends BaseRoundState {
  readonly type: 'scoring';
  readonly playedCards: ReadonlyArray<Card>;
  readonly evaluatedHand: EvaluatedHand;
  readonly baseChipMult: ChipMult;
  readonly finalScore: number;
}

interface PlayedState extends BaseRoundState {
  readonly type: 'played';
  readonly lastHandScore: number;
}

interface RoundFinishedState extends BaseRoundState {
  readonly type: 'roundFinished';
  readonly won: boolean;
}

export function createRoundState(
  drawPile: DrawPile,
  scoreGoal: number,
  handsCount: number,
  handSize: number
): RoundState {
  return {
    type: 'drawing',
    drawPile,
    hand: [],
    score: 0,
    scoreGoal,
    handsRemaining: handsCount,
    handSize,
  };
}

export function drawCardsToHand(state: DrawingState): SelectingHandState {
  const cardsNeeded = state.handSize - state.hand.length;
  const [drawnCards, pile] = drawCards(state.drawPile, cardsNeeded);
  
  return {
    ...state,
    type: 'selectingHand',
    drawPile: pile,
    hand: [...state.hand, ...drawnCards],
    selectedCardIds: new Set(),
  };
}

export function toggleCardSelection(
  state: SelectingHandState,
  cardId: string
): SelectingHandState {
  const newSelectedIds = new Set(state.selectedCardIds);
  
  if (newSelectedIds.has(cardId)) {
    newSelectedIds.delete(cardId);
  } else {
    if (newSelectedIds.size < 5) {
      newSelectedIds.add(cardId);
    }
  }
  
  return {
    ...state,
    selectedCardIds: newSelectedIds,
  };
}

export function playSelectedCards(state: SelectingHandState): PlayingState | SelectingHandState {
  if (state.selectedCardIds.size === 0) {
    return state; // Can't play with no cards selected
  }
  
  const playedCards = state.hand.filter(card => state.selectedCardIds.has(card.id));
  const evaluatedHand = evaluatePokerHand(playedCards);
  
  return {
    ...state,
    type: 'playing',
    playedCards,
    evaluatedHand,
  };
}

export function scoreHand(state: PlayingState): ScoringState {
  const baseChipMult = calculateBaseChipMult(state.evaluatedHand);
  // In the future, additional effects would be applied here
  const finalChipMult = applyEffects(baseChipMult, []);
  const finalScore = calculateFinalScore(finalChipMult);
  
  return {
    ...state,
    type: 'scoring',
    baseChipMult,
    finalScore,
  };
}

export function finishScoring(state: ScoringState): PlayedState | RoundFinishedState {
  const newScore = state.score + state.finalScore;
  const remainingCards = state.hand.filter(
    card => !state.playedCards.some(played => played.id === card.id)
  );
  const newDrawPile = discardCards(state.drawPile, state.playedCards);
  const newHandsRemaining = state.handsRemaining - 1;
  
  // Check if round is finished
  if (newScore >= state.scoreGoal) {
    return {
      ...state,
      type: 'roundFinished',
      score: newScore,
      hand: remainingCards,
      drawPile: newDrawPile,
      handsRemaining: newHandsRemaining,
      won: true,
    };
  }
  
  if (newHandsRemaining <= 0) {
    return {
      ...state,
      type: 'roundFinished',
      score: newScore,
      hand: remainingCards,
      drawPile: newDrawPile,
      handsRemaining: 0,
      won: false,
    };
  }
  
  return {
    ...state,
    type: 'played',
    score: newScore,
    hand: remainingCards,
    drawPile: newDrawPile,
    handsRemaining: newHandsRemaining,
    lastHandScore: state.finalScore,
  };
}

export function continueToNextHand(state: PlayedState): DrawingState {
  return {
    ...state,
    type: 'drawing',
  };
}