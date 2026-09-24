/**
 * Web Worker for Offloading Cortical Surface Generation
 * Computes 25,000+ vertex spatial point checks and Desikan-Killiany atlas parcellations
 * and returns compiled buffers using zero-copy Transferable ArrayBuffers (Float32Array / Uint32Array).
 * Completely free of 3D graphics library runtime dependencies.
 */

import {
  generateHemisphereBuffers,
  generateSubcorticalBuffers,
} from "./mesh-generator";
import {
  MeshWorkerRequest,
  MeshWorkerResponse,
  RawGeometryBuffer,
} from "./types";

/**
 * Core handler processing a single MeshWorkerRequest payload and computing geometry buffers with zero-copy transferables.
 */
export function processMeshWorkerRequest(req: MeshWorkerRequest): {
  response: MeshWorkerResponse;
  transferables: ArrayBuffer[];
} {
  const { id, mode, hemiFilter, wireframe = false } = req;

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
    return { response, transferables };
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

  return { response, transferables };
}

/**
 * Event listener callback that handles incoming MessageEvent requests and posts worker responses.
 */
export function handleMeshWorkerMessage(
  event: MessageEvent<MeshWorkerRequest>
): void {
  if (!event.data || typeof event.data !== "object") return;
  const { response, transferables } = processMeshWorkerRequest(event.data);
  (self as unknown as Worker).postMessage(
    response,
    transferables as unknown as Transferable[]
  );
}

/**
 * Registers the mesh worker message listener on a target event scope (defaulting to self/globalThis).
 */
export function registerMeshWorker(
  target: EventTarget = typeof self !== "undefined" ? self : globalThis
): () => void {
  const listener = (event: Event) => {
    handleMeshWorkerMessage(event as MessageEvent<MeshWorkerRequest>);
  };
  target.addEventListener("message", listener);
  return () => {
    target.removeEventListener("message", listener);
  };
}

if (
  typeof self !== "undefined" &&
  typeof (self as unknown as { importScripts?: unknown }).importScripts ===
    "function"
) {
  registerMeshWorker(self);
}
