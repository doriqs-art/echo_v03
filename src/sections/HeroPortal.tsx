'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import MemoryScreen from '@/sections/MemoryScreen';
import GeneratingScreen from '@/sections/GeneratingScreen';
import GalleryScreen from '@/sections/GalleryScreen';
import MemoriesScreen from '@/sections/MemoriesScreen';
import LogoBlur from '@/components/LogoBlur';
import SoundToggle from '@/components/SoundToggle';
import * as sound from '@/lib/sound';

type Phase = 'intro' | 'warp' | 'prompt' | 'loading' | 'memory' | 'generating' | 'gallery' | 'memories';
type Memory = { name: string; photoUrl: string | null };

const BOOST_MS = 2200;
const BG = 0x131313;
const SHAPE_SPEED = 1.2;

export default function HeroPortal() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>('intro');
  const [promptText, setPromptText] = useState('');
  const [memory, setMemory] = useState<Memory | null>(null);
  const phaseRef = useRef<Phase>('intro');
  const warpTimeout = useRef<number | null>(null);
  const loadTimeout = useRef<number | null>(null);
  const genTimeouts = useRef<number[]>([]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const begin = () => {
    if (phaseRef.current !== 'intro') return;
    sound.whoosh(BOOST_MS);
    setPhase('warp');
    warpTimeout.current = window.setTimeout(() => setPhase('prompt'), BOOST_MS);
  };

  const submitPrompt = () => {
    if (phaseRef.current !== 'prompt' || !promptText.trim()) return;
    setPhase('loading');
    loadTimeout.current = window.setTimeout(() => setPhase('memory'), 3200);
  };

  const startGenerating = (data: Memory) => {
    setMemory(data);
    setPhase('generating');
  };

  const reset = () => {
    if (warpTimeout.current) clearTimeout(warpTimeout.current);
    if (loadTimeout.current) clearTimeout(loadTimeout.current);
    genTimeouts.current.forEach(clearTimeout);
    genTimeouts.current = [];
    setPromptText('');
    setPhase('intro');
  };

  // Three.js: floating shapes only, no tunnel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(BG);

    let W = window.innerWidth;
    let H = window.innerHeight;
    const camera = new THREE.PerspectiveCamera(70, W / H, 0.1, 200);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const SHAPE_COUNT = 26;
    const SPREAD_X = 14;
    const SPREAD_Y = 9;
    const DEPTH_RANGE = 30;

    const shapeGeos = [
      new THREE.PlaneGeometry(1.1, 1.1),
      new THREE.PlaneGeometry(1.7, 1.0),
      new THREE.CircleGeometry(0.7, 32),
    ];
    const shapeMat = new THREE.MeshBasicMaterial({
      color: 0xeaeaf2,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    });

    const shapes: THREE.Mesh[] = [];

    const placeShape = (m: THREE.Mesh, z: number) => {
      m.position.set(
        (Math.random() - 0.5) * SPREAD_X * 2,
        (Math.random() - 0.5) * SPREAD_Y * 2,
        z
      );
      m.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      m.userData.spin = (Math.random() - 0.5) * 0.5;
      m.userData.drift = SHAPE_SPEED * (0.6 + Math.random() * 0.8);
    };

    for (let i = 0; i < SHAPE_COUNT; i++) {
      const m = new THREE.Mesh(shapeGeos[i % shapeGeos.length], shapeMat);
      m.scale.setScalar(0.55 + Math.random() * 0.9);
      placeShape(m, camera.position.z - Math.random() * DEPTH_RANGE);
      scene.add(m);
      shapes.push(m);
    }

    let frame = 0;
    let last = performance.now();

    const animate = () => {
      frame = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const showShapes = phaseRef.current !== 'generating';

      for (const m of shapes) {
        m.visible = showShapes;
        m.rotation.z += m.userData.spin * dt;
        m.rotation.x += m.userData.spin * 0.5 * dt;
        // drift toward camera (positive z)
        m.position.z += m.userData.drift * dt;
        // recycle when past camera
        if (m.position.z > camera.position.z + 4) {
          placeShape(m, camera.position.z - DEPTH_RANGE);
        }
      }

      renderer.render(scene, camera);
    };
    animate();

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
      window.removeEventListener('resize', onResize);
      shapeGeos.forEach((g) => g.dispose());
      shapeMat.dispose();
      renderer.dispose();
    };
  }, []);

  const intro = phase === 'intro';
  const onPrompt = phase === 'prompt';

  return (
    <div className="relative h-screen w-full overflow-hidden" style={{ background: '#131313' }}>
      <canvas ref={canvasRef} className="block h-full w-full absolute inset-0" />

      {/* Subtle dark gradient — lighter at center, darker at edges */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(30,30,35,0.0) 0%, rgba(10,10,12,0.55) 70%, rgba(0,0,0,0.75) 100%)',
        }}
      />

      {/* Intro: logo + Begin button */}
      <div
        className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center"
        style={{
          opacity: intro ? 1 : 0,
          pointerEvents: intro ? 'auto' : 'none',
          transition: 'opacity 0.7s ease',
          transform: 'translateY(4vh)',
        }}
      >
        <p
          className="select-none"
          style={{
            fontFamily: 'var(--font-body), sans-serif',
            fontSize: 'clamp(0.8rem, 1.4vw, 1rem)',
            letterSpacing: '0.05em',
            color: 'rgba(255,255,255,0.5)',
            marginBottom: '0.5em',
          }}
        >
          Remember With
        </p>

        <LogoBlur text="ECHO" circleSize={0.7} circleEdge={0.5} blur={12} />

        <button
          type="button"
          onClick={begin}
          className="echo-cta"
          style={{
            marginTop: 'clamp(0.75rem, 2vh, 1.5rem)',
            height: '52px',
            padding: '0 40px',
            borderRadius: '999px',
            background: 'transparent',
            border: '1px solid #ffffff',
            color: '#ffffff',
            fontFamily: 'var(--font-body), sans-serif',
            fontSize: 'clamp(0.8rem, 1.4vw, 1rem)',
            letterSpacing: '0.05em',
            cursor: 'pointer',
          }}
        >
          Start
        </button>
      </div>

      {/* Prompt phase: top logo */}
      <div
        aria-hidden={!onPrompt}
        className="absolute left-1/2 top-[6%] z-20"
        style={{
          opacity: onPrompt ? 1 : 0,
          transform: onPrompt ? 'translate(-50%, 0)' : 'translate(-50%, -36px)',
          transition: 'opacity 0.7s ease, transform 0.7s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <LogoBlur text="ECHO" fontMin={28.8} fontVw={0.045} fontMax={57.6} blur={6} circleSize={0.7} />
      </div>

      {onPrompt && (
        <div className="absolute inset-0 z-20 flex items-center justify-center px-6">
          <input
            type="text"
            aria-label="What do you want to remember?"
            placeholder="What do you want to remember?"
            className="echo-prompt-input echo-prompt-rise"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitPrompt();
            }}
            style={{
              width: 'min(340px, 80%)',
              height: '44px',
              borderRadius: '18px 18px 18px 18px',
              background: 'transparent',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: '#ffffff',
              caretColor: '#ffffff',
              textAlign: 'left',
              padding: '0 18px',
              fontFamily: 'var(--font-body), sans-serif',
              fontWeight: 400,
              fontSize: 'clamp(0.8rem, 1vw, 0.95rem)',
              outline: 'none',
            }}
          />
        </div>
      )}

      {phase === 'loading' && (
        <div className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center">
          <p
            className="select-none"
            style={{
              fontFamily: 'var(--font-body), sans-serif',
              fontSize: 'clamp(0.9rem, 1.6vw, 1.25rem)',
              letterSpacing: '0.15em',
              color: 'rgba(255,255,255,0.8)',
            }}
          >
            Creating your memory
          </p>
          <div className="mt-5 flex gap-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="echo-dot"
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  animationDelay: `${i * 0.18}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {phase === 'memory' && <MemoryScreen onBegin={startGenerating} />}
      {phase === 'generating' && <GeneratingScreen onDone={() => setPhase('gallery')} />}
      {phase === 'gallery' && (
        <GalleryScreen photoUrl={memory?.photoUrl ?? null} name={memory?.name} />
      )}

      {phase === 'gallery' && (
        <button
          type="button"
          onClick={() => setPhase('memories')}
          aria-label="My Memories"
          className="echo-cta"
          style={{
            position: 'absolute',
            left: 'clamp(1.25rem, 4vw, 2.5rem)',
            bottom: 'clamp(1.25rem, 4vh, 2.5rem)',
            zIndex: 55,
            height: '44px',
            padding: '0 26px',
            borderRadius: '22px',
            border: '1px solid rgba(255,255,255,0.35)',
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0) 52%, rgba(255,255,255,0.12)), rgba(16,17,22,0.46)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)',
            color: '#ffffff',
            fontFamily: 'var(--font-body), sans-serif',
            fontSize: '0.8rem',
            letterSpacing: '0.02em',
            cursor: 'pointer',
          }}
        >
          My Memories
        </button>
      )}

      {phase === 'memories' && (
        <MemoriesScreen
          onBack={() => setPhase('gallery')}
          onLogoClick={() => setPhase('prompt')}
          onOpen={(m) => {
            setMemory({ name: m.name, photoUrl: m.cover });
            setPhase('gallery');
          }}
        />
      )}

      <div className="absolute right-0 top-0 z-60 flex items-center justify-end gap-3 pt-[clamp(1.25rem,4vh,2.5rem)] pr-[clamp(1.25rem,4vw,2.5rem)]">
        <button
          type="button"
          onClick={reset}
          aria-label="Start over"
          title="Start over"
          className="echo-cta grid place-items-center"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.35)',
            color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer',
            opacity: intro ? 0 : 1,
            pointerEvents: intro ? 'none' : 'auto',
            transition: 'opacity 0.5s ease',
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M3 12a9 9 0 1 0 2.64-6.36" />
            <path d="M3 3v6h6" />
          </svg>
        </button>
        <SoundToggle />
      </div>

      {/* Noise overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.16'/%3E%3C/svg%3E")`,
          backgroundSize: '180px 180px',
          mixBlendMode: 'overlay',
          opacity: 0.5,
        }}
      />
    </div>
  );
}
