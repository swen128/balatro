import type { PlayingCardEntity, PlayingCardId } from "./card";

const maxSelectionCount = 5;

export class HandSelection {
    // This property ensures that this class can only be instantiated via this module.
    #_nominal: unknown;

    static init(cards: ReadonlyArray<PlayingCardEntity>): HandSelection {
        return new HandSelection(cards.map(card => ({
            ...card,
            isSelected: false,
        })));
    }

    private constructor(
        /** Number of selected cards are guaranteed to be 5 or less. */
        readonly cards: ReadonlyArray<PlayingCardEntity & { isSelected: boolean }>,
    ) { }

    toggleCardSelection(cardId: PlayingCardId): HandSelection {
        const index = this.cards.findIndex((card) => card.id === cardId);
        const card = this.cards[index];
        const alreadySelectdCount = this.cards.filter(card => card.isSelected).length;

        return card === undefined || (alreadySelectdCount === maxSelectionCount && !card.isSelected)
            ? this
            : new HandSelection([
                ...this.cards.slice(0, index),
                {
                    ...card,
                    isSelected: !card.isSelected,
                },
                ...this.cards.slice(index + 1),
            ]);
    }
}
