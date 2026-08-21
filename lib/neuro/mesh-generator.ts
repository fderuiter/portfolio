/**
 * Procedural High-Fidelity Cortical Surface Mesh Generator for NeuroRecon
 * Generates Pial, White Matter, Inflated, Subcortical (ASEG), and Desikan-Killiany Atlas (APARC)
 * dual-hemisphere 3D meshes with anatomical curvature and FreeSurfer ColorLUT parcellation.
 * Supports background Web Worker thread offloading via zero-copy Transferable ArrayBuffers (Float32Array).
 */

import * as THREE from "three";
import { clamp } from "../game-utils";
import {
  AnatomicalParcel,
  DESIKAN_KILLIANY_PARCELS,
  HemisphereBufferTransfer,
  HemisphereFilter,
  MeshWorkerRequest,
  MeshWorkerResponse,
  SurfaceMode,
} from "./types";

export interface MeshBundle {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  mesh: THREE.Mesh;
}

/**
 * Determine the Desikan-Killiany anatomical parcel for a 3D coordinate on a cerebral hemisphere.
 * Coordinates are in normalized Three.js model space.
 */
export function getAnatomicalParcelAtCoordinate(
  pos: { x: number; y: number; z: number },
  isLeft: boolean
): AnatomicalParcel {
  const x = Math.abs(pos.x);
  const y = pos.y;
  const z = pos.z;

  // Medial Wall & Cingulate Cortex
  if (x < 0.28) {
    if (y > 0.45 && z > -0.1) return DESIKAN_KILLIANY_PARCELS.rostralanteriorcingulate;
    if (y > 0.0 && y <= 0.45 && z > 0.1) return DESIKAN_KILLIANY_PARCELS.caudalanteriorcingulate;
    if (y < 0.0 && y >= -0.65 && z > 0.0) return DESIKAN_KILLIANY_PARCELS.posteriorcingulate;
    if (y < -0.65 && z > -0.2 && z < 0.3) return DESIKAN_KILLIANY_PARCELS.isthmuscingulate;
    if (y > 0.0 && z > 0.4) return DESIKAN_KILLIANY_PARCELS.paracentral;
    if (y < -0.5 && z > 0.2) return DESIKAN_KILLIANY_PARCELS.precuneus;
    if (y < -0.7 && z > 0.0) return DESIKAN_KILLIANY_PARCELS.cuneus;
    if (y < -0.6 && z <= 0.0) return DESIKAN_KILLIANY_PARCELS.pericalcarine;
    if (y < 0.0 && z <= -0.2) return DESIKAN_KILLIANY_PARCELS.parahippocampal || DESIKAN_KILLIANY_PARCELS.entorhinal;
    return DESIKAN_KILLIANY_PARCELS.superiorfrontal;
  }

  // Frontal Pole
  if (y > 1.15) {
    return DESIKAN_KILLIANY_PARCELS.frontalpole;
  }

  // Temporal Pole & Ventral Temporal
  if (z < -0.35 && y > 0.45) {
    return DESIKAN_KILLIANY_PARCELS.temporalpole;
  }

  // Ventral Stream (Fusiform & Entorhinal & Inferior Temporal)
  if (z < -0.45) {
    if (x < 0.55 && y > -0.3) return DESIKAN_KILLIANY_PARCELS.entorhinal;
    if (x < 0.75) return DESIKAN_KILLIANY_PARCELS.fusiform;
    return DESIKAN_KILLIANY_PARCELS.inferiortemporal;
  }

  // Orbitofrontal Ventral Floor
  if (z < -0.25 && y > 0.3) {
    if (x < 0.6) return DESIKAN_KILLIANY_PARCELS.medialorbitofrontal;
    return DESIKAN_KILLIANY_PARCELS.lateralorbitofrontal;
  }

  // Occipital Lobe (Posterior)
  if (y < -0.9) {
    if (z > 0.1 && x < 0.55) return DESIKAN_KILLIANY_PARCELS.cuneus;
    if (z <= 0.0 && x < 0.6) return DESIKAN_KILLIANY_PARCELS.lingual;
    return DESIKAN_KILLIANY_PARCELS.lateraloccipital;
  }

  // Lateral Temporal Lobe (Inferior to Sylvian Fissure)
  if (z <= 0.0 && z >= -0.55 && x > 0.75 && y > -0.85) {
    if (z > -0.2) return DESIKAN_KILLIANY_PARCELS.superiortemporal;
    if (z > -0.38) return DESIKAN_KILLIANY_PARCELS.middletemporal;
    return DESIKAN_KILLIANY_PARCELS.inferiortemporal;
  }

  // Central Sulcus Strip (Primary Motor & Primary Sensory)
  if (y >= -0.08 && y <= 0.22 && z > -0.15) {
    return DESIKAN_KILLIANY_PARCELS.precentral;
  }
  if (y >= -0.35 && y < -0.08 && z > -0.15) {
    return DESIKAN_KILLIANY_PARCELS.postcentral;
  }

  // Superior Dorsal Mantle (Frontal vs Parietal)
  if (z > 0.5) {
    if (y > 0.2) return DESIKAN_KILLIANY_PARCELS.superiorfrontal;
    if (y >= -0.35) return DESIKAN_KILLIANY_PARCELS.precentral;
    return DESIKAN_KILLIANY_PARCELS.superiorparietal;
  }

  // Lateral Frontal (Middle & Inferior Frontal Gyri)
  if (y > 0.22) {
    if (y > 0.75) return DESIKAN_KILLIANY_PARCELS.rostralmiddlefrontal;
    if (z > 0.15) return DESIKAN_KILLIANY_PARCELS.caudalmiddlefrontal;
    if (y > 0.45 && z > -0.1) return DESIKAN_KILLIANY_PARCELS.parstriangularis;
    if (y > 0.25 && z > -0.15) return DESIKAN_KILLIANY_PARCELS.parsopercularis;
    return DESIKAN_KILLIANY_PARCELS.parsorbitalis;
  }

  // Lateral Parietal Mantle
  if (y >= -0.9 && y < -0.35 && z > 0.0) {
    if (z > 0.35) return DESIKAN_KILLIANY_PARCELS.superiorparietal;
    if (y > -0.6) return DESIKAN_KILLIANY_PARCELS.supramarginal;
    return DESIKAN_KILLIANY_PARCELS.inferiorparietal;
  }

  // Lateral Temporal Lobe
  if (z <= 0.05 && z >= -0.45) {
    if (z > -0.15) return DESIKAN_KILLIANY_PARCELS.superiortemporal;
    if (z > -0.35) return DESIKAN_KILLIANY_PARCELS.middletemporal;
    return DESIKAN_KILLIANY_PARCELS.inferiortemporal;
  }

  // Default fallback
  return isLeft ? DESIKAN_KILLIANY_PARCELS.superiorfrontal : DESIKAN_KILLIANY_PARCELS.superiorfrontal;
}

/**
 * Generate raw typed array buffers for a single hemisphere (Left or Right)
 * Executes 12,500+ vertex spatial point checks, trigonometric folding calculations,
 * and Desikan-Killiany atlas parcellations into Float32Array and Uint32Array structures.
 */
export function generateHemisphereBuffers(
  hemi: "left" | "right",
  mode: SurfaceMode
): HemisphereBufferTransfer {
  const uSegments = 128; // Azimuth resolution
  const vSegments = 96; // Elevation resolution
  const isLeft = hemi === "left";
  const hemiSign = isLeft ? -1 : 1;

  const numVertices = (uSegments + 1) * (vSegments + 1); // 12,513 vertices
  const positions = new Float32Array(numVertices * 3);
  const rawNormals = new Float32Array(numVertices * 3);
  const colors = new Float32Array(numVertices * 3);
  const indices = new Uint32Array(uSegments * vSegments * 6); // 73,728 indices

  const baseScale = mode === "white" ? 0.92 : mode === "inflated" ? 1.06 : 1.0;

  let vIdx = 0;

  for (let j = 0; j <= vSegments; j++) {
    const theta = (j / vSegments) * Math.PI; // 0 to PI (Superior to Inferior)
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    for (let i = 0; i <= uSegments; i++) {
      // 0 to PI for single lateral/medial hemisphere dome
      const phi = (i / uSegments) * Math.PI;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);

      // Base ellipsoid dimensions (X: Left-Right, Y: Anterior-Posterior, Z: Superior-Inferior)
      const rx = 1.35 * baseScale;
      const ry = 1.85 * baseScale;
      const rz = 1.45 * baseScale;

      let x = rx * sinTheta * cosPhi * hemiSign + (isLeft ? -0.06 : 0.06);
      let y = ry * sinTheta * sinPhi - (ry * 0.5);
      let z = rz * cosTheta;

      // Temporal lobe anterior hook & Sylvian fissure indentation
      if (z < -0.1 && y > -0.3 && y < 0.6) {
        x += hemiSign * 0.22 * Math.sin((y + 0.3) * 3.0);
      }

      // Anatomical Primary Fissures (Central Sulcus, Lateral Fissure, Parieto-Occipital)
      let centralSulcusDepth = 0;
      if (y > -0.15 && y < 0.15 && z > -0.2) {
        const distToCentral = Math.abs(y - (0.05 + (z - 0.2) * 0.18));
        centralSulcusDepth = Math.exp(-Math.pow(distToCentral / 0.12, 2)) * 0.14;
      }

      let sylvianFissureDepth = 0;
      if (z > -0.4 && z < 0.15 && y > -0.4 && y < 0.5) {
        const distToSylvian = Math.abs(z - (-0.12 - (y - 0.1) * 0.25));
        sylvianFissureDepth = Math.exp(-Math.pow(distToSylvian / 0.14, 2)) * 0.18;
      }

      // Sulcal and gyral folding patterns
      let curvature = 0;
      if (mode !== "inflated") {
        const fold1 = Math.sin(x * 5.2) * Math.cos(y * 4.6);
        const fold2 = Math.sin(y * 6.4 + z * 4.2) * 0.65;
        const fold3 = Math.cos(x * 8.5 - z * 6.2) * 0.45;
        const fold4 = Math.sin(x * 12.0 + y * 8.0) * 0.18;
        const foldScale = mode === "white" ? 0.048 : 0.088;

        curvature = (fold1 + fold2 + fold3 + fold4) / 2.2; // [-1, 1]

        // Subtract primary fissure indentations
        curvature -= (centralSulcusDepth + sylvianFissureDepth) * 2.5;

        x += x * curvature * foldScale;
        y += y * curvature * foldScale;
        z += z * curvature * foldScale;
      } else {
        // Inflated surface displays smoothed geometry with underlying sulcal depth color
        const fold1 = Math.sin(x * 5.2) * Math.cos(y * 4.6);
        const fold2 = Math.sin(y * 6.4 + z * 4.2) * 0.65;
        curvature = (fold1 + fold2) / 1.65;
      }

      const pOffset = vIdx * 3;
      positions[pOffset] = x;
      positions[pOffset + 1] = y;
      positions[pOffset + 2] = z;

      // Normal vector approximation
      const len = Math.hypot(x, y, z) || 1;
      rawNormals[pOffset] = x / len;
      rawNormals[pOffset + 1] = y / len;
      rawNormals[pOffset + 2] = z / len;

      // Vertex color assignment
      if (mode === "aparc") {
        const parcel = getAnatomicalParcelAtCoordinate({ x, y, z }, isLeft);
        // Slightly shade according to sulcal curvature for realistic 3D parcel depth
        const depthShade = 0.85 + clamp(curvature * 0.2, -0.25, 0.25);
        colors[pOffset] = parcel.normRgb[0] * depthShade;
        colors[pOffset + 1] = parcel.normRgb[1] * depthShade;
        colors[pOffset + 2] = parcel.normRgb[2] * depthShade;
      } else {
        // Sulcal fundi (dark slate/gray) vs Gyral crests (bright cyan/blue)
        const normCurv = clamp((curvature + 1.2) / 2.4, 0, 1);
        let r = 0.16 + normCurv * 0.16;
        let g = 0.26 + normCurv * 0.48;
        let b = 0.42 + normCurv * 0.58;

        if (mode === "white") {
          r = 0.78 + normCurv * 0.14;
          g = 0.78 + normCurv * 0.14;
          b = 0.68 + normCurv * 0.12;
        }

        colors[pOffset] = r;
        colors[pOffset + 1] = g;
        colors[pOffset + 2] = b;
      }

      vIdx++;
    }
  }

  // Generate triangle indices
  let iIdx = 0;
  for (let j = 0; j < vSegments; j++) {
    for (let i = 0; i < uSegments; i++) {
      const a = j * (uSegments + 1) + i;
      const b = a + 1;
      const c = (j + 1) * (uSegments + 1) + i;
      const d = c + 1;

      if (isLeft) {
        indices[iIdx++] = a;
        indices[iIdx++] = b;
        indices[iIdx++] = d;
        indices[iIdx++] = a;
        indices[iIdx++] = d;
        indices[iIdx++] = c;
      } else {
        indices[iIdx++] = a;
        indices[iIdx++] = d;
        indices[iIdx++] = b;
        indices[iIdx++] = a;
        indices[iIdx++] = c;
        indices[iIdx++] = d;
      }
    }
  }

  return {
    hemi,
    positions,
    normals: rawNormals,
    colors,
    indices,
  };
}

/**
 * Construct Three.js BufferGeometry from compiled TypedArrays.
 */
export function createHemisphereGeometryFromBuffers(
  buf: HemisphereBufferTransfer
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(buf.positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(buf.normals, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(buf.colors, 3));
  geometry.setIndex(new THREE.Uint32BufferAttribute(buf.indices, 1));
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Construct THREE.Group from compiled Web Worker response object.
 */
export function createCorticalSurfaceMeshFromBuffers(
  response: MeshWorkerResponse
): THREE.Group {
  const group = new THREE.Group();

  if (response.isSubcortical || response.mode === "aseg") {
    group.add(createSubcorticalMesh(response.hemiFilter));
    return group;
  }

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: response.mode === "aparc" ? 0.45 : response.mode === "white" ? 0.3 : 0.35,
    metalness: response.mode === "aparc" ? 0.05 : 0.12,
    wireframe: response.wireframe,
    side: THREE.DoubleSide,
  });

  for (const buf of response.buffers) {
    const geometry = createHemisphereGeometryFromBuffers(buf);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = buf.hemi === "left" ? "lh_surface" : "rh_surface";
    group.add(mesh);
  }

  return group;
}

/**
 * Procedurally generates a FreeSurfer-style cortical surface mesh synchronously.
 */
export function createCorticalSurfaceMesh(
  mode: SurfaceMode = "pial",
  wireframe = false,
  hemiFilter: HemisphereFilter = "both"
): THREE.Group {
  const group = new THREE.Group();

  if (mode === "aseg") {
    group.add(createSubcorticalMesh(hemiFilter));
    return group;
  }

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: mode === "aparc" ? 0.45 : mode === "white" ? 0.3 : 0.35,
    metalness: mode === "aparc" ? 0.05 : 0.12,
    wireframe,
    side: THREE.DoubleSide,
  });

  if (hemiFilter === "both" || hemiFilter === "lh") {
    const buf = generateHemisphereBuffers("left", mode);
    const geometry = createHemisphereGeometryFromBuffers(buf);
    const leftMesh = new THREE.Mesh(geometry, material);
    leftMesh.name = "lh_surface";
    group.add(leftMesh);
  }

  if (hemiFilter === "both" || hemiFilter === "rh") {
    const buf = generateHemisphereBuffers("right", mode);
    const geometry = createHemisphereGeometryFromBuffers(buf);
    const rightMesh = new THREE.Mesh(geometry, material);
    rightMesh.name = "rh_surface";
    group.add(rightMesh);
  }

  return group;
}

// Background Web Worker Management & Async Interface
let workerInstance: Worker | null = null;
let requestCounter = 0;
const pendingRequests = new Map<string, (response: MeshWorkerResponse) => void>();

function getMeshWorker(): Worker | null {
  if (typeof window === "undefined" || typeof Worker === "undefined") {
    return null;
  }

  if (!workerInstance) {
    try {
      workerInstance = new Worker(new URL("./mesh-worker.ts", import.meta.url));
      workerInstance.onmessage = (event: MessageEvent<MeshWorkerResponse>) => {
        const { id } = event.data;
        if (!id) return;
        const callback = pendingRequests.get(id);
        if (callback) {
          pendingRequests.delete(id);
          callback(event.data);
        }
      };
      workerInstance.onerror = (err) => {
        console.warn("Mesh generator Web Worker error:", err);
        pendingRequests.clear();
      };
    } catch {
      workerInstance = null;
    }
  }

  return workerInstance;
}

/**
 * Offloads 25,000+ vertex spatial point checks and Desikan-Killiany atlas parcellations
 * to a background Web Worker thread, returning compiled THREE.Group with zero-copy Transferable ArrayBuffers.
 */
export async function createCorticalSurfaceMeshAsync(
  mode: SurfaceMode = "pial",
  wireframe = false,
  hemiFilter: HemisphereFilter = "both"
): Promise<THREE.Group> {
  const worker = getMeshWorker();

  if (!worker) {
    return createCorticalSurfaceMesh(mode, wireframe, hemiFilter);
  }

  return new Promise((resolve) => {
    const requestId = `mesh_req_${++requestCounter}`;

    const timeout = setTimeout(() => {
      if (pendingRequests.has(requestId)) {
        pendingRequests.delete(requestId);
        resolve(createCorticalSurfaceMesh(mode, wireframe, hemiFilter));
      }
    }, 1000);

    pendingRequests.set(requestId, (response: MeshWorkerResponse) => {
      clearTimeout(timeout);
      resolve(createCorticalSurfaceMeshFromBuffers(response));
    });

    const request: MeshWorkerRequest = {
      id: requestId,
      mode,
      hemiFilter,
      wireframe,
    };

    worker.postMessage(request);
  });
}

/**
 * Generate subcortical structures (Ventricles, Thalamus, Caudate, Putamen, Hippocampus, Amygdala, Brainstem)
 */
function createSubcorticalMesh(hemiFilter: HemisphereFilter = "both"): THREE.Group {
  const subGroup = new THREE.Group();

  const structures = [
    { name: "Left-Lateral-Ventricle", hemi: "lh", pos: [-0.38, 0.1, 0.15], scale: [0.22, 0.75, 0.28], color: 0x7890cd },
    { name: "Right-Lateral-Ventricle", hemi: "rh", pos: [0.38, 0.1, 0.15], scale: [0.22, 0.75, 0.28], color: 0x7890cd },
    { name: "Left-Thalamus", hemi: "lh", pos: [-0.35, -0.15, -0.05], scale: [0.32, 0.45, 0.35], color: 0x00760e },
    { name: "Right-Thalamus", hemi: "rh", pos: [0.35, -0.15, -0.05], scale: [0.32, 0.45, 0.35], color: 0x00760e },
    { name: "Left-Caudate", hemi: "lh", pos: [-0.55, 0.25, 0.2], scale: [0.22, 0.48, 0.25], color: 0x7aff88 },
    { name: "Right-Caudate", hemi: "rh", pos: [0.55, 0.25, 0.2], scale: [0.22, 0.48, 0.25], color: 0x7aff88 },
    { name: "Left-Putamen", hemi: "lh", pos: [-0.75, 0.05, -0.02], scale: [0.28, 0.55, 0.32], color: 0xeb4095 },
    { name: "Right-Putamen", hemi: "rh", pos: [0.75, 0.05, -0.02], scale: [0.28, 0.55, 0.32], color: 0xeb4095 },
    { name: "Left-Hippocampus", hemi: "lh", pos: [-0.62, -0.32, -0.38], scale: [0.2, 0.55, 0.2], color: 0xd0e83b },
    { name: "Right-Hippocampus", hemi: "rh", pos: [0.62, -0.32, -0.38], scale: [0.2, 0.55, 0.2], color: 0xd0e83b },
    { name: "Left-Amygdala", hemi: "lh", pos: [-0.58, 0.02, -0.36], scale: [0.18, 0.22, 0.18], color: 0x67a8ff },
    { name: "Right-Amygdala", hemi: "rh", pos: [0.58, 0.02, -0.36], scale: [0.18, 0.22, 0.18], color: 0x67a8ff },
    { name: "Brain-Stem", hemi: "both", pos: [0, -0.25, -0.75], scale: [0.45, 0.48, 0.75], color: 0x776655 },
  ];

  const baseGeo = new THREE.SphereGeometry(1, 32, 24);

  structures.forEach((s) => {
    if (hemiFilter !== "both" && s.hemi !== "both" && s.hemi !== hemiFilter) {
      return;
    }

    const mat = new THREE.MeshStandardMaterial({
      color: s.color,
      roughness: 0.3,
      metalness: 0.1,
    });
    const mesh = new THREE.Mesh(baseGeo, mat);
    mesh.name = s.name;
    mesh.position.set(s.pos[0], s.pos[1], s.pos[2]);
    mesh.scale.set(s.scale[0], s.scale[1], s.scale[2]);
    subGroup.add(mesh);
  });

  return subGroup;
}
