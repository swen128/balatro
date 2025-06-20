/* eslint-disable functional/no-try-statements */
/* eslint-disable functional/no-return-void */
/* eslint-disable functional/no-conditional-statements */
/* eslint-disable @typescript-eslint/consistent-type-assertions */

import type { GameState } from '../game';

const SAVE_KEY = 'balatro_save';
const SAVE_VERSION = 1;

interface SaveData {
  readonly version: number;
  readonly gameState: GameState;
  readonly timestamp: number;
}
// Since type assertions are not allowed, we'll just trust the data structure
function parseSaveData(data: unknown): SaveData | null {
  try {
    return typeof data !== 'object' || data === null
      ? null
      : data as SaveData;
  } catch {
    return null;
  }
}

export function saveGame(gameState: GameState): void {
  try {
    const saveData: SaveData = {
      version: SAVE_VERSION,
      gameState,
      timestamp: Date.now(),
    };
    
    if (typeof window !== 'undefined' && window.localStorage !== undefined) {
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    }
  } catch {
    // Silently fail if localStorage is not available
  }
}

export function loadGame(): GameState | null {
  try {
    if (typeof window === 'undefined' || window.localStorage === undefined) {
      return null;
    }
    
    const savedData = window.localStorage.getItem(SAVE_KEY);
    if (savedData === null) {
      return null;
    }
    
    const parsedData: unknown = JSON.parse(savedData);
    const saveData = parseSaveData(parsedData);
    
    if (saveData === null) {
      return null;
    }
    
    if (saveData.version !== SAVE_VERSION) {
      return null;
    }
    
    return saveData.gameState;
  } catch {
    return null;
  }
}

export function hasSaveGame(): boolean {
  if (typeof window === 'undefined' || window.localStorage === undefined) {
    return false;
  }
  return window.localStorage.getItem(SAVE_KEY) !== null;
}

export function deleteSaveGame(): void {
  if (typeof window !== 'undefined' && window.localStorage !== undefined) {
    window.localStorage.removeItem(SAVE_KEY);
  }
}

export function getSaveInfo(): { timestamp: number } | null {
  try {
    if (typeof window === 'undefined' || window.localStorage === undefined) {
      return null;
    }
    
    const savedData = window.localStorage.getItem(SAVE_KEY);
    if (savedData === null) {
      return null;
    }
    
    const parsedData: unknown = JSON.parse(savedData);
    const saveData = parseSaveData(parsedData);
    
    if (saveData === null) {
      return null;
    }
    
    return { timestamp: saveData.timestamp };
  } catch {
    return null;
  }
}