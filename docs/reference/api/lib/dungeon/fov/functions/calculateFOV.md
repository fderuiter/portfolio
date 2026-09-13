[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dungeon/fov](../README.md) / calculateFOV

# Function: calculateFOV()

> **calculateFOV**(`grid`, `px`, `py`, `radius?`, `existingExplored?`): [`FOVResult`](../interfaces/FOVResult.md)

Calculates field of view using raycasting algorithm from a player origin (px, py).
Updates explored matrix permanently and visible matrix for current frame.

## Parameters

### grid

`string`[][]

### px

`number`

### py

`number`

### radius?

`number` = `6`

### existingExplored?

`boolean`[][]

## Returns

[`FOVResult`](../interfaces/FOVResult.md)
