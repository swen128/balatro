import React from 'react';
import type { Card } from '../../domain/card.ts';
import { getCardChipValue } from '../../domain/card.ts';

interface CardScoreOverlayProps {
  readonly card: Card;
  readonly isVisible: boolean;
}

export function CardScoreOverlay({ card, isVisible }: CardScoreOverlayProps): React.ReactElement | null {
  if (!isVisible) return null;
  
  const chipValue = getCardChipValue(card);
  
  // Get enhancement mult bonus if any
  const multBonus = card.enhancement === 'holographic' ? 10 : 0;
  const hasMultiplier = card.enhancement === 'polychrome';
  
  return (
    <div className="absolute -top-12 left-1/2 -translate-x-1/2 animate-score-pop">
      <div className="flex flex-col items-center gap-1">
        <div className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-bold whitespace-nowrap">
          +{chipValue}
        </div>
        {multBonus > 0 && (
          <div className="bg-red-600 text-white px-2 py-1 rounded text-sm font-bold whitespace-nowrap">
            +{multBonus} Mult
          </div>
        )}
        {hasMultiplier && (
          <div className="bg-purple-600 text-white px-2 py-1 rounded text-sm font-bold whitespace-nowrap">
            ×1.5 Mult
          </div>
        )}
      </div>
    </div>
  );
}