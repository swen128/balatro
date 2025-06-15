import type { RunState } from '../game';
import { addCash, levelUpPokerHand, setHandSize, setMaxJokers, removeCash } from '../game/runState.ts';
import type { SpectralCard, ArcanaCard, PlayingCard, CardEnhancement } from '../cards';
import { createCard, RANKS, SUITS } from '../cards';
import type { PlanetCard, ConsumableCard } from '../consumables';
import { getRandomJoker } from '../shop';
import type { PokerHandKey } from '../scoring';

interface ConsumableEffectContext {
  readonly selectedCards?: ReadonlyArray<PlayingCard>;
  readonly selectedJokerIds?: ReadonlyArray<string>;
  readonly ectoPlasmUsageCount?: number;
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
    
    case 'addRandomEnhancement': {
      const enhancements: ReadonlyArray<CardEnhancement> = ['foil', 'holographic', 'polychrome'];
      const randomEnhancement = enhancements[Math.floor(Math.random() * enhancements.length)] ?? 'foil';
      
      const updatedDeck = runState.deck.map(deckCard => {
        const isSelected = selectedCards.some(sc => sc.id === deckCard.id);
        return isSelected && deckCard.type === 'playing'
          ? { ...deckCard, enhancement: randomEnhancement }
          : deckCard;
      });
      
      return { ...runState, deck: updatedDeck };
    }
    
    case 'addSeal': {
      const updatedDeck = runState.deck.map(deckCard => {
        const isSelected = selectedCards.some(sc => sc.id === deckCard.id);
        return isSelected && deckCard.type === 'playing' && card.effect.type === 'addSeal'
          ? { ...deckCard, seal: card.effect.sealType }
          : deckCard;
      });
      
      return { ...runState, deck: updatedDeck };
    }
    
    case 'duplicateCard': {
      const cardsToAdd = selectedCards.slice(0, card.effect.count);
      return { ...runState, deck: [...runState.deck, ...cardsToAdd] };
    }
    
    case 'duplicateCardExact': {
      const cardToDuplicate = selectedCards[0];
      
      return !cardToDuplicate || cardToDuplicate.type !== 'playing' 
        ? runState
        : ((): RunState => {
            const copies = Array.from({ length: card.effect.count }, () => ({
              ...cardToDuplicate,
              id: `${cardToDuplicate.rank}${cardToDuplicate.suit}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            }));
            
            return { ...runState, deck: [...runState.deck, ...copies] };
          })();
    }
    
    case 'destroyCard': {
      const idsToRemove = new Set(selectedCards.map(c => c.id));
      const updatedDeck = runState.deck.filter(c => !idsToRemove.has(c.id));
      return { ...runState, deck: updatedDeck };
    }
    
    case 'destroyCardInHand': {
      // This should destroy cards from the current hand, not the deck
      // But since we're in the shop/consumable context, we'll destroy from deck
      const playingCards = runState.deck.filter(c => c.type === 'playing');
      const shuffled = [...playingCards].sort(() => Math.random() - 0.5);
      const toDestroy = shuffled.slice(0, Math.min(card.effect.count, shuffled.length));
      const idsToRemove = new Set(toDestroy.map(c => c.id));
      
      const updatedDeck = runState.deck.filter(c => !idsToRemove.has(c.id));
      const stateWithDeck = { ...runState, deck: updatedDeck };
      
      return addCash(stateWithDeck, card.effect.gainMoney);
    }
    
    case 'destroyAndReplace': {
      const playingCards = runState.deck.filter(c => c.type === 'playing');
      
      return playingCards.length === 0 
        ? runState
        : ((): RunState => {
            // Destroy random card
            const randomIndex = Math.floor(Math.random() * playingCards.length);
            const cardToDestroy = playingCards[randomIndex];
            
            return !cardToDestroy 
              ? runState
              : ((): RunState => {
                  const updatedDeck = runState.deck.filter(c => c.id !== cardToDestroy.id);
                  
                  // Create replacement cards
                  const replacementCards: PlayingCard[] = [];
                  const enhancements: ReadonlyArray<CardEnhancement> = ['foil', 'holographic', 'polychrome', 'glass'];
                  
                  const createReplacementCard = (): PlayingCard => {
                    const randomSuit = SUITS[Math.floor(Math.random() * SUITS.length)] ?? '♠';
                    const randomEnhancement = enhancements[Math.floor(Math.random() * enhancements.length)] ?? 'foil';
                    
                    const randomRank = ((): typeof RANKS[number] => {
                      const effectType = card.effect.type === 'destroyAndReplace' ? card.effect.replacementType : 'ace';
                      switch (effectType) {
                        case 'face': {
                          const faceRanks: ReadonlyArray<typeof RANKS[number]> = ['J', 'Q', 'K'];
                          return faceRanks[Math.floor(Math.random() * 3)] ?? 'J';
                        }
                        case 'ace':
                          return 'A';
                        case 'numbered': {
                          const numberedRanks = RANKS.slice(0, 9);
                          return numberedRanks[Math.floor(Math.random() * 9)] ?? '2';
                        }
                      }
                    })();
                    
                    return createCard(randomSuit, randomRank, randomEnhancement);
                  };
                  
                  const newCards = Array.from({ length: card.effect.enhancedCount }, () => createReplacementCard());
                  replacementCards.push(...newCards);
                  
                  return { ...runState, deck: [...updatedDeck, ...replacementCards] };
                })();
          })();
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
    
    case 'changeRankWithHandSize': {
      const randomRank = RANKS[Math.floor(Math.random() * RANKS.length)] ?? 'A';
      
      const updatedDeck = runState.deck.map(deckCard => {
        const isSelected = selectedCards.some(sc => sc.id === deckCard.id);
        return isSelected && deckCard.type === 'playing'
          ? { ...deckCard, rank: randomRank }
          : deckCard;
      });
      
      const stateWithDeck = { ...runState, deck: updatedDeck };
      return setHandSize(stateWithDeck, Math.max(1, runState.handSize + card.effect.handSizeChange));
    }
    
    case 'changeSuit': {
      const randomSuit = SUITS[Math.floor(Math.random() * SUITS.length)] ?? '♠';
      
      const updatedDeck = runState.deck.map(deckCard => {
        const isSelected = selectedCards.some(sc => sc.id === deckCard.id);
        return isSelected && deckCard.type === 'playing'
          ? { ...deckCard, suit: randomSuit }
          : deckCard;
      });
      
      return { ...runState, deck: updatedDeck };
    }
    
    case 'createRareJoker': {
      return runState.jokers.length >= runState.maxJokers 
        ? runState
        : ((): RunState => {
            const rareJoker = getRandomJoker('rare');
            const stateWithJoker = { ...runState, jokers: [...runState.jokers, rareJoker] };
            
            return card.effect.setMoneyToZero ? removeCash(stateWithJoker, stateWithJoker.cash) : stateWithJoker;
          })();
    }
    
    case 'createLegendaryJoker': {
      return runState.jokers.length >= runState.maxJokers 
        ? runState
        : ((): RunState => {
            // For now, create a rare joker as placeholder for legendary
            const legendaryJoker = getRandomJoker('rare');
            return { ...runState, jokers: [...runState.jokers, legendaryJoker] };
          })();
    }
    
    case 'copyJokerAndDestroyOthers': {
      return runState.jokers.length === 0 
        ? runState
        : ((): RunState => {
            const randomJoker = runState.jokers[Math.floor(Math.random() * runState.jokers.length)];
            
            return !randomJoker 
              ? runState
              : ((): RunState => {
                  const copiedJoker = {
                    ...randomJoker,
                    id: `${randomJoker.id}_copy_${Date.now()}`,
                  };
                  
                  return { ...runState, jokers: [randomJoker, copiedJoker] };
                })();
          })();
    }
    
    case 'addNegativeToJoker': {
      return runState.jokers.length === 0 
        ? runState
        : ((): RunState => {
            // Add negative by increasing max jokers
            const stateWithMaxJokers = setMaxJokers(runState, runState.maxJokers + 1);
            
            // Reduce hand size
            const ectoPlasmCount = context.ectoPlasmUsageCount ?? 0;
            const totalHandSizeReduction = card.effect.handSizeChange * (ectoPlasmCount + 1);
            
            return setHandSize(stateWithMaxJokers, Math.max(1, stateWithMaxJokers.handSize + totalHandSizeReduction));
          })();
    }
    
    case 'addPolychromeToJokerAndDestroyOthers': {
      return runState.jokers.length === 0 
        ? runState
        : ((): RunState => {
            const randomJoker = runState.jokers[Math.floor(Math.random() * runState.jokers.length)];
            
            return !randomJoker 
              ? runState
              : { ...runState, jokers: [randomJoker] };
          })();
    }
    
    case 'upgradeAllPokerHands': {
      const handTypes: ReadonlyArray<PokerHandKey> = [
        'ROYAL_FLUSH', 'STRAIGHT_FLUSH', 'FOUR_OF_A_KIND', 'FULL_HOUSE',
        'FLUSH', 'STRAIGHT', 'THREE_OF_A_KIND', 'TWO_PAIR', 'PAIR', 'HIGH_CARD'
      ];
      
      const upgradeResult = handTypes.reduce(
        (state, handType) => levelUpPokerHand(state, handType),
        runState
      );
      
      return upgradeResult;
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
    
    case 'createJoker': {
      return runState.jokers.length >= runState.maxJokers 
        ? runState
        : ((): RunState => {
            const newJoker = getRandomJoker(card.effect.rarity);
            return { ...runState, jokers: [...runState.jokers, newJoker] };
          })();
    }
    
    case 'createPlanet':
      // Would need to implement planet card creation
      return runState;
      
    case 'duplicateJoker': {
      const selectedJokerIds = context.selectedJokerIds ?? [];
      
      return selectedJokerIds.length === 0 || runState.jokers.length >= runState.maxJokers 
        ? runState
        : ((): RunState => {
            const jokerToDuplicate = runState.jokers.find(j => j.id === selectedJokerIds[0]);
            
            return !jokerToDuplicate 
              ? runState
              : ((): RunState => {
                  const duplicatedJoker = {
                    ...jokerToDuplicate,
                    id: `${jokerToDuplicate.id}_copy_${Date.now()}`,
                  };
                  
                  return { ...runState, jokers: [...runState.jokers, duplicatedJoker] };
                })();
          })();
    }
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
        case 'addRandomEnhancement':
        case 'addSeal':
        case 'duplicateCard':
        case 'duplicateCardExact':
        case 'destroyCard':
        case 'changeRank':
        case 'changeRankWithHandSize':
        case 'changeSuit':
          return runState.deck.filter(c => c.type === 'playing').length > 0;
        case 'destroyCardInHand':
          return runState.deck.filter(c => c.type === 'playing').length >= consumable.effect.count;
        case 'destroyAndReplace':
          return runState.deck.filter(c => c.type === 'playing').length > 0;
        case 'createRareJoker':
        case 'createLegendaryJoker':
          return runState.jokers.length < runState.maxJokers;
        case 'copyJokerAndDestroyOthers':
        case 'addNegativeToJoker':
        case 'addPolychromeToJokerAndDestroyOthers':
          return runState.jokers.length > 0;
        case 'upgradeAllPokerHands':
          return true;
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
        case 'addRandomEnhancement':
          return { cards: consumable.effect.count };
        case 'addSeal':
          return { cards: consumable.effect.count };
        case 'duplicateCard':
          return { cards: consumable.effect.count };
        case 'duplicateCardExact':
          return { cards: 1 };
        case 'destroyCard':
          return { cards: consumable.effect.count };
        case 'changeRank':
        case 'changeRankWithHandSize':
        case 'changeSuit':
          return { cards: Infinity }; // All cards in hand
        case 'destroyCardInHand':
        case 'destroyAndReplace':
        case 'createRareJoker':
        case 'createLegendaryJoker':
        case 'copyJokerAndDestroyOthers':
        case 'addNegativeToJoker':
        case 'addPolychromeToJokerAndDestroyOthers':
        case 'upgradeAllPokerHands':
          return null;
      }
      break;
      
    case 'arcana':
      switch (consumable.effect.type) {
        case 'enhanceHand':
          return { cards: consumable.effect.count };
        case 'destroyJoker':
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