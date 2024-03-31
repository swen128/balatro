import { useState } from "react";
import type { PlayingCardId } from "../domain/card";
import { RoundState, endTurn, playSelectedCards, resolveEffect, toggleCardSelection } from "../domain/roundState";

export const useRoundState = (initialState: RoundState) => {
    const [state, setState] = useState(initialState);

    switch (state.phase) {
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
        case "playing":
            return {
                ...state,
                next: () => {
                    const { nextState, resolvedEffect } = resolveEffect(state);
                    setState(nextState);
                    return resolvedEffect;
                },
            };
        case "played":
            return {
                ...state,
                next: () => setState(endTurn(state)),
            };
        case "roundFinished":
            return state;
    }
}
