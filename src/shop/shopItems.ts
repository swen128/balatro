import type { Card, CardEnhancement, Suit, Rank } from '../cards';
import { createCard } from '../cards';

type ShopItemType = 'upgrade' | 'joker' | 'pack' | 'voucher' | 'spectral';

interface ShopItemBase {
  readonly id: string;
  readonly type: ShopItemType;
  readonly name: string;
  readonly description: string;
  readonly price: number;
}

export interface UpgradeItem extends ShopItemBase {
  readonly type: 'upgrade';
  readonly effect: UpgradeEffect;
}

export interface JokerItem extends ShopItemBase {
  readonly type: 'joker';
  readonly effect: JokerEffect;
}

export interface PackItem extends ShopItemBase {
  readonly type: 'pack';
  readonly packType: 'arcana' | 'spectral' | 'standard' | 'celestial';
  readonly cardCount: number;
}

export interface VoucherItem extends ShopItemBase {
  readonly type: 'voucher';
  readonly effect: VoucherEffect;
}

export interface SpectralItem extends ShopItemBase {
  readonly type: 'spectral';
  readonly effect: 
    | { readonly type: 'addFoil'; readonly count: number }
    | { readonly type: 'addHolographic'; readonly count: number }
    | { readonly type: 'addPolychrome'; readonly count: number }
    | { readonly type: 'duplicateCard'; readonly count: number };
}

type UpgradeEffect = 
  | { readonly type: 'increaseHandSize'; readonly amount: number }
  | { readonly type: 'increaseHandsPerRound'; readonly amount: number }
  | { readonly type: 'increaseDiscards'; readonly amount: number };

type JokerEffect =
  | { readonly type: 'addChips'; readonly amount: number; readonly condition?: string }
  | { readonly type: 'addMult'; readonly amount: number; readonly condition?: string }
  | { readonly type: 'multMult'; readonly amount: number; readonly condition?: string };

type VoucherEffect =
  | { readonly type: 'shopDiscount'; readonly percent: number }
  | { readonly type: 'interestRate'; readonly percent: number }
  | { readonly type: 'rerollCost'; readonly amount: number };

// TODO: Uncomment when spectral cards are implemented
// export type SpectralEffect =
//   | { readonly type: 'addFoil'; readonly count: number }
//   | { readonly type: 'addHolographic'; readonly count: number }
//   | { readonly type: 'addPolychrome'; readonly count: number }
//   | { readonly type: 'duplicateCard'; readonly count: number };

const SHOP_UPGRADES: ReadonlyArray<UpgradeItem> = [
  {
    id: 'hand-size-1',
    type: 'upgrade',
    name: '+1 Hand Size',
    description: 'Increase hand size by 1',
    price: 15,
    effect: { type: 'increaseHandSize', amount: 1 },
  },
  {
    id: 'hands-1',
    type: 'upgrade',
    name: '+1 Hands',
    description: 'Play 1 additional hand per round',
    price: 20,
    effect: { type: 'increaseHandsPerRound', amount: 1 },
  },
  {
    id: 'discards-1',
    type: 'upgrade',
    name: '+1 Discards',
    description: 'Gain 1 additional discard per round',
    price: 10,
    effect: { type: 'increaseDiscards', amount: 1 },
  },
];

const SHOP_JOKERS: ReadonlyArray<JokerItem> = [
  {
    id: 'joker-chips-20',
    type: 'joker',
    name: 'Blue Joker',
    description: '+20 Chips',
    price: 25,
    effect: { type: 'addChips', amount: 20 },
  },
  {
    id: 'joker-mult-3',
    type: 'joker',
    name: 'Red Joker',
    description: '+3 Mult',
    price: 30,
    effect: { type: 'addMult', amount: 3 },
  },
  {
    id: 'joker-mult-pairs',
    type: 'joker',
    name: 'Pair Master',
    description: '+15 Chips if hand contains a Pair',
    price: 35,
    effect: { type: 'addChips', amount: 15, condition: 'pair' },
  },
];

const SHOP_PACKS: ReadonlyArray<PackItem> = [
  {
    id: 'pack-standard',
    type: 'pack',
    name: 'Standard Pack',
    description: 'Choose 1 of 3 playing cards',
    price: 4,
    packType: 'standard',
    cardCount: 3,
  },
  {
    id: 'pack-arcana',
    type: 'pack',
    name: 'Arcana Pack',
    description: 'Choose 1 of 3 Tarot cards',
    price: 6,
    packType: 'arcana',
    cardCount: 3,
  },
  {
    id: 'pack-spectral',
    type: 'pack',
    name: 'Spectral Pack',
    description: 'Choose 1 of 2 Spectral cards',
    price: 8,
    packType: 'spectral',
    cardCount: 2,
  },
  {
    id: 'pack-celestial',
    type: 'pack',
    name: 'Celestial Pack',
    description: 'Choose 1 of 3 Planet cards',
    price: 6,
    packType: 'celestial',
    cardCount: 3,
  },
];

const SHOP_VOUCHERS: ReadonlyArray<VoucherItem> = [
  {
    id: 'voucher-clearance',
    type: 'voucher',
    name: 'Clearance Sale',
    description: '20% off all shop items',
    price: 10,
    effect: { type: 'shopDiscount', percent: 20 },
  },
];

const SHOP_SPECTRAL: ReadonlyArray<SpectralItem> = [
  {
    id: 'spectral-aura',
    type: 'spectral',
    name: 'Aura',
    description: 'Add Foil to 1 selected card',
    price: 6,
    effect: { type: 'addFoil', count: 1 },
  },
  {
    id: 'spectral-wraith',
    type: 'spectral',
    name: 'Wraith',
    description: 'Add Holographic to 1 selected card',
    price: 8,
    effect: { type: 'addHolographic', count: 1 },
  },
  {
    id: 'spectral-sigil',
    type: 'spectral',
    name: 'Sigil',
    description: 'Add Polychrome to 1 selected card',
    price: 10,
    effect: { type: 'addPolychrome', count: 1 },
  },
];

export type ShopItem = UpgradeItem | JokerItem | PackItem | VoucherItem | SpectralItem;

export const PACK_DEFINITIONS = {
  standard: {
    name: 'Standard Pack',
    description: 'Choose 1 of 3 playing cards',
    price: 4,
    cardCount: 3,
  },
  arcana: {
    name: 'Arcana Pack',
    description: 'Choose 1 of 3 enhanced cards',
    price: 6,
    cardCount: 3,
  },
  spectral: {
    name: 'Spectral Pack',
    description: 'Choose 1 of 2 special cards',
    price: 8,
    cardCount: 2,
  },
  celestial: {
    name: 'Celestial Pack',
    description: 'Choose 1 of 3 planet cards',
    price: 6,
    cardCount: 3,
  },
} as const;

export function createCardPack(packType: 'standard' | 'arcana' | 'spectral' | 'celestial', count: number): ReadonlyArray<Card> {
  const suits: ReadonlyArray<Suit> = ['♠', '♥', '♦', '♣'];
  const ranks: ReadonlyArray<Rank> = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  
  return Array.from({ length: count }, () => {
    const suitIndex = Math.floor(Math.random() * suits.length);
    const rankIndex = Math.floor(Math.random() * ranks.length);
    const suit = suits[suitIndex];
    const rank = ranks[rankIndex];
    
    const finalSuit = suit ?? '♠';
    const finalRank = rank ?? 'A';
    
    const enhancement = ((): CardEnhancement | undefined => {
      const enhancements: CardEnhancement[] = ['foil', 'holographic', 'polychrome'];
      const enhancementIndex = Math.floor(Math.random() * enhancements.length);
      
      return packType === 'standard'
        ? undefined
        : packType === 'arcana' && Math.random() < 0.3
        ? enhancements[enhancementIndex]
        : packType === 'spectral' && Math.random() < 0.5
        ? enhancements[enhancementIndex]
        : undefined;
    })();
    
    return createCard(finalSuit, finalRank, enhancement);
  });
}

export function createRandomShopItems(count: number = 6): ReadonlyArray<ShopItem> {
  const allItems: ReadonlyArray<ShopItem> = [
    ...SHOP_UPGRADES,
    ...SHOP_JOKERS,
    ...SHOP_PACKS,
    ...SHOP_VOUCHERS,
    ...SHOP_SPECTRAL,
  ];
  
  const shuffled = [...allItems].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function generateShopItems(cash: number): ReadonlyArray<ShopItem> {
  // For now, return a random selection of items
  const allItems: ReadonlyArray<ShopItem> = [
    ...SHOP_UPGRADES,
    ...SHOP_JOKERS,
    ...SHOP_PACKS,
    ...SHOP_VOUCHERS,
    ...SHOP_SPECTRAL,
  ];
  
  // Filter items by price and randomly select
  const affordableItems = allItems.filter(item => item.price <= cash * 2);
  const shuffled = [...affordableItems].sort(() => Math.random() - 0.5);
  
  return shuffled.slice(0, 4);
}