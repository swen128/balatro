import type { RunState } from '../game';
import { addConsumable } from '../game';
import type { ShopItem, JokerItem, PackItem, UpgradeItem, VoucherItem, SpectralItem } from './shopItems.ts';
import { generateShopItems } from './shopItems.ts';
import type { SpectralCard } from '../cards';
import { createSpectralCard } from '../cards';
import type { AnyCard } from '../cards';
import { generatePackCards } from './cardPacks.ts';

interface BaseShopState {
  readonly purchasedJokers: ReadonlyArray<JokerItem>;
  readonly rerollCost: number;
  readonly rerollsUsed: number;
}

interface BrowsingShopState extends BaseShopState {
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

function createCardSelectionState(
  baseShopState: BaseShopState & { availableItems: ReadonlyArray<ShopItem> },
  item: PackItem
): SelectingCardState {
  const cards = generatePackCards(item.packType, item.cardCount);
  
  return {
    type: 'selectingCard',
    availableItems: baseShopState.availableItems,
    purchasedJokers: baseShopState.purchasedJokers,
    rerollCost: baseShopState.rerollCost,
    rerollsUsed: baseShopState.rerollsUsed,
    pendingPack: {
      packType: item.packType,
      cards,
      price: item.price,
      originalItem: item,
    },
  };
}

function createSpectralCardFromShopItem(item: SpectralItem): SpectralCard | null {
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
    : ((): { shopState: ShopState; runState: RunState } => {
        // Deduct the cost and remove item from shop
        const baseRunState: RunState = {
          ...runState,
          cash: runState.cash - item.price,
        };
        
        const baseShopState: BrowsingShopState = {
          type: 'browsing',
          availableItems: shopState.availableItems.filter(i => i.id !== item.id),
          purchasedJokers: shopState.purchasedJokers,
          rerollCost: shopState.rerollCost,
          rerollsUsed: shopState.rerollsUsed,
        };

        switch (item.type) {
          case 'upgrade':
            return {
              shopState: baseShopState,
              runState: applyUpgradeEffect(baseRunState, item),
            };
            
          case 'joker':
            return {
              shopState: {
                ...baseShopState,
                purchasedJokers: [...baseShopState.purchasedJokers, item],
              },
              runState: baseRunState,
            };
            
          case 'pack':
            return {
              shopState: createCardSelectionState(baseShopState, item),
              runState: baseRunState,
            };
            
          case 'voucher':
            return {
              shopState: applyVoucherToShop(baseShopState, item),
              runState: baseRunState,
            };
            
          case 'spectral': {
            const spectralCard = createSpectralCardFromShopItem(item);
            return {
              shopState: baseShopState,
              runState: spectralCard !== null 
                ? addConsumable(baseRunState, spectralCard)
                : baseRunState,
            };
          }
        }
      })();
}

export function rerollShop(
  shopState: ShopState,
  runState: RunState
): { shopState: ShopState; runState: RunState } | null {
  return !canReroll(runState.cash, shopState.rerollCost)
    ? null
    : ((): { shopState: ShopState; runState: RunState } => {
        switch (shopState.type) {
          case 'browsing': {
            const newRunState: RunState = {
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
          }
          
          case 'selectingCard':
            return { shopState, runState };
        }
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

function applyUpgradeEffect(
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

function applyVoucherToShop(
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