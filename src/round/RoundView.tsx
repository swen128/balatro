import React, { useState } from 'react';
import type { RoundState } from '../game/roundState.ts';
import type { RunState } from '../game/runState.ts';
import type { BlindType, BossBlind } from '../blinds';
import type { Card } from '../cards/card.ts';
import { Hand } from './Hand.tsx';
import { ScoreDisplay } from '../scoring/ScoreDisplay.tsx';
import { SelectedHandDisplay } from './SelectedHandDisplay.tsx';
import { JokerDisplay } from './JokerDisplay.tsx';
import { ScoringBreakdown } from '../scoring/ScoringBreakdown.tsx';
import { DeckViewer } from '../cards/DeckViewer.tsx';
import { useSound } from '../sound';

interface RoundViewProps {
  readonly roundState: RoundState;
  readonly runState: RunState;
  readonly blind: BlindType | BossBlind;
  readonly bossEffect: string | null;
  readonly onCardClick: (cardId: string) => void;
  readonly onPlayHand: () => void;
  readonly onDiscardCards: () => void;
  readonly canPlayHand: boolean;
  readonly canDiscardCards: boolean;
  readonly isDiscarding: boolean;
}

export function RoundView({
  roundState,
  runState,
  blind,
  bossEffect,
  onCardClick,
  onPlayHand,
  onDiscardCards,
  canPlayHand,
  canDiscardCards,
  isDiscarding: isDiscardingProp,
}: RoundViewProps): React.ReactElement {
  const [showDeckViewer, setShowDeckViewer] = useState(false);
  const sound = useSound();
  
  const handleCardClick = (cardId: string): void => {
    sound.play('cardSelect');
    onCardClick(cardId);
  };
  
  const handlePlayHand = (): void => {
    sound.play('cardPlay');
    onPlayHand();
  };
  
  const handleDiscardCards = (): void => {
    sound.play('cardDiscard');
    onDiscardCards();
  };
  const renderStatusText = (): React.ReactNode => {
    switch (roundState.type) {
      case 'drawing':
        return 'Drawing cards...';
      case 'selectingHand':
        return 'Select up to 5 cards';
      case 'playing':
        return 'Playing hand...';
      case 'scoring':
        return 'Scoring...';
      case 'played':
        return `Scored ${roundState.lastHandScore} points!`;
      case 'roundFinished':
        return (
          <div className="text-center">
            {roundState.won ? (
              <>
                <div className="text-3xl text-green-500 mb-4">Round Won!</div>
                <div className="text-xl">Cash Reward: ${blind.cashReward}</div>
              </>
            ) : (
              <div className="text-3xl text-red-500">Round Lost!</div>
            )}
          </div>
        );
    }
  };

  const renderScoringDisplay = (): React.ReactNode => {
    if (roundState.type !== 'scoring') return null;
    
    return <ScoringBreakdown scoringState={roundState} jokers={runState.jokers} />;
  };

  const getSelectedCardIds = (): ReadonlySet<string> => {
    return roundState.type === 'selectingHand' ? roundState.selectedCardIds : new Set();
  };

  const getPlayedCards = (): ReadonlyArray<Card> => {
    return (roundState.type === 'playing' || roundState.type === 'scoring') 
      ? roundState.playedCards 
      : [];
  };

  const isPlaying = roundState.type === 'playing' || roundState.type === 'scoring';
  const isDrawing = roundState.type === 'drawing';
  const isDiscarding = isDiscardingProp;

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Left sidebar */}
      <div className="w-[200px] bg-gray-950 p-4 flex flex-col gap-4">
        <ScoreDisplay
          score={roundState.score}
          scoreGoal={roundState.scoreGoal}
          handsRemaining={roundState.handsRemaining}
          discardsRemaining={roundState.discardsRemaining}
          ante={runState.ante}
          blind={blind}
          bossEffect={bossEffect}
        />
        
        {/* Selected hand evaluation - always show in sidebar */}
        <SelectedHandDisplay 
          selectedCards={
            roundState.type === 'selectingHand' 
              ? roundState.hand.filter(card => roundState.selectedCardIds.has(card.id))
              : (roundState.type === 'playing' || roundState.type === 'scoring')
                ? roundState.playedCards
                : []
          }
        />
        
        {/* Joker display */}
        <JokerDisplay 
          jokers={runState.jokers}
          maxJokers={runState.maxJokers}
        />
      </div>

      {/* Main game area */}
      <div className="flex-1 flex flex-col p-8 relative">
        {/* Status text - at the top */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-xl text-gray-500 mb-8">
            {renderStatusText()}
          </div>
          
          {/* Scoring area - centered in main area */}
          {renderScoringDisplay()}
        </div>

        {/* Bottom area with cards and actions */}
        <div className="flex flex-col items-center">
          {/* Hand display */}
          <Hand
            cards={roundState.hand}
            selectedCardIds={getSelectedCardIds()}
            playedCards={getPlayedCards()}
            onCardClick={handleCardClick}
            isPlaying={isPlaying}
            isDrawing={isDrawing}
            isDiscarding={isDiscarding}
            isScoring={roundState.type === 'scoring'}
          />

          {/* Action buttons below cards */}
          {roundState.type === 'selectingHand' && (
            <div className="flex gap-4 mt-4">
              <button
                onClick={handlePlayHand}
                disabled={!canPlayHand}
                className="text-xl px-8 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors"
              >
                Play Hand
              </button>
              <button
                onClick={handleDiscardCards}
                disabled={!canDiscardCards}
                className="text-xl px-8 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors"
              >
                Discard ({roundState.discardsRemaining})
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Menu buttons */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors text-sm"
          onClick={() => setShowDeckViewer(true)}
        >
          View Deck
        </button>
        <button
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors text-sm"
          onClick={() => window.location.reload()}
        >
          Return to Menu
        </button>
      </div>
      
      {/* Deck Viewer Modal */}
      <DeckViewer
        deck={runState.deck}
        isOpen={showDeckViewer}
        onClose={() => setShowDeckViewer(false)}
      />
    </div>
  );
}