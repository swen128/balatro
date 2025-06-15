# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Balatro card game implementation built with:
- **Bun** as the JavaScript runtime and bundler
- **TypeScript** with maximum strictness settings
- **React 19** for UI components
- **ESLint** configured to prohibit `any` types and type assertions

## Commands

### Development
- `bun run dev` - Start development server with hot reload
- `bun run build` - Build for production
- `bun run lint` - Run ESLint checks
- `bun run typecheck` - Run TypeScript type checking
- `bun run test` - Run unit tests
- `bun run knip` - Check for unused files, dependencies, and exports
- `bun run check` - Run all checks (lint, typecheck, tests, and knip) - also runs as pre-commit hook
- `bun run autofix` - Automatically fix linting issues and remove unused exports

### Package Management
Use `bun add` for adding dependencies (not npm or yarn).

## Code Standards

### UI and Logic Architecture
- Separate UI and logic
- Maximize pure functions
- Always check exhaustiveness using switch statement when branching on sum types
- Use presentation components with no logic and container components

### TypeScript Requirements
- **NO `any` types allowed** - ESLint will error
- **NO type assertions allowed** - Use proper typing and discriminated unions
- **NO type guards** - Use discriminated unions and exhaustive pattern matching instead
- **All strict checks enabled** including:
  - `noUncheckedIndexedAccess`
  - `exactOptionalPropertyTypes`
  - `noImplicitReturns`
  - All function parameters and return types must be explicit

### Array Access Pattern
- **Don't check length before accessing array elements**
- Instead of `if (array.length > 0) { const first = array[0]; ... }`
- Use: `const first = array[0]; if (first !== undefined) { ... }`
- This preserves type information about non-empty arrays and eliminates redundant checks

### Import Rules
- Use `import type` for type-only imports (enforced by `verbatimModuleSyntax`)
- Use `.ts` extensions in import paths
- **Always import from module directories, not specific files** (e.g., `import { Card } from '../cards'` not `from '../cards/card.ts'`)
- Each module should have an `index.ts` that exports its public API

## Architecture

### Directory Structure
```
src/
├── domain/      # Core game logic (pure functions, immutable)
│   ├── card.ts
│   ├── pokerHands.ts
│   ├── blind.ts
│   ├── scoring.ts
│   └── drawPile.ts
├── features/    # Feature-based organization
│   ├── round/   # Everything related to playing rounds
│   │   ├── RoundContainer.tsx
│   │   ├── RoundView.tsx
│   │   └── roundLogic.ts
│   ├── blind-selection/
│   │   ├── BlindSelectionContainer.tsx
│   │   └── BlindSelectionView.tsx
│   └── shop/
│       ├── ShopContainer.tsx
│       └── ShopView.tsx
└── utils/       # Utility functions
```

### Component Architecture
- **Feature-based organization**: Colocate all files related to a feature in the same directory
- **Minimize import distance**: Keep dependencies close to where they're used
- **Separate UI and logic**: Use container/presentation component pattern within each feature
- **Maximize pure functions**: Extract all logic into pure functions
- **Exhaustiveness checking**: Always use switch statements with exhaustive checks for sum types
- **Container components**: Handle state and business logic
- **Presentation components**: Pure UI with no logic, only props

### State Management
The game uses immutable state with discriminated unions:
- All state transitions return new state objects
- Use `readonly` arrays and properties
- State machines use `type` field for discrimination

### Game Flow
See GAME_SPECIFICATION.md for detailed game rules and mechanics.

## Testing
- Use Bun's built-in test runner: `bun test`
- **ALWAYS run tests before committing** to ensure code quality
- Write tests for all domain logic (pure functions)
- Test file naming: `<module>.test.ts`

## Git Workflow
- The pre-commit hook will automatically run `bun run check` (lint, typecheck, and tests)
- You can manually run `bun run check` to verify everything passes
- When completing sub-tasks, commit changes after passing tests and linter before proceeding to the next task
