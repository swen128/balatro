export const allSuits = ['spade', 'heart', 'club', 'diamond'] as const;

const allNumberedRanks = [2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
const allFaceRanks = ['jack', 'queen', 'king'] as const;
export const allRanks = [
    ...allNumberedRanks.map(value => ({ type: 'number', value }) as const),
    ...allFaceRanks.map(variant => ({ type: 'face', variant }) as const),
    { type: 'ace' },
] as const;

export type Rank = typeof allRanks[number];
export type NumberedRank = typeof allNumberedRanks[number];
export type FaceRank = typeof allFaceRanks[number];

export type Suit = typeof allSuits[number];

export interface PlayingCard {
    rank: Rank;
    suit: Suit;
}

export type PlayingCardId = number;

export interface PlayingCardEntity {
    id: PlayingCardId;
    card: PlayingCard;
}

export const chip = (card: PlayingCardEntity): number => baseChip(card.card.rank);

const baseChip = (rank: Rank): number => {
    switch (rank.type) {
        case 'number': return rank.value;
        case 'face': return 10;
        case 'ace': return 11;
    }
}
