import CountUp from 'react-countup';

interface Props {
    value: number;
}

export const ScoreCounter: React.FC<Props> = ({ value }) => {
    return <CountUp end={value} useEasing={false} preserveValue={true} duration={1} />
};
