[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dungeon/ai](../README.md) / updateEnemyAI

# Function: updateEnemyAI()

> **updateEnemyAI**(`enemies`, `grid`, `playerX`, `playerY`, `deltaMs`): [`AIUpdateResult`](../interfaces/AIUpdateResult.md)

Defined in: [lib/dungeon/ai.ts:17](https://github.com/fderuiter/portfolio/blob/main/lib/dungeon/ai.ts#L17)

Updates AI states (patrol, chase, stunned) and positions for all active enemies.

## Parameters

### enemies

[`Enemy`](../../types/interfaces/Enemy.md)[]

### grid

`string`[][]

### playerX

`number`

### playerY

`number`

### deltaMs

`number`

## Returns

[`AIUpdateResult`](../interfaces/AIUpdateResult.md)
