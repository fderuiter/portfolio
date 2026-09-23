[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/security-scan/types](../README.md) / SecretDetectorFixtureSet

# Interface: SecretDetectorFixtureSet

Safe (non-functional) positive and negative fixtures for a detector.

## Properties

### negative

> `readonly` **negative**: readonly `string`[]

Values that MUST NOT be reported by this detector.

***

### positive

> `readonly` **positive**: readonly `string`[]

Values that MUST be reported when scanned (and are not allowlisted).
