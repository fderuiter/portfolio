/**
 * NeuroRecon External Asset Loader & Cache
 * Loads real 3D brain models (GLB, GLTF, OBJ) and 2D MRI datasets with caching & fallback.
 */

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { createCorticalSurfaceMesh } from "./mesh-generator";
import { HemisphereFilter, SurfaceMode } from "./types";
import { progressBus } from "./progress-bus";

const meshCache = new Map<string, THREE.Group>();

/**
 * Load external 3D brain mesh model (.glb, .gltf, or .obj) with automatic centering and scale normalization.
 */
export async function loadExternalBrainMesh(
  modelUrl: string,
  mode: SurfaceMode = "pial",
  hemiFilter: HemisphereFilter = "both"
): Promise<THREE.Group> {
  const cacheKey = `${modelUrl}_${mode}_${hemiFilter}`;
  if (meshCache.has(cacheKey)) {
    const cached = meshCache.get(cacheKey)!;
    return cached.clone();
  }

  let lastLoaded = 0;
  let lastTotal = 0;

  const handleProgress = (event: ProgressEvent) => {
    const loaded = event?.loaded || 0;
    const total = event?.total || 0;
    lastLoaded = loaded;
    lastTotal = total;
    const percentage = total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0;
    progressBus.publish({
      url: modelUrl,
      loaded,
      total,
      percentage,
      status: "loading",
    });
  };

  // Publish initial loading state event
  progressBus.publish({
    url: modelUrl,
    loaded: 0,
    total: 0,
    percentage: 0,
    status: "loading",
  });

  try {
    const isObj = modelUrl.endsWith(".obj");
    const group = new THREE.Group();

    if (isObj) {
      const loader = new OBJLoader();
      const obj = await new Promise<THREE.Group>((resolve, reject) => {
        loader.load(modelUrl, resolve, handleProgress, reject);
      });

      // Apply standard clinical brain material
      const material = new THREE.MeshStandardMaterial({
        color: 0x93c5fd, // Light sky blue
        roughness: 0.35,
        metalness: 0.15,
        side: THREE.DoubleSide,
      });

      obj.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = material;
          child.geometry.computeVertexNormals();
        }
      });

      // Center and normalize scale
      const box = new THREE.Box3().setFromObject(obj);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 3.2 / (maxDim || 1);
      obj.scale.set(scale, scale, scale);

      const center = new THREE.Vector3();
      box.getCenter(center);
      obj.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

      group.add(obj);
    } else {
      // GLTF / GLB loader
      const loader = new GLTFLoader();
      const gltf = await new Promise<{ scene: THREE.Group }>((resolve, reject) => {
        loader.load(modelUrl, resolve, handleProgress, reject);
      });

      const model = gltf.scene;

      // Center and normalize scale
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 3.2 / (maxDim || 1);
      model.scale.set(scale, scale, scale);

      const center = new THREE.Vector3();
      box.getCenter(center);
      model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

      group.add(model);
    }

    const finalLoaded = lastTotal || lastLoaded;
    const finalTotal = lastTotal || lastLoaded;
    progressBus.publish({
      url: modelUrl,
      loaded: finalLoaded,
      total: finalTotal,
      percentage: 100,
      status: "complete",
    });

    meshCache.set(cacheKey, group);
    return group.clone();
  } catch (err) {
    progressBus.publish({
      url: modelUrl,
      loaded: lastLoaded,
      total: lastTotal,
      percentage: 0,
      status: "error",
      error: err instanceof Error ? err.message : String(err),
    });

    // Graceful fallback to procedural cortical surface mesh
    console.warn(`Failed to load external model from ${modelUrl}, falling back to procedural mesh:`, err);
    const fallback = createCorticalSurfaceMesh(mode, false, hemiFilter);
    meshCache.set(cacheKey, fallback);
    return fallback.clone();
  }
}
