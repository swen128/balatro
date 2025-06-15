import React, { useState, useCallback } from 'react';
import type { RunState } from '../game/runState.ts';
import { createShopState, purchaseItem, rerollShop, canAffordItem, canReroll, selectCardFromPack, cancelPackSelection } from './shopLogic.ts';
import { ShopView } from './ShopView.tsx';
import { CardPackModal } from './CardPackModal.tsx';
import type { AnyCard } from '../cards';
import { useStatisticsContext } from '../statistics/StatisticsContext.tsx';

interface ShopContainerProps {
  readonly runState: RunState;
  readonly onLeave: (updatedRunState: RunState) => void;
}

export function ShopContainer({ runState: initialRunState, onLeave }: ShopContainerProps): React.ReactElement {
  const [runState, setRunState] = useState<RunState>(initialRunState);
  const [shopState, setShopState] = useState(() => createShopState(initialRunState));
  const stats = useStatisticsContext();

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

  const handleSelectCard = useCallback((card: AnyCard): void => {
    if (shopState.type === 'selectingCard') {
      const result = selectCardFromPack(shopState, runState, card);
      setShopState(result.shopState);
      setRunState(result.runState);
    }
  }, [shopState, runState]);

  const handleCancelPack = useCallback((): void => {
    if (shopState.type === 'selectingCard') {
      const result = cancelPackSelection(shopState, runState);
      setShopState(result.shopState);
      setRunState(result.runState);
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
      {shopState.type === 'selectingCard' && shopState.pendingPack.cards.length > 0 && (
        <CardPackModal
          packType={shopState.pendingPack.packType}
          cards={shopState.pendingPack.cards}
          onSelectCard={handleSelectCard}
          onCancel={handleCancelPack}
        />
      )}
    </>
  );
}