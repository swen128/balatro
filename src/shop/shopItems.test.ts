import { describe, test, expect } from 'bun:test';
import { 
  createRandomShopItems, 
  createCardPack,
  PACK_DEFINITIONS,
  type PackItem 
} from './shopItems.ts';

describe('shopItems', () => {
  describe('createRandomShopItems', () => {
    test('creates specified number of items', () => {
      const items = createRandomShopItems(5);
      expect(items.length).toBe(5);
    });

    test('creates default 6 items when no count specified', () => {
      const items = createRandomShopItems();
      expect(items.length).toBe(6);
    });

    test('all items have required properties', () => {
      const items = createRandomShopItems(10);
      
      for (const item of items) {
        expect(item.id).toBeTruthy();
        expect(item.type).toBeTruthy();
        expect(item.name).toBeTruthy();
        expect(item.description).toBeTruthy();
        expect(item.price).toBeGreaterThan(0);
        expect(['upgrade', 'joker', 'pack', 'voucher', 'spectral']).toContain(item.type);
      }
    });

    test('generates unique IDs for all items', () => {
      const items = createRandomShopItems(20);
      const ids = items.map(i => i.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    test('creates mix of different item types', () => {
      // Generate many items to ensure we get variety
      const items = createRandomShopItems(100);
      const types = new Set(items.map(i => i.type));
      
      // Should have at least 2 different types in 100 items
      expect(types.size).toBeGreaterThanOrEqual(2);
    });

    test('pack items have valid pack types', () => {
      const items = createRandomShopItems(50);
      const packItems = items.filter((i): i is PackItem => i.type === 'pack');
      
      for (const pack of packItems) {
        expect(['arcana', 'spectral', 'standard']).toContain(pack.packType);
        expect(pack.cardCount).toBeGreaterThan(0);
      }
    });
  });

  describe('createCardPack', () => {
    test('creates pack with specified number of cards', () => {
      const cards = createCardPack('standard', 5);
      expect(cards.length).toBe(5);
    });

    test('standard pack creates cards without enhancements', () => {
      const cards = createCardPack('standard', 10);
      
      for (const card of cards) {
        expect(card.id).toBeTruthy();
        expect(card.suit).toBeTruthy();
        expect(card.rank).toBeTruthy();
        expect(card.enhancement).toBeUndefined();
      }
    });

    test('arcana pack creates cards with enhancements', () => {
      // Generate many cards to ensure we get some enhancements
      const cards = createCardPack('arcana', 50);
      const enhancedCards = cards.filter(c => c.enhancement !== undefined);
      
      // At least some cards should have enhancements
      expect(enhancedCards.length).toBeGreaterThan(0);
      
      // Check that enhancements are valid types
      for (const card of enhancedCards) {
        expect(['foil', 'holographic', 'polychrome']).toContain(card.enhancement);
      }
    });

    test('spectral pack creates special enhanced cards', () => {
      const cards = createCardPack('spectral', 20);
      const enhancedCards = cards.filter(c => c.enhancement !== undefined);
      
      // Spectral packs should have higher enhancement rate
      expect(enhancedCards.length).toBeGreaterThan(0);
    });

    test('all created cards are valid', () => {
      const packTypes: Array<'standard' | 'arcana' | 'spectral'> = ['standard', 'arcana', 'spectral'];
      
      for (const packType of packTypes) {
        const cards = createCardPack(packType, 10);
        
        for (const card of cards) {
          expect(['♠', '♥', '♦', '♣']).toContain(card.suit);
          expect(['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']).toContain(card.rank);
        }
      }
    });
  });

  describe('PACK_DEFINITIONS', () => {
    test('has all required pack types', () => {
      expect(PACK_DEFINITIONS.standard).toBeDefined();
      expect(PACK_DEFINITIONS.arcana).toBeDefined();
      expect(PACK_DEFINITIONS.spectral).toBeDefined();
    });

    test('pack definitions have valid properties', () => {
      const packTypes: Array<keyof typeof PACK_DEFINITIONS> = ['standard', 'arcana', 'spectral'];
      
      for (const packType of packTypes) {
        const pack = PACK_DEFINITIONS[packType];
        expect(pack.name).toBeTruthy();
        expect(pack.description).toBeTruthy();
        expect(pack.price).toBeGreaterThan(0);
        expect(pack.cardCount).toBeGreaterThan(0);
      }
    });

    test('pack prices are reasonable', () => {
      expect(PACK_DEFINITIONS.standard.price).toBeLessThanOrEqual(10);
      expect(PACK_DEFINITIONS.arcana.price).toBeGreaterThan(PACK_DEFINITIONS.standard.price);
      expect(PACK_DEFINITIONS.spectral.price).toBeGreaterThan(PACK_DEFINITIONS.standard.price);
    });
  });
});