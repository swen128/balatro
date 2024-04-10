import './App.css';
import { initialRunState } from './domain/runState';
import { RoundScene } from './scene/round';

function App() {
    const runState = initialRunState();

    return (<>
        <div className='flex items-center justify-center w-screen h-screen'>
            <div className='aspect-video w-[var(--game-screen-width)] overflow-hidden'>
                <RoundScene runState={runState} onRoundEnd={console.log} />
            </div>
        </div>
    </>)
}

export default App
