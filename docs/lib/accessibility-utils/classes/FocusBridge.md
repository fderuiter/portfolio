[**temp_dir**](../../../README.md)

***

[temp_dir](../../../modules.md) / [lib/accessibility-utils](../README.md) / FocusBridge

# Class: FocusBridge

Defined in: [lib/accessibility-utils.ts:30](https://github.com/fderuiter/portfolio/blob/main/lib/accessibility-utils.ts#L30)

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

Defined in: [lib/accessibility-utils.ts:47](https://github.com/fderuiter/portfolio/blob/main/lib/accessibility-utils.ts#L47)

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

Defined in: [lib/accessibility-utils.ts:35](https://github.com/fderuiter/portfolio/blob/main/lib/accessibility-utils.ts#L35)

Automatically restores keyboard focus to the host application 
after a user completes an iframe-based onboarding step.

#### Parameters

##### hostElementId

`string`

#### Returns

`void`
