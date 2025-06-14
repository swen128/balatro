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
    : ((): [ReadonlyArray<Card>, DrawPile] => {
        const firstCard = pile.cards[0];
        return firstCard !== undefined
          ? drawCardsRecursive(
              { cards: pile.cards.slice(1), discardPile: pile.discardPile },
              remaining - 1,
              [...drawnSoFar, firstCard]
            )
          : ((): [ReadonlyArray<Card>, DrawPile] => {
              const firstDiscardCard = pile.discardPile[0];
              return firstDiscardCard !== undefined
                ? drawCardsRecursive(
                    { cards: shuffleDeck(pile.discardPile), discardPile: [] },
                    remaining,
                    drawnSoFar
                  )
                : [drawnSoFar, pile]; // No more cards to draw
            })();
      })();
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

export function addToDiscardPile(pile: DrawPile, cards: ReadonlyArray<Card>): DrawPile {
  return discardCards(pile, cards);
}

export function reshuffleIfNeeded(pile: DrawPile, neededCards: number): DrawPile {
  return pile.cards.length >= neededCards
    ? pile
    : ((): DrawPile => {
        const firstDiscardCard = pile.discardPile[0];
        return firstDiscardCard !== undefined
          ? {
              cards: [...pile.cards, ...shuffleDeck(pile.discardPile)],
              discardPile: [],
            }
          : pile;
      })();
}