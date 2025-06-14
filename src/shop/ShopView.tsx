import React, { useState } from 'react';
import type { RunState } from '../game/runState.ts';
import type { ShopState } from './shopLogic.ts';
import type { ShopItem } from './shopItems.ts';
import { DeckViewer } from '../cards/DeckViewer.tsx';

interface ShopViewProps {
  readonly runState: RunState;
  readonly shopState: ShopState;
  readonly onPurchase: (itemId: string) => void;
  readonly onReroll: () => void;
  readonly onLeave: () => void;
  readonly canAffordItem: (item: ShopItem) => boolean;
  readonly canReroll: () => boolean;
}

export function ShopView({ 
  runState, 
  shopState, 
  onPurchase, 
  onReroll, 
  onLeave,
  canAffordItem,
  canReroll: canRerollShop
}: ShopViewProps): React.ReactElement {
  const [showDeckViewer, setShowDeckViewer] = useState(false);
  
  const renderItemType = (item: ShopItem): string => {
    switch (item.type) {
      case 'upgrade': return '⬆️';
      case 'joker': return '🃏';
      case 'pack': return '📦';
      case 'voucher': return '🎫';
      case 'spectral': return '👻';
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 relative">
      {/* Left sidebar */}
      <div className="w-[200px] bg-gray-950 p-4 flex flex-col gap-4">
        <div>
          <h3 className="text-xl mb-2">Ante {runState.ante}</h3>
          <p className="text-lg">Cash: ${runState.cash}</p>
        </div>
        
        {shopState.purchasedJokers.length > 0 && (
          <div>
            <h4 className="text-lg mb-2">Jokers</h4>
            <div className="flex flex-col gap-2">
              {shopState.purchasedJokers.map(joker => (
                <div key={joker.id} className="text-sm p-2 bg-gray-800 rounded">
                  {joker.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main shop area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <h2 className="text-3xl mb-8">Shop</h2>
        
        {/* Shop items */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {shopState.availableItems.map(item => {
            const canAfford = canAffordItem(item);
            return (
              <div
                key={item.id}
                className={`border-2 rounded-lg p-4 w-[200px] transition-all ${
                  canAfford 
                    ? 'border-blue-600 hover:border-blue-500 cursor-pointer' 
                    : 'border-gray-700 opacity-50 cursor-not-allowed'
                }`}
                onClick={() => canAfford && onPurchase(item.id)}
              >
                <div className="text-2xl mb-2">{renderItemType(item)}</div>
                <h4 className="font-semibold mb-1">{item.name}</h4>
                <p className="text-sm text-gray-400 mb-2">{item.description}</p>
                <p className={`text-lg font-bold ${canAfford ? 'text-green-500' : 'text-red-500'}`}>
                  ${item.price}
                </p>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button 
            onClick={onReroll}
            disabled={!canRerollShop()}
            className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors"
          >
            Reroll (${shopState.rerollCost})
          </button>
          
          <button 
            onClick={onLeave} 
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
      
      {/* View Deck button at top right */}
      <button
        className="absolute top-4 right-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors text-sm"
        onClick={() => setShowDeckViewer(true)}
      >
        View Deck
      </button>
      
      {/* Deck Viewer Modal */}
      <DeckViewer
        deck={runState.deck}
        isOpen={showDeckViewer}
        onClose={() => setShowDeckViewer(false)}
      />
    </div>
  );
}