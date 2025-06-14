import React, { useState, useEffect } from 'react';
import type { GameState } from '../domain/gameState.ts';
import type { RunState } from '../domain/runState.ts';
import { createMainMenuState, startNewRun, selectBlind, skipBlind, winRound, loseRound, leaveShop } from '../domain/gameState.ts';
import { saveGame, loadGame, hasSaveGame, deleteSaveGame, getSaveInfo } from '../domain/saveGame.ts';
import { MainMenuView } from '../features/main-menu/MainMenuView.tsx';
import { BlindSelectionView } from '../features/blind-selection/BlindSelectionView.tsx';
import { RoundContainer } from '../features/round/RoundContainer.tsx';
import { ShopContainer } from '../features/shop/ShopContainer.tsx';
import { StatisticsView } from '../features/statistics/StatisticsView.tsx';
import type { GameStatistics } from '../domain/statistics.ts';
import { updateGameStart, updateGameEnd, updateBossDefeated } from '../domain/statistics.ts';
import { loadStatistics, saveStatistics } from '../features/statistics/statisticsStorage.ts';
import { SoundProvider } from '../features/sound/SoundContext.tsx';
import { SoundSettings } from '../features/sound/SoundSettings.tsx';
import { useSound } from '../features/sound/SoundContext.tsx';

function AppContent(): React.ReactElement {
  const [gameState, setGameState] = useState<GameState>(createMainMenuState());
  const [statistics, setStatistics] = useState<GameStatistics>(loadStatistics());
  const [showStatistics, setShowStatistics] = useState(false);
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  const sound = useSound();

  // Auto-save when game state changes (except main menu)
  useEffect(() => {
    if (gameState.type !== 'mainMenu') {
      saveGame(gameState);
    }
  }, [gameState]);

  const handleStartNewRun = (): void => {
    deleteSaveGame(); // Clear any existing save
    const newStats = updateGameStart(statistics);
    setStatistics(newStats);
    saveStatistics(newStats);
    sound.play('buttonClick');
    setGameState(startNewRun());
  };

  const handleContinueRun = (): void => {
    const savedGame = loadGame();
    if (savedGame) {
      sound.play('buttonClick');
      setGameState(savedGame);
    }
  };

  const handleSelectBlind = (): void => {
    if (gameState.type === 'selectingBlind') {
      sound.play('blindSelect');
      setGameState(selectBlind(gameState));
    }
  };

  const handleSkipBlind = (): void => {
    if (gameState.type === 'selectingBlind') {
      setGameState(skipBlind(gameState));
    }
  };

  const handleWinRound = (): void => {
    if (gameState.type === 'playingRound') {
      sound.play('roundWin');
      setGameState(winRound(gameState));
      
      // Update statistics for boss defeats
      if (gameState.blind.isBoss) {
        const newStats = updateBossDefeated(statistics, gameState.blind.name);
        setStatistics(newStats);
        saveStatistics(newStats);
      }
    }
  };

  const handleLoseRound = (): void => {
    if (gameState.type === 'playingRound') {
      const finalScore = gameState.roundState.type === 'roundFinished' && !gameState.roundState.won 
        ? gameState.roundState.score 
        : 0;
      sound.play('roundLose');
      const newStats = updateGameEnd(statistics, false, gameState.runState.ante, finalScore);
      setStatistics(newStats);
      saveStatistics(newStats);
      setGameState(loseRound());
    }
  };

  const handleLeaveShop = (updatedRunState: RunState): void => {
    if (gameState.type === 'shop') {
      // Update the game state with the new run state before leaving shop
      const updatedGameState = {
        ...gameState,
        runState: updatedRunState,
      };
      setGameState(leaveShop(updatedGameState));
    }
  };

  switch (gameState.type) {
    case 'mainMenu':
      return (
        <>
          <MainMenuView 
            onStartNewRun={handleStartNewRun}
            onContinueRun={handleContinueRun}
            onShowStatistics={() => setShowStatistics(true)}
            hasSaveGame={hasSaveGame()}
            saveInfo={getSaveInfo()}
          />
          <StatisticsView
            statistics={statistics}
            isOpen={showStatistics}
            onClose={() => setShowStatistics(false)}
          />
          <SoundSettings
            config={sound.config}
            onVolumeChange={sound.setVolume}
            onToggleMute={sound.toggleMute}
            onToggleEnabled={sound.toggleEnabled}
            isOpen={showSoundSettings}
            onClose={() => setShowSoundSettings(false)}
          />
          {/* Sound Settings Button */}
          <button
            onClick={() => setShowSoundSettings(true)}
            className="fixed bottom-4 right-4 p-3 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
            title="Sound Settings"
          >
            🔊
          </button>
        </>
      );
    
    case 'selectingBlind':
      return (
        <BlindSelectionView
          runState={gameState.runState}
          allBlinds={gameState.allBlinds}
          onSelect={handleSelectBlind}
          onSkip={handleSkipBlind}
        />
      );
    
    case 'playingRound':
      return (
        <RoundContainer
          gameState={gameState}
          onWin={handleWinRound}
          onLose={handleLoseRound}
        />
      );
    
    case 'shop':
      return (
        <ShopContainer
          runState={gameState.runState}
          onLeave={handleLeaveShop}
        />
      );
  }
}

export function App(): React.ReactElement {
  return (
    <SoundProvider>
      <AppContent />
    </SoundProvider>
  );
}