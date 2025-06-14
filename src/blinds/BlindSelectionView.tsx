import React, { useState } from 'react';
import type { RunState } from '../game';
import type { BlindType, BossBlind } from './blind.ts';
import { getBlindScoreGoal } from './blind.ts';
import { getCurrentBlindType } from '../game';
import { DeckViewer } from '../cards/DeckViewer.tsx';

interface BlindSelectionProps {
  readonly runState: RunState;
  readonly allBlinds: {
    readonly small: BlindType;
    readonly big: BlindType;
    readonly boss: BossBlind;
  };
  readonly onSelect: () => void;
  readonly onSkip: () => void;
}

export function BlindSelectionView({ runState, allBlinds, onSelect, onSkip }: BlindSelectionProps): React.ReactElement {
  const [showDeck, setShowDeck] = useState(false);
  const currentBlindType = getCurrentBlindType(runState);
  const canSkip = currentBlindType !== 'boss';

  const getBlindStatus = (blindType: 'small' | 'big' | 'boss'): 'completed' | 'current' | 'upcoming' => {
    const progression = runState.blindProgression;
    
    if (blindType === 'small') {
      if (progression.type === 'smallBlindUpcoming') return 'current';
      if (progression.type === 'bigBlindUpcoming' && progression.smallBlindDefeated) return 'completed';
      if (progression.type === 'bigBlindUpcoming' && progression.smallBlindSkipped) return 'completed';
      if (progression.type === 'bossBlindUpcoming' && (progression.smallBlindDefeated || progression.smallBlindSkipped)) return 'completed';
      return 'upcoming';
    }
    
    if (blindType === 'big') {
      if (progression.type === 'smallBlindUpcoming') return 'upcoming';
      if (progression.type === 'bigBlindUpcoming') return 'current';
      if (progression.type === 'bossBlindUpcoming' && (progression.bigBlindDefeated || progression.bigBlindSkipped)) return 'completed';
      return 'upcoming';
    }
    
    if (blindType === 'boss') {
      if (progression.type === 'bossBlindUpcoming') return 'current';
      return 'upcoming';
    }
    
    return 'upcoming';
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4">Ante {runState.ante}</h2>
        <p className="text-xl">Cash: ${runState.cash}</p>
      </div>

      {/* Display all three blinds */}
      <div className="flex gap-4 mb-8">
        {/* Small Blind */}
        <div className={`border-2 rounded-lg p-4 text-center ${
          getBlindStatus('small') === 'completed' ? 'border-green-600 opacity-50' :
          getBlindStatus('small') === 'current' ? 'border-blue-600' :
          'border-gray-600'
        }`}>
          <h4 className="text-lg font-semibold mb-2">{allBlinds.small.name}</h4>
          <p className="text-sm">Goal: {getBlindScoreGoal(runState.ante, allBlinds.small)}</p>
          <p className="text-sm">Reward: ${allBlinds.small.cashReward}</p>
          {getBlindStatus('small') === 'completed' && (
            <p className="text-sm text-green-500 mt-2">✓ Completed</p>
          )}
        </div>

        {/* Big Blind */}
        <div className={`border-2 rounded-lg p-4 text-center ${
          getBlindStatus('big') === 'completed' ? 'border-green-600 opacity-50' :
          getBlindStatus('big') === 'current' ? 'border-blue-600' :
          'border-gray-600'
        }`}>
          <h4 className="text-lg font-semibold mb-2">{allBlinds.big.name}</h4>
          <p className="text-sm">Goal: {getBlindScoreGoal(runState.ante, allBlinds.big)}</p>
          <p className="text-sm">Reward: ${allBlinds.big.cashReward}</p>
          {getBlindStatus('big') === 'completed' && (
            <p className="text-sm text-green-500 mt-2">✓ Completed</p>
          )}
        </div>

        {/* Boss Blind */}
        <div className={`border-2 rounded-lg p-4 text-center ${
          getBlindStatus('boss') === 'completed' ? 'border-green-600 opacity-50' :
          getBlindStatus('boss') === 'current' ? 'border-red-600' :
          'border-gray-600'
        }`}>
          <h4 className="text-lg font-semibold mb-2">{allBlinds.boss.name}</h4>
          <p className="text-sm">Goal: {getBlindScoreGoal(runState.ante, allBlinds.boss)}</p>
          <p className="text-sm">Reward: ${allBlinds.boss.cashReward}</p>
          <p className="text-xs text-amber-500 mt-1">{allBlinds.boss.effect}</p>
          {getBlindStatus('boss') === 'completed' && (
            <p className="text-sm text-green-500 mt-2">✓ Completed</p>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={onSelect} className="px-6 py-3 text-xl bg-blue-500 hover:bg-blue-600 rounded transition-colors">
          Play
        </button>
        {canSkip && (
          <button
            onClick={onSkip}
            className="px-6 py-3 text-xl bg-gray-500 hover:bg-gray-600 rounded transition-colors"
          >
            Skip
          </button>
        )}
        <button
          onClick={() => setShowDeck(true)}
          className="px-6 py-3 text-xl bg-purple-500 hover:bg-purple-600 rounded transition-colors"
        >
          View Deck
        </button>
      </div>
      
      <DeckViewer
        deck={runState.deck}
        isOpen={showDeck}
        onClose={() => setShowDeck(false)}
      />
    </div>
  );
}