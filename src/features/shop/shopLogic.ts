import type { RunState } from '../../domain/runState.ts';
import type { ShopItem, JokerItem } from '../../domain/shopItems.ts';
import { generateShopItems } from '../../domain/shopItems.ts';
import type { Card } from '../../domain/card.ts';
import type { SpectralCard, ArcanaCard } from '../../domain/cardPacks.ts';
import { applyUpgradeEffect, applyVoucherToShop, addJokerToShop, createPackPendingState, createBaseStates } from './purchaseHelpers.ts';

export interface ShopState {
  readonly availableItems: ReadonlyArray<ShopItem>;
  readonly purchasedJokers: ReadonlyArray<JokerItem>;
  readonly rerollCost: number;
  readonly rerollsUsed: number;
  readonly pendingPack: {
    readonly type: 'standard' | 'spectral' | 'arcana';
    readonly cards: ReadonlyArray<Card | SpectralCard | ArcanaCard>;
  } | null;
}

export function createShopState(runState: RunState): ShopState {
  return {
    availableItems: generateShopItems(runState.cash),
    purchasedJokers: [],
    rerollCost: 5,
    rerollsUsed: 0,
    pendingPack: null,
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
  return !item || !canAffordItem(runState.cash, item)
    ? null
    : purchaseItemHelper(shopState, runState, item);
}

function purchaseItemHelper(
  shopState: ShopState,
  runState: RunState,
  item: ShopItem
): { shopState: ShopState; runState: RunState } {

  const { baseRunState, baseShopState } = createBaseStates(shopState, runState, item);

  switch (item.type) {
    case 'upgrade':
      return {
        shopState: baseShopState,
        runState: applyUpgradeEffect(baseRunState, item),
      };
      
    case 'joker':
      return {
        shopState: addJokerToShop(baseShopState, item),
        runState: baseRunState,
      };
      
    case 'pack':
      return {
        shopState: createPackPendingState(baseShopState, item),
        runState: baseRunState,
      };
      
    case 'voucher':
      return {
        shopState: applyVoucherToShop(baseShopState, item),
        runState: baseRunState,
      };
      
    case 'spectral':
      return {
        shopState: baseShopState,
        runState: baseRunState,
      };
  }
}

export function rerollShop(
  shopState: ShopState,
  runState: RunState
): { shopState: ShopState; runState: RunState } | null {
  return !canReroll(runState.cash, shopState.rerollCost)
    ? null
    : rerollShopHelper(shopState, runState);
}

function rerollShopHelper(
  shopState: ShopState,
  runState: RunState
): { shopState: ShopState; runState: RunState } {

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