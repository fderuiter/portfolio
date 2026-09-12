[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/accessibility-utils](../README.md) / FocusBridge

# Class: FocusBridge

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

Automatically restores keyboard focus to the host application 
after a user completes an iframe-based onboarding step.

#### Parameters

##### hostElementId

`string`

#### Returns

`void`
