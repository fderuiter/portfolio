[**temp_dir**](../../../README.md)

***

[temp_dir](../../../modules.md) / [hooks/useConsoleArt](../README.md) / useConsoleArt

# Function: useConsoleArt()

> **useConsoleArt**(): `void`

Defined in: [hooks/useConsoleArt.ts:11](https://github.com/fderuiter/portfolio/blob/e9125b13b4fd502f929719e363744f8eb92647bc/hooks/useConsoleArt.ts#L11)

Custom hook that asynchronously fetches a static ASCII art asset 
and prints it in the browser console when the client is idle.
This prevents main thread blockage, avoids bundle size increase, 
and completely eliminates hydration mismatches.

## Returns

`void`
