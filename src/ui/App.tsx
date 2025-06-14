import React, { useState, useEffect } from 'react';
import type { GameState } from '../domain/gameState.ts';
import { createMainMenuState, startNewRun, selectBlind, skipBlind, winRound, loseRound, leaveShop } from '../domain/gameState.ts';
import { saveGame, loadGame, hasSaveGame, deleteSaveGame, getSaveInfo } from '../domain/saveGame.ts';
import { MainMenuView } from '../features/main-menu/MainMenuView.tsx';
import { BlindSelectionView } from '../features/blind-selection/BlindSelectionView.tsx';
import { RoundContainer } from '../features/round/RoundContainer.tsx';
import { ShopContainer } from '../features/shop/ShopContainer.tsx';

export function App(): React.ReactElement {
  const [gameState, setGameState] = useState<GameState>(createMainMenuState());

  // Auto-save when game state changes (except main menu)
  useEffect(() => {
    if (gameState.type !== 'mainMenu') {
      saveGame(gameState);
    }
  }, [gameState]);

  const handleStartNewRun = (): void => {
    deleteSaveGame(); // Clear any existing save
    setGameState(startNewRun());
  };

  const handleContinueRun = (): void => {
    const savedGame = loadGame();
    if (savedGame) {
      setGameState(savedGame);
    }
  };

  const handleSelectBlind = (): void => {
    if (gameState.type === 'selectingBlind') {
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
      setGameState(winRound(gameState));
    }
  };

  const handleLoseRound = (): void => {
    if (gameState.type === 'playingRound') {
      setGameState(loseRound());
    }
  };

  const handleLeaveShop = (): void => {
    if (gameState.type === 'shop') {
      setGameState(leaveShop(gameState));
    }
  };

  switch (gameState.type) {
    case 'mainMenu':
      return (
        <MainMenuView 
          onStartNewRun={handleStartNewRun}
          onContinueRun={handleContinueRun}
          hasSaveGame={hasSaveGame()}
          saveInfo={getSaveInfo()}
        />
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