import type { SpectralCard } from './cardTypes.ts';

// Spectral card definitions
const SPECTRAL_CARDS: ReadonlyArray<SpectralCard> = [
  {
    type: 'spectral',
    id: 'spectral_aura',
    name: 'Aura',
    description: 'Add Foil enhancement to 1 selected card in your hand',
    effect: { type: 'addFoil', count: 1 },
  },
  {
    type: 'spectral',
    id: 'spectral_wraith',
    name: 'Wraith',
    description: 'Add Holographic enhancement to 1 random card in your deck',
    effect: { type: 'addHolographic', count: 1 },
  },
  {
    type: 'spectral',
    id: 'spectral_sigil',
    name: 'Sigil',
    description: 'Add Polychrome enhancement to 1 random card in your deck',
    effect: { type: 'addPolychrome', count: 1 },
  },
  {
    type: 'spectral',
    id: 'spectral_ouija',
    name: 'Ouija',
    description: 'Convert all cards in hand to a single random rank',
    effect: { type: 'changeRank', targetRank: 'A' }, // Will be randomized when used
  },
  {
    type: 'spectral',
    id: 'spectral_ectoplasm',
    name: 'Ectoplasm',
    description: 'Duplicate 1 random card in your hand',
    effect: { type: 'duplicateCard', count: 1 },
  },
  {
    type: 'spectral',
    id: 'spectral_immolate',
    name: 'Immolate',
    description: 'Destroy 5 random cards in your deck',
    effect: { type: 'destroyCard', count: 5 },
  },
  {
    type: 'spectral',
    id: 'spectral_ankh',
    name: 'Ankh',
    description: 'Create a copy of 1 random Joker',
    effect: { type: 'duplicateCard', count: 1 }, // Special handling for joker duplication
  },
  {
    type: 'spectral',
    id: 'spectral_deja_vu',
    name: 'Deja Vu',
    description: 'Add Red Seal to 1 selected card in your hand',
    effect: { type: 'addFoil', count: 1 }, // TODO: Implement seals
  },
  {
    type: 'spectral',
    id: 'spectral_trance',
    name: 'Trance',
    description: 'Convert all cards in hand to the same suit',
    effect: { type: 'changeSuit', targetSuit: '♠' }, // Will be randomized when used
  },
];

export function getRandomSpectralCards(count: number): ReadonlyArray<SpectralCard> {
  const shuffled = [...SPECTRAL_CARDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}