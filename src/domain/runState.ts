import { PlayingCardEntity } from "./card";

export interface RunState {
    handSize: number;
    handsCount: number;
    deck: PlayingCardEntity[];
    upcomingBlind: Blind;
}

interface Blind {
    scoreGoal: number;
}
