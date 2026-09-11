"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import "./motion.css";
import { useTheme, useScrollDriver, SiteNav, SiteFooter, PageGuide, jumpTo, eyebrow, h2, hair, btn, dots, type GuideEntry } from "./shared";
import { CaseStory, STORY_STEPS } from "./story";

const SystemScene = dynamic(() => import("./system-scene"), { ssr: false });
if (typeof window !== "undefined") void import("./system-scene"); // start the download as soon as the page script runs, not after hydration

// The pinned scene opens the page. Beat 0 is the hero; the next three walk through the system.
const SCENE_BEATS = [
  { k: "", t: "Most companies know AI can change how they operate.", b: "Very few have the team to make it happen. We are that team. We design and build the systems that fit how you already work, train your people to run them, and stay on the work every week for a fixed monthly fee." },
  { k: "Sources", t: "The answers are already in your tools", b: "Inboxes, chat, recorded calls, spreadsheets, the CRM and the books. Everything a good decision needs is in there, spread across eight places." },
  { k: "The system", t: "One system reads it all, by your rules", b: "It connects to what you already use and learns how your team decides. A person accepts, edits or rejects every proposal, and the system learns from that before it acts." },
  { k: "Outputs", t: "What comes out is finished work", b: "A Monday digest. A reply drafted and waiting for a yes. An invoice flagged before it is paid. Each one lands in the tool your team already has open." },
];
// The steps of each pinned scene and where each one reads best, as a share of its track. Clicking a step scrolls there.
const PHASES = [{ n: "Start", p: 0 }, { n: "Sources", p: 0.24 }, { n: "The system", p: 0.58 }, { n: "Outputs", p: 0.88 }];
const BUILD_STEPS = ["Calls", "Documents", "Listening", "Leads", "Inbox"].map((n, i) => ({ n, p: i / 4 }));
// The page guide: one entry per section, with sub-steps for the scenes that move through content.
const GUIDE: GuideEntry[] = [
  { id: "system", n: "How it works", steps: PHASES },
  { id: "capabilities", n: "What we do" },
  { id: "layers", n: "How we think" },
  { id: "builds", n: "Five builds" },
  { id: "story", n: "Harbor Collective", steps: STORY_STEPS },
  { id: "freight", n: "Cobalt Freight" },
  { id: "start", n: "How we start" },
  { id: "assessment", n: "Get started" },
];
// Step marker for a pinned scene: dots on the left edge, the current one lit, each one a jump to where that step reads best.
function PhaseNav({ track, steps, row, onSelect }: { track: string; steps: { n: string; p: number }[]; row?: boolean; onSelect?: (i: number) => void }) {
  return (
    <ol className={row ? "phase-nav phase-nav-row" : "phase-nav"} aria-label="Steps">
      {steps.map((s, i) => (
        <li key={s.n}><button type="button" className={`phase-dot phase-dot-${i}`} onClick={() => (onSelect ? onSelect(i) : jumpTo(track, s.p))} aria-label={`Go to ${s.n}`}><i /><span>{s.n}</span></button></li>
      ))}
    </ol>
  );
}
// Plain-text twin of what the 3D scene shows, for screen readers and search engines.
const SCENE_TEXT = {
  sources: ["Email", "Messaging", "Calls", "Spreadsheets", "CRM", "Accounting", "Documents", "Calendar"],
  inputs: ["Your rules", "Your tone", "Approval steps", "Vendor list", "Past decisions", "Who owns what", "and your team's decisions: accept, edit or reject"],
  outputs: ["Weekly digest", "Draft reply", "Flagged invoice", "Renewal alert", "Call summary", "CRM updated", "Ledger reconciled", "Follow-up sent", "Intro suggested", "Report ready", "Priority list", "Vendor check"],
};

const CAPABILITIES = [
  { n: "01", t: "Agents", k: "Small programs, one task each.", b: "Lead scoring, ticket routing, first drafts, research. Each one handles a specific task end to end and ships in about two weeks." },
  { n: "02", t: "Internal tools", k: "Dashboards, ledgers, digests.", b: "The plumbing that keeps operations moving, built for the people who run them rather than for engineers, and wired to real data." },
  { n: "03", t: "Data pipelines", k: "Connect, clean, route.", b: "Connect the tools you already pay for, clean what comes out of them and route it to where decisions happen. Quietly, every day." },
  { n: "04", t: "Team training", k: "Your team keeps the keys.", b: "Documented, repeatable prompts on real tasks, owned by the people doing the work, so nobody depends on the studio to keep going." },
];

const LAYERS = [
  { n: "01", t: "Projects", b: "One-off builds. Data cleanup, connections between systems, dashboards. The foundation everything else sits on." },
  { n: "02", t: "Skills", b: "Repeatable capabilities that run on demand. A skill has to perform for a full month before it earns the next layer." },
  { n: "03", t: "Async", b: "Agents that run without a person in the loop, and only after a skill has proven itself. Patience here is the whole point." },
];

const BUILDS = [
  { t: "Call transcript intelligence", b: "Every recorded call read the same day, with decisions, asks and promises filed into the records the team already keeps." },
  { t: "Document generation", b: "Proposals, memos and reports drafted from your own templates and data, waiting for a person to sign off." },
  { t: "Social listening for content", b: "What your market is saying, summarised every week, with drafts in your voice for the moments worth answering." },
  { t: "Lead enrichment and scoring", b: "New leads researched and ranked before anyone opens them, with the reasoning written next to the score." },
  { t: "Inbox triage and reply drafts", b: "The shared inbox sorted by what needs a person, with replies drafted for everything else." },
];

const START = [
  ["40 minutes", "A working session", "Where the system helps your business and where it does not. No slides, no commitment."],
  ["4 weeks", "One workflow you actually use", "Running in your operation, not a demo. You judge the studio on that before anything else."],
  ["Every week", "A call, and we keep shipping", "You name one person who owns the workflow. They bring what is next each week and we build it."],
];

const arrow = "grid h-10 w-10 place-items-center rounded-full border border-[var(--line)] bg-[var(--panel)] text-[var(--ink)] transition-colors hover:bg-[var(--page)] disabled:cursor-default disabled:opacity-30 disabled:hover:bg-[var(--panel)]";
// The freight case diagram: four systems into one flow, nine skills in the middle. Paths are shared by the drawn line and the pulse.
const FLOW_WIDE = ["M140 52 C 175 52, 175 130, 205 130", "M140 130 L 205 130", "M140 208 C 175 208, 175 130, 205 130", "M315 130 C 350 130, 350 52, 380 52", "M315 130 C 350 130, 350 208, 380 208"];
const FLOW_TALL = ["M54 50 C 54 82, 150 78, 150 110", "M150 50 L 150 110", "M246 50 C 246 82, 150 78, 150 110", "M150 170 C 150 186, 98 184, 98 200", "M150 170 C 150 186, 202 184, 202 200"];

export default function HomePage() {
  const { theme, isDark, chooseTheme, nextTheme } = useTheme();
  const root = useRef<HTMLDivElement>(null);
  const sysP = useRef(0);
  // Builds carousel: which card sits in the middle, and a way to get there from the tabs and the arrows.
  const [build, setBuild] = useState(0);
  const [sceneReady, setSceneReady] = useState(false); // the still under the scene fades once the scene has drawn
  useScrollDriver(root, { sections: GUIDE.map((g) => g.id), onSystem: (n) => { sysP.current = n; } });
  const buildsTrack = useRef<HTMLDivElement>(null);
  const goToBuild = (i: number) => {
    const track = buildsTrack.current; if (!track) return;
    const card = track.children[Math.max(0, Math.min(BUILDS.length - 1, i))] as HTMLElement | undefined; if (!card) return;
    track.scrollTo({ left: card.offsetLeft - (track.clientWidth - card.clientWidth) / 2, behavior: "smooth" });
  };
  const onBuildsScroll = () => {
    const track = buildsTrack.current; const card = track?.children[0] as HTMLElement | undefined; if (!track || !card) return;
    const i = Math.max(0, Math.min(BUILDS.length - 1, Math.round(track.scrollLeft / (card.clientWidth + 24))));
    if (i !== build) setBuild(i);
  };

  return (
    <div ref={root} className="hp min-h-screen" data-theme={theme} data-motion="on">
      <SiteNav theme={theme} nextTheme={nextTheme} onTheme={chooseTheme} links={[{ href: "#capabilities", n: "What we do" }, { href: "#story", n: "Case studies" }, { href: "#start", n: "How we start" }]} />

      <PageGuide guide={GUIDE} />

      {/* Hero and the system, one pinned scene. Scroll is the timeline. */}
      <section id="system" className="scrub-track">
        <a id="top" />
        <div className="scrub-pin relative min-h-[100vh] bg-[var(--scene)]">
          <div className="absolute inset-0"><div className={`poster poster-system${sceneReady ? " is-gone" : ""}`} aria-hidden /><SystemScene progress={sysP} dark={isDark} onReady={() => setSceneReady(true)} /></div>
          {/* Where you are in the scene, with a way to jump, and a nudge to start */}
          <div className="scroll-cue" aria-hidden><span>Scroll to see how it works</span><i /></div>
          <div className="relative z-10 mx-auto grid h-full min-h-[100vh] max-w-[1200px] grid-cols-1 content-end gap-8 px-6 pb-16 pt-24 md:grid-cols-[1.05fr_1fr] md:content-center md:items-center md:gap-16">
            <div className="beats relative">
              {SCENE_BEATS.map((b, i) => (
                <div key={i} className={`beat beat-${i} scrubbed`}>
                  {i === 0 ? (
                    <>
                      <h1 className="max-w-[14ch] text-[clamp(32px,4.4vw,60px)] font-semibold leading-[1.02] tracking-[-0.04em]">{b.t}</h1>
                      <p className="mt-6 max-w-[50ch] text-[18px] leading-relaxed text-[var(--muted)] md:text-[19px]">{b.b}</p>
                      <div className="mt-8 flex flex-wrap items-center gap-6">
                        <a href="#assessment" className={btn}>Book a working session</a>
                        <span className="text-[15px] text-[var(--muted)]">Forty minutes. No slides.</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className={eyebrow}>How it works · {b.k}</span>
                      <h2 className="mt-3 max-w-[22ch] text-[clamp(28px,3vw,40px)] font-semibold leading-[1.1] tracking-[-0.03em]">{b.t}</h2>
                      <p className="mt-4 max-w-[46ch] text-[17px] leading-relaxed text-[var(--muted)] md:text-[18px]">{b.b}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="hidden md:block" />
          </div>
          <ul className="sr-only">
            <li>Sources the system reads: {SCENE_TEXT.sources.join(", ")}.</li>
            <li>What it learns while it works: {SCENE_TEXT.inputs.join(", ")}.</li>
            <li>What comes out: {SCENE_TEXT.outputs.join(", ")}.</li>
          </ul>
        </div>
      </section>

      {/* Four capabilities */}
      <section id="capabilities" className={`border-t ${hair} bg-[var(--panel)]`}>
        <div className="mx-auto max-w-[1200px] px-6 py-24">
          <span className={`${eyebrow} reveal`}>What we do</span>
          <h2 className={`${h2} reveal reveal-d1 mt-3 max-w-[18ch]`}>Connect, run and report, with one dedicated team.</h2>
          <p className="reveal reveal-d2 mt-5 max-w-[60ch] text-[17px] leading-relaxed text-[var(--muted)]">Four capabilities, one team on your account. We pick the model that fits each job, and a person reviews every output before it reaches anyone outside.</p>
          <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {CAPABILITIES.map((c, i) => (
              <div key={c.t} className={`reveal reveal-d${Math.min(3, i)}`}>
                <div className="relative h-px w-full overflow-hidden bg-[var(--line)]"><span className="line-fill" style={{ transitionDelay: `${0.15 + i * 0.12}s` }} /></div>
                <div className="mt-6 flex items-baseline gap-3">
                  <span className="num text-[13px] font-medium tabular-nums text-[var(--blue)]">{c.n}</span>
                  <h3 className="text-[19px] font-semibold tracking-[-0.01em]">{c.t}</h3>
                </div>
                <p className="mt-3 text-[16px] font-medium leading-snug">{c.k}</p>
                <p className="mt-2 text-[15px] leading-relaxed text-[var(--muted)]">{c.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three layers, one framework */}
      <section id="layers" className={`border-t ${hair}`}>
        <div className="mx-auto max-w-[1200px] px-6 py-24">
          <span className={`${eyebrow} reveal`}>How we think</span>
          <h2 className={`${h2} reveal reveal-d1 mt-3 max-w-[16ch]`}>Projects, then skills, then async.</h2>
          <p className="reveal reveal-d2 mt-5 max-w-[52ch] text-[17px] leading-relaxed text-[var(--muted)]">One framework, three layers. Every engagement runs through it in this order, and nothing skips a layer.</p>
          {/* Three nodes in a row. A pulse runs along the hairline from one to the next, and each node lights up as it arrives. */}
          <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-10">
            {LAYERS.map((l, i) => (
              <div key={l.t} className={`reveal reveal-d${i}`}>
                <div className="flex items-center">
                  <div className="node grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-[var(--blue)] bg-[var(--page)] text-[13px] font-semibold text-[var(--blue)]" style={{ animationDelay: `${i * 1.6}s` }}>{l.n}</div>
                  {i < LAYERS.length - 1 && (
                    <svg aria-hidden="true" viewBox="0 0 100 40" preserveAspectRatio="none" className="ml-3 hidden h-10 flex-1 md:block md:mr-[-1.75rem]">
                      <path d="M0 20 H100" pathLength="100" fill="none" strokeWidth="1.5" style={{ stroke: "var(--line)" }} />
                      <path className="flow-pulse" d="M0 20 H100" pathLength="100" fill="none" strokeWidth="2" style={{ stroke: "var(--blue)", animationDelay: `${i * 1.6}s` }} />
                    </svg>
                  )}
                </div>
                <h3 className="mt-6 text-[24px] font-semibold tracking-[-0.02em]">{l.t}</h3>
                <p className="mt-3 max-w-[38ch] text-[16px] leading-relaxed text-[var(--muted)]">{l.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Five builds: a plain carousel. Tabs, arrows or a swipe move between cards. */}
      <section id="builds" data-phase={build} className={`border-t ${hair} bg-[var(--panel)] py-24 md:py-32`}>
        <div className="mx-auto max-w-[1200px] px-6">
          <span className={`${eyebrow} reveal`}>Standard, not custom</span>
          <h2 className={`${h2} reveal reveal-d1 mt-3 max-w-[20ch]`}>Five builds a team can put to work this month.</h2>
          <p className="reveal reveal-d2 mt-5 max-w-[58ch] text-[17px] leading-relaxed text-[var(--muted)]">These come up in nearly every operations conversation, and each one ships in about two weeks.</p>
          <PhaseNav track="builds" steps={BUILD_STEPS} row onSelect={goToBuild} />
        </div>
        <div className="builds-wrap relative mt-8">
          <div ref={buildsTrack} onScroll={onBuildsScroll} className="builds-track">
          {BUILDS.map((b, i) => (
            <article key={b.t} className={`build-card rounded-2xl border ${hair} bg-[var(--page)] p-8 md:p-10`}>
              <div className="flex items-center justify-between text-[14px] text-[var(--muted)]"><span className="tabular-nums">0{i + 1} / 05</span><span>About two weeks</span></div>
              <h3 className="mt-6 text-[clamp(24px,2.6vw,34px)] font-semibold tracking-[-0.025em]">{b.t}</h3>
              <p className="mt-4 max-w-[52ch] text-[17px] leading-relaxed text-[var(--muted)] md:text-[19px]">{b.b}</p>
            </article>
          ))}
          </div>
          <button type="button" onClick={() => goToBuild(build - 1)} disabled={build === 0} aria-label="Previous build" className={`${arrow} builds-arrow builds-arrow-prev`}><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3 5 8l5 5" /></svg></button>
          <button type="button" onClick={() => goToBuild(build + 1)} disabled={build === BUILDS.length - 1} aria-label="Next build" className={`${arrow} builds-arrow builds-arrow-next`}><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m6 3 5 5-5 5" /></svg></button>
        </div>
      </section>

      <CaseStory />

      {/* Case: Cobalt Freight */}
      <section id="freight" className={`border-t ${hair}`}>
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-16 px-6 py-24 md:grid-cols-2">
          <div className="reveal rounded-2xl border border-[var(--tint-line)] bg-[var(--tint)] p-9" style={dots("--tint-grid", "18px 18px")}>
            <svg viewBox="0 0 520 260" className="hidden w-full md:block" role="img" aria-label="Four systems connected into one flow with nine skills in the middle">
              <g strokeWidth={1.5} style={{ fill: "var(--draw-l-node)", stroke: "var(--draw-l-ring)" }}>
                {[[20, 30], [20, 108], [20, 186], [380, 30], [380, 186]].map(([x, y], i) => <rect key={i} x={x} y={y} width={120} height={44} rx={6} />)}
              </g>
              <rect x={205} y={90} width={110} height={80} rx={8} style={{ fill: "var(--draw-l)" }} />
              <g fill="none" strokeWidth={1.5} style={{ stroke: "var(--draw-l-dim)" }}>
                {FLOW_WIDE.map((d, i) => <path key={i} className="bp-line" style={{ animationDelay: `${i * 0.12}s` }} d={d} />)}
              </g>
              <g fill="none" strokeWidth={2} strokeLinecap="round" style={{ stroke: "var(--draw-l)" }}>
                {FLOW_WIDE.map((d, i) => <path key={i} className="bp-pulse" style={{ animationDelay: `${1.2 + i * 0.35}s` }} d={d} />)}
              </g>
              <g fontSize={13} style={{ fill: "var(--draw-l-label)" }}>
                <text x={34} y={57}>Carrier bills</text><text x={34} y={135}>Rate sheets</text><text x={34} y={213}>Statements</text>
                <text x={394} y={57}>Ledger</text><text x={394} y={213}>Weekly digest</text>
              </g>
              <text x={260} y={135} textAnchor="middle" fontSize={13} fontWeight={600} fill="#ffffff">9 skills</text>
            </svg>
            {/* The same diagram stacked for phones: inputs above, the skills in the middle, outputs below */}
            <svg viewBox="0 0 300 250" className="w-full md:hidden" role="img" aria-label="Four systems connected into one flow with nine skills in the middle">
              <g strokeWidth={1.5} style={{ fill: "var(--draw-l-node)", stroke: "var(--draw-l-ring)" }}>
                {[[8, 10], [104, 10], [200, 10], [52, 200], [156, 200]].map(([x, y], i) => <rect key={i} x={x} y={y} width={92} height={40} rx={6} />)}
              </g>
              <rect x={100} y={110} width={100} height={60} rx={8} style={{ fill: "var(--draw-l)" }} />
              <g fill="none" strokeWidth={1.5} style={{ stroke: "var(--draw-l-dim)" }}>
                {FLOW_TALL.map((d, i) => <path key={i} className="bp-line" style={{ animationDelay: `${i * 0.12}s` }} d={d} />)}
              </g>
              <g fill="none" strokeWidth={2} strokeLinecap="round" style={{ stroke: "var(--draw-l)" }}>
                {FLOW_TALL.map((d, i) => <path key={i} className="bp-pulse" style={{ animationDelay: `${1.2 + i * 0.35}s` }} d={d} />)}
              </g>
              <g fontSize={12} style={{ fill: "var(--draw-l-label)" }}>
                <text x={54} y={34} textAnchor="middle">Carrier bills</text><text x={150} y={34} textAnchor="middle">Rate sheets</text><text x={246} y={34} textAnchor="middle">Statements</text>
                <text x={98} y={224} textAnchor="middle">Ledger</text><text x={202} y={224} textAnchor="middle">Weekly digest</text>
              </g>
              <text x={150} y={144} textAnchor="middle" fontSize={13} fontWeight={600} fill="#ffffff">9 skills</text>
            </svg>
          </div>
          <div className="flex flex-col gap-4">
            <span className={`${eyebrow} reveal`}>Case study · Cobalt Freight</span>
            <h2 className={`${h2} reveal reveal-d1`}>Thirty hours a month back to the operations desk</h2>
            <p className="reveal reveal-d2 text-[17px] leading-relaxed text-[var(--muted)]">Carrier bills, rate sheets and customer statements sat across four systems that did not talk to each other. We connected them and deployed nine skills the desk runs on demand.</p>
            <div className="reveal reveal-d3 mt-2 border-l-2 border-[var(--blue)] pl-5 text-[15px] leading-relaxed text-[var(--muted)]">
              <span className="block text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--blue)]">Delivered</span>
              <p className="mt-1.5">Nine skills across carrier bills, rate sheets and statements. Four existing systems connected. About thirty hours a month back to the desk.</p>
              <p className="mt-2 text-[13px]">Cobalt Freight, operations desk</p>
            </div>
          </div>
        </div>
      </section>

      {/* How we start */}
      <section id="start" className={`border-t ${hair} bg-[var(--panel)]`}>
        <div className="mx-auto max-w-[1200px] px-6 py-24">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_2fr]">
            <div className="md:sticky md:top-28 md:self-start">
              <span className={eyebrow}>How we start</span>
              <h2 className={`${h2} mt-3`}>Four weeks decide the rest.</h2>
              <p className="mt-4 max-w-[36ch] text-[17px] leading-relaxed text-[var(--muted)]">The first four weeks decide whether the rest is worth it, so we keep them short and concrete.</p>
            </div>
            <div className="flex flex-col">
              {START.map(([w, t, b]) => (
                <div key={w} className="step py-14 md:py-20">
                  <div className="step-bar mb-6" />
                  <div className="grid gap-4 sm:grid-cols-[150px_1fr] sm:gap-10">
                    <span className="pt-1 text-[15px] font-medium text-[var(--blue)]">{w}</span>
                    <div>
                      <h3 className="text-[24px] font-semibold tracking-[-0.02em]">{t}</h3>
                      <p className="mt-3 text-[18px] leading-relaxed text-[var(--muted)]">{b}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Closing: a blueprint field in place of a studio photo, the promise, and the one call to action. The field drifts slower than the page. */}
      <section id="assessment" className="photo relative overflow-clip" aria-label="Book a working session">
        <div className="ph-img scrubbed absolute inset-x-0 -top-[12%] -bottom-[12%]">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(rgba(120,160,230,0.55) 1.5px, transparent 1.5px), linear-gradient(135deg, #1a2338, #3a5aa0)", backgroundSize: "34px 34px, 100% 100%" }} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(20,23,30,0.9)] via-[rgba(20,23,30,0.45)] to-[rgba(20,23,30,0.1)]" />
        <div className="relative mx-auto flex h-full max-w-[1200px] flex-col justify-end px-6 pb-16 md:pb-20">
          <h2 className="reveal max-w-[18ch] text-[clamp(32px,4vw,52px)] font-semibold leading-[1.02] tracking-[-0.04em] text-white">A studio you talk to every week.</h2>
          <p className="reveal reveal-d1 mt-4 max-w-[54ch] text-[17px] leading-relaxed text-white/80 md:text-[18px]">We do not hand over software and leave. One team on your account, every week, and you keep the keys. Start with the one workflow that costs you the most hours.</p>
          <div className="reveal reveal-d2 mt-8 flex flex-wrap items-center gap-6">
            <a href="/harbor#assessment" className="inline-flex items-center rounded-md bg-white px-7 py-4 text-[17px] font-medium text-[#14171e] transition-colors hover:bg-white/90">Book a working session</a>
            <span className="text-[15px] text-white/70">Forty minutes. No slides. No commitment.</span>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
