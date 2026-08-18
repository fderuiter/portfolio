[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/accessibility-utils](../README.md) / FocusBridge

# Class: FocusBridge

Defined in: [lib/accessibility-utils.ts:122](https://github.com/fderuiter/portfolio/blob/main/lib/accessibility-utils.ts#L122)

Requirement 3: Focus-bridge to maintain keyboard navigation continuity 
when users interact with cross-origin content like iframes.

## Constructors

### Constructor

> **new FocusBridge**(): `FocusBridge`

#### Returns

`FocusBridge`

## Methods

### attachOnboardingListener()

> `static` **attachOnboardingListener**(`iframeWindow`, `hostElementId`): `void`

Defined in: [lib/accessibility-utils.ts:139](https://github.com/fderuiter/portfolio/blob/main/lib/accessibility-utils.ts#L139)

Listens for completion messages from cross-origin iframes.

#### Parameters

##### iframeWindow

`Window`

##### hostElementId

`string`

#### Returns

`void`

***

### restoreHostFocus()

> `static` **restoreHostFocus**(`hostElementId`): `void`

Defined in: [lib/accessibility-utils.ts:127](https://github.com/fderuiter/portfolio/blob/main/lib/accessibility-utils.ts#L127)

Automatically restores keyboard focus to the host application 
after a user completes an iframe-based onboarding step.

#### Parameters

##### hostElementId

`string`

#### Returns

`void`
