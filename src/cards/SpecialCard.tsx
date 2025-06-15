import React from 'react';
import type { SpectralCard, ArcanaCard } from './cardTypes.ts';

interface SpecialCardProps {
  readonly card: SpectralCard | ArcanaCard;
  readonly isSelected: boolean;
  readonly onClick: () => void;
}

export function SpecialCard({ card, isSelected, onClick }: SpecialCardProps): React.ReactElement {
  const getCardColor = (): string => {
    return card.type === 'spectral' ? 'from-purple-600 to-blue-600' : 'from-orange-500 to-red-600';
  };

  const getCardBorder = (): string => {
    return isSelected 
      ? card.type === 'spectral' ? 'border-purple-400' : 'border-orange-400'
      : 'border-gray-600';
  };

  return (
    <div
      className={`w-32 h-44 rounded-lg border-2 ${getCardBorder()} bg-gradient-to-br ${getCardColor()} 
        flex flex-col items-center justify-center p-3 cursor-pointer transition-all hover:scale-105
        ${isSelected ? 'ring-2 ring-white' : ''}`}
      onClick={onClick}
    >
      <div className="text-white text-center">
        <h3 className="font-bold text-sm mb-2">{card.name}</h3>
        <p className="text-xs opacity-90">{card.description}</p>
      </div>
    </div>
  );
}