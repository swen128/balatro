import React from 'react';
import type { Card as CardType } from '../domain/card.ts';
import { isRedSuit } from '../domain/card.ts';

interface CardProps {
  readonly card: CardType;
  readonly isSelected: boolean;
  readonly onClick: () => void;
  readonly style?: React.CSSProperties;
}

export function Card({ card, isSelected, onClick, style }: CardProps): React.ReactElement {
  const isRed = isRedSuit(card.suit);
  
  return (
    <div
      onClick={onClick}
      style={{
        width: '63px',
        height: '88px',
        backgroundColor: 'white',
        border: '1px solid #333',
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transform: isSelected ? 'translateY(-10px)' : 'none',
        transition: 'transform 0.2s',
        boxShadow: isSelected ? '0 4px 8px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.2)',
        userSelect: 'none',
        position: 'relative',
        ...style,
      }}
    >
      {/* Top left corner */}
      <div style={{
        position: 'absolute',
        top: '4px',
        left: '4px',
        fontSize: '12px',
        fontWeight: 'bold',
        color: isRed ? '#ef4444' : '#000',
        lineHeight: 1,
      }}>
        <div>{card.rank}</div>
        <div style={{ fontSize: '14px' }}>{card.suit}</div>
      </div>

      {/* Center */}
      <div style={{
        fontSize: '32px',
        color: isRed ? '#ef4444' : '#000',
      }}>
        {card.suit}
      </div>

      {/* Bottom right corner (upside down) */}
      <div style={{
        position: 'absolute',
        bottom: '4px',
        right: '4px',
        fontSize: '12px',
        fontWeight: 'bold',
        color: isRed ? '#ef4444' : '#000',
        transform: 'rotate(180deg)',
        lineHeight: 1,
      }}>
        <div>{card.rank}</div>
        <div style={{ fontSize: '14px' }}>{card.suit}</div>
      </div>
    </div>
  );
}