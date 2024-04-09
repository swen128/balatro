import React, { ReactElement } from "react";
import type { PlayingCardEntity, PlayingCardId } from "../domain/card";
import { Effect } from "../domain/effect";
import { Card } from "./playingCard";

export interface CardInHand extends PlayingCardEntity {
    state: 'inHand' | 'selected' | 'discarded';
}

export interface PlayedCard extends PlayingCardEntity {
    state: 'played' | 'scored' | 'discarded';
    effect?: Effect;
}

type Props = {
    cardsInHand: ReadonlyArray<CardInHand>;
    playedCards: ReadonlyArray<PlayedCard>;

    onClick?: (cardId: PlayingCardId) => void;
    onEffectEnd?: () => void;
};

export const Hand: React.FC<Props> = ({ cardsInHand, playedCards, onClick, onEffectEnd }) => {
    const playedCardsElements = playedCards.map(({ card, id, state, effect }) => {
        const style = {
            played: '',
            scored: '-translate-y-1/3',
            discarded: 'translate-x-[100vw]',
        }[state];

        return (
            <div key={id} className={`transition ${style}`}>
                {effect && effectElement({effect, onAnimationEnd: onEffectEnd})}
                <Card card={card} />
            </div>
        );
    });

    const cardsInHandElements = cardsInHand.map(({ card, id, state }) => {
        const style = {
            inHand: '',
            selected: '-translate-y-1/3',
            discarded: 'translate-x-[100vw]',
        }[state];

        const handleClick = onClick === undefined ? undefined : () => onClick(id);

        return (
            <div key={id} className={`transition ${style}`} onClick={handleClick}>
                <Card card={card} />
            </div>
        );
    });

    return (<>
        <div className="flex flex-row">{playedCardsElements}</div>
        <div className="flex flex-row">{cardsInHandElements}</div>
    </>)
};

const effectElement: React.FC<{ effect: Effect, onAnimationEnd?: () => void }> = ({ effect, onAnimationEnd }): ReactElement => {
    const style = 'text-2xl animate-ping-short';

    switch (effect.type) {
        case 'chip':
            return <div className={`text-blue-600 ${style}`} onAnimationEnd={onAnimationEnd}>+ {effect.value}</div>;
        case 'mult':
            return <div className={`text-red-600 ${style}`} onAnimationEnd={onAnimationEnd}>{effect.operator === 'plus' ? '+ ' : 'x '}{effect.value}</div>;
    }
}
