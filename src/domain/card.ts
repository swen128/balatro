export const SUITS = ['♠', '♥', '♦', '♣'] as const;
export const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const;

export type Suit = typeof SUITS[number];
export type Rank = typeof RANKS[number];

export interface Card {
  readonly id: string;
  readonly suit: Suit;
  readonly rank: Rank;
}

export function createCard(suit: Suit, rank: Rank): Card {
  return {
    id: `${rank}${suit}`,
    suit,
    rank,
  };
}

export function getCardChipValue(card: Card): number {
  const rankIndex = RANKS.indexOf(card.rank);
  if (rankIndex < 0) {
    throw new Error(`Invalid rank: ${card.rank}`);
  }
  
  // 2-10 have their face value
  if (rankIndex <= 8) {
    return rankIndex + 2;
  }
  
  // J, Q, K have value 10
  if (rankIndex <= 11) {
    return 10;
  }
  
  // A has value 11
  return 11;
}

export function createStandardDeck(): ReadonlyArray<Card> {
  const deck: Card[] = [];
  
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push(createCard(suit, rank));
    }
  }
  
  return deck;
}

export function isRedSuit(suit: Suit): boolean {
  return suit === '♥' || suit === '♦';
}

export function isBlackSuit(suit: Suit): boolean {
  return suit === '♠' || suit === '♣';
}

export function getRankIndex(rank: Rank): number {
  return RANKS.indexOf(rank);
}

export function getRankValue(rank: Rank): number {
  const index = getRankIndex(rank);
  if (index < 0) {
    throw new Error(`Invalid rank: ${rank}`);
  }
  return index + 2; // 2 is rank 0, so value is index + 2
}