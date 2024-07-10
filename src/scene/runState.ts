import React from "react";
import { RunState, initialRunState } from "../domain/runState";

export const useRunState = (): RunUiState => {
    const [state, setState] = React.useState(initialRunState());

}

type RunUiState = SelectingBlindState | PlayingRoundState | ShopState;


interface SelectingBlindState {
    type: 'selectingBlind'
    currentRun: RunState
    selectBlind: () => void
    skipBlind: () => void
}

interface PlayingRoundState {
    type: 'round'
    currentRun: RunState
    winRound: () => void
    loseRound: () => void
}

interface ShopState {
    type: 'shop'
    currentRun: RunState
    leaveShop: () => void
}
