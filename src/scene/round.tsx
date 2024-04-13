import { initialState } from "../domain/roundState";
import type { RunState } from "../domain/runState";
import { Hand } from "../view/hand";
import { ScoreCounter } from "../view/scoreCounter";
import { useRoundState } from "./roundState";

interface Props {
    runState: RunState;
    onRoundEnd: (hasPlayerWon: boolean) => void;
}

export const RoundScene: React.FC<Props> = ({ runState }) => {
    const state = useRoundState(initialState(runState));

    const playButton = state.phase === 'selectingHand' && state.play !== null
        ? <button onClick={state.play}>Play</button>
        : <button disabled>Play</button>;

    const { chip, mult } = state.chipMult;

    return (<>
        <div className="w-full h-full flex">
            <div className='basis-2/12 grow-0 p-12 bg-slate-800'>
                <div>Score: <ScoreCounter value={state.score} /></div>
                <div>
                    <div>Chip: {chip}</div>
                    <div>Mult: {mult}</div>
                </div>
                <div>Poker Hand: {state.pokerHand ?? '-'}</div>
                <div>Hand: {state.remainingHands}</div>
            </div>

            <div className='grow bg-slate-600'>
                <Hand state={state} />
                {playButton}
            </div>
        </div>
    </>);
};
