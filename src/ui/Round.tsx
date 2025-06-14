import React, { useState, useEffect } from 'react';
import type { PlayingRoundState } from '../domain/gameState.ts';
import type { RoundState } from '../domain/roundState.ts';
import {
  drawCardsToHand,
  drawCardsToHandWithBossEffect,
  toggleCardSelection,
  playSelectedCards,
  scoreHand,
  scoreHandWithBossEffect,
  finishScoring,
  continueToNextHand,
  shouldResetMoney,
} from '../domain/roundState.ts';
import { Hand } from './Hand.tsx';
import { ScoreDisplay } from './ScoreDisplay.tsx';

interface RoundProps {
  readonly gameState: PlayingRoundState;
  readonly onWin: () => void;
  readonly onLose: () => void;
}

export function Round({ gameState, onWin, onLose }: RoundProps): React.ReactElement {
  const [roundState, setRoundState] = useState<RoundState>(gameState.roundState);
  const [money, setMoney] = useState<number>(gameState.runState.cash);
  
  const bossBlind = gameState.blind.isBoss ? gameState.blind : null;

  useEffect(() => {
    // Handle automatic state transitions
    if (roundState.type === 'drawing') {
      const timeoutId = setTimeout(() => {
        if (bossBlind) {
          setRoundState(drawCardsToHandWithBossEffect(roundState, bossBlind, money));
        } else {
          setRoundState(drawCardsToHand(roundState));
        }
      }, 500);
      return (): void => { clearTimeout(timeoutId); };
    }

    if (roundState.type === 'playing') {
      const timeoutId = setTimeout(() => {
        if (bossBlind) {
          const scoringState = scoreHandWithBossEffect(roundState, bossBlind, money);
          setRoundState(scoringState);
          
          // Check if The Ox effect should reset money
          if (shouldResetMoney(scoringState, bossBlind)) {
            setMoney(0);
          }
        } else {
          setRoundState(scoreHand(roundState));
        }
      }, 1000);
      return (): void => { clearTimeout(timeoutId); };
    }

    if (roundState.type === 'scoring') {
      const timeoutId = setTimeout(() => {
        const nextState = finishScoring(roundState);
        setRoundState(nextState);
        
        if (nextState.type === 'roundFinished') {
          if (nextState.won) {
            onWin();
          } else {
            onLose();
          }
        }
      }, 2000);
      return (): void => { clearTimeout(timeoutId); };
    }

    if (roundState.type === 'played') {
      const timeoutId = setTimeout(() => {
        setRoundState(continueToNextHand(roundState));
      }, 1000);
      return (): void => { clearTimeout(timeoutId); };
    }
    
    return undefined;
  }, [roundState, onWin, onLose, bossBlind, money]);

  const handleCardClick = (cardId: string): void => {
    if (roundState.type === 'selectingHand') {
      setRoundState(toggleCardSelection(roundState, cardId));
    }
  };

  const handlePlayHand = (): void => {
    if (roundState.type === 'selectingHand') {
      const nextState = playSelectedCards(roundState);
      setRoundState(nextState);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Left sidebar */}
      <div className="w-[200px] bg-gray-950 p-4 flex flex-col gap-4">
        <ScoreDisplay
          score={roundState.score}
          scoreGoal={roundState.scoreGoal}
          handsRemaining={roundState.handsRemaining}
          ante={gameState.runState.ante}
          blind={gameState.blind}
          bossEffect={gameState.bossEffect}
        />
      </div>

      {/* Main game area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Scoring area */}
        {roundState.type === 'scoring' && (
          <div className="mb-16 text-center">
            <h3 className="text-2xl mb-4">
              {roundState.evaluatedHand.handType.name}
            </h3>
            <div className="text-3xl">
              {roundState.baseChipMult.chips} × {roundState.baseChipMult.mult} = {roundState.finalScore}
            </div>
          </div>
        )}

        {/* Hand display */}
        <Hand
          cards={roundState.hand}
          selectedCardIds={roundState.type === 'selectingHand' ? roundState.selectedCardIds : new Set()}
          playedCards={roundState.type === 'playing' || roundState.type === 'scoring' ? roundState.playedCards : []}
          onCardClick={handleCardClick}
          isPlaying={roundState.type === 'playing' || roundState.type === 'scoring'}
        />

        {/* Play button */}
        {roundState.type === 'selectingHand' && (
          <button
            onClick={handlePlayHand}
            disabled={roundState.selectedCardIds.size === 0}
            className="mt-8 text-xl px-8 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors"
          >
            Play Hand
          </button>
        )}

        {/* Status text */}
        <div className="mt-8 text-xl text-gray-500">
          {roundState.type === 'drawing' && 'Drawing cards...'}
          {roundState.type === 'selectingHand' && 'Select up to 5 cards'}
          {roundState.type === 'playing' && 'Playing hand...'}
          {roundState.type === 'scoring' && 'Scoring...'}
          {roundState.type === 'played' && `Scored ${roundState.lastHandScore} points!`}
        </div>
      </div>
    </div>
  );
}