export const SUITS = ['♠', '♥', '♦', '♣'] as const;
export const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const;

export type Suit = typeof SUITS[number];
export type Rank = typeof RANKS[number];

export type CardEnhancement = 'foil' | 'holographic' | 'polychrome';

export interface Card {
  readonly id: string;
  readonly suit: Suit;
  readonly rank: Rank;
  readonly enhancement?: CardEnhancement;
}

// Use timestamp and random number for unique IDs
export function createCard(suit: Suit, rank: Rank, enhancement?: CardEnhancement): Card {
  const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  return {
    id: `${rank}${suit}_${uniqueId}`,
    suit,
    rank,
    ...(enhancement ? { enhancement } : {}),
  };
}

export function getCardChipValue(card: Card): number {
  const rankIndex = RANKS.indexOf(card.rank);
  
  const baseValue = rankIndex < 0
    ? 0 // Default for invalid rank
    : rankIndex <= 8
    ? rankIndex + 2  // 2-10 have their face value
    : rankIndex <= 11
    ? 10  // J, Q, K have value 10
    : 11; // A has value 11
  
  // Apply enhancement bonuses
  return card.enhancement === 'foil'
    ? baseValue + 50 // Foil adds +50 chips
    : baseValue;
}

export function createStandardDeck(): ReadonlyArray<Card> {
  return SUITS.flatMap(suit => 
    RANKS.map(rank => createCard(suit, rank))
  );
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
  return index < 0 ? 0 : index + 2; // 2 is rank 0, so value is index + 2
}

// Fisher-Yates shuffle algorithm requires mutation for efficiency
/* eslint-disable functional/no-let, functional/immutable-data, functional/no-conditional-statements, functional/no-loop-statements */
export function shuffleDeck(deck: ReadonlyArray<Card>): ReadonlyArray<Card> {
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
/* eslint-enable functional/no-let, functional/immutable-data, functional/no-conditional-statements, functional/no-loop-statements */