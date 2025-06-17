import type { RunState } from './runState.ts';
import type { RoundState } from './roundState.ts';
import type { BlindType, BossBlind } from '../blinds';
import { SMALL_BLIND, getBlindScoreGoal } from '../blinds';
import { createInitialRunState, getCurrentBlindType, skipBlind, defeatBlind, addJoker, WINNING_ANTE, updateDeck, getCurrentBlind } from './runState.ts';
import { createRoundState } from './roundState.ts';
import { createDrawPile } from '../cards/drawPile.ts';
import { JOKERS } from '../shop/joker.ts';

export type GameState =
  | MainMenuState
  | SelectingBlindState
  | PlayingRoundState
  | ShopState
  | VictoryState
  | GameOverState;

interface MainMenuState {
  readonly type: 'mainMenu';
}

interface SelectingBlindState {
  readonly type: 'selectingBlind';
  readonly runState: RunState;
  readonly availableBlind: BlindType | BossBlind;
  readonly bossEffect: string | null;
}

export interface PlayingRoundState {
  readonly type: 'playingRound';
  readonly runState: RunState;
  readonly roundState: RoundState;
  readonly blind: BlindType | BossBlind;
  readonly bossEffect: string | null;
}

interface ShopState {
  readonly type: 'shop';
  readonly runState: RunState;
}

export interface VictoryState {
  readonly type: 'victory';
  readonly runState: RunState;
  readonly finalScore: number;
}

interface GameOverState {
  readonly type: 'gameOver';
  readonly runState: RunState;
  readonly finalScore: number;
}

export function createMainMenuState(): GameState {
  return {
    type: 'mainMenu',
  };
}

export function startNewRun(): GameState {
  const initialRunState = createInitialRunState();
  
  // Add some test jokers for demonstration
  const joker1 = JOKERS[0];
  const joker2 = JOKERS[2];
  const runStateWithJoker1 = joker1 ? addJoker(initialRunState, joker1) : initialRunState;
  const runState = joker2 ? addJoker(runStateWithJoker1, joker2) : runStateWithJoker1;
  
  return {
    type: 'selectingBlind',
    runState,
    availableBlind: SMALL_BLIND,
    bossEffect: null,
  };
}

export function selectBlind(state: SelectingBlindState): PlayingRoundState {
  const drawPile = createDrawPile(state.runState.deck);
  const scoreGoal = getBlindScoreGoal(state.runState.ante, state.availableBlind);
  const roundState = createRoundState(
    drawPile,
    scoreGoal,
    state.runState.handsCount,
    state.runState.handSize,
    state.runState.discardsCount
  );
  
  return {
    type: 'playingRound',
    runState: state.runState,
    roundState,
    blind: state.availableBlind,
    bossEffect: state.bossEffect,
  };
}

export function skipBlindFromSelectScreen(state: SelectingBlindState): SelectingBlindState {
  const blindType = getCurrentBlindType(state.runState);
  
  // Cannot skip boss blind
  return blindType === 'boss' 
    ? state
    : ((): SelectingBlindState => {
        const newRunState = skipBlind(state.runState);
        const availableBlind = getCurrentBlind(newRunState);
        const bossEffect = availableBlind.isBoss ? availableBlind.effectDescription : null;
        
        return {
          ...state,
          runState: newRunState,
          availableBlind,
          bossEffect,
        };
      })();
}

export function winRound(state: PlayingRoundState): ShopState | VictoryState {
  const cashReward = state.blind.cashReward;
  const baseRunState = defeatBlind(state.runState, cashReward);
  
  // Check if any glass cards broke in the final round state
  const brokenCards = state.roundState.type === 'roundFinished' && state.roundState.brokenGlassCards
    ? state.roundState.brokenGlassCards
    : [];
    
  // Remove broken glass cards from the deck
  const newRunState = brokenCards.length > 0
    ? ((): RunState => {
        const brokenCardIds = new Set(brokenCards.map(card => card.id));
        const updatedDeck = baseRunState.deck.filter(card => !brokenCardIds.has(card.id));
        return updateDeck(baseRunState, updatedDeck);
      })()
    : baseRunState;
  
  // Check if we just defeated the winning ante boss blind
  return state.runState.ante === WINNING_ANTE && state.runState.blindProgression.type === 'bossBlindUpcoming'
    ? {
        type: 'victory',
        runState: newRunState,
        finalScore: newRunState.cash + newRunState.round * 100, // Basic scoring formula
      }
    : {
        type: 'shop',
        runState: newRunState,
      };
}

export function loseRound(state: PlayingRoundState): GameOverState {
  // Calculate final score based on current score when losing
  const finalScore = state.roundState.type === 'roundFinished' && !state.roundState.won
    ? state.roundState.score
    : state.roundState.score;
    
  return {
    type: 'gameOver',
    runState: state.runState,
    finalScore,
  };
}

export function returnToMenu(): GameState {
  return createMainMenuState();
}

export function continueEndlessMode(state: VictoryState): ShopState {
  // Continue playing after defeating ante 8
  // The run state already has ante incremented to 9 from defeatBlind
  return {
    type: 'shop',
    runState: state.runState,
  };
}

export function leaveShop(state: ShopState): SelectingBlindState {
  const availableBlind = getCurrentBlind(state.runState);
  const bossEffect = availableBlind.isBoss ? availableBlind.effectDescription : null;
  
  return {
    type: 'selectingBlind',
    runState: state.runState,
    availableBlind,
    bossEffect,
  };
}