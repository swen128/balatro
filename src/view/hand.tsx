import React from "react";
import type { PlayingCardEntity, PlayingCardId } from "../domain/card";
import { Effect } from "../domain/effect";
import { useRoundState } from "../scene/roundState";
import { Card } from "./playingCard";

type State = ReturnType<typeof useRoundState>;

interface Props {
    state: State
}

export const Hand: React.FC<Props> = ({ state }) => {
    const cards = allCards(state)
        .toSorted((a, b) => a.id - b.id)
        .map(card => card.elem);

    return (<>
        <div className="h-64 mt-[35rem] relative">
            {cards}
        </div>
    </>)
};

const allCards = (state: State): Array<{ id: PlayingCardId, elem: React.ReactElement }> => {
    switch (state.phase) {
        case 'drawing': {
            const lastDrawnCard = state.hand.findLast(card => card.state === 'drawing');
            if (lastDrawnCard === undefined) state.next();

            return state.hand.map((card, index) => {
                const isLastDrawn = card.id === lastDrawnCard?.id;
                const numberOfCards = state.hand.length;
                const onTransitionEnd = isLastDrawn ? state.next : undefined;
                return animatedCard({ card, index, numberOfCards, onTransitionEnd });
            });
        }
        case 'selectingHand':
            return state.hand.map((_card, index) => {
                const card = { ..._card, state: _card.isSelected ? 'selected' as const : 'inHand' as const }
                const numberOfCards = state.hand.length;
                const onClick = () => state.toggleCardSelection(_card.id);
                return animatedCard({ card, index, numberOfCards, onClick });
            });

        case 'playing': {
            const stayingCards = state.hand
                .filter(card => card.state === 'staying')
                .map(card => ({ ...card, state: 'inHand' as const }));
            const playedCards = state.hand
                .filter(card => card.state === 'played')
                .map(card => ({ ...card, state: 'played' as const }));

            return [
                ...stayingCards.map((card, index) => animatedCard({ card, index, numberOfCards: stayingCards.length })),
                ...playedCards.map((card, index) => animatedCard({
                    card,
                    index,
                    numberOfCards: playedCards.length,
                    onTransitionEnd: index === playedCards.length - 1 ? state.next : undefined
                })),
            ];
        }

        case 'scoring': {
            const stayingCards = cardsInHand(state.stayingCards);
            const playedCards = state.playedHand.map((card, index) => animatedCard({
                card: { ...card, state: card.isScored ? 'scored' : 'played' },
                index,
                numberOfCards: state.playedHand.length,
                effect: state.effect,
                onTransitionEnd: state.next,
            }));
            return [...stayingCards, ...playedCards];
        }

        case "played": {
            const stayingCards = cardsInHand(state.stayingCards);
            const playedCards = state.playedHand.map((_card, index) => {
                const card = { ..._card, state: 'used' as const }
                const numberOfCards = state.playedHand.length;
                const onTransitionEnd = index === 0 ? state.next : undefined;
                return animatedCard({ card, index, numberOfCards, onTransitionEnd });
            });
            return [...stayingCards, ...playedCards];
        }

        case "roundFinished":
            return state.stayingCards.map((card, index) => animatedCard({
                card: { ...card, state: 'discarded' },
                index,
                numberOfCards: state.stayingCards.length,
            }));
    }
}

const animatedCard = ({ card, index, numberOfCards, effect, onTransitionEnd, onClick }: {
    card: PlayingCardEntity & { state: 'drawing' | 'inHand' | 'selected' | 'discarded' | 'played' | 'scored' | 'used' },
    index: number,
    numberOfCards: number,
    effect?: Effect,
    onTransitionEnd?: () => void,
    onClick?: () => void,
}) => {
    const style = {
        drawing: {
            translate: `${index * 70}%`,
            // Stagger the draw animation. Leftmost card should be drawn first.
            animationDelay: `${index * 0.1}s`,
        },
        selected: { translate: `${index * 70}% -25%` },
        discarded: {
            translate: `85rem`,
            // Stagger the discard animation. Rightmost card should be discarded first.
            transitionDelay: `${(numberOfCards - index + 1) * 0.1}s`,
        },
        inHand: { translate: `${index * 70}%` },
        played: { translate: `${index * 125}% -125%` },
        scored: { translate: `${index * 125}% -150%` },
        used: {
            translate: `85rem -125%`,
            // Stagger the discard animation. Rightmost card should be discarded first.
            transitionDelay: `${(numberOfCards - index + 1) * 0.1}s`,
        },
    }[card.state];

    const extraClassname = {
        drawing: 'animate-card-drawn',
        inHand: '',
        selected: '',
        discarded: '',
        played: '',
        scored: '',
        used: '',
    }[card.state];

    const isSourceOfEffect = effect !== undefined && card.id === effect.source.card.id;

    const elem = <div
        key={card.id}
        className={`absolute transition-all h-full ${extraClassname}`}
        style={style}
        onTransitionEnd={effect === undefined ? onTransitionEnd : undefined}
        onAnimationEnd={effect === undefined ? onTransitionEnd : undefined}
        onClick={onClick}
    >
        {isSourceOfEffect && <div className="absolute -translate-y-[140%] translate-x-[200%]">
            {EffectElement(effect, onTransitionEnd)}
        </div>}
        <Card card={card.card} />
    </div>;

    return { id: card.id, elem };
}

const cardsInHand = (cards: ReadonlyArray<PlayingCardEntity>) =>
    cards.map((card, index) => animatedCard({
        card: { ...card, state: 'inHand' },
        index,
        numberOfCards: cards.length,
    }));

const EffectElement = (effect: Effect, onTransitionEnd?: () => void) => {
    const style = 'text-2xl animate-ping-short';

    switch (effect.type) {
        case 'chip':
            return <div className={`text-blue-600 ${style}`} onAnimationEnd={onTransitionEnd}>+ {effect.value}</div>;
        case 'mult':
            return <div className={`text-red-600 ${style}`} onAnimationEnd={onTransitionEnd}>{effect.operator === 'plus' ? '+ ' : 'x '}{effect.value}</div>;
    }
}
