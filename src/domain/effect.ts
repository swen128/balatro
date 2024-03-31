import type { PlayingCardEntity } from "./card";

export type Effect = AddedChip | AddedMult;

interface AddedChip {
    type: 'chip';
    value: number;
    source: EffectSource;
}

interface AddedMult {
    type: 'mult';
    operator: 'plus' | 'times';
    value: number;
    source: EffectSource;
}

interface EffectSource {
    type: 'playedHand';
    card: PlayingCardEntity;
}
