import type { Suit, Rank, CardEnhancement, CardSeal } from './card.ts';
import type { ConsumableCard } from '../consumables';

export interface PlayingCard {
  readonly type: 'playing';
  readonly id: string;
  readonly suit: Suit;
  readonly rank: Rank;
  readonly enhancement?: CardEnhancement;
  readonly seal?: CardSeal;
}

type SpectralEffect =
  | { readonly type: 'addFoil'; readonly count: number }
  | { readonly type: 'addHolographic'; readonly count: number }
  | { readonly type: 'addPolychrome'; readonly count: number }
  | { readonly type: 'addRandomEnhancement'; readonly count: number }
  | { readonly type: 'addSeal'; readonly sealType: CardSeal; readonly count: number }
  | { readonly type: 'duplicateCard'; readonly count: number }
  | { readonly type: 'duplicateCardExact'; readonly count: number }
  | { readonly type: 'destroyCard'; readonly count: number }
  | { readonly type: 'destroyCardInHand'; readonly count: number; readonly gainMoney: number }
  | { readonly type: 'destroyAndReplace'; readonly count: number; readonly replacementType: 'face' | 'ace' | 'numbered'; readonly enhancedCount: number }
  | { readonly type: 'changeRank'; readonly targetRank: Rank }
  | { readonly type: 'changeRankWithHandSize'; readonly targetRank: Rank; readonly handSizeChange: number }
  | { readonly type: 'changeSuit'; readonly targetSuit: Suit }
  | { readonly type: 'createRareJoker'; readonly setMoneyToZero: boolean }
  | { readonly type: 'createLegendaryJoker' }
  | { readonly type: 'copyJokerAndDestroyOthers' }
  | { readonly type: 'addNegativeToJoker'; readonly handSizeChange: number }
  | { readonly type: 'addPolychromeToJokerAndDestroyOthers' }
  | { readonly type: 'upgradeAllPokerHands' };

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

export type AnyCard = PlayingCard | ConsumableCard;
