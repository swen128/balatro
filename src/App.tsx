import './App.css';
import type { PlayingCardEntity } from './domain/card';
import { RunState } from './domain/runState';
import { RoundScene } from './scene/round';

function App() {
    // TODO: Replace this with a real deck
    const deck: PlayingCardEntity[] = [
        { id: '1', card: { rank: { type: 'ace' }, suit: 'heart' } },
        { id: '2', card: { rank: { type: 'face', variant: 'jack' }, suit: 'club' } },
        { id: '3', card: { rank: { type: 'number', value: 4 }, suit: 'spade' } },
        { id: '4', card: { rank: { type: 'number', value: 7 }, suit: 'diamond' } },
        { id: '5', card: { rank: { type: 'number', value: 10 }, suit: 'heart' } },
        { id: '6', card: { rank: { type: 'ace' }, suit: 'club' } },
        { id: '7', card: { rank: { type: 'ace' }, suit: 'diamond' } },
    ];
    const runState: RunState = {
        handSize: 8,
        handsCount: 5,
        deck: deck,
        upcomingBlind: { scoreGoal: 300 },
    };

    return (
        <>
            <div className='w-screen h-screen'>
                <RoundScene runState={runState} onRoundEnd={console.log} />
            </div>
        </>
    )
}

export default App
