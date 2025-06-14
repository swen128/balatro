import type { Card } from './card.ts';

export interface DrawPile {
  readonly cards: ReadonlyArray<Card>;
  readonly discardPile: ReadonlyArray<Card>;
}

export function createDrawPile(cards: ReadonlyArray<Card>): DrawPile {
  return {
    cards: shuffle(cards),
    discardPile: [],
  };
}

export function drawCards(
  pile: DrawPile,
  count: number
): { pile: DrawPile; drawnCards: ReadonlyArray<Card> } {
  if (count <= 0) {
    return { pile, drawnCards: [] };
  }
  
  let availableCards = [...pile.cards];
  let discardPile = [...pile.discardPile];
  const drawnCards: Card[] = [];
  
  for (let i = 0; i < count; i++) {
    if (availableCards.length === 0) {
      // Reshuffle discard pile if we run out of cards
      if (discardPile.length === 0) {
        break; // No more cards to draw
      }
      availableCards = shuffle(discardPile);
      discardPile = [];
    }
    
    const card = availableCards.shift();
    if (card) {
      drawnCards.push(card);
    }
  }
  
  return {
    pile: {
      cards: availableCards,
      discardPile,
    },
    drawnCards,
  };
}

export function discardCards(
  pile: DrawPile,
  cards: ReadonlyArray<Card>
): DrawPile {
  return {
    cards: pile.cards,
    discardPile: [...pile.discardPile, ...cards],
  };
}

export function getRemainingCardCount(pile: DrawPile): number {
  return pile.cards.length + pile.discardPile.length;
}

function shuffle<T>(array: ReadonlyArray<T>): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    const jItem = shuffled[j];
    if (temp !== undefined && jItem !== undefined) {
      shuffled[i] = jItem;
      shuffled[j] = temp;
    }
  }
  return shuffled;
}