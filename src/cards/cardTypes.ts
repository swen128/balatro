import type { Suit, Rank, CardEnhancement } from './card.ts';

// Standard playing card (renamed from Card)
export interface PlayingCard {
  readonly type: 'playing';
  readonly id: string;
  readonly suit: Suit;
  readonly rank: Rank;
  readonly enhancement?: CardEnhancement;
}

// Spectral card effects
type SpectralEffect =
  | { readonly type: 'addFoil'; readonly count: number }
  | { readonly type: 'addHolographic'; readonly count: number }
  | { readonly type: 'addPolychrome'; readonly count: number }
  | { readonly type: 'duplicateCard'; readonly count: number }
  | { readonly type: 'destroyCard'; readonly count: number }
  | { readonly type: 'changeRank'; readonly targetRank: Rank }
  | { readonly type: 'changeSuit'; readonly targetSuit: Suit };

// Spectral cards - rare cards with powerful one-time effects
export interface SpectralCard {
  readonly type: 'spectral';
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly effect: SpectralEffect;
}

// Arcana card effects (Tarot cards)
type ArcanaEffect = 
  | { readonly type: 'enhanceHand'; readonly enhancement: CardEnhancement; readonly count: number }
  | { readonly type: 'createJoker'; readonly rarity: 'common' | 'uncommon' | 'rare' }
  | { readonly type: 'createMoney'; readonly amount: number }
  | { readonly type: 'createPlanet'; readonly handType: string }
  | { readonly type: 'transformCard'; readonly from: Rank; readonly to: Rank }
  | { readonly type: 'duplicateJoker' }
  | { readonly type: 'destroyJoker'; readonly moneyPerJoker: number };

// Arcana cards (Tarot) - cards that provide various benefits
export interface ArcanaCard {
  readonly type: 'arcana';
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly effect: ArcanaEffect;
}

// Union type for all card types
export type Card = PlayingCard | SpectralCard | ArcanaCard;

// Type guards
export function isPlayingCard(card: Card): card is PlayingCard {
  return card.type === 'playing';
}

