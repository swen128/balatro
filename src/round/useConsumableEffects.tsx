import { useCallback } from 'react';
import type { RunState } from '../game/runState.ts';
import type { RoundState } from '../game/roundState.ts';
import type { PlayingCard, Card } from '../cards';
import type { ConsumableCard } from '../consumables';
import { 
  applySpectralEffect, 
  applyArcanaEffect,
  applyPlanetEffect,
  canUseConsumable,
  getRequiredSelections 
} from '../consumables';
import { removeConsumable } from '../game/runState.ts';

interface UseConsumableEffectsProps {
  readonly runState: RunState;
  readonly roundState: RoundState;
  readonly onUpdateRunState: (updater: (state: RunState) => RunState) => void;
  readonly onUpdateRoundState: (updater: (state: RoundState) => RoundState) => void;
  readonly setPendingConsumable: (id: string | null) => void;
}

interface UseConsumableEffectsReturn {
  readonly handleUseConsumable: (consumableId: string) => void;
  readonly handleCardSelection: (selectedCards: ReadonlyArray<PlayingCard>, pendingConsumableId: string) => void;
}

function syncHandWithDeck(hand: ReadonlyArray<Card>, deck: ReadonlyArray<Card>): ReadonlyArray<Card> {
  return hand.map(handCard => {
    const updatedCard = deck.find(deckCard => deckCard.id === handCard.id);
    return updatedCard ?? handCard;
  });
}

function applyConsumableEffect(
  consumable: ConsumableCard,
  runState: RunState,
  options: { selectedCards?: ReadonlyArray<PlayingCard> } = {}
): RunState {
  switch (consumable.type) {
    case 'spectral':
      return applySpectralEffect(runState, consumable, options);
    case 'arcana':
      return applyArcanaEffect(runState, consumable, options);
    case 'planet':
      return applyPlanetEffect(runState, consumable);
  }
}

export function useConsumableEffects({
  runState,
  roundState,
  onUpdateRunState,
  onUpdateRoundState,
  setPendingConsumable
}: UseConsumableEffectsProps): UseConsumableEffectsReturn {
  const handleUseConsumable = useCallback((consumableId: string): void => {
    const consumable = runState.consumables.find(c => c.id === consumableId);
    if (!consumable || roundState.type !== 'selectingHand' || !canUseConsumable(consumable, runState)) return;
    
    const requiredSelections = getRequiredSelections(consumable);
    
    if (requiredSelections !== null && requiredSelections.cards !== undefined) {
      setPendingConsumable(consumableId);
    } else {
      // Apply effect immediately if no selection needed
      const updatedRunState = applyConsumableEffect(consumable, runState);
      
      onUpdateRoundState(currentState => ({
        ...currentState,
        hand: syncHandWithDeck(currentState.hand, updatedRunState.deck)
      }));
        
      onUpdateRunState(() => removeConsumable(updatedRunState, consumableId));
    }
  }, [runState, roundState.type, onUpdateRunState, onUpdateRoundState, setPendingConsumable]);
  
  const handleCardSelection = useCallback((selectedCards: ReadonlyArray<PlayingCard>, pendingConsumableId: string): void => {
    const consumable = runState.consumables.find(c => c.id === pendingConsumableId);
    if (!consumable) return;
    
    const updatedRunState = applyConsumableEffect(consumable, runState, { selectedCards });
    
    onUpdateRoundState(currentState => ({
      ...currentState,
      hand: syncHandWithDeck(currentState.hand, updatedRunState.deck)
    }));
      
    onUpdateRunState(() => removeConsumable(updatedRunState, pendingConsumableId));
    setPendingConsumable(null);
  }, [runState, onUpdateRunState, onUpdateRoundState, setPendingConsumable]);

  return {
    handleUseConsumable,
    handleCardSelection
  };
}