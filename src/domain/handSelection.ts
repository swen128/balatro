import type { PlayingCardId } from "./card";

const maxSelectionCount = 5;


export class HandSelection<T extends { id: PlayingCardId }> {
    static init<T extends { id: PlayingCardId }>(cards: ReadonlyArray<T>): HandSelection<T> {
        return new HandSelection(cards.map(card => ({
            card,
            isSelected: false,
        })));
    }

    private constructor(
        readonly cards: ReadonlyArray<{
            card: T;
            isSelected: boolean;
        }>,
    ) { }

    toggleCardSelection(cardId: PlayingCardId): HandSelection<T> {
        const index = this.cards.findIndex(({ card }) => card.id === cardId);
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

// export class NonEmptyHandSelection {
//     static init(cardIds: ReadonlyArray<PlayingCardId>): NonEmptyHandSelection {
//         return new NonEmptyHandSelection(cardIds.map(id => ({
//             id,
//             isSelected: false,
//         })));
//     }
//
//     private constructor(
//         private cards: ReadonlyArray<{
//             id: PlayingCardId;
//             isSelected: boolean;
//         }>,
//     ) { }
//
//     toggleCardSelection(cardId: PlayingCardId): NonEmptyHandSelection | {
//         const index = this.cards.findIndex(card => card.id === cardId);
//     const card = this.cards[index];
//     const alreadySelectdCount = this.cards.filter(card => card.isSelected).length;
//
//         return card === undefined || (alreadySelectdCount === maxSelectionCount && !card.isSelected)
//     ? this
//     : new HandSelection([
//         ...this.cards.slice(0, index),
//         {
//             ...card,
//             isSelected: !card.isSelected,
//         },
//         ...this.cards.slice(index + 1),
//     ]);
//     }
// }
//