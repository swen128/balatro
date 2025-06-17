import React, { useState } from 'react';
import type { RunState, BlindStatus } from '../game';
import type { BlindType } from './blind.ts';
import type { BossBlind } from './bossEffects.ts';
import { getBlindScoreGoal, SMALL_BLIND, BIG_BLIND } from './blind.ts';
import { getCurrentBlindType, getBlindStatus } from '../game';
import { DeckViewer } from '../cards/DeckViewer.tsx';
import { ConsumablesDisplay } from '../round/ConsumablesDisplay.tsx';

interface BlindSelectionProps {
  readonly runState: RunState;
  readonly onSelect: () => void;
  readonly onSkip: () => void;
}

interface BlindDisplayProps {
  readonly blind: BlindType | BossBlind;
  readonly status: BlindStatus;
  readonly ante: number;
  readonly effectDescription?: string;
}

function BlindDisplay({ blind, status, ante, effectDescription }: BlindDisplayProps): React.ReactElement {
  const borderClass = ((): string => {
    switch (status) {
      case 'completed':
        return 'border-green-600 opacity-50';
      case 'current':
        return blind.isBoss ? 'border-red-600' : 'border-blue-600';
      case 'upcoming':
        return 'border-gray-600';
    }
  })();

  return (
    <div className={`border-2 rounded-lg p-4 text-center ${borderClass}`}>
      <h4 className="text-lg font-semibold mb-2">{blind.name}</h4>
      <p className="text-sm">Goal: {getBlindScoreGoal(ante, blind)}</p>
      <p className="text-sm">Reward: ${blind.cashReward}</p>
      {effectDescription !== undefined && (
        <p className="text-xs text-amber-500 mt-1">{effectDescription}</p>
      )}
      {status === 'completed' && (
        <p className="text-sm text-green-500 mt-2">✓ Completed</p>
      )}
    </div>
  );
}

export function BlindSelectionView({ runState, onSelect, onSkip }: BlindSelectionProps): React.ReactElement {
  const [showDeck, setShowDeck] = useState(false);
  const currentBlindType = getCurrentBlindType(runState);
  const canSkip = currentBlindType !== 'boss';

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
        <BlindDisplay
          blind={SMALL_BLIND}
          status={getBlindStatus(runState, 'small')}
          ante={runState.ante}
        />
        <BlindDisplay
          blind={BIG_BLIND}
          status={getBlindStatus(runState, 'big')}
          ante={runState.ante}
        />
        <BlindDisplay
          blind={runState.anteBossBlind}
          status={getBlindStatus(runState, 'boss')}
          ante={runState.ante}
          effectDescription={runState.anteBossBlind.effectDescription}
        />
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