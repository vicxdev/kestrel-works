// Stills of the two Three.js scenes, shown under each canvas until the live scene has drawn (see .poster in motion.css).
// Run against a production build:  npm run build && npx next start -p 3011 &  then  node scripts/posters.mjs
// Re-run whenever a scene changes how its first frame looks, then build again: next start only serves files that existed at
// build time. Needs a Chromium binary: set CHROME if the default is missing.
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = process.env.BASE || "http://localhost:3011";
const CHROME = process.env.CHROME || `${process.env.HOME}/.cache/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-linux64/chrome-headless-shell`;
const HIDE_HOME = ".topbar, .guide, .poster, #system .beats, #system .scroll-cue, #system .phase-nav";
const HIDE_MAP = ".topbar, .guide, .poster, .hero-veil, .hero-copy, [aria-label=Sections]";
// Framings mirror what each scene distinguishes: the homepage switches on width < height and its offsets depend on the
// aspect ratio, so two landscape buckets plus portrait; the map switches on width < 768 and keeps a fixed width in map units.
const SHOTS = [
  { out: "system-{t}-a", path: "/", w: 1440, h: 900, dsf: 1, hide: HIDE_HOME, clip: "#system .scrub-pin" },
  { out: "system-{t}-b", path: "/", w: 1664, h: 900, dsf: 1, hide: HIDE_HOME, clip: "#system .scrub-pin" },
  { out: "system-{t}-m", path: "/", w: 390, h: 844, dsf: 2, mobile: true, hide: HIDE_HOME, clip: "#system .scrub-pin" },
  { out: "map-{t}", path: "/harbor", w: 1320, h: 1000, dsf: 1.5, hide: HIDE_MAP, clip: "#top" },
  { out: "map-{t}-m", path: "/harbor", w: 390, h: 900, dsf: 2, mobile: true, hide: HIDE_MAP, clip: "#top" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync("public/posters", { recursive: true });
const chrome = spawn(CHROME, ["--headless", "--no-sandbox", "--disable-gpu", "--hide-scrollbars", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--remote-debugging-port=9335", "about:blank"], { stdio: "ignore" });
try {
  let targets = [];
  for (let i = 0; i < 60 && !targets.length; i++) { try { targets = (await (await fetch("http://127.0.0.1:9335/json")).json()).filter((t) => t.type === "page"); } catch {} if (!targets.length) await sleep(200); }
  const ws = new WebSocket(targets[0].webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r));
  let id = 0; const pending = new Map();
  ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } };
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const evaluate = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true })).result?.value;
  await send("Page.enable");
  // count rendered frames once WebGL is up, so we capture a settled first frame rather than an empty canvas
  await send("Page.addScriptToEvaluateOnNewDocument", { source: `
    window.__frames = 0; let gl = false;
    const gc = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, ...a) { if (String(t).includes("webgl")) gl = true; return gc.call(this, t, ...a); };
    const raf = window.requestAnimationFrame; window.requestAnimationFrame = (cb) => raf.call(window, (ts) => { if (gl) window.__frames++; cb(ts); });` });
  for (const s of SHOTS) for (const theme of ["light", "dark"]) {
    await send("Emulation.setDeviceMetricsOverride", { width: s.w, height: s.h, deviceScaleFactor: s.dsf, mobile: !!s.mobile });
    await send("Page.navigate", { url: `${BASE}${s.path}?theme=${theme}` });
    for (let i = 0; i < 100 && ((await evaluate("window.__frames")) ?? 0) < 12; i++) await sleep(200);
    await evaluate(`document.head.insertAdjacentHTML("beforeend", "<style>${s.hide} { opacity: 0 !important; }</style>"); scrollTo(0, 0)`);
    await sleep(400);
    const box = await evaluate(`(() => { const r = document.querySelector(${JSON.stringify(s.clip)}).getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; })()`);
    const shot = await send("Page.captureScreenshot", { format: "webp", quality: 82, clip: { ...box, scale: 1 } });
    const out = `public/posters/${s.out.replace("{t}", theme)}.webp`;
    writeFileSync(out, Buffer.from(shot.data, "base64"));
    console.log(out, `${Math.round(box.width)}x${Math.round(box.height)} css px @${s.dsf}`, `${Math.round(Buffer.byteLength(shot.data, "base64") * 0.75 / 1024)} KB`);
  }
  ws.close();
} finally { chrome.kill(); }
