import type { SpectralCard } from './cardTypes.ts';

const SPECTRAL_CARDS: ReadonlyArray<SpectralCard> = [
  {
    type: 'spectral',
    id: 'spectral_familiar',
    name: 'Familiar',
    description: 'Destroy 1 random card in your hand, add 3 random Enhanced face cards',
    effect: { type: 'destroyAndReplace', count: 1, replacementType: 'face', enhancedCount: 3 },
  },
  {
    type: 'spectral',
    id: 'spectral_grim',
    name: 'Grim',
    description: 'Destroy 1 random card in your hand, add 2 random Enhanced Aces',
    effect: { type: 'destroyAndReplace', count: 1, replacementType: 'ace', enhancedCount: 2 },
  },
  {
    type: 'spectral',
    id: 'spectral_incantation',
    name: 'Incantation',
    description: 'Destroy 1 random card in your hand, add 4 random Enhanced numbered cards',
    effect: { type: 'destroyAndReplace', count: 1, replacementType: 'numbered', enhancedCount: 4 },
  },
  {
    type: 'spectral',
    id: 'spectral_talisman',
    name: 'Talisman',
    description: 'Add a Gold Seal to 1 selected card',
    effect: { type: 'addSeal', sealType: 'gold', count: 1 },
  },
  {
    type: 'spectral',
    id: 'spectral_aura',
    name: 'Aura',
    description: 'Add Foil, Holographic, or Polychrome enhancement to 1 selected card in hand',
    effect: { type: 'addRandomEnhancement', count: 1 },
  },
  {
    type: 'spectral',
    id: 'spectral_wraith',
    name: 'Wraith',
    description: 'Creates a random Rare Joker, sets money to $0',
    effect: { type: 'createRareJoker', setMoneyToZero: true },
  },
  {
    type: 'spectral',
    id: 'spectral_sigil',
    name: 'Sigil',
    description: 'Convert all cards in hand to a single random suit',
    effect: { type: 'changeSuit', targetSuit: '♠' },
  },
  {
    type: 'spectral',
    id: 'spectral_ouija',
    name: 'Ouija',
    description: 'Convert all cards in hand to a single random rank, -1 Hand Size',
    effect: { type: 'changeRankWithHandSize', targetRank: 'A', handSizeChange: -1 },
  },
  {
    type: 'spectral',
    id: 'spectral_ectoplasm',
    name: 'Ectoplasm',
    description: 'Add Negative to a random Joker, -1 Hand Size',
    effect: { type: 'addNegativeToJoker', handSizeChange: -1 },
  },
  {
    type: 'spectral',
    id: 'spectral_immolate',
    name: 'Immolate',
    description: 'Destroy 5 random cards in hand, gain $20',
    effect: { type: 'destroyCardInHand', count: 5, gainMoney: 20 },
  },
  {
    type: 'spectral',
    id: 'spectral_ankh',
    name: 'Ankh',
    description: 'Create a copy of 1 random Joker, destroy the others',
    effect: { type: 'copyJokerAndDestroyOthers' },
  },
  {
    type: 'spectral',
    id: 'spectral_deja_vu',
    name: 'Deja Vu',
    description: 'Add a Red Seal to 1 selected card',
    effect: { type: 'addSeal', sealType: 'red', count: 1 },
  },
  {
    type: 'spectral',
    id: 'spectral_hex',
    name: 'Hex',
    description: 'Add Polychrome to a random Joker, destroy the rest',
    effect: { type: 'addPolychromeToJokerAndDestroyOthers' },
  },
  {
    type: 'spectral',
    id: 'spectral_trance',
    name: 'Trance',
    description: 'Add a Blue Seal to 1 selected card',
    effect: { type: 'addSeal', sealType: 'blue', count: 1 },
  },
  {
    type: 'spectral',
    id: 'spectral_medium',
    name: 'Medium',
    description: 'Add a Purple Seal to 1 selected card',
    effect: { type: 'addSeal', sealType: 'purple', count: 1 },
  },
  {
    type: 'spectral',
    id: 'spectral_cryptid',
    name: 'Cryptid',
    description: 'Create 2 exact copies of a selected card in your hand',
    effect: { type: 'duplicateCardExact', count: 2 },
  },
  {
    type: 'spectral',
    id: 'spectral_the_soul',
    name: 'The Soul',
    description: 'Creates a Legendary Joker',
    effect: { type: 'createLegendaryJoker' },
  },
  {
    type: 'spectral',
    id: 'spectral_black_hole',
    name: 'Black Hole',
    description: 'Upgrade every poker hand by 1 level',
    effect: { type: 'upgradeAllPokerHands' },
  },
];

export function getRandomSpectralCards(count: number): ReadonlyArray<SpectralCard> {
  const shuffled = [...SPECTRAL_CARDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function createSpectralCard(enhancement: 'foil' | 'holographic' | 'polychrome', count: number): SpectralCard {
  const spectralMap = {
    foil: {
      type: 'spectral' as const,
      id: 'spectral_aura',
      name: 'Aura',
      description: 'Add Foil, Holographic, or Polychrome enhancement to 1 selected card in hand',
      effect: { type: 'addRandomEnhancement' as const, count },
    },
    holographic: {
      type: 'spectral' as const,
      id: 'spectral_aura',
      name: 'Aura',
      description: 'Add Foil, Holographic, or Polychrome enhancement to 1 selected card in hand',
      effect: { type: 'addRandomEnhancement' as const, count },
    },
    polychrome: {
      type: 'spectral' as const,
      id: 'spectral_aura',
      name: 'Aura',
      description: 'Add Foil, Holographic, or Polychrome enhancement to 1 selected card in hand',
      effect: { type: 'addRandomEnhancement' as const, count },
    },
  };
  
  return spectralMap[enhancement];
}