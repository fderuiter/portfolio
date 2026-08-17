[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/game-config-schemas](../README.md) / RetroLabyrinthConfigSchema

# Variable: RetroLabyrinthConfigSchema

> `const` **RetroLabyrinthConfigSchema**: `ZodObject`\<\{ `cyberdeckClass`: `ZodDefault`\<`ZodEnum`\<\{ `apt_specialist`: `"apt_specialist"`; `cryptanalyst`: `"cryptanalyst"`; `hardware_hacker`: `"hardware_hacker"`; `script_kiddie`: `"script_kiddie"`; \}\>\>; `difficulty`: `ZodDefault`\<`ZodEnum`\<\{ `easy`: `"easy"`; `hard`: `"hard"`; `medium`: `"medium"`; \}\>\>; `dungeonSize`: `ZodDefault`\<`ZodEnum`\<\{ `large`: `"large"`; `medium`: `"medium"`; `small`: `"small"`; \}\>\>; `gameId`: `ZodString`; `playerName`: `ZodDefault`\<`ZodString`\>; `securityTier`: `ZodDefault`\<`ZodNumber`\>; `startingExploit`: `ZodDefault`\<`ZodEnum`\<\{ `auth_bypass`: `"auth_bypass"`; `buffer_overflow`: `"buffer_overflow"`; `none`: `"none"`; `sql_injection`: `"sql_injection"`; \}\>\>; \}, `$strip`\>

Defined in: [lib/game-config-schemas.ts:44](https://github.com/fderuiter/portfolio/blob/main/lib/game-config-schemas.ts#L44)
