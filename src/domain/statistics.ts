export interface GameStatistics {
  readonly gamesPlayed: number;
  readonly gamesWon: number;
  readonly bestScore: number;
  readonly highestAnte: number;
  readonly totalChipsEarned: number;
  readonly favoriteHand: string | null;
  readonly handCounts: Readonly<Record<string, number>>;
  readonly totalMoneyEarned: number;
  readonly totalMoneySpent: number;
  readonly jokersUsed: ReadonlyArray<string>;
  readonly bossesDefeated: ReadonlyArray<string>;
  readonly lastPlayed: number;
}

export function createEmptyStatistics(): GameStatistics {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    bestScore: 0,
    highestAnte: 0,
    totalChipsEarned: 0,
    favoriteHand: null,
    handCounts: {},
    totalMoneyEarned: 0,
    totalMoneySpent: 0,
    jokersUsed: [],
    bossesDefeated: [],
    lastPlayed: Date.now(),
  };
}

export function updateGameStart(stats: GameStatistics): GameStatistics {
  return {
    ...stats,
    gamesPlayed: stats.gamesPlayed + 1,
    lastPlayed: Date.now(),
  };
}

export function updateGameEnd(
  stats: GameStatistics,
  won: boolean,
  finalAnte: number,
  finalScore: number
): GameStatistics {
  return {
    ...stats,
    gamesWon: won ? stats.gamesWon + 1 : stats.gamesWon,
    bestScore: Math.max(stats.bestScore, finalScore),
    highestAnte: Math.max(stats.highestAnte, finalAnte),
  };
}

export function updateHandPlayed(
  stats: GameStatistics,
  handType: string,
  chipsEarned: number
): GameStatistics {
  const currentCount = stats.handCounts[handType] ?? 0;
  const newHandCounts = {
    ...stats.handCounts,
    [handType]: currentCount + 1,
  };
  
  // Find the most played hand
  const favoriteHand = Object.entries(newHandCounts).reduce<string | null>(
    (favorite, [hand, count]) => {
      if (!favorite) return hand;
      return count > (newHandCounts[favorite] ?? 0) ? hand : favorite;
    },
    stats.favoriteHand
  );
  
  return {
    ...stats,
    handCounts: newHandCounts,
    favoriteHand,
    totalChipsEarned: stats.totalChipsEarned + chipsEarned,
  };
}

export function updateMoneySpent(
  stats: GameStatistics,
  amount: number
): GameStatistics {
  return {
    ...stats,
    totalMoneySpent: stats.totalMoneySpent + amount,
  };
}

export function updateMoneyEarned(
  stats: GameStatistics,
  amount: number
): GameStatistics {
  return {
    ...stats,
    totalMoneyEarned: stats.totalMoneyEarned + amount,
  };
}

export function updateJokerUsed(
  stats: GameStatistics,
  jokerId: string
): GameStatistics {
  if (stats.jokersUsed.includes(jokerId)) {
    return stats;
  }
  return {
    ...stats,
    jokersUsed: [...stats.jokersUsed, jokerId],
  };
}

export function updateBossDefeated(
  stats: GameStatistics,
  bossName: string
): GameStatistics {
  if (stats.bossesDefeated.includes(bossName)) {
    return stats;
  }
  return {
    ...stats,
    bossesDefeated: [...stats.bossesDefeated, bossName],
  };
}

export function getWinRate(stats: GameStatistics): number {
  if (stats.gamesPlayed === 0) return 0;
  return Math.round((stats.gamesWon / stats.gamesPlayed) * 100);
}

export function getAverageScore(stats: GameStatistics): number {
  if (stats.gamesPlayed === 0) return 0;
  return Math.round(stats.totalChipsEarned / stats.gamesPlayed);
}