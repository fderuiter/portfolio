/**
 * NeuroRecon External Asset Loader & Cache
 * Loads real 3D brain models (GLB, GLTF, OBJ) and 2D MRI datasets with caching & fallback.
 */

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { createCorticalSurfaceMesh } from "./mesh-generator";
import { SurfaceMode } from "./types";

const meshCache = new Map<string, THREE.Group>();

/**
 * Load external 3D brain mesh model (.glb, .gltf, or .obj) with automatic centering and scale normalization.
 */
export async function loadExternalBrainMesh(
  modelUrl: string,
  mode: SurfaceMode = "pial"
): Promise<THREE.Group> {
  const cacheKey = `${modelUrl}_${mode}`;
  if (meshCache.has(cacheKey)) {
    const cached = meshCache.get(cacheKey)!;
    return cached.clone();
  }

  try {
    const isObj = modelUrl.endsWith(".obj");
    const group = new THREE.Group();

    if (isObj) {
      const loader = new OBJLoader();
      const obj = await new Promise<THREE.Group>((resolve, reject) => {
        loader.load(modelUrl, resolve, undefined, reject);
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
        loader.load(modelUrl, resolve, undefined, reject);
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

    meshCache.set(cacheKey, group);
    return group.clone();
  } catch (err) {
    // Graceful fallback to procedural cortical surface mesh
    console.warn(`Failed to load external model from ${modelUrl}, falling back to procedural mesh:`, err);
    return createCorticalSurfaceMesh(mode);
  }
}
