import React from 'react';
import type { RunState } from '../domain/runState.ts';

interface ShopProps {
  readonly runState: RunState;
  readonly onLeave: () => void;
}

export function Shop({ runState, onLeave }: ShopProps): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-8">
      <h2 className="text-3xl">Shop</h2>
      <p className="text-xl">Cash: ${runState.cash}</p>
      
      <div className="border-2 border-gray-700 rounded-lg p-8 min-w-[400px] min-h-[300px] flex items-center justify-center">
        <p className="text-gray-500">Shop items coming soon...</p>
      </div>

      <button onClick={onLeave} className="text-xl px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded transition-colors">
        Continue
      </button>
    </div>
  );
}