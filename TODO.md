# Current Task Status

## Completed Tasks
1. ✅ Analyzed original codebase and documented game specifications (see GAME_SPECIFICATION.md)
2. ✅ Set up new Bun project with TypeScript
3. ✅ Configured ESLint with strict rules:
   - No `any` types allowed
   - No type assertions allowed (except in saveGame.ts for JSON parsing)
   - No type guards allowed
   - Maximum TypeScript strictness enabled
4. ✅ Implemented core domain models:
   - card.ts - Card types, deck creation, and enhancements
   - pokerHands.ts - Poker hand evaluation
   - blind.ts - Blind system (small, big, boss)
   - scoring.ts - Chip and multiplier calculations with effects
   - drawPile.ts - Draw pile management
   - joker.ts - 35 different joker cards with effects
   - shopItems.ts - Shop items and pack generation
5. ✅ Implemented game state management:
   - gameState.ts - Top-level game flow with save/load
   - runState.ts - Run/session state
   - roundState.ts - Individual round state machine with discards
   - saveGame.ts - Save/load functionality with localStorage
6. ✅ Implemented UI components with animations:
   - Feature-based directory organization
   - Card animations (dealing, playing, discarding)
   - Animated score counter
   - Chip/mult bonuses display
   - Poker hand evaluation display
7. ✅ Implemented all game features:
   - Boss blind effects (The Window, The Hook, The Ox)
   - Shop with purchasable items
   - Card pack selection modal
   - Deck viewer
   - Card enhancements (foil, holographic, polychrome)
   - Discard mechanic (3 discards per round)
   - Skip blind functionality

## Implementation Approach

### TypeScript Without Type Guards
Instead of using type guards, the boss effect is now stored directly in the game state:
- `SelectingBlindState` and `PlayingRoundState` include `bossEffect: string | null`
- When creating these states, we extract the effect from boss blinds
- UI components receive the effect as a prop rather than checking the blind type

This approach avoids type assertions and type guards while maintaining type safety.

## Current Status

### ✅ Core Game Implementation Complete!
- TypeScript compilation passes with no errors
- ESLint passes with no errors  
- All core functionality implemented
- ✅ Card selection animation fixed
- ✅ Tailwind CSS installed and configured
- ✅ Unit tests written for all domain logic

The application is ready to run. Use `bun run dev` to start the development server.

## Recent Progress
1. **Fixed card selection animation** - Cards now properly animate upward when selected
2. **Tailwind CSS setup** - Installed and configured, but needs debugging for full implementation
3. **Unit tests created** - Comprehensive tests for all domain logic, but imports need fixing

## Issues That Need Fixing

### 1. Unit Test Import Errors
- **Status**: Test files created but failing to run
- **Issue**: Tests can't find the exported functions from domain files
- **Error**: `Export named 'functionName' not found in module`
- **Next Steps**: 
  - Check that all functions are properly exported from domain files
  - Verify export/import syntax matches
  - Run `bun test` after fixing exports

### 2. Tailwind CSS Not Fully Working
- **Status**: Installed but not rendering properly in all components
- **Issue**: Card component showed black rectangles when using Tailwind classes
- **Current State**: 
  - `BlindSelection.tsx` successfully uses Tailwind
  - `Card.tsx` reverted to inline styles (working)
  - Other components partially converted
- **Next Steps**: Debug why Tailwind classes aren't being applied properly

## Next Steps

### 1. Test the Application
- Run `bun run dev` to start the development server
- Test all game flows:
  - Main menu → Start new run
  - Select/skip blinds
  - Play poker hands
  - Win/lose rounds
  - Shop navigation

### 2. Verify Everything Works
- Ensure cards display correctly
- Check that poker hand evaluation works
- Verify scoring calculations
- Test blind progression through antes

## Known Issues

### ✅ 1. Card Selection Animation Fixed
- **Resolution**: The issue was in `Hand.tsx` where the style prop was passing `transform: undefined` which was overriding the Card component's transform
- **Fix**: Changed to use spread syntax to only add the transform property when needed: `...(isPlaying && isPlayed && { transform: 'translateY(-200px)' })`
- **Result**: Cards now properly animate upward when selected

## Immediate Tasks for Next Developer

### 1. Fix Unit Test Exports
The test files are created but the functions they're trying to import aren't being exported properly. You need to:
- Check each domain file and ensure all functions used in tests are exported
- Example functions that need to be exported:
  - `shuffleDeck` from `card.ts`
  - `createBlind` from `blind.ts` 
  - `getCardChipValue` from `pokerHands.ts`
  - `calculateBaseScore` from `scoring.ts`
  - `addToDiscardPile` from `drawPile.ts`
- After fixing exports, run `bun test` to verify

### 2. Debug Tailwind CSS
- The PostCSS config is set up with `@tailwindcss/postcss`
- Tailwind directives are in `src/index.css`
- But Tailwind classes aren't rendering properly in some components
- Possible solutions:
  - Check if Vite is processing the CSS correctly
  - Verify the Tailwind content paths in `tailwind.config.js`
  - Try using Tailwind's CLI to build CSS separately
  - Check browser dev tools to see if classes are being applied

## Remaining Tasks

### Architecture Improvements
1. **Boss Effect Refactoring** - Implement typed effect system with timing phases (see DESIGN_DECISIONS.md)

### Features Not Yet Implemented
1. **Statistics Tracking** - Track games played, wins, best scores, most used hands
2. **Achievement System** - Unlock achievements for various accomplishments
3. **Sound Effects** - Add audio feedback for card movements, scoring, etc.

### Code Quality Improvements
1. **Performance** - Optimize re-renders, add React.memo where appropriate
2. **Accessibility** - Add ARIA labels, keyboard navigation
3. **Responsive Design** - Make it work on mobile devices
4. **Error Handling** - Add proper error boundaries and user feedback

## Project Structure Summary
```
balatro-bun/
├── src/
│   ├── domain/      # Game logic (all complete)
│   ├── ui/          # React components (needs type fixes)
│   ├── index.tsx    # Entry point
│   └── index.css    # Basic styles
├── CLAUDE.md        # Project guidance
├── GAME_SPECIFICATION.md  # Game rules
└── TODO.md          # This file
```

## How to Run
1. Run `bun install` to install dependencies
2. Run `bun run dev` to start the development server
3. Run `bun run lint` to check for linting errors
4. Run `bun run typecheck` to verify TypeScript types
5. Run `bun test` to run unit tests

## Current Architecture
- Feature-based directory organization for better code locality
- Discriminated unions for type-safe state management
- Immutable state updates throughout
- Container/Presentation component pattern
- Pure functions for all game logic
- Exhaustive pattern matching with switch statements