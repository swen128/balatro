import type { Card, CardEnhancement } from '../cards';
import { createCard, SUITS, RANKS } from '../cards';
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



export interface ArcanaCard {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly effect: ArcanaEffect;
}

type ArcanaEffect = 
  | { readonly type: 'enhanceHand'; readonly enhancement: CardEnhancement; readonly count: number }
  | { readonly type: 'createJoker'; readonly rarity: string }
  | { readonly type: 'createMoney'; readonly amount: number }
  | { readonly type: 'createPlanet'; readonly handType: string };


