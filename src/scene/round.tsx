import { useEffect } from "react";
import { ChipMult } from "../domain/chipMult";
import { evaluate } from "../domain/pokerHand";
import { initialState } from "../domain/roundState";
import type { RunState } from "../domain/runState";
import { nonEmptyArray } from "../utils/nonEmptyArray";
import { Hand } from "../view/hand";
import { ScoreCounter } from "../view/scoreCounter";
import { useRoundState } from "./roundState";

interface Props {
    runState: RunState;
    onRoundEnd: (hasPlayerWon: boolean) => void;
}

export const RoundScene: React.FC<Props> = ({ runState }) => {
    const state = useRoundState(initialState(runState));

    const playButton = state.phase === 'selectingHand' && state.play !== undefined
        ? <button onClick={state.play}>Play</button>
        : <button disabled>Play</button>;

    const { chip, mult } = displayedChipMult(state);

    useEffect(() => {
        switch (state.phase) {
            case 'played':
                setTimeout(() => state.next(), 1000);
                return;
            case 'drawing':
            case 'selectingHand':
            case 'playing':
            case 'scoring':
            case 'roundFinished':
                return;
            default:
                throw new Error(state satisfies never);
        }
    }, [state]);

    return (<>
        <div className="w-full h-full flex">
            <div className='basis-2/12 grow-0 p-12 bg-slate-800'>
                <div>Score: <ScoreCounter value={state.score} /></div>
                <div>
                    <div>Chip: {chip}</div>
                    <div>Mult: {mult}</div>
                </div>
                <div>Hand: {state.remainingHands}</div>
            </div>

            <div className='grow bg-slate-600'>
                <Hand state={state} />
                {playButton}
            </div>
        </div>
    </>);
};

type RoundState = ReturnType<typeof useRoundState>;

// TODO: Move this to domain or somewhere else
const displayedChipMult = (state: RoundState): { chip: number, mult: number } => {
    switch (state.phase) {
        case 'scoring':
        case 'played':
            return state.chipMult;
        case 'playing':
            return ChipMult.init(state.playedHand.pokerHand);
        case 'selectingHand': {
            const selectedCards = nonEmptyArray(state.hand.cards.filter(card => card.isSelected).map(card => card.card));
            return selectedCards === undefined
                ? { chip: 0, mult: 0 }
                : ChipMult.init(evaluate(selectedCards).pokerHand);
        }
        case 'drawing':
        case 'roundFinished':
            return { chip: 0, mult: 0 };
    }
}
