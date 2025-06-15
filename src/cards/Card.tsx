import React from 'react';
import type { AnyCard, PlayingCard } from './index.ts';
import { isRedSuit } from './card.ts';

interface CardProps {
  readonly card: AnyCard;
  readonly isSelected: boolean;
  readonly onClick: () => void;
  readonly style?: React.CSSProperties;
  readonly animationClass?: string;
  readonly animationDelay?: number;
  readonly size?: 'small' | 'normal';
}

export function Card({ card, isSelected, onClick, style, animationClass, animationDelay, size = 'normal' }: CardProps): React.ReactElement {
  switch (card.type) {
    case 'playing':
      return (
        <PlayingCardView
          card={card}
          isSelected={isSelected}
          onClick={onClick}
          {...(style !== undefined ? { style } : {})}
          {...(animationClass !== undefined ? { animationClass } : {})}
          {...(animationDelay !== undefined ? { animationDelay } : {})}
        />
      );
    case 'spectral':
      return (
        <SpecialCardView
          card={card}
          isSelected={isSelected}
          onClick={onClick}
          cardColor="from-purple-600 to-blue-600"
          borderColor={isSelected ? 'border-purple-400' : 'border-gray-600'}
          size={size}
        />
      );
    case 'arcana':
      return (
        <SpecialCardView
          card={card}
          isSelected={isSelected}
          onClick={onClick}
          cardColor="from-orange-500 to-red-600"
          borderColor={isSelected ? 'border-orange-400' : 'border-gray-600'}
          size={size}
        />
      );
  }
}

interface PlayingCardViewProps {
  readonly card: PlayingCard;
  readonly isSelected: boolean;
  readonly onClick: () => void;
  readonly style?: React.CSSProperties;
  readonly animationClass?: string;
  readonly animationDelay?: number;
}

function PlayingCardView({ card, isSelected, onClick, style, animationClass, animationDelay }: PlayingCardViewProps): React.ReactElement {
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
        glass: 'bg-gradient-to-br from-blue-100 to-cyan-100 opacity-90',
      }[card.enhancement]
    : 'bg-white';
  
  return (
    <div
      onClick={onClick}
      className={`w-[63px] h-[88px] ${enhancementClasses} border border-gray-800 rounded flex flex-col items-center justify-center cursor-pointer transition-transform duration-200 select-none relative ${isSelected ? '-translate-y-2.5 shadow-lg' : 'shadow-md'} ${animationClass !== undefined ? animationClass : ''}`}
      style={combinedStyle}
    >
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

interface SpecialCardViewProps {
  readonly card: { name: string; description: string; };
  readonly isSelected: boolean;
  readonly onClick: () => void;
  readonly cardColor: string;
  readonly borderColor: string;
  readonly size?: 'small' | 'normal';
}

function SpecialCardView({ card, isSelected, onClick, cardColor, borderColor, size = 'normal' }: SpecialCardViewProps): React.ReactElement {
  const sizeClasses = size === 'small' 
    ? 'w-20 h-28 text-xs p-2'
    : 'w-32 h-44 text-sm p-3';
    
  return (
    <div
      className={`${sizeClasses} rounded-lg border-2 ${borderColor} bg-gradient-to-br ${cardColor} 
        flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105
        ${isSelected ? 'ring-2 ring-white' : ''}`}
      onClick={onClick}
    >
      <div className="text-white text-center">
        <h3 className={`font-bold mb-1 ${size === 'small' ? 'text-xs' : 'text-sm'}`}>{card.name}</h3>
        <p className={`opacity-90 ${size === 'small' ? 'text-[10px] leading-tight' : 'text-xs'}`}>{card.description}</p>
      </div>
    </div>
  );
}