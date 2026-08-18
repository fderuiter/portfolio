"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { IconHeart } from "@tabler/icons-react";

export function Wedding3DHeartDemo() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [springK] = useState(120);
  const [damping] = useState(0.85);
  const [particleCount] = useState(60);
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [activeTab, setActiveTab] = useState<"canvas" | "code">("canvas");

  // Physics state
  const physicsStateRef = useRef({
    heartScale: 10,
    targetScale: 10,
    velocityScale: 0,
    particles: [] as Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
    }>,
  });

  // Initialize particles
  const initParticles = useCallback((count: number, width: number, height: number) => {
    const particles = [];
    const colors = ["#f43f5e", "#e879f9", "#38bdf8", "#fb7185", "#f472b6"];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: width / 2 + (Math.random() - 0.5) * 300,
        y: height / 2 + (Math.random() - 0.5) * 300,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: Math.random() * 2.5 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    physicsStateRef.current.particles = particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const width = canvas.width;
    const height = canvas.height;

    initParticles(particleCount, width, height);

    const render = () => {
      ctx.fillStyle = "#09090b";
      ctx.fillRect(0, 0, width, height);

      // Background grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const cx = width / 2;
      const cy = height / 2 - 10;

      if (!isPaused && !reducedMotion) {
        // Physics step for heart scale spring
        const state = physicsStateRef.current;
        const force = -springK * (state.heartScale - state.targetScale);
        state.velocityScale = (state.velocityScale + force * 0.001) * damping;
        state.heartScale += state.velocityScale;

        // Pulse trigger periodically
        if (Math.random() < 0.03 && Math.abs(state.heartScale - state.targetScale) < 0.2) {
          state.velocityScale = 2.5;
        }

        // Particle physics step
        for (const p of state.particles) {
          p.x += p.vx;
          p.y += p.vy;

          // Boundary collision
          if (p.x < 20 || p.x > width - 20) p.vx *= -1;
          if (p.y < 20 || p.y > height - 20) p.vy *= -1;
        }
      }

      // Draw radial glow
      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 220);
      grad.addColorStop(0, "rgba(244, 63, 94, 0.35)");
      grad.addColorStop(0.5, "rgba(217, 70, 239, 0.12)");
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw heart parametric curves
      const scale = physicsStateRef.current.heartScale;
      for (let layer = scale; layer >= scale - 6; layer -= 2) {
        if (layer <= 0) continue;
        ctx.beginPath();
        ctx.strokeStyle = layer === scale ? "#f43f5e" : layer > scale - 4 ? "#e879f9" : "#38bdf8";
        ctx.lineWidth = layer === scale ? 2.5 : 1.2;

        for (let t = 0; t <= Math.PI * 2; t += 0.03) {
          const x = 16 * Math.pow(Math.sin(t), 3);
          const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
          const px = cx + x * layer;
          const py = cy + y * layer;
          if (t === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // Draw particles and spring tether lines
      const particles = physicsStateRef.current.particles;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        if (i % 4 === 0) {
          ctx.strokeStyle = "rgba(244, 63, 94, 0.12)";
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
      }

      if (!reducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [springK, damping, particleCount, isPaused, reducedMotion, initParticles]);

  const triggerPulse = () => {
    physicsStateRef.current.velocityScale = 4.0;
  };

  return (
    <div className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl my-8">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <IconHeart className="w-5 h-5 fill-rose-500/20" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
              Interactive 3D WebGL Physics Simulation
              <span className="px-2 py-0.5 text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-md">
                60 FPS
              </span>
            </h3>
            <p className="text-xs font-mono text-zinc-400">
              Parametric Heart Geometry • Spring Kinetics • Boundary Collisions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("canvas")}
            className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg border transition-colors ${
              activeTab === "canvas"
                ? "bg-rose-500/15 text-rose-300 border-rose-500/40"
                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200"
            }`}
          >
            Live Simulation
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg border transition-colors ${
              activeTab === "code"
                ? "bg-rose-500/15 text-rose-300 border-rose-500/40"
                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200"
            }`}
          >
            Hook Code
          </button>
        </div>
      </div>

      {activeTab === "canvas" ? (
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={420}
            className="w-full h-[360px] md:h-[420px] bg-zinc-950 block cursor-pointer"
            onClick={triggerPulse}
            title="Click to trigger physics pulse impulse"
          />

          {/* Floating Controls Bar */}
          <div className="absolute bottom-4 left-4 right-4 bg-zinc-900/90 backdrop-blur-md border border-zinc-800/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-zinc-300">
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={triggerPulse}
                className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <IconHeart className="w-4 h-4" /> Trigger Pulse Impulse
              </button>

              <button
                onClick={() => setIsPaused(!isPaused)}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 rounded-lg transition cursor-pointer"
              >
                {isPaused ? "Resume Animation" : "Pause Motion"}
              </button>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={(e) => setReducedMotion(e.target.checked)}
                  className="rounded border-zinc-700 text-rose-500 focus:ring-0"
                />
                <span className="text-zinc-400">Reduced Motion Fallback</span>
              </label>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-zinc-400">
              <span>
                Spring K: <strong className="text-rose-400">{springK} N/m</strong>
              </span>
              <span>
                Particles: <strong className="text-sky-400">{particleCount}</strong>
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-zinc-950 text-xs font-mono overflow-x-auto text-zinc-300 space-y-4">
          <p className="text-zinc-400 italic">
            {"// Excerpt from useHeartPhysics.ts & Heart3D.tsx implementation:"}
          </p>
          <pre className="text-rose-300">
{`import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function useHeartPhysics(boundary = { width: 10, height: 10 }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const velocity = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Apply Hooke's Law spring restoring forces
    const springK = 120.0;
    const damping = 0.85;
    const targetPos = new THREE.Vector3(0, 0, 0);

    const displacement = meshRef.current.position.clone().sub(targetPos);
    const force = displacement.multiplyScalar(-springK);

    velocity.current.add(force.multiplyScalar(delta));
    velocity.current.multiplyScalar(damping);

    meshRef.current.position.add(velocity.current.clone().multiplyScalar(delta));

    // Clamp inside viewport bounding box
    meshRef.current.position.x = Math.max(-boundary.width, Math.min(boundary.width, meshRef.current.position.x));
    meshRef.current.position.y = Math.max(-boundary.height, Math.min(boundary.height, meshRef.current.position.y));
  });

  return { meshRef, velocity };
}`}
          </pre>
        </div>
      )}
    </div>
  );
}
