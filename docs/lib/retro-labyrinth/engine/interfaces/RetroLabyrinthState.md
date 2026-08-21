[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/retro-labyrinth/engine](../README.md) / RetroLabyrinthState

# Interface: RetroLabyrinthState

Defined in: [lib/retro-labyrinth/engine.ts:35](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L35)

## Properties

### activeWeaponId

> **activeWeaponId**: `string`

Defined in: [lib/retro-labyrinth/engine.ts:48](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L48)

***

### campaignRooms

> **campaignRooms**: [`DungeonRoom`](../../../dungeon/types/interfaces/DungeonRoom.md)[]

Defined in: [lib/retro-labyrinth/engine.ts:39](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L39)

***

### crtThemeId

> **crtThemeId**: [`CRTThemeId`](../../../dungeon/types/type-aliases/CRTThemeId.md)

Defined in: [lib/retro-labyrinth/engine.ts:62](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L62)

***

### cryptoCredits

> **cryptoCredits**: `number`

Defined in: [lib/retro-labyrinth/engine.ts:50](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L50)

***

### currentMaze

> **currentMaze**: `string`[][]

Defined in: [lib/retro-labyrinth/engine.ts:40](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L40)

***

### enemies

> **enemies**: [`Enemy`](../../../dungeon/types/interfaces/Enemy.md)[]

Defined in: [lib/retro-labyrinth/engine.ts:54](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L54)

***

### exploredCells

> **exploredCells**: `boolean`[][]

Defined in: [lib/retro-labyrinth/engine.ts:60](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L60)

***

### faceForgeBoss

> **faceForgeBoss**: [`BossState`](../../../dungeon/types/interfaces/BossState.md) \| `null`

Defined in: [lib/retro-labyrinth/engine.ts:53](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L53)

***

### floatingTexts

> **floatingTexts**: [`FloatingNotification`](../../../dungeon/types/interfaces/FloatingNotification.md)[]

Defined in: [lib/retro-labyrinth/engine.ts:57](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L57)

***

### gameMode

> **gameMode**: `"classic"` \| `"roguelike"`

Defined in: [lib/retro-labyrinth/engine.ts:36](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L36)

***

### gameStatus

> **gameStatus**: `"playing"` \| `"victory"` \| `"game_over"`

Defined in: [lib/retro-labyrinth/engine.ts:46](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L46)

***

### hexPuzzle

> **hexPuzzle**: `unknown`

Defined in: [lib/retro-labyrinth/engine.ts:61](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L61)

***

### highScore

> **highScore**: `number`

Defined in: [lib/retro-labyrinth/engine.ts:45](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L45)

***

### items

> **items**: [`ItemPickup`](../../../dungeon/types/interfaces/ItemPickup.md)[]

Defined in: [lib/retro-labyrinth/engine.ts:55](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L55)

***

### maxHp

> **maxHp**: `number`

Defined in: [lib/retro-labyrinth/engine.ts:43](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L43)

***

### particles

> **particles**: [`ParticleEffect`](../../../dungeon/types/interfaces/ParticleEffect.md)[]

Defined in: [lib/retro-labyrinth/engine.ts:58](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L58)

***

### playerHp

> **playerHp**: `number`

Defined in: [lib/retro-labyrinth/engine.ts:42](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L42)

***

### playerPosition

> **playerPosition**: `object`

Defined in: [lib/retro-labyrinth/engine.ts:41](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L41)

#### x

> **x**: `number`

#### y

> **y**: `number`

***

### roomIndex

> **roomIndex**: `number`

Defined in: [lib/retro-labyrinth/engine.ts:38](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L38)

***

### score

> **score**: `number`

Defined in: [lib/retro-labyrinth/engine.ts:44](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L44)

***

### selectedClassId

> **selectedClassId**: [`CyberdeckClassId`](../../../dungeon/types/type-aliases/CyberdeckClassId.md)

Defined in: [lib/retro-labyrinth/engine.ts:63](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L63)

***

### selectedWeaponIndex

> **selectedWeaponIndex**: `number`

Defined in: [lib/retro-labyrinth/engine.ts:49](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L49)

***

### sideEffects

> **sideEffects**: [`ActiveSideEffect`](../../../dungeon/types/interfaces/ActiveSideEffect.md)[]

Defined in: [lib/retro-labyrinth/engine.ts:56](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L56)

***

### stage

> **stage**: `number`

Defined in: [lib/retro-labyrinth/engine.ts:37](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L37)

***

### tspTour

> **tspTour**: `number`[]

Defined in: [lib/retro-labyrinth/engine.ts:52](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L52)

***

### visibleCells

> **visibleCells**: `boolean`[][]

Defined in: [lib/retro-labyrinth/engine.ts:59](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L59)

***

### visitedNodes

> **visitedNodes**: `number`[]

Defined in: [lib/retro-labyrinth/engine.ts:51](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L51)

***

### weapons

> **weapons**: [`Weapon`](../../../dungeon/types/interfaces/Weapon.md)[]

Defined in: [lib/retro-labyrinth/engine.ts:47](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L47)
