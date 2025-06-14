export type ShopItemType = 'upgrade' | 'joker' | 'pack' | 'voucher' | 'spectral';

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
  readonly packType: 'arcana' | 'spectral' | 'standard';
  readonly cardCount: number;
}

export interface VoucherItem extends ShopItemBase {
  readonly type: 'voucher';
  readonly effect: VoucherEffect;
}

export interface SpectralItem extends ShopItemBase {
  readonly type: 'spectral';
  readonly effect: SpectralEffect;
}

export type UpgradeEffect = 
  | { readonly type: 'increaseHandSize'; readonly amount: number }
  | { readonly type: 'increaseHandsPerRound'; readonly amount: number }
  | { readonly type: 'increaseDiscards'; readonly amount: number };

export type JokerEffect =
  | { readonly type: 'addChips'; readonly amount: number; readonly condition?: string }
  | { readonly type: 'addMult'; readonly amount: number; readonly condition?: string }
  | { readonly type: 'multMult'; readonly amount: number; readonly condition?: string };

export type VoucherEffect =
  | { readonly type: 'shopDiscount'; readonly percent: number }
  | { readonly type: 'interestRate'; readonly percent: number }
  | { readonly type: 'rerollCost'; readonly amount: number };

export type SpectralEffect =
  | { readonly type: 'addFoil'; readonly count: number }
  | { readonly type: 'addHolographic'; readonly count: number }
  | { readonly type: 'addPolychrome'; readonly count: number }
  | { readonly type: 'duplicateCard'; readonly count: number };

export const SHOP_UPGRADES: ReadonlyArray<UpgradeItem> = [
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

export const SHOP_JOKERS: ReadonlyArray<JokerItem> = [
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

export const SHOP_PACKS: ReadonlyArray<PackItem> = [
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
];

export const SHOP_VOUCHERS: ReadonlyArray<VoucherItem> = [
  {
    id: 'voucher-clearance',
    type: 'voucher',
    name: 'Clearance Sale',
    description: '20% off all shop items',
    price: 10,
    effect: { type: 'shopDiscount', percent: 20 },
  },
];

export const SHOP_SPECTRAL: ReadonlyArray<SpectralItem> = [
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
    description: 'Add Holographic to 1 random card',
    price: 8,
    effect: { type: 'addHolographic', count: 1 },
  },
  {
    id: 'spectral-sigil',
    type: 'spectral',
    name: 'Sigil',
    description: 'Add Polychrome to 1 random card',
    price: 10,
    effect: { type: 'addPolychrome', count: 1 },
  },
];

export type ShopItem = UpgradeItem | JokerItem | PackItem | VoucherItem | SpectralItem;

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
  
  return shuffled.slice(0, 4); // Show 4 items
}