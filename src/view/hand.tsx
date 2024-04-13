import React, { ReactElement, useEffect, useState } from "react";
import type { PlayingCardEntity } from "../domain/card";
import { Effect } from "../domain/effect";
import { useRoundState } from "../scene/roundState";
import { Card } from "./playingCard";

interface Props {
    state: ReturnType<typeof useRoundState>;
}

export const Hand: React.FC<Props> = ({ state }) => {
    const cards: React.ReactElement[] = (() => {
        switch (state.phase) {
            case 'drawing': {
                return state.hand.map((card, index) =>
                    <div
                        key={card.id}
                        // TODO: When the hand is empty, `next` is never called and the game is stuck.
                        onTransitionEnd={index === state.hand.length - 1 ? state.next : undefined}
                    >
                        {DrawnCard(card, index)}
                    </div>);
            }
            case 'selectingHand':
                return state.hand.map((card, index) =>
                    <div key={card.id} onClick={() => state.toggleCardSelection(card.id)}>
                        {CardInHand(card, index)}
                    </div>)

            case 'playing': {
                const playedCards = state.hand.filter(card => card.state === 'played');
                const stayingCards = state.hand.filter(card => card.state === 'staying');

                return [
                    ...stayingCards.map((card, index) =>
                        <div key={card.id}>
                            {PlayedCard(card, index)}
                        </div>
                    ),
                    ...playedCards.map((card, index) =>
                        <div
                            key={card.id}
                            onTransitionEnd={index === playedCards.length - 1 ? state.next : undefined}
                        >
                            {PlayedCard(card, index)}
                        </div>
                    ),
                ]
            }
            case 'scoring':
            // TODO: Implement this

            default:
                return [];
        }
    })();

    // TODO: Make this type-safe.
    const cardsSortedByKey = cards.toSorted((a, b) => parseInt(a.key) - parseInt(b.key));

    return (<>
        <div className="h-64 mt-96 relative">
            {cardsSortedByKey}
        </div>
    </>)
};

const DrawnCard = (card: PlayingCardEntity & { state: 'inHand' | 'drawing' }, index: number): ReactElement => {
    const [state, setState] = useState(card.state);

    useEffect(() => {
        const timer = setTimeout(() => setState('inHand'), index * 50);
        return () => clearTimeout(timer);
    }, [index]);

    const style = {
        drawing: { translate: '85rem' },
        inHand: { translate: `${index * 70}%` },
    }[state];

    return <div className={`absolute transition-all h-full`} style={style}><Card card={card.card} /></div>;
}

const CardInHand = (card: PlayingCardEntity & { isSelected: boolean }, index: number): ReactElement => {
    const style = card.isSelected ? '-translate-y-1/3' : '';

    return <div
        className={`absolute transition-all h-full ${style}`}
        style={{ translate: `${index * 70}%` }}
    >
        <Card card={card.card} />
    </div>;
}

const PlayedCard = (card: PlayingCardEntity & { state: 'played' | 'staying' }, index: number): ReactElement => {
    const yStyle = {
        played: '-translate-y-[125%]',
        staying: '',
    }[card.state];

    const xStyle = {
        played: { translate: `${index * 125}%` },
        staying: { translate: `${index * 70}%` },
    }[card.state];

    return <div
        className={`absolute transition-all h-full ${yStyle}`}
        style={xStyle}
    >
        <Card card={card.card} />
    </div>;
}

const effectElement: React.FC<{ effect: Effect, onAnimationEnd?: () => void }> = ({ effect, onAnimationEnd }): ReactElement => {
    const style = 'text-2xl animate-ping-short';

    switch (effect.type) {
        case 'chip':
            return <div className={`text-blue-600 ${style}`} onAnimationEnd={onAnimationEnd}>+ {effect.value}</div>;
        case 'mult':
            return <div className={`text-red-600 ${style}`} onAnimationEnd={onAnimationEnd}>{effect.operator === 'plus' ? '+ ' : 'x '}{effect.value}</div>;
    }
}

// interface DrawnCard extends PlayingCardEntity {
//     state: 'inHand' | 'drawn';
// }
//
// interface CardInHand extends PlayingCardEntity {
//     state: 'inHand' | 'selected';
// }
//
// interface DiscardedCard extends PlayingCardEntity {
//     state: 'inHand' | 'discarded';
// }
//
// interface PlayedCard extends PlayingCardEntity {
//     state: 'inHand' | 'played';
// }
//
// interface EvalautedCard extends PlayingCardEntity {
//     state: 'played' | 'scored';
// }
//
// interface DrawingProps {
//     state: 'drawing';
//     cards: ReadonlyArray<DrawnCard>;
//     onTransitionEnd: () => void;
// }
//
// interface SelectingHandProps {
//     state: 'selectingHand';
//     cards: ReadonlyArray<CardInHand>;
//     onSelect?: (cardId: PlayingCardId) => void;
// }
//
// interface PlayingProps {
//     state: 'playing';
//     cards: ReadonlyArray<PlayedCard>;
//     onTransitionEnd: () => void;
// }
//
// interface EvaluatingProps {
//     state: 'evaluating';
//     playedCards: ReadonlyArray<EvalautedCard>;
//     stayingCards: ReadonlyArray<PlayingCardEntity>;
//     effect: Effect;
//     onTransitionEnd: () => void;
// }
//
// interface DisposingProps {
//     state: 'disposing';
//     hand: ReadonlyArray<PlayingCardEntity>;
//     disposedCards: ReadonlyArray<PlayingCardEntity>;
//     onTransitionEnd: () => void;
// }
//
// interface DiscardingProps {
//     state: 'discarding';
//     hand: ReadonlyArray<DiscardedCard>;
//     onTransitionEnd: () => void;
// }
//
// export type CardsState = DrawingProps | SelectingHandProps | PlayingProps | EvaluatingProps | DisposingProps | DiscardingProps;
//