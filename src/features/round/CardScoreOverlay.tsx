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
  
  return (
    <div className="absolute -top-8 left-1/2 -translate-x-1/2 animate-score-pop">
      <div className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-bold whitespace-nowrap">
        +{chipValue}
      </div>
    </div>
  );
}