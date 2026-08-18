[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [hooks/useFocusTrap](../README.md) / useFocusTrap

# Function: useFocusTrap()

> **useFocusTrap**\<`T`\>(`active`, `options?`): `RefObject`\<`T` \| `null`\>

Defined in: [hooks/useFocusTrap.ts:47](https://github.com/fderuiter/portfolio/blob/main/hooks/useFocusTrap.ts#L47)

Custom hook to trap keyboard focus within a container element for modal dialogs and drawers.

Implements WCAG 2.1 Focus Order and Keyboard Navigation compliance.

## Type Parameters

### T

`T` *extends* `HTMLElement` = `HTMLDivElement`

## Parameters

### active

`boolean`

Whether focus trapping is currently active.

### options?

[`UseFocusTrapOptions`](../interfaces/UseFocusTrapOptions.md) = `{}`

Configuration options for initial focus, escape handler, and focus restoration.

## Returns

`RefObject`\<`T` \| `null`\>

A RefObject to attach to the container element.
