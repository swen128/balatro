import type { Card, CardEnhancement, AnyCard, SpectralCard, ArcanaCard } from '../cards';
import { createCard, SUITS, RANKS, getRandomSpectralCards, getRandomArcanaCards } from '../cards';
import type { PlanetCard } from '../consumables';
import { getRandomPlanetCards } from '../consumables';

function generateStandardPackCards(count: number): ReadonlyArray<AnyCard> {
  return Array.from({ length: count }, (): Card => {
    const suitIndex = Math.floor(Math.random() * SUITS.length);
    const rankIndex = Math.floor(Math.random() * RANKS.length);
    const randomSuit = SUITS[suitIndex];
    const randomRank = RANKS[rankIndex];
    
    const enhancements: ReadonlyArray<CardEnhancement> = ['foil', 'holographic', 'polychrome'];
    const enhancementIndex = Math.floor(Math.random() * enhancements.length);
    const enhancement: CardEnhancement | undefined = 
      Math.random() < 0.1 && enhancements[enhancementIndex] !== undefined
        ? enhancements[enhancementIndex]
        : undefined;
    return randomSuit !== undefined && randomRank !== undefined
      ? createCard(randomSuit, randomRank, enhancement)
      : createCard('♠', 'A');
  });
}

function generateSpectralPackCards(count: number): ReadonlyArray<SpectralCard> {
  return getRandomSpectralCards(count);
}

function generateArcanaPackCards(count: number): ReadonlyArray<ArcanaCard> {
  return getRandomArcanaCards(count);
}

function generateCelestialPackCards(count: number): ReadonlyArray<PlanetCard> {
  return getRandomPlanetCards(count);
}

export function generatePackCards(packType: 'standard' | 'spectral' | 'arcana' | 'celestial', count: number): ReadonlyArray<AnyCard> {
  switch (packType) {
    case 'standard':
      return generateStandardPackCards(count);
    case 'spectral':
      return generateSpectralPackCards(count);
    case 'arcana':
      return generateArcanaPackCards(count);
    case 'celestial':
      return generateCelestialPackCards(count);
  }
}


