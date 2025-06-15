import React from 'react';
import type { RunState } from '../game/runState.ts';

interface GameOverViewProps {
  readonly runState: RunState;
  readonly finalScore: number;
  readonly onReturnToMenu: () => void;
}

export function GameOverView({ runState, finalScore, onReturnToMenu }: GameOverViewProps): React.ReactElement {
  return (
    <div className="game-over-screen fixed inset-0 bg-gradient-to-b from-red-900 to-red-700 flex items-center justify-center">
      <div className="bg-black/80 rounded-xl p-12 max-w-2xl text-center space-y-6">
        <h1 className="text-6xl font-bold text-red-400 mb-4">Game Over</h1>
        <p className="text-2xl text-white">You were defeated at Ante {runState.ante}</p>
        
        <div className="space-y-4 mt-8">
          <div className="text-xl text-gray-300">
            <div>Final Score: <span className="text-red-400 font-bold">{finalScore.toLocaleString()}</span></div>
            <div>Rounds Survived: <span className="text-red-400 font-bold">{runState.round}</span></div>
            <div>Cash Earned: <span className="text-red-400 font-bold">${runState.cash}</span></div>
            <div>Jokers Collected: <span className="text-red-400 font-bold">{runState.jokers.length}</span></div>
            {runState.blindProgression.type === 'smallBlindUpcoming' && (
              <div className="mt-2 text-gray-400">Defeated on Small Blind</div>
            )}
            {runState.blindProgression.type === 'bigBlindUpcoming' && (
              <div className="mt-2 text-gray-400">Defeated on Big Blind</div>
            )}
            {runState.blindProgression.type === 'bossBlindUpcoming' && (
              <div className="mt-2 text-gray-400">Defeated on Boss Blind</div>
            )}
          </div>
        </div>
        
        <div className="mt-8 space-y-4">
          <button
            onClick={onReturnToMenu}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors"
          >
            Return to Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}