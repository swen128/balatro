import { useCallback } from 'react';
import type { RoundState } from '../game/roundState.ts';
import { 
  handleCardClick, 
  handlePlayHand,
  handleDiscardCards,
} from './roundLogic.ts';

interface UseRoundActionsProps {
  readonly roundState: RoundState;
  readonly setRoundState: (state: RoundState) => void;
  readonly setIsDiscarding: (isDiscarding: boolean) => void;
}

interface UseRoundActionsReturn {
  readonly handleCardClick: (cardId: string) => void;
  readonly handlePlayHand: () => void;
  readonly handleDiscardCards: () => void;
}

export function useRoundActions({
  roundState,
  setRoundState,
  setIsDiscarding
}: UseRoundActionsProps): UseRoundActionsReturn {
  const handleCardClickCallback = useCallback((cardId: string): void => {
    const newState = handleCardClick(roundState, cardId);
    if (newState) {
      setRoundState(newState);
    }
  }, [roundState, setRoundState]);

  const handlePlayHandCallback = useCallback((): void => {
    const newState = handlePlayHand(roundState);
    if (newState) {
      setRoundState(newState);
    }
  }, [roundState, setRoundState]);

  const handleDiscardCardsCallback = useCallback((): void => {
    setIsDiscarding(true);
    setTimeout(() => {
      const newState = handleDiscardCards(roundState);
      if (newState) {
        setRoundState(newState);
        setIsDiscarding(false);
      }
    }, 600); // Wait for discard animation
  }, [roundState, setRoundState, setIsDiscarding]);

  return {
    handleCardClick: handleCardClickCallback,
    handlePlayHand: handlePlayHandCallback,
    handleDiscardCards: handleDiscardCardsCallback
  };
}