[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [hooks/usePersistentState](../README.md) / usePersistentState

# Function: usePersistentState()

> **usePersistentState**\<`T`\>(`key`, `initialValue`): \[`T`, `Dispatch`\<`SetStateAction`\<`T`\>\>\]

Defined in: [hooks/usePersistentState.ts:12](https://github.com/fderuiter/portfolio/blob/main/hooks/usePersistentState.ts#L12)

A custom hook that works like useState but persists the state to localStorage.
Automatically hydrates on mount to prevent SSR hydration mismatches.

## Type Parameters

### T

`T`

## Parameters

### key

`string`

The localStorage key to use for this state

### initialValue

`T`

The default value if nothing is found in localStorage

## Returns

\[`T`, `Dispatch`\<`SetStateAction`\<`T`\>\>\]
