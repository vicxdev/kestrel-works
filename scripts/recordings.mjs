// Short recordings of the scenes for the README, as animated WebP. Frames come from the same headless Chromium the
// screenshots use, against the static export served locally (npm run build && npx serve out -l 3011); sharp joins them.
// Scroll-driven scenes are stepped through their track, so the recording is smooth whatever the machine renders at;
// the map runs on its own clock, so it is sampled in real time. Usage: node scripts/recordings.mjs [base url]
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const BASE = process.argv[2] || process.env.BASE || "http://localhost:3011";
const CHROME = process.env.CHROME || `${process.env.HOME}/.cache/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-linux64/chrome-headless-shell`;
const WIDTH = 960; // output width; frames are captured at 1440x900 and scaled down
const DELAY = 80; // ms per frame in the output, about 12 fps
const track = (id, p) => `(() => { const t = document.getElementById(${JSON.stringify(id)}); scrollTo({ top: t.offsetTop + ${p} * (t.offsetHeight - innerHeight), behavior: "instant" }); })()`;
const TAKES = [
  // the system scene, from the brain to the outputs, one scroll step per frame
  { out: "home-scroll", path: "/?theme=light", settle: 6000, frames: 120, step: (i, n) => track("system", i / (n - 1)), gap: 90 },
  // the map journey: two legs in real time
  { out: "map-journey", path: "/harbor/?theme=dark", settle: 6500, frames: 96, step: () => "0", gap: 110 },
  // the case story, scrubbed
  { out: "story-scroll", path: "/?theme=light", settle: 3000, frames: 70, step: (i, n) => track("story", i / (n - 1)), gap: 90 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync("docs", { recursive: true });
const chrome = spawn(CHROME, ["--headless", "--no-sandbox", "--disable-gpu", "--hide-scrollbars", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--remote-debugging-port=9337", "--window-size=1440,900", "about:blank"], { stdio: "ignore" });
try {
  let targets = [];
  for (let i = 0; i < 60 && !targets.length; i++) { try { targets = (await (await fetch("http://127.0.0.1:9337/json")).json()).filter((t) => t.type === "page"); } catch {} if (!targets.length) await sleep(200); }
  const ws = new WebSocket(targets[0].webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r));
  let id = 0; const pending = new Map();
  ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } };
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  for (const t of TAKES) {
    await send("Page.navigate", { url: `${BASE}${t.path}` }); await sleep(t.settle);
    const frames = [];
    for (let i = 0; i < t.frames; i++) {
      await send("Runtime.evaluate", { expression: t.step(i, t.frames) }); await sleep(t.gap);
      const shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 80 });
      frames.push(await sharp(Buffer.from(shot.data, "base64")).resize({ width: WIDTH }).png().toBuffer());
    }
    const out = `docs/${t.out}.webp`;
    await sharp(frames, { join: { animated: true } }).webp({ quality: 68, effort: 4, loop: 0, delay: DELAY }).toFile(out);
    console.log(out, `${t.frames} frames`);
  }
  ws.close();
} finally { chrome.kill(); }
