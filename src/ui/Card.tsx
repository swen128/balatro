import React from 'react';
import type { Card as CardType } from '../domain/card.ts';
import { isRedSuit } from '../domain/card.ts';

interface CardProps {
  readonly card: CardType;
  readonly isSelected: boolean;
  readonly onClick: () => void;
  readonly style?: React.CSSProperties;
}

export function Card({ card, isSelected, onClick, style }: CardProps): React.ReactElement {
  const isRed = isRedSuit(card.suit);
  
  return (
    <div
      onClick={onClick}
      className={`w-[63px] h-[88px] bg-white border border-gray-800 rounded flex flex-col items-center justify-center cursor-pointer transition-transform duration-200 select-none relative ${isSelected ? '-translate-y-2.5 shadow-lg' : 'shadow-md'}`}
      style={style}
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
    </div>
  );
}