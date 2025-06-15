import type { Suit, Rank, CardEnhancement } from './card.ts';

export interface PlayingCard {
  readonly type: 'playing';
  readonly id: string;
  readonly suit: Suit;
  readonly rank: Rank;
  readonly enhancement?: CardEnhancement;
}

type SpectralEffect =
  | { readonly type: 'addFoil'; readonly count: number }
  | { readonly type: 'addHolographic'; readonly count: number }
  | { readonly type: 'addPolychrome'; readonly count: number }
  | { readonly type: 'duplicateCard'; readonly count: number }
  | { readonly type: 'destroyCard'; readonly count: number }
  | { readonly type: 'changeRank'; readonly targetRank: Rank }
  | { readonly type: 'changeSuit'; readonly targetSuit: Suit };

export interface SpectralCard {
  readonly type: 'spectral';
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly effect: SpectralEffect;
}

type ArcanaEffect = 
  | { readonly type: 'enhanceHand'; readonly enhancement: CardEnhancement; readonly count: number }
  | { readonly type: 'createJoker'; readonly rarity: 'common' | 'uncommon' | 'rare' }
  | { readonly type: 'createMoney'; readonly amount: number }
  | { readonly type: 'createPlanet'; readonly handType: string }
  | { readonly type: 'transformCard'; readonly from: Rank; readonly to: Rank }
  | { readonly type: 'duplicateJoker' }
  | { readonly type: 'destroyJoker'; readonly moneyPerJoker: number };

export interface ArcanaCard {
  readonly type: 'arcana';
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly effect: ArcanaEffect;
}

export type Card = PlayingCard | SpectralCard | ArcanaCard;

export function isPlayingCard(card: Card): card is PlayingCard {
  return card.type === 'playing';
}

