import React, { useState, useEffect, useCallback } from 'react';
import type { PlayingRoundState } from '../game/gameState.ts';
import type { RoundState } from '../game/roundState.ts';
import type { RunState } from '../game/runState.ts';
import type { PlayingCard, Card } from '../cards';
import { 
  getNextRoundState, 
  canPlayHand, 
  handleCardClick, 
  handlePlayHand,
  handleDiscardCards,
  canDiscardCards,
} from './roundLogic.ts';
import { RoundView } from './RoundView.tsx';
import { CardSelectionModal } from './CardSelectionModal.tsx';
import { useStatisticsContext } from '../statistics/StatisticsContext.tsx';
import { 
  applySpectralEffect, 
  applyArcanaEffect, 
  canUseConsumable,
  getRequiredSelections 
} from '../consumables';
import { removeConsumable } from '../game/runState.ts';

interface RoundContainerProps {
  readonly gameState: PlayingRoundState;
  readonly onWin: () => void;
  readonly onLose: () => void;
  readonly onUpdateRunState: (updater: (state: RunState) => RunState) => void;
}

function getPlayingCards(deck: ReadonlyArray<Card>): ReadonlyArray<PlayingCard> {
  const result: PlayingCard[] = [];
  for (const card of deck) {
    if (card.type === 'playing') {
      result.push(card);
    }
  }
  return result;
}

export function RoundContainer({ gameState, onWin, onLose, onUpdateRunState }: RoundContainerProps): React.ReactElement {
  const [roundState, setRoundState] = useState<RoundState>(gameState.roundState);
  const [money, setMoney] = useState<number>(gameState.runState.cash);
  const [isDiscarding, setIsDiscarding] = useState<boolean>(false);
  const [pendingConsumable, setPendingConsumable] = useState<string | null>(null);
  const stats = useStatisticsContext();
  
  const bossBlind = gameState.blind.isBoss ? gameState.blind : null;

  useEffect(() => {
    const transition = getNextRoundState(roundState, bossBlind, money, gameState.runState.jokers);
    
    if (transition) {
      const timeoutId = setTimeout(() => {
        setRoundState(transition.nextState);
        
        if (transition.shouldResetMoney === true) {
          setMoney(0);
        }
        
        // Note: Broken glass cards are handled when the round is won
        // The game state will update the deck at that time
        
        // Track hand statistics when transitioning from scoring to played
        if (roundState.type === 'scoring' && transition.nextState.type === 'played') {
          const scoringState = roundState;
          stats.trackHandPlayed(
            scoringState.evaluatedHand.handType.name,
            scoringState.finalScore
          );
        }
        
        // Handle round finished
        if (transition.nextState.type === 'roundFinished') {
          const finishedState = transition.nextState;
          setTimeout(() => {
            if (finishedState.won) {
              onWin();
            } else {
              onLose();
            }
          }, 2000);
        }
      }, transition.delayMs);
      
      return (): void => { clearTimeout(timeoutId); };
    }
    
    return undefined;
  }, [roundState, bossBlind, money, gameState.runState.jokers, onWin, onLose, stats]);

  const handleCardClickCallback = useCallback((cardId: string): void => {
    const newState = handleCardClick(roundState, cardId);
    if (newState) {
      setRoundState(newState);
    }
  }, [roundState]);

  const handlePlayHandCallback = useCallback((): void => {
    const newState = handlePlayHand(roundState);
    if (newState) {
      setRoundState(newState);
    }
  }, [roundState]);

  const handleDiscardCardsCallback = useCallback((): void => {
    setIsDiscarding(true);
    setTimeout(() => {
      const newState = handleDiscardCards(roundState);
      if (newState) {
        setRoundState(newState);
        setIsDiscarding(false);
      }
    }, 600); // Wait for discard animation
  }, [roundState]);
  
  const handleUseConsumable = useCallback((consumableId: string): void => {
    const consumable = gameState.runState.consumables.find(c => c.id === consumableId);
    if (!consumable || roundState.type !== 'selectingHand' || !canUseConsumable(consumable, gameState.runState)) return;
    
    const requiredSelections = getRequiredSelections(consumable);
    
    if (requiredSelections !== null && requiredSelections.cards !== undefined) {
      setPendingConsumable(consumableId);
    } else {
      // Apply effect immediately if no selection needed
      const updatedRunState = consumable.type === 'spectral'
        ? applySpectralEffect(gameState.runState, consumable, {})
        : applyArcanaEffect(gameState.runState, consumable, {});
        
      onUpdateRunState(() => removeConsumable(updatedRunState, consumableId));
    }
  }, [gameState.runState, roundState.type, onUpdateRunState]);
  
  const handleCardSelection = useCallback((selectedCards: ReadonlyArray<PlayingCard>): void => {
    if (pendingConsumable === null) return;
    
    const consumable = gameState.runState.consumables.find(c => c.id === pendingConsumable);
    if (!consumable) return;
    
    const updatedRunState = consumable.type === 'spectral'
      ? applySpectralEffect(gameState.runState, consumable, { selectedCards })
      : applyArcanaEffect(gameState.runState, consumable, { selectedCards });
      
    onUpdateRunState(() => removeConsumable(updatedRunState, pendingConsumable));
    setPendingConsumable(null);
  }, [pendingConsumable, gameState.runState, onUpdateRunState]);

  const pendingConsumableCard = pendingConsumable !== null
    ? gameState.runState.consumables.find(c => c.id === pendingConsumable)
    : null;
    
  const requiredSelections = pendingConsumableCard
    ? getRequiredSelections(pendingConsumableCard)
    : null;

  return (
    <>
      <RoundView
      roundState={roundState}
      runState={gameState.runState}
      blind={gameState.blind}
      bossEffect={gameState.bossEffect}
      onCardClick={handleCardClickCallback}
      onPlayHand={handlePlayHandCallback}
      onDiscardCards={handleDiscardCardsCallback}
      onUseConsumable={handleUseConsumable}
      canPlayHand={canPlayHand(roundState, bossBlind)}
      canDiscardCards={canDiscardCards(roundState)}
      isDiscarding={isDiscarding}
      />
      
      {pendingConsumableCard !== null && pendingConsumableCard !== undefined && requiredSelections !== null && requiredSelections.cards !== undefined && (
        <CardSelectionModal
          title={`Use ${pendingConsumableCard.name}`}
          description={pendingConsumableCard.description}
          cards={getPlayingCards(gameState.runState.deck)}
          maxSelections={requiredSelections.cards}
          onConfirm={handleCardSelection}
          onCancel={() => setPendingConsumable(null)}
        />
      )}
    </>
  );
}