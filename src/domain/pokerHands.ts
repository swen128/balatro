import type { Card, Rank, Suit } from './card.ts';
import { getRankIndex } from './card.ts';

export interface PokerHandType {
  readonly name: string;
  readonly baseChips: number;
  readonly baseMult: number;
  readonly level: number; // for ranking hands
}

export const POKER_HANDS = {
  HIGH_CARD: { name: 'High Card', baseChips: 5, baseMult: 1, level: 0 },
  PAIR: { name: 'Pair', baseChips: 10, baseMult: 2, level: 1 },
  TWO_PAIR: { name: 'Two Pair', baseChips: 20, baseMult: 2, level: 2 },
  THREE_OF_A_KIND: { name: 'Three of a Kind', baseChips: 30, baseMult: 3, level: 3 },
  STRAIGHT: { name: 'Straight', baseChips: 30, baseMult: 4, level: 4 },
  FLUSH: { name: 'Flush', baseChips: 35, baseMult: 4, level: 5 },
  FULL_HOUSE: { name: 'Full House', baseChips: 40, baseMult: 4, level: 6 },
  FOUR_OF_A_KIND: { name: 'Four of a Kind', baseChips: 60, baseMult: 7, level: 7 },
  STRAIGHT_FLUSH: { name: 'Straight Flush', baseChips: 100, baseMult: 8, level: 8 },
  ROYAL_FLUSH: { name: 'Royal Flush', baseChips: 100, baseMult: 8, level: 9 },
} as const;

export interface EvaluatedHand {
  readonly handType: PokerHandType;
  readonly scoringCards: ReadonlyArray<Card>;
  readonly kickers: ReadonlyArray<Card>;
}

function countRanks(cards: ReadonlyArray<Card>): Map<Rank, number> {
  const counts = new Map<Rank, number>();
  for (const card of cards) {
    const count = counts.get(card.rank);
    counts.set(card.rank, (count !== undefined ? count : 0) + 1);
  }
  return counts;
}

function countSuits(cards: ReadonlyArray<Card>): Map<Suit, number> {
  const counts = new Map<Suit, number>();
  for (const card of cards) {
    const count = counts.get(card.suit);
    counts.set(card.suit, (count !== undefined ? count : 0) + 1);
  }
  return counts;
}

function getRankCounts(cards: ReadonlyArray<Card>): Array<[Rank, number]> {
  const counts = countRanks(cards);
  return Array.from(counts.entries()).sort((a, b) => {
    // Sort by count descending, then by rank descending
    if (b[1] !== a[1]) {
      return b[1] - a[1];
    }
    const rankA = a[0];
    const rankB = b[0];
    if (!rankA || !rankB) {
      return 0;
    }
    return getRankIndex(rankB) - getRankIndex(rankA);
  });
}

function checkStraight(cards: ReadonlyArray<Card>): ReadonlyArray<Card> | null {
  if (cards.length < 5) return null;
  
  // Get unique ranks sorted by index
  const uniqueRanks = Array.from(new Set(cards.map(c => c.rank)))
    .sort((a, b) => getRankIndex(a) - getRankIndex(b));
  
  // Check for regular straights
  for (let i = 0; i <= uniqueRanks.length - 5; i++) {
    let isSequential = true;
    for (let j = 0; j < 4; j++) {
      const currentRank = uniqueRanks[i + j];
      const nextRank = uniqueRanks[i + j + 1];
      if (!currentRank || !nextRank) {
        isSequential = false;
        break;
      }
      if (getRankIndex(nextRank) !== getRankIndex(currentRank) + 1) {
        isSequential = false;
        break;
      }
    }
    
    if (isSequential) {
      // Return the 5 cards that form the straight
      const straightRanks = uniqueRanks.slice(i, i + 5);
      const straightCards: Card[] = [];
      for (const rank of straightRanks) {
        const card = cards.find(c => c.rank === rank);
        if (card) straightCards.push(card);
      }
      return straightCards;
    }
  }
  
  // Check for A-2-3-4-5 straight
  if (uniqueRanks.includes('A') && uniqueRanks.includes('2') && 
      uniqueRanks.includes('3') && uniqueRanks.includes('4') && 
      uniqueRanks.includes('5')) {
    const straightCards: Card[] = [];
    for (const rank of ['A', '2', '3', '4', '5'] as const) {
      const card = cards.find(c => c.rank === rank);
      if (card) straightCards.push(card);
    }
    return straightCards;
  }
  
  return null;
}

function checkFlush(cards: ReadonlyArray<Card>): ReadonlyArray<Card> | null {
  const suitCounts = countSuits(cards);
  
  for (const [suit, count] of suitCounts.entries()) {
    if (count >= 5) {
      return cards.filter(c => c.suit === suit).slice(0, 5);
    }
  }
  
  return null;
}

export function evaluatePokerHand(cards: ReadonlyArray<Card>): EvaluatedHand {
  if (cards.length === 0 || cards.length > 5) {
    throw new Error('Invalid number of cards for poker hand evaluation');
  }
  
  const rankCounts = getRankCounts(cards);
  const flushCards = checkFlush(cards);
  const straightCards = checkStraight(cards);
  
  // Check for straight flush / royal flush
  if (flushCards && straightCards) {
    const straightFlushCards = checkStraight(flushCards);
    if (straightFlushCards) {
      // Check if it's a royal flush (10-J-Q-K-A)
      const ranks = straightFlushCards.map(c => c.rank);
      if (ranks.includes('10') && ranks.includes('J') && 
          ranks.includes('Q') && ranks.includes('K') && 
          ranks.includes('A')) {
        return {
          handType: POKER_HANDS.ROYAL_FLUSH,
          scoringCards: straightFlushCards,
          kickers: [],
        };
      }
      return {
        handType: POKER_HANDS.STRAIGHT_FLUSH,
        scoringCards: straightFlushCards,
        kickers: [],
      };
    }
  }
  
  // Check for four of a kind
  const firstCount = rankCounts[0];
  if (firstCount && firstCount[1] === 4) {
    const scoringCards = cards.filter(c => c.rank === firstCount[0]);
    const kickers = cards.filter(c => c.rank !== firstCount[0]);
    return {
      handType: POKER_HANDS.FOUR_OF_A_KIND,
      scoringCards,
      kickers,
    };
  }
  
  // Check for full house
  const firstCountFH = rankCounts[0];
  const secondCountFH = rankCounts[1];
  if (firstCountFH && firstCountFH[1] === 3 && 
      secondCountFH && secondCountFH[1] >= 2) {
    const tripRank = firstCountFH[0];
    const pairRank = secondCountFH[0];
    const scoringCards = [
      ...cards.filter(c => c.rank === tripRank),
      ...cards.filter(c => c.rank === pairRank).slice(0, 2),
    ];
    return {
      handType: POKER_HANDS.FULL_HOUSE,
      scoringCards,
      kickers: [],
    };
  }
  
  // Check for flush
  if (flushCards) {
    return {
      handType: POKER_HANDS.FLUSH,
      scoringCards: flushCards,
      kickers: [],
    };
  }
  
  // Check for straight
  if (straightCards) {
    return {
      handType: POKER_HANDS.STRAIGHT,
      scoringCards: straightCards,
      kickers: [],
    };
  }
  
  // Check for three of a kind
  const firstCount3K = rankCounts[0];
  if (firstCount3K && firstCount3K[1] === 3) {
    const scoringCards = cards.filter(c => c.rank === firstCount3K[0]);
    const kickers = cards.filter(c => c.rank !== firstCount3K[0]);
    return {
      handType: POKER_HANDS.THREE_OF_A_KIND,
      scoringCards,
      kickers,
    };
  }
  
  // Check for two pair
  const firstCount2P = rankCounts[0];
  const secondCount2P = rankCounts[1];
  if (firstCount2P && firstCount2P[1] === 2 && 
      secondCount2P && secondCount2P[1] === 2) {
    const pair1Rank = firstCount2P[0];
    const pair2Rank = secondCount2P[0];
    const scoringCards = cards.filter(c => c.rank === pair1Rank || c.rank === pair2Rank);
    const kickers = cards.filter(c => c.rank !== pair1Rank && c.rank !== pair2Rank);
    return {
      handType: POKER_HANDS.TWO_PAIR,
      scoringCards,
      kickers,
    };
  }
  
  // Check for pair
  const firstCountP = rankCounts[0];
  if (firstCountP && firstCountP[1] === 2) {
    const scoringCards = cards.filter(c => c.rank === firstCountP[0]);
    const kickers = cards.filter(c => c.rank !== firstCountP[0]);
    return {
      handType: POKER_HANDS.PAIR,
      scoringCards,
      kickers,
    };
  }
  
  // High card
  return {
    handType: POKER_HANDS.HIGH_CARD,
    scoringCards: cards.slice(0, 1), // Highest card
    kickers: cards.slice(1),
  };
}