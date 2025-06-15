import React, { useState } from 'react';
import type { AnyCard } from '../cards';
import { isPlayingCard } from '../cards';
import { Card as CardComponent } from '../cards/Card.tsx';
import { SpecialCard } from '../cards/SpecialCard.tsx';

interface CardPackModalProps {
  readonly packType: 'standard' | 'spectral' | 'arcana';
  readonly cards: ReadonlyArray<AnyCard>;
  readonly onSelectCard: (card: AnyCard) => void;
  readonly onCancel: () => void;
}

export function CardPackModal({ packType, cards, onSelectCard, onCancel }: CardPackModalProps): React.ReactElement {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  
  const handleConfirm = (): void => {
    const selectedCard = cards.find(c => c.id === selectedCardId);
    if (selectedCard) {
      onSelectCard(selectedCard);
    }
  };
  
  const getPackTitle = (): string => {
    switch (packType) {
      case 'standard':
        return 'Standard Pack';
      case 'spectral':
        return 'Spectral Pack';
      case 'arcana':
        return 'Arcana Pack';
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl">
        <h2 className="text-2xl mb-4 text-center">{getPackTitle()}</h2>
        <p className="text-center mb-6 text-gray-400">
          {packType === 'standard' ? 'Choose 1 card to add to your deck' : 'Choose 1 card to use'}
        </p>
        
        <div className="flex gap-4 justify-center mb-6">
          {cards.map(card => (
            <div
              key={card.id}
              className={`cursor-pointer transition-transform ${
                selectedCardId === card.id ? 'scale-110' : ''
              }`}
              onClick={() => setSelectedCardId(card.id)}
            >
              {isPlayingCard(card) ? (
                <CardComponent
                  card={card}
                  isSelected={selectedCardId === card.id}
                  onClick={() => setSelectedCardId(card.id)}
                />
              ) : (
                <SpecialCard
                  card={card}
                  isSelected={selectedCardId === card.id}
                  onClick={() => setSelectedCardId(card.id)}
                />
              )}
            </div>
          ))}
        </div>
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleConfirm}
            disabled={selectedCardId === null}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 rounded transition-colors"
          >
            Confirm
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}