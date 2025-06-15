import { nanoid } from 'nanoid';
import type { PokerHandKey } from '../scoring';
import { POKER_HANDS } from '../scoring';

export interface PlanetCard {
  readonly id: string;
  readonly type: 'planet';
  readonly name: string;
  readonly handType: PokerHandKey;
  readonly description: string;
}

export const PLANET_CARDS = {
  PAIR: 'Mercury',
  TWO_PAIR: 'Venus',
  THREE_OF_A_KIND: 'Earth',
  STRAIGHT: 'Mars',
  FLUSH: 'Jupiter',
  FULL_HOUSE: 'Saturn',
  FOUR_OF_A_KIND: 'Uranus',
  STRAIGHT_FLUSH: 'Neptune',
  ROYAL_FLUSH: 'Pluto',
  HIGH_CARD: 'Planet X',
} as const satisfies Record<PokerHandKey, string>;

function formatHandType(handType: PokerHandKey): string {
  return POKER_HANDS[handType].name;
}

export function createPlanetCard(handType: PokerHandKey): PlanetCard {
  return {
    id: nanoid(),
    type: 'planet',
    name: PLANET_CARDS[handType],
    handType,
    description: `Level up ${formatHandType(handType)}`,
  };
}

const PLANET_HAND_TYPES: ReadonlyArray<PokerHandKey> = [
  'PAIR', 'TWO_PAIR', 'THREE_OF_A_KIND', 'STRAIGHT', 'FLUSH',
  'FULL_HOUSE', 'FOUR_OF_A_KIND', 'STRAIGHT_FLUSH', 'ROYAL_FLUSH', 'HIGH_CARD'
];

export function createRandomPlanetCard(): PlanetCard {
  const randomIndex = Math.floor(Math.random() * PLANET_HAND_TYPES.length);
  const handType = PLANET_HAND_TYPES[randomIndex];
  
  return handType !== undefined
    ? createPlanetCard(handType)
    : createPlanetCard('PAIR'); // Fallback, though this should never happen
}

export function getRandomPlanetCards(count: number): ReadonlyArray<PlanetCard> {
  return Array.from({ length: count }, () => createRandomPlanetCard());
}