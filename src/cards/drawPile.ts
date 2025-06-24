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

function drawFromMainPile(
  pile: DrawPile,
  remaining: number,
  drawnSoFar: ReadonlyArray<Card>,
  firstCard: Card
): [ReadonlyArray<Card>, DrawPile] {
  return drawCardsRecursive(
    { cards: pile.cards.slice(1), discardPile: pile.discardPile },
    remaining - 1,
    [...drawnSoFar, firstCard]
  );
}

function reshuffleDiscardAndDraw(
  pile: DrawPile,
  remaining: number,
  drawnSoFar: ReadonlyArray<Card>
): [ReadonlyArray<Card>, DrawPile] {
  return drawCardsRecursive(
    { cards: shuffleDeck(pile.discardPile), discardPile: [] },
    remaining,
    drawnSoFar
  );
}

function drawCardsRecursive(
  pile: DrawPile,
  remaining: number,
  drawnSoFar: ReadonlyArray<Card>
): [ReadonlyArray<Card>, DrawPile] {
  const firstCard = pile.cards[0];
  const firstDiscardCard = pile.discardPile[0];
  
  return remaining === 0
    ? [drawnSoFar, pile]
    : firstCard !== undefined
    ? drawFromMainPile(pile, remaining, drawnSoFar, firstCard)
    : firstDiscardCard !== undefined
    ? reshuffleDiscardAndDraw(pile, remaining, drawnSoFar)
    : [drawnSoFar, pile];
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

function reshuffleDiscardIntoDraw(pile: DrawPile): DrawPile {
  return {
    cards: [...pile.cards, ...shuffleDeck(pile.discardPile)],
    discardPile: [],
  };
}

export function reshuffleIfNeeded(pile: DrawPile, neededCards: number): DrawPile {
  return pile.cards.length >= neededCards
    ? pile
    : pile.discardPile.length > 0
    ? reshuffleDiscardIntoDraw(pile)
    : pile;
}