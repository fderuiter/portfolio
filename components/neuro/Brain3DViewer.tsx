"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SurfaceMode, VoxelCoord } from "@/lib/neuro/types";
import { createCorticalSurfaceMesh } from "@/lib/neuro/mesh-generator";
import { loadExternalBrainMesh } from "@/lib/neuro/asset-loader";
import { Icon3dCubeSphere, IconRefresh } from "@tabler/icons-react";

interface Brain3DViewerProps {
  surfaceMode: SurfaceMode;
  crosshair: VoxelCoord;
  modelUrl?: string;
  wireframe?: boolean;
  onSurfaceChange?: (mode: SurfaceMode) => void;
}

export const Brain3DViewer: React.FC<Brain3DViewerProps> = ({
  surfaceMode,
  crosshair,
  modelUrl,
  wireframe = false,
  onSurfaceChange,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshGroupRef = useRef<THREE.Group | null>(null);
  const crosshairMarkerRef = useRef<THREE.Mesh | null>(null);

  const [isRotating, setIsRotating] = useState(true);
  const isRotatingRef = useRef(isRotating);
  useEffect(() => {
    isRotatingRef.current = isRotating;
  }, [isRotating]);
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0.2, y: -0.4 });

  // Initialize Three.js Scene, Camera, and Renderer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x09090b); // Zinc-950
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.8);
    cameraRef.current = camera;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.2); // Sky blue
    dirLight1.position.set(5, 8, 6);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x818cf8, 0.8); // Indigo
    dirLight2.position.set(-5, -4, -4);
    scene.add(dirLight2);

    // 3D Crosshair Indicator
    const crossGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const crossMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4, wireframe: true });
    const crosshairMarker = new THREE.Mesh(crossGeo, crossMat);
    scene.add(crosshairMarker);
    crosshairMarkerRef.current = crosshairMarker;

    // WebGL Renderer
    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.innerHTML = "";
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;
    } catch {
      // Fallback for headless / test environments
      return;
    }

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (meshGroupRef.current) {
        if (isRotatingRef.current && !isDraggingRef.current) {
          rotationRef.current.y += 0.005;
        }
        meshGroupRef.current.rotation.x = rotationRef.current.x;
        meshGroupRef.current.rotation.y = rotationRef.current.y;
      }

      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    };
    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      if (renderer) {
        renderer.dispose();
      }
      if (container && renderer && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update Cortical Mesh on surfaceMode, modelUrl, or wireframe change
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    let isMounted = true;

    if (meshGroupRef.current) {
      scene.remove(meshGroupRef.current);
      meshGroupRef.current.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });
    }

    if (modelUrl && surfaceMode === "pial") {
      loadExternalBrainMesh(modelUrl, surfaceMode).then((externalGroup) => {
        if (!isMounted || !sceneRef.current) return;
        sceneRef.current.add(externalGroup);
        meshGroupRef.current = externalGroup;
      });
    } else {
      const newGroup = createCorticalSurfaceMesh(surfaceMode, wireframe);
      scene.add(newGroup);
      meshGroupRef.current = newGroup;
    }

    return () => {
      isMounted = false;
    };
  }, [surfaceMode, modelUrl, wireframe]);

  // Update Crosshair Marker Position in 3D Space
  useEffect(() => {
    if (!crosshairMarkerRef.current) return;
    // Map voxel coords (0..96) to 3D space (-1.5..1.5)
    const normX = ((crosshair.x - 48) / 48) * 1.35;
    const normY = ((crosshair.y - 48) / 48) * 1.85;
    const normZ = ((crosshair.z - 48) / 48) * 1.45;
    crosshairMarkerRef.current.position.set(normX, normY, normZ);
  }, [crosshair]);

  // Mouse Orbit Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - prevMouseRef.current.x;
    const deltaY = e.clientY - prevMouseRef.current.y;
    rotationRef.current.y += deltaX * 0.008;
    rotationRef.current.x += deltaY * 0.008;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="relative w-full h-full min-h-[380px] bg-zinc-950 rounded-2xl border border-zinc-800/80 overflow-hidden flex flex-col select-none">
      {/* 3D Viewport Header */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-zinc-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-750 text-xs font-mono">
        <Icon3dCubeSphere className="w-4 h-4 text-brand-cyan" />
        <span className="font-semibold text-white uppercase tracking-wider">
          {surfaceMode === "pial"
            ? "Pial Surface (lh.pial)"
            : surfaceMode === "white"
            ? "White Matter (lh.white)"
            : surfaceMode === "inflated"
            ? "Inflated Cortex (lh.inflated)"
            : "Subcortical ASEG"}
        </span>
      </div>

      {/* Surface Mode Toggle Bar */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-zinc-900/85 backdrop-blur-md p-1 rounded-xl border border-zinc-750 text-xs font-mono">
        {(["pial", "white", "inflated", "aseg"] as SurfaceMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => onSurfaceChange?.(mode)}
            className={`px-2.5 py-1 rounded-lg transition-all capitalize ${
              surfaceMode === mode
                ? "bg-brand-cyan text-zinc-950 font-bold shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full flex-1 cursor-grab active:cursor-grabbing"
      />

      {/* Bottom Controls Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between text-xs font-mono text-zinc-400 bg-zinc-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800">
        <div className="flex items-center gap-3">
          <span>
            VOXEL: ({crosshair.x}, {crosshair.y}, {crosshair.z})
          </span>
          <span className="hidden sm:inline text-zinc-400">|</span>
          <span className="hidden sm:inline">DRAG TO ROTATE</span>
        </div>
        <button
          onClick={() => setIsRotating((prev) => !prev)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-md border transition-colors ${
            isRotating ? "bg-brand-cyan/10 border-brand-cyan/30 text-brand-cyan" : "bg-zinc-800 border-zinc-700 text-zinc-400"
          }`}
        >
          <IconRefresh className={`w-3 h-3 ${isRotating ? "animate-spin" : ""}`} />
          <span>{isRotating ? "AUTOROTATE ON" : "AUTOROTATE OFF"}</span>
        </button>
      </div>
    </div>
  );
};
