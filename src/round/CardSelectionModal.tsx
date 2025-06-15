import React, { useState } from 'react';
import type { PlayingCard } from '../cards';
import { Card } from '../cards/Card.tsx';

interface CardSelectionModalProps {
  readonly title: string;
  readonly description: string;
  readonly cards: ReadonlyArray<PlayingCard>;
  readonly maxSelections: number;
  readonly onConfirm: (selectedCards: ReadonlyArray<PlayingCard>) => void;
  readonly onCancel: () => void;
}

export function CardSelectionModal({
  title,
  description,
  cards,
  maxSelections,
  onConfirm,
  onCancel,
}: CardSelectionModalProps): React.ReactElement {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleCardClick = (cardId: string): void => {
    const newSelected = new Set(selectedIds);
    
    if (newSelected.has(cardId)) {
      newSelected.delete(cardId);
    } else if (newSelected.size < maxSelections) {
      newSelected.add(cardId);
    }
    
    setSelectedIds(newSelected);
  };

  const handleConfirm = (): void => {
    const selectedCards = cards.filter(card => selectedIds.has(card.id));
    onConfirm(selectedCards);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-4xl">
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-gray-400 mb-4">{description}</p>
        <p className="text-sm text-gray-500 mb-4">
          Select {maxSelections} card{maxSelections > 1 ? 's' : ''} 
          ({selectedIds.size}/{maxSelections})
        </p>
        
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {cards.map(card => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`transition-all ${
                selectedIds.has(card.id) ? 'scale-110' : 'hover:scale-105'
              }`}
            >
              <Card
                card={card}
                isSelected={selectedIds.has(card.id)}
                onClick={() => {}}
              />
            </button>
          ))}
        </div>
        
        <div className="flex gap-4 justify-end">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedIds.size !== maxSelections}
            className={`px-6 py-2 rounded transition-colors ${
              selectedIds.size === maxSelections
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}