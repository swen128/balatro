import { useState, useCallback, useEffect } from 'react';
import type { SoundConfig, SoundEffectType } from './soundEffects.ts';
import { 
  DEFAULT_SOUND_CONFIG, 
  playSound, 
  playSoundSequence,
  playSoundWithPitch,
  preloadAllSounds,
  resumeAudioContext
} from './soundEffects.ts';

// LocalStorage key for sound settings
const SOUND_CONFIG_KEY = 'balatro-sound-config';

// Load sound config from localStorage
function loadSoundConfig(): SoundConfig {
  if (typeof window !== 'undefined' && window.localStorage !== undefined) {
    const saved = window.localStorage.getItem(SOUND_CONFIG_KEY);
    if (saved !== null) {
      try {
        return JSON.parse(saved) as SoundConfig;
      } catch {
        return DEFAULT_SOUND_CONFIG;
      }
    }
  }
  return DEFAULT_SOUND_CONFIG;
}

// Save sound config to localStorage
function saveSoundConfig(config: SoundConfig): void {
  if (typeof window !== 'undefined' && window.localStorage !== undefined) {
    window.localStorage.setItem(SOUND_CONFIG_KEY, JSON.stringify(config));
  }
}

export interface UseSoundEffectsReturn {
  readonly config: SoundConfig;
  readonly play: (type: SoundEffectType) => void;
  readonly playSequence: (types: ReadonlyArray<SoundEffectType>, delayMs?: number) => void;
  readonly playWithPitch: (type: SoundEffectType, pitch: number) => void;
  readonly setVolume: (volume: number) => void;
  readonly toggleMute: () => void;
  readonly toggleEnabled: () => void;
}

export function useSoundEffects(): UseSoundEffectsReturn {
  const [config, setConfig] = useState<SoundConfig>(loadSoundConfig);
  
  // Save config when it changes
  useEffect(() => {
    saveSoundConfig(config);
  }, [config]);
  
  // Resume audio context on user interaction
  useEffect(() => {
    const handleUserInteraction = (): void => {
      resumeAudioContext();
    };
    
    window.addEventListener('click', handleUserInteraction, { once: true });
    window.addEventListener('keydown', handleUserInteraction, { once: true });
    
    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);
  
  // Preload sounds on mount
  useEffect(() => {
    preloadAllSounds().catch(console.warn);
  }, []);
  
  const play = useCallback((type: SoundEffectType): void => {
    playSound(type, config).catch(console.warn);
  }, [config]);
  
  const playSequence = useCallback((
    types: ReadonlyArray<SoundEffectType>,
    delayMs?: number
  ): void => {
    playSoundSequence(types, delayMs, config).catch(console.warn);
  }, [config]);
  
  const playWithPitch = useCallback((
    type: SoundEffectType,
    pitch: number
  ): void => {
    playSoundWithPitch(type, pitch, config).catch(console.warn);
  }, [config]);
  
  const setVolume = useCallback((volume: number): void => {
    setConfig(prev => ({
      ...prev,
      volume: Math.max(0, Math.min(1, volume)),
    }));
  }, []);
  
  const toggleMute = useCallback((): void => {
    setConfig(prev => ({
      ...prev,
      muted: !prev.muted,
    }));
  }, []);
  
  const toggleEnabled = useCallback((): void => {
    setConfig(prev => ({
      ...prev,
      enabled: !prev.enabled,
    }));
  }, []);
  
  return {
    config,
    play,
    playSequence,
    playWithPitch,
    setVolume,
    toggleMute,
    toggleEnabled,
  };
}