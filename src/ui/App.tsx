import React, { useState } from 'react';
import type { GameState } from '../domain/gameState.ts';
import { createMainMenuState, startNewRun, selectBlind, skipBlind, winRound, loseRound, leaveShop } from '../domain/gameState.ts';
import { MainMenu } from './MainMenu.tsx';
import { BlindSelection } from './BlindSelection.tsx';
import { Round } from './Round.tsx';
import { Shop } from './Shop.tsx';

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
      return <MainMenu onStartNewRun={handleStartNewRun} />;
    
    case 'selectingBlind':
      return (
        <BlindSelection
          runState={gameState.runState}
          blind={gameState.availableBlind}
          bossEffect={gameState.bossEffect}
          onSelect={handleSelectBlind}
          onSkip={handleSkipBlind}
        />
      );
    
    case 'playingRound':
      return (
        <Round
          gameState={gameState}
          onWin={handleWinRound}
          onLose={handleLoseRound}
        />
      );
    
    case 'shop':
      return (
        <Shop
          runState={gameState.runState}
          onLeave={handleLeaveShop}
        />
      );
  }
}