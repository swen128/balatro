import type { RunState } from '../game';
import type { ShopState } from './shopLogic.ts';
import type { ShopItem, UpgradeItem, VoucherItem, JokerItem, PackItem } from './shopItems.ts';

export function applyUpgradeEffect(
  runState: RunState,
  item: UpgradeItem
): RunState {
  switch (item.effect.type) {
    case 'increaseHandSize':
      return { ...runState, handSize: runState.handSize + item.effect.amount };
      
    case 'increaseHandsPerRound':
      return { ...runState, handsCount: runState.handsCount + item.effect.amount };
      
    case 'increaseDiscards':
      return { ...runState, discardsCount: runState.discardsCount + item.effect.amount };
  }
}

export function applyVoucherToShop(
  shopState: ShopState,
  item: VoucherItem
): ShopState {
  switch (item.effect.type) {
    case 'rerollCost':
      return {
        ...shopState,
        rerollCost: Math.max(0, shopState.rerollCost - item.effect.amount),
      };
      
    case 'shopDiscount':
      // Would need to track discount in shop state
      return shopState;
      
    case 'interestRate':
      // Would need to track interest rate
      return shopState;
  }
}

export function addJokerToShop(
  shopState: ShopState,
  item: JokerItem
): ShopState {
  return {
    ...shopState,
    purchasedJokers: [...shopState.purchasedJokers, item],
  };
}

export function createPackPendingState(
  shopState: ShopState,
  item: PackItem
): ShopState {
  return {
    ...shopState,
    pendingPack: {
      type: item.packType,
      cards: [],
    },
  };
}

export function createBaseStates(
  shopState: ShopState,
  runState: RunState,
  item: ShopItem
): { baseRunState: RunState; baseShopState: ShopState } {
  return {
    baseRunState: {
      ...runState,
      cash: runState.cash - item.price,
    },
    baseShopState: {
      ...shopState,
      availableItems: shopState.availableItems.filter(i => i.id !== item.id),
    },
  };
}