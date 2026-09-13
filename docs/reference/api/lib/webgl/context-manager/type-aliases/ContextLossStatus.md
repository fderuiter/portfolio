[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/webgl/context-manager](../README.md) / ContextLossStatus

# Type Alias: ContextLossStatus

> **ContextLossStatus** = `"idle"` \| `"lost"` \| `"restoring"` \| `"restored"`

WebGL and Canvas 2D Context Loss Lifecycle Manager

Provides isolated event handling for webglcontextlost, webglcontextrestored,
contextlost, and contextrestored events to protect rendering pipelines from GPU
interruptions, laptop power-saving switches, and mobile tab suspension.
