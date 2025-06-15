import type { RunState } from '../game';
import { addCash, levelUpPokerHand } from '../game/runState.ts';
import type { SpectralCard, ArcanaCard, PlayingCard, CardEnhancement } from '../cards';
import type { PlanetCard, ConsumableCard } from '../consumables';

interface ConsumableEffectContext {
  readonly selectedCards?: ReadonlyArray<PlayingCard>;
  readonly selectedJokerIds?: ReadonlyArray<string>;
}

export function applySpectralEffect(
  runState: RunState,
  card: SpectralCard,
  context: ConsumableEffectContext
): RunState {
  const selectedCards = context.selectedCards ?? [];
  
  switch (card.effect.type) {
    case 'addFoil':
    case 'addHolographic':
    case 'addPolychrome': {
      const enhancement: CardEnhancement = 
        card.effect.type === 'addFoil' ? 'foil' :
        card.effect.type === 'addHolographic' ? 'holographic' :
        'polychrome';
        
      const updatedDeck = runState.deck.map(deckCard => {
        const isSelected = selectedCards.some(sc => sc.id === deckCard.id);
        return isSelected && deckCard.type === 'playing'
          ? { ...deckCard, enhancement }
          : deckCard;
      });
      
      return { ...runState, deck: updatedDeck };
    }
    
    case 'duplicateCard': {
      const cardsToAdd = selectedCards.slice(0, card.effect.count);
      return { ...runState, deck: [...runState.deck, ...cardsToAdd] };
    }
    
    case 'destroyCard': {
      const idsToRemove = new Set(selectedCards.map(c => c.id));
      const updatedDeck = runState.deck.filter(c => !idsToRemove.has(c.id));
      return { ...runState, deck: updatedDeck };
    }
    
    case 'changeRank': {
      const updatedDeck = runState.deck.map(deckCard => {
        const isSelected = selectedCards.some(sc => sc.id === deckCard.id);
        return isSelected && deckCard.type === 'playing' && card.effect.type === 'changeRank'
          ? { ...deckCard, rank: card.effect.targetRank }
          : deckCard;
      });
      
      return { ...runState, deck: updatedDeck };
    }
    
    case 'changeSuit': {
      const updatedDeck = runState.deck.map(deckCard => {
        const isSelected = selectedCards.some(sc => sc.id === deckCard.id);
        return isSelected && deckCard.type === 'playing' && card.effect.type === 'changeSuit'
          ? { ...deckCard, suit: card.effect.targetSuit }
          : deckCard;
      });
      
      return { ...runState, deck: updatedDeck };
    }
  }
}

export function applyArcanaEffect(
  runState: RunState,
  card: ArcanaCard,
  context: ConsumableEffectContext
): RunState {
  switch (card.effect.type) {
    case 'enhanceHand': {
      const selectedCards = context.selectedCards ?? [];
      const cardsToEnhance = selectedCards.slice(0, card.effect.count);
      
      const updatedDeck = runState.deck.map(deckCard => {
        const shouldEnhance = cardsToEnhance.some(sc => sc.id === deckCard.id);
        return shouldEnhance && deckCard.type === 'playing' && card.effect.type === 'enhanceHand'
          ? { ...deckCard, enhancement: card.effect.enhancement }
          : deckCard;
      });
      
      return { ...runState, deck: updatedDeck };
    }
    
    case 'createMoney': {
      return addCash(runState, card.effect.amount);
    }
    
    case 'transformCard': {
      const updatedDeck = runState.deck.map(deckCard => {
        return deckCard.type === 'playing' && card.effect.type === 'transformCard' && deckCard.rank === card.effect.from
          ? { ...deckCard, rank: card.effect.to }
          : deckCard;
      });
      
      return { ...runState, deck: updatedDeck };
    }
    
    case 'destroyJoker': {
      const selectedJokerIds = context.selectedJokerIds ?? [];
      const jokersToRemove = runState.jokers.filter(j => selectedJokerIds.includes(j.id));
      const moneyGained = jokersToRemove.length * card.effect.moneyPerJoker;
      
      const updatedJokers = runState.jokers.filter(j => !selectedJokerIds.includes(j.id));
      const stateWithJokers = { ...runState, jokers: updatedJokers };
      
      return addCash(stateWithJokers, moneyGained);
    }
    
    case 'createJoker':
    case 'createPlanet':
    case 'duplicateJoker':
      // These would require more complex implementation
      return runState;
  }
}

export function applyPlanetEffect(
  runState: RunState,
  card: PlanetCard
): RunState {
  return levelUpPokerHand(runState, card.handType);
}

export function canUseConsumable(
  consumable: ConsumableCard,
  runState: RunState
): boolean {
  switch (consumable.type) {
    case 'spectral':
      switch (consumable.effect.type) {
        case 'addFoil':
        case 'addHolographic':
        case 'addPolychrome':
        case 'duplicateCard':
        case 'destroyCard':
        case 'changeRank':
        case 'changeSuit':
          return runState.deck.filter(c => c.type === 'playing').length > 0;
      }
      break;
      
    case 'arcana':
      switch (consumable.effect.type) {
        case 'enhanceHand':
          return runState.deck.filter(c => c.type === 'playing').length > 0;
        case 'createMoney':
          return true;
        case 'transformCard':
          return runState.deck.some(c => 
            c.type === 'playing' && consumable.effect.type === 'transformCard' && c.rank === consumable.effect.from
          );
        case 'destroyJoker':
          return runState.jokers.length > 0;
        case 'createJoker':
          return runState.jokers.length < runState.maxJokers;
        case 'duplicateJoker':
          return runState.jokers.length > 0 && runState.jokers.length < runState.maxJokers;
        case 'createPlanet':
          return true;
      }
      break;
      
    case 'planet':
      return true; // Planet cards can always be used
  }
  
  return false;
}

export function getRequiredSelections(
  consumable: ConsumableCard
): { cards?: number; jokers?: number } | null {
  switch (consumable.type) {
    case 'spectral':
      switch (consumable.effect.type) {
        case 'addFoil':
        case 'addHolographic':
        case 'addPolychrome':
          return { cards: consumable.effect.count };
        case 'duplicateCard':
          return { cards: consumable.effect.count };
        case 'destroyCard':
          return { cards: consumable.effect.count };
        case 'changeRank':
        case 'changeSuit':
          return { cards: 1 };
      }
      break;
      
    case 'arcana':
      switch (consumable.effect.type) {
        case 'enhanceHand':
          return { cards: consumable.effect.count };
        case 'destroyJoker':
          return { jokers: 1 };
        case 'duplicateJoker':
          return { jokers: 1 };
        case 'createJoker':
        case 'createMoney':
        case 'createPlanet':
        case 'transformCard':
          return null;
      }
      break;
      
    case 'planet':
      return null; // Planet cards don't require selections
  }
  
  return null;
}