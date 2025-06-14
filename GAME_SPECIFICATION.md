# Balatro Game Specification

## Overview
A poker-based roguelike card game where players progress through increasingly difficult challenges (blinds) by playing poker hands to accumulate points and meet score goals.

## Core Game Structure

### Run Progression
- **Antes**: Difficulty levels that increase as the player progresses
- **Blinds per Ante**: 
  - Small Blind (1x score multiplier)
  - Big Blind (1.5x score multiplier)
  - Boss Blind (2x score multiplier with special mechanics)
- **Progression**: Complete all three blinds to advance to next ante
- **Skip Mechanic**: Can skip Small/Big blinds but must defeat Boss

### Starting Configuration
- **Deck**: Standard 52-card deck (4 suits × 13 ranks)
- **Hand Size**: 8 cards
- **Hands Per Round**: 4 attempts
- **Discards Per Round**: 3 attempts
- **Starting Cash**: $10
- **Card Chip Values**:
  - Numbers 2-10: Face value in chips
  - Face cards (J,Q,K): 10 chips
  - Aces: 11 chips

## Game States

### 1. Main Menu
- Start new run
- (Future: Continue run, Settings)

### 2. Blind Selection
- Display upcoming blind info (type, score goal, reward)
- Options: Play or Skip
- Skipping costs opportunity but preserves resources

### 3. Round Gameplay
Phases in order:
1. **Drawing**: Fill hand to 8 cards
2. **Selecting**: Choose cards for playing or discarding
   - Can select up to 5 cards to play as poker hand
   - Can select any number of cards to discard and draw replacements
   - Limited number of discards per round (default: 3)
3. **Playing/Discarding**: 
   - If playing: Evaluate selected cards as poker hand
   - If discarding: Remove selected cards and draw new ones
4. **Scoring**: Calculate and display score (only when playing)
5. **Played**: Update totals, discard played cards
6. **Round Finished**: Win/loss determination

### 4. Shop
- Appears after winning rounds
- Purchase upgrades with earned cash
- (Future implementation)

## Scoring System

### Poker Hands (Lowest to Highest)
| Hand Type | Base Chips | Base Multiplier |
|-----------|------------|-----------------|
| High Card | 5 | 1 |
| Pair | 10 | 2 |
| Two Pair | 20 | 2 |
| Three of a Kind | 30 | 3 |
| Straight | 30 | 4 |
| Flush | 35 | 4 |
| Full House | 40 | 4 |
| Four of a Kind | 60 | 7 |
| Straight Flush | 100 | 8 |
| Royal Straight Flush | 100 | 8 |

### Score Calculation
1. **Base Score** = Poker Hand Chips + Sum of Card Chips
2. **Apply Effects**: Additional chips or multipliers
3. **Final Score** = (Base Score + Effect Chips) × (Base Mult × Effect Mults)

### Score Goals by Ante
- Ante 1: 100/150/200 (small/big/boss)
- Ante 2: 300/450/600
- Ante 3: 800/1200/1600
- Ante 4: 2000/3000/4000
- Continues with increasing multipliers...

## Visual Design

### Layout
- **Split Screen**: 
  - Left sidebar (1/6): Stats display
  - Main area (5/6): Game content
- **Responsive**: Maintains aspect ratios on different screens

### Card Design
- Standard playing card appearance
- Aspect ratio: 63:88
- White background with rounded corners
- Color-coded suits (black: ♠♣, red: ♥♦)
- Clear rank/suit display in corners

### Animations
- **Card Drawing**: Slide in from left with stagger
- **Selection**: Move up 25% when toggled
- **Playing**: Animate to upper play area
- **Scoring**: Display chip/mult bonuses above cards
- **Discarding**: Slide out to right

### User Feedback
- Animated score counter
- Visual card states (selected, scoring, etc.)
- Clear button states (enabled/disabled)
- Effect overlays for bonuses

## Technical Requirements

### State Management
- Immutable state updates
- Clear state transitions
- Type-safe discriminated unions

### Performance
- Smooth 60fps animations
- Efficient card rendering
- Minimal re-renders

### Extensibility
- Modular effect system
- Easy to add new poker hands
- Pluggable boss blind mechanics
- Shop system ready for items/upgrades

## Future Features (Not in MVP)
- Joker cards with special effects
- Card enhancements (foil, holographic, etc.)
- Shop with various upgrades
- Multiple boss blind types
- Save/load functionality
- Statistics tracking
- Achievement system