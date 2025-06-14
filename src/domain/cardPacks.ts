import type { Card, CardEnhancement } from './card.ts';
import { createCard, SUITS, RANKS } from './card.ts';
import type { SpectralEffect } from './shopItems.ts';

export function generateStandardPackCards(count: number): ReadonlyArray<Card> {
  return Array.from({ length: count }, (): Card => {
    const suitIndex = Math.floor(Math.random() * SUITS.length);
    const rankIndex = Math.floor(Math.random() * RANKS.length);
    const randomSuit = SUITS[suitIndex];
    const randomRank = RANKS[rankIndex];
    
    // 10% chance for enhancement
    const enhancements: ReadonlyArray<CardEnhancement> = ['foil', 'holographic', 'polychrome'];
    const enhancementIndex = Math.floor(Math.random() * enhancements.length);
    const enhancement: CardEnhancement | undefined = 
      Math.random() < 0.1 && enhancements[enhancementIndex] !== undefined
        ? enhancements[enhancementIndex]
        : undefined;
    
    // We know SUITS and RANKS are non-empty const arrays, so these will always be defined
    // But TypeScript with noUncheckedIndexedAccess requires us to check
    return randomSuit !== undefined && randomRank !== undefined
      ? createCard(randomSuit, randomRank, enhancement)
      : createCard('♠', 'A'); // Fallback that should never happen
  });
}

export interface SpectralCard {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly effect: SpectralEffect;
}

export const SPECTRAL_CARDS: ReadonlyArray<SpectralCard> = [
  {
    id: 'spectral-aura',
    name: 'Aura',
    description: 'Add Foil to 1 selected card in hand',
    effect: { type: 'addFoil', count: 1 },
  },
  {
    id: 'spectral-wraith',
    name: 'Wraith',
    description: 'Add Holographic to 1 random card',
    effect: { type: 'addHolographic', count: 1 },
  },
  {
    id: 'spectral-sigil',
    name: 'Sigil',
    description: 'Add Polychrome to 1 random card',
    effect: { type: 'addPolychrome', count: 1 },
  },
  {
    id: 'spectral-ouija',
    name: 'Ouija',
    description: 'Convert a random card to a random rank',
    effect: { type: 'duplicateCard', count: 1 }, // Simplified
  },
  {
    id: 'spectral-ectoplasm',
    name: 'Ectoplasm',
    description: 'Add negative to a random Joker',
    effect: { type: 'duplicateCard', count: 1 }, // Simplified
  },
];

export function generateSpectralPackCards(count: number): ReadonlyArray<SpectralCard> {
  const shuffled = [...SPECTRAL_CARDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export interface ArcanaCard {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly effect: ArcanaEffect;
}

export type ArcanaEffect = 
  | { readonly type: 'enhanceHand'; readonly enhancement: CardEnhancement; readonly count: number }
  | { readonly type: 'createJoker'; readonly rarity: string }
  | { readonly type: 'createMoney'; readonly amount: number }
  | { readonly type: 'createPlanet'; readonly handType: string };

export const ARCANA_CARDS: ReadonlyArray<ArcanaCard> = [
  {
    id: 'arcana-fool',
    name: 'The Fool',
    description: 'Create a random Joker',
    effect: { type: 'createJoker', rarity: 'common' },
  },
  {
    id: 'arcana-magician',
    name: 'The Magician',
    description: 'Enhance up to 2 cards in hand',
    effect: { type: 'enhanceHand', enhancement: 'foil', count: 2 },
  },
  {
    id: 'arcana-empress',
    name: 'The Empress',
    description: 'Enhance up to 2 cards in hand',
    effect: { type: 'enhanceHand', enhancement: 'holographic', count: 2 },
  },
  {
    id: 'arcana-emperor',
    name: 'The Emperor',
    description: 'Create 2 random Tarot cards',
    effect: { type: 'createJoker', rarity: 'tarot' }, // Simplified
  },
  {
    id: 'arcana-hierophant',
    name: 'The Hierophant',
    description: 'Enhance up to 2 cards in hand',
    effect: { type: 'enhanceHand', enhancement: 'polychrome', count: 2 },
  },
  {
    id: 'arcana-lovers',
    name: 'The Lovers',
    description: 'Enhance 1 selected card into a Wild Card',
    effect: { type: 'enhanceHand', enhancement: 'foil', count: 1 }, // Simplified
  },
  {
    id: 'arcana-chariot',
    name: 'The Chariot',
    description: 'Enhance 1 selected card into a Steel Card',
    effect: { type: 'enhanceHand', enhancement: 'foil', count: 1 }, // Simplified
  },
  {
    id: 'arcana-justice',
    name: 'Justice',
    description: 'Enhance 1 selected card into a Glass Card',
    effect: { type: 'enhanceHand', enhancement: 'foil', count: 1 }, // Simplified
  },
  {
    id: 'arcana-hermit',
    name: 'The Hermit',
    description: 'Doubles money (up to $20)',
    effect: { type: 'createMoney', amount: 20 },
  },
  {
    id: 'arcana-wheel',
    name: 'Wheel of Fortune',
    description: '1 in 4 chance to add Foil, Holographic, or Polychrome',
    effect: { type: 'enhanceHand', enhancement: 'foil', count: 1 }, // Simplified
  },
];

export function generateArcanaPackCards(count: number): ReadonlyArray<ArcanaCard> {
  const shuffled = [...ARCANA_CARDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}