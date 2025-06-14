import React from 'react';
import type { Card } from '../cards/card.ts';
import { evaluatePokerHand } from '../scoring/pokerHands.ts';
import { calculateBaseScore } from '../scoring/scoring.ts';

interface SelectedHandDisplayProps {
  readonly selectedCards: ReadonlyArray<Card>;
}

export function SelectedHandDisplay({ selectedCards }: SelectedHandDisplayProps): React.ReactElement {
  // Always render the container to prevent layout shifts
  if (selectedCards.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-3 opacity-50">
        <h3 className="text-lg font-bold text-gray-600 mb-2 text-center">
          Select Cards
        </h3>
        <div className="text-sm text-center">
          <div className="text-gray-600">-- chips</div>
          <div className="text-gray-600">×</div>
          <div className="text-gray-600">-- mult</div>
        </div>
      </div>
    );
  }
  
  // Only evaluate if we have a valid number of cards (1-5)
  if (selectedCards.length > 5) {
    return (
      <div className="bg-gray-800 rounded-lg p-3">
        <h3 className="text-lg font-bold text-red-400 mb-2 text-center">
          Too Many
        </h3>
        <div className="text-sm text-center">
          <div className="text-red-400">Max 5 cards</div>
          <div className="text-gray-600">×</div>
          <div className="text-gray-600">--</div>
        </div>
      </div>
    );
  }
  
  const evaluatedHand = evaluatePokerHand(selectedCards);
  const { chips, mult } = calculateBaseScore(evaluatedHand, selectedCards);
  
  return (
    <div className="bg-gray-800 rounded-lg p-3">
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