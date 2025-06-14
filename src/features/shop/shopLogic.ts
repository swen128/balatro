import type { RunState } from '../../domain/runState.ts';
import type { ShopItem, UpgradeItem, JokerItem } from '../../domain/shopItems.ts';
import { generateShopItems } from '../../domain/shopItems.ts';

export interface ShopState {
  readonly availableItems: ReadonlyArray<ShopItem>;
  readonly purchasedJokers: ReadonlyArray<JokerItem>;
  readonly rerollCost: number;
  readonly rerollsUsed: number;
}

export function createShopState(runState: RunState): ShopState {
  return {
    availableItems: generateShopItems(runState.cash),
    purchasedJokers: [],
    rerollCost: 5,
    rerollsUsed: 0,
  };
}

export function canAffordItem(cash: number, item: ShopItem): boolean {
  return cash >= item.price;
}

export function canReroll(cash: number, rerollCost: number): boolean {
  return cash >= rerollCost;
}

export function purchaseItem(
  shopState: ShopState,
  runState: RunState,
  itemId: string
): { shopState: ShopState; runState: RunState } | null {
  const item = shopState.availableItems.find(i => i.id === itemId);
  if (!item || !canAffordItem(runState.cash, item)) {
    return null;
  }

  let newRunState = {
    ...runState,
    cash: runState.cash - item.price,
  };

  let newShopState: ShopState = {
    ...shopState,
    availableItems: shopState.availableItems.filter(i => i.id !== itemId),
  };

  // Apply item effects
  switch (item.type) {
    case 'upgrade': {
      const upgradeItem = item as UpgradeItem;
      switch (upgradeItem.effect.type) {
        case 'increaseHandSize':
          newRunState = {
            ...newRunState,
            handSize: newRunState.handSize + upgradeItem.effect.amount,
          };
          break;
        case 'increaseHandsPerRound':
          newRunState = {
            ...newRunState,
            handsCount: newRunState.handsCount + upgradeItem.effect.amount,
          };
          break;
        case 'increaseDiscards':
          // TODO: Add discard count to RunState
          break;
      }
      break;
    }
    
    case 'joker': {
      const jokerItem = item as JokerItem;
      newShopState = {
        ...newShopState,
        purchasedJokers: [...newShopState.purchasedJokers, jokerItem],
      };
      break;
    }
    
    case 'pack':
      // TODO: Implement pack opening
      break;
      
    case 'voucher':
      // TODO: Implement voucher effects
      break;
  }

  return { shopState: newShopState, runState: newRunState };
}

export function rerollShop(
  shopState: ShopState,
  runState: RunState
): { shopState: ShopState; runState: RunState } | null {
  if (!canReroll(runState.cash, shopState.rerollCost)) {
    return null;
  }

  const newRunState = {
    ...runState,
    cash: runState.cash - shopState.rerollCost,
  };

  const newShopState: ShopState = {
    ...shopState,
    availableItems: generateShopItems(newRunState.cash),
    rerollCost: shopState.rerollCost + 1, // Increase cost each time
    rerollsUsed: shopState.rerollsUsed + 1,
  };

  return { shopState: newShopState, runState: newRunState };
}