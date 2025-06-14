import React from 'react';
import type { BlindType, BossBlind } from '../domain/blind.ts';
import { AnimatedScore } from '../features/round/AnimatedScore.tsx';

interface ScoreDisplayProps {
  readonly score: number;
  readonly scoreGoal: number;
  readonly handsRemaining: number;
  readonly discardsRemaining?: number;
  readonly ante: number;
  readonly blind: BlindType | BossBlind;
  readonly bossEffect: string | null;
}

export function ScoreDisplay({ score, scoreGoal, handsRemaining, discardsRemaining, ante, blind, bossEffect }: ScoreDisplayProps): React.ReactElement {
  const progress = Math.min((score / scoreGoal) * 100, 100);
  
  return (
    <div className="flex flex-col gap-6 text-white">
      <div>
        <h3 className="text-xl mb-2">Ante {ante}</h3>
        <p className="text-base text-gray-400">{blind.name}</p>
      </div>

      <div>
        <div className="mb-2">
          <span className="text-2xl font-bold">
            <AnimatedScore targetScore={score} />
          </span>
          <span className="text-base text-gray-400"> / {scoreGoal}</span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-700 rounded overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ease-out ${
              progress >= 100 ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div>
        <p className="text-base">
          Hands: <span className="font-bold">{handsRemaining}</span>
        </p>
        {discardsRemaining !== undefined && (
          <p className="text-base">
            Discards: <span className="font-bold">{discardsRemaining}</span>
          </p>
        )}
      </div>

      {bossEffect !== null && (
        <div className="p-3 bg-purple-700 rounded text-sm">
          {bossEffect}
        </div>
      )}
    </div>
  );
}