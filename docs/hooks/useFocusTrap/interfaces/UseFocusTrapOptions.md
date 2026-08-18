[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [hooks/useFocusTrap](../README.md) / UseFocusTrapOptions

# Interface: UseFocusTrapOptions

Defined in: [hooks/useFocusTrap.ts:5](https://github.com/fderuiter/portfolio/blob/main/hooks/useFocusTrap.ts#L5)

## Properties

### initialFocusRef?

> `optional` **initialFocusRef?**: `RefObject`\<`HTMLElement` \| `null`\>

Defined in: [hooks/useFocusTrap.ts:9](https://github.com/fderuiter/portfolio/blob/main/hooks/useFocusTrap.ts#L9)

Element or ref to focus immediately when the trap activates.

***

### onEscape?

> `optional` **onEscape?**: () => `void`

Defined in: [hooks/useFocusTrap.ts:13](https://github.com/fderuiter/portfolio/blob/main/hooks/useFocusTrap.ts#L13)

Callback triggered when Escape key is pressed.

#### Returns

`void`

***

### onKeyDown?

> `optional` **onKeyDown?**: (`event`) => `void`

Defined in: [hooks/useFocusTrap.ts:23](https://github.com/fderuiter/portfolio/blob/main/hooks/useFocusTrap.ts#L23)

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

Defined in: [hooks/useFocusTrap.ts:18](https://github.com/fderuiter/portfolio/blob/main/hooks/useFocusTrap.ts#L18)

Whether to restore focus to previously active element upon unmount or deactivation.
Defaults to true.
