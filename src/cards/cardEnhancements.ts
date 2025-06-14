import type { Card, CardEnhancement } from './card.ts';

export function addEnhancementToCard(card: Card, enhancement: CardEnhancement): Card {
  return {
    ...card,
    enhancement,
  };
}

export function addRandomEnhancement(cards: ReadonlyArray<Card>, enhancement: CardEnhancement): ReadonlyArray<Card> {
  return cards.length === 0 
    ? cards
    : ((): ReadonlyArray<Card> => {
        const randomIndex = Math.floor(Math.random() * cards.length);
        return cards.map((card, index) => 
          index === randomIndex ? addEnhancementToCard(card, enhancement) : card
        );
      })();
}

export function addEnhancementToSelectedCard(
  cards: ReadonlyArray<Card>, 
  cardId: string, 
  enhancement: CardEnhancement
): ReadonlyArray<Card> {
  return cards.map(card => 
    card.id === cardId ? addEnhancementToCard(card, enhancement) : card
  );
}