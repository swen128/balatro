import type { PlayingCardEntity, PlayingCardId } from "../domain/card";
import { RoundState, initialState } from "../domain/roundState";
import type { RunState } from "../domain/runState";
import { Hand } from "../view/hand";
import { useRoundState } from "./roundState";

interface Props {
    runState: RunState;
    onRoundEnd: (hasPlayerWon: boolean) => void;
}

export const RoundScene: React.FC<Props> = ({ runState }) => {
    const state = useRoundState(initialState(runState));

    const handleCardClicked = state.phase === 'selectingHand'
        ? (cardId: PlayingCardId) => state.toggleCardSelection(cardId)
        : undefined;

    const playButton = state.phase === 'selectingHand' && state.play !== undefined
        ? <button onClick={state.play}>Play</button>
        : <button disabled>Play</button>;

    return (<>
        <Hand
            cardsInHand={cardsInHand(state)}
            playedCards={playedCards(state)}
            onClick={handleCardClicked}
        />
        {playButton}
    </>);
};

type CardInHand = PlayingCardEntity & {
    state: 'inHand' | 'selected' | 'discarded';
};

type PlayedCard = PlayingCardEntity & {
    state: 'played' | 'scored' | 'discarded';
};

const cardsInHand = (state: RoundState): ReadonlyArray<CardInHand> => {
    switch (state.phase) {
        case 'selectingHand':
            return state.hand.cards.map(({ card, isSelected }) => ({
                ...card,
                state: isSelected ? 'selected' : 'inHand',
            }));
        case 'playing':
            return state.stayingCards.map(card => ({ ...card, state: 'inHand' }));
        case 'played':
            return state.stayingCards.map(card => ({ ...card, state: 'inHand' }));
        case 'roundFinished':
            return state.stayingCards.map(card => ({ ...card, state: 'discarded' }));
    }
}

const playedCards = (state: RoundState): ReadonlyArray<PlayedCard> => {
    switch (state.phase) {
        case 'selectingHand':
            return [];
        case 'playing':
            return state.playedHand.cards.map(({ card, isScored }) => ({
                ...card,
                state: isScored ? 'scored' : 'played'
            }));
        case 'played':
            return state.playedHand.cards.map(({ card }) => ({ ...card, state: 'discarded' }));
        case 'roundFinished':
            return [];
    }
}
