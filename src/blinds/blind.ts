export interface BlindType {
  readonly type: 'small' | 'big';
  readonly name: string;
  readonly scoreMultiplier: number;
  readonly cashReward: number;
  readonly isBoss: false;
}

export const SMALL_BLIND: BlindType = {
  type: 'small',
  name: 'Small Blind',
  scoreMultiplier: 1,
  cashReward: 3,
  isBoss: false,
};

export const BIG_BLIND: BlindType = {
  type: 'big',
  name: 'Big Blind',
  scoreMultiplier: 1.5,
  cashReward: 4,
  isBoss: false,
};

import type { BossBlind } from './bossEffects.ts';

const BOSS_BLINDS: ReadonlyArray<BossBlind> = [
  {
    type: 'boss',
    name: 'The Window',
    scoreMultiplier: 2,
    cashReward: 5,
    isBoss: true,
    effects: [{
      kind: 'preScoring',
      type: 'firstHandScoresZero',
    }],
    effectDescription: 'First played hand scores 0 chips',
  },
  {
    type: 'boss',
    name: 'The Hook',
    scoreMultiplier: 2,
    cashReward: 5,
    isBoss: true,
    effects: [{
      kind: 'handSelection',
      type: 'discardRandomCards',
      count: 2,
    }],
    effectDescription: 'Discards 2 random cards per hand',
  },
  {
    type: 'boss',
    name: 'The Ox',
    scoreMultiplier: 2,
    cashReward: 5,
    isBoss: true,
    effects: [{
      kind: 'postScoring',
      type: 'setMoneyToZero',
      condition: 'mostPlayedHand',
    }],
    effectDescription: 'Playing a #1 hand sets money to $0',
  },
  {
    type: 'boss',
    name: 'The Wall',
    scoreMultiplier: 2,
    cashReward: 5,
    isBoss: true,
    effects: [{
      kind: 'preScoring',
      type: 'debuffAllCardsInHand',
    }],
    effectDescription: 'All cards are debuffed',
  },
  {
    type: 'boss',
    name: 'The Needle',
    scoreMultiplier: 2,
    cashReward: 5,
    isBoss: true,
    effects: [{
      kind: 'scoringModifier',
      type: 'onlyOneHandType',
      handType: '', // Will be set randomly when boss is selected
    }],
    effectDescription: 'Only one hand type scores',
  },
  {
    type: 'boss',
    name: 'The Goad',
    scoreMultiplier: 2,
    cashReward: 5,
    isBoss: true,
    effects: [{
      kind: 'scoringModifier',
      type: 'suitGivesNoChips',
      suit: '♠',
    }],
    effectDescription: 'Spades give no Chips',
  },
  {
    type: 'boss',
    name: 'The Psychic',
    scoreMultiplier: 2,
    cashReward: 5,
    isBoss: true,
    effects: [{
      kind: 'handSelection',
      type: 'exactCardCount',
      count: 5,
    }],
    effectDescription: 'Must play 5 cards',
  },
  {
    type: 'boss',
    name: 'The Fish',
    scoreMultiplier: 2,
    cashReward: 5,
    isBoss: true,
    effects: [{
      kind: 'cardVisibility',
      type: 'cardsStartFaceDown',
    }],
    effectDescription: 'Cards drawn face down',
  },
  {
    type: 'boss',
    name: 'The Club',
    scoreMultiplier: 2,
    cashReward: 5,
    isBoss: true,
    effects: [{
      kind: 'scoringModifier',
      type: 'suitGivesNoChips',
      suit: '♣',
    }],
    effectDescription: 'Clubs give no Chips',
  },
  {
    type: 'boss',
    name: 'The Diamond',
    scoreMultiplier: 2,
    cashReward: 5,
    isBoss: true,
    effects: [{
      kind: 'scoringModifier',
      type: 'suitGivesNoChips',
      suit: '♦',
    }],
    effectDescription: 'Diamonds give no Chips',
  },
  {
    type: 'boss',
    name: 'The Heart',
    scoreMultiplier: 2,
    cashReward: 5,
    isBoss: true,
    effects: [{
      kind: 'scoringModifier',
      type: 'suitGivesNoChips',
      suit: '♥',
    }],
    effectDescription: 'Hearts give no Chips',
  },
  {
    type: 'boss',
    name: 'The Spade',
    scoreMultiplier: 2,
    cashReward: 5,
    isBoss: true,
    effects: [{
      kind: 'scoringModifier',
      type: 'suitGivesNoChips',
      suit: '♠',
    }],
    effectDescription: 'Spades give no Chips',
  },
  {
    type: 'boss',
    name: 'The Arm',
    scoreMultiplier: 2,
    cashReward: 5,
    isBoss: true,
    effects: [{
      kind: 'scoringModifier',
      type: 'decreaseHandLevel',
      amount: -1,
    }],
    effectDescription: 'Decrease level of played poker hands by 1',
  },
];

export function getBlindScoreGoal(ante: number, blind: BlindType | BossBlind): number {
  const baseScores = [
    100,  // Ante 1
    300,  // Ante 2
    800,  // Ante 3
    2000, // Ante 4
    5000, // Ante 5
    11000, // Ante 6
    20000, // Ante 7
    35000, // Ante 8
  ];
  
  const baseScore = ante <= 8
    ? baseScores[ante - 1] ?? 100
    : Math.floor(35000 * Math.pow(1.6, ante - 8));
  
  return Math.floor(baseScore * blind.scoreMultiplier);
}


export function getRandomBossBlind(): BossBlind {
  const index = Math.floor(Math.random() * BOSS_BLINDS.length);
  const boss = BOSS_BLINDS[index];
  
  return !boss
    ? {
        type: 'boss',
        name: 'The Wall',
        scoreMultiplier: 2,
        cashReward: 8,
        isBoss: true,
        effects: [],
        effectDescription: 'No effect',
      }
    : boss.name === 'The Needle'
    ? ((): BossBlind => {
        const handTypes = [
          'Pair', 'Two Pair', 'Three of a Kind', 'Straight', 
          'Flush', 'Full House', 'Four of a Kind', 'Straight Flush'
        ];
        const selectedHandType = handTypes[Math.floor(Math.random() * handTypes.length)] ?? 'Pair';
        
        return {
          ...boss,
          effects: [{
            kind: 'scoringModifier',
            type: 'onlyOneHandType',
            handType: selectedHandType,
          }],
          effectDescription: `Only ${selectedHandType} scores`,
        };
      })()
    : boss;
}

export function createBlind(type: 'small' | 'big' | 'boss'): BlindType | BossBlind {
  switch (type) {
    case 'small':
      return SMALL_BLIND;
    case 'big':
      return BIG_BLIND;
    case 'boss':
      return getRandomBossBlind();
  }
}


