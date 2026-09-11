"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { DARK, LIGHT, labelTexture, type Palette, type Tex } from "./system-scene";

// Founders finding each other across the country. The lower 48 fill the whole hero as a blueprint, zoomed in, and the
// view travels from one founder to the next in a chain: the map pans so the city we just landed on sits to the right,
// while the quieter part of the map runs under the copy on the left. Every name and pairing is made up.

type MapData = { aspect: number; lines: number[][]; cities: Record<string, [number, number]> };
const W = 2.3; // map width in scene units
const SEG = 48; // points per arc
const FOV = 30;
const TILT = -0.32;
const HOLD0 = 0.6, MOVE = 1.8, HOLD1 = 2.4, HOP = HOLD0 + MOVE + HOLD1; // one leg of the journey, in seconds
const START = "Chicago";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
function rng(seed: number) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function disc() {
  const c = document.createElement("canvas"); c.width = c.height = 64; const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32); grd.addColorStop(0, "rgba(255,255,255,1)"); grd.addColorStop(0.5, "rgba(255,255,255,0.9)"); grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
}

type Hop = { a: string; b: string; t0: number; curve: THREE.QuadraticBezierCurve3 | null; geo: THREE.BufferGeometry; line: THREE.Line };

function Scene({ data, pal, onReady }: { data: MapData; pal: Palette; onReady?: () => void }) {
  const drawn = useRef(0);
  const names = useMemo(() => Object.keys(data.cities), [data]);
  const at = (n: string) => { const [x, y] = data.cities[n]; return new THREE.Vector3((x * W) / 2, (y * W) / 2, 0); };
  const { width, height } = useThree((s) => s.size);
  const portrait = width < 768;
  const aspect = width / height;
  const visW = portrait ? 1.15 : 1.55; // map units across the viewport: about two thirds of the country
  const px = visW / width; // map units per CSS pixel, so sprites keep a pixel size at any zoom
  const half = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
  const dist = visW / (2 * half * aspect);
  // where the city we travel to lands on screen: right of centre on desktop, upper half on phones with the copy below
  const focus = useMemo(() => portrait ? new THREE.Vector3(0.1 * half * aspect * dist, 0.4 * half * dist, 0) : new THREE.Vector3(0.52 * half * aspect * dist, -0.02 * half * dist, 0), [portrait, half, aspect, dist]);
  const maxHop = (portrait ? 0.34 : 0.42) * W, minHop = 0.12 * W;

  const borders = useMemo(() => {
    const arr: number[] = [];
    for (const l of data.lines) for (let i = 0; i + 3 < l.length; i += 2) arr.push((l[i] * W) / 2, (l[i + 1] * W) / 2, 0, (l[i + 2] * W) / 2, (l[i + 3] * W) / 2, 0);
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3)); return g;
  }, [data]);
  const dot = useMemo(disc, []);
  const labels = useMemo(() => Object.fromEntries(names.map((n) => [n, labelTexture(`Founder · ${n}`, pal, "human")])) as Record<string, Tex>, [names, pal]);
  const hops = useMemo<Hop[]>(() => Array.from({ length: 2 }, () => {
    const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(SEG * 3), 3));
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
    line.frustumCulled = false; // its bounds are computed once from empty points, so culling would hide the trail as the map pans
    return { a: "", b: "", t0: -1e9, curve: null, geo, line };
  }), []);
  const rand = useMemo(() => rng(7), []);
  const journey = useRef({ cur: START, n: 0, t0: -1e9, recent: [START] });
  const group = useRef<THREE.Group>(null);
  const pulses = useRef<(THREE.Sprite | null)[]>([]);
  const tags = useRef<(THREE.Sprite | null)[]>([]);
  const dots = useRef<(THREE.Sprite | null)[]>([]);
  const settled = useRef(false);
  const clock = useRef(0); // our own clock: fiber resets its own whenever the frameloop is paused and resumed
  // a theme change recolours the trail and the tags in flight; the journey itself carries on
  useEffect(() => {
    hops.forEach((h, i) => {
      (h.line.material as THREE.LineBasicMaterial).color.set(pal.blue);
      const s = tags.current[i]; if (s && h.b) { s.material.map = labels[h.b].tex; s.material.needsUpdate = true; }
    });
  }, [pal, labels, hops]);

  const spawn = (t: number) => {
    const j = journey.current; const from = at(j.cur);
    let pool = names.filter((n) => !j.recent.includes(n) && from.distanceTo(at(n)) > minHop && from.distanceTo(at(n)) < maxHop);
    if (!pool.length) pool = names.filter((n) => n !== j.cur);
    const b = pool[Math.floor(rand() * pool.length)];
    const hop = hops[j.n % 2]; hop.a = j.cur; hop.b = b; hop.t0 = j.n === 0 ? t - HOLD0 : t; // the first leg sets off at once
    const A = from, B = at(b); const mid = A.clone().add(B).multiplyScalar(0.5); mid.y += 0.22 * A.distanceTo(B); mid.z = 0.05; // bows upward on screen, so it reads as an arc from a near-top view
    hop.curve = new THREE.QuadraticBezierCurve3(A, mid, B);
    const pos = hop.geo.getAttribute("position") as THREE.BufferAttribute;
    hop.curve.getPoints(SEG - 1).forEach((p, i) => pos.setXYZ(i, p.x, p.y, p.z)); pos.needsUpdate = true;
    const s = tags.current[j.n % 2]; if (s) { const tex = labels[b]; s.material.map = tex.tex; s.material.needsUpdate = true; s.scale.set(36 * px * tex.aspect, 36 * px, 1); }
    j.cur = b; j.recent = [...j.recent, b].slice(-6); j.n++; j.t0 = hop.t0;
  };

  useFrame((state, dt) => {
    if (++drawn.current === 3) onReady?.(); // a few frames in, the live scene has replaced the still
    clock.current += Math.min(dt, 0.1); const t = clock.current; const j = journey.current;
    state.camera.position.set(0, 0, dist);
    if (t - j.t0 >= HOP) spawn(t);
    const g = group.current; const cur = hops[(j.n + 1) % 2];
    if (g && cur.curve) {
      // pan the map so the point we are travelling to sits on the focus spot; the pan eases behind the arc
      const k = smooth(HOLD0, HOLD0 + MOVE, t - cur.t0);
      const F = cur.curve.v0.clone().lerp(cur.curve.v2, k).applyEuler(g.rotation);
      const goal = focus.clone().sub(F);
      if (!settled.current) { g.position.copy(goal); settled.current = true; }
      else g.position.set(THREE.MathUtils.damp(g.position.x, goal.x, 6, dt), THREE.MathUtils.damp(g.position.y, goal.y, 6, dt), THREE.MathUtils.damp(g.position.z, goal.z, 6, dt));
    }
    hops.forEach((h, i) => {
      if (!h.curve) return;
      const age = t - h.t0, grow = smooth(HOLD0, HOLD0 + MOVE, age), fade = 1 - smooth(HOP + HOLD0, HOP + HOLD0 + MOVE * 0.7, age);
      h.geo.setDrawRange(0, Math.max(2, Math.floor(grow * SEG)));
      (h.line.material as THREE.LineBasicMaterial).opacity = 0.9 * fade;
      const pulse = pulses.current[i];
      if (pulse) { pulse.position.copy(h.curve.getPoint(grow)); pulse.scale.setScalar(16 * px); pulse.material.opacity = smooth(HOLD0, HOLD0 + 0.2, age) * (1 - smooth(HOLD0 + MOVE, HOLD0 + MOVE + 0.5, age)); }
      const tag = tags.current[i]; const B = h.curve.v2;
      if (tag) { tag.position.set(B.x, B.y + 26 * px, 0.02); tag.material.opacity = smooth(HOLD0 + MOVE * 0.85, HOLD0 + MOVE + 0.15, age) * fade; }
    });
    names.forEach((n, i) => {
      const s = dots.current[i]; if (!s) return;
      const lit = hops.some((h) => h.b === n && t - h.t0 > HOLD0 + MOVE * 0.9 && t - h.t0 < HOP + HOLD0 + MOVE * 0.5);
      const k = (lit ? 18 : 10) * px * (1 + 0.08 * Math.sin(t * 2 + i)); s.scale.set(k, k, 1); s.material.opacity = lit ? 1 : 0.6;
    });
  });

  return (
    <group ref={group} rotation={[TILT, 0, 0]}>
      <lineSegments geometry={borders}><lineBasicMaterial color={pal.blue} transparent opacity={pal.flat ? 0.6 : 0.85} /></lineSegments>
      {names.map((n, i) => (
        <sprite key={n} ref={(el) => { dots.current[i] = el; }} position={at(n)} scale={[9 * px, 9 * px, 1]}><spriteMaterial map={dot} color={pal.blue} transparent opacity={0.6} depthWrite={false} /></sprite>
      ))}
      {hops.map((h, i) => (
        <group key={i}>
          <primitive object={h.line} />
          <sprite ref={(el) => { pulses.current[i] = el; }} scale={[14 * px, 14 * px, 1]}><spriteMaterial map={dot} color={pal.blue} transparent opacity={0} depthWrite={false} /></sprite>
          <sprite ref={(el) => { tags.current[i] = el; }} scale={[0.1, 0.1, 1]} renderOrder={3}><spriteMaterial transparent opacity={0} depthWrite={false} /></sprite>
        </group>
      ))}
    </group>
  );
}

export default function TravelMap({ dark, onReady }: { dark: boolean; onReady?: () => void }) {
  const [data, setData] = useState<MapData | null>(null);
  useEffect(() => { fetch("/us-outline.json").then((r) => r.json()).then(setData).catch(() => {}); }, []);
  const box = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(true);
  useEffect(() => { const el = box.current; if (!el) return; const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { rootMargin: "25% 0px" }); io.observe(el); return () => io.disconnect(); }, []);
  return (
    <div ref={box} className="absolute inset-0" aria-hidden>
      {data && (
        <Canvas frameloop={onScreen ? "always" : "never"} dpr={[1, 1.75]} gl={{ alpha: true, antialias: true }} camera={{ fov: FOV, position: [0, 0, 3], near: 0.05, far: 30 }}>
          <Scene data={data} pal={dark ? DARK : LIGHT} onReady={onReady} />
        </Canvas>
      )}
    </div>
  );
}
