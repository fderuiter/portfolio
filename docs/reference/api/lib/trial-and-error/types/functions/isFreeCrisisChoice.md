[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / isFreeCrisisChoice

# Function: isFreeCrisisChoice()

> **isFreeCrisisChoice**(`choice`): `boolean`

Whether a crisis choice costs nothing the player might lack.

## Parameters

### choice

#### consequence

`string` = `...`

The consequence, in plain words, shown on the button.

#### effect

\{ `budget?`: `number`; `cpu?`: `number`; `grantSeal?`: \{ `effect`: \{ `kind`: `"PLUS_CHIPS"`; `value`: `number`; \} \| \{ `kind`: `"PLUS_MULT"`; `value`: `number`; \} \| \{ `kind`: `"WAIVE"`; \}; `eligible`: \{ `cardTypes?`: (`"TABLE"` \| `"LISTING"` \| `"FIGURE"` \| `"SUBJECT_TOKEN"`)[]; `populations?`: (`"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"`)[]; `topics?`: `string`[]; \}; `footnote`: `string`; `id`: `string`; `name`: `string`; `sellValue`: `number`; \}; `modifier?`: \{ `debuffType`: `"DISABLE_POPULATION"` \| `"HAND_LIMIT"` \| `"DISCARD_PENALTY"` \| `"BLIND_FIREWALL"`; `description`: `string`; `disabledPopulations?`: (`"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"`)[]; `discardCpuPenalty?`: `number`; `id`: `string`; `maxHandsAllowed?`: `number`; `name`: `string`; \}; `spendSeal?`: `true`; `transition?`: \{ `change`: `"JOIN"` \| `"LEAVE"`; `description`: `string`; `effectiveAt`: `string`; `id`: `string`; `populations`: (`"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"`)[]; `reason`: `"DROPOUT"` \| `"PROTOCOL_AMENDMENT"` \| `"SCREEN_FAILURE"` \| `"PROTOCOL_DEVIATION"`; `subjectId`: `string`; \}; \} = `CrisisEffectSchema`

#### effect.budget?

`number` = `...`

#### effect.cpu?

`number` = `...`

#### effect.grantSeal?

\{ `effect`: \{ `kind`: `"PLUS_CHIPS"`; `value`: `number`; \} \| \{ `kind`: `"PLUS_MULT"`; `value`: `number`; \} \| \{ `kind`: `"WAIVE"`; \}; `eligible`: \{ `cardTypes?`: (`"TABLE"` \| `"LISTING"` \| `"FIGURE"` \| `"SUBJECT_TOKEN"`)[]; `populations?`: (`"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"`)[]; `topics?`: `string`[]; \}; `footnote`: `string`; `id`: `string`; `name`: `string`; `sellValue`: `number`; \} = `...`

#### effect.grantSeal.effect

\{ `kind`: `"PLUS_CHIPS"`; `value`: `number`; \} \| \{ `kind`: `"PLUS_MULT"`; `value`: `number`; \} \| \{ `kind`: `"WAIVE"`; \} = `SealEffectSchema`

#### effect.grantSeal.eligible

\{ `cardTypes?`: (`"TABLE"` \| `"LISTING"` \| `"FIGURE"` \| `"SUBJECT_TOKEN"`)[]; `populations?`: (`"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"`)[]; `topics?`: `string`[]; \} = `...`

Outputs the seal may be affixed to. An absent list allows any.

#### effect.grantSeal.eligible.cardTypes?

(`"TABLE"` \| `"LISTING"` \| `"FIGURE"` \| `"SUBJECT_TOKEN"`)[] = `...`

#### effect.grantSeal.eligible.populations?

(`"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"`)[] = `...`

#### effect.grantSeal.eligible.topics?

`string`[] = `...`

#### effect.grantSeal.footnote

`string` = `...`

The footnote as it prints under the output.

#### effect.grantSeal.id

`string` = `identifier`

#### effect.grantSeal.name

`string` = `...`

#### effect.grantSeal.sellValue

`number` = `nonNegativeInt`

What selling it adds to the study budget.

#### effect.modifier?

\{ `debuffType`: `"DISABLE_POPULATION"` \| `"HAND_LIMIT"` \| `"DISCARD_PENALTY"` \| `"BLIND_FIREWALL"`; `description`: `string`; `disabledPopulations?`: (`"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"`)[]; `discardCpuPenalty?`: `number`; `id`: `string`; `maxHandsAllowed?`: `number`; `name`: `string`; \} = `...`

#### effect.modifier.debuffType

`"DISABLE_POPULATION"` \| `"HAND_LIMIT"` \| `"DISCARD_PENALTY"` \| `"BLIND_FIREWALL"` = `BossDebuffTypeSchema`

#### effect.modifier.description

`string` = `...`

#### effect.modifier.disabledPopulations?

(`"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"`)[] = `...`

#### effect.modifier.discardCpuPenalty?

`number` = `...`

#### effect.modifier.id

`string` = `identifier`

#### effect.modifier.maxHandsAllowed?

`number` = `...`

#### effect.modifier.name

`string` = `...`

#### effect.spendSeal?

`true` = `...`

Spends the first seal in the tray.

#### effect.transition?

\{ `change`: `"JOIN"` \| `"LEAVE"`; `description`: `string`; `effectiveAt`: `string`; `id`: `string`; `populations`: (`"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"`)[]; `reason`: `"DROPOUT"` \| `"PROTOCOL_AMENDMENT"` \| `"SCREEN_FAILURE"` \| `"PROTOCOL_DEVIATION"`; `subjectId`: `string`; \} = `...`

#### effect.transition.change

`"JOIN"` \| `"LEAVE"` = `...`

#### effect.transition.description

`string` = `...`

What happened, in the study's words.

#### effect.transition.effectiveAt

`string` = `...`

#### effect.transition.id

`string` = `identifier`

#### effect.transition.populations

(`"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"`)[] = `...`

#### effect.transition.reason

`"DROPOUT"` \| `"PROTOCOL_AMENDMENT"` \| `"SCREEN_FAILURE"` \| `"PROTOCOL_DEVIATION"` = `TransitionReasonSchema`

#### effect.transition.subjectId

`string` = `identifier`

#### id

`string` = `identifier`

#### label

`string` = `...`

## Returns

`boolean`
