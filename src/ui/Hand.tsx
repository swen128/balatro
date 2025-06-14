import React from 'react';
import type { Card as CardType } from '../domain/card.ts';
import { Card } from './Card.tsx';

interface HandProps {
  readonly cards: ReadonlyArray<CardType>;
  readonly selectedCardIds: ReadonlySet<string>;
  readonly playedCards: ReadonlyArray<CardType>;
  readonly onCardClick: (cardId: string) => void;
  readonly isPlaying: boolean;
}

export function Hand({ cards, selectedCardIds, playedCards, onCardClick, isPlaying }: HandProps): React.ReactElement {
  const playedCardIds = new Set(playedCards.map(c => c.id));
  
  return (
    <div className="flex gap-2 p-4 min-h-[120px]">
      {cards.map((card, index) => {
        const isPlayed = playedCardIds.has(card.id);
        const isSelected = selectedCardIds.has(card.id);
        
        return (
          <Card
            key={card.id}
            card={card}
            isSelected={isSelected}
            onClick={() => !isPlaying && onCardClick(card.id)}
            style={{
              opacity: isPlayed ? 0 : 1,
              ...(isPlaying && isPlayed && { transform: 'translateY(-200px)' }),
              transition: 'all 0.5s ease-out',
              transitionDelay: isPlayed ? `${index * 0.1}s` : '0s',
            }}
          />
        );
      })}
    </div>
  );
}