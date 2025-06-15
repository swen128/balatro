import React from 'react';
import type { VictoryState } from '../game/gameState.ts';
import { WINNING_ANTE } from '../game/runState.ts';

interface VictoryViewProps {
  readonly gameState: VictoryState;
  readonly onReturnToMenu: () => void;
}

export function VictoryView({ gameState, onReturnToMenu }: VictoryViewProps): React.ReactElement {
  return (
    <div className="victory-screen fixed inset-0 bg-gradient-to-b from-yellow-900 to-yellow-700 flex items-center justify-center">
      <div className="bg-black/80 rounded-xl p-12 max-w-2xl text-center space-y-6">
        <h1 className="text-6xl font-bold text-yellow-400 mb-4">Victory!</h1>
        <p className="text-2xl text-white">You have conquered Ante {WINNING_ANTE}!</p>
        
        <div className="space-y-4 mt-8">
          <div className="text-xl text-gray-300">
            <div>Final Score: <span className="text-yellow-400 font-bold">{gameState.finalScore.toLocaleString()}</span></div>
            <div>Total Rounds: <span className="text-yellow-400 font-bold">{gameState.runState.round}</span></div>
            <div>Final Cash: <span className="text-yellow-400 font-bold">${gameState.runState.cash}</span></div>
            <div>Jokers Collected: <span className="text-yellow-400 font-bold">{gameState.runState.jokers.length}</span></div>
          </div>
        </div>
        
        <div className="mt-8 space-y-4">
          <button
            onClick={onReturnToMenu}
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors"
          >
            Return to Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}