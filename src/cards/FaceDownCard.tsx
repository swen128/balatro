import React from 'react';

interface FaceDownCardProps {
  readonly onClick: () => void;
  readonly animationClass?: string;
  readonly animationDelay?: number;
  readonly style?: React.CSSProperties;
}

export function FaceDownCard({ onClick, animationClass, animationDelay, style }: FaceDownCardProps): React.ReactElement {
  const combinedStyle: React.CSSProperties = {
    ...style,
    ...(animationDelay !== undefined ? { animationDelay: `${animationDelay}s` } : {}),
  };

  return (
    <div
      onClick={onClick}
      className={`w-[63px] h-[88px] bg-gradient-to-br from-blue-800 to-blue-900 border border-gray-800 rounded flex flex-col items-center justify-center cursor-pointer transition-transform duration-200 select-none shadow-md hover:shadow-lg ${animationClass !== undefined ? animationClass : ''}`}
      style={combinedStyle}
    >
      <div className="text-white text-4xl font-bold opacity-20">
        ?
      </div>
    </div>
  );
}