import React from 'react';
import type { Card as CardType } from '../cards';
import { Card } from '../cards/Card.tsx';
import { CardScoreOverlay } from './CardScoreOverlay.tsx';

interface HandProps {
  readonly cards: ReadonlyArray<CardType>;
  readonly selectedCardIds: ReadonlySet<string>;
  readonly playedCards: ReadonlyArray<CardType>;
  readonly onCardClick: (cardId: string) => void;
  readonly isPlaying: boolean;
  readonly isDrawing?: boolean;
  readonly isDiscarding?: boolean;
  readonly isScoring?: boolean;
}

export function Hand({ 
  cards, 
  selectedCardIds, 
  playedCards, 
  onCardClick, 
  isPlaying,
  isDrawing = false,
  isDiscarding = false,
  isScoring = false
}: HandProps): React.ReactElement {
  const playedCardIds = new Set(playedCards.map(c => c.id));
  
  return (
    <div className="flex gap-2 p-4 min-h-[120px]">
      {cards.map((card, index) => {
        const isPlayed = playedCardIds.has(card.id);
        const isSelected = selectedCardIds.has(card.id);
        
        // Determine animation class
        let animationClass = '';
        if (isDrawing) {
          animationClass = 'animate-card-deal';
        } else if (isDiscarding && isSelected) {
          animationClass = 'animate-card-discard';
        } else if (isPlaying && isPlayed) {
          animationClass = 'animate-card-play';
        }
        
        return (
          <div key={card.id} className="relative">
            <Card
              card={card}
              isSelected={isSelected}
              onClick={() => !isPlaying && !isDiscarding && onCardClick(card.id)}
              animationClass={animationClass}
              animationDelay={index * 0.1}
              style={{
                opacity: (isPlayed && !isPlaying) ? 0 : 1,
                transition: 'opacity 0.5s ease-out',
              }}
            />
            <CardScoreOverlay card={card} isVisible={isScoring && isPlayed} />
          </div>
        );
      })}
    </div>
  );
}