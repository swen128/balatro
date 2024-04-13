import { NonEmptyArray, nonEmptyArray } from "../utils/nonEmptyArray";
import { chip, type PlayingCardEntity, type PlayingCardId } from "./card";
import { ChipMult } from "./chipMult";
import { DrawPile } from "./drawPile";
import type { Effect } from "./effect";
import { HandSelection } from "./handSelection";
import { evaluate, type PlayedHand } from "./pokerHand";
import type { RunState } from "./runState";

export type RoundState = DrawingState | SelectingHandState | PlayingState | ScoringState | PlayedState | RoundFinishedState;

interface DrawingState extends BaseState {
    phase: 'drawing';
    hand: Array<PlayingCardEntity & { state: 'drawing' | 'inHand' }>;
}

interface SelectingHandState extends BaseState {
    phase: 'selectingHand';
    hand: HandSelection<PlayingCardEntity>;
}

interface PlayingState extends BaseState {
    phase: 'playing';
    hand: Array<PlayingCardEntity & { state: 'played' | 'staying' }>;
    playedHand: PlayedHand;
}

interface ScoringState extends BaseState {
    phase: 'scoring';
    playedHand: PlayedHand;
    stayingCards: PlayingCardEntity[];
    unresolvedEffects: NonEmptyArray<Effect>;
    chipMult: ChipMult;
}

interface PlayedState extends BaseState {
    phase: 'played';
    playedHand: PlayedHand;
    stayingCards: PlayingCardEntity[];
    chipMult: ChipMult;
}

interface RoundFinishedState extends BaseState {
    phase: 'roundFinished';
    stayingCards: PlayingCardEntity[];
    hasPlayerWon: boolean;
}

interface BaseState {
    drawPile: DrawPile;
    score: number;
    scoreGoal: number;
    remainingHands: number;
    handSize: number;
}

export const initialState = (runState: RunState): DrawingState => {
    const drawPile = DrawPile.init(runState.deck);
    const { drawn, remaining } = drawPile.draw(runState.handSize);

    return {
        phase: 'drawing',
        hand: drawn.map(card => ({ ...card, state: 'drawing' })),
        drawPile: remaining,
        score: 0,
        scoreGoal: runState.upcomingBlind.scoreGoal,
        remainingHands: runState.handsCount,
        handSize: runState.handSize,
    };
}

export const startSelectingHand = (state: DrawingState): SelectingHandState => {
    return {
        ...state,
        phase: 'selectingHand',
        hand: HandSelection.init(state.hand),
    };
}

export const toggleCardSelection = (state: SelectingHandState, cardId: PlayingCardId): SelectingHandState => {
    return { ...state, hand: state.hand.toggleCardSelection(cardId) };
}

export const playSelectedCards = (state: SelectingHandState): PlayingState | undefined => {
    const selectedCards = nonEmptyArray(state.hand.cards.filter(card => card.isSelected).map(card => card.card));
    return selectedCards === undefined
        ? undefined
        : {
            ...state,
            phase: 'playing',
            playedHand: evaluate(selectedCards),
            hand: state.hand.cards.map(card => card.isSelected
                ? { ...card.card, state: 'played' }
                : { ...card.card, state: 'staying' }
            ),
        };
}

export const startScoring = (state: PlayingState): ScoringState | PlayedState => {
    const scoredCards = state.playedHand.cards.filter(card => card.isScored).map(card => card.card);
    const stayingCards = state.hand.filter(card => card.state === 'staying');
    const chipMult = ChipMult.init(state.playedHand.pokerHand);
    const effects = nonEmptyArray(scoredCards.map<Effect>(card => ({
        type: 'chip',
        value: chip(card),
        source: { type: 'playedHand', card },
    })));

    if (effects === undefined) return {
        ...state,
        phase: 'played',
        stayingCards,
        chipMult,
    };

    return {
        ...state,
        phase: 'scoring',
        stayingCards,
        chipMult,
        unresolvedEffects: effects,
    };
}

export const resolveEffect = (state: ScoringState): { nextState: ScoringState | PlayedState, resolvedEffect: Effect } => {
    const [resolvedEffect, ...remainingEffect] = state.unresolvedEffects;
    const unresolvedEffects = nonEmptyArray(remainingEffect);
    const chipMult = state.chipMult.withEffectApplied(resolvedEffect);

    return unresolvedEffects === undefined
        ? { resolvedEffect, nextState: { ...state, phase: 'played', chipMult } }
        : { resolvedEffect, nextState: { ...state, unresolvedEffects, chipMult } };
}

export const endTurn = (state: PlayedState): DrawingState | RoundFinishedState => {
    if (state.score >= state.scoreGoal) {
        return { ...state, phase: 'roundFinished', hasPlayerWon: true };
    }
    if (state.remainingHands === 0) {
        return { ...state, phase: 'roundFinished', hasPlayerWon: false };
    }

    const amountToDraw = state.handSize - state.stayingCards.length;
    const { drawn, remaining } = state.drawPile.draw(amountToDraw);

    const stayingCards = state.stayingCards.map(card => ({ ...card, state: 'inHand' as const }));
    const drawnCards = drawn.map(card => ({ ...card, state: 'drawing' as const }));

    return {
        ...state,
        phase: 'drawing',
        hand: [...stayingCards, ...drawnCards],
        score: state.score + state.chipMult.score(),
        drawPile: remaining,
        remainingHands: state.remainingHands - 1,
    };
}

