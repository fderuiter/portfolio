[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/logger](../README.md) / StructuredLogger

# Class: StructuredLogger

Centralized Telemetry Logger Wrapper.
Standardizes structured logging across client views, server components, and API routes.
Integrates error sanitization, Sentry error tracking, and telemetry event dispatching.

## Constructors

### Constructor

> **new StructuredLogger**(`options?`): `StructuredLogger`

#### Parameters

##### options?

[`LoggerOptions`](../interfaces/LoggerOptions.md) = `{}`

#### Returns

`StructuredLogger`

## Methods

### debug()

> **debug**(`message`, `meta?`): [`LogEntry`](../interfaces/LogEntry.md)

Logs a debug-level message with optional metadata.

#### Parameters

##### message

`string`

Primary log message description.

##### meta?

`Record`\<`string`, `unknown`\>

Optional metadata context object.

#### Returns

[`LogEntry`](../interfaces/LogEntry.md)

***

### error()

> **error**(`message`, `error?`, `meta?`): [`LogEntry`](../interfaces/LogEntry.md)

Logs an error-level message with optional error object and metadata context.

#### Parameters

##### message

`string`

Primary error summary description.

##### error?

`unknown`

Optional error object or cause.

##### meta?

`Record`\<`string`, `unknown`\>

Optional metadata context object.

#### Returns

[`LogEntry`](../interfaces/LogEntry.md)

***

### info()

> **info**(`message`, `meta?`): [`LogEntry`](../interfaces/LogEntry.md)

Logs an info-level message with optional metadata.

#### Parameters

##### message

`string`

Primary log message description.

##### meta?

`Record`\<`string`, `unknown`\>

Optional metadata context object.

#### Returns

[`LogEntry`](../interfaces/LogEntry.md)

***

### log()

> **log**(`level`, `message`, `error?`, `meta?`): [`LogEntry`](../interfaces/LogEntry.md)

Central dispatch method for structured logging.

#### Parameters

##### level

[`LogLevel`](../type-aliases/LogLevel.md)

Log severity level.

##### message

`string`

Log message text.

##### error?

`unknown`

Optional caught error or exception object.

##### meta?

`Record`\<`string`, `unknown`\>

Optional structured key-value metadata.

#### Returns

[`LogEntry`](../interfaces/LogEntry.md)

***

### warn()

> **warn**(`message`, `errorOrMeta?`, `meta?`): [`LogEntry`](../interfaces/LogEntry.md)

Logs a warning-level message with optional error or metadata.

#### Parameters

##### message

`string`

Primary log message description.

##### errorOrMeta?

`unknown`

Optional error instance, error description, or metadata object.

##### meta?

`Record`\<`string`, `unknown`\>

Optional metadata context object when second argument is an error.

#### Returns

[`LogEntry`](../interfaces/LogEntry.md)
