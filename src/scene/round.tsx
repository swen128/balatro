import type { RunState } from "../domain/runState";
import { Hand } from "../view/hand";
import { RunScreen } from "../view/runScreen";
import { useRoundState } from "./roundState";

interface Props {
    runState: RunState;
    onRoundEnd: (hasPlayerWon: boolean) => void;
}

export const RoundScene: React.FC<Props> = ({ runState }) => {
    const state = useRoundState(runState);

    const playButton = state.phase === 'selectingHand' && state.play !== null
        ? <button onClick={state.play}>Play</button>
        : <button disabled>Play</button>;

    const { chip, mult } = state.chipMult;

    return (<>
        <RunScreen
            chip={chip}
            mult={mult}
            score={state.score}
            scoreGoal={state.scoreGoal}
            remainingHands={state.remainingHands}
            pokerHand={state.pokerHand}
            ante={runState.ante}
        >
            {state.phase === 'roundFinished' && roundFinishedDialog(state.hasPlayerWon)}
            <Hand state={state} />
            {playButton}
        </RunScreen>
    </>);
};

const roundFinishedDialog = (hasPlayerWon: boolean) => {
    return <dialog open>
        <p className="text-8xl">
            {hasPlayerWon ? 'You win!' : 'GAME OVER'}
        </p>
    </dialog>;
}
