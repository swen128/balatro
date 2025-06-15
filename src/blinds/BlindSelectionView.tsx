import React, { useState } from 'react';
import type { RunState } from '../game';
import type { BlindType } from './blind.ts';
import type { BossBlind } from './bossEffects.ts';
import { getBlindScoreGoal } from './blind.ts';
import { getCurrentBlindType } from '../game';
import { DeckViewer } from '../cards/DeckViewer.tsx';
import { ConsumablesDisplay } from '../round/ConsumablesDisplay.tsx';

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
    <div className="flex h-screen bg-gray-900">
      {/* Left sidebar */}
      <div className="w-[200px] bg-gray-950 p-4 flex flex-col gap-4">
        <div>
          <h3 className="text-xl font-bold">Ante {runState.ante}</h3>
          <p className="text-lg">Cash: ${runState.cash}</p>
        </div>
        
        {runState.jokers.length > 0 && (
          <div>
            <h4 className="text-lg mb-2">Jokers</h4>
            <div className="flex flex-col gap-2">
              {runState.jokers.map(joker => (
                <div key={joker.id} className="text-sm p-2 bg-gray-800 rounded">
                  {joker.name}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <ConsumablesDisplay
          consumables={runState.consumables}
          maxConsumables={runState.maxConsumables}
          onUseConsumable={() => {}}
          disabled={true}
        />
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 relative">
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
          <p className="text-xs text-amber-500 mt-1">{allBlinds.boss.effectDescription}</p>
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
      </div>
      
      {/* View Deck button at top right */}
      <button
        className="absolute top-4 right-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors text-sm"
        onClick={() => setShowDeck(true)}
      >
        View Deck
      </button>
      
        <DeckViewer
          deck={runState.deck}
          isOpen={showDeck}
          onClose={() => setShowDeck(false)}
        />
      </div>
    </div>
  );
}