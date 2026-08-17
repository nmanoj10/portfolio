"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * About3D
 *
 * A decorative three.js scene for the About section's right column:
 * a slowly rotating violet wireframe torus knot wrapped around a dark
 * metallic core, with a drifting particle ring and soft aura.
 *
 * Colours match the site accent (violet/indigo). The renderer is created
 * lazily (only when the slot actually has size — it's hidden below lg),
 * paused while off-screen, respects prefers-reduced-motion, and disposes
 * all GPU resources on unmount.
 */
export function About3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    const canvas = canvasRef.current;
    if (!mount || !canvas) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let group: THREE.Group | null = null;
    let ring: THREE.Points | null = null;
    let rafId = 0;
    let inView = false;
    const pointer = { x: 0, y: 0 };
    const disposables: { dispose(): void }[] = [];

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const resize = () => {
      if (!renderer || !camera) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    const init = () => {
      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: true,
          alpha: true,
        });
      } catch {
        // WebGL unavailable — leave the slot empty.
        return;
      }
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      camera.position.set(0, 0, 4.4);

      // Lighting
      scene.add(new THREE.AmbientLight(0xffffff, 0.4));
      const key = new THREE.DirectionalLight(0xffffff, 1.6);
      key.position.set(2.5, 3, 4);
      scene.add(key);
      const accent = new THREE.PointLight(0x8b5cf6, 12, 12);
      accent.position.set(-2.5, -1.5, 2.5);
      scene.add(accent);

      group = new THREE.Group();
      group.rotation.x = 0.45;
      scene.add(group);

      // Dark metallic core
      const coreGeo = new THREE.SphereGeometry(0.62, 48, 48);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x141418,
        metalness: 0.9,
        roughness: 0.25,
      });
      group.add(new THREE.Mesh(coreGeo, coreMat));
      disposables.push(coreGeo, coreMat);

      // Violet halo (backface shell)
      const haloGeo = new THREE.SphereGeometry(0.82, 32, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0x8b5cf6,
        transparent: true,
        opacity: 0.06,
        side: THREE.BackSide,
      });
      group.add(new THREE.Mesh(haloGeo, haloMat));
      disposables.push(haloGeo, haloMat);

      // Wireframe torus knot
      const knotGeo = new THREE.TorusKnotGeometry(1, 0.3, 160, 20);
      const knotMat = new THREE.MeshBasicMaterial({
        color: 0x8b5cf6,
        wireframe: true,
        transparent: true,
        opacity: 0.85,
      });
      group.add(new THREE.Mesh(knotGeo, knotMat));
      disposables.push(knotGeo, knotMat);

      // Drifting particle ring
      const count = 350;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const t = (i / count) * Math.PI * 2;
        const radius = 1.55 + Math.random() * 0.5;
        positions[i * 3] = Math.cos(t) * radius;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 0.9;
        positions[i * 3 + 2] = Math.sin(t) * radius;
      }
      const ptGeo = new THREE.BufferGeometry();
      ptGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const ptMat = new THREE.PointsMaterial({
        color: 0xa78bfa,
        size: 0.035,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      ring = new THREE.Points(ptGeo, ptMat);
      group.add(ring);
      disposables.push(ptGeo, ptMat);

      resize();

      const start = performance.now();
      const animate = (now: number) => {
        rafId = requestAnimationFrame(animate);
        if (!inView || !renderer || !scene || !camera || !group) return;

        if (!reducedMotion) {
          const t = (now - start) / 1000;
          group.rotation.y += 0.0035;
          group.rotation.x = 0.45 + Math.sin(t * 0.25) * 0.15 + pointer.y * 0.3;
          group.rotation.z = Math.cos(t * 0.18) * 0.06;
          group.position.y = Math.sin(t * 0.6) * 0.08;
          if (ring) ring.rotation.y -= 0.0012;
        }

        renderer.render(scene, camera);
      };
      animate(start);
    };

    const ro = new ResizeObserver(() => {
      if (!renderer && mount.clientWidth > 0) init();
      else resize();
    });
    ro.observe(mount);

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    io.observe(mount);

    const onPointerMove = (e: PointerEvent) => {
      const r = mount.getBoundingClientRect();
      if (!r.width || !r.height) return;
      pointer.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      pointer.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    mount.addEventListener("pointermove", onPointerMove);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      io.disconnect();
      mount.removeEventListener("pointermove", onPointerMove);
      disposables.forEach((d) => d.dispose());
      renderer?.dispose();
      renderer = null;
    };
  }, []);

  return (
    <div ref={mountRef} className="relative h-full w-full" aria-hidden="true">
      {/* Soft violet aura behind the knot */}
      <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_45%,rgba(139,92,246,0.16),transparent_62%)] blur-xl" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
