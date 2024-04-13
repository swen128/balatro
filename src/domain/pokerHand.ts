import type { NonEmptyArray } from "../utils/nonEmptyArray";
import type { PlayingCardEntity } from "./card";

export type PokerHand =
    'highCard' | 'pair' | 'twoPair' | 'threeOfAKind' | 'straight' |
    'flush' | 'fullHouse' | 'fourOfAKind' | 'straightFlush' | 'royalStraightFlush';

export interface PlayedHand {
    pokerHand: PokerHand;

    cards: NonEmptyArray<PlayingCardEntity & { isScored: boolean }>;
}

export const evaluate = (selectedCards: NonEmptyArray<PlayingCardEntity>): PlayedHand => {
    // TODO: Implement the proper logic.
    const [head, ...tail] = selectedCards;
    return {
        pokerHand: 'highCard',
        cards: [{ ...head, isScored: true }, ...tail.map(card => ({ ...card, isScored: false }))]
    }
};
