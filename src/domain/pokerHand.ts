import type { NonEmptyArray } from "../utils/nonEmptyArray";
import type { PlayingCardEntity } from "./card";

export type PokerHand =
    'highCard' | 'pair' | 'twoPair' | 'threeOfAKind' | 'straight' |
    'flush' | 'fullHouse' | 'fourOfAKind' | 'straightFlush' | 'royalStraightFlush';

export interface PlayedHand {
    pokerHand: PokerHand;

    cards: NonEmptyArray<{
        isScored: boolean;
        card: PlayingCardEntity;
    }>;
}

export const evaluate = (selectedCards: NonEmptyArray<PlayingCardEntity>): PlayedHand => {
    // TODO: Implement the proper logic.
    const [head, ...tail] = selectedCards;
    return {
        pokerHand: 'highCard',
        cards: [{ isScored: true, card: head }, ...tail.map(card => ({ isScored: false, card }))]
    }
};
