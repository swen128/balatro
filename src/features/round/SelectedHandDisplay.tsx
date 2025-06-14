import React from 'react';
import type { Card } from '../../domain/card.ts';
import { evaluatePokerHand } from '../../domain/pokerHands.ts';
import { calculateBaseScore } from '../../domain/scoring.ts';

interface SelectedHandDisplayProps {
  readonly selectedCards: ReadonlyArray<Card>;
}

export function SelectedHandDisplay({ selectedCards }: SelectedHandDisplayProps): React.ReactElement | null {
  if (selectedCards.length === 0) {
    return null;
  }
  
  // Only evaluate if we have a valid number of cards (1-5)
  if (selectedCards.length > 5) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 text-center">
        <div className="text-red-400">Too many cards selected (max 5)</div>
      </div>
    );
  }
  
  const evaluatedHand = evaluatePokerHand(selectedCards);
  const { chips, mult } = calculateBaseScore(evaluatedHand, selectedCards);
  
  return (
    <div className="bg-gray-800 rounded-lg p-3 animate-fade-in">
      <h3 className="text-lg font-bold text-yellow-400 mb-2 text-center">
        {evaluatedHand.handType.name}
      </h3>
      <div className="text-sm text-center">
        <div className="text-blue-400">{chips} chips</div>
        <div className="text-gray-400">×</div>
        <div className="text-red-400">{mult} mult</div>
      </div>
    </div>
  );
}