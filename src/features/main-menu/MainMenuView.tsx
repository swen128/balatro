import React from 'react';

interface MainMenuProps {
  readonly onStartNewRun: () => void;
}

export function MainMenuView({ onStartNewRun }: MainMenuProps): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-8">
      <h1 className="text-6xl mb-8">Balatro</h1>
      <button
        onClick={onStartNewRun}
        className="text-2xl px-8 py-4 bg-blue-500 hover:bg-blue-600 rounded transition-colors"
      >
        New Run
      </button>
    </div>
  );
}