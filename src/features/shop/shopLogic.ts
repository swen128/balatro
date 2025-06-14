import type { RunState } from '../../domain/runState.ts';
import type { ShopItem, UpgradeItem, JokerItem, PackItem, VoucherItem } from '../../domain/shopItems.ts';
import { generateShopItems } from '../../domain/shopItems.ts';
import type { Card } from '../../domain/card.ts';
import type { SpectralCard, ArcanaCard } from '../../domain/cardPacks.ts';

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
          newRunState = {
            ...newRunState,
            discardsCount: newRunState.discardsCount + upgradeItem.effect.amount,
          };
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
    
    case 'pack': {
      const packItem = item as PackItem;
      // Generate cards for the pack but don't add them yet
      // Return the updated state with pending pack
      return { 
        shopState: {
          ...newShopState,
          pendingPack: {
            type: packItem.packType,
            cards: [], // Will be generated when modal opens
          },
        }, 
        runState: newRunState 
      };
    }
      
    case 'voucher': {
      const voucherItem = item as VoucherItem;
      switch (voucherItem.effect.type) {
        case 'shopDiscount':
          // Shop discount would affect future shop prices
          // For now, we'll store it as a modifier in runState
          // This would need a new field in RunState to track active vouchers
          break;
        case 'interestRate':
          // Interest rate would affect cash at end of rounds
          // This would need tracking in runState
          break;
        case 'rerollCost':
          newShopState = {
            ...newShopState,
            rerollCost: Math.max(0, newShopState.rerollCost - voucherItem.effect.amount),
          };
          break;
      }
      break;
    }
    
    case 'spectral': {
      // Spectral cards apply enhancements to cards in deck
      // This would be handled when the card is used, not when purchased
      // For now, just add to inventory (would need tracking)
      break;
    }
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