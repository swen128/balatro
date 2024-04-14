import type { PokerHand } from "./pokerHand";

export class ChipMult {
    // This property ensures that this class can only be instantiated via this module.
    #_nominal: unknown;

    static init(pokerHand: PokerHand): ChipMult {
        const { chip, mult } = baseScore(pokerHand);
        return new ChipMult(chip, mult);
    }

    static zero(): ChipMult {
        return new ChipMult(0, 0);
    }

    private constructor(
        /** Guaranteed to be a non-negative integer. */
        readonly chip: number,
        /** Guaranteed to be a non-negative integer. */
        readonly mult: number
    ) { }

    withEffectApplied(effect: Effect): ChipMult {
        const value = Math.max(0, Math.round(effect.value));

        switch (effect.type) {
            case 'chip':
                return new ChipMult(this.chip + value, this.mult);
            case 'mult':
                return new ChipMult(this.chip, {
                    plus: this.mult + value,
                    times: this.mult * value,
                }[effect.operator]);
        }
    }

    score(): number {
        return this.chip * this.mult;
    }
}

type Effect = AddedChip | AddedMult;

interface AddedChip {
    type: 'chip';
    value: number;
}

interface AddedMult {
    type: 'mult';
    operator: 'plus' | 'times';
    value: number;
}

const baseScore = (pokerHand: PokerHand): { chip: number, mult: number } => {
    return {
        'High Card': { chip: 5, mult: 1 },
        'Pair': { chip: 10, mult: 2 },
        'Two Pair': { chip: 20, mult: 2 },
        'Three of a Kind': { chip: 30, mult: 3 },
        'Straight': { chip: 30, mult: 4 },
        'Flush': { chip: 35, mult: 4 },
        'Full House': { chip: 40, mult: 4 },
        'Four of a Kind': { chip: 60, mult: 7 },
        'Straight Flush': { chip: 100, mult: 8 },
        'Royal Straight Flush': { chip: 100, mult: 8 },
    }[pokerHand];
}
