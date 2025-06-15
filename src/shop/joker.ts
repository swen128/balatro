import type { Card } from '../cards';
import type { EvaluatedHand, ScoringEffect } from '../scoring';

type BaseJoker = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly rarity: 'common' | 'uncommon' | 'rare';
};

type JokerEffect =
  | { readonly type: 'flatChips'; readonly amount: number }
  | { readonly type: 'flatMult'; readonly amount: number }
  | { readonly type: 'multMult'; readonly amount: number }
  | { readonly type: 'chipsPerHeart'; readonly amount: number }
  | { readonly type: 'multPerDiamond'; readonly amount: number }
  | { readonly type: 'multIfContains'; readonly handType: string; readonly amount: number }
  | { readonly type: 'chipsIfPlayed'; readonly rank: string; readonly amount: number }
  | { readonly type: 'multPerPair'; readonly amount: number }
  | { readonly type: 'everyOtherHand'; readonly mult: number }
  | { readonly type: 'multIfNoFaceCards'; readonly mult: number }
  | { readonly type: 'chipsForRemainingDiscards'; readonly chipsPerDiscard: number }
  | { readonly type: 'multIfNoDiscards'; readonly mult: number }
  | { readonly type: 'multIfExactCards'; readonly cardCount: number; readonly mult: number }
  | { readonly type: 'multIfMaxCards'; readonly maxCards: number; readonly mult: number }
  | { readonly type: 'chipsForEvenRanks'; readonly chips: number }
  | { readonly type: 'multForEvenRanks'; readonly mult: number }
  | { readonly type: 'multForOddRanks'; readonly mult: number }
  | { readonly type: 'multPerSpecificRanks'; readonly ranks: ReadonlyArray<string>; readonly mult: number }
  | { readonly type: 'chipsForOddRanks'; readonly chips: number }
  | { readonly type: 'multPerSuit'; readonly suits: ReadonlyArray<string>; readonly mult: number }
  | { readonly type: 'chipsPerSuit'; readonly suits: ReadonlyArray<string>; readonly chips: number }
  | { readonly type: 'chipsPerFaceCard'; readonly chips: number }
  | { readonly type: 'multPerFaceCard'; readonly mult: number }
  | { readonly type: 'multIfAllSameSuit'; readonly mult: number }
  | { readonly type: 'chipsIfContainsRank'; readonly rank: string; readonly chips: number; readonly mult: number }
  | { readonly type: 'chipsAndMultPerRank'; readonly rank: string; readonly chips: number; readonly mult: number }
  | { readonly type: 'chipsAndMultPerRanks'; readonly ranks: ReadonlyArray<string>; readonly chips: number; readonly mult: number }
  | { readonly type: 'scalingChips'; readonly baseAmount: number; readonly trigger: 'handPlayed' | 'cardDiscarded' | 'moneyEarned'; readonly scalingValue: number }
  | { readonly type: 'scalingMult'; readonly baseAmount: number; readonly trigger: 'handPlayed' | 'cardDiscarded' | 'moneyEarned'; readonly scalingValue: number };

export type Joker = BaseJoker & JokerEffect;

export interface JokerContext {
  readonly playedCards: ReadonlyArray<Card>;
  readonly evaluatedHand: EvaluatedHand;
  readonly handsPlayed: number;
  readonly discardsRemaining?: number;
  readonly heldCards?: ReadonlyArray<Card>;
}

export function evaluateJokerEffect(
  joker: Joker, 
  context: JokerContext
): ReadonlyArray<ScoringEffect> {
  const { playedCards, evaluatedHand, handsPlayed } = context;
  
  const createEffect = (type: ScoringEffect['type'], value: number): ScoringEffect => ({
    type,
    value,
    source: joker.name,
  });
  
  switch (joker.type) {
    case 'flatChips':
      return [createEffect('addChips', joker.amount)];
      
    case 'flatMult':
      return [createEffect('addMult', joker.amount)];
      
    case 'multMult':
      return [createEffect('multiplyMult', joker.amount)];
      
    case 'chipsPerHeart': {
      const heartCount = playedCards.filter(card => card.suit === '♥').length;
      return heartCount > 0
        ? [createEffect('addChips', joker.amount * heartCount)]
        : [];
    }
    
    case 'multPerDiamond': {
      const diamondCount = playedCards.filter(card => card.suit === '♦').length;
      return diamondCount > 0
        ? [createEffect('addMult', joker.amount * diamondCount)]
        : [];
    }
    
    case 'multIfContains':
      return evaluatedHand.handType.name.toLowerCase().includes(joker.handType.toLowerCase())
        ? [createEffect('addMult', joker.amount)]
        : [];
    
    case 'chipsIfPlayed': {
      const hasRank = playedCards.some(card => card.rank === joker.rank);
      return hasRank
        ? [createEffect('addChips', joker.amount)]
        : [];
    }
    
    case 'multPerPair': {
      // Count pairs in the scoring cards
      const rankCounts = new Map<string, number>();
      for (const card of evaluatedHand.scoringCards) {
        const count = rankCounts.get(card.rank) ?? 0;
        rankCounts.set(card.rank, count + 1);
      }
      const pairCount = Array.from(rankCounts.values()).filter(count => count >= 2).length;
      
      return pairCount > 0
        ? [createEffect('addMult', joker.amount * pairCount)]
        : [];
    }
    
    case 'everyOtherHand':
      // Triggers on even-numbered hands (2nd, 4th, 6th, etc.)
      return handsPlayed % 2 === 0
        ? [createEffect('addMult', joker.mult)]
        : [];
    
    case 'multIfNoFaceCards': {
      const hasFaceCard = playedCards.some(card => 
        card.rank === 'J' || card.rank === 'Q' || card.rank === 'K'
      );
      return !hasFaceCard
        ? [createEffect('addMult', joker.mult)]
        : [];
    }
    
    case 'chipsForRemainingDiscards':
      return context.discardsRemaining !== undefined && context.discardsRemaining > 0
        ? [createEffect('addChips', joker.chipsPerDiscard * context.discardsRemaining)]
        : [];
    
    case 'multIfNoDiscards':
      return context.discardsRemaining === 0
        ? [createEffect('addMult', joker.mult)]
        : [];
    
    case 'multIfExactCards':
      return playedCards.length === joker.cardCount
        ? [createEffect('addMult', joker.mult)]
        : [];
    
    case 'multIfMaxCards':
      return playedCards.length <= joker.maxCards
        ? [createEffect('addMult', joker.mult)]
        : [];
    
    case 'chipsForEvenRanks': {
      const evenRankCount = playedCards.filter(card => {
        const rankValue = card.rank === 'A' ? 1
          : card.rank === 'J' ? 11
          : card.rank === 'Q' ? 12
          : card.rank === 'K' ? 13
          : parseInt(card.rank, 10);
        return rankValue % 2 === 0;
      }).length;
      
      return evenRankCount > 0
        ? [createEffect('addChips', joker.chips * evenRankCount)]
        : [];
    }
    
    case 'multForEvenRanks': {
      const evenRankCount = playedCards.filter(card => {
        const rankValue = card.rank === 'A' ? 1
          : card.rank === 'J' ? 11
          : card.rank === 'Q' ? 12
          : card.rank === 'K' ? 13
          : parseInt(card.rank, 10);
        return rankValue % 2 === 0;
      }).length;
      
      return evenRankCount > 0
        ? [createEffect('addMult', joker.mult * evenRankCount)]
        : [];
    }
    
    case 'multForOddRanks': {
      const oddRankCount = playedCards.filter(card => {
        const rankValue = card.rank === 'A' ? 1
          : card.rank === 'J' ? 11
          : card.rank === 'Q' ? 12
          : card.rank === 'K' ? 13
          : parseInt(card.rank, 10);
        return rankValue % 2 === 1;
      }).length;
      
      return oddRankCount > 0
        ? [createEffect('addMult', joker.mult * oddRankCount)]
        : [];
    }
    
    case 'multPerSpecificRanks': {
      const rankCount = playedCards.filter(card => 
        joker.ranks.includes(card.rank)
      ).length;
      
      return rankCount > 0
        ? [createEffect('addMult', joker.mult * rankCount)]
        : [];
    }
    
    case 'chipsForOddRanks': {
      const oddRankCount = playedCards.filter(card => {
        const rankValue = card.rank === 'A' ? 1
          : card.rank === 'J' ? 11
          : card.rank === 'Q' ? 12
          : card.rank === 'K' ? 13
          : parseInt(card.rank, 10);
        return rankValue % 2 === 1;
      }).length;
      
      return oddRankCount > 0
        ? [createEffect('addChips', joker.chips * oddRankCount)]
        : [];
    }
    
    case 'multPerSuit': {
      const suitCounts = joker.suits.map(suit => 
        playedCards.filter(card => card.suit === suit).length
      );
      const totalCount = suitCounts.reduce((sum, count) => sum + count, 0);
      
      return totalCount > 0
        ? [createEffect('addMult', joker.mult * totalCount)]
        : [];
    }
    
    case 'chipsPerSuit': {
      const suitCounts = joker.suits.map(suit => 
        playedCards.filter(card => card.suit === suit).length
      );
      const totalCount = suitCounts.reduce((sum, count) => sum + count, 0);
      
      return totalCount > 0
        ? [createEffect('addChips', joker.chips * totalCount)]
        : [];
    }
    
    case 'chipsPerFaceCard': {
      const faceCardCount = playedCards.filter(card => 
        card.rank === 'J' || card.rank === 'Q' || card.rank === 'K'
      ).length;
      
      return faceCardCount > 0
        ? [createEffect('addChips', joker.chips * faceCardCount)]
        : [];
    }
    
    case 'multPerFaceCard': {
      const faceCardCount = playedCards.filter(card => 
        card.rank === 'J' || card.rank === 'Q' || card.rank === 'K'
      ).length;
      
      return faceCardCount > 0
        ? [createEffect('addMult', joker.mult * faceCardCount)]
        : [];
    }
    
    case 'multIfAllSameSuit': {
      return playedCards.length === 0
        ? []
        : ((): ReadonlyArray<ScoringEffect> => {
            const firstSuit = playedCards[0]?.suit;
            const allSameSuit = firstSuit !== undefined && playedCards.every(card => card.suit === firstSuit);
            
            return allSameSuit
              ? [createEffect('multiplyMult', joker.mult)]
              : [];
          })();
    }
    
    case 'chipsIfContainsRank': {
      const rankCount = playedCards.filter(card => card.rank === joker.rank).length;
      return rankCount === 0
        ? []
        : [
            ...(joker.chips > 0 
              ? [{
                  type: 'addChips' as const,
                  value: joker.chips * rankCount,
                  source: joker.name,
                }]
              : []),
            ...(joker.mult !== undefined && joker.mult > 0
              ? [{
                  type: 'addMult' as const,
                  value: joker.mult * rankCount,
                  source: joker.name,
                }]
              : []),
          ];
    }
    case 'chipsAndMultPerRank': {
      const rankCount = playedCards.filter(card => card.rank === joker.rank).length;
      return rankCount === 0
        ? []
        : [
            ...(joker.chips > 0 
              ? [createEffect('addChips', joker.chips * rankCount)]
              : []),
            ...(joker.mult > 0
              ? [createEffect('addMult', joker.mult * rankCount)]
              : []),
          ];
    }
    
    case 'chipsAndMultPerRanks': {
      const rankCount = playedCards.filter(card => 
        joker.ranks.includes(card.rank)
      ).length;
      return rankCount === 0
        ? []
        : [
            ...(joker.chips > 0 
              ? [createEffect('addChips', joker.chips * rankCount)]
              : []),
            ...(joker.mult > 0
              ? [createEffect('addMult', joker.mult * rankCount)]
              : []),
          ];
    }
    
    case 'scalingChips': {
      const scalingValue = joker.scalingValue ?? 0;
      return scalingValue > 0
        ? [createEffect('addChips', scalingValue)]
        : [];
    }
    
    case 'scalingMult': {
      const scalingValue = joker.scalingValue ?? 0;
      // For multiplicative scaling (like Obelisk, Lucky Cat), use multiplyMult if value > 1
      // For additive scaling (like Flash Card, Red Card), use addMult
      return joker.baseAmount < 1 && scalingValue >= 1
        ? scalingValue > 1
          ? [createEffect('multiplyMult', scalingValue)]
          : []
        : scalingValue > 0
          ? [createEffect('addMult', scalingValue)]
          : [];
    }
  }
}

export function evaluateAllJokers(
  jokers: ReadonlyArray<Joker>,
  context: JokerContext
): ReadonlyArray<ScoringEffect> {
  return jokers.flatMap(joker => evaluateJokerEffect(joker, context));
}


// Predefined jokers
export const JOKERS: ReadonlyArray<Joker> = [
  {
    id: 'joker-1',
    name: 'Joker',
    description: '+4 Mult',
    rarity: 'common',
    type: 'flatMult',
    amount: 4
  },
  {
    id: 'joker-2',
    name: 'Greedy Joker',
    description: 'Played cards with ♦ suit give +3 Mult each',
    rarity: 'common',
    type: 'multPerDiamond',
    amount: 3
  },
  {
    id: 'joker-3',
    name: 'Lusty Joker',
    description: 'Played cards with ♥ suit give +20 Chips each',
    rarity: 'common',
    type: 'chipsPerHeart',
    amount: 20
  },
  {
    id: 'joker-4',
    name: 'Wrathful Joker',
    description: 'Played cards with ♠ suit give +3 Mult each',
    rarity: 'common',
    type: 'multPerSuit',
    suits: ['♠'],
    mult: 3
  },
  {
    id: 'joker-5',
    name: 'Gluttenous Joker',
    description: 'Played cards with ♣ suit give +20 Chips each',
    rarity: 'common',
    type: 'chipsPerSuit',
    suits: ['♣'],
    chips: 20
  },
  {
    id: 'joker-6',
    name: 'Jolly Joker',
    description: '+8 Mult if hand contains a Pair',
    rarity: 'common',
    type: 'multIfContains',
    handType: 'pair',
    amount: 8
  },
  {
    id: 'joker-7',
    name: 'Zany Joker',
    description: '+12 Mult if hand contains a Three of a Kind',
    rarity: 'uncommon',
    type: 'multIfContains',
    handType: 'three',
    amount: 12
  },
  {
    id: 'joker-8',
    name: 'Mad Joker',
    description: '+20 Mult if hand contains a Four of a Kind',
    rarity: 'uncommon',
    type: 'multIfContains',
    handType: 'four',
    amount: 20
  },
  {
    id: 'joker-9',
    name: 'Crazy Joker',
    description: '+12 Mult if hand contains a Straight',
    rarity: 'uncommon',
    type: 'multIfContains',
    handType: 'straight',
    amount: 12
  },
  {
    id: 'joker-10',
    name: 'Droll Joker',
    description: '+10 Mult if hand contains a Flush',
    rarity: 'uncommon',
    type: 'multIfContains',
    handType: 'flush',
    amount: 10
  },
  {
    id: 'joker-11',
    name: 'Half Joker',
    description: '+20 Mult if played hand contains 3 or fewer cards',
    rarity: 'common',
    type: 'multIfMaxCards',
    maxCards: 3,
    mult: 20
  },
  {
    id: 'joker-12',
    name: 'Joker Stencil',
    description: 'x1 Mult for each empty Joker slot',
    rarity: 'uncommon',
    type: 'multMult',
    amount: 1
  },
  {
    id: 'joker-13',
    name: 'Four Fingers',
    description: 'All Flushes and Straights can be made with 4 cards',
    rarity: 'uncommon',
    type: 'flatMult',
    amount: 0
  },
  {
    id: 'joker-14',
    name: 'Mime',
    description: 'Retrigger all played cards',
    rarity: 'uncommon',
    type: 'flatMult',
    amount: 0
  },
  {
    id: 'joker-15',
    name: 'Credit Card',
    description: 'Go up to -$20 in debt',
    rarity: 'common',
    type: 'flatMult',
    amount: 0
  },
  {
    id: 'joker-16',
    name: 'Ceremonial Dagger',
    description: 'When Blind is selected, destroy Joker to the right and permanently add double its sell value to this Mult',
    rarity: 'uncommon',
    type: 'scalingMult',
    baseAmount: 0,
    trigger: 'handPlayed',
    scalingValue: 0
  },
  {
    id: 'joker-17',
    name: 'Banner',
    description: '+30 Chips for each remaining discard',
    rarity: 'common',
    type: 'chipsForRemainingDiscards',
    chipsPerDiscard: 30
  },
  {
    id: 'joker-18',
    name: 'Mystic Summit',
    description: '+15 Mult when 0 discards remaining',
    rarity: 'common',
    type: 'multIfNoDiscards',
    mult: 15
  },
  {
    id: 'joker-19',
    name: 'Marble Joker',
    description: 'Adds one Stone card to deck when Blind is selected',
    rarity: 'uncommon',
    type: 'flatMult',
    amount: 0
  },
  {
    id: 'joker-20',
    name: 'Loyalty Card',
    description: 'x4 Mult every 6 hands played',
    rarity: 'uncommon',
    type: 'multMult',
    amount: 4
  },
  {
    id: 'joker-21',
    name: '8 Ball',
    description: '1 in 4 chance for each played 8 to create a Tarot card',
    rarity: 'common',
    type: 'flatMult',
    amount: 0
  },
  {
    id: 'joker-22',
    name: 'Misprint',
    description: '+? Mult',
    rarity: 'common',
    type: 'flatMult',
    amount: 23
  },
  {
    id: 'joker-23',
    name: 'Raised Fist',
    description: 'Adds double the rank of held cards to Mult',
    rarity: 'common',
    type: 'flatMult',
    amount: 0
  },
  {
    id: 'joker-24',
    name: 'Chaos the Clown',
    description: '1 free Reroll per shop',
    rarity: 'common',
    type: 'flatMult',
    amount: 0
  },
  {
    id: 'joker-25',
    name: 'Scary Face',
    description: 'Played face cards give +30 Chips when scored',
    rarity: 'common',
    type: 'chipsPerFaceCard',
    chips: 30
  },
  {
    id: 'joker-26',
    name: 'Abstract Joker',
    description: '+3 Mult for each Joker',
    rarity: 'common',
    type: 'flatMult',
    amount: 3
  },
  {
    id: 'joker-27',
    name: 'Delayed Gratification',
    description: 'Earn $2 per discard if no discards used by end of round',
    rarity: 'common',
    type: 'flatMult',
    amount: 0
  },
  {
    id: 'joker-28',
    name: 'Gros Michel',
    description: '+15 Mult, 1 in 4 chance to be destroyed at end of round',
    rarity: 'common',
    type: 'flatMult',
    amount: 15
  },
  {
    id: 'joker-29',
    name: 'Even Steven',
    description: 'Played cards with even rank give +4 Mult',
    rarity: 'common',
    type: 'multForEvenRanks',
    mult: 4
  },
  {
    id: 'joker-30',
    name: 'Odd Todd',
    description: 'Played cards with odd rank give +30 Chips',
    rarity: 'common',
    type: 'chipsForOddRanks',
    chips: 30
  },
  {
    id: 'joker-31',
    name: 'Scholar',
    description: 'Played Aces give +20 Chips and +4 Mult',
    rarity: 'common',
    type: 'chipsAndMultPerRank',
    rank: 'A',
    chips: 20,
    mult: 4
  },
  {
    id: 'joker-32',
    name: 'Business Card',
    description: 'Played face cards have a 1 in 2 chance to give $2',
    rarity: 'common',
    type: 'flatMult',
    amount: 0
  },
  {
    id: 'joker-33',
    name: 'Supernova',
    description: 'Adds the number of times poker hand has been played to Mult',
    rarity: 'common',
    type: 'flatMult',
    amount: 1
  },
  {
    id: 'joker-34',
    name: 'Ride the Bus',
    description: '+1 Mult per consecutive hand without a face card',
    rarity: 'common',
    type: 'scalingMult',
    baseAmount: 1,
    trigger: 'handPlayed',
    scalingValue: 0
  },
  {
    id: 'joker-35',
    name: 'Space Joker',
    description: '1 in 4 chance to upgrade level of played hand',
    rarity: 'uncommon',
    type: 'flatMult',
    amount: 0
  },
  {
    id: 'joker-35a',
    name: 'Walkie Talkie',
    description: 'Each played 10 or 4 gives +10 Chips and +2 Mult',
    rarity: 'common',
    type: 'chipsAndMultPerRanks',
    ranks: ['10', '4'],
    chips: 10,
    mult: 2
  },
  {
    id: 'joker-35b',
    name: 'Shoot the Moon',
    description: 'Each Queen held in hand gives +13 Mult',
    rarity: 'common',
    type: 'flatMult',
    amount: 0
  },
  {
    id: 'joker-35c',
    name: 'Hack',
    description: 'Retrigger each played 2, 3, 4, or 5',
    rarity: 'uncommon',
    type: 'flatMult',
    amount: 0
  },
  {
    id: 'joker-35d',
    name: 'Stuntman',
    description: '+250 Chips, -2 hand size',
    rarity: 'uncommon',
    type: 'flatChips',
    amount: 250
  },
  {
    id: 'joker-35e',
    name: 'Supernova',
    description: 'Adds the number of times poker hand has been played to Mult',
    rarity: 'common',
    type: 'flatMult',
    amount: 0
  },
  {
    id: 'joker-35f',
    name: 'Ride the Bus',
    description: '+1 Mult per consecutive hand played without a face card. Resets when face card is played',
    rarity: 'common',
    type: 'flatMult',
    amount: 0
  },
  {
    id: 'joker-35g',
    name: 'Wee Joker',
    description: 'Each played 2 gives +8 Chips when scored',
    rarity: 'common',
    type: 'chipsIfContainsRank',
    rank: '2',
    chips: 8,
    mult: 0
  },
  {
    id: 'joker-35h',
    name: 'Sock and Buskin',
    description: 'Retrigger all played face cards',
    rarity: 'uncommon',
    type: 'flatMult',
    amount: 0
  },
  {
    id: 'joker-35i',
    name: 'Fibonacci',
    description: 'Each played Ace, 2, 3, 5, or 8 gives +8 Mult when scored',
    rarity: 'uncommon',
    type: 'multPerSpecificRanks',
    ranks: ['A', '2', '3', '5', '8'],
    mult: 8
  },
  {
    id: 'joker-35j',
    name: 'Castle',
    description: 'This Joker gains +3 Chips per discarded card, suit changes every round',
    rarity: 'uncommon',
    type: 'scalingChips',
    baseAmount: 3,
    trigger: 'cardDiscarded',
    scalingValue: 0
  },
  {
    id: 'joker-35k',
    name: 'Smiley Face',
    description: 'Played face cards give +4 Mult when scored',
    rarity: 'common',
    type: 'multPerFaceCard',
    mult: 4
  },
  {
    id: 'joker-35l',
    name: 'Reserved Parking',
    description: 'Each face card held in hand has a 1 in 2 chance to give $1',
    rarity: 'common',
    type: 'flatMult',
    amount: 0
  },
  {
    id: 'joker-35m',
    name: 'Mail-In Rebate',
    description: 'Earn $3 for each discard used, rank changes every round',
    rarity: 'common',
    type: 'flatMult',
    amount: 0
  },
  {
    id: 'joker-35n',
    name: 'Seeing Double',
    description: 'x2 Mult if played hand has a scoring Club card and a scoring card of any other suit',
    rarity: 'uncommon',
    type: 'flatMult',
    amount: 0
  },
  {
    id: 'joker-35o',
    name: 'Hit the Road',
    description: 'x0.5 Mult for every Jack discarded this round',
    rarity: 'rare',
    type: 'multMult',
    amount: 1
  },
  {
    id: 'joker-s1',
    name: 'Egg',
    description: 'Gains $3 of sell value at end of round',
    rarity: 'common',
    type: 'flatMult',
    amount: 0
  },
  {
    id: 'joker-s2',
    name: 'Runner',
    description: 'This Joker gains +15 Chips if played hand contains a Straight',
    rarity: 'common',
    type: 'scalingChips',
    baseAmount: 15,
    trigger: 'handPlayed',
    scalingValue: 15
  },
  {
    id: 'joker-s3',
    name: 'Ice Cream',
    description: '+100 Chips, -5 Chips for every hand played',
    rarity: 'common',
    type: 'scalingChips',
    baseAmount: -5,
    trigger: 'handPlayed',
    scalingValue: 100
  },
  {
    id: 'joker-s4',
    name: 'DNA',
    description: 'If first hand of round has only 1 card, permanently duplicate it and add it to your deck',
    rarity: 'rare',
    type: 'flatMult',
    amount: 0
  },
  {
    id: 'joker-s5',
    name: 'Rocket',
    description: 'Earn $1 at end of round, Payout increases by $2 when Boss Blind is defeated',
    rarity: 'uncommon',
    type: 'flatMult',
    amount: 0
  },
  {
    id: 'joker-s6',
    name: 'Obelisk',
    description: 'This Joker gains x0.2 Mult per consecutive hand played without playing your most played hand',
    rarity: 'rare',
    type: 'scalingMult',
    baseAmount: 0.2,
    trigger: 'handPlayed',
    scalingValue: 1
  },
  {
    id: 'joker-s7',
    name: 'Lucky Cat',
    description: 'This Joker gains x0.25 Mult each time a Lucky card successfully triggers',
    rarity: 'uncommon',
    type: 'scalingMult',
    baseAmount: 0.25,
    trigger: 'handPlayed',
    scalingValue: 1
  },
  {
    id: 'joker-s8',
    name: 'Flash Card',
    description: 'This Joker gains +20 Mult per reroll in the shop',
    rarity: 'uncommon',
    type: 'scalingMult',
    baseAmount: 20,
    trigger: 'moneyEarned',
    scalingValue: 0
  },
  {
    id: 'joker-s9',
    name: 'Popcorn',
    description: '+20 Mult, -4 Mult per round played',
    rarity: 'common',
    type: 'scalingMult',
    baseAmount: -4,
    trigger: 'handPlayed',
    scalingValue: 0
  },
  {
    id: 'joker-s10',
    name: 'Ramen',
    description: 'x2 Mult, loses x0.01 Mult per card discarded',
    rarity: 'uncommon',
    type: 'scalingMult',
    baseAmount: -0.01,
    trigger: 'cardDiscarded',
    scalingValue: 2
  },
  {
    id: 'joker-s11',
    name: 'Seltzer',
    description: 'Retrigger all cards played for the next 10 hands',
    rarity: 'uncommon',
    type: 'flatMult',
    amount: 0
  },
  {
    id: 'joker-s12',
    name: 'Red Card',
    description: 'This Joker gains +3 Mult when any Booster Pack is skipped',
    rarity: 'common',
    type: 'scalingMult',
    baseAmount: 3,
    trigger: 'moneyEarned',
    scalingValue: 0
  },
  {
    id: 'joker-36',
    name: 'Cavendish',
    description: 'x3 Mult, 1 in 1000 chance to be destroyed at end of round',
    rarity: 'rare',
    type: 'multMult',
    amount: 3
  },
  {
    id: 'joker-37',
    name: 'Baron',
    description: 'Each King held in hand gives x1.5 Mult',
    rarity: 'rare',
    type: 'multMult',
    amount: 1.5
  },
  {
    id: 'joker-38',
    name: 'The Duo',
    description: 'x2 Mult if played hand contains a Pair',
    rarity: 'rare',
    type: 'multMult',
    amount: 2
  },
  {
    id: 'joker-39',
    name: 'The Trio',
    description: 'x3 Mult if played hand contains a Three of a Kind',
    rarity: 'rare',
    type: 'multMult',
    amount: 3
  },
  {
    id: 'joker-40',
    name: 'The Family',
    description: 'x4 Mult if played hand contains a Four of a Kind',
    rarity: 'rare',
    type: 'multMult',
    amount: 4
  }
];

export function getRandomJoker(rarity?: 'common' | 'uncommon' | 'rare'): Joker {
  const filteredJokers = rarity 
    ? JOKERS.filter(joker => joker.rarity === rarity)
    : JOKERS;
  
  const jokersToUse = filteredJokers.length === 0 ? JOKERS : filteredJokers;
  const randomIndex = Math.floor(Math.random() * jokersToUse.length);
  const selectedJoker = jokersToUse[randomIndex] ?? JOKERS[0];
  
  // Return a new instance with a unique ID
  return selectedJoker 
    ? {
        ...selectedJoker,
        id: `${selectedJoker.id}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      }
    : {
        id: `joker-default_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name: 'Default Joker',
        description: '+4 Mult',
        rarity: 'common',
        type: 'flatMult', amount: 4,
      };
}

