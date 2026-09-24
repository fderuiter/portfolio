import { describe, it, expect, vi, beforeEach } from "vitest";
import { MeshWorkerRequest, MeshWorkerResponse } from "@/lib/neuro/types";

describe("NeuroRecon Web Worker (lib/neuro/mesh-worker.ts) Test Suite", () => {
  let postMessageSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    postMessageSpy = vi.fn();
    (globalThis as unknown as { postMessage: unknown }).postMessage =
      postMessageSpy;
  });

  // Import worker to register the "message" event listener on self/globalThis
  it("registers message event listener and processes subcortical (aseg) mode for both hemispheres", async () => {
    await import("@/lib/neuro/mesh-worker");

    const req: MeshWorkerRequest = {
      id: "test_aseg_both",
      mode: "aseg",
      hemiFilter: "both",
      wireframe: false,
    };

    globalThis.dispatchEvent(new MessageEvent("message", { data: req }));

    expect(postMessageSpy).toHaveBeenCalledTimes(1);

    const [response, transferables] = postMessageSpy.mock.calls[0] as [
      MeshWorkerResponse,
      ArrayBuffer[],
    ];

    expect(response.id).toBe("test_aseg_both");
    expect(response.mode).toBe("aseg");
    expect(response.hemiFilter).toBe("both");
    expect(response.wireframe).toBe(false);
    expect(response.isSubcortical).toBe(true);

    // Should return subcortical buffers
    expect(response.buffers.length).toBeGreaterThan(0);
    for (const buf of response.buffers) {
      expect(buf.positions).toBeInstanceOf(Float32Array);
      expect(buf.positions.length).toBeGreaterThan(0);

      if (buf.normals) {
        expect(buf.normals).toBeInstanceOf(Float32Array);
        expect(buf.normals.length).toBe(buf.positions.length);
      }

      expect(buf.indices).toBeInstanceOf(Uint32Array);
      expect(buf.indices.length).toBeGreaterThan(0);
    }

    // Verify ArrayBuffer transferables list
    expect(Array.isArray(transferables)).toBe(true);
    expect(transferables.length).toBeGreaterThan(0);
    for (const item of transferables) {
      expect(item).toBeInstanceOf(ArrayBuffer);
    }
  });

  it("handles subcortical (aseg) mode with hemisphere filter (lh)", async () => {
    const req: MeshWorkerRequest = {
      id: "test_aseg_lh",
      mode: "aseg",
      hemiFilter: "lh",
    };

    globalThis.dispatchEvent(new MessageEvent("message", { data: req }));

    expect(postMessageSpy).toHaveBeenCalledTimes(1);

    const [response, transferables] = postMessageSpy.mock.calls[0] as [
      MeshWorkerResponse,
      ArrayBuffer[],
    ];

    expect(response.id).toBe("test_aseg_lh");
    expect(response.mode).toBe("aseg");
    expect(response.hemiFilter).toBe("lh");
    expect(response.wireframe).toBe(false); // Default value when wireframe is undefined
    expect(response.isSubcortical).toBe(true);

    expect(response.buffers.length).toBeGreaterThan(0);
    expect(transferables.length).toBeGreaterThan(0);
  });

  it("handles cortical surface mode (pial) for both hemispheres and validates positions, normals, colors", async () => {
    const req: MeshWorkerRequest = {
      id: "test_pial_both",
      mode: "pial",
      hemiFilter: "both",
      wireframe: true,
    };

    globalThis.dispatchEvent(new MessageEvent("message", { data: req }));

    expect(postMessageSpy).toHaveBeenCalledTimes(1);

    const [response, transferables] = postMessageSpy.mock.calls[0] as [
      MeshWorkerResponse,
      ArrayBuffer[],
    ];

    expect(response.id).toBe("test_pial_both");
    expect(response.mode).toBe("pial");
    expect(response.hemiFilter).toBe("both");
    expect(response.wireframe).toBe(true);
    expect(response.isSubcortical).toBe(false);

    expect(response.buffers.length).toBe(2);

    const leftBuf = response.buffers.find((b) => b.hemi === "left");
    const rightBuf = response.buffers.find((b) => b.hemi === "right");

    expect(leftBuf).toBeDefined();
    expect(rightBuf).toBeDefined();

    expect(leftBuf!.name).toBe("lh_surface");
    expect(leftBuf!.positions).toBeInstanceOf(Float32Array);
    expect(leftBuf!.normals).toBeInstanceOf(Float32Array);
    expect(leftBuf!.colors).toBeInstanceOf(Float32Array);
    expect(leftBuf!.indices).toBeInstanceOf(Uint32Array);

    expect(rightBuf!.name).toBe("rh_surface");
    expect(rightBuf!.positions).toBeInstanceOf(Float32Array);
    expect(rightBuf!.normals).toBeInstanceOf(Float32Array);
    expect(rightBuf!.colors).toBeInstanceOf(Float32Array);
    expect(rightBuf!.indices).toBeInstanceOf(Uint32Array);

    // Each cortical hemisphere has 12,513 vertices (positions.length = 37,539)
    expect(leftBuf!.positions.length).toBeGreaterThan(25000);
    expect(leftBuf!.normals!.length).toBe(leftBuf!.positions.length);
    expect(leftBuf!.colors!.length).toBe(leftBuf!.positions.length);

    // Transferables array should hold 4 ArrayBuffers per hemisphere (8 total)
    expect(transferables.length).toBe(8);
    for (const buf of response.buffers) {
      expect(transferables).toContain(buf.positions.buffer);
      expect(transferables).toContain(buf.normals!.buffer);
      expect(transferables).toContain(buf.colors!.buffer);
      expect(transferables).toContain(buf.indices.buffer);
    }
  });

  it("handles cortical surface mode (white) with left-hemisphere filter (lh)", async () => {
    const req: MeshWorkerRequest = {
      id: "test_white_lh",
      mode: "white",
      hemiFilter: "lh",
      wireframe: false,
    };

    globalThis.dispatchEvent(new MessageEvent("message", { data: req }));

    expect(postMessageSpy).toHaveBeenCalledTimes(1);

    const [response, transferables] = postMessageSpy.mock.calls[0] as [
      MeshWorkerResponse,
      ArrayBuffer[],
    ];

    expect(response.id).toBe("test_white_lh");
    expect(response.mode).toBe("white");
    expect(response.hemiFilter).toBe("lh");
    expect(response.isSubcortical).toBe(false);

    expect(response.buffers.length).toBe(1);
    expect(response.buffers[0].hemi).toBe("left");
    expect(response.buffers[0].name).toBe("lh_surface");
    expect(response.buffers[0].positions).toBeInstanceOf(Float32Array);
    expect(response.buffers[0].normals).toBeInstanceOf(Float32Array);

    expect(transferables.length).toBe(4);
  });

  it("handles cortical surface mode (inflated) with right-hemisphere filter (rh)", async () => {
    const req: MeshWorkerRequest = {
      id: "test_inflated_rh",
      mode: "inflated",
      hemiFilter: "rh",
    };

    globalThis.dispatchEvent(new MessageEvent("message", { data: req }));

    expect(postMessageSpy).toHaveBeenCalledTimes(1);

    const [response, transferables] = postMessageSpy.mock.calls[0] as [
      MeshWorkerResponse,
      ArrayBuffer[],
    ];

    expect(response.id).toBe("test_inflated_rh");
    expect(response.mode).toBe("inflated");
    expect(response.hemiFilter).toBe("rh");
    expect(response.isSubcortical).toBe(false);

    expect(response.buffers.length).toBe(1);
    expect(response.buffers[0].hemi).toBe("right");
    expect(response.buffers[0].name).toBe("rh_surface");
    expect(response.buffers[0].positions).toBeInstanceOf(Float32Array);
    expect(response.buffers[0].normals).toBeInstanceOf(Float32Array);

    expect(transferables.length).toBe(4);
  });

  it("handles Desikan-Killiany atlas parcellation mode (aparc) for both hemispheres", async () => {
    const req: MeshWorkerRequest = {
      id: "test_aparc_both",
      mode: "aparc",
      hemiFilter: "both",
    };

    globalThis.dispatchEvent(new MessageEvent("message", { data: req }));

    expect(postMessageSpy).toHaveBeenCalledTimes(1);

    const [response, transferables] = postMessageSpy.mock.calls[0] as [
      MeshWorkerResponse,
      ArrayBuffer[],
    ];

    expect(response.id).toBe("test_aparc_both");
    expect(response.mode).toBe("aparc");
    expect(response.hemiFilter).toBe("both");
    expect(response.isSubcortical).toBe(false);

    expect(response.buffers.length).toBe(2);
    expect(transferables.length).toBe(8);

    for (const buf of response.buffers) {
      expect(buf.positions).toBeInstanceOf(Float32Array);
      expect(buf.colors).toBeInstanceOf(Float32Array);
      expect(buf.colors!.length).toBe(buf.positions.length);
    }
  });
});
