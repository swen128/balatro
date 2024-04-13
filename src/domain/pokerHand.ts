import type { NonEmptyArray } from "../utils/nonEmptyArray";
import type { PlayingCardEntity } from "./card";

const allPokerHands = [
    'High Card', 'Pair', 'Two Pair', 'Three of a Kind', 'Straight',
    'Flush', 'Full House', 'Four of a Kind', 'Straight Flush', 'Royal Straight Flush',
] as const;
export type PokerHand = typeof allPokerHands[number];

export interface PlayedHand {
    pokerHand: PokerHand;

    cards: NonEmptyArray<PlayingCardEntity & { isScored: boolean }>;
}

export const evaluate = (selectedCards: NonEmptyArray<PlayingCardEntity>): PlayedHand => {
    // TODO: Implement the proper logic.
    const [head, ...tail] = selectedCards;
    return {
        pokerHand: 'High Card',
        cards: [{ ...head, isScored: true }, ...tail.map(card => ({ ...card, isScored: false }))]
    }
};
