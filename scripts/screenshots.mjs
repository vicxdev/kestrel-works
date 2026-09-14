// Screenshots for the README, taken from a running build (npm run build && npx next start -p 3011). Writes docs/*.jpg.
// Needs a Chromium binary: set CHROME if the default is missing.  Usage: node scripts/screenshots.mjs [base url]
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = process.argv[2] || process.env.BASE || "http://localhost:3011";
const CHROME = process.env.CHROME || `${process.env.HOME}/.cache/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-linux64/chrome-headless-shell`;
const at = (id, p) => `const t = document.getElementById(${JSON.stringify(id)}); scrollTo({ top: t.offsetTop + ${p} * (t.offsetHeight - innerHeight), behavior: "instant" })`;
const SHOTS = [
  { out: "home-light", path: "/?theme=light", go: "scrollTo(0, 0)", wait: 6000 },
  { out: "home-system-dark", path: "/?theme=dark", go: at("system", 0.58), wait: 6000 },
  { out: "home-outputs-light", path: "/?theme=light", go: at("system", 0.9), wait: 6000 },
  { out: "story-light", path: "/?theme=light", go: at("story", 0.5), wait: 2500 },
  { out: "freight-dark", path: "/?theme=dark", go: 'scrollTo({ top: document.getElementById("freight").offsetTop - 40, behavior: "instant" })', wait: 3500 },
  { out: "harbor-dark", path: "/harbor?theme=dark", go: "scrollTo(0, 0)", wait: 8000 },
  { out: "harbor-phone-light", path: "/harbor?theme=light", go: "scrollTo(0, 0)", wait: 7000, w: 390, h: 844, mobile: true },
  { out: "home-phone-dark", path: "/?theme=dark", go: "scrollTo(0, 0)", wait: 6000, w: 390, h: 844, mobile: true },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync("docs", { recursive: true });
const chrome = spawn(CHROME, ["--headless", "--no-sandbox", "--disable-gpu", "--hide-scrollbars", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--remote-debugging-port=9336", "about:blank"], { stdio: "ignore" });
try {
  let targets = [];
  for (let i = 0; i < 60 && !targets.length; i++) { try { targets = (await (await fetch("http://127.0.0.1:9336/json")).json()).filter((t) => t.type === "page"); } catch {} if (!targets.length) await sleep(200); }
  const ws = new WebSocket(targets[0].webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r));
  let id = 0; const pending = new Map();
  ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } };
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  await send("Page.enable");
  for (const s of SHOTS) {
    await send("Emulation.setDeviceMetricsOverride", { width: s.w || 1440, height: s.h || 900, deviceScaleFactor: 1, mobile: !!s.mobile });
    await send("Page.navigate", { url: `${BASE}${s.path}` }); await sleep(2500);
    await send("Runtime.evaluate", { expression: s.go }); await sleep(s.wait);
    const shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 82 });
    writeFileSync(`docs/${s.out}.jpg`, Buffer.from(shot.data, "base64")); console.log(`docs/${s.out}.jpg`);
  }
  ws.close();
} finally { chrome.kill(); }
