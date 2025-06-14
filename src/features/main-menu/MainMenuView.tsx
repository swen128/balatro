import React from 'react';

interface MainMenuProps {
  readonly onStartNewRun: () => void;
  readonly onContinueRun: () => void;
  readonly onShowStatistics: () => void;
  readonly hasSaveGame: boolean;
  readonly saveInfo: { timestamp: number } | null;
}

export function MainMenuView({ onStartNewRun, onContinueRun, onShowStatistics, hasSaveGame, saveInfo }: MainMenuProps): React.ReactElement {
  const formatSaveDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-8">
      <h1 className="text-6xl mb-8">Balatro</h1>
      {hasSaveGame && (
        <div className="text-center">
          <button
            onClick={onContinueRun}
            className="text-2xl px-8 py-4 bg-green-500 hover:bg-green-600 rounded transition-colors mb-2"
          >
            Continue Run
          </button>
          {saveInfo && (
            <div className="text-sm text-gray-400">
              Last saved: {formatSaveDate(saveInfo.timestamp)}
            </div>
          )}
        </div>
      )}
      <button
        onClick={onStartNewRun}
        className="text-2xl px-8 py-4 bg-blue-500 hover:bg-blue-600 rounded transition-colors"
      >
        New Run
      </button>
      <button
        onClick={onShowStatistics}
        className="text-xl px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded transition-colors"
      >
        Statistics
      </button>
    </div>
  );
}