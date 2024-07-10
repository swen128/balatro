import { RunState, initialRunState } from "./runState";

export type GameState = MainMenuState | SelectingBlindState | PlayingRoundState | ShopState;

interface MainMenuState {
    type: 'mainMenu'
}

interface SelectingBlindState {
    type: 'selectingBlind'
    currentRun: RunState
}

interface PlayingRoundState {
    type: 'round'
    currentRun: RunState
}

interface ShopState {
    type: 'shop'
    currentRun: RunState
}

const newRun = (state: MainMenuState): SelectingBlindState => ({
    type: 'selectingBlind',
    currentRun: initialRunState(),
});

const selectBlind = (state: SelectingBlindState): PlayingRoundState => ({
    type: 'round',
    currentRun: state.currentRun
});

const skipBlind = (state: SelectingBlindState): SelectingBlindState => ({
    type: 'selectingBlind',
    currentRun: state.currentRun
});

const loseRound = (state: PlayingRoundState): MainMenuState => ({ type: 'mainMenu' });

const winRound = (state: PlayingRoundState): ShopState => ({
    type: 'shop',
    currentRun: state.currentRun
});
