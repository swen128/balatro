import { ScoreCounter } from "../view/scoreCounter";

interface Props {
    chip: number;
    mult: number;
    score: number;
    scoreGoal: number;
    remainingHands: number;
    pokerHand?: string;
    ante: number;
    children: React.ReactNode;
}

export const RunScreen: React.FC<Props> = ({ chip, mult, score, scoreGoal, remainingHands, pokerHand, ante, children }) => {
    return (<>
        <div className="w-full h-full flex">
            <div className='basis-2/12 grow-0 p-12 bg-slate-800'>
                <div>Score at least {scoreGoal}</div>
                <div>Score: <ScoreCounter value={score} /></div>
                <div>
                    <div>Chip: {chip}</div>
                    <div>Mult: {mult}</div>
                </div>
                <div>Poker Hand: {pokerHand ?? '-'}</div>
                <div>Hand: {remainingHands}</div>
                <div>Ante: {ante}</div>
            </div>

            <div className='grow'>
                {children}
            </div>
        </div>
    </>);
};
