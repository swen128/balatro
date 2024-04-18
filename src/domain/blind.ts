const allBossBlinds = [
    'The Window',
] as const;

export type BossBlindName = typeof allBossBlinds[number];

export const pickBossBlind = (): BossBlindName => {
    // TODO: Randomize
    return 'The Window';
}

type Blind = SmallBlind | BigBlind | BossBlind;

interface SmallBlind {
    type: 'small';
}

interface BigBlind {
    type: 'big';
}

interface BossBlind {
    type: 'boss';
    name: BossBlindName;
}

export const scoreGoal = (blind: Blind, ante: number): number => {
    const _ante = Math.max(0, Math.floor(ante));

    // TODO: Some bosses have different factors.
    const blindFactor = {
        small: 1,
        big: 1.5,
        boss: 2,
    }[blind.type];

    const normalAnteFactor = [100, 300, 800, 2800, 6000, 11000, 20000, 35000, 50000][_ante];
    if (normalAnteFactor !== undefined) {
        return normalAnteFactor * blindFactor;
    }

    // Scaling for the endless mode.
    const indexOffset = _ante - 8;
    const growthRate = 1 + 0.2 * indexOffset;
    const anteFactor = Math.floor(50000 * (1.6 + (0.75 * indexOffset) ** growthRate) ** indexOffset);
    const magnitude = 10 ** Math.floor(Math.log10(anteFactor) - 1);
    const roundedAnteFactor = anteFactor - anteFactor % magnitude;
    return roundedAnteFactor * blindFactor;
}
