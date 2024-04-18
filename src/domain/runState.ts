import { BossBlindName } from "./blind";
import { PlayingCardEntity, allRanks, allSuits } from "./card";

export type RunState = SmallBlindUpcoming | BigBlindUpcoming | BossBlindUpcoming;

interface SmallBlindUpcoming extends RunStateBase {
    nextBlind: 'small';
}
interface BigBlindUpcoming extends RunStateBase {
    nextBlind: 'big';
    smallBlind: BlindState;
}

interface BossBlindUpcoming extends RunStateBase {
    nextBlind: 'boss';
    smallBlind: BlindState;
    bigBlind: BlindState;
}

interface RunStateBase {
    handSize: number;
    handsCount: number;
    cash: number;
    deck: PlayingCardEntity[];
    ante: number;
    round: number;
    bossBlind: BossBlindName;
}

type BlindState = 'skipped' | 'defeated';

export const initialRunState = (): RunState => ({
    handSize: 8,
    handsCount: 4,
    cash: 10,
    deck: starterDeck(),
    ante: 1,
    round: 0,
    nextBlind: 'small',
    bossBlind: 'The Window',
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

export const winRound = (state: RunState, earnedCash: number): RunState => {
    const { handSize, handsCount, deck, ante, round, cash, nextBlind, bossBlind } = state;

    const nextAnte = {
        small: ante,
        big: ante,
        boss: ante + 1,
    }[nextBlind];

    const stateBase: RunStateBase = {
        handSize,
        handsCount,
        deck,
        bossBlind,
        cash: cash + earnedCash,
        ante: nextAnte,
        round: round + 1,
    };

    switch (state.nextBlind) {
        case 'small': return { ...stateBase, nextBlind: 'big', smallBlind: 'defeated' };
        case 'big': return { ...stateBase, nextBlind: 'boss', smallBlind: state.smallBlind, bigBlind: 'defeated' };
        case 'boss': return { ...stateBase, nextBlind: 'small' };
    }
};

export const skipBlind = (state: SmallBlindUpcoming | BigBlindUpcoming): RunState => {
    switch (state.nextBlind) {
        case 'small': return { ...state, nextBlind: 'big', smallBlind: 'skipped' };
        case 'big': return { ...state, nextBlind: 'boss', smallBlind: state.smallBlind, bigBlind: 'skipped' };
    }
};
