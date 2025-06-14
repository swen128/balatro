import React from 'react';
import type { ScoringState } from '../../domain/roundState.ts';
import type { Joker } from '../../domain/joker.ts';
import { evaluateAllJokers } from '../../domain/joker.ts';
import { getCardEnhancementEffects } from '../../domain/scoring.ts';

interface ScoringBreakdownProps {
  readonly scoringState: ScoringState;
  readonly jokers: ReadonlyArray<Joker>;
}

export function ScoringBreakdown({ scoringState, jokers }: ScoringBreakdownProps): React.ReactElement {
  // Get all effects
  const enhancementEffects = getCardEnhancementEffects(scoringState.playedCards);
  const jokerContext = {
    playedCards: scoringState.playedCards,
    evaluatedHand: scoringState.evaluatedHand,
    handsPlayed: scoringState.handsPlayed,
  };
  const jokerEffects = evaluateAllJokers(jokers, jokerContext);
  
  return (
    <div className="mb-16 text-center animate-score-pop">
      <h3 className="text-2xl mb-4 text-yellow-400">
        {scoringState.evaluatedHand.handType.name}
      </h3>
      
      {/* Base score */}
      <div className="text-2xl mb-4">
        <span className="text-blue-400">{scoringState.baseChipMult.chips}</span>
        <span className="text-gray-400"> × </span>
        <span className="text-red-400">{scoringState.baseChipMult.mult}</span>
      </div>
      
      {/* Effects */}
      {(enhancementEffects.length > 0 || jokerEffects.length > 0) && (
        <div className="text-sm mb-4 space-y-1">
          {enhancementEffects.map((effect, index) => (
            <div key={`enhancement-${index}`} className="text-purple-400">
              {effect.source}: {
                effect.type === 'addChips' ? `+${effect.value} chips` :
                effect.type === 'addMult' ? `+${effect.value} mult` :
                effect.type === 'multiplyMult' ? `×${effect.value} mult` : ''
              }
            </div>
          ))}
          {jokerEffects.map((effect, index) => (
            <div key={`joker-${index}`} className="text-yellow-400">
              {effect.source}: {
                effect.type === 'addChips' ? `+${effect.value} chips` :
                effect.type === 'addMult' ? `+${effect.value} mult` :
                effect.type === 'multiplyMult' ? `×${effect.value} mult` : ''
              }
            </div>
          ))}
        </div>
      )}
      
      {/* Final score */}
      <div className="text-3xl">
        <span className="text-gray-400">Final Score: </span>
        <span className="text-green-400 text-4xl font-bold">{scoringState.finalScore}</span>
      </div>
    </div>
  );
}