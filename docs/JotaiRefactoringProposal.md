# Jotai + XState Refactoring Proposal

## Current Problems with RoundContainer

1. **Complex useEffect**: The current implementation has a large useEffect that handles state transitions, side effects, and timing all in one place
2. **Mixed Concerns**: State transitions and side effects are tightly coupled
3. **Hard to Test**: The logic is embedded in React hooks, making it difficult to test in isolation
4. **Unclear State Flow**: It's not immediately clear what states can transition to what other states

## Benefits of Jotai + XState Approach

### 1. Clear State Machine Definition
```typescript
// States are explicitly defined
states: {
  drawing: { /* ... */ },
  selectingHand: { /* ... */ },
  playing: { /* ... */ },
  scoring: { /* ... */ },
  played: { /* ... */ },
  roundFinished: { /* ... */ }
}
```

### 2. Separation of Concerns
- **State Machine**: Handles state transitions and guards
- **Jotai Atoms**: Manage state values
- **Effects**: Handle side effects separately from transitions
- **Component**: Only handles UI and user interactions

### 3. Testability
```typescript
// State machine can be tested independently
const testMachine = roundMachine.provide({
  input: { state: mockState, /* ... */ }
});

// Test transitions
const nextState = testMachine.transition('selectingHand', { type: 'PLAY_HAND' });
```

### 4. Type Safety
- XState provides full TypeScript support with type-safe events and context
- State transitions are validated at compile time
- Impossible states are unrepresentable

### 5. Visual Debugging
XState provides tools to visualize the state machine, making it easier to understand the game flow.

## Implementation Strategy

### Phase 1: Basic State Machine
1. Define all round states in XState
2. Implement state transitions without side effects
3. Test the state machine in isolation

### Phase 2: Integrate with Jotai
1. Create atoms for game state values
2. Use `atomWithMachine` to connect XState with Jotai
3. Handle side effects with `atomEffect`

### Phase 3: Replace Current Implementation
1. Update RoundContainer to use Jotai atoms
2. Remove the complex useEffect
3. Simplify event handlers

## Example: Handling Money Generation

### Before (in useEffect):
```typescript
if (roundState.type === 'scoring' && transition.nextState.type === 'played') {
  const scoringState = roundState;
  if (scoringState.moneyGenerated !== undefined && scoringState.moneyGenerated > 0) {
    const moneyToAdd = scoringState.moneyGenerated;
    setMoney(currentMoney => currentMoney + moneyToAdd);
    onUpdateRunState(runState => ({
      ...runState,
      cash: runState.cash + moneyToAdd,
    }));
  }
}
```

### After (with Jotai effect):
```typescript
export const roundEffectsAtom = atomEffect((get, set) => {
  const [state] = get(roundMachineAtom);
  const callbacks = get(roundEffectCallbacksAtom);
  
  if (state.matches('scoring')) {
    const moneyUpdate = extractMoneyFromScoringState(state.context.state);
    if (moneyUpdate) {
      callbacks.onMoneyGenerated(moneyUpdate.amount);
    }
  }
});
```

## Additional Benefits

1. **Pause/Resume**: State machines make it easy to save and restore game state
2. **Replay**: Can replay a sequence of events to reproduce bugs
3. **Better Error Handling**: Invalid transitions are caught by the state machine
4. **Extensibility**: Adding new states or transitions is straightforward

## Conclusion

Using Jotai + XState would:
- Make the code more maintainable and testable
- Provide better separation of concerns
- Make the game flow more explicit and easier to understand
- Reduce bugs related to invalid state transitions

The initial setup requires more code, but the long-term benefits in maintainability and reliability are significant.