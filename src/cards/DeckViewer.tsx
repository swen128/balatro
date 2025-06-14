import React, { useState } from 'react';
import type { Card } from './card.ts';
import { Card as CardComponent } from './Card.tsx';
import { SUITS, RANKS } from './card.ts';

interface DeckViewerProps {
  readonly deck: ReadonlyArray<Card>;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export function DeckViewer({ deck, isOpen, onClose }: DeckViewerProps): React.ReactElement | null {
  const [filterSuit, setFilterSuit] = useState<string | null>(null);
  const [showEnhanced, setShowEnhanced] = useState<boolean>(false);
  
  if (!isOpen) return null;
  
  // Group cards by suit and rank
  const cardsBySuit = new Map<string, Card[]>();
  const cardsByRank = new Map<string, Card[]>();
  const enhancedCards: Card[] = [];
  
  for (const card of deck) {
    // By suit
    const suitCards = cardsBySuit.get(card.suit) ?? [];
    suitCards.push(card);
    cardsBySuit.set(card.suit, suitCards);
    
    // By rank
    const rankCards = cardsByRank.get(card.rank) ?? [];
    rankCards.push(card);
    cardsByRank.set(card.rank, rankCards);
    
    // Enhanced
    if (card.enhancement) {
      enhancedCards.push(card);
    }
  }
  
  // Apply filters
  let filteredCards = [...deck];
  if (filterSuit !== null) {
    filteredCards = filteredCards.filter(card => card.suit === filterSuit);
  }
  if (showEnhanced) {
    filteredCards = filteredCards.filter(card => card.enhancement !== undefined);
  }
  
  // Sort cards
  filteredCards.sort((a, b) => {
    const suitOrder = SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit);
    if (suitOrder !== 0) return suitOrder;
    return RANKS.indexOf(a.rank) - RANKS.indexOf(b.rank);
  });
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-8">
      <div className="bg-gray-800 rounded-lg p-6 max-w-6xl max-h-[90vh] overflow-y-auto w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl">Your Deck ({deck.length} cards)</h2>
          <button
            onClick={onClose}
            className="text-2xl px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            ×
          </button>
        </div>
        
        {/* Filters */}
        <div className="mb-4 flex gap-4 flex-wrap">
          <div>
            <label className="text-sm text-gray-400">Filter by Suit:</label>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => setFilterSuit(null)}
                className={`px-3 py-1 rounded ${filterSuit === null ? 'bg-blue-600' : 'bg-gray-700'}`}
              >
                All
              </button>
              {SUITS.map(suit => (
                <button
                  key={suit}
                  onClick={() => setFilterSuit(suit)}
                  className={`px-3 py-1 rounded ${filterSuit === suit ? 'bg-blue-600' : 'bg-gray-700'}`}
                >
                  {suit} ({cardsBySuit.get(suit)?.length ?? 0})
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-sm text-gray-400">Enhanced:</label>
            <div className="mt-1">
              <button
                onClick={() => setShowEnhanced(!showEnhanced)}
                className={`px-3 py-1 rounded ${showEnhanced ? 'bg-blue-600' : 'bg-gray-700'}`}
              >
                Enhanced Only ({enhancedCards.length})
              </button>
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="mb-4 text-sm text-gray-400">
          <div>Total Cards: {deck.length}</div>
          <div>Enhanced Cards: {enhancedCards.length}</div>
          <div>Showing: {filteredCards.length} cards</div>
        </div>
        
        {/* Cards Grid */}
        <div className="grid grid-cols-8 gap-2">
          {filteredCards.map((card, index) => (
            <div key={`${card.id}-${index}`} className="transform scale-75">
              <CardComponent
                card={card}
                isSelected={false}
                onClick={() => {}}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}