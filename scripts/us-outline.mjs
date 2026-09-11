// The map behind the Harbor Collective page: the lower 48 state borders and 24 cities, Albers projected and normalised so
// x runs from -1 to 1. Writes public/us-outline.json. Run once after npm install:  node scripts/us-outline.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import * as tc from "topojson-client";

const require = createRequire(import.meta.url);
const us = require("us-atlas/states-10m.json");
const skip = new Set(["02", "15", "72", "60", "66", "69", "78"]); // Alaska, Hawaii and the territories
const geos = us.objects.states.geometries.filter((g) => !skip.has(g.id));
const mesh = tc.mesh(us, { type: "GeometryCollection", geometries: geos });

const D = Math.PI / 180, lat0 = 23 * D, lon0 = -96 * D, p1 = 29.5 * D, p2 = 45.5 * D;
const n = (Math.sin(p1) + Math.sin(p2)) / 2, C = Math.cos(p1) ** 2 + 2 * n * Math.sin(p1), r0 = Math.sqrt(C - 2 * n * Math.sin(lat0)) / n;
const proj = ([lon, lat]) => { const r = Math.sqrt(C - 2 * n * Math.sin(lat * D)) / n, th = n * (lon * D - lon0); return [r * Math.sin(th), r0 - r * Math.cos(th)]; };
const lines = mesh.coordinates.map((l) => l.map(proj));
let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
for (const l of lines) for (const [x, y] of l) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, s = 2 / (x1 - x0);
const norm = ([x, y]) => [+(((x - cx) * s).toFixed(4)), +(((y - cy) * s).toFixed(4))];

const CITIES = {
  Austin: [-97.7431, 30.2672], Denver: [-104.9903, 39.7392], Miami: [-80.1918, 25.7617], "New York": [-74.006, 40.7128],
  Chicago: [-87.6298, 41.8781], "Los Angeles": [-118.2437, 34.0522], "San Francisco": [-122.4194, 37.7749], Seattle: [-122.3321, 47.6062],
  Boston: [-71.0589, 42.3601], Atlanta: [-84.388, 33.749], Nashville: [-86.7816, 36.1627], Phoenix: [-112.074, 33.4484],
  Dallas: [-96.797, 32.7767], Minneapolis: [-93.265, 44.9778], Portland: [-122.6784, 45.5152], "Salt Lake City": [-111.891, 40.7608],
  Raleigh: [-78.6382, 35.7796], Detroit: [-83.0458, 42.3314], "Kansas City": [-94.5786, 39.0997], "San Diego": [-117.1611, 32.7157],
  Charlotte: [-80.8431, 35.2271], Tampa: [-82.4572, 27.9506], Columbus: [-82.9988, 39.9612], "Las Vegas": [-115.1398, 36.1699],
};
const out = {
  aspect: +(((x1 - x0) / (y1 - y0)).toFixed(4)),
  lines: lines.map((l) => l.flatMap(norm)),
  cities: Object.fromEntries(Object.entries(CITIES).map(([k, v]) => [k, norm(proj(v))])),
};
mkdirSync("public", { recursive: true });
writeFileSync("public/us-outline.json", JSON.stringify(out));
console.log("public/us-outline.json", out.lines.length, "border lines,", out.lines.reduce((a, l) => a + l.length / 2, 0), "points,", Object.keys(out.cities).length, "cities");
