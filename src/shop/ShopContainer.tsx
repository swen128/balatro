import React, { useState, useCallback, useEffect } from 'react';
import type { RunState } from '../game/runState.ts';
import { createShopState, purchaseItem, rerollShop, canAffordItem, canReroll, selectCardFromPack, cancelPackSelection } from './shopLogic.ts';
import { ShopView } from './ShopView.tsx';
import { CardPackModal } from './CardPackModal.tsx';
import { generateStandardPackCards } from './cardPacks.ts';
import type { Card } from '../cards/card.ts';
import { useStatisticsContext } from '../statistics/StatisticsContext.tsx';

interface ShopContainerProps {
  readonly runState: RunState;
  readonly onLeave: (updatedRunState: RunState) => void;
}

export function ShopContainer({ runState: initialRunState, onLeave }: ShopContainerProps): React.ReactElement {
  const [runState, setRunState] = useState<RunState>(initialRunState);
  const [shopState, setShopState] = useState(() => createShopState(initialRunState));
  const [packCards, setPackCards] = useState<ReadonlyArray<Card> | null>(null);
  const stats = useStatisticsContext();

  // Generate pack cards when a pack is purchased
  useEffect(() => {
    if (shopState.pendingPack && packCards === null) {
      const pack = shopState.pendingPack;
      let cards: ReadonlyArray<Card> = [];
      
      switch (pack.type) {
        case 'standard':
          cards = generateStandardPackCards(3);
          break;
        case 'spectral':
        case 'arcana':
          // For now, generate standard cards as placeholders
          cards = generateStandardPackCards(3);
          break;
      }
      
      setPackCards(cards);
    }
  }, [shopState.pendingPack, packCards]);

  const handlePurchase = useCallback((itemId: string): void => {
    const item = shopState.availableItems.find(i => i.id === itemId);
    const result = purchaseItem(shopState, runState, itemId);
    if (result && item) {
      setShopState(result.shopState);
      setRunState(result.runState);
      
      // Track money spent and joker usage
      stats.trackMoneySpent(item.price);
      if (item.type === 'joker') {
        stats.trackJokerUsed(item.id);
      }
    }
  }, [shopState, runState, stats]);

  const handleReroll = useCallback((): void => {
    const result = rerollShop(shopState, runState);
    if (result) {
      setShopState(result.shopState);
      setRunState(result.runState);
      
      // Track money spent on reroll
      stats.trackMoneySpent(shopState.rerollCost);
    }
  }, [shopState, runState, stats]);

  const handleSelectCard = useCallback((card: Card): void => {
    const result = selectCardFromPack(shopState, runState, card);
    if (result) {
      setShopState(result.shopState);
      setRunState(result.runState);
      setPackCards(null);
    }
  }, [shopState, runState]);

  const handleCancelPack = useCallback((): void => {
    const result = cancelPackSelection(shopState, runState);
    if (result) {
      setShopState(result.shopState);
      setRunState(result.runState);
      setPackCards(null);
    }
  }, [shopState, runState]);

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