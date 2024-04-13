import type { PokerHand } from "./pokerHand";

export class ChipMult {
    static init(pokerHand: PokerHand): ChipMult {
        const { chip, mult } = baseScore(pokerHand);
        return new ChipMult(chip, mult);
    }
    
    static zero(): ChipMult {
        return new ChipMult(0, 0);
    }

    private constructor(readonly chip: number, readonly mult: number) { }

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
        'highCard': { chip: 5, mult: 1 },
        'pair': { chip: 10, mult: 2 },
        'twoPair': { chip: 20, mult: 2 },
        'threeOfAKind': { chip: 30, mult: 3 },
        'straight': { chip: 30, mult: 4 },
        'flush': { chip: 35, mult: 4 },
        'fullHouse': { chip: 40, mult: 4 },
        'fourOfAKind': { chip: 60, mult: 7 },
        'straightFlush': { chip: 100, mult: 8 },
        'royalStraightFlush': { chip: 100, mult: 8 },
    }[pokerHand];
}
