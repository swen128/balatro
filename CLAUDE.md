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

### Package Management
Use `bun add` for adding dependencies (not npm or yarn).

## Code Standards

### TypeScript Requirements
- **NO `any` types allowed** - ESLint will error
- **NO type assertions allowed** - Use proper typing and discriminated unions
- **NO type guards** - Use discriminated unions and exhaustive pattern matching instead
- **All strict checks enabled** including:
  - `noUncheckedIndexedAccess`
  - `exactOptionalPropertyTypes`
  - `noImplicitReturns`
  - All function parameters and return types must be explicit

### Import Rules
- Use `import type` for type-only imports (enforced by `verbatimModuleSyntax`)
- Use `.ts` extensions in import paths

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
├── ui/          # React components
└── utils/       # Utility functions
```

### State Management
The game uses immutable state with discriminated unions:
- All state transitions return new state objects
- Use `readonly` arrays and properties
- State machines use `type` field for discrimination

### Game Flow
See GAME_SPECIFICATION.md for detailed game rules and mechanics.

## Testing
Currently no test framework is set up. When adding tests, use Bun's built-in test runner.