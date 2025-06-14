import React from 'react';
import type { Card as CardType } from '../domain/card.ts';
import { isRedSuit } from '../domain/card.ts';
import { CardScoreOverlay } from '../features/round/CardScoreOverlay.tsx';

interface CardProps {
  readonly card: CardType;
  readonly isSelected: boolean;
  readonly onClick: () => void;
  readonly style?: React.CSSProperties;
  readonly animationClass?: string;
  readonly animationDelay?: number;
  readonly showScoreOverlay?: boolean;
}

export function Card({ card, isSelected, onClick, style, animationClass, animationDelay, showScoreOverlay = false }: CardProps): React.ReactElement {
  const isRed = isRedSuit(card.suit);
  
  const combinedStyle: React.CSSProperties = {
    ...style,
    ...(animationDelay !== undefined ? { animationDelay: `${animationDelay}s` } : {}),
  };
  
  // Get enhancement-specific classes
  const enhancementClasses = card.enhancement 
    ? {
        foil: 'bg-gradient-to-br from-gray-100 to-gray-300',
        holographic: 'bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100',
        polychrome: 'bg-gradient-to-br from-red-100 via-yellow-100 to-blue-100',
      }[card.enhancement]
    : 'bg-white';
  
  return (
    <div
      onClick={onClick}
      className={`w-[63px] h-[88px] ${enhancementClasses} border border-gray-800 rounded flex flex-col items-center justify-center cursor-pointer transition-transform duration-200 select-none relative ${isSelected ? '-translate-y-2.5 shadow-lg' : 'shadow-md'} ${animationClass !== undefined ? animationClass : ''}`}
      style={combinedStyle}
    >
      <CardScoreOverlay card={card} isVisible={showScoreOverlay} />
      {/* Top left corner */}
      <div className={`absolute top-1 left-1 text-xs font-bold leading-none ${isRed ? 'text-red-500' : 'text-black'}`}>
        <div>{card.rank}</div>
        <div className="text-sm">{card.suit}</div>
      </div>

      {/* Center */}
      <div className={`text-3xl ${isRed ? 'text-red-500' : 'text-black'}`}>
        {card.suit}
      </div>

      {/* Bottom right corner (upside down) */}
      <div className={`absolute bottom-1 right-1 text-xs font-bold leading-none rotate-180 ${isRed ? 'text-red-500' : 'text-black'}`}>
        <div>{card.rank}</div>
        <div className="text-sm">{card.suit}</div>
      </div>
      
      {/* Enhancement indicator */}
      {card.enhancement && (
        <div className="absolute top-0 right-0 p-1">
          <div className={`w-3 h-3 rounded-full ${
            card.enhancement === 'foil' ? 'bg-gray-600' :
            card.enhancement === 'holographic' ? 'bg-purple-600' :
            'bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500'
          }`} />
        </div>
      )}
    </div>
  );
}