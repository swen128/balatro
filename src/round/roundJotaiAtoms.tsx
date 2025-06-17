import { atom } from 'jotai';
import { atomEffect } from 'jotai-effect';
import type { RoundState } from '../game/roundState.ts';
import type { RunState } from '../game/runState.ts';
import type { BossBlind } from '../blinds';
import type { PlayingCard, Card } from '../cards';
import { 
  getNextRoundState, 
  handleCardClick as processCardClick, 
  handlePlayHand as processPlayHand,
  handleDiscardCards as processDiscardCards,
} from './roundLogic.ts';
import { 
  applySpectralEffect, 
  applyArcanaEffect,
  applyPlanetEffect,
  canUseConsumable,
  getRequiredSelections 
} from '../consumables';
import { removeConsumable } from '../game/runState.ts';

// Core state atoms
export const roundStateAtom = atom<RoundState | null>(null);
export const moneyAtom = atom<number>(0);
export const isDiscardingAtom = atom<boolean>(false);
export const pendingConsumableAtom = atom<string | null>(null);

// Game context atoms
export const runStateAtom = atom<RunState | null>(null);
export const bossBlindAtom = atom<BossBlind | null>(null);
export const bossEffectAtom = atom<string | null>(null);

// Callback atoms for external effects
export const callbacksAtom = atom<{
  onWin: () => void;
  onLose: () => void;
  onUpdateRunState: (updater: (state: RunState) => RunState) => void;
  trackHandPlayed: (handType: string, score: number) => void;
} | null>(null);

// Derived atom for jokers and hand levels
const gameDataAtom = atom((get) => {
  const runState = get(runStateAtom);
  return runState ? { jokers: runState.jokers, handLevels: runState.handLevels } : null;
});

// State transition atom - automatically calculates next transition
const nextTransitionAtom = atom((get) => {
  const roundState = get(roundStateAtom);
  const bossBlind = get(bossBlindAtom);
  const money = get(moneyAtom);
  const gameData = get(gameDataAtom);
  
  if (!roundState || !gameData) return null;
  
  return getNextRoundState(roundState, bossBlind, money, gameData.jokers, gameData.handLevels);
});

// Effect atom that handles state transitions automatically
export const transitionEffectAtom = atomEffect((get, set) => {
  const transition = get(nextTransitionAtom);
  const roundState = get(roundStateAtom);
  const callbacks = get(callbacksAtom);
  
  if (!transition || !callbacks) return;
  
  const timeoutId = setTimeout(() => {
    set(roundStateAtom, transition.nextState);
    
    if (transition.shouldResetMoney === true) {
      set(moneyAtom, 0);
    }
    
    // Track hand statistics when transitioning from scoring to played
    if (roundState && roundState.type === 'scoring' && transition.nextState.type === 'played') {
      const scoringState = roundState;
      callbacks.trackHandPlayed(
        scoringState.evaluatedHand.handType.name,
        scoringState.finalScore
      );
      
      // Apply money generated from jokers
      if (scoringState.moneyGenerated !== undefined && scoringState.moneyGenerated > 0) {
        const moneyToAdd = scoringState.moneyGenerated;
        set(moneyAtom, (current) => current + moneyToAdd);
        callbacks.onUpdateRunState(runState => ({
          ...runState,
          cash: runState.cash + moneyToAdd,
        }));
      }
    }
    
    // Handle round finished
    if (transition.nextState.type === 'roundFinished') {
      const finishedState = transition.nextState;
      setTimeout(() => {
        if (finishedState.won) {
          callbacks.onWin();
        } else {
          callbacks.onLose();
        }
      }, 2000);
    }
  }, transition.delayMs);
  
  return (): void => {
    clearTimeout(timeoutId);
  };
});

// Action atoms
export const handleCardClickAtom = atom(
  null,
  (get, set, cardId: string) => {
    const roundState = get(roundStateAtom);
    if (!roundState) return;
    
    const newState = processCardClick(roundState, cardId);
    if (newState) {
      set(roundStateAtom, newState);
    }
  }
);

export const handlePlayHandAtom = atom(
  null,
  (get, set) => {
    const roundState = get(roundStateAtom);
    if (!roundState) return;
    
    const newState = processPlayHand(roundState);
    if (newState) {
      set(roundStateAtom, newState);
    }
  }
);

export const handleDiscardCardsAtom = atom(
  null,
  (get, set) => {
    set(isDiscardingAtom, true);
    setTimeout(() => {
      const roundState = get(roundStateAtom);
      if (!roundState) return;
      
      const newState = processDiscardCards(roundState);
      if (newState) {
        set(roundStateAtom, newState);
        set(isDiscardingAtom, false);
      }
    }, 600); // Wait for discard animation
  }
);

const syncHandWithDeck = (hand: ReadonlyArray<Card>, deck: ReadonlyArray<Card>): ReadonlyArray<Card> => {
  return hand.map(handCard => {
    const updatedCard = deck.find(deckCard => deckCard.id === handCard.id);
    return updatedCard ?? handCard;
  });
};

export const handleUseConsumableAtom = atom(
  null,
  (get, set, consumableId: string) => {
    const roundState = get(roundStateAtom);
    const runState = get(runStateAtom);
    const callbacks = get(callbacksAtom);
    
    if (!roundState || !runState || !callbacks || roundState.type !== 'selectingHand') return;
    
    const consumable = runState.consumables.find(c => c.id === consumableId);
    if (!consumable || !canUseConsumable(consumable, runState)) return;
    
    const requiredSelections = getRequiredSelections(consumable);
    
    if (requiredSelections !== null && requiredSelections.cards !== undefined) {
      set(pendingConsumableAtom, consumableId);
    } else {
      // Apply effect immediately if no selection needed
      const updatedRunState = ((): RunState => {
        switch (consumable.type) {
          case 'spectral':
            return applySpectralEffect(runState, consumable, {});
          case 'arcana':
            return applyArcanaEffect(runState, consumable, {});
          case 'planet':
            return applyPlanetEffect(runState, consumable);
        }
      })();
      
      set(roundStateAtom, {
        ...roundState,
        hand: syncHandWithDeck(roundState.hand, updatedRunState.deck)
      });
      
      const finalRunState = removeConsumable(updatedRunState, consumableId);
      set(runStateAtom, finalRunState);
      callbacks.onUpdateRunState(() => finalRunState);
    }
  }
);

export const handleCardSelectionAtom = atom(
  null,
  (get, set, selectedCards: ReadonlyArray<PlayingCard>) => {
    const pendingConsumable = get(pendingConsumableAtom);
    const roundState = get(roundStateAtom);
    const runState = get(runStateAtom);
    const callbacks = get(callbacksAtom);
    
    if (pendingConsumable === null || !roundState || !runState || !callbacks) return;
    
    const consumable = runState.consumables.find(c => c.id === pendingConsumable);
    if (!consumable) return;
    
    const updatedRunState = ((): RunState => {
      switch (consumable.type) {
        case 'spectral':
          return applySpectralEffect(runState, consumable, { selectedCards });
        case 'arcana':
          return applyArcanaEffect(runState, consumable, { selectedCards });
        case 'planet':
          return applyPlanetEffect(runState, consumable);
      }
    })();
    
    set(roundStateAtom, {
      ...roundState,
      hand: syncHandWithDeck(roundState.hand, updatedRunState.deck)
    });
    
    const finalRunState = removeConsumable(updatedRunState, pendingConsumable);
    set(runStateAtom, finalRunState);
    callbacks.onUpdateRunState(() => finalRunState);
    set(pendingConsumableAtom, null);
  }
);

export const cancelConsumableSelectionAtom = atom(
  null,
  (_, set) => {
    set(pendingConsumableAtom, null);
  }
);