import React from 'react';
import type { GameStatistics } from '../../domain/statistics.ts';
import { getWinRate, getAverageScore } from '../../domain/statistics.ts';

interface StatisticsViewProps {
  readonly statistics: GameStatistics;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export function StatisticsView({ statistics, isOpen, onClose }: StatisticsViewProps): React.ReactElement | null {
  if (!isOpen) return null;
  
  const winRate = getWinRate(statistics);
  const avgScore = getAverageScore(statistics);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Statistics</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">General</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Games Played:</span>
                <span className="font-semibold">{statistics.gamesPlayed}</span>
              </div>
              <div className="flex justify-between">
                <span>Games Won:</span>
                <span className="font-semibold">{statistics.gamesWon}</span>
              </div>
              <div className="flex justify-between">
                <span>Win Rate:</span>
                <span className="font-semibold">{winRate}%</span>
              </div>
              <div className="flex justify-between">
                <span>Best Score:</span>
                <span className="font-semibold">{statistics.bestScore.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Highest Ante:</span>
                <span className="font-semibold">{statistics.highestAnte}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Performance</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Average Score:</span>
                <span className="font-semibold">{avgScore.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Chips:</span>
                <span className="font-semibold">{statistics.totalChipsEarned.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Money Earned:</span>
                <span className="font-semibold">${statistics.totalMoneyEarned}</span>
              </div>
              <div className="flex justify-between">
                <span>Money Spent:</span>
                <span className="font-semibold">${statistics.totalMoneySpent}</span>
              </div>
              <div className="flex justify-between">
                <span>Favorite Hand:</span>
                <span className="font-semibold">{statistics.favoriteHand ?? 'None'}</span>
              </div>
            </div>
          </div>
        </div>
        
        {Object.keys(statistics.handCounts).length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Hands Played</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(statistics.handCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([hand, count]) => (
                  <div key={hand} className="flex justify-between text-sm">
                    <span>{hand}:</span>
                    <span>{count}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
        
        {statistics.bossesDefeated.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Bosses Defeated</h3>
            <div className="flex flex-wrap gap-2">
              {statistics.bossesDefeated.map((boss: string) => (
                <span key={boss} className="bg-green-800 px-2 py-1 rounded text-sm">
                  {boss}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {statistics.jokersUsed.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Jokers Discovered</h3>
            <div className="text-sm text-gray-400">
              {statistics.jokersUsed.length} unique jokers used
            </div>
          </div>
        )}
        
        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}