import type { Card } from './card.ts';
import type { EvaluatedHand } from './pokerHands.ts';
import type { ScoringEffect } from './scoring.ts';

export interface Joker {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly rarity: 'common' | 'uncommon' | 'rare';
  readonly effect: JokerEffect;
}

export type JokerEffect =
  | { readonly type: 'flatChips'; readonly amount: number }
  | { readonly type: 'flatMult'; readonly amount: number }
  | { readonly type: 'multMult'; readonly amount: number }
  | { readonly type: 'chipsPerHeart'; readonly amount: number }
  | { readonly type: 'multPerDiamond'; readonly amount: number }
  | { readonly type: 'multIfContains'; readonly handType: string; readonly amount: number }
  | { readonly type: 'chipsIfPlayed'; readonly rank: string; readonly amount: number }
  | { readonly type: 'multPerPair'; readonly amount: number }
  | { readonly type: 'everyOtherHand'; readonly mult: number };

export interface JokerContext {
  readonly playedCards: ReadonlyArray<Card>;
  readonly evaluatedHand: EvaluatedHand;
  readonly handsPlayed: number;
}

export function evaluateJokerEffect(
  joker: Joker, 
  context: JokerContext
): ScoringEffect | null {
  const { effect } = joker;
  const { playedCards, evaluatedHand, handsPlayed } = context;
  
  switch (effect.type) {
    case 'flatChips':
      return {
        type: 'addChips',
        value: effect.amount,
        source: joker.name,
      };
      
    case 'flatMult':
      return {
        type: 'addMult',
        value: effect.amount,
        source: joker.name,
      };
      
    case 'multMult':
      return {
        type: 'multiplyMult',
        value: effect.amount,
        source: joker.name,
      };
      
    case 'chipsPerHeart': {
      const heartCount = playedCards.filter(card => card.suit === '♥').length;
      if (heartCount > 0) {
        return {
          type: 'addChips',
          value: effect.amount * heartCount,
          source: joker.name,
        };
      }
      return null;
    }
    
    case 'multPerDiamond': {
      const diamondCount = playedCards.filter(card => card.suit === '♦').length;
      if (diamondCount > 0) {
        return {
          type: 'addMult',
          value: effect.amount * diamondCount,
          source: joker.name,
        };
      }
      return null;
    }
    
    case 'multIfContains': {
      if (evaluatedHand.handType.name.toLowerCase().includes(effect.handType.toLowerCase())) {
        return {
          type: 'addMult',
          value: effect.amount,
          source: joker.name,
        };
      }
      return null;
    }
    
    case 'chipsIfPlayed': {
      const hasRank = playedCards.some(card => card.rank === effect.rank);
      if (hasRank) {
        return {
          type: 'addChips',
          value: effect.amount,
          source: joker.name,
        };
      }
      return null;
    }
    
    case 'multPerPair': {
      // Count pairs in the hand
      const rankCounts = new Map<string, number>();
      for (const card of playedCards) {
        const count = rankCounts.get(card.rank) ?? 0;
        rankCounts.set(card.rank, count + 1);
      }
      const pairCount = Array.from(rankCounts.values()).filter(count => count >= 2).length;
      
      if (pairCount > 0) {
        return {
          type: 'addMult',
          value: effect.amount * pairCount,
          source: joker.name,
        };
      }
      return null;
    }
    
    case 'everyOtherHand': {
      // Triggers on even-numbered hands (2nd, 4th, 6th, etc.)
      if (handsPlayed % 2 === 0) {
        return {
          type: 'addMult',
          value: effect.mult,
          source: joker.name,
        };
      }
      return null;
    }
  }
}

export function evaluateAllJokers(
  jokers: ReadonlyArray<Joker>,
  context: JokerContext
): ReadonlyArray<ScoringEffect> {
  const effects: ScoringEffect[] = [];
  
  for (const joker of jokers) {
    const effect = evaluateJokerEffect(joker, context);
    if (effect) {
      effects.push(effect);
    }
  }
  
  return effects;
}

// Predefined jokers
export const JOKERS: ReadonlyArray<Joker> = [
  {
    id: 'joker-1',
    name: 'Joker',
    description: '+4 Mult',
    rarity: 'common',
    effect: { type: 'flatMult', amount: 4 },
  },
  {
    id: 'joker-2',
    name: 'Greedy Joker',
    description: 'Played cards with ♦ suit give +3 Mult each',
    rarity: 'common',
    effect: { type: 'multPerDiamond', amount: 3 },
  },
  {
    id: 'joker-3',
    name: 'Lusty Joker',
    description: 'Played cards with ♥ suit give +20 Chips each',
    rarity: 'common',
    effect: { type: 'chipsPerHeart', amount: 20 },
  },
  {
    id: 'joker-4',
    name: 'Wrathful Joker',
    description: 'Played cards with ♠ suit give +3 Mult each',
    rarity: 'common',
    effect: { type: 'multPerDiamond', amount: 3 },
  },
  {
    id: 'joker-5',
    name: 'Gluttenous Joker',
    description: 'Played cards with ♣ suit give +20 Chips each',
    rarity: 'common',
    effect: { type: 'chipsPerHeart', amount: 20 },
  },
  {
    id: 'joker-6',
    name: 'Jolly Joker',
    description: '+8 Mult if hand contains a Pair',
    rarity: 'common',
    effect: { type: 'multIfContains', handType: 'pair', amount: 8 },
  },
  {
    id: 'joker-7',
    name: 'Zany Joker',
    description: '+12 Mult if hand contains a Three of a Kind',
    rarity: 'uncommon',
    effect: { type: 'multIfContains', handType: 'three', amount: 12 },
  },
  {
    id: 'joker-8',
    name: 'Mad Joker',
    description: '+20 Mult if hand contains a Four of a Kind',
    rarity: 'uncommon',
    effect: { type: 'multIfContains', handType: 'four', amount: 20 },
  },
  {
    id: 'joker-9',
    name: 'Crazy Joker',
    description: '+12 Mult if hand contains a Straight',
    rarity: 'uncommon',
    effect: { type: 'multIfContains', handType: 'straight', amount: 12 },
  },
  {
    id: 'joker-10',
    name: 'Droll Joker',
    description: '+10 Mult if hand contains a Flush',
    rarity: 'uncommon',
    effect: { type: 'multIfContains', handType: 'flush', amount: 10 },
  },
  {
    id: 'joker-11',
    name: 'Half Joker',
    description: '+20 Mult if played hand contains 3 or fewer cards',
    rarity: 'common',
    effect: { type: 'flatMult', amount: 20 }, // Simplified for now
  },
  {
    id: 'joker-12',
    name: 'Joker Stencil',
    description: 'x1 Mult for each empty Joker slot',
    rarity: 'uncommon',
    effect: { type: 'multMult', amount: 1 }, // Simplified for now
  },
  {
    id: 'joker-13',
    name: 'Four Fingers',
    description: 'All Flushes and Straights can be made with 4 cards',
    rarity: 'uncommon',
    effect: { type: 'flatMult', amount: 0 }, // Special effect, handled elsewhere
  },
  {
    id: 'joker-14',
    name: 'Mime',
    description: 'Retrigger all played cards',
    rarity: 'uncommon',
    effect: { type: 'flatMult', amount: 0 }, // Special effect, handled elsewhere
  },
  {
    id: 'joker-15',
    name: 'Credit Card',
    description: 'Go up to -$20 in debt',
    rarity: 'common',
    effect: { type: 'flatMult', amount: 0 }, // Special effect, handled elsewhere
  },
  {
    id: 'joker-16',
    name: 'Ceremonial Dagger',
    description: 'When Blind is selected, destroy Joker to the right and permanently add double its sell value to this Mult',
    rarity: 'uncommon',
    effect: { type: 'flatMult', amount: 0 }, // Starts at 0, grows over time
  },
  {
    id: 'joker-17',
    name: 'Banner',
    description: '+30 Chips for each remaining discard',
    rarity: 'common',
    effect: { type: 'flatChips', amount: 30 }, // Simplified for now
  },
  {
    id: 'joker-18',
    name: 'Mystic Summit',
    description: '+15 Mult when 0 discards remaining',
    rarity: 'common',
    effect: { type: 'flatMult', amount: 15 }, // Simplified for now
  },
  {
    id: 'joker-19',
    name: 'Marble Joker',
    description: 'Adds one Stone card to deck when Blind is selected',
    rarity: 'uncommon',
    effect: { type: 'flatMult', amount: 0 }, // Special effect, handled elsewhere
  },
  {
    id: 'joker-20',
    name: 'Loyalty Card',
    description: 'x4 Mult every 6 hands played',
    rarity: 'uncommon',
    effect: { type: 'multMult', amount: 4 }, // Simplified for now
  },
  {
    id: 'joker-21',
    name: '8 Ball',
    description: '1 in 4 chance for each played 8 to create a Tarot card',
    rarity: 'common',
    effect: { type: 'flatMult', amount: 0 }, // Special effect, handled elsewhere
  },
  {
    id: 'joker-22',
    name: 'Misprint',
    description: '+? Mult',
    rarity: 'common',
    effect: { type: 'flatMult', amount: 23 }, // Random between 0-23
  },
  {
    id: 'joker-23',
    name: 'Raised Fist',
    description: 'Adds double the rank of held cards to Mult',
    rarity: 'common',
    effect: { type: 'flatMult', amount: 0 }, // Special calculation needed
  },
  {
    id: 'joker-24',
    name: 'Chaos the Clown',
    description: '1 free Reroll per shop',
    rarity: 'common',
    effect: { type: 'flatMult', amount: 0 }, // Special effect, handled elsewhere
  },
  {
    id: 'joker-25',
    name: 'Scary Face',
    description: 'Played face cards give +30 Chips when scored',
    rarity: 'common',
    effect: { type: 'chipsIfPlayed', rank: 'J', amount: 30 }, // Simplified for now
  },
  {
    id: 'joker-26',
    name: 'Abstract Joker',
    description: '+3 Mult for each Joker',
    rarity: 'common',
    effect: { type: 'flatMult', amount: 3 }, // Simplified for now
  },
  {
    id: 'joker-27',
    name: 'Delayed Gratification',
    description: 'Earn $2 per discard if no discards used by end of round',
    rarity: 'common',
    effect: { type: 'flatMult', amount: 0 }, // Special effect, handled elsewhere
  },
  {
    id: 'joker-28',
    name: 'Gros Michel',
    description: '+15 Mult, 1 in 4 chance to be destroyed at end of round',
    rarity: 'common',
    effect: { type: 'flatMult', amount: 15 },
  },
  {
    id: 'joker-29',
    name: 'Even Steven',
    description: 'Played cards with even rank give +4 Mult',
    rarity: 'common',
    effect: { type: 'flatMult', amount: 4 }, // Simplified for now
  },
  {
    id: 'joker-30',
    name: 'Odd Todd',
    description: 'Played cards with odd rank give +30 Chips',
    rarity: 'common',
    effect: { type: 'flatChips', amount: 30 }, // Simplified for now
  },
  {
    id: 'joker-31',
    name: 'Scholar',
    description: 'Played Aces give +20 Chips and +4 Mult',
    rarity: 'common',
    effect: { type: 'chipsIfPlayed', rank: 'A', amount: 20 },
  },
  {
    id: 'joker-32',
    name: 'Business Card',
    description: 'Played face cards have a 1 in 2 chance to give $2',
    rarity: 'common',
    effect: { type: 'flatMult', amount: 0 }, // Special effect, handled elsewhere
  },
  {
    id: 'joker-33',
    name: 'Supernova',
    description: 'Adds the number of times poker hand has been played to Mult',
    rarity: 'common',
    effect: { type: 'flatMult', amount: 1 }, // Simplified for now
  },
  {
    id: 'joker-34',
    name: 'Ride the Bus',
    description: '+1 Mult per consecutive hand without a face card',
    rarity: 'common',
    effect: { type: 'flatMult', amount: 0 }, // Grows over time
  },
  {
    id: 'joker-35',
    name: 'Space Joker',
    description: '1 in 4 chance to upgrade level of played hand',
    rarity: 'uncommon',
    effect: { type: 'flatMult', amount: 0 }, // Special effect, handled elsewhere
  },
];