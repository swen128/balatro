import type { Card, Rank, Suit } from '../cards';
import { getRankIndex } from '../cards';
import { filterDefined } from '../utils/array.ts';

interface PokerHandType {
  readonly name: string;
  readonly rank: number;
  readonly baseChips: number;
  readonly baseMult: number;
}

export interface EvaluatedHand {
  readonly handType: PokerHandType;
  readonly scoringCards: ReadonlyArray<Card>;
  readonly kickers: ReadonlyArray<Card>;
}

export const POKER_HANDS = {
  ROYAL_FLUSH: { name: 'Royal Flush', rank: 10, baseChips: 100, baseMult: 8 },
  STRAIGHT_FLUSH: { name: 'Straight Flush', rank: 9, baseChips: 100, baseMult: 8 },
  FOUR_OF_A_KIND: { name: 'Four of a Kind', rank: 8, baseChips: 60, baseMult: 7 },
  FULL_HOUSE: { name: 'Full House', rank: 7, baseChips: 40, baseMult: 4 },
  FLUSH: { name: 'Flush', rank: 6, baseChips: 35, baseMult: 4 },
  STRAIGHT: { name: 'Straight', rank: 5, baseChips: 30, baseMult: 4 },
  THREE_OF_A_KIND: { name: 'Three of a Kind', rank: 4, baseChips: 30, baseMult: 3 },
  TWO_PAIR: { name: 'Two Pair', rank: 3, baseChips: 20, baseMult: 2 },
  PAIR: { name: 'Pair', rank: 2, baseChips: 10, baseMult: 2 },
  HIGH_CARD: { name: 'High Card', rank: 1, baseChips: 5, baseMult: 1 },
} as const;

export type PokerHandKey = keyof typeof POKER_HANDS;

export interface HandLevels {
  readonly ROYAL_FLUSH: number;
  readonly STRAIGHT_FLUSH: number;
  readonly FOUR_OF_A_KIND: number;
  readonly FULL_HOUSE: number;
  readonly FLUSH: number;
  readonly STRAIGHT: number;
  readonly THREE_OF_A_KIND: number;
  readonly TWO_PAIR: number;
  readonly PAIR: number;
  readonly HIGH_CARD: number;
}

type RankCount = [Rank, number];

function getRankCounts(cards: ReadonlyArray<Card>): ReadonlyArray<RankCount> {
  const counts = new Map<Rank, number>();
  
  for (const card of cards) {
    const count = counts.get(card.rank) ?? 0;
    counts.set(card.rank, count + 1);
  }
  
  return Array.from(counts.entries())
    .sort((a, b) => {
      // Sort by count descending, then by rank descending
      const countDiff = b[1] - a[1];
      return countDiff !== 0 
        ? countDiff 
        : getRankIndex(b[0]) - getRankIndex(a[0]);
    });
}

function countSuits(cards: ReadonlyArray<Card>): Map<Suit, number> {
  const counts = new Map<Suit, number>();
  
  for (const card of cards) {
    const count = counts.get(card.suit) ?? 0;
    counts.set(card.suit, count + 1);
  }
  
  return counts;
}

function checkStraight(cards: ReadonlyArray<Card>): ReadonlyArray<Card> | null {
  const sortedByRank = [...cards].sort((a, b) => getRankIndex(b.rank) - getRankIndex(a.rank));
  
  // Remove duplicates by rank
  const uniqueRanks = Array.from(new Set(sortedByRank.map(c => c.rank)));
  const uniqueCards = filterDefined(
    uniqueRanks.map(rank => sortedByRank.find(c => c.rank === rank))
  );
  
  return uniqueCards.length < 5
    ? checkAceLowStraight(uniqueCards)
    : checkRegularStraight(uniqueCards);
}

function checkRegularStraight(uniqueCards: ReadonlyArray<Card>): ReadonlyArray<Card> | null {
  // Check for regular straight
  const firstStraightIndex = uniqueCards.findIndex((_, i) => {
    const cardsNeeded = uniqueCards.slice(i, i + 5);
    return cardsNeeded.length === 5 && isConsecutive(cardsNeeded);
  });
  
  return firstStraightIndex !== -1
    ? uniqueCards.slice(firstStraightIndex, firstStraightIndex + 5)
    : checkAceLowStraight(uniqueCards);
}

function checkAceLowStraight(uniqueCards: ReadonlyArray<Card>): ReadonlyArray<Card> | null {
  // Check for A-2-3-4-5 straight (wheel)
  const ace = uniqueCards.find(c => c.rank === 'A');
  const two = uniqueCards.find(c => c.rank === '2');
  const three = uniqueCards.find(c => c.rank === '3');
  const four = uniqueCards.find(c => c.rank === '4');
  const five = uniqueCards.find(c => c.rank === '5');
  
  return ace !== undefined && two !== undefined && three !== undefined && 
         four !== undefined && five !== undefined
    ? [five, four, three, two, ace]
    : null;
}

function isConsecutive(cards: ReadonlyArray<Card>): boolean {
  return cards.slice(1).every((card, i) => {
    const prevCard = cards[i];
    return prevCard !== undefined
      ? getRankIndex(prevCard.rank) - getRankIndex(card.rank) === 1
      : false;
  });
}

function checkFlush(cards: ReadonlyArray<Card>): ReadonlyArray<Card> | null {
  const suitCounts = countSuits(cards);
  
  const flushSuit = Array.from(suitCounts.entries())
    .find(([, count]) => count >= 5)?.[0];
  
  return flushSuit 
    ? cards.filter(c => c.suit === flushSuit).slice(0, 5)
    : null;
}

export function evaluatePokerHand(cards: ReadonlyArray<Card>): EvaluatedHand {
  const defaultHand: EvaluatedHand = {
    handType: POKER_HANDS.HIGH_CARD,
    scoringCards: cards.slice(0, 1),
    kickers: cards.slice(1),
  };
  
  return cards.length === 0 || cards.length > 5
    ? defaultHand
    : evaluateValidHand(cards);
}

function evaluateValidHand(cards: ReadonlyArray<Card>): EvaluatedHand {
  const rankCounts = getRankCounts(cards);
  const flushCards = checkFlush(cards);
  const straightCards = checkStraight(cards);
  const straightFlushCards = flushCards ? checkStraight(flushCards) : null;
  
  // Check for royal flush / straight flush
  return straightFlushCards !== null
    ? ((): EvaluatedHand => {
        const ranks = straightFlushCards.map(c => c.rank);
        return ranks.includes('10') && ranks.includes('J') && 
            ranks.includes('Q') && ranks.includes('K') && 
            ranks.includes('A')
          ? {
              handType: POKER_HANDS.ROYAL_FLUSH,
              scoringCards: straightFlushCards,
              kickers: [],
            }
          : {
              handType: POKER_HANDS.STRAIGHT_FLUSH,
              scoringCards: straightFlushCards,
              kickers: [],
            };
      })()
    : evaluateNonStraightFlush(cards, rankCounts, flushCards, straightCards);
}

function evaluateNonStraightFlush(
  cards: ReadonlyArray<Card>,
  rankCounts: ReadonlyArray<RankCount>,
  flushCards: ReadonlyArray<Card> | null,
  straightCards: ReadonlyArray<Card> | null
): EvaluatedHand {
  const firstCount = rankCounts[0];
  const secondCount = rankCounts[1];
  
  // Check for four of a kind
  return firstCount !== undefined && firstCount[1] === 4
    ? {
        handType: POKER_HANDS.FOUR_OF_A_KIND,
        scoringCards: cards.filter(c => c.rank === firstCount[0]),
        kickers: cards.filter(c => c.rank !== firstCount[0]),
      }
    // Check for full house
    : firstCount !== undefined && firstCount[1] === 3 && 
      secondCount !== undefined && secondCount[1] >= 2
    ? {
        handType: POKER_HANDS.FULL_HOUSE,
        scoringCards: [
          ...cards.filter(c => c.rank === firstCount[0]),
          ...cards.filter(c => c.rank === secondCount[0]).slice(0, 2),
        ],
        kickers: [],
      }
    // Check for flush
    : flushCards !== null
    ? {
        handType: POKER_HANDS.FLUSH,
        scoringCards: flushCards,
        kickers: [],
      }
    // Check for straight
    : straightCards !== null
    ? {
        handType: POKER_HANDS.STRAIGHT,
        scoringCards: straightCards,
        kickers: [],
      }
    // Check for three of a kind
    : firstCount !== undefined && firstCount[1] === 3
    ? {
        handType: POKER_HANDS.THREE_OF_A_KIND,
        scoringCards: cards.filter(c => c.rank === firstCount[0]),
        kickers: cards.filter(c => c.rank !== firstCount[0]),
      }
    // Check for two pair
    : firstCount !== undefined && firstCount[1] === 2 && 
      secondCount !== undefined && secondCount[1] === 2
    ? {
        handType: POKER_HANDS.TWO_PAIR,
        scoringCards: cards.filter(c => c.rank === firstCount[0] || c.rank === secondCount[0]),
        kickers: cards.filter(c => c.rank !== firstCount[0] && c.rank !== secondCount[0]),
      }
    // Check for pair
    : firstCount !== undefined && firstCount[1] === 2
    ? {
        handType: POKER_HANDS.PAIR,
        scoringCards: cards.filter(c => c.rank === firstCount[0]),
        kickers: cards.filter(c => c.rank !== firstCount[0]),
      }
    // High card
    : {
        handType: POKER_HANDS.HIGH_CARD,
        scoringCards: cards.slice(0, 1),
        kickers: cards.slice(1),
      };
}



export function getPokerHandByName(name: string): PokerHandType | undefined {
  return Object.values(POKER_HANDS).find(hand => hand.name === name);
}

