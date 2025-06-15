# TODO

## Current Status

The core game is functional with:
- ✅ Basic gameplay loop (deal cards, play hands, score, advance blinds)
- ✅ Poker hand evaluation and scoring
- ✅ Shop system with jokers and card packs
- ✅ Save/load functionality
- ✅ Boss blinds (3 implemented: The Window, The Hook, The Ox)
- ✅ Card enhancements (foil, holographic, polychrome)
- ✅ Discard mechanics
- ✅ Statistics tracking
- ✅ Unit tests for all domain logic
- ✅ Pre-commit hooks with `bun check` command
- ✅ GitHub Actions deployment to GitHub Pages
- ✅ Responsive build configuration for web deployment

## High Priority Tasks

### 1. Game Progression
- [x] Implement win condition (completing ante 8)
- [x] Add proper game over screen with statistics
- [x] Add victory screen with final score
- [x] Implement ante progression beyond ante 8 (endless mode)

### 2. Boss Blinds
Currently 7 boss blinds implemented. Add more variety:
- [x] The Wall (all cards are debuffed)
- [x] The Needle (only one hand type scores)
- [ ] The Fish (cards start face down)
- [ ] The Club/Diamond/Heart/Spade (suit restrictions)
- [x] The Goad (spades give no chips)
- [ ] The Arm (decrease level of played poker hands)
- [x] The Psychic (must play 5 cards)

### 3. Joker System Expansion
Current jokers are basic. Add:
- [ ] Conditional jokers (activate under specific conditions)
- [ ] Scaling jokers (grow stronger over time)
- [ ] Economy jokers (affect money generation)
- [ ] Hand-size jokers (modify hand size or discards)

### 4. Missing Core Features
- [ ] Voucher system (permanent passive upgrades)
- [ ] Poker hand leveling system (increase base chips/mult)
- [ ] Tarot cards (enhance other cards)
- [ ] Planet cards (level up specific poker hands)
- [ ] Spectral cards (rare powerful effects)

## Medium Priority Tasks

### 5. Card Enhancements
Basic enhancements exist but missing:
- [ ] Seals (Red, Blue, Gold, Purple with special effects)
- [ ] Glass cards (high mult but chance to break)
- [ ] Stone cards (high chips but no rank/suit)
- [ ] Wild cards (can be any suit)
- [ ] Steel cards (remain in hand after playing)

### 6. UI/UX Improvements
- [ ] Tutorial/help system for new players
- [ ] Card/joker tooltips on hover
- [ ] Hand history viewer
- [ ] Enhanced deck viewer with filters
- [ ] Settings menu (gameplay settings, not just sound)
- [ ] Score animations and visual feedback

### 7. Shop Improvements
- [ ] Reroll cost should increase with each use
- [ ] More diverse card pack types
- [ ] Shop item tooltips
- [ ] Purchase animations

## Low Priority Tasks

### 8. Visual Polish
- [ ] Boss blind entrance animations
- [ ] Card enhancement visual effects
- [ ] Particle effects for scoring/purchasing
- [ ] Victory/defeat screen animations
- [ ] Improved card dealing animations

### 9. Audio System
- [ ] Background music
- [ ] Contextual sound effects (different sounds for hand types)
- [ ] Boss blind themes
- [ ] Victory/defeat jingles

### 10. Save System Enhancements
- [ ] Multiple save slots
- [ ] Run history viewer
- [ ] Statistics per save slot

### 11. Achievement System
- [ ] Design achievement list
- [ ] Implement achievement tracking
- [ ] Achievement notification system
- [ ] Unlock rewards

### 12. Accessibility
- [ ] Colorblind mode
- [ ] Font size options
- [ ] Animation speed controls
- [ ] Full keyboard navigation
- [ ] Screen reader support

## Future Features

### 13. Advanced Game Modes
- [ ] Daily challenges (seeded runs)
- [ ] Challenge runs (special rule sets)
- [ ] Custom starting decks
- [ ] Leaderboards

### 14. Technical Improvements
- [ ] Performance optimization (React.memo, useMemo)
- [ ] Error boundaries
- [ ] Progressive Web App support
- [ ] Mobile responsive design

## Development Notes

### Architecture
- Feature-based directory organization
- Discriminated unions for type-safe state management
- Immutable state updates
- Container/Presentation component pattern
- Pure functions for game logic
- No type guards or type assertions (except in saveGame.ts)

### Commands
- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run check` - Run lint, typecheck, and tests
- `bun test` - Run unit tests only
- `bun run knip` - Check for unused files and exports
- `bun run autofix` - Auto-fix linting issues

### Deployment
- Game is deployed to: https://swen128.github.io/balatro/
- GitHub Actions automatically builds and deploys on push to main
- Only deploys when source files change (not documentation)

### Recent Updates
- Fixed failing unit tests (import paths and suit symbols)
- Added missing utility functions to card.ts
- Added getPokerHandByName function
- Set up pre-commit hooks with husky
- Added GitHub Actions deployment workflow
- Updated Vite config for relative paths (GitHub Pages compatibility)
- Refactored getCardChipValue for clarity

### Next Steps for Development
Game progression features completed! Next priorities:
1. Additional boss blinds for variety (currently only 3 implemented)
2. Expanded joker system with conditional/scaling jokers
3. Core missing features: vouchers, hand leveling, special cards
4. UI/UX improvements: tooltips, tutorials, better visual feedback

The game state management is in `src/game/gameState.ts` and ante progression is handled in `src/game/runState.ts`.