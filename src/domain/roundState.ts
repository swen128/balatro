import { NonEmptyArray, nonEmptyArray } from "../utils/nonEmptyArray";
import { chip, type PlayingCardEntity, type PlayingCardId } from "./card";
import { ChipMult } from "./chipMult";
import { DrawPile } from "./drawPile";
import type { Effect } from "./effect";
import { HandSelection } from "./handSelection";
import { evaluate, type PlayedHand } from "./pokerHand";
import type { RunState } from "./runState";

export type RoundState = SelectingHandState | PlayingState | PlayedState | RoundFinishedState;

interface SelectingHandState extends BaseState {
    phase: 'selectingHand';
    hand: HandSelection<PlayingCardEntity>;
}

interface PlayingState extends BaseState {
    phase: 'playing';
    playedHand: PlayedHand;
    stayingCards: PlayingCardEntity[];
    unresolvedEffects: NonEmptyArray<Effect>;
    chipMult: ChipMult;
}

interface PlayedState extends BaseState {
    phase: 'played';
    playedHand: PlayedHand;
    stayingCards: PlayingCardEntity[];
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

export const initialState = (runState: RunState): SelectingHandState => {
    const drawPile = DrawPile.init(runState.deck);
    const { drawn, remaining } = drawPile.draw(runState.handSize);

    return {
        phase: 'selectingHand',
        hand: HandSelection.init(drawn),
        drawPile: remaining,
        score: 0,
        scoreGoal: runState.upcomingBlind.scoreGoal,
        remainingHands: runState.handsCount,
        handSize: runState.handSize,
    };
}

export const toggleCardSelection = (state: SelectingHandState, cardId: PlayingCardId): SelectingHandState => {
    return { ...state, hand: state.hand.toggleCardSelection(cardId) };
}

export const playSelectedCards = (state: SelectingHandState): PlayingState | undefined => {
    const selectedCards = nonEmptyArray(state.hand.cards.filter(card => card.isSelected).map(card => card.card));

    if (selectedCards === undefined) return undefined;

    const playedHand = evaluate(selectedCards);
    const scoredCards = playedHand.cards.filter(card => card.isScored).map(card => card.card);
    const stayingCards = state.hand.cards.filter(card => !card.isSelected).map(card => card.card);
    const effects = nonEmptyArray(scoredCards.map<Effect>(card => ({
        type: 'chip',
        value: chip(card),
        source: { type: 'playedHand', card },
    })));

    if (effects === undefined) return undefined;

    return {
        ...state,
        phase: 'playing',
        playedHand,
        stayingCards,
        unresolvedEffects: effects,
        chipMult: ChipMult.init(playedHand.pokerHand),
    };
}

export const resolveEffect = (state: PlayingState): { nextState: PlayingState | PlayedState, resolvedEffect: Effect } => {
    const [resolvedEffect, ...remainingEffect] = state.unresolvedEffects;
    const unresolvedEffects = nonEmptyArray(remainingEffect);

    return unresolvedEffects === undefined
        ? { resolvedEffect, nextState: { ...state, phase: 'played' } }
        : { resolvedEffect, nextState: { ...state, unresolvedEffects, chipMult: state.chipMult.withEffectApplied(resolvedEffect) } };
}

export const endTurn = (state: PlayedState): SelectingHandState | RoundFinishedState => {
    if (state.score >= state.scoreGoal) {
        return { ...state, phase: 'roundFinished', hasPlayerWon: true };
    }
    if (state.remainingHands === 0) {
        return { ...state, phase: 'roundFinished', hasPlayerWon: false };
    }

    const amountToDraw = state.handSize - state.stayingCards.length;
    const { drawn, remaining } = state.drawPile.draw(amountToDraw);
    const hand = HandSelection.init(state.stayingCards.concat(drawn));

    return {
        ...state,
        phase: 'selectingHand',
        hand,
        drawPile: remaining,
        remainingHands: state.remainingHands - 1,
    };
}

