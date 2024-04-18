import { useEffect, useState } from "react";
import type { PlayingCardEntity, PlayingCardId } from "../domain/card";
import { ChipMult } from "../domain/chipMult";
import { Effect } from "../domain/effect";
import { PokerHand } from "../domain/pokerHand";
import { RoundState, endTurn, initialState, playSelectedCards, resolveEffect, startScoring, startSelectingHand, toggleCardSelection } from "../domain/roundState";
import { RunState } from "../domain/runState";
import { NonEmptyArray } from "../utils/nonEmptyArray";

export const useRoundState = (runState: RunState): RoundUiState => {
    const [state, setState] = useState(initialState(runState));

    useEffect(() => console.debug(state), [state]);

    const { chip, mult } = displayedChipMult(state);
    const baseState: BaseState = {
        chipMult: { chip, mult },
        score: state.score,
        scoreGoal: state.scoreGoal,
        remainingHands: state.remainingHands,
        pokerHand: displayedPokerHand(state),
        ante: runState.ante,
    };

    switch (state.phase) {
        case "drawing":
            return {
                ...baseState,
                phase: "drawing",
                hand: state.hand,
                next: () => setState(startSelectingHand(state)),
            };
        case "selectingHand": {
            const playingState = playSelectedCards(state);
            const play = playingState === undefined
                ? null
                : () => setState(playingState);

            return {
                ...baseState,
                phase: "selectingHand",
                hand: state.hand.cards,
                play,
                toggleCardSelection: (cardId: PlayingCardId) => setState(toggleCardSelection(state, cardId)),
            };
        }
        case "playing": {
            return {
                ...baseState,
                phase: "playing",
                hand: state.hand,
                next: () => setState(startScoring(state)),
            };
        }
        case "scoring": {
            const { nextState, resolvedEffect } = resolveEffect(state);
            return {
                ...baseState,
                phase: "scoring",
                stayingCards: state.stayingCards,
                playedHand: state.playedHand.cards,
                effect: resolvedEffect,
                next: () => setState(nextState),
            };
        }
        case "played":
            return {
                ...baseState,
                phase: "played",
                playedHand: state.playedHand.cards,
                stayingCards: state.stayingCards,
                next: () => setState(endTurn(state)),
            };
        case "roundFinished":
            return {
                ...baseState,
                phase: "roundFinished",
                stayingCards: state.stayingCards,
                hasPlayerWon: state.hasPlayerWon,
            }
        default:
            throw new Error(state satisfies never);
    }
}

type RoundUiState = DrawingState | SelectingHandState | PlayingState | ScoringState | PlayedState | RoundFinishedState;

interface DrawingState extends BaseState {
    phase: "drawing";
    hand: ReadonlyArray<PlayingCardEntity & { state: "drawing" | "inHand" }>;
    next: () => void;
}

interface SelectingHandState extends BaseState {
    phase: "selectingHand";
    hand: ReadonlyArray<PlayingCardEntity & { isSelected: boolean }>;
    toggleCardSelection: (cardId: PlayingCardId) => void;
    play: (() => void) | null;
}

interface PlayingState extends BaseState {
    phase: "playing";
    hand: ReadonlyArray<PlayingCardEntity & { state: "played" | "staying" }>;
    next: () => void;
}

interface ScoringState extends BaseState {
    phase: 'scoring';
    stayingCards: ReadonlyArray<PlayingCardEntity>;
    playedHand: NonEmptyArray<PlayingCardEntity & { isScored: boolean }>;
    effect: Effect;
    next: () => void;
}

interface PlayedState extends BaseState {
    phase: 'played';
    playedHand: NonEmptyArray<PlayingCardEntity>;
    stayingCards: ReadonlyArray<PlayingCardEntity>;
    next: () => void;
}

interface RoundFinishedState extends BaseState {
    phase: 'roundFinished';
    stayingCards: PlayingCardEntity[];
    hasPlayerWon: boolean;
}

interface BaseState {
    score: number;
    scoreGoal: number;
    remainingHands: number;
    chipMult: { chip: number, mult: number };
    pokerHand: PokerHand | undefined;
    ante: number;
}

const displayedChipMult = (state: RoundState): ChipMult => {
    switch (state.phase) {
        case 'scoring':
        case 'played':
            return state.chipMult;
        case 'playing':
            return ChipMult.init(state.playedHand.pokerHand);
        case 'selectingHand': {
            const pokerHand = playSelectedCards(state)?.playedHand.pokerHand;
            return pokerHand === undefined
                ? ChipMult.zero()
                : ChipMult.init(pokerHand);
        }
        case 'drawing':
        case 'roundFinished':
            return ChipMult.zero();
    }
}

const displayedPokerHand = (state: RoundState): PokerHand | undefined => {
    switch (state.phase) {
        case 'playing':
        case 'scoring':
        case 'played':
            return state.playedHand.pokerHand;
        case 'selectingHand':
            return playSelectedCards(state)?.playedHand.pokerHand;
        case 'drawing':
        case 'roundFinished':
            return undefined;
    }
}
