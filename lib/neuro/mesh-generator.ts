/**
 * Procedural 3D Cortical Surface Mesh Generator for NeuroRecon
 * Generates Pial, White Matter, Inflated, and Subcortical (ASEG) meshes with
 * anatomical curvature vertex coloring (sulcal vs gyral depth).
 */

import * as THREE from "three";
import { SurfaceMode } from "./types";

export interface MeshBundle {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  mesh: THREE.Mesh;
}

/**
 * Procedurally generates a FreeSurfer-style cortical surface mesh.
 */
export function createCorticalSurfaceMesh(
  mode: SurfaceMode = "pial",
  wireframe = false
): THREE.Group {
  const group = new THREE.Group();

  if (mode === "aseg") {
    // Generate subcortical structures
    group.add(createSubcorticalMesh());
    return group;
  }

  // Left and Right Hemispheres
  const leftHemi = createHemisphereGeometry("left", mode);
  const rightHemi = createHemisphereGeometry("right", mode);

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.35,
    metalness: 0.15,
    wireframe,
    side: THREE.DoubleSide,
  });

  const leftMesh = new THREE.Mesh(leftHemi, material);
  const rightMesh = new THREE.Mesh(rightHemi, material);

  group.add(leftMesh);
  group.add(rightMesh);

  return group;
}

/**
 * Generate a single hemisphere surface mesh (Left or Right)
 */
function createHemisphereGeometry(
  hemi: "left" | "right",
  mode: SurfaceMode
): THREE.BufferGeometry {
  const uSegments = 64;
  const vSegments = 48;
  const isLeft = hemi === "left";
  const hemiSign = isLeft ? -1 : 1;

  const positions: number[] = [];
  const normals: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  const baseScale = mode === "white" ? 0.92 : mode === "inflated" ? 1.05 : 1.0;

  for (let j = 0; j <= vSegments; j++) {
    const theta = (j / vSegments) * Math.PI; // 0 to PI (Superior to Inferior)
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    for (let i = 0; i <= uSegments; i++) {
      // 0 to PI for a single hemisphere
      const phi = (i / uSegments) * Math.PI; // 0 to PI
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
        x += hemiSign * 0.18 * Math.sin((y + 0.3) * 3.0);
      }

      // Sulcal and gyral folding patterns
      let curvature = 0;
      if (mode !== "inflated") {
        const fold1 = Math.sin(x * 5.0) * Math.cos(y * 4.5);
        const fold2 = Math.sin(y * 6.0 + z * 4.0) * 0.6;
        const fold3 = Math.cos(x * 8.0 - z * 6.0) * 0.4;
        const foldScale = mode === "white" ? 0.05 : 0.085;

        curvature = (fold1 + fold2 + fold3) / 2.0; // [-1, 1]

        x += x * curvature * foldScale;
        y += y * curvature * foldScale;
        z += z * curvature * foldScale;
      } else {
        // Inflated surface displays smoothed geometry with underlying sulcal depth color
        const fold1 = Math.sin(x * 5.0) * Math.cos(y * 4.5);
        const fold2 = Math.sin(y * 6.0 + z * 4.0) * 0.6;
        curvature = (fold1 + fold2) / 1.6;
      }

      positions.push(x, y, z);

      // Normal approximation
      const n = new THREE.Vector3(x, y, z).normalize();
      normals.push(n.x, n.y, n.z);

      // Vertex color based on sulcal depth / curvature
      // Sulcal fundi (dark slate/gray) vs Gyral crests (bright cyan/blue)
      const normCurv = Math.max(0, Math.min(1, (curvature + 1) / 2));
      let r = 0.18 + normCurv * 0.15;
      let g = 0.28 + normCurv * 0.45;
      let b = 0.42 + normCurv * 0.55;

      if (mode === "white") {
        r = 0.75 + normCurv * 0.15;
        g = 0.75 + normCurv * 0.15;
        b = 0.65 + normCurv * 0.1;
      }

      colors.push(r, g, b);
    }
  }

  // Generate triangle indices
  for (let j = 0; j < vSegments; j++) {
    for (let i = 0; i < uSegments; i++) {
      const a = j * (uSegments + 1) + i;
      const b = a + 1;
      const c = (j + 1) * (uSegments + 1) + i;
      const d = c + 1;

      if (isLeft) {
        indices.push(a, b, d);
        indices.push(a, d, c);
      } else {
        indices.push(a, d, b);
        indices.push(a, c, d);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Generate subcortical structures (Ventricles, Thalamus, Caudate, Putamen, Hippocampus)
 */
function createSubcorticalMesh(): THREE.Group {
  const subGroup = new THREE.Group();

  // Color lookup table matching FreeSurfer ColorLUT
  const structures = [
    // Lateral Ventricles (Bright blue)
    { name: "Left-Lateral-Ventricle", pos: [-0.4, 0.1, 0.15], scale: [0.22, 0.75, 0.28], color: 0x7890cd },
    { name: "Right-Lateral-Ventricle", pos: [0.4, 0.1, 0.15], scale: [0.22, 0.75, 0.28], color: 0x7890cd },
    // Thalamus (Green)
    { name: "Left-Thalamus", pos: [-0.35, -0.15, -0.05], scale: [0.32, 0.45, 0.35], color: 0x00760e },
    { name: "Right-Thalamus", pos: [0.35, -0.15, -0.05], scale: [0.32, 0.45, 0.35], color: 0x00760e },
    // Caudate Nucleus (Cyan)
    { name: "Left-Caudate", pos: [-0.55, 0.25, 0.2], scale: [0.22, 0.48, 0.25], color: 0x7aff88 },
    { name: "Right-Caudate", pos: [0.55, 0.25, 0.2], scale: [0.22, 0.48, 0.25], color: 0x7aff88 },
    // Putamen (Pink/Magenta)
    { name: "Left-Putamen", pos: [-0.75, 0.05, -0.02], scale: [0.28, 0.55, 0.32], color: 0xeb4095 },
    { name: "Right-Putamen", pos: [0.75, 0.05, -0.02], scale: [0.28, 0.55, 0.32], color: 0xeb4095 },
    // Hippocampus (Yellow)
    { name: "Left-Hippocampus", pos: [-0.62, -0.32, -0.38], scale: [0.2, 0.55, 0.2], color: 0xd0e83b },
    { name: "Right-Hippocampus", pos: [0.62, -0.32, -0.38], scale: [0.2, 0.55, 0.2], color: 0xd0e83b },
    // Brainstem (Gray/Tan)
    { name: "Brain-Stem", pos: [0, -0.25, -0.75], scale: [0.45, 0.48, 0.75], color: 0x776655 },
  ];

  const baseGeo = new THREE.SphereGeometry(1, 24, 20);

  structures.forEach((s) => {
    const mat = new THREE.MeshStandardMaterial({
      color: s.color,
      roughness: 0.3,
      metalness: 0.1,
    });
    const mesh = new THREE.Mesh(baseGeo, mat);
    mesh.position.set(s.pos[0], s.pos[1], s.pos[2]);
    mesh.scale.set(s.scale[0], s.scale[1], s.scale[2]);
    subGroup.add(mesh);
  });

  return subGroup;
}
