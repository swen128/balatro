import React from 'react';
import type { SoundConfig } from './soundEffects.ts';

interface SoundSettingsProps {
  readonly config: SoundConfig;
  readonly onVolumeChange: (volume: number) => void;
  readonly onToggleMute: () => void;
  readonly onToggleEnabled: () => void;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export function SoundSettings({
  config,
  onVolumeChange,
  onToggleMute,
  onToggleEnabled,
  isOpen,
  onClose,
}: SoundSettingsProps): React.ReactElement | null {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Sound Settings</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Sound Enabled Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-lg">Sound Effects</span>
            <button
              onClick={onToggleEnabled}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                config.enabled ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  config.enabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {/* Mute Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-lg">Mute</span>
            <button
              onClick={onToggleMute}
              disabled={!config.enabled}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                config.muted ? 'bg-red-600' : 'bg-gray-600'
              } ${!config.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  config.muted ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {/* Volume Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">Volume</span>
              <span className="text-sm text-gray-400">
                {Math.round(config.volume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={config.volume * 100}
              onChange={e => onVolumeChange(Number(e.target.value) / 100)}
              disabled={!config.enabled || config.muted}
              className={`w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer ${
                !config.enabled || config.muted ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              style={{
                background: config.enabled && !config.muted
                  ? `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${config.volume * 100}%, #4B5563 ${config.volume * 100}%, #4B5563 100%)`
                  : undefined,
              }}
            />
          </div>
          
          {/* Sound Test */}
          <div className="pt-4 border-t border-gray-700">
            <button
              onClick={() => {
                // In a real implementation, this would play a test sound
                console.log('Playing test sound...');
              }}
              disabled={!config.enabled || config.muted}
              className={`w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors ${
                !config.enabled || config.muted 
                  ? 'opacity-50 cursor-not-allowed bg-gray-600 hover:bg-gray-600' 
                  : ''
              }`}
            >
              Test Sound
            </button>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}