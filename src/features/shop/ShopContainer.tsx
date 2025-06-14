import React, { useState, useCallback, useEffect } from 'react';
import type { RunState } from '../../domain/runState.ts';
import { createShopState, purchaseItem, rerollShop, canAffordItem, canReroll } from './shopLogic.ts';
import { ShopView } from './ShopView.tsx';
import { CardPackModal } from './CardPackModal.tsx';
import { generateStandardPackCards } from '../../domain/cardPacks.ts';
import type { Card } from '../../domain/card.ts';

interface ShopContainerProps {
  readonly runState: RunState;
  readonly onLeave: (updatedRunState: RunState) => void;
}

export function ShopContainer({ runState: initialRunState, onLeave }: ShopContainerProps): React.ReactElement {
  const [runState, setRunState] = useState<RunState>(initialRunState);
  const [shopState, setShopState] = useState(() => createShopState(initialRunState));
  const [packCards, setPackCards] = useState<ReadonlyArray<Card> | null>(null);

  // Generate pack cards when a pack is purchased
  useEffect(() => {
    console.log('Pack effect - pendingPack:', shopState.pendingPack, 'packCards:', packCards);
    if (shopState.pendingPack && packCards === null) {
      const pack = shopState.pendingPack;
      let cards: ReadonlyArray<Card> = [];
      
      if (pack.type === 'standard') {
        cards = generateStandardPackCards(3);
        console.log('Generated cards:', cards);
      }
      // For now, only support standard packs
      
      setPackCards(cards);
    }
  }, [shopState.pendingPack, packCards]);

  const handlePurchase = useCallback((itemId: string): void => {
    console.log('Purchasing item:', itemId);
    const result = purchaseItem(shopState, runState, itemId);
    console.log('Purchase result:', result);
    if (result) {
      setShopState(result.shopState);
      setRunState(result.runState);
    }
  }, [shopState, runState]);

  const handleReroll = useCallback((): void => {
    const result = rerollShop(shopState, runState);
    if (result) {
      setShopState(result.shopState);
      setRunState(result.runState);
    }
  }, [shopState, runState]);

  const handleSelectCard = useCallback((card: Card): void => {
    // Add the selected card to the deck
    const newRunState = {
      ...runState,
      deck: [...runState.deck, card],
    };
    
    // Clear the pending pack
    const newShopState = {
      ...shopState,
      pendingPack: null,
    };
    
    setRunState(newRunState);
    setShopState(newShopState);
    setPackCards(null);
  }, [runState, shopState]);

  const handleCancelPack = useCallback((): void => {
    // Return the money and clear the pack
    const newRunState = {
      ...runState,
      cash: runState.cash + (shopState.pendingPack ? 4 : 0), // Refund pack cost
    };
    
    const newShopState = {
      ...shopState,
      pendingPack: null,
    };
    
    setRunState(newRunState);
    setShopState(newShopState);
    setPackCards(null);
  }, [runState, shopState]);

  const handleLeave = useCallback((): void => {
    onLeave(runState);
  }, [onLeave, runState]);

  return (
    <>
      <ShopView
        runState={runState}
        shopState={shopState}
        onPurchase={handlePurchase}
        onReroll={handleReroll}
        onLeave={handleLeave}
        canAffordItem={(item) => canAffordItem(runState.cash, item)}
        canReroll={() => canReroll(runState.cash, shopState.rerollCost)}
      />
      {console.log('Render check - pendingPack:', shopState.pendingPack, 'packCards:', packCards, 'length:', packCards?.length)}
      {shopState.pendingPack && packCards && packCards.length > 0 && (
        <CardPackModal
          packType={shopState.pendingPack.type}
          cards={packCards}
          onSelectCard={handleSelectCard}
          onCancel={handleCancelPack}
        />
      )}
    </>
  );
}