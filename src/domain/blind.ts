export interface BlindType {
  readonly name: string;
  readonly scoreMultiplier: number;
  readonly cashReward: number;
  readonly isBoss: boolean;
}

export const SMALL_BLIND: BlindType = {
  name: 'Small Blind',
  scoreMultiplier: 1,
  cashReward: 3,
  isBoss: false,
};

export const BIG_BLIND: BlindType = {
  name: 'Big Blind',
  scoreMultiplier: 1.5,
  cashReward: 4,
  isBoss: false,
};

export interface BossBlind extends BlindType {
  readonly isBoss: true;
  readonly effect: string;
}

export const BOSS_BLINDS: ReadonlyArray<BossBlind> = [
  {
    name: 'The Window',
    scoreMultiplier: 2,
    cashReward: 5,
    isBoss: true,
    effect: 'First played hand scores 0 chips',
  },
  {
    name: 'The Hook',
    scoreMultiplier: 2,
    cashReward: 5,
    isBoss: true,
    effect: 'Discards 2 random cards per hand',
  },
  {
    name: 'The Ox',
    scoreMultiplier: 2,
    cashReward: 5,
    isBoss: true,
    effect: 'Playing a #1 hand sets money to $0',
  },
];

export function getBlindScoreGoal(ante: number, blind: BlindType): number {
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
  
  let baseScore: number;
  if (ante <= 8) {
    const score = baseScores[ante - 1];
    baseScore = score !== undefined ? score : 100;
  } else {
    // Exponential scaling after ante 8
    baseScore = Math.floor(35000 * Math.pow(1.6, ante - 8));
  }
  
  return Math.floor(baseScore * blind.scoreMultiplier);
}

export function getCashReward(blind: BlindType): number {
  return blind.cashReward;
}

export function getRandomBossBlind(): BossBlind {
  const index = Math.floor(Math.random() * BOSS_BLINDS.length);
  const boss = BOSS_BLINDS[index];
  if (!boss) {
    throw new Error('No boss blinds available');
  }
  return boss;
}