import { GameState } from "../domain/gameState";

export const useGameState = (): GameState => {
    const [state, setState] = React.useState<GameState>({ type: 'mainMenu' });

}

const initialState = (): GameState => ({
    type: 'mainMenu'
});

type GameState = MainMenuState | SelectingBlindState | PlayingRoundState | ShopState;

interface MainMenuState {
    type: 'mainMenu'
    newRun: () => void
}

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
