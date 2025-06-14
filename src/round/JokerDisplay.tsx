import React from 'react';
import type { Joker } from '../shop/joker.ts';

interface JokerDisplayProps {
  readonly jokers: ReadonlyArray<Joker>;
  readonly maxJokers: number;
}

export function JokerDisplay({ jokers, maxJokers }: JokerDisplayProps): React.ReactElement {
  return (
    <div className="bg-gray-800 rounded-lg p-3">
      <h3 className="text-lg font-bold mb-2">Jokers ({jokers.length}/{maxJokers})</h3>
      <div className="flex flex-wrap gap-2">
        {jokers.map(joker => (
          <div
            key={joker.id}
            className="bg-gray-700 rounded p-2 text-xs hover:bg-gray-600 transition-colors cursor-pointer"
            title={joker.description}
          >
            <div className="font-bold text-yellow-400">{joker.name}</div>
            <div className="text-gray-300 mt-1">{joker.description}</div>
          </div>
        ))}
        {Array.from({ length: maxJokers - jokers.length }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="bg-gray-700 rounded p-2 w-24 h-16 border-2 border-dashed border-gray-600"
          />
        ))}
      </div>
    </div>
  );
}