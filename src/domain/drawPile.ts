import { PlayingCardEntity } from "./card";

export class DrawPile {
    static init(cards: PlayingCardEntity[]): DrawPile {
        // TODO: Shuffle the cards.
        return new DrawPile(cards);
    }

    private constructor(private cards: PlayingCardEntity[]) { }

    /**
     * Draws up to `amount` cards from the top of the draw pile.
     */
    draw(amount: number): { drawn: PlayingCardEntity[], remaining: DrawPile } {
        const clampedAmount = Math.max(0, Math.min(this.cards.length, amount));
        const drawn = this.cards.slice(0, clampedAmount);
        const remaining = new DrawPile(this.cards.slice(clampedAmount));
        return { drawn, remaining }
    }

    count(): number {
        return this.cards.length;
    }
}
