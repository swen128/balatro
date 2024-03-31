import type { NumberedRank, PlayingCard, Rank, Suit } from "../domain/card";

// TODO: https://github.com/deck-of-cards/standard-deck/

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

    const renderSuitPositions = () => {
        if (rank.type === 'number') {
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
        return null;
    };

    return (
        <div className="w-48 h-64 select-none bg-white rounded-lg shadow-md flex flex-col justify-between p-4 relative">
            <div className="flex justify-between">
                <div className={`text-2xl ${textColor}`}>
                    {rankSymbol}
                </div>
                <div className={`text-2xl ${textColor}`}>
                    {suitSymbol}
                </div>
            </div>
            <div className="flex justify-center items-center">
                {renderSuitPositions()}
            </div>
            <div className="flex justify-between rotate-180">
                <div className={`text-2xl ${textColor}`}>
                    {rankSymbol}
                </div>
                <div className={`text-2xl ${textColor}`}>
                    {suitSymbol}
                </div>
            </div>
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

// const suitPositions = (rank: NumberedRank) => ({
//   2: [
//     [0, -1],
//     [0, 1, true]
//   ],
//   3: [
//     [0, -1],
//     [0, 0],
//     [0, 1, true]
//   ],
//   4: [
//     [-1, -1], [1, -1],
//     [-1, 1, true], [1, 1, true]
//   ],
//   5: [
//     [-1, -1], [1, -1],
//     [0, 0],
//     [-1, 1, true], [1, 1, true]
//   ],
//   6: [
//     [-1, -1], [1, -1],
//     [-1, 0], [1, 0],
//     [-1, 1, true], [1, 1, true]
//   ],
//   7: [
//     [-1, -1], [1, -1],
//     [0, -0.5],
//     [-1, 0], [1, 0],
//     [-1, 1, true], [1, 1, true]
//   ],
//   8: [
//     [-1, -1], [1, -1],
//     [0, -0.5],
//     [-1, 0], [1, 0],
//     [0, 0.5, true],
//     [-1, 1, true], [1, 1, true]
//   ],
//   9: [
//     [-1, -1], [1, -1],
//     [-1, -1 / 3], [1, -1 / 3],
//     [0, 0],
//     [-1, 1 / 3, true], [1, 1 / 3, true],
//     [-1, 1, true], [1, 1, true]
//   ],
//   10: [
//     [-1, -1], [1, -1],
//     [0, -2 / 3],
//     [-1, -1 / 3], [1, -1 / 3],
//     [-1, 1 / 3, true], [1, 1 / 3, true],
//     [0, 2 / 3, true],
//     [-1, 1, true], [1, 1, true]
//   ],
// }[rank]);
