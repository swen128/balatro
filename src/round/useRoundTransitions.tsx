import { useEffect, useRef } from 'react';
import type { RoundState } from '../game/roundState.ts';
import type { BossBlind } from '../blinds';
import type { Joker } from '../shop/joker.ts';
import type { HandLevels } from '../scoring';
import { getNextRoundState } from './roundLogic.ts';

interface TransitionCallbacks {
  readonly onStateChange: (nextState: RoundState) => void;
  readonly onHandPlayed: (handType: string, score: number, moneyGenerated?: number) => void;
  readonly onRoundFinished: (won: boolean) => void;
}

export function useRoundTransitions(
  roundState: RoundState,
  money: number,
  jokers: ReadonlyArray<Joker>,
  handLevels: HandLevels,
  bossBlind: BossBlind | null,
  callbacks: TransitionCallbacks
): void {
  // Use refs to avoid re-running effect when callbacks change
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  useEffect(() => {
    const transition = getNextRoundState(roundState, bossBlind, money, jokers, handLevels);
    
    if (!transition) return;

    const timeoutId = setTimeout(() => {
      callbacksRef.current.onStateChange(transition.nextState);
      
      // Track hand statistics when transitioning from scoring to played
      if (roundState.type === 'scoring' && transition.nextState.type === 'played') {
        const scoringState = roundState;
        callbacksRef.current.onHandPlayed(
          scoringState.evaluatedHand.handType.name,
          scoringState.finalScore,
          scoringState.moneyGenerated
        );
      }
      
      // Handle round finished
      if (transition.nextState.type === 'roundFinished') {
        const finishedState = transition.nextState;
        setTimeout(() => {
          callbacksRef.current.onRoundFinished(finishedState.won);
        }, 2000);
      }
    }, transition.delayMs);
    
    return (): void => { clearTimeout(timeoutId); };
  }, [roundState, bossBlind, money, jokers, handLevels]);
}