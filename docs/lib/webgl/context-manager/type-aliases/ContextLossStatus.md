[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/webgl/context-manager](../README.md) / ContextLossStatus

# Type Alias: ContextLossStatus

> **ContextLossStatus** = `"idle"` \| `"lost"` \| `"restoring"` \| `"restored"`

Defined in: [lib/webgl/context-manager.ts:9](https://github.com/fderuiter/portfolio/blob/main/lib/webgl/context-manager.ts#L9)

WebGL and Canvas 2D Context Loss Lifecycle Manager

Provides isolated event handling for webglcontextlost, webglcontextrestored,
contextlost, and contextrestored events to protect rendering pipelines from GPU
interruptions, laptop power-saving switches, and mobile tab suspension.
