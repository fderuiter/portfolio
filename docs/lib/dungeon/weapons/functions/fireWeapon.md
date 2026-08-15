[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dungeon/weapons](../README.md) / fireWeapon

# Function: fireWeapon()

> **fireWeapon**(`weaponId`, `weapons`, `playerX`, `playerY`, `playerHp`, `maxPlayerHp`, `enemies`, `boss`, `nowMs`): [`WeaponFireResult`](../interfaces/WeaponFireResult.md)

Defined in: [lib/dungeon/weapons.ts:80](https://github.com/fderuiter/portfolio/blob/main/lib/dungeon/weapons.ts#L80)

Fires a developer weapon with damage, particle generation, and humorous side effect.

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

## Returns

[`WeaponFireResult`](../interfaces/WeaponFireResult.md)
