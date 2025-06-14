import type { Card } from './card.ts';
import { createStandardDeck, shuffleDeck } from './card.ts';

export interface DrawPile {
  readonly cards: ReadonlyArray<Card>;
  readonly discardPile: ReadonlyArray<Card>;
}

export function createDrawPile(cards?: ReadonlyArray<Card>): DrawPile {
  return {
    cards: shuffleDeck(cards ?? createStandardDeck()),
    discardPile: [],
  };
}

export function drawCards(
  pile: DrawPile,
  count: number
): [ReadonlyArray<Card>, DrawPile] {
  return count <= 0
    ? [[], pile]
    : drawCardsRecursive(pile, count, []);
}

function drawCardsRecursive(
  pile: DrawPile,
  remaining: number,
  drawnSoFar: ReadonlyArray<Card>
): [ReadonlyArray<Card>, DrawPile] {
  return remaining === 0
    ? [drawnSoFar, pile]
    : pile.cards.length === 0
    ? pile.discardPile.length === 0
      ? [drawnSoFar, pile] // No more cards to draw
      : drawCardsRecursive(
          { cards: shuffleDeck(pile.discardPile), discardPile: [] },
          remaining,
          drawnSoFar
        )
    : drawCardsRecursive(
        { cards: pile.cards.slice(1), discardPile: pile.discardPile },
        remaining - 1,
        [...drawnSoFar, pile.cards[0] as Card]
      );
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


export function addToDiscardPile(pile: DrawPile, cards: ReadonlyArray<Card>): DrawPile {
  return discardCards(pile, cards);
}

export function reshuffleIfNeeded(pile: DrawPile, neededCards: number): DrawPile {
  if (pile.cards.length >= neededCards) {
    return pile;
  }
  
  if (pile.discardPile.length === 0) {
    return pile;
  }
  
  return {
    cards: [...pile.cards, ...shuffleDeck(pile.discardPile)],
    discardPile: [],
  };
}