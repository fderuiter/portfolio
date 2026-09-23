[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/security-scan/types](../README.md) / SecretDetector

# Interface: SecretDetector

A single secret detector: its identity, its live-text regex, and its
pickaxe-compatible (`git log -G`) representation for history scanning.

## Properties

### appliesTo

> `readonly` **appliesTo**: readonly [`ScannerSurface`](../type-aliases/ScannerSurface.md)[]

***

### description

> `readonly` **description**: `string`

***

### gitPattern

> `readonly` **gitPattern**: `string`

POSIX extended-regex form consumed by `git log -G<pattern>`.

***

### id

> `readonly` **id**: `string`

***

### regex

> `readonly` **regex**: `RegExp`
