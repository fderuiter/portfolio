[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [hooks/useStudioHashParams](../README.md) / useStudioHashParams

# Function: useStudioHashParams()

> **useStudioHashParams**(): `object`

Custom hook for synchronizing active studio tab and state with URL hash parameters.
Built with useSyncExternalStore for zero tearing and SSR hydration safety.

## Returns

`object`

### getParam

> **getParam**: (`key`, `defaultValue`) => `string`

#### Parameters

##### key

`string`

##### defaultValue?

`string` = `""`

#### Returns

`string`

### params

> **params**: `Record`\<`string`, `string`\>

### setParam

> **setParam**: (`key`, `value`, `options?`) => `void`

#### Parameters

##### key

`string`

##### value

`string` \| `null` \| `undefined`

##### options?

[`SetHashParamsOptions`](../interfaces/SetHashParamsOptions.md)

#### Returns

`void`

### setParams

> **setParams**: (`updates`, `options?`) => `void`

#### Parameters

##### updates

`Record`\<`string`, `string` \| `null` \| `undefined`\>

##### options?

[`SetHashParamsOptions`](../interfaces/SetHashParamsOptions.md)

#### Returns

`void`
