import React, { useState, useEffect } from 'react';
import type { GameState } from '../game/gameState.ts';
import type { RunState } from '../game/runState.ts';
import { createMainMenuState, startNewRun, selectBlind, skipBlindFromSelectScreen, winRound, loseRound, leaveShop } from '../game/gameState.ts';
import { saveGame, loadGame, hasSaveGame, deleteSaveGame, getSaveInfo } from '../save-game';
import { MainMenuView } from '../game';
import { BlindSelectionView } from '../blinds';
import { RoundContainer } from '../round';
import { ShopContainer } from '../shop';
import { StatisticsView, StatisticsProvider, useStatisticsContext } from '../statistics';
import { SoundProvider, SoundSettings, useSound } from '../sound';

function AppContent(): React.ReactElement {
  const [gameState, setGameState] = useState<GameState>(createMainMenuState());
  const [showStatistics, setShowStatistics] = useState(false);
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  const sound = useSound();
  const stats = useStatisticsContext();

  // Auto-save when game state changes (except main menu)
  useEffect(() => {
    if (gameState.type !== 'mainMenu') {
      saveGame(gameState);
    }
  }, [gameState]);

  const handleStartNewRun = (): void => {
    deleteSaveGame(); // Clear any existing save
    stats.trackGameStart();
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
      setGameState(skipBlindFromSelectScreen(gameState));
    }
  };

  const handleWinRound = (): void => {
    if (gameState.type === 'playingRound') {
      sound.play('roundWin');
      setGameState(winRound(gameState));
      
      // Update statistics for boss defeats
      if (gameState.blind.isBoss) {
        stats.trackBossDefeated(gameState.blind.name);
      }
      
      // Track money earned from blind reward
      stats.trackMoneyEarned(gameState.blind.cashReward);
    }
  };

  const handleLoseRound = (): void => {
    if (gameState.type === 'playingRound') {
      const finalScore = gameState.roundState.type === 'roundFinished' && !gameState.roundState.won 
        ? gameState.roundState.score 
        : 0;
      sound.play('roundLose');
      stats.trackGameEnd(false, gameState.runState.ante, finalScore);
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
            statistics={stats.statistics}
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
    <StatisticsProvider>
      <SoundProvider>
        <AppContent />
      </SoundProvider>
    </StatisticsProvider>
  );
}