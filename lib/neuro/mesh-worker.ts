/**
 * Web Worker for Offloading Cortical Surface Generation
 * Computes 25,000+ vertex spatial point checks and Desikan-Killiany atlas parcellations
 * and returns compiled buffers using zero-copy Transferable ArrayBuffers (Float32Array / Uint32Array).
 */

import { generateHemisphereBuffers } from "./mesh-generator";
import { HemisphereBufferTransfer, MeshWorkerRequest, MeshWorkerResponse } from "./types";

self.addEventListener("message", (event: MessageEvent<MeshWorkerRequest>) => {
  const { id, mode, hemiFilter, wireframe = false } = event.data;

  if (mode === "aseg") {
    const response: MeshWorkerResponse = {
      id,
      mode,
      hemiFilter,
      wireframe,
      buffers: [],
      isSubcortical: true,
    };
    (self as unknown as Worker).postMessage(response);
    return;
  }

  const buffers: HemisphereBufferTransfer[] = [];
  const transferables: ArrayBuffer[] = [];

  if (hemiFilter === "both" || hemiFilter === "lh") {
    const lhBuf = generateHemisphereBuffers("left", mode);
    buffers.push(lhBuf);
    transferables.push(
      lhBuf.positions.buffer as ArrayBuffer,
      lhBuf.normals.buffer as ArrayBuffer,
      lhBuf.colors.buffer as ArrayBuffer,
      lhBuf.indices.buffer as ArrayBuffer
    );
  }

  if (hemiFilter === "both" || hemiFilter === "rh") {
    const rhBuf = generateHemisphereBuffers("right", mode);
    buffers.push(rhBuf);
    transferables.push(
      rhBuf.positions.buffer as ArrayBuffer,
      rhBuf.normals.buffer as ArrayBuffer,
      rhBuf.colors.buffer as ArrayBuffer,
      rhBuf.indices.buffer as ArrayBuffer
    );
  }

  const response: MeshWorkerResponse = {
    id,
    mode,
    hemiFilter,
    wireframe,
    buffers,
    isSubcortical: false,
  };

  (self as unknown as Worker).postMessage(response, transferables as unknown as Transferable[]);
});
