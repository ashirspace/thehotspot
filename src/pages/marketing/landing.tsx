import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui";

const logos = ["Northstar", "Attic", "Layer", "Signal", "Tempo", "Lattice", "Fable", "Courier"];

const services = [
  ["Lead Discovery & Enrichment", "Find ideal prospects, normalize fields, dedupe records, and enrich each lead with useful business context.", "42 prospects matched"],
  ["AI Personalization", "Generate specific, reviewable copy from campaign context without inventing facts or fake familiarity.", "confidence 94%"],
  ["Sequence Orchestration", "Compose email, wait, follow-up, and assisted DM steps with reply and bounce stop conditions.", "Day 1 / 3 / 6"],
  ["Reply Detection", "Stop remaining steps automatically when a contact replies, unsubscribes, bounces, or enters suppression.", "reply halt active"],
  ["Analytics", "Track sender health, delivery, opens, replies, booked meetings, and campaign-level performance.", "38% reply lift"],
];

const faqs = [
  ["Does thehotspot send LinkedIn DMs automatically?", "No. LinkedIn DM outreach is assisted and human-approved. The workspace can draft and track DMs, but it does not run headless browser automation."],
  ["Can I stop sends when someone replies?", "Yes. Reply, bounce, unsubscribe, suppression, and paused-campaign states are checked before every queued step."],
  ["Is AI copy sent without review?", "Low-confidence generations are flagged for review, and teams can keep approval gates on any campaign."],
  ["What happens if DNS is not verified?", "Campaign launch stays blocked until SPF, DKIM, and DMARC pass for the selected sender."],
  ["Can agencies manage client workspaces?", "Yes. Workspaces keep leads, campaigns, senders, messages, and analytics isolated by account."],
];

export function LandingPage() {
  return (
    <>
      <section className="noise-overlay relative scroll-mt-24 overflow-hidden border-b border-[var(--surface-border)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_86%_18%,rgba(254,110,0,0.10),transparent_32%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-4 pb-20 pt-28 sm:px-6 lg:grid-cols-[55%_45%] lg:px-8 lg:pb-28 lg:pt-36">
          <div className="max-w-3xl">
            <div className="animate-fade-up precision-label flex items-center gap-3 text-[var(--orange)]">
              <span className="h-px w-8 bg-[var(--orange)]" />
              Outreach automation · built for 2026
            </div>
            <h1 className="animate-fade-up delay-1 mt-6 max-w-4xl font-heading italic text-[clamp(3rem,6vw,5.5rem)] font-normal leading-[1] tracking-[-0.02em] text-[var(--text-primary)]">
              Cold outreach that <span className="text-[var(--orange)]">actually</span> gets replies.
            </h1>
            <p className="animate-fade-up delay-2 mt-6 max-w-2xl text-[0.9375rem] leading-[1.75] text-[var(--text-secondary)]">
              Import leads, generate personalized email copy, launch multi-step sequences, stop on replies or bounces,
              and manage every campaign from one workspace-secured dashboard.
            </p>
            <div className="animate-fade-up delay-3 mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link to="/signup"><Button className="h-12 px-6">Start free trial <ArrowRight className="h-4 w-4" /></Button></Link>
              <Link to="/pricing" className="inline-flex h-12 items-center text-sm font-semibold text-[var(--text-primary)] transition hover:text-[var(--orange)]">
                Watch 2-min demo <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-[var(--text-secondary)]">
              <span>No credit card</span>
              <span className="h-4 w-px bg-[var(--surface-border-strong)]" />
              <span>14-day trial</span>
              <span className="h-4 w-px bg-[var(--surface-border-strong)]" />
              <span>Setup in 3 min</span>
            </div>
          </div>

          <div className="relative">
            <div className="precision-card rotate-[-1deg] overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.10)]">
              <div className="flex items-center justify-between border-b border-[var(--surface-border)] bg-[var(--surface-raised)] px-5 py-4">
                <div>
                  <div className="text-sm font-semibold">Live campaign dashboard</div>
                  <div className="font-mono text-[0.72rem] text-[var(--text-tertiary)]">Workspace · Acme Growth</div>
                </div>
                <div className="flex items-center gap-2 font-mono text-[0.7rem] uppercase text-[var(--green)]">
                  <span className="scheduler-dot h-2 w-2 rounded-full bg-[var(--green)]" />
                  Live
                </div>
              </div>
              <div className="grid grid-cols-3 border-b border-[var(--surface-border)]">
                {[
                  ["Campaigns", "12"],
                  ["Sent", "847"],
                  ["Reply rate", "38%"],
                ].map(([label, value]) => (
                  <div key={label} className="border-r border-[var(--surface-border)] p-5 last:border-r-0">
                    <div className="precision-label">{label}</div>
                    <div className="mt-3 text-[2rem] font-normal tracking-[-0.04em]">{value}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-3 p-5">
                {[
                  ["M", "Maya Rao", "Can you send the deliverability checklist?"],
                  ["D", "Dev Kapoor", "Interested. Need pricing and a quick security overview."],
                  ["S", "Sara Lin", "This looks relevant for our partner campaigns."],
                ].map(([initial, name, copy]) => (
                  <div key={name} className="flex gap-3 rounded border border-[var(--surface-border)] bg-[var(--surface-card)] p-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[var(--orange)] text-sm font-semibold text-white">{initial}</span>
                    <div>
                      <div className="text-sm font-semibold">{name}</div>
                      <p className="mt-1 text-sm leading-5 text-[var(--text-secondary)]">{copy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--surface-border)] py-8">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="precision-label text-[var(--text-tertiary)]">Trusted by teams at</div>
          <div className="logo-marquee mt-6">
            <div className="logo-marquee-track flex gap-12 whitespace-nowrap text-lg font-semibold text-[var(--text-tertiary)] opacity-70">
              {[...logos, ...logos].map((logo, index) => (
                <span key={`${logo}-${index}`} className="transition hover:text-[var(--text-primary)]">{logo}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[45%_55%] lg:px-8">
        <div>
          <div className="precision-label text-[var(--orange)]">About</div>
          <h2 className="mt-5 font-heading text-[clamp(1.8rem,3vw,2.6rem)] font-normal leading-[1.1] tracking-[-0.01em]">
            We built thehotspot to make cold outreach human again.
          </h2>
        </div>
        <div>
          <p className="text-[0.9375rem] leading-[1.75] text-[var(--text-secondary)]">
            Outreach breaks when teams chase volume without context. thehotspot gives operators a safer system:
            focused lead intake, reviewable AI, sender-health gates, and reply-first automation.
          </p>
          <div className="mt-8 flex items-center gap-4 border-y border-[var(--surface-border)] py-5">
            <div className="h-14 w-14 rounded-md bg-[linear-gradient(135deg,var(--orange),#ffd7a8)]" />
            <div>
              <div className="font-semibold">Ashir Ayaan</div>
              <div className="text-sm text-[var(--text-secondary)]">Founder & CEO</div>
            </div>
          </div>
          <div className="mt-8 grid border-t border-[var(--surface-border)] sm:grid-cols-2">
            {["Specific beats generic", "Safety before scale", "Human approval matters", "Measure replies, not noise"].map((item) => (
              <div key={item} className="border-b border-[var(--surface-border)] p-5 first:pl-0 sm:[&:nth-child(odd)]:border-r">
                <h3 className="text-[1.05rem] font-semibold">{item}</h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">A practical operating principle built into the workflow.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="product-overview" className="border-y border-[var(--surface-border)] bg-[var(--surface-raised)] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="max-w-3xl font-heading text-[clamp(1.8rem,3vw,2.6rem)] font-normal leading-[1.1] tracking-[-0.01em]">
            Everything you need to run high-performing outreach.
          </h2>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            <div className="precision-card p-6 lg:col-span-2 lg:row-span-2">
              <Sparkles className="h-5 w-5 text-[var(--orange)]" />
              <h3 className="mt-5 text-[1.05rem] font-semibold">AI personalization demo</h3>
              <p className="mt-2 max-w-xl text-sm text-[var(--text-secondary)]">Draft subject/body pairs from real campaign context, then block weak generations before they reach the queue.</p>
              <div className="mt-6 grid gap-3 rounded bg-[var(--surface-raised)] p-4 font-mono text-[0.72rem] text-[var(--text-secondary)]">
                <span>{">"} ICP: B2B SaaS founders, 11-50 employees</span>
                <span>{">"} Reference: hiring outbound SDRs this quarter</span>
                <span className="text-[var(--teal)]">{">"} output: approved draft · confidence 94%</span>
              </div>
            </div>
            <div className="precision-card p-6">
              <h3 className="text-[1.05rem] font-semibold">Campaign performance</h3>
              <div className="mt-5 h-28 rounded bg-[linear-gradient(90deg,var(--surface-raised)_20%,transparent_20%),linear-gradient(180deg,transparent_35%,rgba(13,148,136,0.18)_35%)]" />
            </div>
            <div className="precision-card p-6">
              <h3 className="text-[1.05rem] font-semibold">Actionable insights</h3>
              <p className="mt-3 text-sm text-[var(--text-secondary)]">Spot sender risk, campaign drop-offs, and reply opportunities without leaving the workspace.</p>
            </div>
            <div className="precision-card p-6 lg:col-span-3">
              <h3 className="text-[1.05rem] font-semibold">Intelligent sequences</h3>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {["Day 1 · value email", "Day 3 · wait + check", "Day 6 · assisted DM"].map((step) => (
                  <div key={step} className="border-l-[3px] border-[var(--orange)] bg-[var(--surface-raised)] p-4 font-mono text-[0.72rem] text-[var(--text-secondary)]">{step}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="what-we-provide" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="precision-label text-[var(--orange)]">What we provide</div>
        <div className="mt-8 border-b border-[var(--surface-border)]">
          {services.map(([title, copy, visual], index) => (
            <div key={title} className="grid gap-6 border-t border-[var(--surface-border)] py-8 md:grid-cols-[92px_minmax(0,1fr)_240px]">
              <div className="font-heading text-5xl italic leading-none text-[var(--surface-border-strong)]">{String(index + 1).padStart(2, "0")}</div>
              <div>
                <h3 className="text-[1.05rem] font-semibold">{title}</h3>
                <p className="mt-2 max-w-2xl text-[0.9375rem] leading-[1.65] text-[var(--text-secondary)]">{copy}</p>
              </div>
              <div className="rounded-md border border-[var(--surface-border)] bg-[var(--surface-raised)] p-4 font-mono text-[0.72rem] text-[var(--text-secondary)]">{visual}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[var(--dark-base)] px-4 py-20 text-[var(--dark-text)] sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="max-w-3xl font-heading text-[clamp(2.6rem,5vw,5rem)] italic leading-[1] tracking-[-0.02em] text-white">
              Stop sending emails into the void.
            </h2>
            <p className="mt-5 text-[var(--dark-text)]/65">No credit card · Cancel anytime · 14-day trial</p>
          </div>
          <Link to="/signup"><Button className="h-12 px-6">Start free trial <ArrowRight className="h-4 w-4" /></Button></Link>
        </div>
      </section>

      <section id="resources" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="precision-card grid gap-6 p-6 sm:grid-cols-[1fr_220px]">
            <div>
              <div className="precision-label text-[var(--orange)]">Featured report</div>
              <h2 className="mt-4 font-heading text-[clamp(1.8rem,3vw,2.6rem)] font-normal leading-[1.1]">The 2026 cold email benchmark report</h2>
              <p className="mt-3 font-mono text-[0.72rem] text-[var(--text-tertiary)]">Jan 2026 · 12 min read</p>
            </div>
            <div className="flex items-end gap-3 rounded bg-[var(--surface-raised)] p-4">
              {[42, 68, 51, 86, 74].map((height, index) => (
                <div key={index} className="w-full rounded-sm bg-[var(--orange)]/80" style={{ height }} />
              ))}
            </div>
          </div>
          <div className="grid border-t border-[var(--surface-border)] sm:grid-cols-2 lg:grid-cols-1">
            {["FAQ", "Glossary", "Changelog", "Security notes"].map((item) => (
              <Link key={item} to="/blog" className="group flex items-center justify-between border-b border-[var(--surface-border)] py-5 text-sm font-semibold">
                {item}
                <span className="transition group-hover:translate-x-1">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
        <h2 className="font-heading text-[clamp(1.8rem,3vw,2.6rem)] font-normal leading-[1.1]">Questions operators ask before launch.</h2>
        <div className="mt-8 border-t border-[var(--surface-border)]">
          {faqs.map(([question, answer]) => (
            <details key={question} className="faq-row border-b border-[var(--surface-border)] py-5">
              <summary className="flex cursor-pointer list-none items-center gap-4 text-[1.05rem] font-medium">{question}</summary>
              <p className="mt-4 max-w-3xl text-[0.9375rem] leading-[1.65] text-[var(--text-secondary)]">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="border-t border-[var(--surface-border)] bg-[var(--surface-raised)] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <div className="font-semibold">thehotspot.in</div>
            <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--text-secondary)]">A safer outreach workspace for teams that care about replies, reputation, and operating discipline.</p>
            <p className="mt-5 font-mono text-[0.72rem] text-[var(--text-tertiary)]">Made with care in India</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              ["Product", "Lead Finder", "Sequences", "Inbox"],
              ["Company", "About", "Pricing", "Resources"],
              ["Legal", "Privacy", "Terms", "Security"],
            ].map(([heading, ...links]) => (
              <div key={heading}>
                <div className="precision-label">{heading}</div>
                <div className="mt-4 grid gap-2 text-sm text-[var(--text-secondary)]">
                  {links.map((item) => <span key={item}>{item}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
