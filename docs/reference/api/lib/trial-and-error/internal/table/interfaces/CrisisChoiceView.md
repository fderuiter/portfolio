[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/table](../README.md) / CrisisChoiceView

# Interface: CrisisChoiceView

One crisis choice as the table renders it.

## Properties

### choice

> **choice**: `object`

#### consequence

> **consequence**: `string`

The consequence, in plain words, shown on the button.

#### effect

> **effect**: `object` = `CrisisEffectSchema`

##### effect.budget?

> `optional` **budget?**: `number`

##### effect.cpu?

> `optional` **cpu?**: `number`

##### effect.grantSeal?

> `optional` **grantSeal?**: `object`

##### effect.grantSeal.effect

> **effect**: \{ `kind`: `"PLUS_CHIPS"`; `value`: `number`; \} \| \{ `kind`: `"PLUS_MULT"`; `value`: `number`; \} \| \{ `kind`: `"WAIVE"`; \} = `SealEffectSchema`

##### effect.grantSeal.eligible

> **eligible**: `object`

Outputs the seal may be affixed to. An absent list allows any.

##### effect.grantSeal.eligible.cardTypes?

> `optional` **cardTypes?**: (`"TABLE"` \| `"LISTING"` \| `"FIGURE"` \| `"SUBJECT_TOKEN"`)[]

##### effect.grantSeal.eligible.populations?

> `optional` **populations?**: (`"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"`)[]

##### effect.grantSeal.eligible.topics?

> `optional` **topics?**: `string`[]

##### effect.grantSeal.footnote

> **footnote**: `string`

The footnote as it prints under the output.

##### effect.grantSeal.id

> **id**: `string` = `identifier`

##### effect.grantSeal.name

> **name**: `string`

##### effect.grantSeal.sellValue

> **sellValue**: `number` = `nonNegativeInt`

What selling it adds to the study budget.

##### effect.modifier?

> `optional` **modifier?**: `object`

##### effect.modifier.debuffType

> **debuffType**: `"DISABLE_POPULATION"` \| `"HAND_LIMIT"` \| `"DISCARD_PENALTY"` \| `"BLIND_FIREWALL"` = `BossDebuffTypeSchema`

##### effect.modifier.description

> **description**: `string`

##### effect.modifier.disabledPopulations?

> `optional` **disabledPopulations?**: (`"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"`)[]

##### effect.modifier.discardCpuPenalty?

> `optional` **discardCpuPenalty?**: `number`

##### effect.modifier.id

> **id**: `string` = `identifier`

##### effect.modifier.maxHandsAllowed?

> `optional` **maxHandsAllowed?**: `number`

##### effect.modifier.name

> **name**: `string`

##### effect.spendSeal?

> `optional` **spendSeal?**: `true`

Spends the first seal in the tray.

##### effect.transition?

> `optional` **transition?**: `object`

##### effect.transition.change

> **change**: `"JOIN"` \| `"LEAVE"`

##### effect.transition.description

> **description**: `string`

What happened, in the study's words.

##### effect.transition.effectiveAt

> **effectiveAt**: `string`

##### effect.transition.id

> **id**: `string` = `identifier`

##### effect.transition.populations

> **populations**: (`"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"`)[]

##### effect.transition.reason

> **reason**: `"DROPOUT"` \| `"PROTOCOL_AMENDMENT"` \| `"SCREEN_FAILURE"` \| `"PROTOCOL_DEVIATION"` = `TransitionReasonSchema`

##### effect.transition.subjectId

> **subjectId**: `string` = `identifier`

#### id

> **id**: `string` = `identifier`

#### label

> **label**: `string`

***

### refusal

> **refusal**: `string` \| `null`

Why this choice cannot be taken now, or null.
