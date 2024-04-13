import { useState } from "react";
import type { PlayingCardId } from "../domain/card";
import { RoundState, endTurn, playSelectedCards, resolveEffect, startScoring, startSelectingHand, toggleCardSelection } from "../domain/roundState";

export const useRoundState = (initialState: RoundState) => {
    const [state, setState] = useState(initialState);
    console.log(state)

    switch (state.phase) {
        case "drawing":
            return {
                ...state,
                next: () => setState(startSelectingHand(state)),
            };
        case "selectingHand": {
            const playingState = playSelectedCards(state);
            const play = playingState === undefined
                ? undefined
                : () => setState(playingState);

            return {
                ...state,
                play,
                toggleCardSelection: (cardId: PlayingCardId) => setState(toggleCardSelection(state, cardId)),
            };
        }
        case "playing": {
            return {
                ...state,
                next: () => setState(startScoring(state)),
            };
        }
        case "scoring": {
            const { nextState, resolvedEffect } = resolveEffect(state);
            return {
                ...state,
                nextEffect: resolvedEffect,
                next: () => setState(nextState),
            };
        }
        case "played":
            return {
                ...state,
                next: () => setState(endTurn(state)),
            };
        case "roundFinished":
            return state;
        default:
            throw new Error(state satisfies never);
    }
}
