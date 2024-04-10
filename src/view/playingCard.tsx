import type { NumberedRank, PlayingCard, Rank, Suit } from "../domain/card";

export const Card: React.FC<{ card: PlayingCard }> = ({ card }) => {
    const { rank, suit } = card;

    const suitSymbol = getSuitSymbol(suit);
    const rankSymbol = getRankSymbol(rank);
    const textColor = {
        spade: 'text-black',
        club: 'text-black',
        heart: 'text-red-500',
        diamond: 'text-red-500',
    }[suit];

    const renderSuitPositions = (): React.ReactElement[] => {
        switch (rank.type) {
            case 'number': {
                const suitPositions = getSuitPositions(rank.value);
                return suitPositions.map((position, index) => (
                    <div
                        key={index}
                        className={`absolute text-4xl ${textColor}`}
                        style={{
                            top: `${position.y * 100}%`,
                            left: `${position.x * 100}%`,
                            transform: `translate(-50%, -50%) ${position.rotate ? 'rotate(180deg)' : ''}`,
                        }}
                    >
                        {suitSymbol}
                    </div>
                ));
            }
            // TODO: Implement face and ace cards
            case 'face':
            case 'ace':
                return [];
        }
    };

    const cornerElem = <div className='flex flex-col text-center'>
        <div className={`text-2xl ${textColor}`}>
            {rankSymbol}
        </div>
        <div className={`text-2xl ${textColor}`}>
            {suitSymbol}
        </div>
    </div>

    return (
        <div className="aspect-[63/88] h-full p-2 select-none bg-white rounded-lg shadow-md flex relative">
            <div className="flex flex-col justify-start">{cornerElem}</div>

            <div className="flex grow relative">
                {renderSuitPositions()}
            </div>

            <div className="flex flex-col justify-start rotate-180">{cornerElem}</div>
        </div>
    );
};

const getRankSymbol = (rank: Rank) => {
    switch (rank.type) {
        case 'number':
            return rank.value.toString();
        case 'ace':
            return 'A';
        case 'face':
            return {
                jack: 'J',
                queen: 'Q',
                king: 'K',
            }[rank.variant];
    }
};

const getSuitSymbol = (suit: Suit) => {
    return {
        spade: '♠',
        heart: '♥',
        club: '♣',
        diamond: '♦',
    }[suit];
};

const getSuitPositions = (rank: NumberedRank) => {
    switch (rank) {
        case 2:
            return [
                { x: 0.5, y: 0.25, rotate: false },
                { x: 0.5, y: 0.75, rotate: true },
            ];
        case 3:
            return [
                { x: 0.5, y: 0.15, rotate: false },
                { x: 0.5, y: 0.5, rotate: false },
                { x: 0.5, y: 0.85, rotate: true },
            ];
        case 4:
            return [
                { x: 0.2, y: 0.2, rotate: false },
                { x: 0.8, y: 0.2, rotate: false },
                { x: 0.2, y: 0.8, rotate: true },
                { x: 0.8, y: 0.8, rotate: true },
            ];
        case 5:
            return [
                { x: 0.2, y: 0.2, rotate: false },
                { x: 0.8, y: 0.2, rotate: false },
                { x: 0.5, y: 0.5, rotate: false },
                { x: 0.2, y: 0.8, rotate: true },
                { x: 0.8, y: 0.8, rotate: true },
            ];
        case 6:
            return [
                { x: 0.2, y: 0.2, rotate: false },
                { x: 0.8, y: 0.2, rotate: false },
                { x: 0.2, y: 0.5, rotate: false },
                { x: 0.8, y: 0.5, rotate: false },
                { x: 0.2, y: 0.8, rotate: true },
                { x: 0.8, y: 0.8, rotate: true },
            ];
        case 7:
            return [
                { x: 0.2, y: 0.15, rotate: false },
                { x: 0.5, y: 0.3, rotate: false },
                { x: 0.8, y: 0.15, rotate: false },
                { x: 0.2, y: 0.5, rotate: false },
                { x: 0.8, y: 0.5, rotate: false },
                { x: 0.2, y: 0.85, rotate: true },
                { x: 0.8, y: 0.85, rotate: true },
            ];
        case 8:
            return [
                { x: 0.2, y: 0.15, rotate: false },
                { x: 0.8, y: 0.15, rotate: false },
                { x: 0.5, y: 0.3, rotate: false },
                { x: 0.2, y: 0.5, rotate: false },
                { x: 0.8, y: 0.5, rotate: false },
                { x: 0.2, y: 0.7, rotate: true },
                { x: 0.8, y: 0.7, rotate: true },
                { x: 0.5, y: 0.85, rotate: true },
            ];
        case 9:
            return [
                { x: 0.2, y: 0.15, rotate: false },
                { x: 0.8, y: 0.15, rotate: false },
                { x: 0.2, y: 0.35, rotate: false },
                { x: 0.8, y: 0.35, rotate: false },
                { x: 0.5, y: 0.5, rotate: false },
                { x: 0.2, y: 0.65, rotate: true },
                { x: 0.8, y: 0.65, rotate: true },
                { x: 0.2, y: 0.85, rotate: true },
                { x: 0.8, y: 0.85, rotate: true },
            ];
        case 10:
            return [
                { x: 0.2, y: 0.1, rotate: false },
                { x: 0.8, y: 0.1, rotate: false },
                { x: 0.5, y: 0.25, rotate: false },
                { x: 0.2, y: 0.4, rotate: false },
                { x: 0.8, y: 0.4, rotate: false },
                { x: 0.2, y: 0.6, rotate: true },
                { x: 0.8, y: 0.6, rotate: true },
                { x: 0.5, y: 0.75, rotate: true },
                { x: 0.2, y: 0.9, rotate: true },
                { x: 0.8, y: 0.9, rotate: true },
            ];
    }
};
