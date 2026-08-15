[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dungeon/weapons](../README.md) / fireWeapon

# Function: fireWeapon()

> **fireWeapon**(`weaponId`, `weapons`, `playerX`, `playerY`, `playerHp`, `maxPlayerHp`, `enemies`, `boss`, `nowMs`, `currentRam?`): [`WeaponFireResult`](../interfaces/WeaponFireResult.md)

Defined in: [lib/dungeon/weapons.ts:156](https://github.com/fderuiter/portfolio/blob/main/lib/dungeon/weapons.ts#L156)

Fires a cybersecurity weapon or exploit with damage, CVE multipliers, particles, and side-effects.

## Parameters

### weaponId

[`WeaponId`](../../types/type-aliases/WeaponId.md)

### weapons

`Record`\<[`WeaponId`](../../types/type-aliases/WeaponId.md), [`Weapon`](../../types/interfaces/Weapon.md)\>

### playerX

`number`

### playerY

`number`

### playerHp

`number`

### maxPlayerHp

`number`

### enemies

[`Enemy`](../../types/interfaces/Enemy.md)[]

### boss

[`BossState`](../../types/interfaces/BossState.md) \| `undefined`

### nowMs

`number`

### currentRam?

`number` = `32`

## Returns

[`WeaponFireResult`](../interfaces/WeaponFireResult.md)
