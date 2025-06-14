/* eslint-disable functional/no-try-statements */
/* eslint-disable functional/no-return-void */
/* eslint-disable functional/no-conditional-statements */
/* eslint-disable @typescript-eslint/consistent-type-assertions */

import type { GameStatistics } from '../game';
import { createEmptyStatistics } from '../game';

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
        return JSON.parse(saved) as GameStatistics;
      } catch {
        return createEmptyStatistics();
      }
    }
  }
  return createEmptyStatistics();
}

