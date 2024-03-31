import React from "react";
import type { PlayingCardEntity, PlayingCardId } from "../domain/card";
import { Card } from "./playingCard";

type CardInHand = PlayingCardEntity & {
    state: 'inHand' | 'selected' | 'discarded';
};

type PlayedCard = PlayingCardEntity & {
    state: 'played' | 'scored' | 'discarded';
};

type Props = {
    cardsInHand: ReadonlyArray<CardInHand>;
    playedCards: ReadonlyArray<PlayedCard>;

    onClick?: (cardId: PlayingCardId) => void;
};

export const Hand: React.FC<Props> = ({ cardsInHand, playedCards, onClick }) => {
    const playedCardsElements = playedCards.map(({ card, id, state }) => {
        const style = {
            played: '',
            scored: '-translate-y-1/3',
            discarded: 'invisible',
        }[state];

        return (
            <div key={id} className={`transition ${style}`}>
                <Card card={card} />
            </div>
        );
    });

    const cardsInHandElements = cardsInHand.map(({ card, id, state }) => {
        const style = {
            inHand: '',
            selected: '-translate-y-1/3',
            discarded: 'invisible',
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
