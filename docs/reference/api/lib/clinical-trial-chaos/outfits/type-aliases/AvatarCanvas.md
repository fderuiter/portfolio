[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/clinical-trial-chaos/outfits](../README.md) / AvatarCanvas

# Type Alias: AvatarCanvas

> **AvatarCanvas** = `Pick`\<`CanvasRenderingContext2D`, `"fillStyle"` \| `"strokeStyle"` \| `"lineWidth"` \| `"fillRect"` \| `"beginPath"` \| `"arc"` \| `"fill"` \| `"moveTo"` \| `"lineTo"` \| `"stroke"`\>

The subset of the Canvas 2D API the avatar renderer needs, so it can be
driven by a real context or a lightweight test double.
