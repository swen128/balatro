import type { PlayingCard } from './cardTypes.ts';

export const SUITS = ['♠', '♥', '♦', '♣'] as const;
export const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const;

export type Suit = typeof SUITS[number];
export type Rank = typeof RANKS[number];

export type CardEnhancement = 'foil' | 'holographic' | 'polychrome' | 'glass';

// Re-export PlayingCard as Card for backward compatibility
export type Card = PlayingCard;

// Use timestamp and random number for unique IDs
export function createCard(suit: Suit, rank: Rank, enhancement?: CardEnhancement): PlayingCard {
  const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  return {
    type: 'playing' as const,
    id: `${rank}${suit}_${uniqueId}`,
    suit,
    rank,
    ...(enhancement ? { enhancement } : {}),
  };
}

function getBaseChipValue(rank: Rank): number {
  return {
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "10": 10,
    "J": 10,
    "Q": 10,
    "K": 10,
    "A": 11,
  }[rank]
}

export function getCardChipValue(card: PlayingCard): number {
  const baseValue = getBaseChipValue(card.rank);
  return card.enhancement === 'foil'
    ? baseValue + 50
    : baseValue;
}

export function createStandardDeck(): ReadonlyArray<PlayingCard> {
  return SUITS.flatMap(suit =>
    RANKS.map(rank => createCard(suit, rank))
  );
}

export function isRedSuit(suit: Suit): boolean {
  return suit === '♥' || suit === '♦';
}


export function getRankIndex(rank: Rank): number {
  return RANKS.indexOf(rank);
}

// Fisher-Yates shuffle algorithm requires mutation for efficiency
/* eslint-disable functional/no-let, functional/no-conditional-statements */
export function shuffleDeck(deck: ReadonlyArray<PlayingCard>): ReadonlyArray<PlayingCard> {
  const shuffled = [...deck];
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

/* eslint-enable functional/no-let, functional/no-conditional-statements */

export function isSameSuit(card1: PlayingCard, card2: PlayingCard): boolean {
  return card1.suit === card2.suit;
}

export function isSameRank(card1: PlayingCard, card2: PlayingCard): boolean {
  return card1.rank === card2.rank;
}

export function compareRanks(rank1: Rank, rank2: Rank): number {
  const index1 = getRankIndex(rank1);
  const index2 = getRankIndex(rank2);
  return index1 - index2;
}

export function sortCards(cards: ReadonlyArray<PlayingCard>): ReadonlyArray<PlayingCard> {
  return [...cards].sort((a, b) => {
    const rankCompare = compareRanks(a.rank, b.rank);
    return rankCompare !== 0
      ? rankCompare
      : SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit);
  });
}