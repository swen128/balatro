import type { ArcanaCard } from './cardTypes.ts';

// Arcana (Tarot) card definitions
const ARCANA_CARDS: ReadonlyArray<ArcanaCard> = [
  // Major Arcana
  {
    type: 'arcana',
    id: 'arcana_fool',
    name: 'The Fool',
    description: 'Create the last Tarot or Planet card used during this run',
    effect: { type: 'createJoker', rarity: 'common' }, // TODO: Implement copy last tarot/planet
  },
  {
    type: 'arcana',
    id: 'arcana_magician',
    name: 'The Magician',
    description: 'Enhance 1 selected card into a Lucky Card',
    effect: { type: 'enhanceHand', enhancement: 'foil', count: 1 }, // TODO: Implement lucky cards
  },
  {
    type: 'arcana',
    id: 'arcana_priestess',
    name: 'The High Priestess',
    description: 'Creates up to 2 random Planet cards',
    effect: { type: 'createPlanet', handType: 'random' },
  },
  {
    type: 'arcana',
    id: 'arcana_empress',
    name: 'The Empress',
    description: 'Enhance 2 selected cards into Mult Cards',
    effect: { type: 'enhanceHand', enhancement: 'holographic', count: 2 },
  },
  {
    type: 'arcana',
    id: 'arcana_emperor',
    name: 'The Emperor',
    description: 'Creates up to 2 random Tarot cards',
    effect: { type: 'createJoker', rarity: 'common' }, // TODO: Create tarot cards instead
  },
  {
    type: 'arcana',
    id: 'arcana_hierophant',
    name: 'The Hierophant',
    description: 'Enhance 2 selected cards into Bonus Cards',
    effect: { type: 'enhanceHand', enhancement: 'foil', count: 2 },
  },
  {
    type: 'arcana',
    id: 'arcana_lovers',
    name: 'The Lovers',
    description: 'Enhance 1 selected card into a Wild Card',
    effect: { type: 'enhanceHand', enhancement: 'polychrome', count: 1 }, // TODO: Implement wild cards
  },
  {
    type: 'arcana',
    id: 'arcana_chariot',
    name: 'The Chariot',
    description: 'Enhance 1 selected card into a Steel Card',
    effect: { type: 'enhanceHand', enhancement: 'foil', count: 1 }, // TODO: Implement steel cards
  },
  {
    type: 'arcana',
    id: 'arcana_justice',
    name: 'Justice',
    description: 'Enhance 1 selected card into a Glass Card',
    effect: { type: 'enhanceHand', enhancement: 'glass', count: 1 },
  },
  {
    type: 'arcana',
    id: 'arcana_hermit',
    name: 'The Hermit',
    description: 'Earn $20',
    effect: { type: 'createMoney', amount: 20 },
  },
  {
    type: 'arcana',
    id: 'arcana_wheel',
    name: 'The Wheel of Fortune',
    description: 'Adds Foil, Holographic, or Polychrome edition to 1 random Joker',
    effect: { type: 'createJoker', rarity: 'common' }, // TODO: Enhance joker instead
  },
  {
    type: 'arcana',
    id: 'arcana_strength',
    name: 'Strength',
    description: 'Increase rank of up to 2 selected cards by 1',
    effect: { type: 'transformCard', from: '2', to: '3' }, // TODO: Implement rank increase
  },
  {
    type: 'arcana',
    id: 'arcana_hanged_man',
    name: 'The Hanged Man',
    description: 'Destroy up to 2 selected cards',
    effect: { type: 'destroyJoker', moneyPerJoker: 0 }, // TODO: Destroy cards instead
  },
  {
    type: 'arcana',
    id: 'arcana_death',
    name: 'Death',
    description: 'Select 2 cards, convert the left card into the right card',
    effect: { type: 'transformCard', from: 'A', to: 'K' }, // TODO: Implement card conversion
  },
  {
    type: 'arcana',
    id: 'arcana_temperance',
    name: 'Temperance',
    description: 'Earn money equal to your current Joker sell value',
    effect: { type: 'createMoney', amount: 50 }, // TODO: Calculate from jokers
  },
  {
    type: 'arcana',
    id: 'arcana_devil',
    name: 'The Devil',
    description: 'Enhance 1 selected card into a Gold Card',
    effect: { type: 'enhanceHand', enhancement: 'foil', count: 1 }, // TODO: Implement gold cards
  },
  {
    type: 'arcana',
    id: 'arcana_tower',
    name: 'The Tower',
    description: 'Enhance 1 selected card into a Stone Card',
    effect: { type: 'enhanceHand', enhancement: 'foil', count: 1 }, // TODO: Implement stone cards
  },
  {
    type: 'arcana',
    id: 'arcana_star',
    name: 'The Star',
    description: 'Convert up to 3 selected cards to Diamonds',
    effect: { type: 'transformCard', from: 'A', to: 'A' }, // TODO: Implement suit conversion
  },
  {
    type: 'arcana',
    id: 'arcana_moon',
    name: 'The Moon',
    description: 'Convert up to 3 selected cards to Clubs',
    effect: { type: 'transformCard', from: 'A', to: 'A' }, // TODO: Implement suit conversion
  },
  {
    type: 'arcana',
    id: 'arcana_sun',
    name: 'The Sun',
    description: 'Convert up to 3 selected cards to Hearts',
    effect: { type: 'transformCard', from: 'A', to: 'A' }, // TODO: Implement suit conversion
  },
  {
    type: 'arcana',
    id: 'arcana_judgement',
    name: 'Judgement',
    description: 'Create a random Joker',
    effect: { type: 'createJoker', rarity: 'common' },
  },
  {
    type: 'arcana',
    id: 'arcana_world',
    name: 'The World',
    description: 'Convert up to 3 selected cards to Spades',
    effect: { type: 'transformCard', from: 'A', to: 'A' }, // TODO: Implement suit conversion
  },
];

export function getRandomArcanaCards(count: number): ReadonlyArray<ArcanaCard> {
  const shuffled = [...ARCANA_CARDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}