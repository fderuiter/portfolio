[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [hooks/useFocusTrap](../README.md) / UseFocusTrapOptions

# Interface: UseFocusTrapOptions

Defined in: [hooks/useFocusTrap.ts:6](https://github.com/fderuiter/portfolio/blob/main/hooks/useFocusTrap.ts#L6)

## Properties

### initialFocusRef?

> `optional` **initialFocusRef?**: `RefObject`\<`HTMLElement` \| `null`\>

Defined in: [hooks/useFocusTrap.ts:10](https://github.com/fderuiter/portfolio/blob/main/hooks/useFocusTrap.ts#L10)

Element or ref to focus immediately when the trap activates.

***

### onEscape?

> `optional` **onEscape?**: () => `void`

Defined in: [hooks/useFocusTrap.ts:14](https://github.com/fderuiter/portfolio/blob/main/hooks/useFocusTrap.ts#L14)

Callback triggered when Escape key is pressed.

#### Returns

`void`

***

### onKeyDown?

> `optional` **onKeyDown?**: (`event`) => `void`

Defined in: [hooks/useFocusTrap.ts:24](https://github.com/fderuiter/portfolio/blob/main/hooks/useFocusTrap.ts#L24)

Custom keydown handler to process shortcuts (e.g., Arrow keys, letter hotkeys)
while the trap is active before or along with standard trap behavior.

#### Parameters

##### event

`KeyboardEvent`

#### Returns

`void`

***

### returnFocus?

> `optional` **returnFocus?**: `boolean`

Defined in: [hooks/useFocusTrap.ts:19](https://github.com/fderuiter/portfolio/blob/main/hooks/useFocusTrap.ts#L19)

Whether to restore focus to previously active element upon unmount or deactivation.
Defaults to true.
