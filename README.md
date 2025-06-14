# Balatro.ts

A TypeScript implementation of the Balatro card game - a poker-based roguelike where you progress through increasingly difficult challenges by playing poker hands to meet score goals.

🎮 **[Play the game online](https://swen128.github.io/balatro/)**

## How to Play

**Goal**: Score enough points to defeat each blind by playing poker hands with your cards.

**Game Flow**:
1. **Draw Cards**: Start each round with 8 cards
2. **Select Cards**: Choose up to 5 cards to play as a poker hand
3. **Score Points**: Earn points based on your poker hand and card values
4. **Meet the Goal**: Reach the required score before running out of hands
5. **Progress**: Defeat Small Blind → Big Blind → Boss Blind to advance

**Poker Hands** (from weakest to strongest):
- High Card, Pair, Two Pair, Three of a Kind
- Straight, Flush, Full House, Four of a Kind
- Straight Flush, Royal Flush

**Blind Types**:
- **Small Blind**: Basic challenge (1x scoring)
- **Big Blind**: Harder challenge (1.5x scoring requirement)
- **Boss Blind**: Hardest challenge (2x scoring) with special effects

## Getting Started

### Prerequisites
- [Bun](https://bun.sh) runtime

### Installation & Running
```bash
# Install dependencies
bun install

# Start the game
bun run dev
```

Open your browser to `http://localhost:3000` to play!

## Features

- Complete poker hand evaluation system
- Progressive difficulty with escalating score requirements
- Boss blinds with unique gameplay effects
- Immersive card game experience in the browser

---

*For developers: See `CLAUDE.md` for development guidelines and `GAME_SPECIFICATION.md` for detailed game mechanics.*