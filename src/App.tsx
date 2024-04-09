import './App.css';
import { initialRunState } from './domain/runState';
import { RoundScene } from './scene/round';

function App() {
    const runState = initialRunState();

    return (<>
        <div className='w-screen h-screen overflow-hidden'>
            <RoundScene runState={runState} onRoundEnd={console.log} />
        </div>
    </>)
}

export default App
