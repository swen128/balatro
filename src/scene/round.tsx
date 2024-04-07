import { useEffect } from "react";
import type { PlayingCardId } from "../domain/card";
import { initialState } from "../domain/roundState";
import type { RunState } from "../domain/runState";
import { Hand, type CardInHand, type PlayedCard } from "../view/hand";
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
    
    const handleEffectEnd = state.phase === 'playing' ? state.next : undefined;

    useEffect(() => {
        switch (state.phase) {
            case 'played':
                setTimeout(() => state.next(), 1000);
                return;
            case 'playing':
            case 'roundFinished':
            case 'selectingHand':
                return;
        }
    }, [state]);

    return (<>
        <Hand
            cardsInHand={cardsInHand(state)}
            playedCards={playedCards(state)}
            onClick={handleCardClicked}
            onEffectEnd={handleEffectEnd}
        />
        {playButton}

        <pre>{JSON.stringify(state, null, 4)}</pre>
    </>);
};

type RoundState = ReturnType<typeof useRoundState>;

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
                state: isScored ? 'scored' : 'played',
                effect: state.nextEffect.source.card.id === card.id
                    ? state.nextEffect
                    : undefined,
            }));
        case 'played':
            return state.playedHand.cards.map(({ card }) => ({ ...card, state: 'discarded' }));
        case 'roundFinished':
            return [];
    }
}
