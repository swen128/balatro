import type { Card, DrawPile } from '../cards';
import { drawCards, discardCards } from '../cards';
import type { EvaluatedHand, ChipMult, ScoringEffect } from '../scoring';
import { evaluatePokerHand, calculateBaseChipMult, calculateFinalScore, applyEffects, getCardEnhancementEffects, determineGlassBrokenCards } from '../scoring';
import type { BossBlind } from '../blinds';
import { applyBossEffectOnScoring } from '../blinds';
import type { Joker, JokerContext, MoneyEffect } from '../shop';
import { evaluateAllJokers, evaluateAllJokerMoneyEffects } from '../shop';
import type { HandLevels } from '../scoring';

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
  readonly handsPlayed: number;
  readonly discardsRemaining: number;
  readonly faceDownCardIds: ReadonlySet<string>;
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

export interface ScoringState extends BaseRoundState {
  readonly type: 'scoring';
  readonly playedCards: ReadonlyArray<Card>;
  readonly evaluatedHand: EvaluatedHand;
  readonly baseChipMult: ChipMult;
  readonly finalScore: number;
  readonly moneyGenerated?: number;
  readonly brokenGlassCards?: ReadonlyArray<Card>;
}

interface PlayedState extends BaseRoundState {
  readonly type: 'played';
  readonly lastHandScore: number;
  readonly brokenGlassCards?: ReadonlyArray<Card>;
}

interface RoundFinishedState extends BaseRoundState {
  readonly type: 'roundFinished';
  readonly won: boolean;
  readonly brokenGlassCards?: ReadonlyArray<Card>;
}

export function createRoundState(
  drawPile: DrawPile,
  scoreGoal: number,
  handsCount: number,
  handSize: number,
  discardsCount: number
): DrawingState {
  return {
    type: 'drawing',
    drawPile,
    hand: [],
    score: 0,
    scoreGoal,
    handsRemaining: handsCount,
    handSize,
    handsPlayed: 0,
    discardsRemaining: discardsCount,
    faceDownCardIds: new Set(),
  };
}

export function drawNewCards(state: RoundState): SelectingHandState {
  const currentHand = state.hand ?? [];
  const cardsNeeded = state.handSize - currentHand.length;
  const [drawnCards, newDrawPile] = drawCards(state.drawPile, cardsNeeded);
  
  return {
    ...state,
    type: 'selectingHand',
    drawPile: newDrawPile,
    hand: [...currentHand, ...drawnCards],
    selectedCardIds: new Set(),
  };
}

export function drawCardsToHand(state: DrawingState): SelectingHandState | RoundFinishedState {
  const cardsNeeded = state.handSize - state.hand.length;
  const [drawnCards, pile] = drawCards(state.drawPile, cardsNeeded);
  const newHand = [...state.hand, ...drawnCards];
  
  // Check if we're out of cards (empty hand and can't draw more)
  return newHand.length === 0 && pile.cards.length === 0 && pile.discardPile.length === 0
    ? {
        ...state,
        type: 'roundFinished',
        drawPile: pile,
        hand: newHand,
        won: false,
      }
    : {
        ...state,
        type: 'selectingHand',
        drawPile: pile,
        hand: newHand,
        selectedCardIds: new Set(),
      };
}

export function drawCardsToHandWithBossEffect(
  state: DrawingState,
  bossBlind: BossBlind | null
): SelectingHandState | RoundFinishedState {
  const baseState = drawCardsToHand(state);
  
  // If base state already resulted in round finished (out of cards), return it
  return baseState.type === 'roundFinished'
    ? baseState
    : !bossBlind
    ? baseState
    : ((): SelectingHandState | RoundFinishedState => {
        // Check for The Hook effect (discard random cards)
        const discardEffect = bossBlind.effects.find(
          e => e.kind === 'handSelection' && e.type === 'discardRandomCards'
        );
        
        const hookProcessedState = discardEffect && discardEffect.type === 'discardRandomCards' && baseState.hand.length > discardEffect.count
          ? ((): SelectingHandState => {
              const shuffled = [...baseState.hand].sort(() => Math.random() - 0.5);
              const remainingHand = shuffled.slice(discardEffect.count);
              const discardedCards = shuffled.slice(0, discardEffect.count);
              
              return {
                ...baseState,
                hand: remainingHand,
                drawPile: discardCards(baseState.drawPile, discardedCards),
              };
            })()
          : baseState;
        
        // Check if The Hook left us with no cards
        const outOfCards = hookProcessedState.hand.length === 0 && 
            hookProcessedState.drawPile.cards.length === 0 && 
            hookProcessedState.drawPile.discardPile.length === 0;
        
        return outOfCards
          ? {
              ...hookProcessedState,
              type: 'roundFinished' as const,
              won: false,
            }
          : ((): SelectingHandState => {
              // Check for The Fish effect (cards start face down)
              const faceDownEffect = bossBlind.effects.find(
                e => e.kind === 'cardVisibility' && e.type === 'cardsStartFaceDown'
              );
              
              return faceDownEffect
                ? {
                    ...hookProcessedState,
                    faceDownCardIds: new Set([...state.faceDownCardIds, ...hookProcessedState.hand.map(card => card.id)]),
                  }
                : hookProcessedState;
            })();
      })();
}

export function toggleCardSelection(
  state: SelectingHandState,
  cardId: string
): SelectingHandState {
  const newSelectedIds = new Set(state.selectedCardIds);
  
  return newSelectedIds.has(cardId)
    ? ((): SelectingHandState => {
        newSelectedIds.delete(cardId);
        return {
          ...state,
          selectedCardIds: newSelectedIds,
        };
      })()
    : newSelectedIds.size < 5
    ? ((): SelectingHandState => {
        newSelectedIds.add(cardId);
        return {
          ...state,
          selectedCardIds: newSelectedIds,
        };
      })()
    : state;
}

export function selectCard(state: SelectingHandState, cardId: string): SelectingHandState {
  const card = state.hand.find(c => c.id === cardId);
  
  return !card || state.selectedCardIds.has(cardId) || state.selectedCardIds.size >= 5
    ? state
    : {
        ...state,
        selectedCardIds: new Set([...state.selectedCardIds, cardId]),
      };
}

export function deselectCard(state: SelectingHandState, cardId: string): SelectingHandState {
  return state.selectedCardIds.has(cardId)
    ? {
        ...state,
        selectedCardIds: new Set(
          Array.from(state.selectedCardIds).filter(id => id !== cardId)
        ),
      }
    : state;
}

export function playSelectedCards(state: SelectingHandState): PlayingState | SelectingHandState {
  return state.selectedCardIds.size === 0
    ? state
    : ((): PlayingState => {
        const playedCards = state.hand.filter(card => state.selectedCardIds.has(card.id));
        const evaluatedHand = evaluatePokerHand(playedCards);
        
        // Remove played cards from face down set
        const newFaceDownIds = new Set(state.faceDownCardIds);
        playedCards.forEach(card => newFaceDownIds.delete(card.id));
        
        return {
          ...state,
          type: 'playing',
          playedCards,
          evaluatedHand,
          faceDownCardIds: newFaceDownIds,
        };
      })();
}

interface ScoreCalculation {
  readonly chipMult: ChipMult;
  readonly effects: ReadonlyArray<ScoringEffect>;
  readonly finalScore: number;
}

export function calculateScore(
  playedCards: ReadonlyArray<Card>,
  evaluatedHand: EvaluatedHand,
  jokers: ReadonlyArray<Joker>,
  bossBlind: BossBlind | null,
  handsPlayed: number,
  handLevels?: HandLevels,
  discardsRemaining?: number
): ScoreCalculation {
  const baseChipMult = calculateBaseChipMult(evaluatedHand, bossBlind, handLevels);
  
  // Apply enhancement effects from played cards
  const enhancementEffects = getCardEnhancementEffects(playedCards);
  
  // Apply joker effects
  const jokerContext: JokerContext = {
    playedCards,
    evaluatedHand,
    handsPlayed,
    ...(discardsRemaining !== undefined ? { discardsRemaining } : {}),
  };
  const jokerEffects = evaluateAllJokers(jokers, jokerContext);
  
  // Combine all effects
  const allEffects = [...enhancementEffects, ...jokerEffects];
  const finalChipMult = applyEffects(baseChipMult, allEffects);
  const finalScore = calculateFinalScore(finalChipMult);
  
  return {
    chipMult: baseChipMult,
    effects: allEffects,
    finalScore,
  };
}

export function scoreHand(
  state: PlayingState, 
  jokers: ReadonlyArray<Joker> = [], 
  bossBlind: BossBlind | null = null,
  handLevels?: HandLevels
): ScoringState {
  const calculation = calculateScore(
    state.playedCards,
    state.evaluatedHand,
    jokers,
    bossBlind,
    state.handsPlayed,
    handLevels,
    state.discardsRemaining
  );
  
  // Calculate money generated from jokers
  const heldCards = state.hand.filter(card => !state.playedCards.some(played => played.id === card.id));
  const jokerContext: JokerContext = {
    playedCards: state.playedCards,
    evaluatedHand: state.evaluatedHand,
    handsPlayed: state.handsPlayed,
    discardsRemaining: state.discardsRemaining,
    heldCards,
  };
  
  const moneyEffects: ReadonlyArray<MoneyEffect> = evaluateAllJokerMoneyEffects(jokers, jokerContext);
  const totalMoneyGenerated: number = moneyEffects.reduce((sum, effect) => sum + effect.amount, 0);
  
  return {
    ...state,
    type: 'scoring',
    baseChipMult: calculation.chipMult,
    finalScore: calculation.finalScore,
    ...(totalMoneyGenerated > 0 ? ({ moneyGenerated: totalMoneyGenerated } as const) : {}),
  };
}

export function scoreHandWithBossEffect(
  state: PlayingState,
  bossBlind: BossBlind | null,
  totalMoney: number,
  jokers: ReadonlyArray<Joker> = [],
  handLevels?: HandLevels
): ScoringState {
  const baseScoring = scoreHand(state, jokers, bossBlind, handLevels);
  
  return !bossBlind
    ? baseScoring
    : ((): ScoringState => {
        const modifiedScore = applyBossEffectOnScoring(baseScoring.finalScore, {
          bossBlind,
          handsPlayed: state.handsPlayed,
          totalMoney,
          evaluatedHand: state.evaluatedHand,
        });
        
        return {
          ...baseScoring,
          finalScore: modifiedScore,
        };
      })();
}

export function finishScoring(state: ScoringState): PlayedState | RoundFinishedState {
  const newScore = state.score + state.finalScore;
  const remainingCards = state.hand.filter(
    card => !state.playedCards.some(played => played.id === card.id)
  );
  const newDrawPile = discardCards(state.drawPile, state.playedCards);
  const newHandsRemaining = state.handsRemaining - 1;
  const newHandsPlayed = state.handsPlayed + 1;
  
  // Determine which glass cards broke
  const brokenGlassCards = determineGlassBrokenCards(state.playedCards);
  
  // Check if round is finished
  const baseState = {
    ...state,
    score: newScore,
    hand: remainingCards,
    drawPile: newDrawPile,
    handsRemaining: newHandsRemaining,
    handsPlayed: newHandsPlayed,
  };
  
  return newScore >= state.scoreGoal
    ? {
        ...baseState,
        type: 'roundFinished' as const,
        won: true,
        ...(brokenGlassCards.length > 0 ? { brokenGlassCards } : {}),
      }
    : newHandsRemaining <= 0
    ? {
        ...baseState,
        type: 'roundFinished' as const,
        handsRemaining: 0,
        won: false,
        ...(brokenGlassCards.length > 0 ? { brokenGlassCards } : {}),
      }
    : {
        ...baseState,
        type: 'played' as const,
        lastHandScore: state.finalScore,
        ...(brokenGlassCards.length > 0 ? { brokenGlassCards } : {}),
      };
}

export function continueToNextHand(state: PlayedState): DrawingState {
  return {
    ...state,
    type: 'drawing',
  };
}

export function discardSelectedCards(state: SelectingHandState): DrawingState | SelectingHandState {
  return state.selectedCardIds.size === 0 || state.discardsRemaining <= 0
    ? state
    : ((): DrawingState => {
        // Remove selected cards from hand
        const remainingCards = state.hand.filter(card => !state.selectedCardIds.has(card.id));
        const discardedCards = state.hand.filter(card => state.selectedCardIds.has(card.id));
        
        // Add discarded cards to discard pile
        const newDrawPile = discardCards(state.drawPile, discardedCards);
        
        return {
          ...state,
          type: 'drawing',
          hand: remainingCards,
          drawPile: newDrawPile,
          discardsRemaining: state.discardsRemaining - 1,
        };
      })();
}

;


// Utility functions
export function isRoundWon(state: RoundState): boolean {
  return state.score >= state.scoreGoal;
}

export function isRoundLost(state: RoundState): boolean {
  return state.score < state.scoreGoal && state.handsRemaining <= 0;
}