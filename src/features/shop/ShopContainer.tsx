import React, { useState, useCallback } from 'react';
import type { RunState } from '../../domain/runState.ts';
import { createShopState, purchaseItem, rerollShop, canAffordItem, canReroll } from './shopLogic.ts';
import { ShopView } from './ShopView.tsx';

interface ShopContainerProps {
  readonly runState: RunState;
  readonly onLeave: () => void;
}

export function ShopContainer({ runState: initialRunState, onLeave }: ShopContainerProps): React.ReactElement {
  const [runState, setRunState] = useState<RunState>(initialRunState);
  const [shopState, setShopState] = useState(() => createShopState(initialRunState));

  const handlePurchase = useCallback((itemId: string): void => {
    const result = purchaseItem(shopState, runState, itemId);
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

  const handleLeave = useCallback((): void => {
    // TODO: Pass updated runState back to game state
    onLeave();
  }, [onLeave]);

  return (
    <ShopView
      runState={runState}
      shopState={shopState}
      onPurchase={handlePurchase}
      onReroll={handleReroll}
      onLeave={handleLeave}
      canAffordItem={(item) => canAffordItem(runState.cash, item)}
      canReroll={() => canReroll(runState.cash, shopState.rerollCost)}
    />
  );
}