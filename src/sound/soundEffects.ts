/* eslint-disable functional/no-conditional-statements */
/* eslint-disable functional/no-return-void */
/* eslint-disable functional/no-try-statements */
/* eslint-disable no-console */

export type SoundEffectType = 
  | 'cardDraw'
  | 'cardSelect'
  | 'cardPlay'
  | 'cardDiscard'
  | 'chipCount'
  | 'scoreIncrease'
  | 'roundWin'
  | 'roundLose'
  | 'shopPurchase'
  | 'buttonClick'
  | 'blindSelect'
  | 'jokerActivate'
  | 'error';

export interface SoundConfig {
  readonly enabled: boolean;
  readonly volume: number; // 0-1
  readonly muted: boolean;
}

export const DEFAULT_SOUND_CONFIG: SoundConfig = {
  enabled: true,
  volume: 0.7,
  muted: false,
};

// Sound URLs - using placeholder paths for now
// In a real implementation, these would point to actual audio files
const SOUND_URLS: Record<SoundEffectType, string> = {
  cardDraw: '/sounds/card-draw.mp3',
  cardSelect: '/sounds/card-select.mp3',
  cardPlay: '/sounds/card-play.mp3',
  cardDiscard: '/sounds/card-discard.mp3',
  chipCount: '/sounds/chip-count.mp3',
  scoreIncrease: '/sounds/score-increase.mp3',
  roundWin: '/sounds/round-win.mp3',
  roundLose: '/sounds/round-lose.mp3',
  shopPurchase: '/sounds/shop-purchase.mp3',
  buttonClick: '/sounds/button-click.mp3',
  blindSelect: '/sounds/blind-select.mp3',
  jokerActivate: '/sounds/joker-activate.mp3',
  error: '/sounds/error.mp3',
};

const audioContext = (typeof window !== 'undefined' && window.AudioContext !== undefined)
  ? new AudioContext()
  : null;

const audioBuffers = new Map<SoundEffectType, AudioBuffer>();

async function loadSound(type: SoundEffectType): Promise<AudioBuffer | null> {
  if (!audioContext) return null;
  
  const cached = audioBuffers.get(type);
  if (cached) return cached;
  
  try {
    const url = SOUND_URLS[type];
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    audioBuffers.set(type, audioBuffer);
    return audioBuffer;
  } catch (error) {
    console.warn(`Failed to load sound: ${type}`, error);
    return null;
  }
}

export async function playSound(
  type: SoundEffectType,
  config: SoundConfig = DEFAULT_SOUND_CONFIG
): Promise<void> {
  if (!config.enabled || config.muted || !audioContext) {
    return;
  }
  
  const buffer = await loadSound(type);
  if (!buffer) return;
  
  try {
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    
    source.buffer = buffer;
    gainNode.gain.value = config.volume;
    
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    source.start(0);
  } catch (error) {
    console.warn(`Failed to play sound: ${type}`, error);
  }
}

export async function playSoundSequence(
  types: ReadonlyArray<SoundEffectType>,
  delayMs: number = 100,
  config: SoundConfig = DEFAULT_SOUND_CONFIG
): Promise<void> {
  for (const type of types) {
    await playSound(type, config);
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
}
// Play a sound with pitch variation (for variety)
export async function playSoundWithPitch(
  type: SoundEffectType,
  pitchMultiplier: number = 1,
  config: SoundConfig = DEFAULT_SOUND_CONFIG
): Promise<void> {
  if (!config.enabled || config.muted || !audioContext) {
    return;
  }
  
  const buffer = await loadSound(type);
  if (!buffer) return;
  
  try {
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    
    source.buffer = buffer;
    source.playbackRate.value = pitchMultiplier;
    gainNode.gain.value = config.volume;
    
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    source.start(0);
  } catch (error) {
    console.warn(`Failed to play sound with pitch: ${type}`, error);
  }
}

export function preloadAllSounds(): Promise<void> {
  const types: ReadonlyArray<SoundEffectType> = [
    'cardDraw',
    'cardSelect',
    'cardPlay',
    'cardDiscard',
    'chipCount',
    'scoreIncrease',
    'roundWin',
    'roundLose',
    'shopPurchase',
    'buttonClick',
    'blindSelect',
    'jokerActivate',
    'error',
  ];
  return Promise.all(types.map(type => loadSound(type))).then(() => undefined);
}
// Resume audio context (required for some browsers)
export function resumeAudioContext(): void {
  if (audioContext?.state === 'suspended') {
    void audioContext.resume().catch(console.warn);
  }
}