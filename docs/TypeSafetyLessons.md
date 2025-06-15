# TypeScript Type Safety Guidelines

This document outlines key principles for writing type-safe TypeScript code.

## Key Principles

### 1. Avoid Nested Type Objects - Use Discriminated Unions

**Problem**: The original implementation had:
```typescript
interface Joker {
  effect: JokerEffect;
}
```

**Solution**: Flatten properties directly onto the union type:
```typescript
type Joker = BaseJoker & JokerEffect;
```

**Why**: This allows TypeScript to properly narrow types based on the discriminator field without needing type guards.

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

**Problem**: A function that only processes certain types but accepts all types:
```typescript
function updateJokerScaling(jokers: ReadonlyArray<Joker>, ...) {
  // Then filtering inside
}
```

**Solution**: Either:
1. Accept all types and handle them exhaustively
2. Design your data flow so only relevant types reach the function
3. Remove the function if it's not used yet

**Why**: Functions should not check their input types - the type system should guarantee correct inputs.

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

### 5. Don't Create Unused Code

**Problem**: Creating functions "for future use" like `updateJokerScaling`.

**Solution**: Delete unused code. Add it when needed.

**Why**: 
- Unused code adds maintenance burden
- It may not match actual requirements when needed
- YAGNI (You Aren't Gonna Need It) principle

### 6. Exhaustive Pattern Matching

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

### 7. Property Access with Type Narrowing

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
5. No unused code
6. Input types that match what the function actually processes

The goal is to make the compiler do the work of ensuring correctness, not runtime checks.