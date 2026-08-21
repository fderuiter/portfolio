/**
 * Web Worker for Offloading Cortical Surface Generation
 * Computes 25,000+ vertex spatial point checks and Desikan-Killiany atlas parcellations
 * and returns compiled buffers using zero-copy Transferable ArrayBuffers (Float32Array / Uint32Array).
 * Completely free of 3D graphics library runtime dependencies.
 */

import { generateHemisphereBuffers, generateSubcorticalBuffers } from "./mesh-generator";
import { MeshWorkerRequest, MeshWorkerResponse, RawGeometryBuffer } from "./types";

self.addEventListener("message", (event: MessageEvent<MeshWorkerRequest>) => {
  const { id, mode, hemiFilter, wireframe = false } = event.data;

  const buffers: RawGeometryBuffer[] = [];
  const transferables: ArrayBuffer[] = [];

  if (mode === "aseg") {
    const subBuffers = generateSubcorticalBuffers(hemiFilter);
    for (const buf of subBuffers) {
      buffers.push(buf);
      transferables.push(buf.positions.buffer as ArrayBuffer);
      if (buf.normals) transferables.push(buf.normals.buffer as ArrayBuffer);
      if (buf.colors) transferables.push(buf.colors.buffer as ArrayBuffer);
      transferables.push(buf.indices.buffer as ArrayBuffer);
    }

    const response: MeshWorkerResponse = {
      id,
      mode,
      hemiFilter,
      wireframe,
      buffers,
      isSubcortical: true,
    };
    (self as unknown as Worker).postMessage(response, transferables as unknown as Transferable[]);
    return;
  }

  if (hemiFilter === "both" || hemiFilter === "lh") {
    const lhBuf = generateHemisphereBuffers("left", mode);
    buffers.push({
      name: "lh_surface",
      hemi: "left",
      positions: lhBuf.positions,
      normals: lhBuf.normals,
      colors: lhBuf.colors,
      indices: lhBuf.indices,
    });
    transferables.push(
      lhBuf.positions.buffer as ArrayBuffer,
      lhBuf.normals.buffer as ArrayBuffer,
      lhBuf.colors.buffer as ArrayBuffer,
      lhBuf.indices.buffer as ArrayBuffer
    );
  }

  if (hemiFilter === "both" || hemiFilter === "rh") {
    const rhBuf = generateHemisphereBuffers("right", mode);
    buffers.push({
      name: "rh_surface",
      hemi: "right",
      positions: rhBuf.positions,
      normals: rhBuf.normals,
      colors: rhBuf.colors,
      indices: rhBuf.indices,
    });
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
