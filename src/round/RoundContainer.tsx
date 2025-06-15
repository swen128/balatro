import React, { useState, useEffect, useCallback } from 'react';
import type { PlayingRoundState } from '../game/gameState.ts';
import type { RoundState } from '../game/roundState.ts';
import { 
  getNextRoundState, 
  canPlayHand, 
  handleCardClick, 
  handlePlayHand,
  handleDiscardCards,
  canDiscardCards,
  isRoundFinished
} from './roundLogic.ts';
import { RoundView } from './RoundView.tsx';
import { useStatisticsContext } from '../statistics/StatisticsContext.tsx';

interface RoundContainerProps {
  readonly gameState: PlayingRoundState;
  readonly onWin: () => void;
  readonly onLose: () => void;
}

export function RoundContainer({ gameState, onWin, onLose }: RoundContainerProps): React.ReactElement {
  const [roundState, setRoundState] = useState<RoundState>(gameState.roundState);
  const [money, setMoney] = useState<number>(gameState.runState.cash);
  const [isDiscarding, setIsDiscarding] = useState<boolean>(false);
  const stats = useStatisticsContext();
  
  const bossBlind = gameState.blind.isBoss ? gameState.blind : null;

  useEffect(() => {
    const transition = getNextRoundState(roundState, bossBlind, money, gameState.runState.jokers);
    
    if (transition) {
      const timeoutId = setTimeout(() => {
        setRoundState(transition.nextState);
        
        if (transition.shouldResetMoney === true) {
          setMoney(0);
        }
        
        // Track hand statistics when transitioning from scoring to played
        if (roundState.type === 'scoring' && transition.nextState.type === 'played') {
          const scoringState = roundState;
          stats.trackHandPlayed(
            scoringState.evaluatedHand.handType.name,
            scoringState.finalScore
          );
        }
        
        // Handle round finished
        if (isRoundFinished(transition.nextState)) {
          const finishedState = transition.nextState;
          setTimeout(() => {
            if (finishedState.won) {
              onWin();
            } else {
              onLose();
            }
          }, 2000);
        }
      }, transition.delayMs);
      
      return (): void => { clearTimeout(timeoutId); };
    }
    
    return undefined;
  }, [roundState, bossBlind, money, gameState.runState.jokers, onWin, onLose, stats]);

  const handleCardClickCallback = useCallback((cardId: string): void => {
    const newState = handleCardClick(roundState, cardId);
    if (newState) {
      setRoundState(newState);
    }
  }, [roundState]);

  const handlePlayHandCallback = useCallback((): void => {
    const newState = handlePlayHand(roundState);
    if (newState) {
      setRoundState(newState);
    }
  }, [roundState]);

  const handleDiscardCardsCallback = useCallback((): void => {
    setIsDiscarding(true);
    setTimeout(() => {
      const newState = handleDiscardCards(roundState);
      if (newState) {
        setRoundState(newState);
        setIsDiscarding(false);
      }
    }, 600); // Wait for discard animation
  }, [roundState]);

  return (
    <RoundView
      roundState={roundState}
      runState={gameState.runState}
      blind={gameState.blind}
      bossEffect={gameState.bossEffect}
      onCardClick={handleCardClickCallback}
      onPlayHand={handlePlayHandCallback}
      onDiscardCards={handleDiscardCardsCallback}
      canPlayHand={canPlayHand(roundState, bossBlind)}
      canDiscardCards={canDiscardCards(roundState)}
      isDiscarding={isDiscarding}
    />
  );
}