import type { GameStatistics } from '../../domain/statistics.ts';
import { createEmptyStatistics } from '../../domain/statistics.ts';

const STATS_KEY = 'balatro-statistics';

export function saveStatistics(stats: GameStatistics): void {
  if (typeof window !== 'undefined' && window.localStorage !== undefined) {
    window.localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }
}

export function loadStatistics(): GameStatistics {
  if (typeof window !== 'undefined' && window.localStorage !== undefined) {
    const saved = window.localStorage.getItem(STATS_KEY);
    if (saved !== null) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return JSON.parse(saved);
      } catch {
        return createEmptyStatistics();
      }
    }
  }
  return createEmptyStatistics();
}

export function clearStatistics(): void {
  if (typeof window !== 'undefined' && window.localStorage !== undefined) {
    window.localStorage.removeItem(STATS_KEY);
  }
}