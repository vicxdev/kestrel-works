"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

// Pieces every page shares: tokens, the theme, the scroll driver, the page guide, the nav and the footer.

export const h2 = "text-[clamp(30px,3.2vw,42px)] font-semibold leading-[1.08] tracking-[-0.03em]";
export const eyebrow = "text-[13px] font-medium text-[var(--blue)]";
export const btn = "inline-flex items-center rounded-md px-7 py-4 text-[17px] font-medium transition-colors bg-[var(--blue)] text-white hover:brightness-110";
export const hair = "border-[var(--line)]";
export const dots = (grid: string, size: string) => ({ backgroundImage: `radial-gradient(var(${grid}) 1px, transparent 1px)`, backgroundSize: size });

export type Theme = "system" | "light" | "dark";
// Follows the device until the reader picks; the pick is remembered on this device. ?theme= opens a link in a given state.
export function useTheme() {
  const [theme, setTheme] = useState<Theme>("system");
  useEffect(() => {
    let saved: string | null = null; try { saved = localStorage.getItem("kw-theme"); } catch {}
    const pick = new URLSearchParams(window.location.search).get("theme") ?? saved;
    if (pick === "light" || pick === "dark" || pick === "system") setTheme(pick);
  }, []);
  const [osDark, setOsDark] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => setOsDark(mq.matches);
    sync(); mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  const chooseTheme = (t: Theme) => { setTheme(t); try { localStorage.setItem("kw-theme", t); } catch {} };
  const nextTheme: Theme = theme === "system" ? "light" : theme === "light" ? "dark" : "system";
  return { theme, isDark: theme === "dark" || (theme === "system" && osDark), chooseTheme, nextTheme };
}

// Scroll drives everything: reveals, the How we start steps, --p on every pinned scene, the closing band, and the page guide when there is one.
export function useScrollDriver(root: RefObject<HTMLDivElement | null>, options: { sections?: string[]; onSystem?: (n: number) => void } = {}) {
  const opts = useRef(options); opts.current = options;
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    // Content is visible without JS. The .js class arms the reveals one frame before observing,
    // so what is already on screen still animates in.
    el.classList.add("js");
    let cleanup = () => {};
    const raf = requestAnimationFrame(() => {
      const seen = new IntersectionObserver((entries) => {
        for (const e of entries) if (e.isIntersecting) { e.target.classList.add("in"); seen.unobserve(e.target); }
      }, { threshold: 0.15 });
      el.querySelectorAll(".reveal").forEach((n) => seen.observe(n));

      const steps = new IntersectionObserver((entries) => {
        for (const e of entries) e.target.classList.toggle("active", e.isIntersecting);
      }, { rootMargin: "-22% 0px -58% 0px" }); // the active step is the one in the upper middle of the screen, so a jump to the section lands on the first
      el.querySelectorAll(".step").forEach((n) => steps.observe(n));

      // Scroll position becomes --p on each scene (0 at the start of its range, 1 at the end).
      const tracks = Array.from(el.querySelectorAll<HTMLElement>(".scrub-track"));
      const sections = (opts.current.sections ?? []).map((id) => el.querySelector<HTMLElement>(`#${id}`)).filter((s): s is HTMLElement => !!s);
      const photo = el.querySelector<HTMLElement>(".photo");
      const clamp = (v: number) => Math.min(1, Math.max(0, v)).toFixed(4);
      let queued = false;
      const scrub = () => {
        queued = false;
        const vh = window.innerHeight;
        for (const t of tracks) {
          const r = t.getBoundingClientRect(); const v = clamp(-r.top / Math.max(1, r.height - vh)); t.style.setProperty("--p", v);
          const n = Number(v);
          if (t.id === "system") { // the scene also tells the page which step it is on, whether the reader has started, and whether the nav sits over it
            opts.current.onSystem?.(n);
            t.dataset.phase = String(n < 0.06 ? 0 : n < 0.45 ? 1 : n < 0.77 ? 2 : 3); t.dataset.started = n > 0.015 ? "1" : "0";
            el.classList.toggle("over-scene", r.bottom > 64);
          } else if (t.dataset.steps) { // other pinned scenes split their track evenly
            const k = Number(t.dataset.steps); t.dataset.phase = String(Math.min(k - 1, Math.floor(n * k)));
          }
        }
        if (photo) { const r = photo.getBoundingClientRect(); photo.style.setProperty("--p", clamp((vh - r.top) / (vh + r.height))); }
        // the page guide: which section sits under the reader, and which step inside it
        const mid = vh * 0.45; let current: HTMLElement | null = null;
        for (const s of sections) { const r = s.getBoundingClientRect(); if (r.top <= mid && r.bottom > mid) { current = s; break; } }
        const id = current?.id ?? "", step = current?.dataset.phase ?? "";
        if (id !== el.dataset.section || step !== el.dataset.step) {
          el.dataset.section = id; el.dataset.step = step;
          el.querySelectorAll(".guide .is-on").forEach((n) => n.classList.remove("is-on"));
          const item = el.querySelector(`.guide-item-${id}`);
          if (item) { item.classList.add("is-on"); if (step) item.querySelector(`.guide-step-${step}`)?.classList.add("is-on"); }
        }
      };
      const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(scrub); } };
      scrub();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      cleanup = () => { seen.disconnect(); steps.disconnect(); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
    });
    return () => { cancelAnimationFrame(raf); cleanup(); };
  }, [root]);
}

// Jump to where step p of a pinned scene reads best.
export function jumpTo(track: string, p: number) {
  const t = document.getElementById(track); if (!t) return;
  window.scrollTo({ top: t.offsetTop + p * (t.offsetHeight - window.innerHeight), behavior: "smooth" });
}

export type GuideEntry = { id: string; n: string; steps?: { n: string; p: number }[] };
// The page guide: one dot per section on the left edge, with sub-steps for the scenes that step through content.
// On phones it becomes a button that opens the list, so nobody has to swipe through a whole scene.
export function PageGuide({ guide }: { guide: GuideEntry[] }) {
  const [menu, setMenu] = useState(false);
  const go = (id: string, p?: number) => { setMenu(false); history.pushState(null, "", `#${id}`); if (p === undefined) document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); else jumpTo(id, p); };
  return (
    <>
      <nav className="guide" aria-label="Page sections">
        <ol>
          {guide.map((g) => (
            <li key={g.id} className={`guide-item guide-item-${g.id}`}>
              <button type="button" onClick={() => go(g.id)}><i /><span>{g.n}</span></button>
              {g.steps && (
                <ol className="guide-sub">
                  {g.steps.map((s, i) => (<li key={s.n} className={`guide-step guide-step-${i}`}><button type="button" onClick={() => go(g.id, s.p)}><i /><span>{s.n}</span></button></li>))}
                </ol>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <button type="button" onClick={() => setMenu((v) => !v)} aria-expanded={menu} aria-label="Sections" className="fixed bottom-5 right-5 z-40 grid h-12 w-12 place-items-center rounded-full border border-[var(--line)] bg-[var(--panel)] text-[var(--ink)] shadow-lg md:hidden">
        {menu ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M5 7h14M5 12h14M5 17h9" /></svg>}
      </button>
      {menu && (
        <div className="fixed inset-x-4 bottom-20 z-40 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-2 shadow-2xl md:hidden">
          <ol className="grid text-[15px]">
            {guide.map((g) => (
              <li key={g.id}>
                <button type="button" className="w-full rounded-lg px-3 py-2.5 text-left text-[var(--ink)]" onClick={() => go(g.id)}>{g.n}</button>
                {g.steps && (
                  <ol className="flex flex-wrap gap-1.5 px-3 pb-2.5">
                    {g.steps.map((s) => (<li key={s.n}><button type="button" className="rounded-full border border-[var(--line)] px-2.5 py-1 text-[13px] text-[var(--muted)]" onClick={() => go(g.id, s.p)}>{s.n}</button></li>))}
                  </ol>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </>
  );
}

const ThemeIcon = ({ theme }: { theme: Theme }) => theme === "light" ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
) : theme === "dark" ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /></svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="8" /><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" stroke="none" /></svg>
);

const Wordmark = () => <>kestrel<span className="text-[var(--blue)]"> works</span></>;

// Fixed, translucent, takes the colour of the band under it (see .topbar). Links hide on phones; the theme switch and the call to action stay.
export function SiteNav({ theme, nextTheme, onTheme, links }: { theme: Theme; nextTheme: Theme; onTheme: (t: Theme) => void; links: { href: string; n: string }[] }) {
  return (
      <header className="topbar fixed inset-x-0 top-0 z-40 border-b border-[var(--line)]/60 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
          <a href="#top" className="whitespace-nowrap text-[19px] font-semibold tracking-tight text-[var(--ink)]"><Wordmark /></a>
          <nav className="flex items-center gap-8 text-[15px]">
            {links.map((l) => (<a key={l.href} href={l.href} className="hidden text-[var(--muted)] hover:text-[var(--ink)] md:inline">{l.n}</a>))}
            {/* Theme: follows the device until the reader picks; the pick is remembered on this device */}
            <button type="button" onClick={() => onTheme(nextTheme)} aria-label={`Theme: ${theme}. Switch to ${nextTheme}`} title={`Theme: ${theme}`} className="grid h-9 w-9 place-items-center rounded-full border border-[var(--line)] text-[var(--muted)] transition-colors hover:text-[var(--ink)]">
              <ThemeIcon theme={theme} />
            </button>
            <a href="#assessment" className="inline-flex h-9 items-center whitespace-nowrap rounded-md bg-[var(--ink)] px-3.5 text-[14px] font-medium text-[var(--page)] md:px-4"><span className="md:hidden">Book a session</span><span className="hidden md:inline">Book a working session</span></a>
          </nav>
        </div>
      </header>
  );
}

export function SiteFooter() {
  return (
      <footer className={`border-t ${hair}`}>
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-[var(--muted)]">
          <span className="font-semibold tracking-tight text-[var(--ink)]"><Wordmark /></span>
          <span>A portfolio build. Every client and figure on these pages is fictional.</span>
        </div>
      </footer>
  );
}
