import type { SpectralCard, ArcanaCard } from '../cards';
import type { PlanetCard } from './planetCard.ts';

export type ConsumableCard = SpectralCard | ArcanaCard | PlanetCard;

export { 
  applySpectralEffect, 
  applyArcanaEffect,
  applyPlanetEffect,
  canUseConsumable,
  getRequiredSelections 
} from './consumableEffects.ts';

export type { PlanetCard } from './planetCard.ts';
export { 
  getRandomPlanetCards
} from './planetCard.ts';