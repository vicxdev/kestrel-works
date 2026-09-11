"use client";

import { dots, eyebrow, hair } from "./shared";

// The Harbor Collective case as a pinned scene: three beats of copy while the stage moves from scattered sources to a founder profile to signals.
export const STORY_BEATS = [
  { k: "Sources", t: "Two years of conversations, scattered", b: "900 recorded calls, 2,100 CRM pages and a busy chat. Everything anyone had said about what they do and what they need, in places nobody could search." },
  { k: "Profiles", t: "One page per founder, kept current", b: "We read all of it and wrote one profile per founder: what they give, what they ask for, what they promised. A new call updates the page the same week." },
  { k: "Signals", t: "Then the system starts noticing", b: "A founder goes quiet before renewal, and the team gets a draft check-in. A founder needs something another one gives, and the intro is one click away." },
];

export const STORY_STEPS = [{ n: "Sources", p: 0.1 }, { n: "Profiles", p: 0.5 }, { n: "Signals", p: 0.9 }];

const card = "art scrubbed rounded-xl border border-[var(--line)] bg-[var(--page)] p-4 text-[13px] leading-snug text-[var(--ink)] shadow-[0_24px_60px_-28px_rgba(0,0,0,0.45)]";
const label = "mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--muted)]";
const chip = "rounded-md border border-[var(--line)] px-1.5 py-0.5 text-[12px]";

export function CaseStory() {
  return (
      <section id="story" data-steps="3" className={`scrub-track border-t ${hair}`}>
        <div className="scrub-pin">
          <div className="mx-auto grid h-full max-w-[1200px] grid-cols-1 content-center gap-8 px-6 py-12 md:grid-cols-[1fr_1.1fr] md:items-center md:gap-16">
            <div>
              <span className={eyebrow}>Case study · Harbor Collective</span>
              <h2 className="mt-3 max-w-[20ch] text-[clamp(26px,3vw,38px)] font-semibold leading-[1.1] tracking-[-0.03em]">How two years of calls became a directory people use</h2>
              <div className="beats relative mt-8">
                {STORY_BEATS.map((b, i) => (
                  <div key={b.k} className={`beat beat-${i} scrubbed`}>
                    <span className="text-[15px] font-medium text-[var(--blue)]">{b.k}</span>
                    <h3 className="mt-2 text-[22px] font-semibold tracking-[-0.02em] md:text-[24px]">{b.t}</h3>
                    <p className="mt-3 max-w-[44ch] text-[17px] leading-relaxed text-[var(--muted)] md:text-[18px]">{b.b}</p>
                  </div>
                ))}
              </div>
              <div className="mt-10 border-l-2 border-[var(--blue)] pl-5 text-[15px] leading-relaxed text-[var(--muted)]">
                <span className="block text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--blue)]">Delivered</span>
                <p className="mt-1.5">A founder intelligence platform: call recordings, chat channels and two CRMs structured into one database the community team can question in plain English.</p>
                <p className="mt-2 text-[13px]">Harbor Collective</p>
              </div>
            </div>
            <div>
              <div className="stage relative mx-auto aspect-[4/3] w-full max-w-[calc(44vh*4/3)] overflow-hidden rounded-2xl border border-[var(--tint-line)] bg-[var(--tint)] md:max-w-none" style={dots("--tint-grid", "18px 18px")}>
                <div className={`${card} art-transcript`}>
                  <div className={label}><span className="h-2 w-2 rounded-full bg-[var(--blue)]" />Call recording · 41 min</div>
                  <p className="text-[var(--muted)]">…we are <mark className="rounded bg-[var(--tint)] px-1 text-[var(--ink)]">hiring a COO in Austin</mark> before the fall. If anyone here has done that in consumer, I would love an intro…</p>
                </div>
                <div className={`${card} art-notion`}>
                  <div className={label}><span className="h-2 w-2 rounded-sm bg-[var(--ink)]" />CRM · Founder page</div>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[var(--muted)]">
                    <dt>Company</dt><dd className="text-[var(--ink)]">Consumer, 40 people</dd>
                    <dt>Location</dt><dd className="text-[var(--ink)]">Austin</dd>
                    <dt>Joined</dt><dd className="text-[var(--ink)]">2024</dd>
                  </dl>
                </div>
                <div className={`${card} art-slack`}>
                  <div className={label}><span className="text-[var(--muted)]">#</span>introductions</div>
                  <div className="flex gap-2.5">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[var(--panel)] text-[11px] font-semibold">JD</span>
                    <p className="text-[var(--muted)]"><span className="font-semibold text-[var(--ink)]">Founder, Denver</span> Happy to help anyone thinking about franchising. Did it twice, once badly.</p>
                  </div>
                </div>
                <div className={`${card} art-profile`}>
                  <div className={label}><span className="h-2 w-2 rounded-full bg-[var(--blue)]" />Founder profile <span className="ml-auto normal-case tracking-normal">Updated this week</span></div>
                  <p className="text-[16px] font-semibold">Founder, Austin</p>
                  <p className="text-[var(--muted)]">Consumer, 40 people. Joined 2024. 6 calls, 214 messages.</p>
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    <div><p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--muted)]">Gives</p><div className="flex flex-wrap gap-1"><span className={chip}>Retail ops</span><span className={chip}>Fundraising</span></div></div>
                    <div><p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--muted)]">Asks</p><div className="flex flex-wrap gap-1"><span className={chip}>COO hire</span><span className={chip}>Texas leases</span></div></div>
                    <div><p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--muted)]">Promised</p><div className="flex flex-wrap gap-1"><span className={chip}>CFO intro</span></div></div>
                  </div>
                </div>
                <div className={`${card} art-signal`}>
                  <div className={label}><span className="h-2 w-2 rounded-full bg-[var(--blue)]" />Signals · This week</div>
                  <div className="flex items-start gap-3 border-b border-[var(--line)] py-2.5">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                    <p className="text-[var(--muted)]"><span className="text-[var(--ink)]">Founder, Miami</span> renews in 34 days. Quiet since June.</p>
                    <span className="ml-auto shrink-0 rounded-md bg-[var(--ink)] px-2 py-1 text-[11px] font-medium text-[var(--page)]">Draft check-in</span>
                  </div>
                  <div className="flex items-start gap-3 py-2.5">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--blue)]" />
                    <p className="text-[var(--muted)]"><span className="text-[var(--ink)]">Founder, Austin</span> asked for a COO intro. Two founders have done it.</p>
                    <span className="ml-auto shrink-0 rounded-md border border-[var(--line)] px-2 py-1 text-[11px] font-medium">Introduce</span>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-[13px] text-[var(--muted)]">Illustrative. Every founder on this stage is made up.</p>
            </div>
          </div>
        </div>
      </section>
  );
}
