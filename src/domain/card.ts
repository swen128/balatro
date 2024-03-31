export type Rank = { type: 'number', value: NumberedRank } | { type: 'face', variant: FaceRank } | { type: 'ace' };
export type NumberedRank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type FaceRank = 'jack' | 'queen' | 'king';

export type Suit = 'spade' | 'heart' | 'club' | 'diamond';

export interface PlayingCard {
    rank: Rank;
    suit: Suit;
}

export type PlayingCardId = string;

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
