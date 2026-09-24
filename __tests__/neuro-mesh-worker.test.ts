import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  MeshWorkerRequest,
  MeshWorkerResponse,
  processMeshWorkerRequest,
  registerMeshWorker,
  type MeshWorkerTarget,
} from "@/lib/neuro";

function assertTransferablesMembership(
  response: MeshWorkerResponse,
  transferables: ArrayBuffer[]
) {
  expect(Array.isArray(transferables)).toBe(true);
  expect(transferables.length).toBeGreaterThan(0);
  for (const item of transferables) {
    expect(item).toBeInstanceOf(ArrayBuffer);
  }
  for (const buf of response.buffers) {
    expect(transferables).toContain(buf.positions.buffer);
    expect(transferables).toContain(buf.indices.buffer);
    if (buf.normals) expect(transferables).toContain(buf.normals.buffer);
    if (buf.colors) expect(transferables).toContain(buf.colors.buffer);
  }
}

describe("NeuroRecon Web Worker (lib/neuro/mesh-worker.ts) Test Suite", () => {
  let postMessageSpy: ReturnType<typeof vi.fn>;
  let unbindWorker: (() => void) | null = null;

  beforeEach(() => {
    postMessageSpy = vi.fn();
    (globalThis as unknown as { postMessage: unknown }).postMessage =
      postMessageSpy;
    unbindWorker = registerMeshWorker();
  });

  afterEach(() => {
    if (unbindWorker) {
      unbindWorker();
      unbindWorker = null;
    }
  });

  it("processes subcortical (aseg) mode request directly via public worker seam", () => {
    const req: MeshWorkerRequest = {
      id: "test_aseg_direct",
      mode: "aseg",
      hemiFilter: "both",
      wireframe: false,
    };

    const { response, transferables } = processMeshWorkerRequest(req);

    expect(response.id).toBe("test_aseg_direct");
    expect(response.mode).toBe("aseg");
    expect(response.isSubcortical).toBe(true);
    expect(response.buffers.length).toBeGreaterThan(0);

    assertTransferablesMembership(response, transferables);
  });

  it("posts worker replies through the registered target", () => {
    const responses: MeshWorkerResponse[] = [];
    let receivedTransferables: Transferable[] = [];
    const target: MeshWorkerTarget = Object.assign(new EventTarget(), {
      postMessage: (
        response: MeshWorkerResponse,
        transferables: Transferable[]
      ) => {
        responses.push(response);
        receivedTransferables = transferables;
      },
    });
    const unbind = registerMeshWorker(target);

    target.dispatchEvent(
      new MessageEvent("message", {
        data: {
          id: "custom-target-aseg",
          mode: "aseg",
          hemiFilter: "lh",
        } satisfies MeshWorkerRequest,
      })
    );

    expect(responses).toHaveLength(1);
    expect(responses[0].id).toBe("custom-target-aseg");
    expect(receivedTransferables.length).toBeGreaterThan(0);
    expect(
      receivedTransferables.every((item) => item instanceof ArrayBuffer)
    ).toBe(true);
    expect(postMessageSpy).not.toHaveBeenCalled();

    unbind();
  });

  it("handles subcortical (aseg) mode across both, lh, and rh hemisphere filters", () => {
    const filters = ["both", "lh", "rh"] as const;
    for (const hemiFilter of filters) {
      postMessageSpy.mockClear();
      const req: MeshWorkerRequest = {
        id: `test_aseg_${hemiFilter}`,
        mode: "aseg",
        hemiFilter,
        wireframe: false,
      };

      globalThis.dispatchEvent(new MessageEvent("message", { data: req }));

      expect(postMessageSpy).toHaveBeenCalledTimes(1);
      const [response, transferables] = postMessageSpy.mock.calls[0] as [
        MeshWorkerResponse,
        ArrayBuffer[],
      ];

      expect(response.id).toBe(`test_aseg_${hemiFilter}`);
      expect(response.mode).toBe("aseg");
      expect(response.hemiFilter).toBe(hemiFilter);
      expect(response.isSubcortical).toBe(true);
      expect(response.buffers.length).toBeGreaterThan(0);

      for (const buf of response.buffers) {
        expect(buf.positions).toBeInstanceOf(Float32Array);
        expect(buf.positions.length).toBeGreaterThan(0);
        expect(buf.indices).toBeInstanceOf(Uint32Array);
        expect(buf.indices.length).toBeGreaterThan(0);
        if (buf.normals) {
          expect(buf.normals).toBeInstanceOf(Float32Array);
          expect(buf.normals.length).toBe(buf.positions.length);
        }
        if (buf.colors) {
          expect(buf.colors).toBeInstanceOf(Float32Array);
          expect(buf.colors.length).toBe(buf.positions.length);
        }
      }

      assertTransferablesMembership(response, transferables);
    }
  });

  it("handles cortical surface mode (pial) across both, lh, and rh hemisphere filters and validates positions, normals, colors", () => {
    const cases = [
      { hemiFilter: "both", expectedBuffers: 2, expectedTransferables: 8 },
      { hemiFilter: "lh", expectedBuffers: 1, expectedTransferables: 4 },
      { hemiFilter: "rh", expectedBuffers: 1, expectedTransferables: 4 },
    ] as const;

    for (const c of cases) {
      postMessageSpy.mockClear();
      const req: MeshWorkerRequest = {
        id: `test_pial_${c.hemiFilter}`,
        mode: "pial",
        hemiFilter: c.hemiFilter,
        wireframe: true,
      };

      globalThis.dispatchEvent(new MessageEvent("message", { data: req }));

      expect(postMessageSpy).toHaveBeenCalledTimes(1);
      const [response, transferables] = postMessageSpy.mock.calls[0] as [
        MeshWorkerResponse,
        ArrayBuffer[],
      ];

      expect(response.id).toBe(`test_pial_${c.hemiFilter}`);
      expect(response.mode).toBe("pial");
      expect(response.hemiFilter).toBe(c.hemiFilter);
      expect(response.wireframe).toBe(true);
      expect(response.isSubcortical).toBe(false);
      expect(response.buffers.length).toBe(c.expectedBuffers);
      expect(transferables.length).toBe(c.expectedTransferables);

      for (const buf of response.buffers) {
        expect(buf.positions).toBeInstanceOf(Float32Array);
        expect(buf.positions.length).toBeGreaterThan(25000);
        expect(buf.normals).toBeInstanceOf(Float32Array);
        expect(buf.normals!.length).toBe(buf.positions.length);
        expect(buf.colors).toBeInstanceOf(Float32Array);
        expect(buf.colors!.length).toBe(buf.positions.length);
        expect(buf.indices).toBeInstanceOf(Uint32Array);
        expect(buf.indices.length).toBeGreaterThan(0);
      }

      assertTransferablesMembership(response, transferables);
    }
  });

  it("handles cortical surface mode (white) across both, lh, and rh hemisphere filters and validates positions, normals, colors", () => {
    const cases = [
      { hemiFilter: "both", expectedBuffers: 2, expectedTransferables: 8 },
      { hemiFilter: "lh", expectedBuffers: 1, expectedTransferables: 4 },
      { hemiFilter: "rh", expectedBuffers: 1, expectedTransferables: 4 },
    ] as const;

    for (const c of cases) {
      postMessageSpy.mockClear();
      const req: MeshWorkerRequest = {
        id: `test_white_${c.hemiFilter}`,
        mode: "white",
        hemiFilter: c.hemiFilter,
        wireframe: false,
      };

      globalThis.dispatchEvent(new MessageEvent("message", { data: req }));

      expect(postMessageSpy).toHaveBeenCalledTimes(1);
      const [response, transferables] = postMessageSpy.mock.calls[0] as [
        MeshWorkerResponse,
        ArrayBuffer[],
      ];

      expect(response.id).toBe(`test_white_${c.hemiFilter}`);
      expect(response.mode).toBe("white");
      expect(response.hemiFilter).toBe(c.hemiFilter);
      expect(response.isSubcortical).toBe(false);
      expect(response.buffers.length).toBe(c.expectedBuffers);
      expect(transferables.length).toBe(c.expectedTransferables);

      for (const buf of response.buffers) {
        expect(buf.positions).toBeInstanceOf(Float32Array);
        expect(buf.positions.length).toBeGreaterThan(25000);
        expect(buf.normals).toBeInstanceOf(Float32Array);
        expect(buf.normals!.length).toBe(buf.positions.length);
        expect(buf.colors).toBeInstanceOf(Float32Array);
        expect(buf.colors!.length).toBe(buf.positions.length);
        expect(buf.indices).toBeInstanceOf(Uint32Array);
        expect(buf.indices.length).toBeGreaterThan(0);
      }

      assertTransferablesMembership(response, transferables);
    }
  });

  it("handles cortical surface mode (inflated) across both, lh, and rh hemisphere filters and validates positions, normals, colors", () => {
    const cases = [
      { hemiFilter: "both", expectedBuffers: 2, expectedTransferables: 8 },
      { hemiFilter: "lh", expectedBuffers: 1, expectedTransferables: 4 },
      { hemiFilter: "rh", expectedBuffers: 1, expectedTransferables: 4 },
    ] as const;

    for (const c of cases) {
      postMessageSpy.mockClear();
      const req: MeshWorkerRequest = {
        id: `test_inflated_${c.hemiFilter}`,
        mode: "inflated",
        hemiFilter: c.hemiFilter,
      };

      globalThis.dispatchEvent(new MessageEvent("message", { data: req }));

      expect(postMessageSpy).toHaveBeenCalledTimes(1);
      const [response, transferables] = postMessageSpy.mock.calls[0] as [
        MeshWorkerResponse,
        ArrayBuffer[],
      ];

      expect(response.id).toBe(`test_inflated_${c.hemiFilter}`);
      expect(response.mode).toBe("inflated");
      expect(response.hemiFilter).toBe(c.hemiFilter);
      expect(response.isSubcortical).toBe(false);
      expect(response.buffers.length).toBe(c.expectedBuffers);
      expect(transferables.length).toBe(c.expectedTransferables);

      for (const buf of response.buffers) {
        expect(buf.positions).toBeInstanceOf(Float32Array);
        expect(buf.positions.length).toBeGreaterThan(25000);
        expect(buf.normals).toBeInstanceOf(Float32Array);
        expect(buf.normals!.length).toBe(buf.positions.length);
        expect(buf.colors).toBeInstanceOf(Float32Array);
        expect(buf.colors!.length).toBe(buf.positions.length);
        expect(buf.indices).toBeInstanceOf(Uint32Array);
        expect(buf.indices.length).toBeGreaterThan(0);
      }

      assertTransferablesMembership(response, transferables);
    }
  });

  it("handles Desikan-Killiany atlas parcellation mode (aparc) across both, lh, and rh hemisphere filters and validates positions, normals, colors", () => {
    const cases = [
      { hemiFilter: "both", expectedBuffers: 2, expectedTransferables: 8 },
      { hemiFilter: "lh", expectedBuffers: 1, expectedTransferables: 4 },
      { hemiFilter: "rh", expectedBuffers: 1, expectedTransferables: 4 },
    ] as const;

    for (const c of cases) {
      postMessageSpy.mockClear();
      const req: MeshWorkerRequest = {
        id: `test_aparc_${c.hemiFilter}`,
        mode: "aparc",
        hemiFilter: c.hemiFilter,
      };

      globalThis.dispatchEvent(new MessageEvent("message", { data: req }));

      expect(postMessageSpy).toHaveBeenCalledTimes(1);
      const [response, transferables] = postMessageSpy.mock.calls[0] as [
        MeshWorkerResponse,
        ArrayBuffer[],
      ];

      expect(response.id).toBe(`test_aparc_${c.hemiFilter}`);
      expect(response.mode).toBe("aparc");
      expect(response.hemiFilter).toBe(c.hemiFilter);
      expect(response.isSubcortical).toBe(false);
      expect(response.buffers.length).toBe(c.expectedBuffers);
      expect(transferables.length).toBe(c.expectedTransferables);

      for (const buf of response.buffers) {
        expect(buf.positions).toBeInstanceOf(Float32Array);
        expect(buf.positions.length).toBeGreaterThan(25000);
        expect(buf.normals).toBeInstanceOf(Float32Array);
        expect(buf.normals!.length).toBe(buf.positions.length);
        expect(buf.colors).toBeInstanceOf(Float32Array);
        expect(buf.colors!.length).toBe(buf.positions.length);
        expect(buf.indices).toBeInstanceOf(Uint32Array);
        expect(buf.indices.length).toBeGreaterThan(0);
      }

      assertTransferablesMembership(response, transferables);
    }
  });
});
