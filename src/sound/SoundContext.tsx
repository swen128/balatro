import React, { createContext, useContext } from 'react';
import type { UseSoundEffectsReturn } from './useSoundEffects.tsx';
import { useSoundEffects } from './useSoundEffects.tsx';

const SoundContext = createContext<UseSoundEffectsReturn | null>(null);

interface SoundProviderProps {
  readonly children: React.ReactNode;
}

export function SoundProvider({ children }: SoundProviderProps): React.ReactElement {
  const soundEffects = useSoundEffects();
  
  return (
    <SoundContext.Provider value={soundEffects}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound(): UseSoundEffectsReturn {
  const context = useContext(SoundContext);
  return !context
    ? ((): never => {
        throw new Error('useSound must be used within SoundProvider');
      })()
    : context;
}