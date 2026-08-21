[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/retro-labyrinth/engine](../README.md) / RetroLabyrinthState

# Interface: RetroLabyrinthState

Defined in: [lib/retro-labyrinth/engine.ts:30](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L30)

## Properties

### activeWeaponId

> **activeWeaponId**: [`WeaponId`](../../../dungeon/types/type-aliases/WeaponId.md)

Defined in: [lib/retro-labyrinth/engine.ts:43](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L43)

***

### campaignRooms

> **campaignRooms**: [`DungeonRoom`](../../../dungeon/types/interfaces/DungeonRoom.md)[]

Defined in: [lib/retro-labyrinth/engine.ts:34](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L34)

***

### crtThemeId

> **crtThemeId**: [`CRTThemeId`](../../../dungeon/types/type-aliases/CRTThemeId.md)

Defined in: [lib/retro-labyrinth/engine.ts:57](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L57)

***

### cryptoCredits

> **cryptoCredits**: `number`

Defined in: [lib/retro-labyrinth/engine.ts:45](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L45)

***

### currentMaze

> **currentMaze**: `string`[][]

Defined in: [lib/retro-labyrinth/engine.ts:35](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L35)

***

### enemies

> **enemies**: [`Enemy`](../../../dungeon/types/interfaces/Enemy.md)[]

Defined in: [lib/retro-labyrinth/engine.ts:49](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L49)

***

### exploredCells

> **exploredCells**: `boolean`[][]

Defined in: [lib/retro-labyrinth/engine.ts:55](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L55)

***

### faceForgeBoss

> **faceForgeBoss**: [`BossState`](../../../dungeon/types/interfaces/BossState.md) \| `null`

Defined in: [lib/retro-labyrinth/engine.ts:48](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L48)

***

### floatingTexts

> **floatingTexts**: [`FloatingNotification`](../../../dungeon/types/interfaces/FloatingNotification.md)[]

Defined in: [lib/retro-labyrinth/engine.ts:52](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L52)

***

### gameMode

> **gameMode**: `"classic"` \| `"roguelike"`

Defined in: [lib/retro-labyrinth/engine.ts:31](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L31)

***

### gameStatus

> **gameStatus**: `"playing"` \| `"victory"` \| `"game_over"`

Defined in: [lib/retro-labyrinth/engine.ts:41](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L41)

***

### hexPuzzle

> **hexPuzzle**: [`HexMatrixPuzzle`](../../../dungeon/types/interfaces/HexMatrixPuzzle.md) \| `null`

Defined in: [lib/retro-labyrinth/engine.ts:56](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L56)

***

### highScore

> **highScore**: `number`

Defined in: [lib/retro-labyrinth/engine.ts:40](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L40)

***

### items

> **items**: [`ItemPickup`](../../../dungeon/types/interfaces/ItemPickup.md)[]

Defined in: [lib/retro-labyrinth/engine.ts:50](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L50)

***

### maxHp

> **maxHp**: `number`

Defined in: [lib/retro-labyrinth/engine.ts:38](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L38)

***

### particles

> **particles**: [`ParticleEffect`](../../../dungeon/types/interfaces/ParticleEffect.md)[]

Defined in: [lib/retro-labyrinth/engine.ts:53](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L53)

***

### playerHp

> **playerHp**: `number`

Defined in: [lib/retro-labyrinth/engine.ts:37](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L37)

***

### playerPosition

> **playerPosition**: `object`

Defined in: [lib/retro-labyrinth/engine.ts:36](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L36)

#### x

> **x**: `number`

#### y

> **y**: `number`

***

### roomIndex

> **roomIndex**: `number`

Defined in: [lib/retro-labyrinth/engine.ts:33](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L33)

***

### score

> **score**: `number`

Defined in: [lib/retro-labyrinth/engine.ts:39](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L39)

***

### selectedClassId

> **selectedClassId**: [`CyberdeckClassId`](../../../dungeon/types/type-aliases/CyberdeckClassId.md)

Defined in: [lib/retro-labyrinth/engine.ts:58](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L58)

***

### selectedWeaponIndex

> **selectedWeaponIndex**: `number`

Defined in: [lib/retro-labyrinth/engine.ts:44](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L44)

***

### sideEffects

> **sideEffects**: [`ActiveSideEffect`](../../../dungeon/types/interfaces/ActiveSideEffect.md)[]

Defined in: [lib/retro-labyrinth/engine.ts:51](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L51)

***

### stage

> **stage**: `number`

Defined in: [lib/retro-labyrinth/engine.ts:32](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L32)

***

### tspTour

> **tspTour**: `object`[]

Defined in: [lib/retro-labyrinth/engine.ts:47](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L47)

#### x

> **x**: `number`

#### y

> **y**: `number`

***

### visibleCells

> **visibleCells**: `boolean`[][]

Defined in: [lib/retro-labyrinth/engine.ts:54](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L54)

***

### visitedNodes

> **visitedNodes**: `object`[]

Defined in: [lib/retro-labyrinth/engine.ts:46](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L46)

#### x

> **x**: `number`

#### y

> **y**: `number`

***

### weapons

> **weapons**: [`Weapon`](../../../dungeon/types/interfaces/Weapon.md)[]

Defined in: [lib/retro-labyrinth/engine.ts:42](https://github.com/fderuiter/portfolio/blob/main/lib/retro-labyrinth/engine.ts#L42)
