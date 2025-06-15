import React from 'react';
import type { ConsumableCard } from '../consumables';
import { Card } from '../cards/Card.tsx';

interface ConsumablesDisplayProps {
  readonly consumables: ReadonlyArray<ConsumableCard>;
  readonly maxConsumables: number;
  readonly onUseConsumable: (consumableId: string) => void;
  readonly disabled: boolean;
}

export function ConsumablesDisplay({ 
  consumables, 
  maxConsumables,
  onUseConsumable,
  disabled
}: ConsumablesDisplayProps): React.ReactElement {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-bold">Consumables</h3>
        <span className="text-sm text-gray-400">
          {consumables.length}/{maxConsumables}
        </span>
      </div>
      
      <div className="flex gap-2">
        {Array.from({ length: maxConsumables }, (_, i) => {
          const consumable = consumables[i];
          return (
            <div key={i} className="relative">
              {consumable ? (
                <button
                  onClick={() => onUseConsumable(consumable.id)}
                  disabled={disabled}
                  className={`transition-opacity ${
                    disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                  }`}
                >
                  <Card 
                    card={consumable} 
                    isSelected={false}
                    onClick={() => {}}
                    size="small"
                  />
                </button>
              ) : (
                <div className="w-20 h-28 border-2 border-dashed border-gray-600 rounded-lg" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}