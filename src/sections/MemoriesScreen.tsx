'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import LogoBlur from '@/components/LogoBlur';
import { MEMORIES, type MemoryEntry } from '@/lib/memories';

const BG = 0x131313;
const RING_RX = 3.9;
const RING_RY = 2.05;
const RING_SPEED = 0.08;
const CUBE = 0.78;

export default function MemoriesScreen({
  onBack,
  onOpen,
}: {
  onBack?: () => void;
  onOpen?: (memory: MemoryEntry) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const [opened, setOpened] = useState<MemoryEntry | null>(null);
  const openRef = useRef(false);
  useEffect(() => {
    openRef.current = opened !== null;
  }, [opened]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(BG);

    let W = window.innerWidth;
    let H = window.innerHeight;
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
    camera.position.set(0, 0, 7);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const disposables: Array<{ dispose: () => void }> = [];

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const key = new THREE.DirectionalLight(0xffffff, 1.15);
    key.position.set(3, 5, 4);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xbfd0ff, 0.35);
    fill.position.set(-4, -2, 2);
    scene.add(fill);

    const cubeGeo = new THREE.BoxGeometry(CUBE, CUBE, CUBE);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0xf3f3f5, metalness: 0.12, roughness: 0.62 });
    const hoverMat = new THREE.MeshStandardMaterial({ color: 0x18181a, metalness: 0.2, roughness: 0.5 });
    disposables.push(cubeGeo, baseMat, hoverMat);

    type CubeData = {
      memory: MemoryEntry;
      baseAngle: number;
      baseZ: number;
      bobAmp: number;
      bobSpeed: number;
      bobPhase: number;
      spin: THREE.Vector3;
      hoverEase: number;
    };

    const cubes: THREE.Mesh[] = [];
    const items = MEMORIES.slice(0, 6);
    const n = items.length;
    items.forEach((m, i) => {
      const baseAngle = (i / n) * Math.PI * 2 - Math.PI / 2;
      const cube = new THREE.Mesh(cubeGeo, baseMat);
      const scl = 0.82 + (i % 3) * 0.12;
      cube.scale.setScalar(scl);
      const baseZ = ((i * 37) % 10) / 10 - 0.5;
      cube.position.set(Math.cos(baseAngle) * RING_RX, Math.sin(baseAngle) * RING_RY, baseZ);

      cube.rotation.set(baseAngle * 0.7 + i, baseAngle * 0.4 + i * 1.3, i * 0.6);
      cube.userData = {
        memory: m,
        baseAngle,
        baseZ,
        bobAmp: 0.1 + ((i * 13) % 7) / 50,
        bobSpeed: 0.5 + ((i * 7) % 5) / 12,
        bobPhase: (i * 1.7) % (Math.PI * 2),
        spin: new THREE.Vector3(0.06 + (i % 3) * 0.02, 0.09 + (i % 4) * 0.015, 0.04),
        hoverEase: 0,
      } satisfies CubeData;
      scene.add(cube);
      cubes.push(cube);
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(-2, -2);
    let hovered: THREE.Mesh | null = null;
    const tmp = new THREE.Vector3();

    let frame = 0;
    let last = performance.now();
    const t0 = last;
    let ringRot = 0;

    const animate = () => {
      frame = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = (now - t0) / 1000;

      ringRot += RING_SPEED * dt;

      hovered = null;
      if (!openRef.current) {
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(cubes, false);
        if (hits.length) hovered = hits[0].object as THREE.Mesh;
      }

      for (const cube of cubes) {
        const d = cube.userData as CubeData;
        const isHover = cube === hovered;
        d.hoverEase += ((isHover ? 1 : 0) - d.hoverEase) * Math.min(1, dt * 8);

        const a = d.baseAngle + ringRot;
        cube.position.x = Math.cos(a) * RING_RX;
        cube.position.y = Math.sin(a) * RING_RY + Math.sin(t * d.bobSpeed + d.bobPhase) * d.bobAmp;
        cube.position.z = d.baseZ + d.hoverEase * 0.6;
        const spinScale = 1 - d.hoverEase * 0.85;
        cube.rotation.x += d.spin.x * dt * spinScale;
        cube.rotation.y += d.spin.y * dt * spinScale;
        cube.rotation.z += d.spin.z * dt * spinScale;
        const baseScl = 0.82 + (cubes.indexOf(cube) % 3) * 0.12;
        cube.scale.setScalar(baseScl * (1 + d.hoverEase * 0.14));
        cube.material = isHover || d.hoverEase > 0.5 ? hoverMat : baseMat;
      }

      const lbl = labelRef.current;
      if (lbl) {
        if (hovered) {
          const d = hovered.userData as CubeData;
          hovered.getWorldPosition(tmp).project(camera);
          const sx = (tmp.x * 0.5 + 0.5) * W;
          const sy = (-tmp.y * 0.5 + 0.5) * H;
          lbl.textContent = d.memory.name;
          lbl.style.opacity = d.hoverEase.toFixed(3);
          lbl.style.transform = `translate(${sx}px, ${sy + 64}px) translate(-50%, 0)`;
        } else {
          lbl.style.opacity = '0';
        }
      }

      const wantCursor = hovered && !openRef.current ? 'pointer' : 'default';
      if (canvas.style.cursor !== wantCursor) canvas.style.cursor = wantCursor;

      renderer.render(scene, camera);
    };
    animate();

    let downX = 0;
    let downY = 0;
    let moved = 0;
    const onPointerMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
      if (downX || downY) moved += Math.hypot(e.clientX - downX, e.clientY - downY);
    };
    const onPointerDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
      moved = 0;
    };
    const onPointerUp = (e: PointerEvent) => {
      const isTap = Math.hypot(e.clientX - downX, e.clientY - downY) < 6;
      downX = 0;
      downY = 0;
      if (!isTap || openRef.current) return;
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(cubes, false);
      if (hits.length) setOpened((hits[0].object.userData as CubeData).memory);
    };
    window.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpened(null);
    };
    window.addEventListener('keydown', onKey);

    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      for (const d of disposables) d.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="absolute inset-0 z-50 overflow-hidden" style={{ background: '#131313' }}>
      <canvas ref={canvasRef} className="block h-full w-full" />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(255,255,255,0.04) 0%, rgba(19,19,19,0) 45%), radial-gradient(ellipse at center, rgba(19,19,19,0) 60%, rgba(19,19,19,0.6) 100%)',
        }}
      />

      <div className="absolute left-1/2 top-[5%] z-20" style={{ transform: 'translateX(-50%)' }}>
        <LogoBlur text="ECHO" fontMin={28.8} fontVw={0.045} fontMax={57.6} blur={6} circleSize={0.7} />
      </div>

      <p
        className="pointer-events-none absolute left-1/2 bottom-[8%] z-20 select-none text-center"
        style={{
          transform: 'translateX(-50%)',
          fontFamily: 'var(--font-body), sans-serif',
          fontSize: 'clamp(0.9rem, 1.6vw, 1.25rem)',
          letterSpacing: '0.12em',
          color: '#ffffff',
        }}
      >
        My Memories
      </p>

      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="echo-cta absolute left-[clamp(1.25rem,4vw,2.5rem)] bottom-[7%] z-30"
          style={{
            padding: '10px 22px',
            borderRadius: '999px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.35)',
            color: 'rgba(255,255,255,0.85)',
            fontFamily: 'var(--font-body), sans-serif',
            fontSize: '0.75rem',
            letterSpacing: '0.12em',
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>
      )}

      <div
        ref={labelRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-30 select-none whitespace-nowrap"
        style={{
          opacity: 0,
          fontFamily: 'var(--font-body), sans-serif',
          fontSize: '0.95rem',
          letterSpacing: '0.06em',
          color: '#ffffff',
          textShadow: '0 1px 10px rgba(0,0,0,0.7)',
          willChange: 'transform, opacity',
        }}
      />

      {opened && (
        <div
          className="echo-lightbox fixed inset-0 z-70 grid place-items-center"
          style={{ background: 'rgba(8,8,8,0.62)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}
          onClick={() => setOpened(null)}
        >
          <div
            className="echo-lightbox-img relative"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(92vw, 420px)',
              borderRadius: '28px',
              overflow: 'hidden',
              background: 'rgba(20,20,20,0.85)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
            }}
          >

            <img
              src={opened.cover}
              alt={opened.name}
              style={{ display: 'block', width: '100%', height: '300px', objectFit: 'cover' }}
            />
            <button
              type="button"
              onClick={() => setOpened(null)}
              aria-label="Close"
              className="echo-cta absolute right-3 top-3 grid place-items-center"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.45)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>

            <div style={{ padding: '20px 22px 24px' }}>
              <div
                style={{
                  fontFamily: 'var(--font-body), sans-serif',
                  fontWeight: 700,
                  fontSize: '1.35rem',
                  letterSpacing: '-0.01em',
                  color: '#ffffff',
                }}
              >
                {opened.name}
              </div>
              <div
                style={{
                  marginTop: '6px',
                  display: 'flex',
                  gap: '12px',
                  fontFamily: 'var(--font-body), sans-serif',
                  fontSize: '0.7rem',
                  letterSpacing: '0.08em',
                  color: 'rgba(255,255,255,0.55)',
                }}
              >
                <span>{opened.date}</span>
                <span>·</span>
                <span>{opened.mediaCount} echoes</span>
              </div>
              <p
                style={{
                  marginTop: '14px',
                  fontFamily: 'var(--font-body), sans-serif',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  color: 'rgba(255,255,255,0.8)',
                }}
              >
                {opened.tagline}
              </p>

              <button
                type="button"
                onClick={() => {
                  const m = opened;
                  setOpened(null);
                  onOpen?.(m);
                }}
                className="echo-primary"
                style={{
                  marginTop: '20px',
                  width: '100%',
                  padding: '14px 0',
                  borderRadius: '999px',
                  background: '#ffffff',
                  color: '#121212',
                  border: 'none',
                  fontFamily: 'var(--font-body), sans-serif',
                  fontSize: '0.8rem',
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                }}
              >
                Enter memory →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
