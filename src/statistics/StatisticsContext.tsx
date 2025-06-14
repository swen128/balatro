import React, { createContext, useContext } from 'react';
import type { UseStatisticsReturn } from './useStatistics.tsx';
import { useStatistics } from './useStatistics.tsx';

const StatisticsContext = createContext<UseStatisticsReturn | null>(null);

interface StatisticsProviderProps {
  readonly children: React.ReactNode;
}

export function StatisticsProvider({ children }: StatisticsProviderProps): React.ReactElement {
  const statistics = useStatistics();
  
  return (
    <StatisticsContext.Provider value={statistics}>
      {children}
    </StatisticsContext.Provider>
  );
}

export function useStatisticsContext(): UseStatisticsReturn {
  const context = useContext(StatisticsContext);
  return !context
    ? ((): never => {
        throw new Error('useStatisticsContext must be used within StatisticsProvider');
      })()
    : context;
}