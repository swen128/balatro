import type { RunState } from '../game';
import { addConsumable } from '../game';
import type { ShopItem, JokerItem, PackItem } from './shopItems.ts';
import { generateShopItems } from './shopItems.ts';
import type { SpectralCard } from '../cards';
import { createSpectralCard } from '../cards';
import type { AnyCard } from '../cards';
import { applyUpgradeEffect, applyVoucherToShop, addJokerToShop, createPackPendingState, createBaseStates } from './purchaseHelpers.ts';

interface BaseShopState {
  readonly purchasedJokers: ReadonlyArray<JokerItem>;
  readonly rerollCost: number;
  readonly rerollsUsed: number;
}

export interface BrowsingShopState extends BaseShopState {
  readonly type: 'browsing';
  readonly availableItems: ReadonlyArray<ShopItem>;
}

interface SelectingCardState extends BaseShopState {
  readonly type: 'selectingCard';
  readonly availableItems: ReadonlyArray<ShopItem>;
  readonly pendingPack: {
    readonly packType: 'standard' | 'spectral' | 'arcana' | 'celestial';
    readonly cards: ReadonlyArray<AnyCard>;
    readonly price: number;
    readonly originalItem: PackItem;
  };
}

export type ShopState = BrowsingShopState | SelectingCardState;

export function createShopState(runState: RunState): ShopState {
  return {
    type: 'browsing',
    availableItems: generateShopItems(runState.cash),
    purchasedJokers: [],
    rerollCost: 5,
    rerollsUsed: 0,
  };
}

function createSpectralCardFromShopItem(item: ShopItem): SpectralCard | null {
  return item.type === 'spectral'
    ? ((): SpectralCard | null => {
        switch (item.effect.type) {
          case 'addFoil':
            return createSpectralCard('foil', item.effect.count);
          case 'addHolographic':
            return createSpectralCard('holographic', item.effect.count);
          case 'addPolychrome':
            return createSpectralCard('polychrome', item.effect.count);
          case 'duplicateCard':
            // Not sold directly in shop
            return null;
        }
      })()
    : null;
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
      
    case 'spectral': {
      // Create a spectral card and add it to consumables
      const spectralCard = createSpectralCardFromShopItem(item);
      return {
        shopState: baseShopState,
        runState: spectralCard !== null 
          ? addConsumable(baseRunState, spectralCard)
          : baseRunState,
      };
    }
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
  // Reroll only works in browsing state
  return shopState.type !== 'browsing'
    ? { shopState, runState }
    : ((): { shopState: ShopState; runState: RunState } => {
        const newRunState = {
          ...runState,
          cash: runState.cash - shopState.rerollCost,
        };

        const newShopState: BrowsingShopState = {
          ...shopState,
          availableItems: generateShopItems(newRunState.cash),
          rerollCost: shopState.rerollCost + 1, // Increase cost each time
          rerollsUsed: shopState.rerollsUsed + 1,
        };

        return { shopState: newShopState, runState: newRunState };
      })();
}

export function selectCardFromPack(
  shopState: SelectingCardState,
  runState: RunState,
  card: AnyCard
): { shopState: BrowsingShopState; runState: RunState } {
  const updatedRunState = ((): RunState => {
    switch (card.type) {
      case 'playing':
        return { ...runState, deck: [...runState.deck, card] };
      case 'spectral':
      case 'arcana':
      case 'planet':
        return addConsumable(runState, card);
    }
  })();
    
  return {
    shopState: {
      type: 'browsing',
      availableItems: shopState.availableItems,
      purchasedJokers: shopState.purchasedJokers,
      rerollCost: shopState.rerollCost,
      rerollsUsed: shopState.rerollsUsed,
    },
    runState: updatedRunState,
  };
}

export function cancelPackSelection(
  shopState: SelectingCardState,
  runState: RunState
): { shopState: BrowsingShopState; runState: RunState } {
  return {
    shopState: {
      type: 'browsing',
      availableItems: [...shopState.availableItems, shopState.pendingPack.originalItem],
      purchasedJokers: shopState.purchasedJokers,
      rerollCost: shopState.rerollCost,
      rerollsUsed: shopState.rerollsUsed,
    },
    runState: {
      ...runState,
      cash: runState.cash + shopState.pendingPack.price,
    },
  };
}