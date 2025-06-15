# TypeScript Type Safety Guidelines

This document outlines key principles for writing type-safe TypeScript code.

## Key Principles

### 1. Avoid Nested Type Objects - Use Discriminated Unions

**Problem**: The original implementation had a nested effect object:
```typescript
interface Joker {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare';
  effect: JokerEffect;  // Nested object with its own type field
}

type JokerEffect = 
  | { type: 'flatChips'; amount: number }
  | { type: 'flatMult'; amount: number }
  // ... more effect types

// Usage required accessing nested properties:
if (joker.effect.type === 'flatChips') {
  return joker.effect.amount;  // Two levels of property access
}
```

**Solution**: Flatten all properties directly onto the union type:
```typescript
type BaseJoker = {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare';
};

type Joker = BaseJoker & (
  | { type: 'flatChips'; amount: number }
  | { type: 'flatMult'; amount: number }
  // ... more types
);

// Usage is cleaner and type narrows naturally:
if (joker.type === 'flatChips') {
  return joker.amount;  // Direct property access, TypeScript knows amount exists
}
```

**Why**: 
- Eliminates unnecessary nesting
- TypeScript can narrow the entire object type based on the discriminator
- Cleaner property access without multiple levels
- No need to check both `joker.effect` existence and `joker.effect.type`

### 2. Never Use Type Guards - Design Types to Avoid Them

**Problem**: Code like this:
```typescript
function isScalingEffect(effect: JokerEffect): effect is ScalingEffect {
  return effect.type === 'scalingChips' || effect.type === 'scalingMult';
}
```

**Solution**: Use exhaustive pattern matching with switch statements:
```typescript
switch (joker.type) {
  case 'scalingChips':
  case 'scalingMult':
    // TypeScript knows the type here
    return joker.trigger === trigger ? ... : joker;
  // ... handle all cases
}
```

**Why**: Type guards are code smell. If you need a type guard, your types are not well-designed.

### 3. Input Type Should Match Usage

**Problem**: A function that accepts a broad type but only processes specific subtypes:
```typescript
// This function accepts ALL jokers but only processes scaling ones
function updateJokerScaling(
  jokers: ReadonlyArray<Joker>,  // Accepts any joker type
  trigger: 'handPlayed' | 'cardDiscarded' | 'moneyEarned'
): ReadonlyArray<Joker> {
  return jokers.map(joker => {
    // Has to check type at runtime
    if (joker.type === 'scalingChips' || joker.type === 'scalingMult') {
      if (joker.trigger === trigger) {
        return { ...joker, scalingValue: joker.scalingValue + joker.baseAmount };
      }
    }
    return joker;  // Most jokers just pass through unchanged
  });
}
```

**Better Design Options**:

Option 1 - Separate scaling jokers at the data level:
```typescript
interface GameState {
  jokers: ReadonlyArray<Joker>;
  scalingJokers: ReadonlyArray<ScalingJoker>;  // Keep them separate
}

function updateScalingJokers(
  jokers: ReadonlyArray<ScalingJoker>,  // Only accepts what it processes
  trigger: 'handPlayed' | 'cardDiscarded' | 'moneyEarned'
): ReadonlyArray<ScalingJoker> {
  return jokers.map(joker => 
    joker.trigger === trigger 
      ? { ...joker, scalingValue: joker.scalingValue + joker.baseAmount }
      : joker
  );
}
```

Option 2 - Handle at the call site:
```typescript
// Filter before calling
const scalingJokers = jokers.filter(isScalingJoker);
const updatedScaling = updateScalingJokers(scalingJokers, trigger);
const updatedJokers = [...nonScalingJokers, ...updatedScaling];
```

Option 3 - If you must handle all types, use exhaustive pattern matching:
```typescript
function updateJoker(joker: Joker, trigger: Trigger): Joker {
  switch (joker.type) {
    case 'scalingChips':
    case 'scalingMult':
      return joker.trigger === trigger ? updateScaling(joker) : joker;
    case 'flatChips':
    case 'flatMult':
    // ... handle EVERY case explicitly
      return joker;
  }
}
```

**Why**: 
- Functions should process what they claim to process
- Runtime type checking inside functions is a code smell
- The type system should enforce correct usage at compile time

### 4. Avoid Type Complexity

**Problem**: Repetitive type definitions like:
```typescript
type Joker = 
  | (BaseJoker & { type: 'flatChips'; amount: number })
  | (BaseJoker & { type: 'flatMult'; amount: number })
  // ... repeated 30 times
```

**Solution**: Use intermediate types to reduce repetition:
```typescript
type JokerEffect = 
  | { type: 'flatChips'; amount: number }
  | { type: 'flatMult'; amount: number }
  // ...

type Joker = BaseJoker & JokerEffect;
```

**Why**: Simpler types are easier to understand and maintain.

### 5. Exhaustive Pattern Matching

**Problem**: Using default cases or partial matches.

**Solution**: Handle every case explicitly:
```typescript
switch (joker.type) {
  case 'flatChips': ...
  case 'flatMult': ...
  // ... every single case
}
```

**Why**: The compiler will catch missing cases when new types are added.

### 6. Property Access with Type Narrowing

**Problem**: Tests trying to access properties that don't exist on all union members:
```typescript
expect(joker.amount).toBe(4); // Error if joker might not have 'amount'
```

**Solution**: Narrow the type first:
```typescript
if (joker.type === 'flatMult') {
  expect(joker.amount).toBe(4);
}
```

**Why**: This makes the code type-safe and self-documenting about which properties exist when.

## Summary

Good TypeScript design means:
1. Types that make invalid states unrepresentable
2. No type guards or type assertions
3. Exhaustive pattern matching
4. Types that narrow naturally through normal control flow
5. Input types that match what the function actually processes
6. Flatten nested type structures for better type narrowing

The goal is to make the compiler do the work of ensuring correctness, not runtime checks.