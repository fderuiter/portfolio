[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/arcade/core/game-loop](../README.md) / ArcadeGameLoopOptions

# Interface: ArcadeGameLoopOptions

Defined in: [lib/arcade/core/game-loop.ts:3](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/game-loop.ts#L3)

## Properties

### fixedDt?

> `optional` **fixedDt?**: `number`

Defined in: [lib/arcade/core/game-loop.ts:5](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/game-loop.ts#L5)

Fixed physics delta time in seconds. Defaults to 1/60 (approx 0.016666s).

***

### maxAccumulatorSec?

> `optional` **maxAccumulatorSec?**: `number`

Defined in: [lib/arcade/core/game-loop.ts:7](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/game-loop.ts#L7)

Maximum time accumulator can hold to prevent spiral of death. Defaults to 0.25s.
