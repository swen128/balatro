# TODO

## Current Status

The core game is functional with:
- ✅ Basic gameplay loop (deal cards, play hands, score, advance blinds)
- ✅ Poker hand evaluation and scoring
- ✅ Shop system with jokers and card packs
- ✅ Save/load functionality
- ✅ Boss blinds (13 implemented, all from official game)
- ✅ Card enhancements (foil, holographic, polychrome, glass)
- ✅ Discard mechanics
- ✅ Statistics tracking
- ✅ Unit tests for all domain logic
- ✅ Pre-commit hooks with `bun check` command
- ✅ GitHub Actions deployment to GitHub Pages
- ✅ Responsive build configuration for web deployment
- ✅ Consumables system (spectral, arcana, and planet cards)
- ✅ Glass card enhancement with breaking mechanic
- ✅ Planet cards (level up specific poker hands)
- ✅ Spectral cards (all 19 official cards implemented)
- ✅ Arcana cards (all 22 official cards implemented)

## High Priority Tasks

### 1. Game Progression
- [x] Implement win condition (completing ante 8)
- [x] Add proper game over screen with statistics
- [x] Add victory screen with final score
- [x] Implement ante progression beyond ante 8 (endless mode)

### 2. Bug Fixes (Critical)
- [x] Fix spectral cards to match official Balatro cards
- [x] Fix card enhancement updates not reflecting in hand display during rounds

### 3. Boss Blinds (All Completed)
All 13 boss blinds from the official game are now implemented:
- [x] The Window (select only 1 card type)
- [x] The Hook (discard 2 random cards per hand)
- [x] The Ox (playing a #? sets money to $0)
- [x] The Wall (all cards are debuffed)
- [x] The Needle (only one hand type scores)
- [x] The Fish (cards start face down)
- [x] The Club/Diamond/Heart/Spade (suit restrictions)
- [x] The Goad (spades give no chips)
- [x] The Arm (decrease level of played poker hands)
- [x] The Psychic (must play 5 cards)

### 4. Joker System Expansion
Current implementation includes 90+ jokers:
- [x] Basic scoring jokers (flat chips/mult bonuses)
- [x] Conditional jokers (activate under specific conditions)
- [x] Scaling jokers (grow stronger over time)
- [x] Economy jokers (affect money generation)
- [ ] Hand-size jokers (modify hand size or discards)
- [ ] Retrigger jokers (replay cards multiple times)
- [ ] Special interaction jokers (interact with other game elements)

### 5. Missing Core Features
- [ ] Voucher system (permanent passive upgrades)
- [ ] Tarot cards (enhance playing cards in hand)
- [ ] Seals (Red, Blue, Gold, Purple with special effects)
- [ ] Edition system for jokers (foil, holographic, polychrome)
- [ ] Negative jokers (don't take up slot)

## Medium Priority Tasks

### 6. Card Types
- [ ] Stone cards (high chips but no rank/suit)
- [ ] Wild cards (can be any suit)
- [ ] Steel cards (remain in hand after playing)
- [ ] Bonus/Mult cards
- [ ] Lucky cards (chance for additional effects)

### 7. UI/UX Improvements
- [ ] Tutorial/help system for new players
- [ ] Card/joker tooltips on hover
- [ ] Hand history viewer
- [ ] Enhanced deck viewer with filters
- [ ] Settings menu (gameplay settings, not just sound)
- [ ] Score animations and visual feedback
- [ ] Better joker organization in shop

### 8. Shop Improvements
- [ ] Reroll cost should increase with each use
- [ ] Shop item tooltips
- [ ] Purchase animations
- [ ] Booster pack opening animations
- [ ] Joker rarity indicators

### 9. Game Balance
- [ ] Review and adjust joker prices
- [ ] Balance scaling joker progression
- [ ] Fine-tune boss blind difficulty
- [ ] Adjust consumable card rarity/pricing

## Low Priority Tasks

### 10. Visual Polish
- [ ] Boss blind entrance animations
- [ ] Card enhancement visual effects
- [ ] Particle effects for scoring/purchasing
- [ ] Victory/defeat screen animations
- [ ] Improved card dealing animations
- [ ] Joker activation animations

### 11. Audio System
- [ ] Background music
- [ ] Contextual sound effects (different sounds for hand types)
- [ ] Boss blind themes
- [ ] Victory/defeat jingles
- [ ] Shop music

### 12. Save System Enhancements
- [ ] Multiple save slots
- [ ] Run history viewer
- [ ] Statistics per save slot
- [ ] Cloud save support

### 13. Achievement System
- [ ] Design achievement list
- [ ] Implement achievement tracking
- [ ] Achievement notification system
- [ ] Unlock rewards

### 14. Accessibility
- [ ] Colorblind mode
- [ ] Font size options
- [ ] Animation speed controls
- [ ] Full keyboard navigation
- [ ] Screen reader support

## Future Features

### 15. Advanced Game Modes
- [ ] Daily challenges (seeded runs)
- [ ] Challenge runs (special rule sets)
- [ ] Custom starting decks
- [ ] Leaderboards
- [ ] Endless mode improvements

### 16. Technical Improvements
- [ ] Performance optimization (React.memo, useMemo)
- [ ] Error boundaries
- [ ] Progressive Web App support
- [ ] Mobile responsive design
- [ ] Offline play support

## Development Notes

### Architecture
- Feature-based directory organization
- Discriminated unions for type-safe state management
- Immutable state updates
- Container/Presentation component pattern
- Pure functions for game logic
- No type guards or type assertions
- Exhaustive pattern matching with switch statements

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
- Implemented all 13 boss blinds from the official game
- Refactored Joker type to discriminated union (no nested effect property)
- Implemented scaling jokers (Ice Cream, Runner, Obelisk, etc.)
- Fixed card enhancement sync issues during rounds
- Organized documentation into docs/ directory
- Added TypeScript type safety guidelines

### Next Steps for Development
1. Configure test output to hide passing tests
2. Refactor RoundContainer to separate concerns
3. Implement hand-size jokers
4. Add voucher system for permanent upgrades
5. Implement tarot cards for card modifications
6. Add seal system for cards
7. Improve UI/UX with tooltips and animations

The game state management is in `src/game/gameState.ts` and ante progression is handled in `src/game/runState.ts`.