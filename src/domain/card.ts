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

let cardIdCounter = 0;

export function createCard(suit: Suit, rank: Rank, enhancement?: CardEnhancement): Card {
  return {
    id: `${rank}${suit}_${++cardIdCounter}`,
    suit,
    rank,
    ...(enhancement ? { enhancement } : {}),
  };
}

export function getCardChipValue(card: Card): number {
  const rankIndex = RANKS.indexOf(card.rank);
  if (rankIndex < 0) {
    throw new Error(`Invalid rank: ${card.rank}`);
  }
  
  let baseValue: number;
  
  // 2-10 have their face value
  if (rankIndex <= 8) {
    baseValue = rankIndex + 2;
  }
  // J, Q, K have value 10
  else if (rankIndex <= 11) {
    baseValue = 10;
  }
  // A has value 11
  else {
    baseValue = 11;
  }
  
  // Apply enhancement bonuses
  if (card.enhancement === 'foil') {
    return baseValue + 50; // Foil adds +50 chips
  }
  
  return baseValue;
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