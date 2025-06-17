import React, { useEffect } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import type { PlayingRoundState } from '../game/gameState.ts';
import type { RunState } from '../game/runState.ts';
import type { PlayingCard, Card } from '../cards';
import { canPlayHand, canDiscardCards } from './roundLogic.ts';
import { RoundView } from './RoundView.tsx';
import { CardSelectionModal } from './CardSelectionModal.tsx';
import { useStatisticsContext } from '../statistics/StatisticsContext.tsx';
import { getRequiredSelections } from '../consumables';
import {
  roundStateAtom,
  moneyAtom,
  isDiscardingAtom,
  pendingConsumableAtom,
  runStateAtom,
  bossBlindAtom,
  bossEffectAtom,
  callbacksAtom,
  transitionEffectAtom,
  handleCardClickAtom,
  handlePlayHandAtom,
  handleDiscardCardsAtom,
  handleUseConsumableAtom,
  handleCardSelectionAtom,
  cancelConsumableSelectionAtom,
} from './roundJotaiAtoms.tsx';

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

export function RoundContainerJotai({ 
  gameState, 
  onWin, 
  onLose, 
  onUpdateRunState 
}: RoundContainerProps): React.ReactElement {
  const stats = useStatisticsContext();
  const bossBlind = gameState.blind.isBoss ? gameState.blind : null;
  
  // Set up atoms only once on mount
  const setRoundState = useSetAtom(roundStateAtom);
  const setMoney = useSetAtom(moneyAtom);
  const setRunState = useSetAtom(runStateAtom);
  const setBossBlind = useSetAtom(bossBlindAtom);
  const setBossEffect = useSetAtom(bossEffectAtom);
  const setCallbacks = useSetAtom(callbacksAtom);
  
  // Read state atoms
  const roundState = useAtomValue(roundStateAtom);
  const runState = useAtomValue(runStateAtom);
  const isDiscarding = useAtomValue(isDiscardingAtom);
  const pendingConsumable = useAtomValue(pendingConsumableAtom);
  
  // Action atoms
  const handleCardClick = useSetAtom(handleCardClickAtom);
  const handlePlayHand = useSetAtom(handlePlayHandAtom);
  const handleDiscardCards = useSetAtom(handleDiscardCardsAtom);
  const handleUseConsumable = useSetAtom(handleUseConsumableAtom);
  const handleCardSelection = useSetAtom(handleCardSelectionAtom);
  const cancelConsumableSelection = useSetAtom(cancelConsumableSelectionAtom);
  
  // Enable transition effect
  useAtom(transitionEffectAtom);
  
  // Initialize atoms only when gameState changes
  useEffect(() => {
    setRoundState(gameState.roundState);
    setMoney(gameState.runState.cash);
    setRunState(gameState.runState);
    setBossBlind(bossBlind);
    setBossEffect(gameState.bossEffect);
    setCallbacks({
      onWin,
      onLose,
      onUpdateRunState,
      trackHandPlayed: stats.trackHandPlayed,
    });
  }, [gameState.roundState, gameState.runState, gameState.bossEffect, bossBlind, onWin, onLose, onUpdateRunState, stats.trackHandPlayed, setRoundState, setMoney, setRunState, setBossBlind, setBossEffect, setCallbacks]);
  
  if (!roundState || !runState) {
    return <div>Loading...</div>;
  }
  
  const pendingConsumableCard = pendingConsumable !== null
    ? runState.consumables.find(c => c.id === pendingConsumable)
    : null;
    
  const requiredSelections = pendingConsumableCard
    ? getRequiredSelections(pendingConsumableCard)
    : null;

  return (
    <>
      <RoundView
        roundState={roundState}
        runState={runState}
        blind={gameState.blind}
        bossEffect={gameState.bossEffect}
        onCardClick={handleCardClick}
        onPlayHand={handlePlayHand}
        onDiscardCards={handleDiscardCards}
        onUseConsumable={handleUseConsumable}
        canPlayHand={canPlayHand(roundState, bossBlind)}
        canDiscardCards={canDiscardCards(roundState)}
        isDiscarding={isDiscarding}
      />
      
      {pendingConsumableCard !== null && pendingConsumableCard !== undefined && requiredSelections !== null && requiredSelections.cards !== undefined && (
        <CardSelectionModal
          title={`Use ${pendingConsumableCard.name}`}
          description={pendingConsumableCard.description}
          cards={getPlayingCards(runState.deck)}
          maxSelections={requiredSelections.cards}
          onConfirm={handleCardSelection}
          onCancel={cancelConsumableSelection}
        />
      )}
    </>
  );
}