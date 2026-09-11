"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  siGmail, siProtonmail, siMailchimp, siDiscord, siIntercom, siZoom, siGooglemeet, siLoom,
  siGooglesheets, siAirtable, siClickup, siHubspot, siZoho, siQuickbooks, siXero, siStripe,
  siNotion, siGoogledrive, siDropbox, siGooglecalendar, siCalendly, siCaldotcom,
  siTrello, siAsana, siJira, siShopify, siZendesk, siFigma, siGithub, siLinear, siTypeform, siPaypal,
  siSquare, siWise, siMiro, siWebflow, siWordpress, siBasecamp, siBrevo, siGoogleanalytics, siGoogleforms, siTodoist,
} from "simple-icons";

// The system as an object: a wireframe brain that smooths into a polyhedron with eight sources orbiting it, under a sky of points.
// Scroll progress (0 to 1, from the page) drives the morph, the orbit, the digestion, the camera and the outputs.

type Mark = { title: string; path: string; hex: string };
// Slack and Salesforce are not in simple-icons (both brands asked to be removed), so their marks live here.
const slack: Mark = { title: "Slack", hex: "4A154B", path: "M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" };
const salesforce: Mark = { title: "Salesforce", hex: "00A1E0", path: "M10.006 5.415a4.195 4.195 0 0 1 3.045-1.306c1.56 0 2.954.9 3.69 2.205.63-.3 1.35-.45 2.1-.45 2.85 0 5.159 2.34 5.159 5.22s-2.31 5.22-5.176 5.22c-.345 0-.69-.044-1.02-.104a3.75 3.75 0 0 1-3.3 1.95c-.6 0-1.155-.15-1.65-.375A4.314 4.314 0 0 1 8.88 20.4a4.302 4.302 0 0 1-4.05-2.85c-.27.061-.54.075-.825.075-2.204 0-4.005-1.8-4.005-4.05 0-1.5.811-2.805 2.01-3.51-.255-.57-.39-1.2-.39-1.846 0-2.58 2.1-4.65 4.65-4.65 1.53 0 2.88.72 3.735 1.845" };

const SOURCES: { name: string; marks: Mark[] }[] = [
  { name: "Email", marks: [siGmail, siProtonmail, siMailchimp] },
  { name: "Messaging", marks: [slack, siDiscord, siIntercom] },
  { name: "Calls", marks: [siZoom, siGooglemeet, siLoom] },
  { name: "Spreadsheets", marks: [siGooglesheets, siAirtable, siClickup] },
  { name: "CRM", marks: [salesforce, siHubspot, siZoho] },
  { name: "Accounting", marks: [siQuickbooks, siXero, siStripe] },
  { name: "Documents", marks: [siNotion, siGoogledrive, siDropbox] },
  { name: "Calendar", marks: [siGooglecalendar, siCalendly, siCaldotcom] },
];
// What the core takes in while it works: facts about the business, and the decisions people make on its proposals.
const INGEST: { text: string; human: boolean }[] = [
  { text: "Your rules", human: false }, { text: "Accept", human: true }, { text: "Your tone", human: false },
  { text: "Approval steps", human: false }, { text: "Edit", human: true }, { text: "Vendor list", human: false },
  { text: "Past decisions", human: false }, { text: "Reject", human: true }, { text: "Who owns what", human: false },
];
const STATUS = ["Reading your rules", "Learning your tone", "Mapping your systems", "Generating skills", "Writing code", "Testing on real cases", "Your team reviews each proposal", "Learning from every edit"];
// What comes out: some with detail, some as a plain line.
const OUTPUTS: { title: string; sub?: string }[] = [
  { title: "Weekly digest", sub: "Monday, 7:00" }, { title: "Ledger reconciled" }, { title: "Draft reply", sub: "Ready for review" },
  { title: "Follow-up sent" }, { title: "Flagged invoice", sub: "Duplicate vendor" }, { title: "Intro suggested" },
  { title: "Renewal alert", sub: "34 days out" }, { title: "Report ready" }, { title: "Call summary", sub: "Sent to the team" },
  { title: "Priority list" }, { title: "CRM updated", sub: "12 records" }, { title: "Vendor check" },
];

const N = SOURCES.length;
const SEG = 24; // segments per connector curve
const PER = 3; // particles per connector
const CORE_R = 1.15;
const RING_R = 2.0;
const TILT = 0.55;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
function rng(seed: number) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const smooth = (a: number, b: number, x: number) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const STARS = 8600; // the sky behind everything, for the whole section; about a third is in view at a time
const INFLOW = 520; // points that stream into the brain while the page opens
// Tools that drift by while the brain works and get left behind when the system forms.
const EXTRA: Mark[] = [siTrello, siAsana, siJira, siShopify, siZendesk, siFigma, siGithub, siLinear, siTypeform, siPaypal, siSquare, siWise, siMiro, siWebflow, siWordpress, siBasecamp, siBrevo, siGoogleanalytics, siGoogleforms, siTodoist];
// A loose orbit: its own axis, radius, speed and phase, so nothing lines up with anything else.
function loose(seed: number, rMin: number, rMax: number) {
  const r = rng(seed);
  const axis = new THREE.Vector3(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1).normalize();
  const base = new THREE.Vector3(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1).cross(axis).normalize().multiplyScalar(rMin + r() * (rMax - rMin));
  return { axis, base, speed: (0.06 + r() * 0.12) * (r() < 0.5 ? -1 : 1), phase: r() * Math.PI * 2 };
}
const LOOSE_SAT = SOURCES.flatMap((_, i) => [0, 1, 2].map((k) => loose(300 + i * 3 + k, 2.4, 6.0)));
const LOOSE_EXTRA = EXTRA.map((_, j) => loose(500 + j, 2.6, 6.5));
// Where the sulci run: a striped field folded by a few waves, so its zero lines wander like the grooves of a cortex. Mirrored across the fissure.
function sulcusField(x: number, y: number, z: number) {
  const warp = 1.2 * Math.sin(3.1 * x + 2.3 * y - 1.7 * z + 0.5) + 0.9 * Math.sin(-2.2 * x + 3.7 * z + 1.9 * y + 2.1) + 0.8 * Math.sin(7.3 * y + 2.1 * x - 5.9 * z + 4) + 0.6 * Math.sin(9.1 * z - 6.2 * x + 4.3 * y + 1.1) + 0.7 * Math.sin(11 * x + 8 * y - 6 * z + 2.6);
  return Math.sin(20 * (0.8 * y + 0.55 * z + 0.35 * Math.abs(x)) + warp);
}
// The brain surface as a radius for each direction: wider than tall, longer than wide, flatter underneath,
// split by the fissure along the top, and dipped along every sulcus so the surface and its lines agree.
function brainRadius(x: number, y: number, z: number) {
  const b = 0.62 + 0.16 * smooth(-0.25, 0.25, y);
  const r = 1.06 / Math.sqrt(x * x + (y * y) / (b * b) + (z * z) / (1.22 * 1.22));
  const groove = Math.exp(-(x * x) / 0.012) * smooth(-0.25, 0.2, y);
  const f = sulcusField(x, y, z);
  return r * (1 - 0.15 * groove - 0.05 * Math.exp(-(f * f) / 0.12) * (1 - groove));
}
// Two geometries: a light wire for the surface, and the sulci as line segments traced where the field crosses zero.
// Both carry their own point on the sphere (aTarget) and their surface direction (aNormal), for the morph and the depth fade.
function brainGeometry() {
  const build = (pos: number[], dir: number[]) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("aTarget", new THREE.Float32BufferAttribute(dir.map((v) => v * CORE_R), 3));
    g.setAttribute("aNormal", new THREE.Float32BufferAttribute(dir, 3));
    return g;
  };
  const place = (pos: number[], dir: number[], x: number, y: number, z: number) => { const k = brainRadius(x, y, z) * CORE_R; pos.push(x * k, y * k, z * k); dir.push(x, y, z); };
  const wp: number[] = [], wd: number[] = [];
  const coarse = new THREE.IcosahedronGeometry(1, 3).getAttribute("position").array as Float32Array;
  for (let i = 0; i < coarse.length; i += 3) place(wp, wd, coarse[i], coarse[i + 1], coarse[i + 2]);
  const sp: number[] = [], sd: number[] = [];
  const fine = new THREE.IcosahedronGeometry(1, 32).getAttribute("position").array as Float32Array; // detail is edge subdivisions here, so this is about 22k triangles
  const f = [0, 0, 0]; const pts: number[][] = [];
  for (let t = 0; t < fine.length; t += 9) {
    for (let k = 0; k < 3; k++) f[k] = sulcusField(fine[t + k * 3], fine[t + k * 3 + 1], fine[t + k * 3 + 2]);
    pts.length = 0;
    for (let e = 0; e < 3; e++) {
      const g = (e + 1) % 3; if ((f[e] < 0) === (f[g] < 0)) continue;
      const u = f[e] / (f[e] - f[g]); const a = t + e * 3, b = t + g * 3;
      const px = fine[a] * (1 - u) + fine[b] * u, py = fine[a + 1] * (1 - u) + fine[b + 1] * u, pz = fine[a + 2] * (1 - u) + fine[b + 2] * u;
      const l = Math.hypot(px, py, pz); pts.push([px / l, py / l, pz / l]);
    }
    if (pts.length !== 2 || Math.abs(pts[0][0]) < 0.06 || Math.abs(pts[1][0]) < 0.06) continue; // the fissure stays clear
    for (const q of pts) place(sp, sd, q[0], q[1], q[2]);
  }
  return { wire: build(wp, wd), sulci: build(sp, sd) };
}
// Lines that morph between the brain and the sphere on the GPU, and fade where the surface turns away from the camera.
class BrainMaterial extends THREE.ShaderMaterial {
  constructor(color: string, opacity: number, wireframe: boolean) {
    super({
      uniforms: { uColor: { value: new THREE.Color(color) }, uOpacity: { value: opacity }, uMorph: { value: 0 } },
      vertexShader: `attribute vec3 aTarget; attribute vec3 aNormal; uniform float uMorph; varying float vFace;
        void main() { vec4 mv = modelViewMatrix * vec4(mix(position, aTarget, uMorph), 1.0); gl_Position = projectionMatrix * mv;
          vFace = dot(normalize(normalMatrix * aNormal), normalize(-mv.xyz)); }`,
      fragmentShader: `uniform vec3 uColor; uniform float uOpacity; varying float vFace;
        void main() {
          gl_FragColor = vec4(uColor, uOpacity * (0.16 + 0.84 * smoothstep(-0.45, 0.35, vFace)));
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
      transparent: true, depthWrite: false, wireframe,
    });
  }
}
// A soft round point with its own alpha, shared by the sky and the stream.
const SPARK_FRAG = `uniform vec3 uColor; uniform float uOpacity; varying float vA;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0; float a = smoothstep(1.0, 0.35, d) * vA * uOpacity; if (a < 0.004) discard;
    gl_FragColor = vec4(uColor, a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`;
const SPARK_ATTRS = `attribute float aAlpha; attribute float aSize; attribute float aPhase; attribute float aSpeed; uniform float uTime; uniform float uPx; varying float vA;`;
// Points in the scene with their own brightness, size and twinkle: the stream that pours into the brain.
class SparkMaterial extends THREE.ShaderMaterial {
  constructor(color: string, opacity: number) {
    super({
      uniforms: { uColor: { value: new THREE.Color(color) }, uOpacity: { value: opacity }, uTime: { value: 0 }, uPx: { value: 1 } },
      vertexShader: `${SPARK_ATTRS}
        void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_PointSize = aSize * uPx; vA = aAlpha * (0.72 + 0.28 * sin(uTime * aSpeed + aPhase)); }`,
      fragmentShader: SPARK_FRAG, transparent: true, depthWrite: false,
    });
  }
}
// The sky. Each star keeps a screen position and a depth; the shader places it in front of the camera, so the field fills the whole
// view at any size and any point of the scroll, drifts and twinkles on its own, and slides a little with the scroll, nearer stars more.
class SkyMaterial extends THREE.ShaderMaterial {
  constructor(color: string, opacity: number) {
    super({
      uniforms: { uColor: { value: new THREE.Color(color) }, uOpacity: { value: opacity }, uTime: { value: 0 }, uPx: { value: 1 }, uTan: { value: 0.29 }, uAspect: { value: 1.6 }, uSlide: { value: 0 } },
      vertexShader: `${SPARK_ATTRS} uniform float uTan; uniform float uAspect; uniform float uSlide;
        void main() {
          float d = position.z; float near = 12.0 / d;
          vec2 s = position.xy + vec2(uSlide * near + 0.02 * near * cos(uTime * 0.09 * aSpeed + aPhase), 0.016 * near * sin(uTime * 0.11 * aSpeed + 1.7 * aPhase));
          gl_Position = projectionMatrix * vec4(s.x * d * uTan * uAspect, s.y * d * uTan, -d, 1.0);
          gl_PointSize = aSize * uPx; vA = aAlpha * (0.7 + 0.3 * sin(uTime * aSpeed + aPhase)); }`,
      fragmentShader: SPARK_FRAG, transparent: true, depthWrite: false,
    });
  }
}

export type Palette = {
  blue: string; dim: string; page: string; flat: boolean; line: string; ink: string; muted: string; tint: string; star: string;
  label: { bg: string; fg: string; sub: string; dot: string }; human: { bg: string; fg: string }; badge: { bg: string; line: string };
};
export const LIGHT: Palette = {
  blue: "#1d4ed8", dim: "#3b82f6", page: "#ece8e2", flat: false, line: "#cfcac3", ink: "#1c1917", muted: "#78716c", tint: "#dbeafe", star: "#1d4ed8",
  label: { bg: "#ffffff", fg: "#1c1917", sub: "#78716c", dot: "#2563eb" }, human: { bg: "#e7e5e4", fg: "#1c1917" }, badge: { bg: "#ffffff", line: "#cfcac3" },
};
export const DARK: Palette = {
  blue: "#60a5fa", dim: "#3b82f6", page: "#1c2233", flat: true, line: "#2a3142", ink: "#f5f5f4", muted: "#9aa3b2", tint: "#1b2a45", star: "#93c5fd",
  label: { bg: "#1b2030", fg: "#f5f5f4", sub: "#9aa3b2", dot: "#60a5fa" }, human: { bg: "#2a3142", fg: "#f5f5f4" }, badge: { bg: "#1b2030", line: "#2a3142" },
};

// Brand colours, quieted a little, and a neutral when a mark would vanish against the badge behind it.
function markColor(hex: string, dark: boolean) {
  let r = parseInt(hex.slice(0, 2), 16) / 255, g = parseInt(hex.slice(2, 4), 16) / 255, b = parseInt(hex.slice(4, 6), 16) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  if (dark && lum < 0.3) return "rgba(214,211,209,0.8)";
  if (!dark && lum > 0.72) return "rgba(120,113,108,0.85)";
  const k = dark ? 0.6 : 0.8;
  r = r * k + lum * (1 - k); g = g * k + lum * (1 - k); b = b * k + lum * (1 - k);
  return `rgba(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)},${dark ? 0.8 : 0.92})`;
}
function pageFont() { if (typeof document === "undefined") return "system-ui"; const el = document.querySelector(".hp") ?? document.body; return getComputedStyle(el).fontFamily || "system-ui"; }
function finish(c: HTMLCanvasElement) { const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; return tex; }
const M = 12; // margin around every texture, room for the shadow
function shadow(g: CanvasRenderingContext2D) { g.shadowColor = "rgba(0,0,0,0.28)"; g.shadowBlur = 14; g.shadowOffsetY = 5; }
// A round badge with the mark inside, as a texture, so the badge lives in the 3D scene.
function badgeTexture(m: Mark, pal: Palette) {
  const S = 160; const c = document.createElement("canvas"); c.width = c.height = S; const g = c.getContext("2d")!;
  const r = S / 2 - M;
  g.save(); shadow(g); g.beginPath(); g.arc(S / 2, S / 2, r, 0, Math.PI * 2); g.fillStyle = pal.badge.bg; g.fill(); g.restore();
  g.beginPath(); g.arc(S / 2, S / 2, r, 0, Math.PI * 2); g.lineWidth = 3; g.strokeStyle = pal.badge.line; g.stroke();
  const icon = 68; g.save(); g.translate(S / 2 - icon / 2, S / 2 - icon / 2); g.scale(icon / 24, icon / 24); g.fillStyle = markColor(m.hex, pal.flat); g.fill(new Path2D(m.path)); g.restore();
  return finish(c);
}
// The bare mark in the colour of the stars, no disc: how a tool looks while it drifts through space, before the system picks it.
function spaceBadgeTexture(m: Mark, pal: Palette) {
  const S = 160; const c = document.createElement("canvas"); c.width = c.height = S; const g = c.getContext("2d")!;
  const icon = 116; g.save(); g.translate(S / 2 - icon / 2, S / 2 - icon / 2); g.scale(icon / 24, icon / 24); g.fillStyle = pal.star; g.fill(new Path2D(m.path)); g.restore();
  return finish(c);
}
export type Tex = { tex: THREE.Texture; aspect: number };
// A one-line label. "fact" is something the system takes in, marked with a blue dot; "human" is a decision a person made, with a small figure.
export function labelTexture(text: string, pal: Palette, style: "card" | "fact" | "human" = "card"): Tex {
  const H = 96, pad = 30; const font = `500 42px ${pageFont()}`;
  const m = document.createElement("canvas").getContext("2d")!; m.font = font;
  const lead = style === "human" ? 48 : style === "fact" ? 30 : 0;
  const W = Math.ceil(m.measureText(text).width) + pad * 2 + lead;
  const c = document.createElement("canvas"); c.width = W + M * 2; c.height = H + M * 2; const g = c.getContext("2d")!;
  const bg = style === "human" ? pal.human.bg : pal.label.bg; const fg = style === "human" ? pal.human.fg : pal.label.fg;
  g.save(); shadow(g); g.beginPath(); g.roundRect(M, M, W, H, 18); g.fillStyle = bg; g.fill(); g.restore();
  const cy = M + H / 2;
  if (style === "human") { // head and shoulders
    g.fillStyle = fg; g.beginPath(); g.arc(M + pad + 14, cy - 11, 10, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(M + pad + 14, cy + 20, 18, Math.PI, 0); g.closePath(); g.fill();
  }
  if (style === "fact") { g.fillStyle = pal.label.dot; g.beginPath(); g.arc(M + pad + 7, cy + 1, 8, 0, Math.PI * 2); g.fill(); }
  g.font = font; g.fillStyle = fg; g.textBaseline = "middle"; g.textAlign = "left"; g.fillText(text, M + pad + lead, cy + 1);
  return { tex: finish(c), aspect: c.width / c.height };
}
// A two-line card: what it is, and the detail that makes it real.
function cardTexture(title: string, sub: string, pal: Palette): Tex {
  const H = 150, pad = 36; const f1 = `600 42px ${pageFont()}`, f2 = `400 33px ${pageFont()}`;
  const m = document.createElement("canvas").getContext("2d")!;
  m.font = f1; const w1 = m.measureText(title).width; m.font = f2; const w2 = m.measureText(sub).width;
  const W = Math.ceil(Math.max(w1, w2)) + pad * 2;
  const c = document.createElement("canvas"); c.width = W + M * 2; c.height = H + M * 2; const g = c.getContext("2d")!;
  g.save(); shadow(g); g.beginPath(); g.roundRect(M, M, W, H, 20); g.fillStyle = pal.label.bg; g.fill(); g.restore();
  g.textBaseline = "middle"; g.textAlign = "left";
  g.font = f1; g.fillStyle = pal.label.fg; g.fillText(title, M + pad, M + 54);
  g.font = f2; g.fillStyle = pal.label.sub; g.fillText(sub, M + pad, M + 102);
  return { tex: finish(c), aspect: c.width / c.height };
}

function bezier(out: THREE.Vector3, a: THREE.Vector3, c: THREE.Vector3, b: THREE.Vector3, t: number) {
  const u = 1 - t;
  return out.set(
    u * u * a.x + 2 * u * t * c.x + t * t * b.x,
    u * u * a.y + 2 * u * t * c.y + t * t * b.y,
    u * u * a.z + 2 * u * t * c.z + t * t * b.z,
  );
}

function System({ progress, pal, onReady }: { progress: RefObject<number>; pal: Palette; onReady?: () => void }) {
  const drawn = useRef(0);
  const warm = useRef(false);
  const { gl, scene, camera } = useThree();
  // Warm the GPU under the still: every material compiled and every texture uploaded now, including the pieces that only
  // show once the reader scrolls. Otherwise the first scroll pays for that work in one long frame.
  useEffect(() => {
    scene.traverse((o) => { o.visible = true; }); // useFrame sets the real visibility again on the next frame
    scene.traverse((o) => {
      const m = (o as THREE.Mesh).material; const mats = Array.isArray(m) ? m : m ? [m] : [];
      for (const mat of mats) { const map = (mat as THREE.SpriteMaterial).map; if (map) gl.initTexture(map); }
    });
    const done = () => { warm.current = true; };
    const timer = setTimeout(done, 2500); // never hold the still hostage
    const r = gl as THREE.WebGLRenderer & { compileAsync?: (s: THREE.Object3D, c: THREE.Camera) => Promise<unknown> };
    if (r.compileAsync) r.compileAsync(scene, camera).then(done, done); else { gl.compile(scene, camera); done(); }
    return () => clearTimeout(timer);
  }, [gl, scene, camera, pal]);
  const core = useRef<THREE.Group>(null);
  const shell = useRef<THREE.LineSegments>(null);
  const nodes = useRef<(THREE.Group | null)[]>([]);
  const flow = useRef<THREE.Points>(null);
  const wireMat = useRef<THREE.MeshBasicMaterial>(null);
  const linkMat = useRef<THREE.LineBasicMaterial>(null);
  const lblA = useRef<HTMLSpanElement>(null);
  const lblB = useRef<HTMLSpanElement>(null);
  const status = useRef<HTMLSpanElement>(null);
  const statusIdx = useRef(-1);
  const deformed = useRef(false);
  const labelSprites = useRef<(THREE.Sprite | null)[]>([]);
  const satSprites = useRef<(THREE.Sprite | null)[]>([]);
  const ingestSprites = useRef<(THREE.Sprite | null)[]>([]);
  const outSprites = useRef<(THREE.Sprite | null)[]>([]);
  const outLines = useRef<(THREE.LineSegments | null)[]>([]);
  const body = useRef<THREE.Mesh>(null);
  const dotMat = useRef<THREE.PointsMaterial>(null);
  const brainWire = useRef<THREE.Mesh>(null);
  const brainSulci = useRef<THREE.LineSegments>(null);
  const extraSprites = useRef<(THREE.Sprite | null)[]>([]);
  const spaceSprites = useRef<(THREE.Sprite | null)[]>([]);
  const stars = useRef<THREE.Points>(null);
  const inflow = useRef<THREE.Points>(null);

  const geo = useMemo(() => {
    const ico = new THREE.IcosahedronGeometry(CORE_R, 2);
    const pos = ico.getAttribute("position") as THREE.BufferAttribute;
    const orig = Float32Array.from(pos.array as Float32Array);
    const dots = new THREE.BufferGeometry();
    dots.setAttribute("position", pos); // shares the attribute, so the dots ride the deformation
    const shellEdges = new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.5, 1), 1);
    const mk = (n: number) => { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3)); return g; };
    const brain = brainGeometry();
    // sparks: position plus per-point brightness, size and twinkle
    const sparks = (n: number) => {
      const g = new THREE.BufferGeometry();
      const add = (name: string, size: number) => { const a = new THREE.BufferAttribute(new Float32Array(n * size), size); g.setAttribute(name, a); return a.array as Float32Array; };
      return { g, pos: add("position", 3), alpha: add("aAlpha", 1), size: add("aSize", 1), phase: add("aPhase", 1), speed: add("aSpeed", 1) };
    };
    const onSphere = (r: () => number, out: Float32Array, i: number, R: number) => { const u = r() * 2 - 1, a = r() * Math.PI * 2, s = Math.sqrt(1 - u * u); out.set([s * Math.cos(a) * R, u * R, s * Math.sin(a) * R], i * 3); };
    // the sky: a screen position with a wide margin all round (the view is offset, and it slides), and a depth for the parallax
    const r1 = rng(11); const starSp = sparks(STARS);
    for (let i = 0; i < STARS; i++) { starSp.pos.set([(r1() * 2 - 1) * 1.7, (r1() * 2 - 1) * 1.7, 12 + r1() * 28], i * 3); starSp.alpha[i] = 0.35 + 0.65 * r1() ** 2; starSp.size[i] = 1.3 + 2.7 * r1() ** 2; starSp.phase[i] = r1() * Math.PI * 2; starSp.speed[i] = 0.3 + r1() * 1.5; }
    const r2 = rng(23); const inSp = sparks(INFLOW); const inDir = new Float32Array(INFLOW * 3), inPhase = new Float32Array(INFLOW), inSpeed = new Float32Array(INFLOW), inAlpha = new Float32Array(INFLOW);
    for (let i = 0; i < INFLOW; i++) { onSphere(r2, inDir, i, 1); inPhase[i] = r2(); inSpeed[i] = 0.7 + 0.7 * r2(); inAlpha[i] = 0.6 + 0.4 * r2(); inSp.size[i] = 2.2 + 2.4 * r2(); inSp.phase[i] = Math.PI / 2; }
    return { ico, orig, dots, shellEdges, brain, starSp, inSp, inDir, inPhase, inSpeed, inAlpha, linkGeo: mk(N * SEG * 2), flowGeo: mk(N * PER), outGeos: OUTPUTS.map(() => mk(2)) };
  }, []);
  const disc = useMemo(() => {
    const c = document.createElement("canvas"); c.width = c.height = 64;
    const g = c.getContext("2d")!; const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, "rgba(255,255,255,1)"); grd.addColorStop(0.55, "rgba(255,255,255,0.9)"); grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(c); tex.needsUpdate = true; return tex;
  }, []);
  const spark = useMemo(() => ({ stars: new SkyMaterial(pal.star, pal.flat ? 1 : 0.9), inflow: new SparkMaterial(pal.star, 1) }), [pal]);
  const brainMats = useMemo(() => ({ wire: new BrainMaterial(pal.blue, pal.flat ? 0.22 : 0.26, true), sulci: new BrainMaterial(pal.blue, pal.flat ? 0.9 : 0.95, false) }), [pal]);
  const art = useMemo(() => ({
    labels: SOURCES.map((src) => labelTexture(src.name, pal)),
    badges: SOURCES.map((src) => src.marks.map((m) => badgeTexture(m, pal))),
    space: SOURCES.map((src) => src.marks.map((m) => spaceBadgeTexture(m, pal))),
    extras: EXTRA.map((m) => spaceBadgeTexture(m, pal)),
    ingest: INGEST.map((w) => labelTexture(w.text, pal, w.human ? "human" : "fact")),
    outputs: OUTPUTS.map((o) => (o.sub ? cardTexture(o.title, o.sub, pal) : labelTexture(o.title, pal))),
  }), [pal]);
  const tmp = useMemo(() => ({ a: new THREE.Vector3(), b: new THREE.Vector3(), c: new THREE.Vector3(), p: new THREE.Vector3(), d: new THREE.Vector3(), up: new THREE.Vector3(0, 1, 0) }), []);
  const cam = useMemo(() => ({ right: new THREE.Vector3(), up: new THREE.Vector3(), toCam: new THREE.Vector3(), world: new THREE.Vector3() }), []);
  const spikes = useMemo(() => Array.from({ length: 6 }, () => new THREE.Vector3()), []);
  // Fixed radial lanes in the camera plane, all the way around the core, so nothing crosses the centre.
  const lane = (n: number) => Array.from({ length: n }, (_, j) => (j * 2 * Math.PI) / n + 0.35);
  const inLanes = useMemo(() => lane(INGEST.length), []);
  const outLanes = useMemo(() => lane(OUTPUTS.length), []);
  // dashes travel along a line by shifting its distances
  const flowDashes = (ln: THREE.LineSegments, dir: number) => {
    ln.computeLineDistances();
    const ld = ln.geometry.getAttribute("lineDistance") as THREE.BufferAttribute;
    const off = dir * ((performance.now() / 1000) * 0.9 % 0.18);
    ld.setX(0, ld.getX(0) - off); ld.setX(1, ld.getX(1) - off); ld.needsUpdate = true;
  };

  const clock = useRef(0); // our own clock: fiber resets its own whenever the frameloop is paused and resumed
  useFrame((state, dt) => {
    if (warm.current && ++drawn.current === 3) onReady?.(); // warmed up and a few frames in: the live scene has replaced the still
    const p = progress.current ?? 0;
    clock.current += Math.min(dt, 0.1); const t = clock.current;
    // Timeline over a long track: brain to .2, sources to .34, converge .34 to .46, digestion .42 to .72, outputs from .7 to the end.
    const gather = smooth(0.01, 0.1, p); // loose tools glide onto the orbit; starts at once, so the first scroll already moves something
    const morph = smooth(0.01, 0.11, p); // the brain smooths into the sphere while the body grows inside it
    const converge = smooth(0.34, 0.46, p);
    const active = smooth(0.4, 0.5, p);
    const act = smooth(0.42, 0.5, p) * (1 - smooth(0.64, 0.72, p));
    const out = smooth(0.7, 0.8, p);

    // Camera: orbit with scroll, dolly in as the system takes over. Offset so the object sits right of the copy.
    const az = -0.5 + 1.05 * p;
    const el = 0.34;
    const { width, height } = state.size;
    const portrait = width < height;
    const fit = portrait ? 0.78 : 1; // phones: lanes and ring pulled in so nothing is cut at the edges
    const dist = (10.2 - 0.8 * gather - 1.0 * converge) * (portrait ? 1.7 : 1); // phones: smaller object, copy sits below it
    state.camera.position.set(Math.sin(az) * Math.cos(el) * dist, Math.sin(el) * dist, Math.cos(az) * Math.cos(el) * dist);
    state.camera.lookAt(0, 0, 0);
    (state.camera as THREE.PerspectiveCamera).setViewOffset(width, height, portrait ? 0 : -width * 0.21, portrait ? height * (0.22 - 0.06 * smooth(0.02, 0.14, p)) : 0, width, height); // phones: the brain sits high over the copy, the orb a little lower, clear of the nav
    state.camera.updateMatrixWorld();
    cam.right.setFromMatrixColumn(state.camera.matrixWorld, 0).normalize();
    cam.up.setFromMatrixColumn(state.camera.matrixWorld, 1).normalize();
    cam.toCam.copy(state.camera.position).normalize();
    // nothing floats over the copy: it sits left of the object on wide screens and below it on phones
    const copyTop = 0.25 - 0.3 * smooth(0.02, 0.1, p); // phones: the hero copy reaches high up the screen, the later beats sit low
    const screenFade = (v: THREE.Vector3) => { tmp.p.copy(v).project(state.camera); return portrait ? smooth(copyTop - 0.2, copyTop, tmp.p.y) : smooth(-0.2, -0.06, tmp.p.x); };
    const drift = (v: THREE.Vector3) => 0.14 * (0.55 + 0.45 * Math.min(1.2, v.distanceTo(state.camera.position) / 10)); // small, with a tamer perspective for what floats near the camera

    // Centre copy: name, then the running status, then the result.
    if (lblA.current) lblA.current.style.opacity = String(smooth(0.09, 0.14, p) * (1 - smooth(0.4, 0.48, p)));
    if (lblB.current) lblB.current.style.opacity = String(smooth(0.76, 0.84, p));
    if (status.current) {
      status.current.style.opacity = String(act);
      const idx = Math.floor(t / 1.3) % STATUS.length;
      if (idx !== statusIdx.current) { statusIdx.current = idx; status.current.textContent = STATUS[idx]; }
    }

    // Core: rotation, pulse, and a surface that wobbles and grows travelling spikes while it digests.
    if (core.current) {
      core.current.rotation.y += dt * (0.12 + 0.3 * (1 - morph) + 0.9 * act);
      core.current.rotation.x = 0.22 + Math.sin(t * 0.3) * 0.04;
      core.current.scale.setScalar(1 + act * 0.035 * Math.sin(t * 5));
    }
    if (body.current) { body.current.scale.setScalar(0.985 * morph); body.current.visible = morph > 0.02; }
    brainMats.wire.uniforms.uMorph.value = morph; brainMats.sulci.uniforms.uMorph.value = morph;
    const wireOn = 1 - smooth(0.8, 1, morph), sulciOn = 1 - smooth(0.45, 0.8, morph); // the grooves smooth out first, then the surface hands over to the orb
    brainMats.wire.uniforms.uOpacity.value = (pal.flat ? 0.22 : 0.26) * wireOn; brainMats.sulci.uniforms.uOpacity.value = (pal.flat ? 0.9 : 0.95) * sulciOn;
    if (brainWire.current) brainWire.current.visible = wireOn > 0.01;
    if (brainSulci.current) brainSulci.current.visible = sulciOn > 0.01;
    if (act > 0.001 || deformed.current) {
      const pa = geo.ico.getAttribute("position") as THREE.BufferAttribute;
      const arr = pa.array as Float32Array; const o = geo.orig; const inv = 1 / CORE_R;
      for (let k = 0; k < spikes.length; k++) spikes[k].set(Math.sin(t * 0.7 + k * 2.1), Math.cos(t * 0.5 + k * 1.3), Math.sin(t * 0.9 + k * 0.7)).normalize();
      for (let i = 0; i < arr.length; i += 3) {
        const x = o[i], y = o[i + 1], z = o[i + 2];
        const nx = x * inv, ny = y * inv, nz = z * inv;
        let d = 0.04 * Math.sin(3 * nx + t * 2.1) * Math.sin(2.5 * ny - t * 1.7) * Math.sin(2 * nz + t * 1.3);
        for (let k = 0; k < spikes.length; k++) { const dp = nx * spikes[k].x + ny * spikes[k].y + nz * spikes[k].z; if (dp > 0.6) d += Math.pow(dp, 60) * 0.32; }
        const r = 1 + act * d;
        arr[i] = x * r; arr[i + 1] = y * r; arr[i + 2] = z * r;
      }
      pa.needsUpdate = true;
      if (!pal.flat) geo.ico.computeVertexNormals();
      deformed.current = act > 0.001;
    }
    if (shell.current) { shell.current.rotation.y -= dt * (0.05 + 0.3 * act); shell.current.rotation.z = 0.3; (shell.current.material as THREE.LineBasicMaterial).opacity = ((pal.flat ? 0.1 : 0.26) + 0.1 * active) * smooth(0.07, 0.13, p); }
    const settled = smooth(0.7, 1, morph);
    if (wireMat.current) wireMat.current.opacity = ((pal.flat ? 0.38 : 0.55) + 0.35 * active) * settled;
    if (dotMat.current) dotMat.current.opacity = 0.95 * settled;
    if (linkMat.current) linkMat.current.opacity = (pal.flat ? 0.42 : 0.55) * smooth(0.08, 0.12, p) * (1 - smooth(0.42, 0.5, p));

    // Ring of sources, with a label above each and three brand badges on a tight, nearly edge-on orbit.
    const R = RING_R * fit * (1 - converge) + 0.2 * converge;
    const spin = t * 0.06 + p * 2.6;
    const lp = geo.linkGeo.getAttribute("position") as THREE.BufferAttribute;
    const fp = geo.flowGeo.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < N; i++) {
      const ang = spin + (i * Math.PI * 2) / N;
      tmp.a.set(Math.cos(ang) * R, Math.sin(ang * 2 + i) * 0.12 * (1 - converge), Math.sin(ang) * R);
      const g = nodes.current[i];
      let vis = 1 - smooth(0.3, 0.42, p);
      if (g) {
        g.position.copy(tmp.a); g.getWorldPosition(cam.world);
        const fade = screenFade(cam.world); vis *= fade;
        const s = (1 - 0.85 * converge) * Math.max(0.001, fade) * gather; g.scale.setScalar(s); g.visible = s > 0.2; // appears as the system forms; shrinks away over the copy
        const lab = labelSprites.current[i];
        if (lab) { lab.position.copy(cam.world).addScaledVector(cam.up, 0.3); lab.material.opacity = vis * gather; lab.visible = lab.material.opacity > 0.01; }
        tmp.c.copy(state.camera.position).sub(cam.world).normalize();
        for (let k = 0; k < 3; k++) {
          const sp = satSprites.current[i * 3 + k], ss = spaceSprites.current[i * 3 + k]; if (!sp || !ss) continue;
          const sa = t * 0.25 + k * 2.094 + i * 0.8; const front = Math.sin(sa);
          tmp.d.copy(cam.world).addScaledVector(cam.right, Math.cos(sa) * 0.34).addScaledVector(cam.up, -front * 0.07).addScaledVector(tmp.c, front * 0.3);
          const depth = smooth(-0.3, 0.5, front);
          const ringSz = 0.25 * (0.82 + 0.18 * depth), ringO = vis * (0.08 + 0.92 * depth);
          if (gather < 1) { // before the system exists the mark drifts through space in the colour of the stars, then flies in to its source and takes its own colour back
            const L = LOOSE_SAT[i * 3 + k]; tmp.p.copy(L.base).applyAxisAngle(L.axis, L.phase + t * L.speed);
            sp.position.lerpVectors(tmp.p, tmp.d, gather);
            const free = drift(sp.position); const sz = free + (ringSz - free) * gather; sp.scale.set(sz, sz, 1);
            const o = screenFade(sp.position) * (1 - gather) + ringO * gather;
            sp.material.opacity = o * gather; ss.material.opacity = o * (1 - gather); ss.position.copy(sp.position); ss.scale.copy(sp.scale);
          } else {
            sp.position.copy(tmp.d); sp.scale.set(ringSz, ringSz, 1); sp.material.opacity = ringO; ss.material.opacity = 0;
          }
          sp.visible = sp.material.opacity > 0.01; ss.visible = ss.material.opacity > 0.01;
        }
      }
      tmp.b.copy(tmp.a).normalize().multiplyScalar(CORE_R);
      tmp.c.copy(tmp.a).add(tmp.b).multiplyScalar(0.5).multiplyScalar(1.22);
      for (let s = 0; s < SEG; s++) {
        bezier(tmp.p, tmp.a, tmp.c, tmp.b, s / SEG);
        bezier(tmp.d, tmp.a, tmp.c, tmp.b, (s + 1) / SEG);
        lp.array.set([tmp.p.x, tmp.p.y, tmp.p.z, tmp.d.x, tmp.d.y, tmp.d.z], (i * SEG + s) * 6);
      }
      for (let k = 0; k < PER; k++) {
        const u = (t * 0.22 + k / PER + i * 0.11) % 1;
        bezier(tmp.p, tmp.a, tmp.c, tmp.b, u);
        fp.array.set([tmp.p.x, tmp.p.y, tmp.p.z], (i * PER + k) * 3);
      }
    }
    lp.needsUpdate = true; fp.needsUpdate = true;
    // Other tools drift by while the brain works; as the system forms they slide away and fade, filtered out.
    for (let j = 0; j < EXTRA.length; j++) {
      const sp = extraSprites.current[j]; if (!sp) continue;
      const L = LOOSE_EXTRA[j]; sp.position.copy(L.base).applyAxisAngle(L.axis, L.phase + t * L.speed).multiplyScalar(1 + 1.2 * gather);
      const sz = drift(sp.position); sp.scale.set(sz, sz, 1);
      const o = (1 - gather) * screenFade(sp.position); sp.material.opacity = o; sp.visible = o > 0.01;
    }
    if (flow.current) (flow.current.material as THREE.PointsMaterial).opacity = 0.9 * smooth(0.08, 0.12, p) * (1 - smooth(0.42, 0.5, p));

    // The sky fills the view from the camera's side: the shader drifts and twinkles the stars and slides them a little with the scroll. Points pour into the brain until the sources connect.
    const px = state.gl.getPixelRatio(); const sky = spark.stars.uniforms;
    sky.uTime.value = t; sky.uPx.value = px; sky.uTan.value = Math.tan(((state.camera as THREE.PerspectiveCamera).fov * Math.PI) / 360); sky.uAspect.value = width / height; sky.uSlide.value = (0.5 - p) * 0.3;
    spark.inflow.uniforms.uPx.value = px;
    geo.starSp.g.setDrawRange(0, portrait ? 3400 : STARS); // fewer stars on a small screen
    if (inflow.current) {
      const o = 1 - smooth(0.04, 0.11, p);
      spark.inflow.uniforms.uOpacity.value = o; inflow.current.visible = o > 0.01;
      if (inflow.current.visible) {
        const pa = geo.inSp.g.getAttribute("position") as THREE.BufferAttribute, aa = geo.inSp.g.getAttribute("aAlpha") as THREE.BufferAttribute;
        const pos = pa.array as Float32Array, al = aa.array as Float32Array;
        for (let i = 0; i < INFLOW; i++) {
          const u = (t * 0.085 * geo.inSpeed[i] + geo.inPhase[i]) % 1; const R = 5.4 - 4.2 * u;
          pos[i * 3] = geo.inDir[i * 3] * R; pos[i * 3 + 1] = geo.inDir[i * 3 + 1] * R; pos[i * 3 + 2] = geo.inDir[i * 3 + 2] * R;
          al[i] = geo.inAlpha[i] * smooth(0, 0.12, u) * (1 - smooth(0.78, 1, u));
        }
        pa.needsUpdate = true; aa.needsUpdate = true;
      }
    }

    // Digestion: facts and human decisions come in along their lanes and fade out at the edge of the core, as if taken in.
    for (let j = 0; j < INGEST.length; j++) {
      const sp = ingestSprites.current[j]; if (!sp) continue;
      const u = (t * 0.15 + j * 0.37) % 1;
      const ang = inLanes[j] + t * 0.04 + Math.sin(t * 0.12 + j) * 0.05;
      tmp.d.set(0, 0, 0).addScaledVector(cam.right, Math.cos(ang)).addScaledVector(cam.up, Math.sin(ang) * 0.8);
      sp.position.copy(tmp.d).multiplyScalar((2.35 - 1.05 * u) * fit).addScaledVector(cam.toCam, 0.6); // a little in front, so the body never clips it
      const o = act * smooth(0, 0.12, u) * (1 - smooth(0.68, 1, u)) * screenFade(sp.position);
      sp.material.opacity = o; sp.visible = o > 0.01;
    }

    // Outputs: work appears at the edge of the core and travels out along its lane, on a flowing line, and keeps coming.
    for (let j = 0; j < OUTPUTS.length; j++) {
      const sp = outSprites.current[j]; const ln = outLines.current[j]; if (!sp || !ln) continue;
      const u = (t * 0.1 + j * 0.41) % 1;
      const ang = outLanes[j] + t * 0.03 + Math.sin(t * 0.1 + j) * 0.04;
      tmp.d.set(0, 0, 0).addScaledVector(cam.right, Math.cos(ang)).addScaledVector(cam.up, Math.sin(ang) * 0.8);
      const r = (1.4 + 1.0 * u) * fit;
      sp.position.copy(tmp.d).multiplyScalar(r).addScaledVector(cam.toCam, 0.6);
      const o = out * smooth(0, 0.14, u) * (1 - smooth(0.72, 0.98, u)) * screenFade(sp.position);
      sp.material.opacity = o; sp.visible = o > 0.01;
      const half = 0.5 * (sp.scale.x * Math.abs(Math.cos(ang)) + sp.scale.y * Math.abs(Math.sin(ang)));
      const la = ln.geometry.getAttribute("position") as THREE.BufferAttribute;
      tmp.a.copy(tmp.d).multiplyScalar(CORE_R * 1.02).addScaledVector(cam.toCam, 0.6);
      tmp.b.copy(tmp.d).multiplyScalar(Math.max(CORE_R * 1.02, r - half - 0.08)).addScaledVector(cam.toCam, 0.6);
      la.array.set([tmp.a.x, tmp.a.y, tmp.a.z, tmp.b.x, tmp.b.y, tmp.b.z], 0); la.needsUpdate = true;
      flowDashes(ln, 1);
      (ln.material as THREE.LineDashedMaterial).opacity = 0.75 * o; ln.visible = o > 0.01;
    }
  });

  return (
    <>
      <ambientLight intensity={pal.flat ? 2.1 : 1.7} />
      <directionalLight position={[4, 6, 5]} intensity={pal.flat ? 1.2 : 2.4} />
      <directionalLight position={[-5, -2, -4]} intensity={pal.flat ? 0.5 : 0.9} />

      {/* Core: shaded body, wireframe, vertex dots. All three share one geometry, so they deform together. */}
      <group ref={core}>
        <mesh ref={body} geometry={geo.ico} scale={0.985}>
          <meshStandardMaterial color={pal.page} roughness={pal.flat ? 1 : 0.8} metalness={0} flatShading={pal.flat} />
        </mesh>
        <mesh geometry={geo.ico}>
          <meshBasicMaterial ref={wireMat} color={pal.blue} wireframe transparent opacity={0.5} />
        </mesh>
        <points geometry={geo.dots}>
          <pointsMaterial ref={dotMat} color={pal.blue} size={0.06} sizeAttenuation transparent opacity={0.95} map={disc} alphaTest={0.2} depthWrite={false} />
        </points>
        {/* The brain: a light surface wire and the sulci as lines, both smoothing into the sphere as the page scrolls */}
        <mesh ref={brainWire} geometry={geo.brain.wire} material={brainMats.wire} />
        <lineSegments ref={brainSulci} geometry={geo.brain.sulci} material={brainMats.sulci} />
        <Html center zIndexRange={[4, 0]} style={{ pointerEvents: "none" }}>
          <div className="grid place-items-center text-center font-semibold leading-tight text-[var(--ink)]" style={{ fontSize: "clamp(15px, 1.5vw, 21px)", width: 260 }}>
            <span ref={lblA} className="col-start-1 row-start-1">Your system</span>
            <span ref={status} className="col-start-1 row-start-1 text-[var(--blue)]" style={{ opacity: 0, fontSize: "0.8em" }} />
            <span ref={lblB} className="col-start-1 row-start-1" style={{ opacity: 0 }}>Running<br /><em className="not-italic text-[var(--muted)]">in your tools</em></span>
          </div>
        </Html>
      </group>
      <points ref={stars} geometry={geo.starSp.g} material={spark.stars} renderOrder={-1} frustumCulled={false} />
      <points ref={inflow} geometry={geo.inSp.g} material={spark.inflow} renderOrder={1} frustumCulled={false} />
      <lineSegments ref={shell} geometry={geo.shellEdges} renderOrder={1}>
        <lineBasicMaterial color={pal.dim} transparent opacity={0.12} depthWrite={false} />
      </lineSegments>

      {/* Sources on a tilted orbit */}
      <group rotation={[TILT, 0, 0.12]}>
        {SOURCES.map((src, i) => (
          <group key={src.name} ref={(el) => { nodes.current[i] = el; }}>
            <mesh>
              <sphereGeometry args={[0.085, 24, 24]} />
              <meshStandardMaterial color={pal.blue} roughness={0.4} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.16, 16, 16]} />
              <meshBasicMaterial color={pal.blue} transparent opacity={0.14} depthWrite={false} />
            </mesh>
          </group>
        ))}
        <lineSegments geometry={geo.linkGeo} renderOrder={1}>
          <lineBasicMaterial ref={linkMat} color={pal.blue} transparent opacity={0.42} depthWrite={false} />
        </lineSegments>
        <points ref={flow} geometry={geo.flowGeo} renderOrder={1}>
          <pointsMaterial color={pal.blue} size={0.1} sizeAttenuation transparent opacity={0.9} map={disc} alphaTest={0.2} depthWrite={false} />
        </points>
      </group>

      {/* Every label and badge is a sprite: a real object in the scene, so the core covers it exactly where it should */}
      {SOURCES.map((src, i) => (
        <sprite key={src.name} ref={(el) => { labelSprites.current[i] = el; }} scale={[0.22 * art.labels[i].aspect, 0.22, 1]} renderOrder={3}>
          <spriteMaterial map={art.labels[i].tex} transparent depthWrite={false} />
        </sprite>
      ))}
      {SOURCES.map((src, i) => src.marks.map((m, k) => (
        <sprite key={`${src.name}-${m.title}`} ref={(el) => { satSprites.current[i * 3 + k] = el; }} scale={[0.25, 0.25, 1]} renderOrder={3}>
          <spriteMaterial map={art.badges[i][k]} transparent depthWrite={false} />
        </sprite>
      )))}
      {SOURCES.map((src, i) => src.marks.map((m, k) => (
        <sprite key={`${src.name}-${m.title}-space`} ref={(el) => { spaceSprites.current[i * 3 + k] = el; }} scale={[0.26, 0.26, 1]} renderOrder={3}>
          <spriteMaterial map={art.space[i][k]} transparent depthWrite={false} opacity={0} />
        </sprite>
      )))}
      {EXTRA.map((m, j) => (
        <sprite key={`extra-${m.title}`} ref={(el) => { extraSprites.current[j] = el; }} scale={[0.26, 0.26, 1]} renderOrder={3}>
          <spriteMaterial map={art.extras[j]} transparent depthWrite={false} opacity={0} />
        </sprite>
      ))}
      {INGEST.map((w, j) => (
        <sprite key={w.text} ref={(el) => { ingestSprites.current[j] = el; }} scale={[0.22 * art.ingest[j].aspect, 0.22, 1]} renderOrder={3}>
          <spriteMaterial map={art.ingest[j].tex} transparent depthWrite={false} opacity={0} />
        </sprite>
      ))}
      {OUTPUTS.map((o, j) => {
        const h = o.sub ? 0.32 : 0.2;
        return (
          <group key={o.title}>
            <sprite ref={(el) => { outSprites.current[j] = el; }} scale={[h * art.outputs[j].aspect, h, 1]} renderOrder={3}>
              <spriteMaterial map={art.outputs[j].tex} transparent depthWrite={false} opacity={0} />
            </sprite>
            <lineSegments ref={(el) => { outLines.current[j] = el; }} geometry={geo.outGeos[j]} renderOrder={1}>
              <lineDashedMaterial color={pal.blue} dashSize={0.1} gapSize={0.08} transparent opacity={0} depthWrite={false} />
            </lineSegments>
          </group>
        );
      })}
    </>
  );
}

// The scene only renders while its section is on screen: no GPU work behind the rest of the page, and less for the browser to drop under pressure.
export default function SystemScene({ progress, dark, onReady }: { progress: RefObject<number>; dark: boolean; onReady?: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(true);
  useEffect(() => {
    const el = box.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { rootMargin: "25% 0px" });
    io.observe(el); return () => io.disconnect();
  }, []);
  return (
    <div ref={box} style={{ position: "absolute", inset: 0 }}>
      <Canvas frameloop={onScreen ? "always" : "never"} dpr={[1, 1.75]} gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }} camera={{ fov: 32, position: [0, 2.8, 9.4], near: 0.1, far: 60 }} style={{ position: "absolute", inset: 0 }}>
        <System progress={progress} pal={dark ? DARK : LIGHT} onReady={onReady} />
      </Canvas>
    </div>
  );
}
