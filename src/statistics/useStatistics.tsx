import { useState, useCallback, useEffect } from 'react';
import type { GameStatistics } from '../game/statistics.ts';
import { 
  createEmptyStatistics,
  updateGameStart,
  updateGameEnd,
  updateHandPlayed,
  updateMoneySpent,
  updateMoneyEarned,
  updateJokerUsed,
  updateBossDefeated
} from '../game/statistics.ts';
import { loadStatistics, saveStatistics } from './statisticsStorage.ts';

export interface UseStatisticsReturn {
  readonly statistics: GameStatistics;
  readonly trackGameStart: () => void;
  readonly trackGameEnd: (won: boolean, finalAnte: number, finalScore: number) => void;
  readonly trackHandPlayed: (handType: string, chipsEarned: number) => void;
  readonly trackMoneySpent: (amount: number) => void;
  readonly trackMoneyEarned: (amount: number) => void;
  readonly trackJokerUsed: (jokerId: string) => void;
  readonly trackBossDefeated: (bossName: string) => void;
  readonly resetStatistics: () => void;
}

export function useStatistics(): UseStatisticsReturn {
  const [statistics, setStatistics] = useState<GameStatistics>(() => loadStatistics());

  // Auto-save statistics when they change
  useEffect(() => {
    saveStatistics(statistics);
  }, [statistics]);

  const trackGameStart = useCallback((): void => {
    setStatistics(stats => updateGameStart(stats));
  }, []);

  const trackGameEnd = useCallback((won: boolean, finalAnte: number, finalScore: number): void => {
    setStatistics(stats => updateGameEnd(stats, won, finalAnte, finalScore));
  }, []);

  const trackHandPlayed = useCallback((handType: string, chipsEarned: number): void => {
    setStatistics(stats => updateHandPlayed(stats, handType, chipsEarned));
  }, []);

  const trackMoneySpent = useCallback((amount: number): void => {
    setStatistics(stats => updateMoneySpent(stats, amount));
  }, []);

  const trackMoneyEarned = useCallback((amount: number): void => {
    setStatistics(stats => updateMoneyEarned(stats, amount));
  }, []);

  const trackJokerUsed = useCallback((jokerId: string): void => {
    setStatistics(stats => updateJokerUsed(stats, jokerId));
  }, []);

  const trackBossDefeated = useCallback((bossName: string): void => {
    setStatistics(stats => updateBossDefeated(stats, bossName));
  }, []);

  const resetStatistics = useCallback((): void => {
    setStatistics(createEmptyStatistics());
  }, []);

  return {
    statistics,
    trackGameStart,
    trackGameEnd,
    trackHandPlayed,
    trackMoneySpent,
    trackMoneyEarned,
    trackJokerUsed,
    trackBossDefeated,
    resetStatistics,
  };
}