import { PlayingCardEntity, allRanks, allSuits } from "./card";

export interface RunState {
    handSize: number;
    handsCount: number;
    deck: PlayingCardEntity[];
    upcomingBlind: Blind;
}

interface Blind {
    scoreGoal: number;
}

export const initialRunState = (): RunState => ({
    handSize: 8,
    handsCount: 5,
    deck: starterDeck(),
    upcomingBlind: { scoreGoal: 300 },
});

const starterDeck = (): PlayingCardEntity[] => {
    let id = 0;
    return allSuits.flatMap(suit => allRanks.map(rank => ({
        id: id++,
        card: {
            rank,
            suit
        },
    })));
}
