import type { RunState } from '../game';
import type { ShopState, BrowsingShopState } from './shopLogic.ts';
import type { ShopItem, UpgradeItem, VoucherItem, JokerItem, PackItem } from './shopItems.ts';
import { generatePackCards } from './cardPacks.ts';
import type { AnyCard } from '../cards';

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
  shopState: BrowsingShopState,
  item: VoucherItem
): BrowsingShopState {
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
  shopState: BrowsingShopState,
  item: JokerItem
): BrowsingShopState {
  return {
    ...shopState,
    purchasedJokers: [...shopState.purchasedJokers, item],
  };
}

export function createPackPendingState(
  shopState: ShopState,
  item: PackItem
): ShopState {
  return shopState.type !== 'browsing'
    ? shopState
    : ((): ShopState => {
        const cards: ReadonlyArray<AnyCard> = generatePackCards(item.packType, item.cardCount);
        
        return {
          type: 'selectingCard' as const,
          availableItems: shopState.availableItems,
          purchasedJokers: shopState.purchasedJokers,
          rerollCost: shopState.rerollCost,
          rerollsUsed: shopState.rerollsUsed,
          pendingPack: {
            packType: item.packType,
            cards,
            price: item.price,
            originalItem: item,
          },
        };
      })();
}

export function createBaseStates(
  shopState: ShopState,
  runState: RunState,
  item: ShopItem
): { baseRunState: RunState; baseShopState: BrowsingShopState } {
  return {
    baseRunState: {
      ...runState,
      cash: runState.cash - item.price,
    },
    baseShopState: {
      type: 'browsing',
      availableItems: shopState.availableItems.filter(i => i.id !== item.id),
      purchasedJokers: shopState.purchasedJokers,
      rerollCost: shopState.rerollCost,
      rerollsUsed: shopState.rerollsUsed,
    },
  };
}