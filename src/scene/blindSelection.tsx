import type { RunState } from "../domain/runState";
import { RunScreen } from "../view/runScreen";

interface Props {
    runState: RunState;
    onNextRound: () => void;
    onSkip: () => void;
}

export const BlindSelection: React.FC<Props> = ({ runState, onNextRound, onSkip }) => {

    return (<>
        <RunScreen
            chip={0}
            mult={0}
            score={0}
            scoreGoal={0}
            remainingHands={runState.handsCount}
            ante={runState.ante}
        >
            <button onClick={onNextRound}>Select</button>
            <button onClick={onSkip}>Skip</button>
        </RunScreen>
    </>);
};
