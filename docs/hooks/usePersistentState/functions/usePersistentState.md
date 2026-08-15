[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [hooks/usePersistentState](../README.md) / usePersistentState

# Function: usePersistentState()

> **usePersistentState**\<`T`\>(`key`, `initialValue`): \[`T`, `Dispatch`\<`SetStateAction`\<`T`\>\>\]

Defined in: [hooks/usePersistentState.ts:80](https://github.com/fderuiter/portfolio/blob/main/hooks/usePersistentState.ts#L80)

Custom hook that works like useState but persists state to localStorage using useSyncExternalStore.
Synchronizes seamlessly across multiple hook instances and browser tabs with zero tearing.

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
