# Jotai Implementation Issue

## Problem

Jotai's atom design fundamentally conflicts with our strict functional programming rules:

1. **Jotai atom setters return void**: The second parameter of `atom()` is a setter function that returns void by design
2. **Our ESLint rules forbid void returns**: The `functional/no-return-void` rule requires all functions to return a value

## Example of the Conflict

```typescript
// Jotai's design - setter returns void
export const handleCardClickAtom = atom(
  null,
  (get, set, cardId: string) => {  // ESLint error: Function must return a value
    const roundState = get(roundStateAtom);
    if (!roundState) return;  // ESLint error: must have else statement
    
    const newState = processCardClick(roundState, cardId);
    if (newState) {  // ESLint error: must have else statement
      set(roundStateAtom, newState);
    }
  }
);
```

## Why This is Problematic

1. **Cannot use Jotai's write-only atoms**: These are the primary way to handle actions in Jotai
2. **Cannot use atomEffect**: Effects also return void
3. **Workarounds would violate Jotai's design**: Forcing returns would create confusing, non-idiomatic code

## Attempted Solutions

1. **Returning undefined**: Still violates the no-return-void rule
2. **Returning dummy values**: Creates confusing, non-idiomatic Jotai code
3. **Disabling ESLint rules**: Would compromise our code quality standards

## Conclusion

Jotai's imperative setter design is incompatible with our strict functional programming rules. We need a different state management approach that:

1. Uses pure functions for all state transitions
2. Returns new state from every function
3. Avoids void-returning functions
4. Maintains type safety without type assertions

## Recommendation

Continue with the current `useState` + `useEffect` approach in RoundContainer, or explore state management libraries that are designed with functional programming principles in mind (e.g., libraries that use reducers or state machines with pure transition functions).