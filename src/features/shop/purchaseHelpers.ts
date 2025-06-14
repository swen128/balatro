import type { RunState } from '../../domain/runState.ts';
import type { ShopState } from './shopLogic.ts';
import type { ShopItemUnion } from '../../domain/shopItems.ts';

export function applyUpgradeEffect(
  runState: RunState,
  item: ShopItemUnion
): RunState {
  return item.type !== 'upgrade' 
    ? runState
    : ((): RunState => {
        const upgradeItem = item; // TypeScript knows this is UpgradeItem now
        switch (upgradeItem.effect.type) {
          case 'increaseHandSize':
            return { ...runState, handSize: runState.handSize + upgradeItem.effect.amount };
            
          case 'increaseHandsPerRound':
            return { ...runState, handsCount: runState.handsCount + upgradeItem.effect.amount };
            
          case 'increaseDiscards':
            return { ...runState, discardsCount: runState.discardsCount + upgradeItem.effect.amount };
        }
      })();
}

export function applyVoucherToShop(
  shopState: ShopState,
  item: ShopItemUnion
): ShopState {
  return item.type !== 'voucher'
    ? shopState
    : ((): ShopState => {
        const voucherItem = item; // TypeScript knows this is VoucherItem now
        switch (voucherItem.effect.type) {
          case 'rerollCost':
            return {
              ...shopState,
              rerollCost: Math.max(0, shopState.rerollCost - voucherItem.effect.amount),
            };
            
          case 'shopDiscount':
            // Would need to track discount in shop state
            return shopState;
            
          case 'interestRate':
            // Would need to track interest rate
            return shopState;
        }
      })();
}

export function addJokerToShop(
  shopState: ShopState,
  item: ShopItemUnion
): ShopState {
  return item.type === 'joker'
    ? {
        ...shopState,
        purchasedJokers: [...shopState.purchasedJokers, item],
      }
    : shopState;
}

export function createPackPendingState(
  shopState: ShopState,
  item: ShopItemUnion
): ShopState {
  return item.type === 'pack'
    ? {
        ...shopState,
        pendingPack: {
          type: item.packType,
          cards: [],
        },
      }
    : shopState;
}

export function createBaseStates(
  shopState: ShopState,
  runState: RunState,
  item: ShopItemUnion
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