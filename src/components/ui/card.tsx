"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeftRight, Gauge, Pause, Play, RotateCcw } from "lucide-react";
import * as THREE from "three";

// ─── Default images (used when no `cardImages` prop is provided) ─────────────
const defaultCardImages = [
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
];

// Card dimensions (kept in sync with the Tailwind classes in the JSX below).
const CARD_WIDTH = 400;
const CARD_HEIGHT = 250;
const ASCII_COLS = Math.floor(CARD_WIDTH / 6.5);
const ASCII_ROWS = Math.floor(CARD_HEIGHT / 13);

// ─── ASCII code generator ─────────────────────────────────────────────────────
const ASCII_CHARS =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789(){}[]<>;:,._-+=!@#$%^&*|\\/\"'`~?";

const generateCode = (width: number, height: number): string => {
  let text = "";
  for (let i = 0; i < width * height; i++) {
    text += ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)];
  }
  let out = "";
  for (let i = 0; i < height; i++) {
    out += text.substring(i * width, (i + 1) * width) + "\n";
  }
  return out;
};

// ─── Props ────────────────────────────────────────────────────────────────────
type ScannerCardStreamProps = {
  showControls?: boolean;
  showSpeed?: boolean;
  initialSpeed?: number;
  direction?: -1 | 1;
  cardImages?: string[];
  repeat?: number;
  cardGap?: number;
  friction?: number;
  scanEffect?: "clip" | "scramble";
};

interface ScannerParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  life: number;
  decay: number;
}

// ─── Component ────────────────────────────────────────────────────────────────
const ScannerCardStream = ({
  showControls = false,
  showSpeed = false,
  initialSpeed = 150,
  direction = -1,
  cardImages = defaultCardImages,
  repeat = 6,
  cardGap = 60,
  friction = 0.95,
  scanEffect = "scramble",
}: ScannerCardStreamProps) => {
  const [speed, setSpeed] = useState(initialSpeed);
  const [isPaused, setIsPaused] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const cards = useMemo(
    () =>
      Array.from({ length: cardImages.length * repeat }, (_, i) => ({
        id: i,
        image: cardImages[i % cardImages.length],
        ascii: generateCode(ASCII_COLS, ASCII_ROWS),
      })),
    [cardImages, repeat],
  );

  const sectionRef = useRef<HTMLElement>(null);
  const cardLineRef = useRef<HTMLDivElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const scannerCanvasRef = useRef<HTMLCanvasElement>(null);
  const originalAscii = useRef(new Map<number, string>());
  const inViewRef = useRef(true);

  // Live mirrors of props/state so the animation effect can be set up once
  // instead of tearing down and rebuilding the Three.js scene on every toggle.
  const isPausedRef = useRef(isPaused);
  const isScanningRef = useRef(false);
  const frictionRef = useRef(friction);
  const scanEffectRef = useRef(scanEffect);
  const lastSpeedRef = useRef(initialSpeed);

  const cardStreamState = useRef({
    position: 0,
    velocity: initialSpeed,
    direction,
    isDragging: false,
    lastMouseX: 0,
    lastTime: performance.now(),
    friction,
    minVelocity: 30,
  });

  const toggleAnimation = useCallback(() => setIsPaused((prev) => !prev), []);
  const changeDirection = useCallback(
    () => (cardStreamState.current.direction *= -1),
    [],
  );
  const resetPosition = useCallback(() => {
    const cardLine = cardLineRef.current;
    if (!cardLine) return;
    cardStreamState.current.position = cardLine.parentElement?.offsetWidth ?? 0;
    cardStreamState.current.velocity = initialSpeed;
    cardStreamState.current.direction = direction;
    setIsPaused(false);
  }, [initialSpeed, direction]);

  useEffect(() => {
    isPausedRef.current = isPaused;
    frictionRef.current = friction;
    scanEffectRef.current = scanEffect;
  }, [isPaused, friction, scanEffect]);

  // Pause the heavy per-frame work while the section is off-screen.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const cardLine = cardLineRef.current;
    const particleCanvas = particleCanvasRef.current;
    const scannerCanvas = scannerCanvasRef.current;
    if (!cardLine || !particleCanvas || !scannerCanvas) return;

    originalAscii.current.clear();
    cards.forEach((card) => originalAscii.current.set(card.id, card.ascii));

    // The card strip is stable for the effect's lifetime, so cache the
    // wrappers once instead of re-querying the DOM every frame.
    const cardWrappers = Array.from(
      cardLine.querySelectorAll<HTMLElement>(".card-wrapper"),
    );
    const viewWidth = cardLine.parentElement?.clientWidth ?? window.innerWidth;

    // --- Three.js dust particles drifting behind the cards ---
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      -viewWidth / 2,
      viewWidth / 2,
      125,
      -125,
      1,
      1000,
    );
    camera.position.z = 100;
    const renderer = new THREE.WebGLRenderer({
      canvas: particleCanvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(viewWidth, CARD_HEIGHT);
    renderer.setClearColor(0x000000, 0);

    const particleCount = 400;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount);
    const alphas = new Float32Array(particleCount);

    const texCanvas = document.createElement("canvas");
    texCanvas.width = 100;
    texCanvas.height = 100;
    const texCtx = texCanvas.getContext("2d")!;
    const half = 50;
    const gradient = texCtx.createRadialGradient(half, half, 0, half, half, half);
    gradient.addColorStop(0.025, "#fff");
    gradient.addColorStop(0.1, "hsl(217, 61%, 33%)");
    gradient.addColorStop(0.25, "hsl(217, 64%, 6%)");
    gradient.addColorStop(1, "transparent");
    texCtx.fillStyle = gradient;
    texCtx.arc(half, half, half, 0, Math.PI * 2);
    texCtx.fill();
    const texture = new THREE.CanvasTexture(texCanvas);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * viewWidth * 2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * CARD_HEIGHT;
      velocities[i] = Math.random() * 60 + 30;
      alphas[i] = (Math.random() * 8 + 2) / 10;
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("alpha", new THREE.BufferAttribute(alphas, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: { pointTexture: { value: texture } },
      vertexShader:
        "attribute float alpha; varying float vAlpha; void main() { vAlpha = alpha; vec4 mvPosition = modelViewMatrix * vec4(position, 1.0); gl_PointSize = 15.0; gl_Position = projectionMatrix * mvPosition; }",
      fragmentShader:
        "uniform sampler2D pointTexture; varying float vAlpha; void main() { gl_FragColor = vec4(1.0, 1.0, 1.0, vAlpha) * texture2D(pointTexture, gl_PointCoord); }",
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // --- 2D scanner particles (swell when a card is being scanned) ---
    const ctx = scannerCanvas.getContext("2d")!;
    scannerCanvas.width = window.innerWidth;
    scannerCanvas.height = CARD_HEIGHT + 50;
    let scannerParticles: ScannerParticle[] = [];
    const baseMaxParticles = 800;
    const scanTargetMaxParticles = 2500;
    let currentMaxParticles = baseMaxParticles;

    const createScannerParticle = (): ScannerParticle => ({
      x: viewWidth / 2 + (Math.random() - 0.5) * 3,
      y: Math.random() * scannerCanvas.height,
      vx: Math.random() * 0.8 + 0.2,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 0.6 + 0.4,
      alpha: Math.random() * 0.4 + 0.6,
      life: 1,
      decay: Math.random() * 0.02 + 0.005,
    });
    for (let i = 0; i < baseMaxParticles; i++) {
      scannerParticles.push(createScannerParticle());
    }

    // --- Scramble effect: briefly replaces the ASCII with random characters ---
    const scrambleIntervals: number[] = [];
    const runScrambleEffect = (element: HTMLElement, cardId: number) => {
      if (element.dataset.scrambling === "true") return;
      element.dataset.scrambling = "true";
      const originalText = originalAscii.current.get(cardId) ?? "";
      let scrambleCount = 0;
      const maxScrambles = 10;
      const interval = window.setInterval(() => {
        element.textContent = generateCode(ASCII_COLS, ASCII_ROWS);
        scrambleCount++;
        if (scrambleCount >= maxScrambles) {
          window.clearInterval(interval);
          element.textContent = originalText;
          delete element.dataset.scrambling;
        }
      }, 30);
      scrambleIntervals.push(interval);
    };

    // --- Reveal the image / ASCII on either side of the scanner line ---
    const updateCardEffects = () => {
      const scannerX = viewWidth / 2;
      const scannerWidth = 8;
      const scannerLeft = scannerX - scannerWidth / 2;
      const scannerRight = scannerX + scannerWidth / 2;
      let anyCardIsScanning = false;

      cardWrappers.forEach((wrapper, index) => {
          const rect = wrapper.getBoundingClientRect();
          const normalCard = wrapper.querySelector<HTMLElement>(".card-normal");
          const asciiCard = wrapper.querySelector<HTMLElement>(".card-ascii");
          if (!normalCard || !asciiCard) return;

          if (rect.left < scannerRight && rect.right > scannerLeft) {
            anyCardIsScanning = true;
            if (
              scanEffectRef.current === "scramble" &&
              wrapper.dataset.scanned !== "true"
            ) {
              const asciiContent = asciiCard.querySelector<HTMLElement>("pre");
              if (asciiContent) runScrambleEffect(asciiContent, index);
            }
            wrapper.dataset.scanned = "true";
            const intersectLeft = Math.max(scannerLeft - rect.left, 0);
            const intersectRight = Math.min(scannerRight - rect.left, rect.width);
            normalCard.style.setProperty(
              "--clip-right",
              `${(intersectLeft / rect.width) * 100}%`,
            );
            asciiCard.style.setProperty(
              "--clip-left",
              `${(intersectRight / rect.width) * 100}%`,
            );
          } else {
            delete wrapper.dataset.scanned;
            if (rect.right < scannerLeft) {
              normalCard.style.setProperty("--clip-right", "100%");
              asciiCard.style.setProperty("--clip-left", "100%");
            } else {
              normalCard.style.setProperty("--clip-right", "0%");
              asciiCard.style.setProperty("--clip-left", "0%");
            }
          }
        });

      if (anyCardIsScanning !== isScanningRef.current) {
        isScanningRef.current = anyCardIsScanning;
        setIsScanning(anyCardIsScanning);
      }
    };

    // --- Pointer / wheel interaction ---
    const handleMouseDown = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const state = cardStreamState.current;
      state.isDragging = true;
      state.lastMouseX = clientX;
      state.lastTime = performance.now();
    };

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      const state = cardStreamState.current;
      if (!state.isDragging) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const now = performance.now();
      const deltaSeconds = Math.max((now - state.lastTime) / 1000, 0.001);
      const dx = clientX - state.lastMouseX;
      state.lastMouseX = clientX;
      state.lastTime = now;
      state.position += dx;
      state.velocity = Math.max(Math.abs(dx) / deltaSeconds, state.minVelocity);
      state.direction = dx < 0 ? -1 : 1;
    };

    const handleMouseUp = () => {
      cardStreamState.current.isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      // Deliberately no preventDefault: the section lives inside a
      // scrollable page (Lenis), so page scroll must keep working — the
      // cards just get a matching fling. A small dead-zone ignores
      // trackpad micro-scrolls.
      const state = cardStreamState.current;
      const delta = Math.abs(e.deltaY);
      if (delta < 15) return;
      state.velocity = Math.min(delta * 0.6 + 60, 1200);
      state.direction = e.deltaY > 0 ? -1 : 1;
    };

    cardLine.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    cardLine.addEventListener("touchstart", handleMouseDown, { passive: true });
    window.addEventListener("touchmove", handleMouseMove, { passive: true });
    window.addEventListener("touchend", handleMouseUp);
    cardLine.addEventListener("wheel", handleWheel);

    // --- Animation loop ---
    let animationFrameId = 0;
    const animate = (currentTime: number) => {
      // Keep the loop alive but skip all work while the section is off-screen.
      animationFrameId = requestAnimationFrame(animate);
      if (!inViewRef.current) return;
      const state = cardStreamState.current;
      const deltaTime = Math.min((currentTime - state.lastTime) / 1000, 0.05);
      state.lastTime = currentTime;

      if (!isPausedRef.current && !state.isDragging) {
        if (state.velocity > state.minVelocity) {
          state.velocity *= frictionRef.current;
        }
        state.position += state.velocity * state.direction * deltaTime;
        const roundedSpeed = Math.round(state.velocity);
        if (roundedSpeed !== lastSpeedRef.current) {
          lastSpeedRef.current = roundedSpeed;
          setSpeed(roundedSpeed);
        }
      }

      const containerWidth = cardLine.parentElement?.offsetWidth ?? 0;
      const cardLineWidth = cardLine.scrollWidth || containerWidth;
      if (state.position < -cardLineWidth) state.position = containerWidth;
      else if (state.position > containerWidth) state.position = -cardLineWidth;
      cardLine.style.transform = `translateX(${state.position}px)`;

      updateCardEffects();

      // Drift the Three.js dust particles.
      const time = currentTime * 0.001;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += velocities[i] * 0.016;
        if (positions[i * 3] > viewWidth / 2 + 100) {
          positions[i * 3] = -viewWidth / 2 - 100;
        }
        positions[i * 3 + 1] += Math.sin(time + i * 0.1) * 0.5;
        alphas[i] = Math.max(
          0.1,
          Math.min(1, alphas[i] + (Math.random() - 0.5) * 0.05),
        );
      }
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.alpha.needsUpdate = true;
      renderer.render(scene, camera);

      // 2D scanner particles.
      ctx.clearRect(0, 0, scannerCanvas.width, scannerCanvas.height);
      const targetCount = isScanningRef.current
        ? scanTargetMaxParticles
        : baseMaxParticles;
      currentMaxParticles += (targetCount - currentMaxParticles) * 0.05;
      while (scannerParticles.length < currentMaxParticles) {
        scannerParticles.push(createScannerParticle());
      }
      while (scannerParticles.length > currentMaxParticles) {
        scannerParticles.pop();
      }
      for (const p of scannerParticles) {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0 || p.x > viewWidth) {
          Object.assign(p, createScannerParticle());
        }
        ctx.globalAlpha = p.alpha * p.life;
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

    };
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      cardLine.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      cardLine.removeEventListener("touchstart", handleMouseDown);
      window.removeEventListener("touchmove", handleMouseMove);
      window.removeEventListener("touchend", handleMouseUp);
      cardLine.removeEventListener("wheel", handleWheel);
      scrambleIntervals.forEach((interval) => window.clearInterval(interval));
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
      ctx.clearRect(0, 0, scannerCanvas.width, scannerCanvas.height);
    };
  }, [cards]);

  return (
    <main ref={sectionRef} className="relative flex h-screen w-full items-center justify-center overflow-hidden">
      {/* Component-scoped keyframes (plain <style> — no styled-jsx needed). */}
      <style>{`
        @keyframes scanner-card-glitch {
          0%, 16%, 50%, 100% { opacity: 1; }
          15%, 99% { opacity: 0.9; }
          49% { opacity: 0.8; }
        }
        .scanner-card-glitch {
          animation: scanner-card-glitch 0.1s infinite linear alternate-reverse;
        }

        @keyframes scanner-card-pulse {
          0% { opacity: 0.75; transform: translate(-50%, -50%) scaleY(1); }
          100% { opacity: 1; transform: translate(-50%, -50%) scaleY(1.04); }
        }
        .scanner-card-pulse {
          animation: scanner-card-pulse 1.5s infinite alternate ease-in-out;
        }
      `}</style>

      {/* Speed indicator */}
      {showSpeed && (
        <div className="absolute right-6 top-6 z-30 flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-4 py-2 font-mono text-xs text-white/80 backdrop-blur-md">
          <Gauge className="h-3.5 w-3.5 text-violet-400" />
          {speed} px/s
        </div>
      )}

      {/* Floating dust backdrop (Three.js) */}
      <canvas
        ref={particleCanvasRef}
        className="pointer-events-none absolute left-0 top-1/2 z-0 h-[250px] w-full -translate-y-1/2"
      />

      {/* Scanner particles (2D canvas) */}
      <canvas
        ref={scannerCanvasRef}
        className="pointer-events-none absolute left-0 top-1/2 z-10 h-[300px] w-full -translate-y-1/2"
      />

      {/* The scanner line itself */}
      <div
        className={`scanner-card-pulse absolute left-1/2 top-1/2 z-20 h-[280px] w-0.5 rounded-full bg-gradient-to-b from-transparent via-violet-500 to-transparent transition-opacity duration-300 ${isScanning ? "opacity-100" : "opacity-0"}`}
        style={{
          boxShadow:
            "0 0 10px #a78bfa, 0 0 20px #a78bfa, 0 0 30px #8b5cf6, 0 0 50px #6366f1",
        }}
        aria-hidden
      />

      {/* The card stream */}
      <div className="absolute flex h-[250px] w-full items-center">
        <div
          ref={cardLineRef}
          className="flex cursor-grab select-none items-center whitespace-nowrap will-change-transform active:cursor-grabbing"
          style={{ gap: `${cardGap}px` }}
        >
          {cards.map((card) => (
            <div
              key={card.id}
              className="card-wrapper relative h-[250px] w-[400px] shrink-0"
            >
              {/* Image side (revealed to the right of the scanner) */}
              <div className="card-normal absolute left-0 top-0 z-[2] h-full w-full overflow-hidden rounded-[15px] bg-transparent shadow-[0_15px_40px_rgba(0,0,0,0.4)] [clip-path:inset(0_0_0_var(--clip-right,0%))]">
                <img
                  src={card.image}
                  alt=""
                  aria-hidden
                  draggable={false}
                  className="h-full w-full rounded-[15px] object-cover brightness-110 contrast-110 transition-all duration-300 ease-in-out hover:brightness-125 hover:contrast-125"
                />
              </div>
              {/* ASCII side (revealed to the left of the scanner) */}
              <div className="card-ascii absolute left-0 top-0 z-[1] h-full w-full overflow-hidden rounded-[15px] bg-transparent [clip-path:inset(0_calc(100%-var(--clip-left,0%))_0_0)]">
                <pre className="scanner-card-glitch absolute left-0 top-0 m-0 box-border h-full w-full overflow-hidden whitespace-pre p-0 text-left align-top font-mono text-[11px] leading-[13px] text-[rgba(220,210,255,0.6)] [mask-image:linear-gradient(to_right,rgba(0,0,0,1)_0%,rgba(0,0,0,0.8)_30%,rgba(0,0,0,0.6)_50%,rgba(0,0,0,0.4)_80%,rgba(0,0,0,0.2)_100%)]">
                  {card.ascii}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-black/40 p-1.5 backdrop-blur-md">
          <button
            type="button"
            onClick={toggleAnimation}
            aria-label={isPaused ? "Play" : "Pause"}
            className="rounded-full p-2.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={changeDirection}
            aria-label="Reverse direction"
            className="rounded-full p-2.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={resetPosition}
            aria-label="Reset position"
            className="rounded-full p-2.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      )}
    </main>
  );
};

export { ScannerCardStream };
