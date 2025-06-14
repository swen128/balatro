import React from 'react';
import type { RunState } from '../domain/runState.ts';
import type { BlindType } from '../domain/blind.ts';
import { getBlindScoreGoal } from '../domain/blind.ts';
import { getCurrentBlindType } from '../domain/runState.ts';

interface BlindSelectionProps {
  readonly runState: RunState;
  readonly blind: BlindType;
  readonly bossEffect: string | null;
  readonly onSelect: () => void;
  readonly onSkip: () => void;
}

export function BlindSelection({ runState, blind, bossEffect, onSelect, onSkip }: BlindSelectionProps): React.ReactElement {
  const scoreGoal = getBlindScoreGoal(runState.ante, blind);
  const currentBlindType = getCurrentBlindType(runState);
  const canSkip = currentBlindType !== 'boss';

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4">Ante {runState.ante}</h2>
        <p className="text-xl">Round {runState.round + 1}</p>
        <p className="text-xl">Cash: ${runState.cash}</p>
      </div>

      <div className="border-2 border-gray-600 rounded-lg p-8 text-center mb-8">
        <h3 className="text-2xl font-semibold mb-4">{blind.name}</h3>
        <p className="text-xl mb-2">Score Goal: {scoreGoal}</p>
        <p className="text-lg mb-2">Reward: ${blind.cashReward}</p>
        {bossEffect !== null && (
          <p className="text-sm text-amber-500 mt-4">
            {bossEffect}
          </p>
        )}
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
    </div>
  );
}