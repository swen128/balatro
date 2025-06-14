# Design Decisions

This document captures architectural and implementation decisions made during development.

## Boss Effect System

**Decision**: Boss effects should be typed by when they apply in the game flow rather than using string-based effect matching.

**Rationale**:
- Type safety with exhaustive checking
- Clear timing semantics 
- Support for multiple effects per boss
- Self-documenting code

**Proposed Implementation**:
```typescript
type BossEffectType = 
  | RoundStartEffect
  | HandSelectionEffect
  | PreScoringEffect
  | ScoringModifierEffect
  | PostScoringEffect
  | RoundEndEffect;

// Each category has specific effect types
type HandSelectionEffect =
  | { kind: 'handSelection'; type: 'discardRandomCards'; count: number }
  | { kind: 'handSelection'; type: 'forceSuit'; suit: Suit }
  | { kind: 'handSelection'; type: 'maxCardSelection'; max: number };

// Boss can have multiple effects
interface BossBlind {
  // ... existing fields
  readonly effects: ReadonlyArray<BossEffectType>;
}
```

**Benefits**:
1. Explicit timing - each effect declares when it applies
2. Type-safe exhaustive checking remains intact
3. Bosses can have complex multi-phase effects
4. Easy to add new effect types without breaking existing code

## Extensibility Approach

**Decision**: Use exhaustive switch statements with TypeScript's type checking rather than dynamic plugin systems.

**Rationale**:
- TypeScript ensures all cases are handled when adding new types
- Clear, readable code with explicit behavior
- Better performance than dynamic dispatch
- Easier to debug and understand

**Areas for Improvement**:
1. Replace string-based boss name matching with typed effects
2. Enrich context objects for more complex effect interactions
3. Add effect ordering/priority system for multiple jokers
4. Allow dynamic content generation based on game state