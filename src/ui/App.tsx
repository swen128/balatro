import React, { useState } from 'react';
import type { GameState } from '../domain/gameState.ts';
import { createMainMenuState, startNewRun, selectBlind, skipBlind, winRound, loseRound, leaveShop } from '../domain/gameState.ts';
import { MainMenuView } from '../features/main-menu/MainMenuView.tsx';
import { BlindSelectionView } from '../features/blind-selection/BlindSelectionView.tsx';
import { RoundContainer } from '../features/round/RoundContainer.tsx';
import { ShopView } from '../features/shop/ShopView.tsx';

export function App(): React.ReactElement {
  const [gameState, setGameState] = useState<GameState>(createMainMenuState());

  const handleStartNewRun = (): void => {
    setGameState(startNewRun());
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
      return <MainMenuView onStartNewRun={handleStartNewRun} />;
    
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
        <ShopView
          runState={gameState.runState}
          onLeave={handleLeaveShop}
        />
      );
  }
}