"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { preload } from "react-dom";
import "../_home/motion.css";
import { useTheme, useScrollDriver, SiteNav, SiteFooter, PageGuide, eyebrow, h2, hair, btn, type GuideEntry } from "../_home/shared";
import { CaseStory, STORY_STEPS } from "../_home/story";

// Three.js runs in the browser only.
const TravelMap = dynamic(() => import("../_home/map-scene"), { ssr: false });
if (typeof window !== "undefined") void import("../_home/map-scene"); // start the download as soon as the page script runs, not after hydration

// Default newsletter slug. A placement overrides it with ?n=<slug> so every placement is attributable.
const DEFAULT_SOURCE = "harbor-newsletter";

// The page guide: one entry per section, with sub-steps for the story scene.
const GUIDE: GuideEntry[] = [
  { id: "top", n: "Harbor Collective" },
  { id: "story", n: "What we built", steps: STORY_STEPS },
  { id: "results", n: "The numbers" },
  { id: "team", n: "For the team" },
  { id: "start", n: "How we start" },
  { id: "assessment", n: "Get started" },
];

/* The numbers carry their meaning beside them rather than standing alone as decoration. All of them are fictional. */
const evidence = [
  { figure: "2,140", meaning: "founder profiles, each one assembled from CRM records, call transcripts and chat activity." },
  { figure: "900+", meaning: "recorded calls read for what each founder offered, what they asked for, and what was promised in return." },
  { figure: "10 days", meaning: "from the first call to the first working part of it in their hands." },
];

const built = [
  { title: "Profiles that keep themselves current", body: "Business snapshot, goals, what a founder offers peers and what they need from them. Nobody maintains it by hand." },
  { title: "A connection engine", body: "Compatibility scored on goals, gives and asks, industry and conversation history. Every person on the team keeps their own presets." },
  { title: "Calls that leave a trace", body: "Gives, asks, action items and follow up context pulled out of every recording. Nobody walks into a call blind." },
  { title: "Mastermind groups worth being in", body: "Balanced groups of six to eight proposed with the reasoning behind each one. A person reviews and confirms before anything is final." },
];

/* Markers are durations because the sequence is about time, not about ranking. */
const start = [
  { when: "40 minutes", title: "A working session", body: "We tell you where the system helps your business and where it does not. No slides, no commitment." },
  { when: "4 weeks", title: "One workflow you actually use", body: "We would rather earn trust on something running in your operation than promise a platform on day one." },
  { when: "Every week", title: "A call, and we keep shipping", body: "You name one person who owns the workflow. They bring what is next each week and we build it." },
];

export default function HarborLeadPage() {
  const { theme, isDark, chooseTheme, nextTheme } = useTheme();
  const root = useRef<HTMLDivElement>(null);
  useScrollDriver(root, { sections: GUIDE.map((g) => g.id) });
  preload("/us-outline.json", { as: "fetch", crossOrigin: "anonymous" }); // the map data downloads alongside the 3D code instead of after it
  const [mapReady, setMapReady] = useState(false); // the still under the map fades once the map has drawn

  const [formState, setFormState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", company: "", phone: "", message: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormState("sending");
    // Portfolio build: nothing is sent. The real page posts { ...formData, source } to its contact endpoint.
    void (new URLSearchParams(window.location.search).get("n") || DEFAULT_SOURCE);
    await new Promise((r) => setTimeout(r, 700));
    setFormState("sent");
  }

  const field = "w-full rounded-lg border border-[var(--line)] bg-[var(--page)] px-4 py-3 text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--blue)] focus:outline-none focus:ring-2 focus:ring-[var(--blue)]/25";
  const labelClass = "mb-1.5 block text-[14px] font-medium text-[var(--ink)]";
  const optional = <span className="font-normal text-[var(--muted)]">(required)</span>;

  return (
    <div ref={root} className="hp min-h-screen" data-theme={theme} data-motion="on">
      <SiteNav theme={theme} nextTheme={nextTheme} onTheme={chooseTheme} links={[{ href: "#story", n: "What we built" }, { href: "#start", n: "How we start" }]} />
      <PageGuide guide={GUIDE} />

      <main>
        {/* Hero */}
        <section id="top" className="relative overflow-hidden">
          {/* Founders finding each other across the country, behind the whole hero. Every name and pairing on the map is made up. */}
          <div className={`poster poster-map${mapReady ? " is-gone" : ""}`} aria-hidden />
          <TravelMap dark={isDark} onReady={() => setMapReady(true)} />
          <div className="hero-veil absolute inset-0" aria-hidden />
          <div className="hero-copy relative mx-auto grid min-h-[100svh] max-w-[1200px] grid-cols-1 content-end px-6 pb-16 pt-[38vh] md:min-h-[min(880px,94vh)] md:grid-cols-[1.05fr_1fr] md:content-center md:pb-24 md:pt-36">
          <div>
            <span className={`${eyebrow} reveal`}>For Harbor Collective founders</span>
            <h1 className="reveal reveal-d1 mt-3 max-w-[15ch] text-[clamp(32px,4.4vw,60px)] font-semibold leading-[1.02] tracking-[-0.04em]">Your Harbor Collective introductions run on something we built.</h1>
            <p className="reveal reveal-d2 mt-6 max-w-[54ch] text-[18px] leading-relaxed text-[var(--muted)] md:text-[19px]">The community lead asked us to make connecting 2,400 founders easy. The goal was clear: avoid building a thirty-person admin team working across siloed documents and spreadsheets.</p>
            <div className="reveal reveal-d3 mt-8 flex flex-wrap items-center gap-6">
              <a href="#assessment" className={btn}>Book a working session</a>
              <a href="#start" className="text-[16px] font-medium text-[var(--ink)] underline decoration-[var(--line)] underline-offset-4 transition-colors hover:decoration-[var(--blue)]">See how we start</a>
            </div>
          </div>
          </div>
        </section>

        {/* What we built for the community team, as the scene that moves with the scroll */}
        <CaseStory />

        {/* The numbers, with their meaning beside them */}
        <section id="results" className={`border-t ${hair} bg-[var(--panel)]`}>
          <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-20 md:grid-cols-3 md:gap-12">
            {evidence.map((e, i) => (
              <div key={e.figure} className={`reveal reveal-d${i}`}>
                <div className="line-fill mb-6 h-px w-full bg-[var(--blue)]" />
                <p className="text-[clamp(34px,3.4vw,44px)] font-semibold tracking-[-0.03em] tabular-nums">{e.figure}</p>
                <p className="mt-2 max-w-[34ch] text-[16px] leading-relaxed text-[var(--muted)]">{e.meaning}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What the community team got */}
        <section id="team" className={`border-t ${hair}`}>
          <div className="mx-auto max-w-[1200px] px-6 py-24">
            <span className={`${eyebrow} reveal`}>What the community team got</span>
            <h2 className={`${h2} reveal reveal-d1 mt-3 max-w-[20ch]`}>Introductions made on evidence, not on memory.</h2>
            <p className="reveal reveal-d2 mt-5 max-w-[58ch] text-[17px] leading-relaxed text-[var(--muted)]">Before this, 2,400 founders lived in CRM databases, spreadsheets and memory. Introductions were made on instinct, and when someone drifted away the team often did not see it coming.</p>
            <div className="mt-14 grid gap-10 md:grid-cols-2 md:gap-x-16 md:gap-y-12">
              {built.map((b, i) => (
                <div key={b.title} className={`reveal reveal-d${i % 4}`}>
                  <div className="line-fill mb-5 h-px w-full bg-[var(--blue)]" />
                  <h3 className="text-[22px] font-semibold tracking-[-0.02em]">{b.title}</h3>
                  <p className="mt-3 max-w-[52ch] text-[16px] leading-relaxed text-[var(--muted)]">{b.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* A line from the community team. */}
        <section className={`border-t ${hair} bg-[var(--panel)]`}>
          <figure className="mx-auto max-w-[1200px] px-6 py-16">
            <blockquote className="reveal max-w-[46ch] border-l-2 border-[var(--blue)] pl-6 text-[clamp(22px,2.4vw,30px)] font-medium leading-snug tracking-[-0.01em]">Ask a question about founders in a location, an industry, or with specific goals, and get the answer straight away.</blockquote>
            <figcaption className="reveal reveal-d1 mt-5 pl-6 text-[14px] text-[var(--muted)]">Community operations, Harbor Collective</figcaption>
          </figure>
        </section>

        {/* How we start */}
        <section id="start" className={`border-t ${hair}`}>
          <div className="mx-auto max-w-[1200px] px-6 py-24">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_2fr]">
              <div className="md:sticky md:top-28 md:self-start">
                <span className={eyebrow}>How we start</span>
                <h2 className={`${h2} mt-3`}>Four weeks decide the rest.</h2>
                <p className="mt-4 max-w-[36ch] text-[17px] leading-relaxed text-[var(--muted)]">The first four weeks decide whether the rest is worth it, so we keep them short and concrete.</p>
              </div>
              <div className="flex flex-col">
                {start.map((s) => (
                  <div key={s.when} className="step py-14 md:py-20">
                    <div className="step-bar mb-6" />
                    <div className="grid gap-4 sm:grid-cols-[150px_1fr] sm:gap-10">
                      <span className="pt-1 text-[15px] font-medium text-[var(--blue)]">{s.when}</span>
                      <div>
                        <h3 className="text-[24px] font-semibold tracking-[-0.02em]">{s.title}</h3>
                        <p className="mt-3 text-[18px] leading-relaxed text-[var(--muted)]">{s.body}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* The ask */}
        <section id="assessment" className={`border-t ${hair} bg-[var(--panel)]`}>
          <div className="mx-auto grid max-w-[1200px] gap-12 px-6 py-24 md:grid-cols-[1fr_1.2fr] md:gap-20">
            <div>
              <span className={`${eyebrow} reveal`}>Book a working session</span>
              <h2 className={`${h2} reveal reveal-d1 mt-3 max-w-[16ch]`}>Forty minutes on one workflow.</h2>
              <p className="reveal reveal-d2 mt-5 max-w-[46ch] text-[17px] leading-relaxed text-[var(--muted)]">We tell you where the system helps your business and where it does not. No slides, no commitment. Pick the workflow that costs you the most hours and start there.</p>
            </div>

            {formState === "sent" ? (
              <div className={`reveal rounded-2xl border ${hair} bg-[var(--page)] p-8`}>
                <p className="text-[20px] font-semibold">Thank you.</p>
                <p className="mt-2 text-[var(--muted)]">This is a portfolio build, so nothing was sent. On the real page this reaches the team the same day.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={`reveal reveal-d1 space-y-5 rounded-2xl border ${hair} bg-[var(--page)] p-6 md:p-8`}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className={labelClass}>First name</label>
                    <input id="firstName" type="text" autoComplete="given-name" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className={field} />
                  </div>
                  <div>
                    <label htmlFor="lastName" className={labelClass}>Last name {optional}</label>
                    <input id="lastName" type="text" required autoComplete="family-name" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className={field} />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className={labelClass}>Work email {optional}</label>
                  <input id="email" type="email" required autoComplete="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={field} />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="company" className={labelClass}>Company</label>
                    <input id="company" type="text" autoComplete="organization" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className={field} />
                  </div>
                  <div>
                    <label htmlFor="phone" className={labelClass}>Phone</label>
                    <input id="phone" type="tel" autoComplete="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={field} />
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className={labelClass}>What are you trying to fix</label>
                  <textarea id="message" rows={3} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className={`${field} resize-none`} />
                </div>
                <button type="submit" disabled={formState === "sending"} className={`${btn} w-full justify-center disabled:opacity-50 sm:w-auto`}>
                  {formState === "sending" ? "Sending" : "Request a session"}
                </button>
                {formState === "error" && (
                  <p role="alert" className="text-[14px] text-[var(--ink)]">That did not go through. Try again in a moment.</p>
                )}
              </form>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
