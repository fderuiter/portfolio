[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [hooks/useFontPreference](../README.md) / useFontPreference

# Function: useFontPreference()

> **useFontPreference**(): [`FontPreferenceReturn`](../interfaces/FontPreferenceReturn.md)

Manages persistent typography mode preference (default Atkinson/Lexend vs OpenDyslexic).
Automatically updates data-font-mode attribute on document.documentElement
and clears userland Pretext caches to trigger zero-CLS text reflow.

## Returns

[`FontPreferenceReturn`](../interfaces/FontPreferenceReturn.md)
